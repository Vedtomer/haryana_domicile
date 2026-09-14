<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PppToAadharAllMembersController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'family_id' => 'required|string|min:6|max:12'
        ]);

        $familyId = strtoupper(trim($request->input('family_id')));
        $service = Service::where('slug', 'ppp-to-aadhar-all-members')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 20;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }

        // =========================================================================
        // API CONFIGURATION (Put your API URL & Key here when provided)
        // =========================================================================
        $apiUrl = config('services.ppp.ppp_to_aadhar_url') ?: env('PPP_TO_AADHAR_API_URL', '');
        $apiKey = config('services.ppp.api_key') ?: env('PPP_API_KEY', '');
        // =========================================================================

        try {
            // If user has set an API endpoint, make the HTTP request
            if (!empty($apiUrl)) {
                $response = Http::connectTimeout(10)
                    ->timeout(30)
                    ->withHeaders([
                        'Authorization' => $apiKey ? 'Bearer ' . $apiKey : '',
                        'X-API-KEY' => $apiKey,
                        'Accept' => 'application/json',
                    ])
                    ->get($apiUrl, [
                        'family_id' => $familyId,
                        'key' => $apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $members = $data['members'] ?? $data['data']['members'] ?? $data['data'] ?? [];

                    if (!empty($members) && is_array($members)) {
                        $this->deductCoinsAndLogRequest($user, $service, $coinCost, $familyId, count($members));

                        return response()->json([
                            'success' => true,
                            'family_id' => $familyId,
                            'total_members' => count($members),
                            'members' => $members,
                            'message' => 'Family members Aadhaar details fetched successfully.'
                        ]);
                    }

                    return response()->json([
                        'success' => false,
                        'message' => $data['message'] ?? 'No members found for this Family ID.'
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to retrieve data from external API.'
                ]);
            }

            // =====================================================================
            // DEMO / PLACEHOLDER RESPONSE (Active until user configures actual API)
            // =====================================================================
            $mockMembers = [
                [
                    'member_id' => $familyId . '-01',
                    'name' => 'RAMESH KUMAR',
                    'relation' => 'Head of Family',
                    'gender' => 'Male',
                    'age' => 48,
                    'dob' => '15/08/1978',
                    'aadhar_number' => '9845 2314 7890',
                    'mobile' => '9876543210',
                    'father_name' => 'SH. OM PARKASH',
                ],
                [
                    'member_id' => $familyId . '-02',
                    'name' => 'SUNITA DEVI',
                    'relation' => 'Wife',
                    'gender' => 'Female',
                    'age' => 45,
                    'dob' => '10/05/1981',
                    'aadhar_number' => '6523 9812 4321',
                    'mobile' => '9876543211',
                    'father_name' => 'SH. RAM CHAND',
                ],
                [
                    'member_id' => $familyId . '-03',
                    'name' => 'VIKAS KUMAR',
                    'relation' => 'Son',
                    'gender' => 'Male',
                    'age' => 22,
                    'dob' => '20/12/2004',
                    'aadhar_number' => '4123 7890 5632',
                    'mobile' => '9876543212',
                    'father_name' => 'SH. RAMESH KUMAR',
                ]
            ];

            // In demo mode for admin/testing
            $this->deductCoinsAndLogRequest($user, $service, $coinCost, $familyId, count($mockMembers));

            return response()->json([
                'success' => true,
                'family_id' => $familyId,
                'total_members' => count($mockMembers),
                'members' => $mockMembers,
                'is_demo' => true,
                'message' => 'PPP ID found (API configuration pending. Edit API in controller when provided).'
            ]);

        } catch (\Exception $e) {
            Log::error('PppToAadharAllMembersController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ]);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $familyId, int $memberCount): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'PPP to Aadhaar (All Members): ' . $familyId);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'PPP ID To Aadhaar Card (All Members)',
            'input_data' => ['Family ID (PPP)' => $familyId, 'Total Members' => $memberCount],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
