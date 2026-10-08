<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AadharToMaskPanController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'aadhar' => ['required', 'string', 'regex:/^[0-9]{12}$/']
        ], [
            'aadhar.required' => 'Please enter a 12-digit Aadhaar number.',
            'aadhar.regex' => 'Aadhaar number must be exactly 12 numeric digits.'
        ]);

        $service = Service::where('slug', 'aadhar-to-mask-pan')->first();
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
        
        $baseUrl = trim(Setting::get('aadhar_to_mask_pan_api_url') ?: Setting::get('nexus_aadhar_to_mask_pan_url', ''));
        if (empty($baseUrl) || str_contains($baseUrl, 'nexus-dashboard.space')) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_mask_pan.php';
        }

        $apiKey = \App\Services\GoodApiService::getApiKey(Setting::get('aadhar_to_mask_pan_api_key'));
        $url = \App\Services\GoodApiService::buildUrl($baseUrl, ['uid' => $cleanAadhar, 'aadhar' => $cleanAadhar], $apiKey);

        try {
            $response = \App\Services\GoodApiService::client(35, $apiKey)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                $isSuccess = (isset($data['Status']) && strtolower($data['Status']) === 'success') ||
                             (isset($data['StatusCode']) && (int) $data['StatusCode'] === 100);

                $item = $data['data'] ?? [];
                $pan = is_array($item) ? ($item['pan'] ?? ($item['pan_number'] ?? ($item['masked_pan'] ?? null))) : null;
                if (!$pan && isset($data['pan'])) {
                    $pan = $data['pan'];
                }

                if ($isSuccess && !empty($pan)) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhar To Mask PAN: ' . $cleanAadhar);
                    }

                    try {
                        ServiceRequest::create([
                            'user_id' => $user->id,
                            'service_id' => $service ? $service->id : null,
                            'service_name' => $service ? $service->name : 'Aadhar To Pan Mask',
                            'input_data' => ['Aadhaar Number' => $cleanAadhar, 'Masked PAN' => $pan],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status' => ServiceRequest::STATUS_COMPLETED,
                            'completed_at' => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest create error in AadharToMaskPan: ' . $logEx->getMessage());
                    }

                    return response()->json([
                        'success' => true,
                        'pan' => $pan,
                        'data' => $item,
                        'application_no' => $data['application_no'] ?? ($data['tracking_no'] ?? null),
                        'transaction_id' => $data['transaction_id'] ?? null,
                        'checked_at' => now()->format('d M Y, h:i A'),
                        'message' => $data['message'] ?? 'Masked PAN found successfully.',
                    ]);
                }

                $errMsg = $data['message'] ?? 'Masked PAN not found for this Aadhaar Number.';
                if ($errMsg === 'Invalid API Key' || (isset($data['StatusCode']) && (int) $data['StatusCode'] === 101)) {
                    $errMsg = 'Invalid API Key: Please update your Good-API-Point partner API Key in Admin Settings or /set-goodapi-key.';
                }
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
            Log::error('AadharToMaskPan API communication error: ' . $e->getMessage());
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
            'api_url' => 'required|url',
            'api_key' => 'nullable|string',
        ]);

        Setting::set('aadhar_to_mask_pan_api_url', trim($request->input('api_url')));
        Setting::set('nexus_aadhar_to_mask_pan_url', trim($request->input('api_url')));
        
        if ($request->filled('api_key')) {
            Setting::set('aadhar_to_mask_pan_api_key', trim($request->input('api_key')));
            Setting::set('aadhar_to_name_api_key', trim($request->input('api_key')));
            Setting::set('aadhar_to_npci_api_key', trim($request->input('api_key')));
        }

        return response()->json([
            'success' => true,
            'message' => 'Aadhar to Mask PAN API settings updated successfully.'
        ]);
    }
}
