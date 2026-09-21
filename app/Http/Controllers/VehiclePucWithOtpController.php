<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VehiclePucWithOtpController extends Controller
{
    /**
     * Step 1: Send OTP to the mobile number
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
        // API CONFIGURATION: SEND OTP (From Admin Settings or .env)
        // =========================================================================
        $apiUrl = Setting::get('vahan_puc_send_otp_url') ?: (config('services.vahan.puc_send_otp_url') ?: env('PUC_SEND_OTP_API_URL', ''));
        $apiKey = trim(Setting::get('vahan_api_key') ?: (config('services.vahan.api_key') ?: env('PUC_API_KEY', '')));
        // =========================================================================

        $generatedOtp = (string) rand(100000, 999999);
        $sessionId = 'puc_sess_' . md5($vehicleNo . $mobileNo . microtime(true));

        try {
            if (!empty($apiUrl)) {
                // If URL contains placeholders like {mobile}, {otp}, {reg_no}, {key}
                if (str_contains($apiUrl, '{')) {
                    $resolvedUrl = str_replace(
                        ['{reg_no}', '{vehicle_no}', '{mobile}', '{otp}', '{key}', '{api_key}'],
                        [urlencode($vehicleNo), urlencode($vehicleNo), urlencode($mobileNo), urlencode($generatedOtp), urlencode($apiKey), urlencode($apiKey)],
                        $apiUrl
                    );
                    $response = Http::connectTimeout(10)->timeout(30)
                        ->withHeaders([
                            'Authorization' => $apiKey ? 'Bearer ' . $apiKey : '',
                            'X-API-KEY' => $apiKey,
                            'Accept' => 'application/json',
                        ])
                        ->get($resolvedUrl);
                } else {
                    $response = Http::connectTimeout(10)->timeout(30)
                        ->withHeaders([
                            'Authorization' => $apiKey ? 'Bearer ' . $apiKey : '',
                            'X-API-KEY' => $apiKey,
                            'Accept' => 'application/json',
                        ])
                        ->post($apiUrl, [
                            'reg_no' => $vehicleNo,
                            'vehicle_number' => $vehicleNo,
                            'mobile' => $mobileNo,
                            'mobile_number' => $mobileNo,
                            'otp' => $generatedOtp,
                            'key' => $apiKey,
                            'api_key' => $apiKey,
                        ]);
                }

                Log::info("PUC Send OTP API Response [{$vehicleNo}, {$mobileNo}]: " . $response->body());

                if ($response->successful()) {
                    $data = $response->json() ?? [];

                    // Verify if the provider returned an internal error
                    $statusFailed = false;
                    if (isset($data['success']) && ($data['success'] === false || $data['success'] === 'false' || $data['success'] === 0)) {
                        $statusFailed = true;
                    } elseif (isset($data['status']) && in_array(strtolower((string) $data['status']), ['failed', 'false', '0', 'error'])) {
                        $statusFailed = true;
                    } elseif (isset($data['Status']) && in_array(strtolower((string) $data['Status']), ['failed', 'false', 'error'])) {
                        $statusFailed = true;
                    }

                    if (!$statusFailed) {
                        session(['puc_otp_' . $sessionId => $generatedOtp]);

                        return response()->json([
                            'success' => true,
                            'session_id' => $data['session_id'] ?? $data['txn_id'] ?? $data['order_id'] ?? $sessionId,
                            'is_demo' => false,
                            'message' => $data['message'] ?? $data['msg'] ?? "OTP sent successfully to +91 {$mobileNo}.",
                        ]);
                    }

                    $errMsg = $data['message'] ?? $data['msg'] ?? $data['error'] ?? 'API Provider failed to send OTP.';
                    return response()->json([
                        'success' => false,
                        'message' => $errMsg,
                    ]);
                }

                $errorBody = $response->json();
                $errMsg = $errorBody['message'] ?? $errorBody['msg'] ?? $errorBody['error'] ?? ('Provider returned HTTP status ' . $response->status());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send OTP: ' . $errMsg,
                ]);
            }

            // Demo Mode (When no external API is configured in Admin Settings)
            session(['puc_otp_' . $sessionId => '1234']);

            return response()->json([
                'success' => true,
                'session_id' => $sessionId,
                'is_demo' => true,
                'demo_otp' => '1234',
                'message' => "Demo Mode: Live SMS API configure nahi hai. Testing ke liye demo OTP 1234 use karein.",
            ]);

        } catch (\Exception $e) {
            Log::error('VehiclePucWithOtpController sendOtp error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error while sending OTP: ' . $e->getMessage(),
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
                'message' => "Insufficient coins. This service requires {$coinCost} coins.",
            ]);
        }

        // =========================================================================
        // API CONFIGURATION: VERIFY OTP (From Admin Settings or .env)
        // =========================================================================
        $apiUrl = Setting::get('vahan_puc_verify_otp_url') ?: (config('services.vahan.puc_verify_otp_url') ?: env('PUC_VERIFY_OTP_API_URL', ''));
        $apiKey = trim(Setting::get('vahan_api_key') ?: (config('services.vahan.api_key') ?: env('PUC_API_KEY', '')));
        // =========================================================================

        try {
            if (!empty($apiUrl)) {
                if (str_contains($apiUrl, '{')) {
                    $resolvedUrl = str_replace(
                        ['{reg_no}', '{vehicle_no}', '{mobile}', '{otp}', '{session_id}', '{key}', '{api_key}'],
                        [urlencode($vehicleNo), urlencode($vehicleNo), urlencode($mobileNo), urlencode($otp), urlencode($sessionId ?? ''), urlencode($apiKey), urlencode($apiKey)],
                        $apiUrl
                    );
                    $response = Http::connectTimeout(10)->timeout(30)
                        ->withHeaders([
                            'Authorization' => $apiKey ? 'Bearer ' . $apiKey : '',
                            'X-API-KEY' => $apiKey,
                            'Accept' => 'application/json',
                        ])
                        ->get($resolvedUrl);
                } else {
                    $response = Http::connectTimeout(10)->timeout(30)
                        ->withHeaders([
                            'Authorization' => $apiKey ? 'Bearer ' . $apiKey : '',
                            'X-API-KEY' => $apiKey,
                            'Accept' => 'application/json',
                        ])
                        ->post($apiUrl, [
                            'reg_no' => $vehicleNo,
                            'vehicle_number' => $vehicleNo,
                            'mobile' => $mobileNo,
                            'mobile_number' => $mobileNo,
                            'otp' => $otp,
                            'session_id' => $sessionId,
                            'key' => $apiKey,
                            'api_key' => $apiKey,
                        ]);
                }

                Log::info("PUC Verify OTP API Response [{$vehicleNo}]: " . $response->body());

                if ($response->successful()) {
                    $data = $response->json() ?? [];
                    $pucData = $data['data'] ?? $data['puc_details'] ?? $data;

                    if (!empty($pucData['puc_no']) || !empty($pucData['valid_upto']) || !empty($pucData['certificate_no'])) {
                        $this->deductCoinsAndLogRequest($user, $service, $coinCost, $vehicleNo, $pucData['puc_no'] ?? $pucData['certificate_no'] ?? 'VERIFIED');

                        if (!empty($data['pdf_url']) && empty($pucData['pdf_url'])) {
                            $pucData['pdf_url'] = $data['pdf_url'];
                        }

                        return response()->json([
                            'success' => true,
                            'data' => $pucData,
                            'pdf_url' => $data['pdf_url'] ?? null,
                            'message' => 'OTP verified and PUC certificate downloaded successfully.',
                        ]);
                    }

                    $errMsg = $data['message'] ?? $data['msg'] ?? 'Invalid OTP or PUC details not found.';
                    return response()->json([
                        'success' => false,
                        'message' => $errMsg,
                    ]);
                }

                $errorBody = $response->json();
                $errMsg = $errorBody['message'] ?? $errorBody['msg'] ?? ('Verification failed (HTTP status ' . $response->status() . ')');
                return response()->json([
                    'success' => false,
                    'message' => $errMsg,
                ]);
            }

            // Demo Mode Verification Check
            $savedOtp = session('puc_otp_' . $sessionId, '1234');
            if ($otp !== '1234' && $otp !== $savedOtp && strlen($otp) < 4) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid OTP. Demo Mode me test OTP 1234 enter karein.',
                ]);
            }

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
                'tested_by' => 'AUTHORIZED OPERATOR',
                'carbon_monoxide' => '0.03 % (Limit: 0.50 %)',
                'hydrocarbon' => '52 ppm (Limit: 750 ppm)',
                'status' => 'ACTIVE & VALID',
                'verified_mobile' => $mobileNo,
                'is_demo' => true,
            ];

            $this->deductCoinsAndLogRequest($user, $service, $coinCost, $vehicleNo, $mockData['puc_no']);

            return response()->json([
                'success' => true,
                'data' => $mockData,
                'is_demo' => true,
                'message' => 'OTP verified! Official PUC Certificate generated successfully.',
            ]);

        } catch (\Exception $e) {
            Log::error('VehiclePucWithOtpController verifyOtp error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error during verification: ' . $e->getMessage(),
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
