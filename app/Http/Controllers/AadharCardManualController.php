<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AadharCardManualController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'aadhar_no' => 'required|string|min:12|max:14',
            'name_en' => 'required|string|max:100',
            'dob' => 'required|string',
            'gender' => 'required|string',
            'address_en' => 'required|string',
        ]);

        $service = Service::where('slug', 'aadhar-card-manual')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 25;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar_no'));

        // =========================================================================
        // API CONFIGURATION (Put your Aadhaar Card Manual API URL & Key here when provided)
        // =========================================================================
        $apiUrl = config('services.card_maker.aadhar_card_url') ?: env('AADHAR_CARD_MANUAL_API_URL', '');
        $apiKey = config('services.card_maker.api_key') ?: env('CARD_MAKER_API_KEY', '');
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
                    $this->deductCoinsAndLogRequest($user, $service, $coinCost, 'Aadhaar: ' . substr($cleanAadhar, -4));

                    return response()->json([
                        'success' => true,
                        'front_image' => $data['front_image'] ?? null,
                        'back_image' => $data['back_image'] ?? null,
                        'pdf_url' => $data['pdf_url'] ?? null,
                        'message' => 'Aadhaar Card generated successfully.'
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate Aadhaar Card with external server.'
                ]);
            }

            // Demo / Client-side Render Mode
            $this->deductCoinsAndLogRequest($user, $service, $coinCost, 'Aadhaar: ' . substr($cleanAadhar, -4));

            return response()->json([
                'success' => true,
                'is_demo' => true,
                'card_data' => $request->all(),
                'message' => 'Aadhaar Card generated successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('AadharCardManualController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server communication error: ' . $e->getMessage()
            ]);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $queryIdentifier): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhar Card Manual: ' . $queryIdentifier);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'Aadhar Card Manual',
            'input_data' => ['Aadhaar' => $queryIdentifier],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
