<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AadharToNameController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'aadhar' => 'required|digits:12'
        ]);

        $service = \App\Models\Service::where('slug', 'aadhar-to-name')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 19;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json(['success' => false, 'message' => "Insufficient coins. This service requires {$coinCost} coins."]);
        }

        $aadhar = $request->input('aadhar');
        $url = "https://nexus-dashboard.space/api/v1/aadhar_card_api/aadhar_to_name.php?apiKey=sk_live_35mmsg30avhq4d296hd8th&uid=" . urlencode($aadhar);

        try {
            $response = Http::get($url);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['Status']) && $data['Status'] === 'Success' && isset($data['data'])) {
                    if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                        $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhar To Name: ' . $aadhar);
                    }
                    
                    \App\Models\ServiceRequest::create([
                        'user_id' => $user->id,
                        'service_id' => $service ? $service->id : null,
                        'service_name' => $service ? $service->name : 'Aadhar To Name',
                        'input_data' => ['Aadhar Number' => $aadhar, 'Name' => $data['data']['name'] ?? ''],
                        'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                        'status' => \App\Models\ServiceRequest::STATUS_COMPLETED,
                        'completed_at' => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'name' => $data['data']['name'] ?? 'Not Available',
                        'localName' => $data['data']['localName'] ?? 'Not Available',
                        'mobile' => $data['data']['mobile'] ?? 'Not Available',
                        'message' => 'Details found successfully.'
                    ]);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Details not found for this Aadhar Number.'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with the external server.'
            ]);
        }
    }
}
