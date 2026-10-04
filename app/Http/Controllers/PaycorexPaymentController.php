<?php

namespace App\Http\Controllers;

use App\Models\CoinPurchaseRequest;
use App\Models\CoinTransaction;
use App\Models\User;
use App\Notifications\SystemAlert;
use App\Services\PaycorexService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaycorexPaymentController extends Controller
{
    protected PaycorexService $paycorex;

    public function __construct(PaycorexService $paycorex)
    {
        $this->paycorex = $paycorex;
    }

    /**
     * Create an order on PayCoreX and return QR / payment link
     */
    public function createOrder(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'package_amount'  => 'required|numeric|min:1',
            'coins_requested' => 'required|integer|min:1',
        ]);

        $amount = (float) $request->input('package_amount');
        $coins = (int) $request->input('coins_requested');

        if (!$this->paycorex->isEnabled()) {
            return response()->json([
                'success'         => false,
                'fallback_manual' => true,
                'message'         => 'Online payment gateway is temporarily disabled. Please use manual UPI QR.',
            ]);
        }

        // Generate unique Order ID
        $orderId = 'ORD_' . $user->id . '_' . time() . '_' . strtoupper(substr(md5(uniqid()), 0, 6));

        $mobile = preg_replace('/[^0-9]/', '', (string) ($user->phone ?: $user->mobile ?? ''));
        if (strlen($mobile) < 10) {
            $mobile = '7494945476'; // Default fallback mobile for API requirement
        }

        $email = $user->email && filter_var($user->email, FILTER_VALIDATE_EMAIL)
            ? $user->email
            : 'customer@cspjaankari.in';

        $redirectUrl = route('payment.paycorex.callback');

        $result = $this->paycorex->createOrder([
            'amount'          => $amount,
            'customer_mobile' => $mobile,
            'customer_email'  => $email,
            'order_id'        => $orderId,
            'redirect_url'    => $redirectUrl,
        ]);

        if (isset($result['status']) && strtolower($result['status']) === 'success' && !empty($result['data'])) {
            $data = $result['data'];

            // Record the pending coin request
            $coinRequest = CoinPurchaseRequest::create([
                'user_id'            => $user->id,
                'order_id'           => $orderId,
                'package_amount'     => (int) $amount,
                'coins_requested'    => $coins,
                'gateway'            => 'paycorex',
                'payment_url'        => $data['payment_url'] ?? null,
                'qr_data'            => $data['qr_base64'] ?? null,
                'status'             => CoinPurchaseRequest::STATUS_PENDING,
                'payment_data'       => $data,
                'payment_screenshot' => null,
            ]);

            return response()->json([
                'success'           => true,
                'order_id'          => $orderId,
                'amount'            => $data['amount'] ?? $amount,
                'coins_requested'   => $coins,
                'merchant_provider' => $data['merchant_provider'] ?? 'PayCoreX',
                'merchant_name'     => $data['merchant_name'] ?? 'PayCoreX Store',
                'upi_id'            => $data['upi_id'] ?? null,
                'payment_url'       => $data['payment_url'] ?? null,
                'qr_base64'         => $data['qr_base64'] ?? null,
                'expire_at'         => $data['expire_at'] ?? null,
                'message'           => 'Order Created Successfully',
            ]);
        }

        $errorMsg = $result['message'] ?? 'Unable to generate payment order.';
        Log::warning("PayCoreX order creation failed for User #{$user->id}: {$errorMsg}");

        return response()->json([
            'success'         => false,
            'fallback_manual' => true,
            'message'         => $errorMsg,
        ]);
    }

    /**
     * Real-time order status verification (Polling or instant UTR check)
     */
    public function checkStatus(Request $request)
    {
        $orderId = trim((string) $request->input('order_id', ''));
        $utr = trim((string) $request->input('utr', ''));

        if (!$orderId) {
            return response()->json(['success' => false, 'message' => 'Order ID is required'], 400);
        }

        $coinRequest = CoinPurchaseRequest::where('order_id', $orderId)->first();
        if (!$coinRequest) {
            return response()->json(['success' => false, 'message' => 'Order not found in records'], 404);
        }

        // If already approved, return success immediately
        if ($coinRequest->status === CoinPurchaseRequest::STATUS_APPROVED) {
            $user = $coinRequest->user;
            return response()->json([
                'success'     => true,
                'is_approved' => true,
                'message'     => 'Payment verified successfully! Coins added to your wallet.',
                'user_coins'  => $user ? $user->coins : 0,
            ]);
        }

        // Query PayCoreX API
        $apiResult = $this->paycorex->checkOrderStatus($orderId, $utr ?: null);

        $isSuccess = false;
        $extractedUtr = $utr ?: null;

        // Check if PayCoreX confirmed payment
        if (
            (isset($apiResult['order_status']) && strtoupper($apiResult['order_status']) === 'SUCCESS')
            || (isset($apiResult['status']) && strtolower($apiResult['status']) === 'success' && isset($apiResult['data']['transaction_id']))
            || (isset($apiResult['data']['status']) && strtoupper($apiResult['data']['status']) === 'SUCCESS')
        ) {
            $isSuccess = true;
            if (!empty($apiResult['data']['utr'])) {
                $extractedUtr = $apiResult['data']['utr'];
            }
        } elseif (!empty($utr)) {
            // Also attempt validate_utr if user provided a specific 12-digit UTR
            $utrValidate = $this->paycorex->validateUtr($orderId, $utr);
            if (!empty($utrValidate['status']) && $utrValidate['status'] === true) {
                $isSuccess = true;
                $extractedUtr = $utr;
            }
        }

        if ($isSuccess) {
            $credited = false;
            DB::transaction(function () use ($coinRequest, $extractedUtr, $apiResult, &$credited) {
                $req = CoinPurchaseRequest::where('id', $coinRequest->id)->lockForUpdate()->first();
                if ($req && $req->status === CoinPurchaseRequest::STATUS_PENDING) {
                    $req->update([
                        'status'       => CoinPurchaseRequest::STATUS_APPROVED,
                        'utr_number'   => $extractedUtr ?: $req->utr_number,
                        'approved_at'  => now(),
                        'admin_notes'  => 'Auto-approved via PayCoreX Instant Verification',
                        'payment_data' => array_merge((array) $req->payment_data, ['verified_check' => $apiResult]),
                    ]);

                    $targetUser = $req->user;
                    if ($targetUser) {
                        $targetUser->addCoins(
                            $req->coins_requested,
                            CoinTransaction::TYPE_PURCHASE,
                            "PayCoreX Instant Recharge - {$req->coins_requested} Coins (₹{$req->package_amount})",
                            null,
                            CoinTransaction::COIN_TYPE_PAID
                        );

                        // Trigger referral reward check if applicable
                        $targetUser->checkAndTriggerReferralBonus((int) $req->package_amount);
                        $targetUser->touchActivity();

                        try {
                            $targetUser->notify(new SystemAlert(
                                'Coins added',
                                "Your purchase of {$req->coins_requested} coins (₹{$req->package_amount}) via PayCoreX has been verified and credited successfully!",
                                '/dashboard'
                            ));
                        } catch (\Throwable $ne) {
                            // Non-critical notification failure
                        }
                    }

                    $credited = true;
                }
            });

            $freshUser = $coinRequest->user ? $coinRequest->user->fresh() : null;

            return response()->json([
                'success'     => true,
                'is_approved' => true,
                'message'     => '✅ Payment verified successfully! Coins added to your wallet.',
                'user_coins'  => $freshUser ? $freshUser->coins : 0,
            ]);
        }

        $pendingMsg = $apiResult['message'] ?? 'Payment pending or transaction not yet reflected.';
        return response()->json([
            'success'      => false,
            'is_approved'  => false,
            'order_status' => $apiResult['order_status'] ?? 'PENDING',
            'message'      => $pendingMsg,
        ]);
    }

    /**
     * Redirect callback from PayCoreX
     * PayCoreX POSTs order_id, status, amount, utr
     */
    public function callback(Request $request)
    {
        $orderId = trim((string) $request->input('order_id', ''));
        $status  = strtoupper(trim((string) $request->input('status', '')));
        $amount  = (float) $request->input('amount', 0);
        $utr     = trim((string) $request->input('utr', ''));

        Log::info('PayCoreX Redirect Callback received', [
            'order_id' => $orderId,
            'status'   => $status,
            'amount'   => $amount,
            'utr'      => $utr,
            'all'      => $request->all(),
        ]);

        if (!$orderId) {
            return redirect()->route('admin.coin-requests.create')
                ->with('error', 'Invalid callback data received from payment gateway.');
        }

        $coinRequest = CoinPurchaseRequest::where('order_id', $orderId)->first();
        if (!$coinRequest) {
            return redirect()->route('admin.coin-requests.create')
                ->with('error', 'Order not found in platform records.');
        }

        // Auto-login user if session was lost during 3rd party redirect
        if (!Auth::check() && $coinRequest->user) {
            Auth::login($coinRequest->user);
        }

        // Verify status from PayCoreX API
        $apiResult = $this->paycorex->checkOrderStatus($orderId, $utr ?: null);
        $isSuccess = ($status === 'SUCCESS')
            || (isset($apiResult['order_status']) && strtoupper($apiResult['order_status']) === 'SUCCESS')
            || (isset($apiResult['status']) && strtolower($apiResult['status']) === 'success' && isset($apiResult['data']['transaction_id']));

        if ($isSuccess) {
            DB::transaction(function () use ($coinRequest, $utr, $apiResult) {
                $req = CoinPurchaseRequest::where('id', $coinRequest->id)->lockForUpdate()->first();
                if ($req && $req->status === CoinPurchaseRequest::STATUS_PENDING) {
                    $req->update([
                        'status'       => CoinPurchaseRequest::STATUS_APPROVED,
                        'utr_number'   => $utr ?: ($apiResult['data']['utr'] ?? $req->utr_number),
                        'approved_at'  => now(),
                        'admin_notes'  => 'Auto-approved on PayCoreX Redirect Callback',
                        'payment_data' => array_merge((array) $req->payment_data, ['callback_check' => $apiResult]),
                    ]);

                    $targetUser = $req->user;
                    if ($targetUser) {
                        $targetUser->addCoins(
                            $req->coins_requested,
                            CoinTransaction::TYPE_PURCHASE,
                            "PayCoreX Instant Recharge - {$req->coins_requested} Coins (₹{$req->package_amount})",
                            null,
                            CoinTransaction::COIN_TYPE_PAID
                        );
                        $targetUser->checkAndTriggerReferralBonus((int) $req->package_amount);
                        $targetUser->touchActivity();
                    }
                }
            });

            return redirect()->route('dashboard')
                ->with('success', "🎉 Payment of ₹{$coinRequest->package_amount} successful! {$coinRequest->coins_requested} coins have been added to your wallet.");
        }

        return redirect()->route('admin.coin-requests.create')
            ->with('error', 'Payment was not completed or is still pending confirmation. If money was deducted, please enter UTR to verify.');
    }

    /**
     * Admin Test Connection endpoint
     */
    public function testConnection(Request $request)
    {
        if (!auth()->user() || auth()->user()->type !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $username = $request->input('username');
        $apiKey   = $request->input('api_key');
        $baseUrl  = $request->input('base_url');

        $result = $this->paycorex->testConnection($username, $apiKey, $baseUrl);

        return response()->json($result);
    }
}
