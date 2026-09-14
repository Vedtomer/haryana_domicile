<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AbhaHealthIdMakeController extends Controller
{
    public function index()
    {
        $service = Service::where('slug', 'abha-health-id-make')->first();
        $user = auth()->user();

        return Inertia::render('Utilities/AbhaHealthIdMake', [
            'service' => $service,
            'coinCost' => $service ? $service->coin_cost : 20,
            'userCoins' => $user ? $user->coins : 0,
        ]);
    }

    /**
     * Step 1: Generate Aadhaar OTP for ABHA creation
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'aadhar_no' => 'required|string|min:12|max:14',
            'mobile_no' => 'required|string|digits:10',
            'consent' => 'accepted',
        ], [
            'aadhar_no.required' => 'Please enter a valid 12-digit Aadhaar Number.',
            'mobile_no.required' => 'Please enter a 10-digit mobile number.',
            'consent.accepted' => 'Please provide consent to generate ABHA ID.',
        ]);

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar_no'));
        $mobileNo = trim($request->input('mobile_no'));

        if (strlen($cleanAadhar) !== 12) {
            return response()->json([
                'success' => false,
                'message' => 'Aadhaar Number must be exactly 12 digits.',
            ], 422);
        }

        $service = Service::where('slug', 'abha-health-id-make')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 20;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins.",
            ], 400);
        }

        // =========================================================================
        // ABDM v3 API CONFIGURATION (Put your ABDM / ABHA v3 Gateway Credentials here)
        // Official Portal: https://abha.abdm.gov.in/abha/v3
        // =========================================================================
        $apiUrl = config('services.abha.api_url') ?: env('ABHA_API_URL', 'https://abha.abdm.gov.in/abha/v3');
        $apiKey = config('services.abha.api_key') ?: env('ABHA_API_KEY', '');
        $clientId = config('services.abha.client_id') ?: env('ABHA_CLIENT_ID', '');
        $clientSecret = config('services.abha.client_secret') ?: env('ABHA_CLIENT_SECRET', '');
        // =========================================================================

        try {
            // If custom live API is configured with key
            if (!empty($apiKey)) {
                $response = Http::connectTimeout(10)->timeout(30)->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'X-API-KEY' => $apiKey,
                    'Accept' => 'application/json',
                ])->post($apiUrl . '/enrollment/request/otp', [
                    'scope' => ['abha-enrol'],
                    'loginHint' => 'aadhaar',
                    'loginId' => $cleanAadhar,
                    'mobile' => $mobileNo,
                ]);

                if ($response->successful()) {
                    $resData = $response->json();
                    return response()->json([
                        'success' => true,
                        'txn_id' => $resData['txnId'] ?? $resData['session_id'] ?? uniqid('abha_'),
                        'message' => $resData['message'] ?? 'OTP has been sent to Aadhaar linked mobile number.',
                    ]);
                }

                $errMsg = $response->json()['message'] ?? 'Failed to send OTP via ABDM provider.';
                return response()->json([
                    'success' => false,
                    'message' => $errMsg,
                ]);
            }

            // =====================================================================
            // DEMO / READY PLACEHOLDER MODE (Active until production API keys provided)
            // =====================================================================
            $txnId = 'abha_txn_' . md5($cleanAadhar . time());
            Cache::put('abha_' . $txnId, [
                'aadhar' => $cleanAadhar,
                'mobile' => $mobileNo,
                'demo_otp' => '123456',
            ], 600);

            return response()->json([
                'success' => true,
                'txn_id' => $txnId,
                'is_demo' => true,
                'message' => 'OTP sent successfully to Aadhaar-linked Mobile Number. (Demo Mode: Enter OTP 123456)',
            ]);

        } catch (\Throwable $e) {
            Log::error('AbhaHealthIdMakeController sendOtp error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error while initiating OTP: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Step 2: Verify OTP and Generate ABHA Health ID Card
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'aadhar_no' => 'required|string|min:12|max:14',
            'mobile_no' => 'required|string|digits:10',
            'otp' => 'required|string|min:4|max:6',
            'txn_id' => 'required|string',
        ]);

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar_no'));
        $mobileNo = trim($request->input('mobile_no'));
        $otp = trim($request->input('otp'));
        $txnId = trim($request->input('txn_id'));

        $service = Service::where('slug', 'abha-health-id-make')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 20;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins.",
            ], 400);
        }

        // =========================================================================
        // ABDM v3 API CONFIGURATION
        // =========================================================================
        $apiUrl = config('services.abha.api_url') ?: env('ABHA_API_URL', 'https://abha.abdm.gov.in/abha/v3');
        $apiKey = config('services.abha.api_key') ?: env('ABHA_API_KEY', '');
        // =========================================================================

        try {
            if (!empty($apiKey)) {
                $response = Http::connectTimeout(10)->timeout(30)->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'X-API-KEY' => $apiKey,
                    'Accept' => 'application/json',
                ])->post($apiUrl . '/enrollment/enrol/byAadhaar', [
                    'txnId' => $txnId,
                    'authData' => [
                        'authMethods' => ['otp'],
                        'otp' => [
                            'txnId' => $txnId,
                            'otpValue' => $otp,
                        ],
                    ],
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $abhaData = $data['ABHAProfile'] ?? $data['data'] ?? $data;

                    $this->deductCoinsAndLog($user, $service, $coinCost, $cleanAadhar, $abhaData['ABHANumber'] ?? '');

                    return response()->json([
                        'success' => true,
                        'message' => 'ABHA Health Card created successfully!',
                        'data' => [
                            'abha_number' => $abhaData['ABHANumber'] ?? $abhaData['abha_number'] ?? '',
                            'abha_address' => $abhaData['phrAddress'] ?? $abhaData['abha_address'] ?? '',
                            'name' => $abhaData['name'] ?? '',
                            'gender' => $abhaData['gender'] ?? '',
                            'dob' => $abhaData['dateOfBirth'] ?? $abhaData['dob'] ?? '',
                            'mobile' => $abhaData['mobile'] ?? $mobileNo,
                            'address' => $abhaData['address'] ?? '',
                            'state' => $abhaData['stateName'] ?? '',
                            'district' => $abhaData['districtName'] ?? '',
                            'pincode' => $abhaData['pincode'] ?? '',
                            'photo' => $abhaData['profilePhoto'] ?? null,
                            'status' => 'ACTIVE',
                        ],
                    ]);
                }

                $errMsg = $response->json()['message'] ?? 'OTP verification failed or expired.';
                return response()->json([
                    'success' => false,
                    'message' => $errMsg,
                ]);
            }

            // Demo Mode verification
            $abhaNumber = '91-' . rand(1000, 9999) . '-' . rand(1000, 9999) . '-' . rand(1000, 9999);
            $names = ['MUKESH KUMAR', 'SANDEEP SINGH', 'POOJA SHARMA', 'AJAY VERMA', 'SUMIT CHOUDHARY', 'RAKESH YADAV'];
            $sampleName = $names[array_rand($names)];
            $abhaAddress = strtolower(explode(' ', $sampleName)[0]) . rand(100, 999) . '@abdm';

            $mockData = [
                'abha_number' => $abhaNumber,
                'abha_address' => $abhaAddress,
                'name' => $sampleName,
                'gender' => 'MALE',
                'dob' => '14/07/1994',
                'mobile' => $mobileNo,
                'address' => 'H.NO. 142, WARD 07, NEAR MAIN CHOWK, KARNAL',
                'district' => 'Karnal',
                'state' => 'Haryana',
                'pincode' => '132001',
                'status' => 'ACTIVE',
                'created_at' => now()->format('d M Y'),
                'is_demo' => true,
            ];

            $this->deductCoinsAndLog($user, $service, $coinCost, $cleanAadhar, $abhaNumber);

            return response()->json([
                'success' => true,
                'is_demo' => true,
                'message' => 'ABHA Health Card created successfully! (API configuration pending; update keys in controller when provided).',
                'data' => $mockData,
            ]);

        } catch (\Throwable $e) {
            Log::error('AbhaHealthIdMakeController verifyOtp error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Verification error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function deductCoinsAndLog($user, $service, int $coinCost, string $aadhar, string $abhaNumber): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'ABHA Health ID Make: ' . $abhaNumber);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'ABHA Health ID Make',
            'input_data' => [
                'Aadhaar' => 'XXXX-XXXX-' . substr($aadhar, -4),
                'ABHA Number' => $abhaNumber,
            ],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
