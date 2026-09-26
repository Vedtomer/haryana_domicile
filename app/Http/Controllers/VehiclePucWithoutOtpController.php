<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VehiclePucWithoutOtpController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'vehicle_number' => 'required|string|min:4|max:15'
        ]);

        $vehicleNo = strtoupper(trim(str_replace([' ', '-'], '', $request->input('vehicle_number'))));
        $service = Service::where('slug', 'vehicle-puc-without-otp')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 20;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }

        // =========================================================================
        // API CONFIGURATION (Put your Vehicle PUC API URL & Key here when provided)
        // =========================================================================
        $apiUrl = \App\Models\Setting::get('vahan_puc_without_otp_url') ?: (config('services.vahan.puc_without_otp_url') ?: env('PUC_WITHOUT_OTP_API_URL', ''));
        $apiKey = trim(\App\Models\Setting::get('vahan_api_key') ?: (config('services.vahan.api_key') ?: env('PUC_API_KEY', '')));
        // =========================================================================

        try {
            if (!empty($apiUrl)) {
                if (str_contains($apiUrl, '{')) {
                    $resolvedUrl = str_replace(
                        ['{reg_no}', '{vehicle_no}', '{key}', '{api_key}'],
                        [urlencode($vehicleNo), urlencode($vehicleNo), urlencode($apiKey), urlencode($apiKey)],
                        $apiUrl
                    );
                    $response = Http::withoutVerifying()
                        ->connectTimeout(8)->timeout(20)
                        ->withHeaders([
                            'Authorization' => $apiKey ? 'Bearer ' . $apiKey : '',
                            'X-API-KEY' => $apiKey,
                            'Accept' => 'application/json',
                        ])
                        ->get($resolvedUrl);
                } else {
                    $response = Http::withoutVerifying()
                        ->connectTimeout(8)->timeout(20)
                        ->withHeaders([
                            'Authorization' => $apiKey ? 'Bearer ' . $apiKey : '',
                            'X-API-KEY' => $apiKey,
                            'Accept' => 'application/json',
                        ])
                        ->get($apiUrl, [
                            'reg_no' => $vehicleNo,
                            'vehicle_number' => $vehicleNo,
                            'key' => $apiKey,
                        ]);
                }

                if ($response->successful()) {
                    $data = $response->json();
                    $pucData = $data['data'] ?? $data['puc_details'] ?? $data;

                    if (!empty($pucData['puc_no']) || !empty($pucData['certificate_no']) || !empty($pucData['valid_upto'])) {
                        $this->deductCoinsAndLogRequest($user, $service, $coinCost, $vehicleNo, $pucData['puc_no'] ?? 'FOUND');

                        if (!empty($data['pdf_url']) && empty($pucData['pdf_url'])) {
                            $pucData['pdf_url'] = $data['pdf_url'];
                        }

                        return response()->json([
                            'success' => true,
                            'data' => $pucData,
                            'message' => 'Vehicle PUC Certificate details retrieved successfully.'
                        ]);
                    }

                    return response()->json([
                        'success' => false,
                        'message' => $data['message'] ?? 'PUC Details not found for this vehicle.'
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to connect to PUC verification server.'
                ]);
            }

            // =====================================================================
            // DEMO / PLACEHOLDER RESPONSE (Active until user configures actual API)
            // =====================================================================
            $mockData = [
                'reg_no' => $vehicleNo,
                'puc_no' => 'HR06' . rand(1000000, 9999999),
                'chassis_no' => 'MBLHA10' . rand(10000, 99999),
                'engine_no' => 'HA10E' . rand(10000, 99999),
                'vehicle_class' => 'Motor Car (LMV) / Private',
                'fuel_type' => 'PETROL / HYBRID',
                'emission_norms' => 'BHARAT STAGE VI (BS-VI)',
                'test_date' => now()->subMonths(2)->format('d-M-Y H:i:s'),
                'valid_upto' => now()->addMonths(10)->format('d-M-Y'),
                'puc_center_code' => 'PUCC-HR-06-' . rand(100, 999),
                'puc_center_name' => 'CITY POLLUTION TESTING CENTRE, SECTOR 12',
                'tested_by' => 'AUTHORIZED OPERATOR',
                'carbon_monoxide' => '0.04 % (Limit: 0.50 %)',
                'hydrocarbon' => '65 ppm (Limit: 750 ppm)',
                'status' => 'VALID',
                'is_demo' => true,
            ];

            $this->deductCoinsAndLogRequest($user, $service, $coinCost, $vehicleNo, $mockData['puc_no']);

            return response()->json([
                'success' => true,
                'data' => $mockData,
                'is_demo' => true,
                'message' => 'PUC details found (API configuration pending. Edit API in controller when provided).'
            ]);

        } catch (\Exception $e) {
            Log::error('VehiclePucWithoutOtpController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server communication error. Please try again later.'
            ]);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $vehicleNo, string $pucNo): void
    {
        try {
            if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Vehicle PUC (Without OTP): ' . $vehicleNo);
            }

            ServiceRequest::create([
                'user_id' => $user->id,
                'service_id' => $service ? $service->id : null,
                'service_name' => $service ? $service->name : 'Vehicle PUC (Without OTP)',
                'input_data' => ['Vehicle Registration Number' => $vehicleNo, 'PUC Number' => $pucNo],
                'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                'status' => ServiceRequest::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('VehiclePucWithoutOtp deduct/log error: ' . $e->getMessage());
        }
    }
}
