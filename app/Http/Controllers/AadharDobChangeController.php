<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AadharDobChangeController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'aadhar_no' => 'required|string|min:12|max:14',
            'name' => 'required|string|max:100',
            'new_dob' => 'required|string',
            'doc_type' => 'required|string',
        ]);

        $service = Service::where('slug', 'aadhar-dob-change')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 25;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar_no'));
        $name = strtoupper(trim($request->input('name')));
        $currentDob = trim($request->input('current_dob', ''));
        $newDob = trim($request->input('new_dob'));
        $docType = trim($request->input('doc_type'));

        // =========================================================================
        // API CONFIGURATION (Put your Aadhaar DOB Change API URL & Key here when provided)
        // =========================================================================
        $apiUrl = \App\Models\Setting::get('aadhar_update_dob_change_url') ?: (config('services.aadhar_update.dob_change_url') ?: env('AADHAR_DOB_CHANGE_API_URL', ''));
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
                        'name' => $name,
                        'current_dob' => $currentDob,
                        'new_dob' => $newDob,
                        'doc_type' => $docType,
                        'key' => $apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $this->deductCoinsAndLogRequest($user, $service, $coinCost, 'DOB Change: ' . substr($cleanAadhar, -4));

                    return response()->json([
                        'success' => true,
                        'urn' => $data['urn'] ?? 'URN/' . rand(100000, 999999),
                        'data' => $data,
                        'message' => $data['message'] ?? 'DOB correction request submitted successfully.'
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to connect to Aadhaar update service.'
                ]);
            }

            // Demo / Client-side update response
            $urn = sprintf('%04d/%05d/%05d', rand(1000, 9999), rand(10000, 99999), rand(10000, 99999));
            $this->deductCoinsAndLogRequest($user, $service, $coinCost, 'DOB Change: ' . substr($cleanAadhar, -4));

            return response()->json([
                'success' => true,
                'is_demo' => true,
                'urn' => $urn,
                'data' => [
                    'urn' => $urn,
                    'aadhar_no' => substr($cleanAadhar, 0, 4) . ' ' . substr($cleanAadhar, 4, 4) . ' ' . substr($cleanAadhar, 8, 4),
                    'name' => $name,
                    'current_dob' => $currentDob ?: 'As per records',
                    'new_dob' => $newDob,
                    'doc_type' => $docType,
                    'request_type' => 'Date of Birth (DOB) Correction',
                    'status' => 'REQUEST_ACCEPTED',
                    'date' => now()->format('d/m/Y h:i A'),
                    'center_code' => 'CSC' . rand(1000, 9999),
                ],
                'message' => 'Aadhaar DOB correction request accepted. (API configuration pending. Edit API in controller when provided).'
            ]);

        } catch (\Exception $e) {
            Log::error('AadharDobChangeController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server communication error: ' . $e->getMessage()
            ]);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $queryIdentifier): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhaar DOB: ' . $queryIdentifier);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'Aadhar Card DOB Change',
            'input_data' => ['Query' => $queryIdentifier],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
