<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PppToMobileAllMembersController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'family_id' => 'required|string|min:6|max:12'
        ]);

        $familyId = strtoupper(trim($request->input('family_id')));
        $service = Service::where('slug', 'ppp-to-mobile-all-members')->first();
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
        $apiUrl = \App\Models\Setting::get('ppp_to_mobile_url') ?: (config('services.ppp.ppp_to_mobile_url') ?: env('PPP_TO_MOBILE_API_URL', ''));
        $apiKey = trim(\App\Models\Setting::get('ppp_api_key') ?: (config('services.ppp.api_key') ?: env('PPP_API_KEY', '')));
        // =========================================================================

        try {
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
                            'message' => 'Family members mobile details fetched successfully.'
                        ]);
                    }

                    return response()->json([
                        'success' => false,
                        'message' => $data['message'] ?? 'No records found for this Family ID.'
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to connect to external mobile lookup service.'
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
                    'mobile' => '9812345670',
                    'status' => 'Active / Verified',
                ],
                [
                    'member_id' => $familyId . '-02',
                    'name' => 'SUNITA DEVI',
                    'relation' => 'Wife',
                    'gender' => 'Female',
                    'age' => 45,
                    'mobile' => '9812345671',
                    'status' => 'Active / Verified',
                ],
                [
                    'member_id' => $familyId . '-03',
                    'name' => 'VIKAS KUMAR',
                    'relation' => 'Son',
                    'gender' => 'Male',
                    'age' => 22,
                    'mobile' => '9812345672',
                    'status' => 'Active / Verified',
                ]
            ];

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
            Log::error('PppToMobileAllMembersController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server communication error. Please try again.'
            ]);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $familyId, int $memberCount): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'PPP to Mobile (All Members): ' . $familyId);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'PPP ID To Mobile Number (All Members)',
            'input_data' => ['Family ID (PPP)' => $familyId, 'Total Members' => $memberCount],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
