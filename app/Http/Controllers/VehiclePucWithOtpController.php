<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VehiclePucWithOtpController extends Controller
{
    /**
     * Step 1: Send OTP to the registered mobile number
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'vehicle_number' => 'required|string|min:4|max:15',
            'mobile_number' => 'required|digits:10',
        ]);

        $vehicleNo = strtoupper(trim(str_replace([' ', '-'], '', $request->input('vehicle_number'))));
        $mobileNo = trim($request->input('mobile_number'));

        // =========================================================================
        // API CONFIGURATION: SEND OTP (Put your OTP Gateway API URL & Key here)
        // =========================================================================
        $apiUrl = \App\Models\Setting::get('vahan_puc_send_otp_url') ?: (config('services.vahan.puc_send_otp_url') ?: env('PUC_SEND_OTP_API_URL', ''));
        $apiKey = trim(\App\Models\Setting::get('vahan_api_key') ?: (config('services.vahan.api_key') ?: env('PUC_API_KEY', '')));
        // =========================================================================

        try {
            if (!empty($apiUrl)) {
                $response = Http::connectTimeout(10)->timeout(30)->post($apiUrl, [
                    'reg_no' => $vehicleNo,
                    'mobile' => $mobileNo,
                    'key' => $apiKey,
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return response()->json([
                        'success' => $data['success'] ?? true,
                        'session_id' => $data['session_id'] ?? $data['txn_id'] ?? uniqid('puc_'),
                        'message' => $data['message'] ?? "OTP sent successfully to {$mobileNo}.",
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send OTP through provider.'
                ]);
            }

            // Demo mode / Placeholder OTP response
            $sessionId = 'puc_sess_' . md5($vehicleNo . time());
            return response()->json([
                'success' => true,
                'session_id' => $sessionId,
                'is_demo' => true,
                'message' => "OTP sent successfully to +91 {$mobileNo}. (Demo mode: Use OTP 1234 or any 4-6 digits)",
            ]);

        } catch (\Exception $e) {
            Log::error('VehiclePucWithOtpController sendOtp error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error while sending OTP.'
            ]);
        }
    }

    /**
     * Step 2: Verify OTP and Download/Display PUC Certificate
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'vehicle_number' => 'required|string|min:4|max:15',
            'mobile_number' => 'required|digits:10',
            'otp' => 'required|string|min:4|max:8',
            'session_id' => 'nullable|string',
        ]);

        $vehicleNo = strtoupper(trim(str_replace([' ', '-'], '', $request->input('vehicle_number'))));
        $mobileNo = trim($request->input('mobile_number'));
        $otp = trim($request->input('otp'));
        $sessionId = $request->input('session_id');

        $service = Service::where('slug', 'vehicle-puc-with-otp')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 20;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }

        // =========================================================================
        // API CONFIGURATION: VERIFY OTP (Put your OTP Verify API URL & Key here)
        // =========================================================================
        $apiUrl = \App\Models\Setting::get('vahan_puc_verify_otp_url') ?: (config('services.vahan.puc_verify_otp_url') ?: env('PUC_VERIFY_OTP_API_URL', ''));
        $apiKey = trim(\App\Models\Setting::get('vahan_api_key') ?: (config('services.vahan.api_key') ?: env('PUC_API_KEY', '')));
        // =========================================================================

        try {
            if (!empty($apiUrl)) {
                $response = Http::connectTimeout(10)->timeout(30)->post($apiUrl, [
                    'reg_no' => $vehicleNo,
                    'mobile' => $mobileNo,
                    'otp' => $otp,
                    'session_id' => $sessionId,
                    'key' => $apiKey,
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $pucData = $data['data'] ?? $data['puc_details'] ?? $data;

                    if (!empty($pucData['puc_no']) || !empty($pucData['valid_upto'])) {
                        $this->deductCoinsAndLogRequest($user, $service, $coinCost, $vehicleNo, $pucData['puc_no'] ?? 'VERIFIED');

                        return response()->json([
                            'success' => true,
                            'data' => $pucData,
                            'pdf_url' => $data['pdf_url'] ?? null,
                            'message' => 'OTP verified and PUC certificate downloaded successfully.'
                        ]);
                    }

                    return response()->json([
                        'success' => false,
                        'message' => $data['message'] ?? 'Invalid OTP or details not found.'
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'OTP verification failed with external server.'
                ]);
            }

            // Demo mode / Placeholder OTP verification response
            $mockData = [
                'reg_no' => $vehicleNo,
                'puc_no' => 'HR06' . rand(1000000, 9999999),
                'chassis_no' => 'MBLHA10' . rand(10000, 99999),
                'engine_no' => 'HA10E' . rand(10000, 99999),
                'vehicle_class' => 'Motor Car (LMV) / Private',
                'fuel_type' => 'PETROL / HYBRID',
                'emission_norms' => 'BHARAT STAGE VI (BS-VI)',
                'test_date' => now()->subMonths(1)->format('d-M-Y H:i:s'),
                'valid_upto' => now()->addMonths(11)->format('d-M-Y'),
                'puc_center_code' => 'PUCC-HR-06-' . rand(100, 999),
                'puc_center_name' => 'GOVT APPROVED POLLUTION TESTING CENTER',
                'carbon_monoxide' => '0.03 %',
                'hydrocarbon' => '52 ppm',
                'status' => 'ACTIVE & VALID',
                'verified_mobile' => $mobileNo,
                'is_demo' => true,
            ];

            $this->deductCoinsAndLogRequest($user, $service, $coinCost, $vehicleNo, $mockData['puc_no']);

            return response()->json([
                'success' => true,
                'data' => $mockData,
                'is_demo' => true,
                'message' => 'OTP verified! PUC certificate fetched (API configuration pending. Edit API in controller when provided).'
            ]);

        } catch (\Exception $e) {
            Log::error('VehiclePucWithOtpController verifyOtp error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error during verification: ' . $e->getMessage()
            ]);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $vehicleNo, string $pucNo): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Vehicle PUC (With OTP): ' . $vehicleNo);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'Vehicle PUC (With OTP)',
            'input_data' => ['Vehicle Registration Number' => $vehicleNo, 'PUC Number' => $pucNo],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
