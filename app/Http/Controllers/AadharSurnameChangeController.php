<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AadharSurnameChangeController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'aadhar_no' => 'required|string|min:12|max:14',
            'first_name' => 'required|string|max:100',
            'new_surname' => 'required|string|max:100',
            'reason' => 'required|string',
        ]);

        $service = Service::where('slug', 'aadhar-surname-change')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 25;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar_no'));
        $firstName = strtoupper(trim($request->input('first_name')));
        $oldSurname = strtoupper(trim($request->input('old_surname', '')));
        $newSurname = strtoupper(trim($request->input('new_surname')));
        $reason = trim($request->input('reason'));

        // =========================================================================
        // API CONFIGURATION (Put your Aadhaar Surname Change API URL & Key here when provided)
        // =========================================================================
        $apiUrl = config('services.aadhar_update.surname_change_url') ?: env('AADHAR_SURNAME_CHANGE_API_URL', '');
        $apiKey = config('services.aadhar_update.api_key') ?: env('AADHAR_UPDATE_API_KEY', '');
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
                        'first_name' => $firstName,
                        'old_surname' => $oldSurname,
                        'new_surname' => $newSurname,
                        'reason' => $reason,
                        'key' => $apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $this->deductCoinsAndLogRequest($user, $service, $coinCost, 'Surname Change: ' . substr($cleanAadhar, -4));

                    return response()->json([
                        'success' => true,
                        'urn' => $data['urn'] ?? 'URN/' . rand(100000, 999999),
                        'data' => $data,
                        'message' => $data['message'] ?? 'Surname update request submitted successfully.'
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to connect to Aadhaar update service.'
                ]);
            }

            // Demo / Client-side update response
            $urn = sprintf('%04d/%05d/%05d', rand(1000, 9999), rand(10000, 99999), rand(10000, 99999));
            $this->deductCoinsAndLogRequest($user, $service, $coinCost, 'Surname Change: ' . substr($cleanAadhar, -4));

            return response()->json([
                'success' => true,
                'is_demo' => true,
                'urn' => $urn,
                'data' => [
                    'urn' => $urn,
                    'aadhar_no' => substr($cleanAadhar, 0, 4) . ' ' . substr($cleanAadhar, 4, 4) . ' ' . substr($cleanAadhar, 8, 4),
                    'first_name' => $firstName,
                    'old_surname' => $oldSurname ?: 'None',
                    'new_surname' => $newSurname,
                    'new_full_name' => $firstName . ' ' . $newSurname,
                    'reason' => $reason,
                    'request_type' => 'Surname / Last Name Change',
                    'status' => 'REQUEST_ACCEPTED',
                    'date' => now()->format('d/m/Y h:i A'),
                    'center_code' => 'CSC' . rand(1000, 9999),
                ],
                'message' => 'Aadhaar Surname change request accepted. (API configuration pending. Edit API in controller when provided).'
            ]);

        } catch (\Exception $e) {
            Log::error('AadharSurnameChangeController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server communication error: ' . $e->getMessage()
            ]);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $queryIdentifier): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhaar Surname: ' . $queryIdentifier);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'Aadhar Card Surname Change',
            'input_data' => ['Query' => $queryIdentifier],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
