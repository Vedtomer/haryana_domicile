<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AadharToNameController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'aadhar' => ['required', 'string', 'regex:/^[0-9]{12}$/']
        ], [
            'aadhar.required' => 'Please enter a 12-digit Aadhaar number.',
            'aadhar.regex' => 'Aadhaar number must be exactly 12 numeric digits.'
        ]);

        $service = Service::where('slug', 'aadhar-to-name')->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 19;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet."
            ]);
        }

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar'));
        $baseUrl = trim(Setting::get('aadhar_to_name_api_url') ?: '');
        if (empty($baseUrl) || str_contains($baseUrl, 'nexus-dashboard.space')) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_name.php';
        }
        $apiKey = \App\Services\GoodApiService::getApiKey(Setting::get('aadhar_to_name_api_key'));
        $url = \App\Services\GoodApiService::buildUrl($baseUrl, ['uid' => $cleanAadhar, 'aadhar' => $cleanAadhar], $apiKey);

        try {
            $response = \App\Services\GoodApiService::client(35, $apiKey)->get($url);

            if ($response->successful()) {
                $data = $response->json();
                
                $isSuccess = (isset($data['Status']) && strtolower($data['Status']) === 'success') ||
                             (isset($data['StatusCode']) && (int) $data['StatusCode'] === 100);

                if ($isSuccess && isset($data['data']) && is_array($data['data'])) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhar To Name: ' . $cleanAadhar);
                    }
                    
                    $item = $data['data'];
                    $name = trim($item['name'] ?? ($item['Name'] ?? 'Not Available'));
                    $localName = trim($item['localName'] ?? ($item['local_name'] ?? ''));
                    if ($localName === '?????' || $localName === '?') {
                        $localName = '';
                    }
                    $mobile = trim($item['mobile'] ?? ($item['Mobile'] ?? 'Not Available'));
                    $uid = trim($item['uid'] ?? $cleanAadhar);

                    try {
                        ServiceRequest::create([
                            'user_id' => $user->id,
                            'service_id' => $service ? $service->id : null,
                            'service_name' => $service ? $service->name : 'Aadhar To Name',
                            'input_data' => ['Aadhaar Number' => $cleanAadhar, 'Name' => $name],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status' => ServiceRequest::STATUS_COMPLETED,
                            'completed_at' => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest create error in AadharToName: ' . $logEx->getMessage());
                    }

                    return response()->json([
                        'success' => true,
                        'name' => $name,
                        'localName' => $localName,
                        'mobile' => $mobile,
                        'uid' => $uid,
                        'application_no' => $data['application_no'] ?? ($data['tracking_no'] ?? null),
                        'transaction_id' => $data['transaction_id'] ?? null,
                        'checked_at' => now()->format('d M Y, h:i A'),
                        'message' => $data['message'] ?? 'Details found successfully.'
                    ]);
                }

                $errMsg = $data['message'] ?? 'Details not found for this Aadhaar Number.';
                return response()->json([
                    'success' => false,
                    'message' => $errMsg
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'External server returned an error (HTTP ' . $response->status() . '). Please try again later.'
            ]);
            
        } catch (\Exception $e) {
            Log::error('AadharToName API communication error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with the external server.'
            ]);
        }
    }

    public function updateApi(Request $request)
    {
        $user = auth()->user();
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));
        if (!$isStaff) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admins can configure API credentials.'
            ], 403);
        }

        $request->validate([
            'api_url' => ['required', 'string'],
            'api_key' => ['nullable', 'string']
        ], [
            'api_url.required' => 'Please provide the API URL.'
        ]);

        $url = trim($request->input('api_url'));
        $key = trim((string) $request->input('api_key', ''));

        Setting::set('aadhar_to_name_api_url', $url);
        Setting::set('aadhar_to_name_api_key', $key);

        return response()->json([
            'success' => true,
            'message' => 'Aadhar to Name API configuration saved successfully!',
            'api_url' => $url,
            'api_key' => $key
        ]);
    }
}
