<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AadharToFamilyIdController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'aadhar' => 'required|digits:12'
        ]);

        $service = \App\Models\Service::where('slug', 'aadhar-to-family-id')->first();
        $user = auth()->user();
        
        // Basic check for premium service access if the service exists
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['success' => false, 'message' => 'Please unlock this premium service first.']);
        }

        $aadhar = $request->input('aadhar');
        $url = "https://fasal.haryana.gov.in/Home/GetFDbyAadhar?aadharnum=" . $aadhar;

        try {
            $response = Http::withHeaders([
                'X-Requested-With' => 'XMLHttpRequest'
            ])->post($url);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['success']) && $data['success'] == true) {
                    // Extract family ID
                    if (isset($data['Payload'][0]['familyID'])) {
                        return response()->json([
                            'success' => true,
                            'family_id' => $data['Payload'][0]['familyID'],
                            'message' => 'Family ID found successfully.'
                        ]);
                    }
                }
                
                // If success is false but data returned
                if (isset($data['message'])) {
                    return response()->json([
                        'success' => false,
                        'message' => $data['message']
                    ]);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Family ID not found or service unavailable.'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with the external server.'
            ]);
        }
    }
}
