<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AadharToPanController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'aadhar' => 'required|digits:12'
        ]);

        $service = \App\Models\Service::where('slug', 'aadhar-to-pan')->first();
        $user = auth()->user();
        
        $coinCost = $service ? $service->coin_cost : 69;

        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }

        $aadhar = $request->input('aadhar');
        $url = "https://nexus-dashboard.space/api/v1/aadhar_card_api/aadhaar_to_unmasked_pan.php?apiKey=sk_live_35mmsg30avhq4d296hd8th&uidNumber=" . $aadhar;

        try {
            $response = Http::get($url);

            if ($response->successful()) {
                $data = $response->json();
                
                // Specific structure handling based on API
                $panNumber = null;
                $isFound = false;

                if (isset($data['Status']) && $data['Status'] === 'Success' && !empty($data['full_panno'])) {
                    $panNumber = strtoupper($data['full_panno']);
                    $isFound = true;
                } else if ($this->findPanRecursively($data)) {
                    $panNumber = $this->findPanRecursively($data);
                    $isFound = true;
                }

                if ($isFound && $panNumber) {
                    
                    if (!$user->isAdmin() && !$user->hasRole('super_admin')) {
                        $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhar to PAN Search: ' . $aadhar);
                    }

                    \App\Models\ServiceRequest::create([
                        'user_id' => $user->id,
                        'service_id' => $service ? $service->id : null,
                        'service_name' => $service ? $service->name : 'Aadhar To Pan Unmasked Instant',
                        'input_data' => ['Aadhar Number' => $aadhar, 'PAN Number' => $panNumber],
                        'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                        'status' => \App\Models\ServiceRequest::STATUS_COMPLETED,
                        'completed_at' => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'pan_number' => $panNumber,
                        'data' => $data,
                        'message' => 'PAN details found successfully.'
                    ]);
                }
                
                if (isset($data['message'])) {
                    return response()->json([
                        'success' => false,
                        'message' => $data['message']
                    ]);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'PAN details not found or service unavailable.'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with the external server.'
            ]);
        }
    }

    private function findPanRecursively($array) {
        if (!is_array($array)) return false;
        
        // Common exact keys
        $possibleKeys = ['pan', 'pan_number', 'panNumber', 'PAN', 'panNo', 'pan_no'];
        foreach ($possibleKeys as $key) {
            if (isset($array[$key]) && is_string($array[$key]) && preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i', $array[$key])) {
                return strtoupper($array[$key]);
            }
        }
        
        // Search all values for PAN regex
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $result = $this->findPanRecursively($value);
                if ($result) return $result;
            } else if (is_string($value) && preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i', $value)) {
                return strtoupper($value);
            }
        }
        
        return false;
    }
}
