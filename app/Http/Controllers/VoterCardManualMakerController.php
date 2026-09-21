<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VoterCardManualMakerController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'epic_no' => 'required|string|max:20',
            'name_en' => 'required|string|max:100',
            'relation_name_en' => 'required|string|max:100',
            'gender' => 'required|string',
            'dob' => 'required|string',
        ]);

        $service = Service::where('slug', 'voter-card-manual-maker')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 20;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }

        $epicNo = strtoupper(trim($request->input('epic_no')));

        // =========================================================================
        // API CONFIGURATION (Put your Voter Card Maker API URL & Key here when provided)
        // =========================================================================
        $apiUrl = \App\Models\Setting::get('card_maker_voter_card_url') ?: (config('services.card_maker.voter_card_url') ?: env('VOTER_CARD_MAKER_API_URL', ''));
        $apiKey = trim(\App\Models\Setting::get('card_maker_api_key') ?: (config('services.card_maker.api_key') ?: env('CARD_MAKER_API_KEY', '')));
        // =========================================================================

        try {
            if (!empty($apiUrl)) {
                $response = Http::connectTimeout(15)
                    ->timeout(60)
                    ->withHeaders([
                        'Authorization' => $apiKey ? 'Bearer ' . $apiKey : '',
                        'X-API-KEY' => $apiKey,
                        'Accept' => 'application/json',
                    ])
                    ->post($apiUrl, array_merge($request->all(), ['key' => $apiKey]));

                if ($response->successful()) {
                    $data = $response->json();
                    $this->deductCoinsAndLogRequest($user, $service, $coinCost, $epicNo);

                    return response()->json([
                        'success' => true,
                        'front_image' => $data['front_image'] ?? null,
                        'back_image' => $data['back_image'] ?? null,
                        'pdf_url' => $data['pdf_url'] ?? null,
                        'message' => 'Voter Card generated successfully.'
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate Voter Card with external server.'
                ]);
            }

            // Demo / Client-side Render Mode
            $this->deductCoinsAndLogRequest($user, $service, $coinCost, $epicNo);

            return response()->json([
                'success' => true,
                'is_demo' => true,
                'card_data' => $request->all(),
                'message' => 'Voter Card generated successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('VoterCardManualMakerController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server communication error: ' . $e->getMessage()
            ]);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $queryIdentifier): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Voter Card Maker: ' . $queryIdentifier);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'Voter Card Manual Maker',
            'input_data' => ['EPIC No' => $queryIdentifier],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
