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
        
        $baseUrl = trim(\App\Models\Setting::get('vehicle_to_mobile_api_url') ?: 'https://api.paanel.shop/api/gateway.php');
        $apiKey = trim(\App\Models\Setting::get('vehicle_to_mobile_api_key') ?: 'DuXxZxX');

        if (str_contains($baseUrl, '{key}') || str_contains($baseUrl, '{v2num}') || str_contains($baseUrl, '{vehicle_number}')) {
            $url = str_replace(
                ['{key}', '{v2num}', '{vehicle_number}', '{reg_no}'],
                [urlencode($apiKey), urlencode($vehicleNo), urlencode($vehicleNo), urlencode($vehicleNo)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . "key=" . urlencode($apiKey) . "&v2num=" . urlencode($vehicleNo);
        }

        try {
            $response = Http::connectTimeout(10)->timeout(30)->get($url);

            if ($response->successful()) {
                $data = $response->json();
                
                // The API can return data inside 'data' object or top-level
                $resData = (isset($data['data']) && is_array($data['data'])) ? $data['data'] : $data;

                $isSuccess = false;
                if (!empty($data['success']) && ($data['success'] === true || $data['success'] === 'true' || $data['success'] == 1)) {
                    $isSuccess = true;
                } elseif (!empty($resData['success']) && ($resData['success'] === true || $resData['success'] === 'true' || $resData['success'] == 1)) {
                    $isSuccess = true;
                } elseif (!empty($resData['mobile'])) {
                    $isSuccess = true;
                }

                $mobile = $resData['mobile'] ?? $data['mobile'] ?? null;
                $chassis = $resData['chassis_last5'] ?? $data['chassis_last5'] ?? $resData['chassis'] ?? $data['chassis'] ?? null;
                $regNo = $resData['reg_no'] ?? $data['reg_no'] ?? $resData['regNo'] ?? $vehicleNo;

                if ($isSuccess && !empty($mobile)) {
                    if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                        $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Vehicle to Mobile: ' . strtoupper($vehicleNo));
                    }
                    
                    \App\Models\ServiceRequest::create([
                        'user_id' => $user->id,
                        'service_id' => $service ? $service->id : null,
                        'service_name' => $service ? $service->name : 'Vehicle to Mobile Number',
                        'input_data' => ['Vehicle Registration Number' => strtoupper($vehicleNo)],
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

                $failMsg = $data['message'] ?? $resData['message'] ?? 'Details not found for this Vehicle Number.';
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
}
