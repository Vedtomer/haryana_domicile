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

        $aadhar = $request->input('aadhar');
        $baseUrl = trim(\App\Models\Setting::get('ppp_aadhar_to_ppp_url') ?: (config('services.ppp.aadhar_to_ppp_url') ?: 'https://fasal.haryana.gov.in/Home/GetFDbyAadhar'));
        $apiKey = trim(\App\Models\Setting::get('ppp_api_key') ?: config('services.ppp.api_key', ''));

        if (str_contains($baseUrl, '{aadhar}') || str_contains($baseUrl, '{aadharnum}')) {
            $url = str_replace(['{aadhar}', '{aadharnum}'], [urlencode($aadhar), urlencode($aadhar)], $baseUrl);
        } elseif (str_ends_with($baseUrl, '=')) {
            $url = $baseUrl . urlencode($aadhar);
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . "aadharnum=" . urlencode($aadhar);
        }

        try {
            $headers = ['X-Requested-With' => 'XMLHttpRequest'];
            if (!empty($apiKey)) {
                $headers['Authorization'] = 'Bearer ' . $apiKey;
            }
            $response = Http::connectTimeout(5)
                ->timeout(15)
                ->withHeaders($headers)->post($url);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['success']) && $data['success'] == true) {
                    // Extract family ID
                    if (isset($data['Payload'][0]['familyID'])) {
                        \App\Models\ServiceRequest::create([
                            'user_id' => $user->id,
                            'service_id' => $service ? $service->id : null,
                            'service_name' => $service ? $service->name : 'Aadhar to Family ID',
                            'input_data' => ['Aadhar Number' => $aadhar, 'Family ID' => $data['Payload'][0]['familyID']],
                            'coins_charged' => 0,
                            'status' => \App\Models\ServiceRequest::STATUS_COMPLETED,
                            'completed_at' => now(),
                        ]);

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
