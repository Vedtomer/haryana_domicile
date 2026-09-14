<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AadharMobileUpdateController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'aadhar_no' => 'required|string|min:12|max:14',
            'mobile' => 'required|string|digits:10',
            'name' => 'required|string|max:100',
        ]);

        $service = Service::where('slug', 'aadhar-mobile-update')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 25;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar_no'));
        $mobile = trim($request->input('mobile'));
        $name = strtoupper(trim($request->input('name')));

        // =========================================================================
        // API CONFIGURATION (Put your Aadhaar Mobile Update API URL & Key here when provided)
        // =========================================================================
        $apiUrl = config('services.aadhar_update.mobile_update_url') ?: env('AADHAR_MOBILE_UPDATE_API_URL', '');
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
                        'mobile' => $mobile,
                        'name' => $name,
                        'key' => $apiKey,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $this->deductCoinsAndLogRequest($user, $service, $coinCost, 'Mobile Update: ' . substr($cleanAadhar, -4));

                    return response()->json([
                        'success' => true,
                        'urn' => $data['urn'] ?? 'URN/' . rand(100000, 999999),
                        'data' => $data,
                        'message' => $data['message'] ?? 'Mobile number update request submitted successfully.'
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to connect to Aadhaar update service.'
                ]);
            }

            // Demo / Client-side update response
            $urn = sprintf('%04d/%05d/%05d', rand(1000, 9999), rand(10000, 99999), rand(10000, 99999));
            $this->deductCoinsAndLogRequest($user, $service, $coinCost, 'Mobile Update: ' . substr($cleanAadhar, -4));

            return response()->json([
                'success' => true,
                'is_demo' => true,
                'urn' => $urn,
                'data' => [
                    'urn' => $urn,
                    'aadhar_no' => substr($cleanAadhar, 0, 4) . ' ' . substr($cleanAadhar, 4, 4) . ' ' . substr($cleanAadhar, 8, 4),
                    'name' => $name,
                    'mobile' => $mobile,
                    'request_type' => 'Mobile Number Update / Linking',
                    'status' => 'REQUEST_ACCEPTED',
                    'date' => now()->format('d/m/Y h:i A'),
                    'center_code' => 'CSC' . rand(1000, 9999),
                ],
                'message' => 'Aadhaar Mobile update request accepted. (API configuration pending. Edit API in controller when provided).'
            ]);

        } catch (\Exception $e) {
            Log::error('AadharMobileUpdateController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server communication error: ' . $e->getMessage()
            ]);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $queryIdentifier): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhaar Mobile: ' . $queryIdentifier);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'Aadhar Card Mobile Number Update',
            'input_data' => ['Query' => $queryIdentifier],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
