<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PppToBankDetailsController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'family_id' => 'required|string|min:6|max:12'
        ]);

        $familyId = strtoupper(trim($request->input('family_id')));
        $service = Service::where('slug', 'ppp-to-bank-details')->first();
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
        $apiUrl = config('services.ppp.ppp_to_bank_url') ?: env('PPP_TO_BANK_API_URL', '');
        $apiKey = config('services.ppp.api_key') ?: env('PPP_API_KEY', '');
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
                            'message' => 'Bank details retrieved successfully.'
                        ]);
                    }

                    return response()->json([
                        'success' => false,
                        'message' => $data['message'] ?? 'No bank details found for this Family ID.'
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to connect to bank lookup API.'
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
                    'bank_name' => 'STATE BANK OF INDIA',
                    'account_number' => '30894521098',
                    'ifsc_code' => 'SBIN0001234',
                    'branch' => 'MAIN BRANCH KARNAL',
                    'status' => 'Verified & Active (DBT Linked)',
                ],
                [
                    'member_id' => $familyId . '-02',
                    'name' => 'SUNITA DEVI',
                    'relation' => 'Wife',
                    'bank_name' => 'PUNJAB NATIONAL BANK',
                    'account_number' => '1423000100452319',
                    'ifsc_code' => 'PUNB0142300',
                    'branch' => 'CIVIL LINES KARNAL',
                    'status' => 'Verified & Active',
                ],
                [
                    'member_id' => $familyId . '-03',
                    'name' => 'VIKAS KUMAR',
                    'relation' => 'Son',
                    'bank_name' => 'HDFC BANK',
                    'account_number' => '50100234198274',
                    'ifsc_code' => 'HDFC0001824',
                    'branch' => 'MALL ROAD KARNAL',
                    'status' => 'Verified & Active',
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
            Log::error('PppToBankDetailsController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server communication error: ' . $e->getMessage()
            ]);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $familyId, int $memberCount): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'PPP to Bank Details: ' . $familyId);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'PPP ID To Bank Account & IFSC Code',
            'input_data' => ['Family ID (PPP)' => $familyId, 'Total Accounts' => $memberCount],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
