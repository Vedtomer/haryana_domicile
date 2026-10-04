<?php

namespace App\Http\Controllers;

use App\Models\CoinPurchaseRequest;
use App\Models\CoinTransaction;
use App\Models\PaymentOrder;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Notifications\SystemAlert;
use App\Services\PaymentGatewayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WalletPaymentController extends Controller
{
    protected PaymentGatewayService $gateway;

    public function __construct(PaymentGatewayService $gateway)
    {
        $this->gateway = $gateway;
    }

    /**
     * Step 4: Generate unique Order ID and initiate payment order
     */
    public function createOrder(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $amount = (float) $request->input('amount');

        // Generate cryptographically unique Order ID
        $orderId = 'WAL_' . $user->id . '_' . time() . '_' . strtoupper(Str::random(6));

        // Create Payment Order record in DB (Step 4 & Security Requirements)
        $paymentOrder = PaymentOrder::create([
            'order_id'            => $orderId,
            'user_id'             => $user->id,
            'requested_amount'    => $amount,
            'payment_status'      => PaymentOrder::STATUS_PENDING,
            'verification_status' => PaymentOrder::VERIFY_UNVERIFIED,
            'payment_gateway'     => 'paycorex',
        ]);

        // Keep legacy CoinPurchaseRequest in sync for unified admin reporting
        CoinPurchaseRequest::create([
            'user_id'            => $user->id,
            'order_id'           => $orderId,
            'package_amount'     => (int) $amount,
            'coins_requested'    => (int) $amount,
            'gateway'            => 'paycorex',
            'status'             => CoinPurchaseRequest::STATUS_PENDING,
            'payment_screenshot' => null,
        ]);

        $redirectUrl = route('wallet.callback');

        // Step 5: Initialize with payment gateway
        $result = $this->gateway->createOrder($orderId, $amount, $user, $redirectUrl);

        $paymentOrder->update([
            'payment_url'  => $result['payment_url'] ?? null,
            'qr_data'      => $result['qr_base64'] ?? ($result['qr_url'] ?? null),
            'raw_response' => $result['raw_response'] ?? null,
        ]);

        return response()->json([
            'success'           => true,
            'order_id'          => $orderId,
            'amount'            => $amount,
            'merchant_provider' => $result['merchant_provider'] ?? 'Payment Gateway',
            'merchant_name'     => $result['merchant_name'] ?? 'Store',
            'upi_id'            => $result['upi_id'] ?? null,
            'payment_url'       => $result['payment_url'] ?? null,
            'qr_base64'         => $result['qr_base64'] ?? null,
            'qr_url'            => $result['qr_url'] ?? null,
            'message'           => 'Order Created Successfully',
        ]);
    }

    /**
     * Step 6 & 7: Server-side verification and idempotent wallet credit
     */
    public function verifyPayment(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['status' => 'FAILED', 'verified' => false, 'message' => 'Unauthorized'], 401);
        }

        $orderId = trim((string) $request->input('order_id', ''));
        $transactionId = trim((string) ($request->input('transaction_id') ?: $request->input('utr', '')));

        if (!$orderId) {
            return response()->json(['status' => 'FAILED', 'verified' => false, 'message' => 'Order ID is required'], 400);
        }

        $order = PaymentOrder::where('order_id', $orderId)->first();
        if (!$order) {
            return response()->json(['status' => 'FAILED', 'verified' => false, 'message' => 'Order not found'], 404);
        }

        // Idempotency: If already credited, return current state immediately without duplicate crediting
        if ($order->payment_status === PaymentOrder::STATUS_SUCCESS) {
            return response()->json([
                'status'          => 'SUCCESS',
                'verified'        => true,
                'message'         => 'Payment Successful',
                'detail'          => "₹{$order->verified_amount} has been added to your wallet.",
                'verified_amount' => (float) $order->verified_amount,
                'wallet_balance'  => (float) $user->coins,
            ]);
        }

        // Server-side verification with Gateway (Step 6)
        $verifyResult = $this->gateway->verifyPayment($orderId, $transactionId ?: null, (float) $order->requested_amount);

        // Failed / Duplicate
        if ($verifyResult['status'] === 'FAILED') {
            $order->update([
                'payment_status'      => PaymentOrder::STATUS_FAILED,
                'verification_status' => PaymentOrder::VERIFY_INVALID,
            ]);

            return response()->json([
                'status'   => 'FAILED',
                'verified' => false,
                'message'  => 'Payment Failed',
                'detail'   => $verifyResult['message'] ?? 'No money has been added to your wallet.',
            ]);
        }

        // Success Verified (Step 7: ONLY after valid server-side verification)
        if ($verifyResult['status'] === 'SUCCESS' && !empty($verifyResult['verified'])) {
            $verifiedAmount = (float) ($verifyResult['amount'] ?? $order->requested_amount);
            $txnId = $verifyResult['transaction_id'] ?? ($transactionId ?: $orderId);

            DB::transaction(function () use ($order, $verifiedAmount, $txnId, $verifyResult) {
                $lockedOrder = PaymentOrder::where('id', $order->id)->lockForUpdate()->first();

                // Double-check idempotency inside exclusive transaction lock
                if ($lockedOrder && $lockedOrder->payment_status !== PaymentOrder::STATUS_SUCCESS) {
                    if (!WalletTransaction::where('order_id', $lockedOrder->order_id)->exists()) {
                        $lockedOrder->update([
                            'payment_status'      => PaymentOrder::STATUS_SUCCESS,
                            'verification_status' => PaymentOrder::VERIFY_VALID,
                            'verified_amount'     => $verifiedAmount,
                            'transaction_id'      => $txnId,
                            'raw_response'        => array_merge((array) $lockedOrder->raw_response, ['verify' => $verifyResult]),
                        ]);

                        // 1. Credit Wallets table
                        $wallet = Wallet::firstOrCreate(
                            ['user_id' => $lockedOrder->user_id],
                            ['balance' => 0.00, 'currency' => 'INR', 'status' => 'active']
                        );
                        $wallet->increment('balance', $verifiedAmount);

                        // 2. Credit User Coins (1 coin = ₹1)
                        $targetUser = $lockedOrder->user;
                        if ($targetUser) {
                            $targetUser->addCoins(
                                (int) $verifiedAmount,
                                CoinTransaction::TYPE_PURCHASE,
                                "Add Money to Wallet - ₹{$verifiedAmount} (Order: {$lockedOrder->order_id})",
                                null,
                                CoinTransaction::COIN_TYPE_PAID
                            );
                            $targetUser->checkAndTriggerReferralBonus((int) $verifiedAmount);
                            $targetUser->touchActivity();

                            try {
                                $targetUser->notify(new SystemAlert(
                                    'Wallet Credited',
                                    "₹{$verifiedAmount} has been successfully added to your wallet. (Order #{$lockedOrder->order_id})",
                                    '/dashboard'
                                ));
                            } catch (\Throwable $ne) {
                                // Notification non-fatal
                            }
                        }

                        // 3. Record in wallet_transactions table
                        WalletTransaction::create([
                            'user_id'        => $lockedOrder->user_id,
                            'amount'         => $verifiedAmount,
                            'transaction_id' => $txnId,
                            'order_id'       => $lockedOrder->order_id,
                            'type'           => WalletTransaction::TYPE_CREDIT,
                            'status'         => WalletTransaction::STATUS_COMPLETED,
                            'description'    => "Wallet Recharge - Online Payment (Order #{$lockedOrder->order_id})",
                            'balance_after'  => $targetUser ? $targetUser->coins : $wallet->balance,
                        ]);

                        // Sync CoinPurchaseRequest
                        CoinPurchaseRequest::where('order_id', $lockedOrder->order_id)->update([
                            'status'      => CoinPurchaseRequest::STATUS_APPROVED,
                            'utr_number'  => $txnId,
                            'approved_at' => now(),
                            'admin_notes' => 'Auto-approved via Secure Server-side Verification',
                        ]);
                    }
                }
            });

            $freshUser = $user->fresh();

            return response()->json([
                'status'          => 'SUCCESS',
                'verified'        => true,
                'message'         => 'Payment Successful',
                'detail'          => "₹{$verifiedAmount} has been added to your wallet.",
                'verified_amount' => $verifiedAmount,
                'wallet_balance'  => (float) ($freshUser ? $freshUser->coins : 0),
            ]);
        }

        // Pending
        return response()->json([
            'status'   => 'PENDING',
            'verified' => false,
            'message'  => 'Payment verification is pending. Please wait.',
        ]);
    }

    /**
     * Webhook Handler for asynchronous payment notifications
     */
    public function webhook(Request $request)
    {
        Log::info('Payment Gateway Webhook received', $request->all());

        // Signature / Authorization verification
        if (!$this->gateway->verifyWebhookSignature($request)) {
            Log::warning('Payment Gateway Webhook signature verification failed');
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 401);
        }

        $orderId = trim((string) ($request->input('order_id') ?: $request->input('orderId')));
        $status  = strtoupper(trim((string) ($request->input('status') ?: $request->input('payment_status'))));
        $amount  = (float) ($request->input('amount') ?: $request->input('verified_amount', 0));
        $txnId   = trim((string) ($request->input('utr') ?: ($request->input('transaction_id') ?: '')));

        if (!$orderId) {
            return response()->json(['status' => 'error', 'message' => 'Order ID required'], 400);
        }

        $order = PaymentOrder::where('order_id', $orderId)->first();
        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
        }

        // Idempotency: Process only once
        if ($order->payment_status === PaymentOrder::STATUS_SUCCESS) {
            return response()->json(['status' => 'ok', 'message' => 'Already processed']);
        }

        if ($status === 'SUCCESS') {
            $verifiedAmount = $amount > 0 ? $amount : (float) $order->requested_amount;

            DB::transaction(function () use ($order, $verifiedAmount, $txnId, $request) {
                $lockedOrder = PaymentOrder::where('id', $order->id)->lockForUpdate()->first();
                if ($lockedOrder && $lockedOrder->payment_status !== PaymentOrder::STATUS_SUCCESS) {
                    if (!WalletTransaction::where('order_id', $lockedOrder->order_id)->exists()) {
                        $lockedOrder->update([
                            'payment_status'      => PaymentOrder::STATUS_SUCCESS,
                            'verification_status' => PaymentOrder::VERIFY_VALID,
                            'verified_amount'     => $verifiedAmount,
                            'transaction_id'      => $txnId ?: $lockedOrder->transaction_id,
                            'raw_response'        => array_merge((array) $lockedOrder->raw_response, ['webhook' => $request->all()]),
                        ]);

                        $wallet = Wallet::firstOrCreate(['user_id' => $lockedOrder->user_id]);
                        $wallet->increment('balance', $verifiedAmount);

                        $targetUser = $lockedOrder->user;
                        if ($targetUser) {
                            $targetUser->addCoins(
                                (int) $verifiedAmount,
                                CoinTransaction::TYPE_PURCHASE,
                                "Add Money to Wallet via Webhook - ₹{$verifiedAmount} (Order: {$lockedOrder->order_id})",
                                null,
                                CoinTransaction::COIN_TYPE_PAID
                            );
                            $targetUser->checkAndTriggerReferralBonus((int) $verifiedAmount);
                            $targetUser->touchActivity();
                        }

                        WalletTransaction::create([
                            'user_id'        => $lockedOrder->user_id,
                            'amount'         => $verifiedAmount,
                            'transaction_id' => $txnId,
                            'order_id'       => $lockedOrder->order_id,
                            'type'           => WalletTransaction::TYPE_CREDIT,
                            'status'         => WalletTransaction::STATUS_COMPLETED,
                            'description'    => "Wallet Recharge via Webhook (Order #{$lockedOrder->order_id})",
                            'balance_after'  => $targetUser ? $targetUser->coins : $wallet->balance,
                        ]);

                        CoinPurchaseRequest::where('order_id', $lockedOrder->order_id)->update([
                            'status'      => CoinPurchaseRequest::STATUS_APPROVED,
                            'utr_number'  => $txnId,
                            'approved_at' => now(),
                        ]);
                    }
                }
            });

            return response()->json(['status' => 'ok', 'message' => 'Transaction processed and wallet credited']);
        }

        if (in_array($status, ['FAILED', 'CANCELLED'])) {
            $order->update([
                'payment_status'      => $status,
                'verification_status' => PaymentOrder::VERIFY_INVALID,
            ]);
        }

        return response()->json(['status' => 'ok', 'message' => 'Status recorded']);
    }

    /**
     * Redirect Callback handler from payment gateway
     * Rule: Never add money to wallet simply because user reaches return URL!
     */
    public function callback(Request $request)
    {
        $orderId = trim((string) $request->input('order_id', ''));
        $txnId   = trim((string) ($request->input('utr') ?: $request->input('transaction_id', '')));

        if (!$orderId) {
            return redirect('/dashboard')->with('error', 'Payment verification failed: No Order ID provided.');
        }

        $order = PaymentOrder::where('order_id', $orderId)->first();
        if (!$order) {
            return redirect('/dashboard')->with('error', 'Order not found in records.');
        }

        // Auto-login user if session expired during third party gateway redirect
        if (!Auth::check() && $order->user) {
            Auth::login($order->user);
        }

        // Perform strict server-side verification before adding any money
        $verifyResult = $this->gateway->verifyPayment($orderId, $txnId ?: null, (float) $order->requested_amount);

        if ($verifyResult['status'] === 'SUCCESS' && !empty($verifyResult['verified'])) {
            $verifiedAmount = (float) ($verifyResult['amount'] ?? $order->requested_amount);
            $cleanTxn = $verifyResult['transaction_id'] ?? ($txnId ?: $orderId);

            DB::transaction(function () use ($order, $verifiedAmount, $cleanTxn) {
                $lockedOrder = PaymentOrder::where('id', $order->id)->lockForUpdate()->first();
                if ($lockedOrder && $lockedOrder->payment_status !== PaymentOrder::STATUS_SUCCESS) {
                    if (!WalletTransaction::where('order_id', $lockedOrder->order_id)->exists()) {
                        $lockedOrder->update([
                            'payment_status'      => PaymentOrder::STATUS_SUCCESS,
                            'verification_status' => PaymentOrder::VERIFY_VALID,
                            'verified_amount'     => $verifiedAmount,
                            'transaction_id'      => $cleanTxn,
                        ]);

                        $wallet = Wallet::firstOrCreate(['user_id' => $lockedOrder->user_id]);
                        $wallet->increment('balance', $verifiedAmount);

                        $targetUser = $lockedOrder->user;
                        if ($targetUser) {
                            $targetUser->addCoins(
                                (int) $verifiedAmount,
                                CoinTransaction::TYPE_PURCHASE,
                                "Add Money to Wallet - ₹{$verifiedAmount} (Order: {$lockedOrder->order_id})",
                                null,
                                CoinTransaction::COIN_TYPE_PAID
                            );
                            $targetUser->checkAndTriggerReferralBonus((int) $verifiedAmount);
                            $targetUser->touchActivity();
                        }

                        WalletTransaction::create([
                            'user_id'        => $lockedOrder->user_id,
                            'amount'         => $verifiedAmount,
                            'transaction_id' => $cleanTxn,
                            'order_id'       => $lockedOrder->order_id,
                            'type'           => WalletTransaction::TYPE_CREDIT,
                            'status'         => WalletTransaction::STATUS_COMPLETED,
                            'description'    => "Add Money to Wallet via Redirect Callback (Order #{$lockedOrder->order_id})",
                            'balance_after'  => $targetUser ? $targetUser->coins : $wallet->balance,
                        ]);

                        CoinPurchaseRequest::where('order_id', $lockedOrder->order_id)->update([
                            'status'      => CoinPurchaseRequest::STATUS_APPROVED,
                            'utr_number'  => $cleanTxn,
                            'approved_at' => now(),
                        ]);
                    }
                }
            });

            return redirect('/dashboard')
                ->with('success', "🎉 Payment Successful! ₹{$verifiedAmount} has been added to your wallet.");
        }

        return redirect('/admin/coin-requests/create')
            ->with('error', 'Payment verification is pending or payment was not confirmed by the bank.');
    }
}
