<?php

namespace App\Http\Controllers;

use App\Models\CoinPurchaseRequest;
use App\Models\CoinTransaction;
use App\Notifications\SystemAlert;
use App\Services\PhonePeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PhonePePaymentController extends Controller
{
    /**
     * Initiate Online Payment via PhonePe Gateway
     */
    public function initiate(Request $request, PhonePeService $phonePeService)
    {
        $user = auth()->user();
        if (!$user) {
            abort(401);
        }

        if (!$phonePeService->isEnabled()) {
            return back()->with('error', 'PhonePe Auto Payment Gateway is currently disabled. Please use manual QR or contact support.');
        }

        if (!$phonePeService->isConfigured()) {
            return back()->with('error', 'PhonePe Gateway credentials are not yet configured by admin. Please use manual QR or contact admin.');
        }

        $data = $request->validate([
            'package_amount'  => 'required|integer|min:1',
            'coins_requested' => 'required|integer|min:1',
        ]);

        $amount = (int) $data['package_amount'];
        $coins = (int) $data['coins_requested'];

        // Unique Merchant Order ID (letters, numbers, underscore, max 35 chars)
        $orderId = 'CP' . $user->id . '_' . time() . '_' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 5));

        // Create initial pending request in database
        $coinRequest = CoinPurchaseRequest::create([
            'user_id'            => $user->id,
            'package_amount'     => $amount,
            'coins_requested'    => $coins,
            'utr_number'         => null,
            'payment_screenshot' => null,
            'status'             => CoinPurchaseRequest::STATUS_PENDING,
            'payment_method'     => 'phonepe',
            'gateway_order_id'   => $orderId,
            'admin_notes'        => 'Initiated via PhonePe Gateway',
        ]);

        $redirectUrl = route('payment.phonepe.callback', ['orderId' => $orderId]);
        $callbackUrl = route('payment.phonepe.webhook');

        $userMeta = [
            'user_id' => $user->id,
            'name'    => $user->name,
            'phone'   => $user->phone,
            'email'   => $user->email,
        ];

        $res = $phonePeService->initiatePayment($orderId, $amount, $redirectUrl, $callbackUrl, $userMeta);

        if ($res['success'] && !empty($res['redirectUrl'])) {
            $coinRequest->update([
                'gateway_response' => json_encode($res),
            ]);

            // Save orderId in session as fallback
            session(['phonepe_pending_order_id' => $orderId]);

            // Inertia external redirect
            return Inertia::location($res['redirectUrl']);
        }

        $coinRequest->update([
            'status'           => CoinPurchaseRequest::STATUS_REJECTED,
            'admin_notes'      => 'Initiation Failed: ' . ($res['error'] ?? 'Unknown error'),
            'gateway_response' => json_encode($res),
        ]);

        return back()->with('error', '⚠️ ' . ($res['error'] ?? 'Unable to connect to PhonePe. Please try again or use manual QR.'));
    }

    /**
     * Customer Redirect Callback (after PhonePe checkout)
     */
    public function callback(Request $request, PhonePeService $phonePeService)
    {
        Log::info('PhonePe Callback received', [
            'method' => $request->method(),
            'query'  => $request->query(),
            'body'   => $request->all(),
        ]);

        // Attempt to find Order ID from multiple potential keys
        $orderId = $request->input('orderId')
            ?? $request->input('merchantOrderId')
            ?? $request->input('merchantTransactionId')
            ?? session('phonepe_pending_order_id');

        // Check if v1 POST response contains base64 encoded payload
        if (!$orderId && $request->has('response')) {
            try {
                $decoded = json_decode(base64_decode($request->input('response')), true);
                $orderId = $decoded['data']['merchantTransactionId'] ?? null;
            } catch (\Throwable $e) {}
        }

        if (!$orderId) {
            return redirect()->route('admin.coin-requests.create')
                ->with('error', 'Invalid payment response. Please check your transaction history.');
        }

        $coinRequest = CoinPurchaseRequest::where('gateway_order_id', $orderId)->first();
        if (!$coinRequest) {
            return redirect()->route('admin.coin-requests.create')
                ->with('error', "Order reference {$orderId} not found.");
        }

        // Verify with PhonePe API directly for tamper-proof confirmation
        $verifyRes = $phonePeService->verifyPayment($orderId);

        if ($verifyRes['success']) {
            $this->creditCoinsForRequest($coinRequest, $verifyRes);

            return redirect()->route('admin.coin-requests.create')
                ->with('success', "🎉 Payment of ₹{$coinRequest->package_amount} Successful! {$coinRequest->coins_requested} Coins have been added to your wallet instantly!");
        }

        // Payment not yet completed or failed
        if ($coinRequest->status === CoinPurchaseRequest::STATUS_APPROVED) {
            // Already approved via webhook in background
            return redirect()->route('admin.coin-requests.create')
                ->with('success', "🎉 Payment Confirmed! {$coinRequest->coins_requested} Coins have been added to your wallet!");
        }

        $stateMsg = $verifyRes['error'] ?? 'Payment was not completed.';
        return redirect()->route('admin.coin-requests.create')
            ->with('error', "⚠️ {$stateMsg} If money was deducted from your account, coins will be credited automatically within a few minutes.");
    }

    /**
     * Server-to-Server Webhook Listener
     */
    public function webhook(Request $request, PhonePeService $phonePeService)
    {
        Log::info('PhonePe Webhook received', [
            'headers' => $request->headers->all(),
            'payload' => $request->all(),
        ]);

        $orderId = null;
        $transactionId = null;

        // PhonePe v2 or v1 webhook parsing
        if ($request->has('response')) {
            try {
                $decoded = json_decode(base64_decode($request->input('response')), true);
                $orderId = $decoded['data']['merchantTransactionId'] ?? $decoded['merchantOrderId'] ?? null;
                $transactionId = $decoded['data']['transactionId'] ?? null;
            } catch (\Throwable $e) {}
        }

        $orderId = $orderId ?? $request->input('merchantOrderId') ?? $request->input('merchantTransactionId');

        if (!$orderId) {
            return response()->json(['status' => 'FAILED', 'message' => 'No order ID detected'], 400);
        }

        $coinRequest = CoinPurchaseRequest::where('gateway_order_id', $orderId)->first();
        if (!$coinRequest) {
            return response()->json(['status' => 'FAILED', 'message' => 'Order not found'], 404);
        }

        // Verify status with PhonePe
        $verifyRes = $phonePeService->verifyPayment($orderId);
        if ($verifyRes['success']) {
            $this->creditCoinsForRequest($coinRequest, $verifyRes);
            return response()->json(['status' => 'SUCCESS', 'message' => 'Payment credited successfully']);
        }

        return response()->json(['status' => 'PENDING_OR_FAILED', 'message' => $verifyRes['error'] ?? 'Not confirmed']);
    }

    /**
     * Check status of a specific order (for frontend polling)
     */
    public function checkStatus($orderId, PhonePeService $phonePeService)
    {
        $user = auth()->user();
        $coinRequest = CoinPurchaseRequest::where('gateway_order_id', $orderId)
            ->where('user_id', $user->id)
            ->first();

        if (!$coinRequest) {
            return response()->json(['found' => false], 404);
        }

        // If still pending, query gateway to refresh
        if ($coinRequest->status === CoinPurchaseRequest::STATUS_PENDING) {
            $verifyRes = $phonePeService->verifyPayment($orderId);
            if ($verifyRes['success']) {
                $this->creditCoinsForRequest($coinRequest, $verifyRes);
            }
        }

        $coinRequest->refresh();
        $user->refresh();

        return response()->json([
            'found'           => true,
            'status'          => $coinRequest->status,
            'coins_requested' => $coinRequest->coins_requested,
            'package_amount'  => $coinRequest->package_amount,
            'current_coins'   => $user->coins,
        ]);
    }

    /**
     * Atomically credit coins to user and mark request approved
     */
    protected function creditCoinsForRequest(CoinPurchaseRequest $coinRequest, array $verifyRes): void
    {
        DB::transaction(function () use ($coinRequest, $verifyRes) {
            // Lock row to prevent race conditions or double crediting
            $record = CoinPurchaseRequest::where('id', $coinRequest->id)->lockForUpdate()->first();

            if (!$record || $record->status === CoinPurchaseRequest::STATUS_APPROVED) {
                return;
            }

            $txnId = $verifyRes['transactionId'] ?? $record->gateway_order_id ?? ('PH_' . time());

            $record->update([
                'status'           => CoinPurchaseRequest::STATUS_APPROVED,
                'utr_number'       => $txnId,
                'admin_notes'      => 'Paid via PhonePe Payment Gateway (State: ' . ($verifyRes['state'] ?? 'COMPLETED') . ')',
                'approved_at'      => now(),
                'gateway_response' => json_encode($verifyRes),
            ]);

            // Add coins as PAID type
            $record->user->addCoins(
                $record->coins_requested,
                CoinTransaction::TYPE_PURCHASE,
                "PhonePe Auto Recharge - {$record->coins_requested} Coins (₹{$record->package_amount})",
                null,
                CoinTransaction::COIN_TYPE_PAID
            );

            // Trigger referral reward check if applicable
            $record->user->checkAndTriggerReferralBonus((int) $record->package_amount);

            // User notification
            try {
                $record->user->notifications()->create([
                    'id'   => \Illuminate\Support\Str::uuid(),
                    'type' => 'App\Notifications\SystemAlert',
                    'data' => [
                        'title' => '🎉 Coins Added Automatically!',
                        'body'  => "Your online payment of ₹{$record->package_amount} was successful. {$record->coins_requested} coins have been added to your balance.",
                        'url'   => '/dashboard',
                        'level' => 'success',
                    ],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (\Throwable $e) {
                Log::warning('Could not create notification: ' . $e->getMessage());
            }

            // Admin alert
            SystemAlert::toAdmins(
                '⚡ Auto Coin Purchase Completed',
                "{$record->user->name} successfully paid ₹{$record->package_amount} for {$record->coins_requested} coins via PhonePe Gateway.",
                '/admin/coin-requests'
            );
        });
    }
}
