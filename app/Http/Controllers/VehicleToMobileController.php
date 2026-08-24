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
        $vehicleNo = strtoupper(str_replace([' ', '-'], '', $vehicleNo));
        
        $url = "https://api.paanel.shop/api/gateway.php?key=DuXxZxX&v2num=" . urlencode($vehicleNo);

        try {
            $response = Http::get($url);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['success']) && $data['success'] == true) {
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
                        'mobile' => $data['mobile'] ?? 'Not Available',
                        'chassis' => $data['chassis_last5'] ?? 'Not Available',
                        'message' => 'Vehicle details found successfully.'
                    ]);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Details not found for this Vehicle Number.'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with the external server.'
            ]);
        }
    }
}
