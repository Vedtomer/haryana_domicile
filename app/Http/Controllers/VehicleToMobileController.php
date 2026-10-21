<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class VehicleToMobileController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'vehicle_number' => 'required|string'
        ]);

        $service = \App\Models\Service::where('slug', 'vehicle-to-mobile')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 20;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json(['success' => false, 'message' => "Insufficient coins. This service requires {$coinCost} coins."]);
        }

        $vehicleNo = $request->input('vehicle_number');
        $vehicleNo = strtoupper(trim(str_replace([' ', '-'], '', $vehicleNo)));
        
        $baseUrl = trim(\App\Models\Setting::get('vehicle_to_mobile_api_url') ?: 'https://infoking.online/Apinumbercar.php');
        $apiKey = trim(\App\Models\Setting::get('vehicle_to_mobile_api_key') ?: '');

        if (str_contains($baseUrl, '{key}') || str_contains($baseUrl, '{v2num}') || str_contains($baseUrl, '{vehicle_number}') || str_contains($baseUrl, '{number}') || str_contains($baseUrl, '{reg_no}')) {
            $url = str_replace(
                ['{number}', '{key}', '{v2num}', '{vehicle_number}', '{reg_no}'],
                [urlencode($vehicleNo), urlencode($apiKey), urlencode($vehicleNo), urlencode($vehicleNo), urlencode($vehicleNo)],
                $baseUrl
            );
        } else {
            if (preg_match('/([?&]number=)[^&]*/', $baseUrl)) {
                $url = preg_replace('/([?&]number=)[^&]*/', '$1' . urlencode($vehicleNo), $baseUrl);
            } elseif (preg_match('/([?&]v2num=)[^&]*/', $baseUrl)) {
                $url = preg_replace('/([?&]v2num=)[^&]*/', '$1' . urlencode($vehicleNo), $baseUrl);
            } else {
                $separator = str_contains($baseUrl, '?') ? '&' : '?';
                if (str_contains($baseUrl, 'Apinumbercar') || str_contains($baseUrl, 'infoking') || str_contains($baseUrl, 'number=')) {
                    $url = $baseUrl . $separator . "number=" . urlencode($vehicleNo);
                } else {
                    $url = $baseUrl . $separator . ($apiKey ? "key=" . urlencode($apiKey) . "&" : "") . "v2num=" . urlencode($vehicleNo);
                }
            }
        }

        try {
            $response = Http::withoutVerifying()->connectTimeout(10)->timeout(30)->get($url);

            if ($response->successful()) {
                $data = $response->json();
                
                // Response can be nested inside data.data (infoking), data, or top-level
                $nestedData = (isset($data['data']['data']) && is_array($data['data']['data']))
                    ? $data['data']['data']
                    : ((isset($data['data']) && is_array($data['data'])) ? $data['data'] : $data);

                $isSuccess = false;
                if (!empty($data['success']) && ($data['success'] === true || $data['success'] === 'true' || $data['success'] == 1)) {
                    $isSuccess = true;
                } elseif (!empty($nestedData['success']) && ($nestedData['success'] === true || $nestedData['success'] === 'true' || $nestedData['success'] == 1)) {
                    $isSuccess = true;
                }

                $mobile = $nestedData['mobile'] ?? $data['data']['mobile'] ?? $data['mobile'] ?? null;
                $chassis = $nestedData['chassis_last5'] ?? $data['data']['chassis_last5'] ?? $nestedData['chassis'] ?? $data['chassis'] ?? null;
                $regNo = $nestedData['reg_no'] ?? $data['data']['reg_no'] ?? $data['vehicle_number'] ?? $vehicleNo;

                if (!empty($mobile)) {
                    $isSuccess = true;
                }

                if ($isSuccess && !empty($mobile)) {
                    if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                        $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Vehicle to Mobile: ' . strtoupper($vehicleNo));
                    }
                    
                    \App\Models\ServiceRequest::create([
                        'user_id' => $user->id,
                        'service_id' => $service ? $service->id : null,
                        'service_name' => $service ? $service->name : 'Vehicle to Mobile Number',
                        'input_data' => ['Vehicle Registration Number' => strtoupper($vehicleNo), 'Mobile' => $mobile],
                        'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                        'status' => \App\Models\ServiceRequest::STATUS_COMPLETED,
                        'completed_at' => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'mobile' => $mobile,
                        'chassis' => $chassis ?: 'Not Available',
                        'reg_no' => $regNo,
                        'message' => 'Vehicle details found successfully.'
                    ]);
                }

                $failMsg = $data['provider_response']['message'] 
                    ?? $data['message'] 
                    ?? $nestedData['message'] 
                    ?? 'Details not found for this Vehicle Number.';
                return response()->json([
                    'success' => false,
                    'message' => $failMsg
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Details not found for this Vehicle Number.'
            ]);
            
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('VehicleToMobile API Error: ' . $e->getMessage());
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

        \App\Models\Setting::set('vehicle_to_mobile_api_url', trim($request->input('api_url')));
        
        if ($request->filled('api_key')) {
            \App\Models\Setting::set('vehicle_to_mobile_api_key', trim($request->input('api_key')));
        }

        return response()->json([
            'success' => true,
            'message' => 'Vehicle to Mobile API settings updated successfully.'
        ]);
    }
}
