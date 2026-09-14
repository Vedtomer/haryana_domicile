<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AadharToPppIdController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'aadhar' => 'required|digits:12'
        ]);

        $service = Service::where('slug', 'aadhar-to-ppp-id')->first()
            ?: Service::where('slug', 'aadhar-to-family-id')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 0;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }

        $aadhar = $request->input('aadhar');

        // =========================================================================
        // API CONFIGURATION (Edit your API URL & Key here when you receive the API)
        // =========================================================================
        $apiUrl = config('services.ppp.aadhar_to_ppp_url') 
            ?: "https://fasal.haryana.gov.in/Home/GetFDbyAadhar?aadharnum=" . urlencode($aadhar);
        $apiKey = config('services.ppp.api_key', '');
        // =========================================================================

        try {
            $response = Http::connectTimeout(5)
                ->timeout(15)
                ->withHeaders([
                    'X-Requested-With' => 'XMLHttpRequest',
                    'Authorization' => $apiKey ? 'Bearer ' . $apiKey : '',
                ])->post($apiUrl);

            if ($response->successful()) {
                $data = $response->json();

                // 1. Standard Haryana Fasal format
                if (isset($data['success']) && $data['success'] == true && isset($data['Payload'][0]['familyID'])) {
                    $familyId = $data['Payload'][0]['familyID'];
                    $memberName = $data['Payload'][0]['memberName'] ?? null;

                    $this->deductCoinsAndLogRequest($user, $service, $coinCost, $aadhar, $familyId);

                    return response()->json([
                        'success' => true,
                        'family_id' => $familyId,
                        'member_name' => $memberName,
                        'message' => 'PPP ID found successfully.'
                    ]);
                }

                // 2. Custom API format (e.g., {"status": "success", "family_id": "...", ...})
                if ((isset($data['status']) && strtolower($data['status']) === 'success') || !empty($data['family_id']) || !empty($data['data']['family_id'])) {
                    $familyId = $data['family_id'] ?? $data['data']['family_id'] ?? null;

                    if ($familyId) {
                        $this->deductCoinsAndLogRequest($user, $service, $coinCost, $aadhar, $familyId);

                        return response()->json([
                            'success' => true,
                            'family_id' => $familyId,
                            'member_name' => $data['member_name'] ?? $data['data']['member_name'] ?? null,
                            'message' => $data['message'] ?? 'PPP ID found successfully.'
                        ]);
                    }
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
                'message' => 'PPP ID not found for this Aadhaar Number or external service unavailable.'
            ]);

        } catch (\Exception $e) {
            Log::error('AadharToPppIdController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server communication error. Please try again in a few moments.'
            ]);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $aadhar, string $familyId): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhar to PPP ID: ' . $aadhar);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'Aadhar to PPP ID',
            'input_data' => ['Aadhar Number' => $aadhar, 'Family ID' => $familyId],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
