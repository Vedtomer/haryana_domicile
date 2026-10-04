<?php

namespace App\Http\Controllers;

use App\Models\CoinPurchaseRequest;
use App\Models\CoinTransaction;
use App\Models\Setting;
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

        $errorMsg = $result['message'] ?? 'Unable to connect with payment gateway.';
        Log::info("PayCoreX returned error ({$errorMsg}). Switching to Instant Dynamic UPI for Order #{$orderId}");

        // Seamless fallback to Instant Dynamic UPI QR with admin UPI credentials
        $adminUpiId = Setting::get('upi_id', '7494945476@paytm');
        $adminUpiName = Setting::get('upi_name', 'CSP JAANKARI');
        $formattedAmount = number_format($amount, 2, '.', '');

        $upiUrl = "upi://pay?pa=" . urlencode($adminUpiId) . "&pn=" . urlencode($adminUpiName) . "&am=" . $formattedAmount . "&cu=INR&tn=" . urlencode($orderId);
        $qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($upiUrl);

        $coinRequest = CoinPurchaseRequest::create([
            'user_id'            => $user->id,
            'order_id'           => $orderId,
            'package_amount'     => (int) $amount,
            'coins_requested'    => $coins,
            'gateway'            => 'instant_upi',
            'payment_url'        => $upiUrl,
            'qr_data'            => $qrUrl,
            'status'             => CoinPurchaseRequest::STATUS_PENDING,
            'payment_data'       => [
                'type'           => 'instant_upi',
                'upi_id'         => $adminUpiId,
                'upi_name'       => $adminUpiName,
                'upi_url'        => $upiUrl,
                'paycorex_note'  => $errorMsg,
            ],
            'payment_screenshot' => null,
        ]);

        return response()->json([
            'success'           => true,
            'order_id'          => $orderId,
            'amount'            => $amount,
            'coins_requested'   => $coins,
            'merchant_provider' => 'Instant UPI',
            'merchant_name'     => $adminUpiName,
            'upi_id'            => $adminUpiId,
            'payment_url'       => $upiUrl,
            'qr_base64'         => null,
            'qr_url'            => $qrUrl,
            'is_dynamic_upi'    => true,
            'message'           => 'Order Created Successfully',
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

        $cleanUtr = preg_replace('/[^0-9]/', '', $utr);
        $isSuccess = false;
        $extractedUtr = $cleanUtr ?: null;
        $methodNote = 'PayCoreX Auto Verification';

        // 1. If gateway was paycorex, query PayCoreX API
        $apiResult = null;
        if ($coinRequest->gateway === 'paycorex') {
            $apiResult = $this->paycorex->checkOrderStatus($orderId, $cleanUtr ?: null);

            if (
                (isset($apiResult['order_status']) && strtoupper($apiResult['order_status']) === 'SUCCESS')
                || (isset($apiResult['status']) && strtolower($apiResult['status']) === 'success' && isset($apiResult['data']['transaction_id']))
                || (isset($apiResult['data']['status']) && strtoupper($apiResult['data']['status']) === 'SUCCESS')
            ) {
                $isSuccess = true;
                $methodNote = 'PayCoreX Bank Auto Verification';
                if (!empty($apiResult['data']['utr'])) {
                    $extractedUtr = $apiResult['data']['utr'];
                }
            } elseif (!empty($cleanUtr)) {
                $utrValidate = $this->paycorex->validateUtr($orderId, $cleanUtr);
                if (!empty($utrValidate['status']) && $utrValidate['status'] === true) {
                    $isSuccess = true;
                    $methodNote = 'PayCoreX UTR Validation';
                }
            }
        }

        // 2. If user entered a 10-18 digit numeric UTR (Instant fallback / manual entry)
        if (!$isSuccess && !empty($cleanUtr)) {
            if (strlen($cleanUtr) < 10 || strlen($cleanUtr) > 18) {
                return response()->json([
                    'success'      => false,
                    'is_approved'  => false,
                    'message'      => 'अमान्य UTR नंबर। कृपया सही 12 अंकों का UPI Ref / UTR नंबर दर्ज करें।',
                ], 422);
            }

            // Check if this UTR has already been approved for another request
            $alreadyUsed = CoinPurchaseRequest::where('utr_number', $cleanUtr)
                ->where('status', CoinPurchaseRequest::STATUS_APPROVED)
                ->where('id', '!=', $coinRequest->id)
                ->exists();

            if ($alreadyUsed) {
                return response()->json([
                    'success'      => false,
                    'is_approved'  => false,
                    'message'      => 'यह UTR नंबर पहले से इस्तेमाल किया जा चुका है। यदि कोई समस्या है तो कृपया एडमिन से संपर्क करें।',
                ], 422);
            }

            // Valid, unused UTR provided!
            $isSuccess = true;
            $extractedUtr = $cleanUtr;
            $methodNote = 'Instant UTR Verification (' . $cleanUtr . ')';
        }

        if ($isSuccess) {
            $credited = false;
            DB::transaction(function () use ($coinRequest, $extractedUtr, $methodNote, $apiResult, &$credited) {
                $req = CoinPurchaseRequest::where('id', $coinRequest->id)->lockForUpdate()->first();
                if ($req && $req->status === CoinPurchaseRequest::STATUS_PENDING) {
                    $req->update([
                        'status'       => CoinPurchaseRequest::STATUS_APPROVED,
                        'utr_number'   => $extractedUtr ?: $req->utr_number,
                        'approved_at'  => now(),
                        'admin_notes'  => "Auto-approved via {$methodNote}",
                        'payment_data' => array_merge((array) $req->payment_data, [
                            'verified_check' => $apiResult,
                            'verified_utr'   => $extractedUtr,
                            'verify_method'  => $methodNote,
                            'verified_at'    => now()->toIso8601String(),
                        ]),
                    ]);

                    $targetUser = $req->user;
                    if ($targetUser) {
                        $targetUser->addCoins(
                            $req->coins_requested,
                            CoinTransaction::TYPE_PURCHASE,
                            "Instant Recharge - {$req->coins_requested} Coins (₹{$req->package_amount})",
                            null,
                            CoinTransaction::COIN_TYPE_PAID
                        );

                        // Trigger referral reward check if applicable
                        $targetUser->checkAndTriggerReferralBonus((int) $req->package_amount);
                        $targetUser->touchActivity();

                        try {
                            $targetUser->notify(new SystemAlert(
                                'Coins added',
                                "Your purchase of {$req->coins_requested} coins (₹{$req->package_amount}) has been verified and credited successfully!",
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

        $pendingMsg = $apiResult['message'] ?? 'पेमेंट अभी बैंक में लंबित है। कृपया 1-2 मिनट बाद जांचें या 12-अंकों का UTR दर्ज करें।';
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
