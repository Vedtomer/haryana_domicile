<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\MobileRecharge;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MobileRechargeController extends Controller
{
    /**
     * Render the Mobile & DTH Recharge interface
     */
    public function index(Request $request)
    {
        $service = Service::where('slug', 'mobile-recharge')->first();

        $user = auth()->user();
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if ($service && $service->is_premium && !$isStaff && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $viewMode = $request->query('view', 'my');

        // Fetch recent recharges
        $recentQuery = MobileRecharge::query();
        if ($isStaff && $viewMode === 'all') {
            $recentQuery->with('user:id,name,email,mobile');
        } else {
            $recentQuery->where('user_id', $user->id);
        }
        $recentRecharges = $recentQuery->latest()->take(30)->get();

        // Fetch vendor API balance if admin
        $apiBalance = null;
        if ($isStaff) {
            $apiBalance = $this->fetchVendorBalance();
        }

        return Inertia::render('Utilities/MobileRecharge', [
            'service' => $service,
            'userCoins' => (int) ($user->coins ?? 0),
            'operators' => MobileRecharge::getOperators(),
            'recentRecharges' => $recentRecharges,
            'isAdmin' => (bool) $isStaff,
            'apiBalance' => $apiBalance,
            'apiKey' => $isStaff ? Setting::get('recharge_api_key', 'Y3VK89K8V8') : null,
            'apiUrl' => $isStaff ? Setting::get('recharge_api_url', 'https://apinice.in/api/v1') : null,
            'currentView' => $viewMode,
        ]);
    }

    /**
     * Process a recharge request
     */
    public function recharge(Request $request)
    {
        $request->validate([
            'operator' => ['required', 'string'],
            'service_type' => ['required', 'string', 'in:prepaid,postpaid,dth'],
            'mobile' => ['required', 'string', 'min:8', 'max:20'],
            'amount' => ['required', 'numeric', 'min:10', 'max:10000'],
        ], [
            'operator.required' => 'Please select an operator.',
            'mobile.required' => 'Please enter the mobile number or subscriber ID.',
            'amount.required' => 'Please enter the recharge amount (Min: ₹10, Max: ₹10,000).',
            'amount.min' => 'Minimum recharge amount is ₹10.',
            'amount.max' => 'Maximum recharge amount is ₹10,000.',
        ]);

        $user = auth()->user();
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        $serviceType = $request->input('service_type');
        $operatorCode = strtoupper(trim($request->input('operator')));
        $cleanMobile = preg_replace('/[^0-9A-Za-z]/', '', trim($request->input('mobile')));
        $amount = (float) $request->input('amount');
        $coinCost = (int) round($amount); // 1 Coin = ₹1

        // Mobile number validation
        if (in_array($serviceType, ['prepaid', 'postpaid'])) {
            $numOnly = preg_replace('/\D/', '', $cleanMobile);
            if (!preg_match('/^[6-9][0-9]{9}$/', $numOnly)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.',
                ], 422);
            }
            $cleanMobile = $numOnly;
        } else {
            // DTH ID
            if (strlen($cleanMobile) < 8 || strlen($cleanMobile) > 18) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please enter a valid DTH Customer / Subscriber ID (8-18 digits).',
                ], 422);
            }
        }

        // Find operator details
        $allOps = MobileRecharge::getOperators();
        $opInfo = null;
        foreach (array_merge($allOps['prepaid'], $allOps['postpaid'], $allOps['dth']) as $op) {
            if ($op['code'] === $operatorCode) {
                $opInfo = $op;
                break;
            }
        }

        $operatorName = $opInfo ? $opInfo['name'] : $operatorCode;

        // Check wallet coin balance
        if ($user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coin balance! This recharge of ₹{$coinCost} requires {$coinCost} coins. Your current balance is {$user->coins} coins. Please recharge your wallet first.",
            ], 400);
        }

        // Deduct coins & create initial pending recharge record
        $rechargeRecord = null;
        try {
            DB::transaction(function () use ($user, $coinCost, $cleanMobile, $operatorCode, $operatorName, $serviceType, $amount, &$rechargeRecord) {
                $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "Recharge: {$operatorName} {$cleanMobile} (₹{$amount})");

                $rechargeRecord = MobileRecharge::create([
                    'user_id' => $user->id,
                    'mobile' => $cleanMobile,
                    'operator' => $operatorCode,
                    'operator_name' => $operatorName,
                    'service_type' => $serviceType,
                    'amount' => $amount,
                    'coins_deducted' => $coinCost,
                    'status' => MobileRecharge::STATUS_PROCESSING,
                    'provider_status' => 'Processing',
                ]);
            });
        } catch (\Throwable $e) {
            Log::error('Recharge coin deduction error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to initialize recharge transaction: ' . $e->getMessage(),
            ], 500);
        }

        // Call Provider API (apinice.in)
        $baseUrl = rtrim((string) Setting::get('recharge_api_url', 'https://apinice.in/api/v1'), '/');
        $apiKey = trim((string) Setting::get('recharge_api_key', 'Y3VK89K8V8'));

        $url = $baseUrl . '/recharge';
        $payload = [
            'mobile' => $cleanMobile,
            'operator' => $operatorCode,
            'amount' => (int) $amount,
        ];

        try {
            $apiResponse = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-API-Key' => $apiKey,
            ])->timeout(45)->post($url, $payload);

            $result = $apiResponse->json();

            if ($apiResponse->successful() && !empty($result['success'])) {
                $txnId = $result['txn_id'] ?? ('TXN' . time());
                $providerStatus = $result['status'] ?? 'Success';
                $isPending = strtolower($providerStatus) === 'processing';
                $status = $isPending ? MobileRecharge::STATUS_PROCESSING : MobileRecharge::STATUS_SUCCESS;

                $rechargeRecord->update([
                    'txn_id' => $txnId,
                    'provider_status' => $providerStatus,
                    'status' => $status,
                    'amount_deducted' => isset($result['amount_deducted']) ? (float) $result['amount_deducted'] : null,
                    'commission' => isset($result['commission']) ? (float) $result['commission'] : null,
                    'api_response' => json_encode($result),
                ]);

                // Unified ServiceRequest record for history
                $service = Service::where('slug', 'mobile-recharge')->first();
                try {
                    ServiceRequest::create([
                        'user_id' => $user->id,
                        'service_id' => $service ? $service->id : null,
                        'service_name' => 'Mobile & DTH Recharge',
                        'input_data' => [
                            'Mobile / Customer ID' => $cleanMobile,
                            'Operator' => $operatorName . " ({$operatorCode})",
                            'Amount' => '₹' . $amount,
                            'TXN ID' => $txnId,
                            'Status' => $providerStatus,
                        ],
                        'coins_charged' => $coinCost,
                        'status' => ServiceRequest::STATUS_COMPLETED,
                        'completed_at' => now(),
                    ]);
                } catch (\Throwable $sre) {
                    Log::error('ServiceRequest log error: ' . $sre->getMessage());
                }

                return response()->json([
                    'success' => true,
                    'message' => $isPending
                        ? "Recharge is processing! TXN ID: {$txnId}."
                        : "Recharge Successful! TXN ID: {$txnId}.",
                    'txn_id' => $txnId,
                    'status' => $providerStatus,
                    'amount' => $amount,
                    'mobile' => $cleanMobile,
                    'operator' => $operatorName,
                    'user_coins' => (int) $user->fresh()->coins,
                    'recharge' => $rechargeRecord,
                ]);
            }

            // Vendor reported failure or unsuccessful response
            $failMsg = !empty($result['message']) ? $result['message'] : 'Recharge failed from operator server.';
            
            // Refund coins back to user immediately
            $user->addCoins($coinCost, CoinTransaction::TYPE_REFUND, "Recharge Refund: {$operatorName} {$cleanMobile} (₹{$amount}) - {$failMsg}");

            $rechargeRecord->update([
                'status' => MobileRecharge::STATUS_FAILED,
                'provider_status' => $result['status'] ?? 'Failed',
                'failure_reason' => $failMsg,
                'api_response' => json_encode($result ?: ['body' => $apiResponse->body()]),
            ]);

            return response()->json([
                'success' => false,
                'message' => "Recharge Failed: {$failMsg}. ₹{$coinCost} coins have been refunded back to your wallet.",
                'user_coins' => (int) $user->fresh()->coins,
                'recharge' => $rechargeRecord,
            ]);

        } catch (\Throwable $ex) {
            Log::error('Recharge API call exception: ' . $ex->getMessage());

            // Refund coins upon network/server exception
            $user->addCoins($coinCost, CoinTransaction::TYPE_REFUND, "Recharge Refund: {$operatorName} {$cleanMobile} (₹{$amount}) - Gateway Timeout");

            $rechargeRecord->update([
                'status' => MobileRecharge::STATUS_FAILED,
                'provider_status' => 'Error',
                'failure_reason' => 'Connection timeout or vendor gateway unreachable.',
                'api_response' => json_encode(['error' => $ex->getMessage()]),
            ]);

            return response()->json([
                'success' => false,
                'message' => "Provider gateway did not respond: {$ex->getMessage()}. ₹{$coinCost} coins have been safely refunded back to your wallet.",
                'user_coins' => (int) $user->fresh()->coins,
                'recharge' => $rechargeRecord,
            ]);
        }
    }

    /**
     * Check status of a recharge using txn_id
     */
    public function checkStatus(Request $request)
    {
        $request->validate([
            'recharge_id' => ['required', 'integer'],
        ]);

        $user = auth()->user();
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        $recharge = MobileRecharge::find($request->input('recharge_id'));
        if (!$recharge) {
            return response()->json(['success' => false, 'message' => 'Recharge record not found.'], 404);
        }

        if (!$isStaff && $recharge->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        if (empty($recharge->txn_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No TXN ID found on this transaction.',
                'status' => $recharge->status,
            ]);
        }

        $baseUrl = rtrim((string) Setting::get('recharge_api_url', 'https://apinice.in/api/v1'), '/');
        $apiKey = trim((string) Setting::get('recharge_api_key', 'Y3VK89K8V8'));

        try {
            $resp = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-API-Key' => $apiKey,
            ])->timeout(20)->post($baseUrl . '/recharge/status', [
                'txn_id' => $recharge->txn_id,
            ]);

            $data = $resp->json();

            // Status: 1=Success, 2=Processing, 3=Failed
            $statusCode = (string) ($data['status_code'] ?? '');
            $statusName = (string) ($data['status'] ?? '');

            if ($statusCode === '1' || strtolower($statusName) === 'success') {
                $recharge->update([
                    'status' => MobileRecharge::STATUS_SUCCESS,
                    'provider_status' => 'Success',
                ]);
                return response()->json([
                    'success' => true,
                    'message' => 'Recharge marked as Successful!',
                    'status' => 'success',
                    'recharge' => $recharge,
                ]);
            }

            if ($statusCode === '3' || strtolower($statusName) === 'failed') {
                // If previously not failed/refunded, refund now
                if ($recharge->status !== MobileRecharge::STATUS_FAILED && $recharge->status !== MobileRecharge::STATUS_REFUNDED) {
                    $rechargeUser = $recharge->user ?: $user;
                    $rechargeUser->addCoins(
                        (int) $recharge->coins_deducted,
                        CoinTransaction::TYPE_REFUND,
                        "Recharge Refund: {$recharge->operator_name} {$recharge->mobile} (₹{$recharge->amount}) - Status Failed"
                    );
                }

                $recharge->update([
                    'status' => MobileRecharge::STATUS_FAILED,
                    'provider_status' => 'Failed',
                    'failure_reason' => $data['message'] ?? 'Operator confirmed failure.',
                ]);

                return response()->json([
                    'success' => false,
                    'message' => "Recharge failed at operator. {$recharge->coins_deducted} coins have been refunded.",
                    'status' => 'failed',
                    'recharge' => $recharge,
                ]);
            }

            // Still processing
            $recharge->update([
                'status' => MobileRecharge::STATUS_PROCESSING,
                'provider_status' => 'Processing',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Recharge is currently processing by the operator.',
                'status' => 'processing',
                'recharge' => $recharge,
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not fetch status: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Check vendor balance (Admin only)
     */
    public function checkBalance(Request $request)
    {
        $user = auth()->user();
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $balance = $this->fetchVendorBalance();

        return response()->json([
            'success' => true,
            'balance' => $balance,
        ]);
    }

    /**
     * Update recharge API settings (Admin only)
     */
    public function updateSettings(Request $request)
    {
        $user = auth()->user();
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'api_key' => ['required', 'string'],
            'api_url' => ['required', 'string'],
        ]);

        Setting::set('recharge_api_key', trim($request->input('api_key')));
        Setting::set('recharge_api_url', trim($request->input('api_url')));

        return response()->json([
            'success' => true,
            'message' => 'Recharge API settings updated successfully!',
            'api_balance' => $this->fetchVendorBalance(),
        ]);
    }

    /**
     * Internal helper to fetch vendor balance
     */
    private function fetchVendorBalance(): ?array
    {
        $baseUrl = rtrim((string) Setting::get('recharge_api_url', 'https://apinice.in/api/v1'), '/');
        $apiKey = trim((string) Setting::get('recharge_api_key', 'Y3VK89K8V8'));

        try {
            $resp = Http::withHeaders([
                'X-API-Key' => $apiKey,
            ])->timeout(10)->get($baseUrl . '/balance');

            if ($resp->successful()) {
                $data = $resp->json();
                if (!empty($data['success'])) {
                    return [
                        'balance' => $data['balance'] ?? '0.00',
                        'currency' => $data['currency'] ?? 'INR',
                        'username' => $data['username'] ?? 'Merchant',
                    ];
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Fetch vendor balance failed: ' . $e->getMessage());
        }

        return null;
    }
}
