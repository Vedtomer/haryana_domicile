<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AadharToNpciController extends Controller
{
    public function index()
    {
        $service = Service::where('slug', 'aadhar-to-npci-status')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 14;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/AadharToNpciStatus', [
            'coinCost' => $coinCost,
            'service' => $service,
            'isAdmin' => (bool) $isStaff,
            'apiUrl' => $isStaff ? Setting::get('aadhar_to_npci_api_url', 'https://good-api-point.com/apis_partner/v1/bank_info_api/aadhar_to_npci.php') : null,
            'apiKey' => $isStaff ? Setting::get('aadhar_to_npci_api_key', Setting::get('aadhar_to_mask_pan_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815')) : null,
        ]);
    }

    public function updateApi(Request $request)
    {
        $user = auth()->user();
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));
        if (!$isStaff) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admins can configure API credentials.',
            ], 403);
        }

        $request->validate([
            'api_url' => ['required', 'string'],
            'api_key' => ['nullable', 'string'],
        ], [
            'api_url.required' => 'Please provide the API URL.',
        ]);

        $url = trim($request->input('api_url'));
        $key = trim((string) $request->input('api_key', ''));

        Setting::set('aadhar_to_npci_api_url', $url);
        Setting::set('aadhar_to_npci_api_key', $key);

        return response()->json([
            'success' => true,
            'message' => 'Aadhar to NPCI API configuration saved successfully!',
            'api_url' => $url,
            'api_key' => $key,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'aadhar' => ['required', 'string', 'regex:/^[0-9]{12}$/'],
        ], [
            'aadhar.required' => 'Please enter a 12-digit Aadhaar number.',
            'aadhar.regex' => 'Aadhaar number must be exactly 12 numeric digits.',
        ]);

        $service = Service::where('slug', 'aadhar-to-npci-status')->first();
        $user = auth()->user();
        $coinCost = $service ? (int) $service->coin_cost : 14;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coin balance. This service requires {$coinCost} coins. Please recharge your wallet.",
            ]);
        }

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar'));
        $baseUrl = trim(Setting::get('aadhar_to_npci_api_url') ?: 'https://good-api-point.com/apis_partner/v1/bank_info_api/aadhar_to_npci.php');
        $apiKey = trim(Setting::get('aadhar_to_npci_api_key') ?: Setting::get('aadhar_to_mask_pan_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815'));

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'API Key is not configured. Please enter your API key in Admin API Settings.',
            ]);
        }

        // Build endpoint URL
        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{uid}') || str_contains($baseUrl, '{aadhar}')) {
            $apiUrl = str_replace(
                ['{apiKey}', '{uid}', '{aadhar}'],
                [urlencode($apiKey), urlencode($cleanAadhar), urlencode($cleanAadhar)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $apiUrl = $baseUrl . $separator . "apiKey=" . urlencode($apiKey) . "&uid=" . urlencode($cleanAadhar);
        }

        try {
            $response = Http::connectTimeout(8)->timeout(25)->get($apiUrl);

            if ($response->successful()) {
                $data = $response->json();

                $isSuccess = (isset($data['Status']) && strtolower($data['Status']) === 'success') ||
                             (isset($data['StatusCode']) && (int) $data['StatusCode'] === 100);

                if ($isSuccess && isset($data['data']) && is_array($data['data'])) {
                    $item = $data['data'];

                    // Deduct coins for non-admin
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "Aadhar to NPCI Status: {$cleanAadhar}");
                    }

                    $bankName = $item['BankName'] ?? ($item['bank_name'] ?? ($item['bank'] ?? 'N/A'));
                    $accountStatus = $item['AccountStatus'] ?? ($item['account_status'] ?? ($item['status'] ?? 'N/A'));
                    $name = $item['name'] ?? ($item['Name'] ?? 'N/A');
                    $mobile = $item['mobile'] ?? ($item['Mobile'] ?? 'N/A');
                    $pan = $item['pan'] ?? ($item['Pan'] ?? ($item['PAN'] ?? 'N/A'));
                    $uid = $item['uid'] ?? $cleanAadhar;
                    $localName = $item['local_name'] ?? ($item['localName'] ?? '');

                    // Clean question-mark local name if placeholder
                    if (trim($localName) === '?????' || trim($localName) === '?') {
                        $localName = '';
                    }

                    // Record service request
                    try {
                        ServiceRequest::create([
                            'user_id' => $user->id,
                            'service_id' => $service ? $service->id : null,
                            'service_name' => $service ? $service->name : 'Aadhar To Check Ncpi Status',
                            'input_data' => [
                                'Aadhaar Number' => $cleanAadhar,
                                'Beneficiary Name' => $name,
                                'Bank Name' => $bankName,
                                'Account Status' => $accountStatus,
                            ],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status' => ServiceRequest::STATUS_COMPLETED,
                            'completed_at' => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest logging failed for AadharToNpci: ' . $logEx->getMessage());
                    }

                    return response()->json([
                        'success' => true,
                        'message' => $data['message'] ?? 'Aadhaar NPCI Status fetched successfully.',
                        'data' => [
                            'uid' => $uid,
                            'name' => trim($name),
                            'local_name' => trim($localName),
                            'mobile' => trim($mobile),
                            'bank_name' => trim($bankName),
                            'account_status' => trim($accountStatus),
                            'pan' => trim($pan),
                            'application_no' => $data['application_no'] ?? ($data['tracking_no'] ?? ('NPCI_' . uniqid())),
                            'transaction_id' => $data['transaction_id'] ?? null,
                            'execution_time' => $data['execution_time'] ?? null,
                            'checked_at' => now()->format('d M Y, h:i A'),
                        ],
                    ]);
                }

                // If API returned failure message
                $errMsg = $data['message'] ?? ($data['msg'] ?? 'Unable to find NPCI bank record for this Aadhaar Number.');
                return response()->json([
                    'success' => false,
                    'message' => $errMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'External server returned an error (HTTP ' . $response->status() . '). Please try again later.',
            ]);

        } catch (\Throwable $e) {
            Log::error('AadharToNpci API Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Connection to NPCI lookup server timed out or failed. Please check network / API settings.',
            ]);
        }
    }
}
