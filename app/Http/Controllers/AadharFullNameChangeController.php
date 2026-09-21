<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AadharFullNameChangeController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'aadhar_no' => 'required|string|min:12|max:14',
            'old_name' => 'required|string|max:100',
            'new_name' => 'required|string|max:100',
            'doc_type' => 'required|string',
        ]);

        $service = Service::where('slug', 'aadhar-full-name-change')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 25;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar_no'));
        $oldName = strtoupper(trim($request->input('old_name')));
        $newName = strtoupper(trim($request->input('new_name')));
        $docType = trim($request->input('doc_type'));

        // =========================================================================
        // API CONFIGURATION (Put your Aadhaar Full Name Change API URL & Key here when provided)
        // =========================================================================
        $apiUrl = \App\Models\Setting::get('aadhar_update_full_name_change_url') ?: (config('services.aadhar_update.full_name_change_url') ?: env('AADHAR_FULL_NAME_CHANGE_API_URL', ''));
        $apiKey = trim(\App\Models\Setting::get('aadhar_update_api_key') ?: (config('services.aadhar_update.api_key') ?: env('AADHAR_UPDATE_API_KEY', '')));
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
                    ->post($apiUrl, [
                        'aadhar_no' => $cleanAadhar,
                        'old_name' => $oldName,
                        'new_name' => $newName,
                        'doc_type' => $docType,
                        'key' => $apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $this->deductCoinsAndLogRequest($user, $service, $coinCost, 'Name Change: ' . substr($cleanAadhar, -4));

                    return response()->json([
                        'success' => true,
                        'urn' => $data['urn'] ?? 'URN/' . rand(100000, 999999),
                        'data' => $data,
                        'message' => $data['message'] ?? 'Name correction request submitted successfully.'
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to connect to Aadhaar update service.'
                ]);
            }

            // Demo / Client-side update response
            $urn = sprintf('%04d/%05d/%05d', rand(1000, 9999), rand(10000, 99999), rand(10000, 99999));
            $this->deductCoinsAndLogRequest($user, $service, $coinCost, 'Name Change: ' . substr($cleanAadhar, -4));

            return response()->json([
                'success' => true,
                'is_demo' => true,
                'urn' => $urn,
                'data' => [
                    'urn' => $urn,
                    'aadhar_no' => substr($cleanAadhar, 0, 4) . ' ' . substr($cleanAadhar, 4, 4) . ' ' . substr($cleanAadhar, 8, 4),
                    'old_name' => $oldName,
                    'new_name' => $newName,
                    'doc_type' => $docType,
                    'request_type' => 'Full Name Correction / Update',
                    'status' => 'REQUEST_ACCEPTED',
                    'date' => now()->format('d/m/Y h:i A'),
                    'center_code' => 'CSC' . rand(1000, 9999),
                ],
                'message' => 'Aadhaar Name correction request accepted. (API configuration pending. Edit API in controller when provided).'
            ]);

        } catch (\Exception $e) {
            Log::error('AadharFullNameChangeController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server communication error: ' . $e->getMessage()
            ]);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $queryIdentifier): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhaar Name: ' . $queryIdentifier);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'Aadhar Card Full Name Change',
            'input_data' => ['Query' => $queryIdentifier],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
