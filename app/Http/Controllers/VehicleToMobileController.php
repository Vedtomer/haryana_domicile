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
        
        // Basic check for premium service access if the service exists
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['success' => false, 'message' => 'Please unlock this premium service first.']);
        }

        $vehicleNo = $request->input('vehicle_number');
        $vehicleNo = strtoupper(str_replace([' ', '-'], '', $vehicleNo));
        
        $url = "https://api.paanel.shop/api/gateway.php?key=DuXxZxX&v2num=" . urlencode($vehicleNo);

        try {
            $response = Http::get($url);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['success']) && $data['success'] == true) {
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
