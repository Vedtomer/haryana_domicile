<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SirVoterCardListController extends Controller
{
    public function search(Request $request)
    {
        $searchType = $request->input('search_type', 'epic'); // 'epic' or 'details'

        if ($searchType === 'epic') {
            $request->validate([
                'epic_no' => 'required|string|min:4|max:20',
            ]);
        } else {
            $request->validate([
                'state' => 'required|string',
                'district' => 'required|string',
                'ac_name' => 'nullable|string',
                'voter_name' => 'nullable|string',
            ]);
        }

        $service = Service::where('slug', 'sir-voter-card-list')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 20;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }

        $epicNo = strtoupper(trim($request->input('epic_no', '')));
        $state = $request->input('state', '');
        $district = $request->input('district', '');
        $acName = $request->input('ac_name', '');
        $voterName = $request->input('voter_name', '');
        $relativeName = $request->input('relative_name', '');
        $partNo = $request->input('part_no', '');
        $sectionNo = $request->input('section_no', '');

        // =========================================================================
        // API CONFIGURATION (Put your Voter Card List API URL & Key here when provided)
        // =========================================================================
        $apiUrl = \App\Models\Setting::get('voter_sir_voter_list_url') ?: (config('services.voter.sir_voter_list_url') ?: env('SIR_VOTER_LIST_API_URL', ''));
        $apiKey = trim(\App\Models\Setting::get('voter_api_key') ?: (config('services.voter.api_key') ?: env('VOTER_API_KEY', '')));
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
                        'search_type' => $searchType,
                        'epic_no' => $epicNo,
                        'state' => $state,
                        'district' => $district,
                        'ac_name' => $acName,
                        'voter_name' => $voterName,
                        'relative_name' => $relativeName,
                        'part_no' => $partNo,
                        'section_no' => $sectionNo,
                        'key' => $apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $voters = $data['voters'] ?? $data['data'] ?? [];

                    if (!empty($voters) && is_array($voters)) {
                        $this->deductCoinsAndLogRequest($user, $service, $coinCost, $epicNo ?: "{$state}-{$district}", count($voters));

                        return response()->json([
                            'success' => true,
                            'total_found' => count($voters),
                            'voters' => $voters,
                            'pdf_url' => $data['pdf_url'] ?? null,
                            'message' => 'Voter list retrieved successfully.'
                        ]);
                    }

                    return response()->json([
                        'success' => false,
                        'message' => $data['message'] ?? 'No voter records found matching your query.'
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to connect to Election Commission / Voter service.'
                ]);
            }

            // =====================================================================
            // DEMO / PLACEHOLDER RESPONSE (Active until user configures actual API)
            // =====================================================================
            $mockVoters = [
                [
                    'serial_no' => '104',
                    'epic_no' => $epicNo ?: 'TKN' . rand(1000000, 9999999),
                    'name' => strtoupper($voterName ?: 'SURENDER SINGH'),
                    'relation_name' => 'BALBIR SINGH',
                    'relation_type' => 'Father',
                    'gender' => 'Male',
                    'age' => 42,
                    'house_no' => 'H.NO. 142, WARD 04',
                    'polling_station' => 'GOVT HIGH SCHOOL ROOM NO 2, MAIN ROAD',
                    'ac_name' => $acName ?: 'Karnal (AC 21)',
                    'district' => $district ?: 'Karnal',
                    'state' => $state ?: 'Haryana',
                    'part_no' => '45',
                    'section_no' => '1',
                ],
                [
                    'serial_no' => '105',
                    'epic_no' => 'TKN' . rand(1000000, 9999999),
                    'name' => 'MEENAKSHI DEVI',
                    'relation_name' => strtoupper($voterName ?: 'SURENDER SINGH'),
                    'relation_type' => 'Husband',
                    'gender' => 'Female',
                    'age' => 38,
                    'house_no' => 'H.NO. 142, WARD 04',
                    'polling_station' => 'GOVT HIGH SCHOOL ROOM NO 2, MAIN ROAD',
                    'ac_name' => $acName ?: 'Karnal (AC 21)',
                    'district' => $district ?: 'Karnal',
                    'state' => $state ?: 'Haryana',
                    'part_no' => '45',
                    'section_no' => '1',
                ]
            ];

            $this->deductCoinsAndLogRequest($user, $service, $coinCost, $epicNo ?: "{$state}-{$district}", count($mockVoters));

            return response()->json([
                'success' => true,
                'total_found' => count($mockVoters),
                'voters' => $mockVoters,
                'is_demo' => true,
                'message' => 'Voter list found (API configuration pending. Edit API in controller when provided).'
            ]);

        } catch (\Exception $e) {
            Log::error('SirVoterCardListController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server communication error: ' . $e->getMessage()
            ]);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $queryIdentifier, int $recordCount): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'S.I.R Voter List: ' . $queryIdentifier);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'S.I.R Voter Card List',
            'input_data' => ['Search Query' => $queryIdentifier, 'Total Records' => $recordCount],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
