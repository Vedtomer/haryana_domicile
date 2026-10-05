<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PanToAadharController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'pan-to-aadhar-unmasked')
            ->orWhere('slug', 'pan-to-aadhar')
            ->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 99;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/PanToAadhar', [
            'service'  => $service,
            'coinCost' => $coinCost,
            'isAdmin'  => (bool) $isStaff,
            'apiUrl'   => $isStaff ? Setting::get('pan_to_aadhar_api_url', Setting::get('nexus_pan_to_aadhar_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_aadhar.php')) : null,
            'apiKey'   => $isStaff ? Setting::get('pan_to_aadhar_api_key', Setting::get('goodapi_api_key', 'ff43c0db8b9cdb5869ccac19872ce22936bc8508e8baaa66885aa5ec96289a41')) : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'pan'  => ['required', 'string', 'size:10', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i'],
            'name' => ['required', 'string', 'min:1', 'max:255'],
            'dob'  => ['required', 'string'],
        ], [
            'pan.required'  => 'Please enter a valid 10-character PAN number.',
            'pan.regex'     => 'Invalid PAN format. Example: ABCDE1234F',
            'name.required' => 'Please enter the cardholder Name as per PAN.',
            'dob.required'  => 'Please enter the Date of Birth (DD/MM/YYYY).',
        ]);

        $service = Service::where('slug', 'pan-to-aadhar-unmasked')
            ->orWhere('slug', 'pan-to-aadhar')
            ->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 99;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet."
            ]);
        }

        $pan = strtoupper(trim($request->input('pan')));
        $name = trim($request->input('name'));
        $dob = trim($request->input('dob'));

        $baseUrl = trim(Setting::get('pan_to_aadhar_api_url', Setting::get('nexus_pan_to_aadhar_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_aadhar.php')));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_aadhar.php';
        }

        $apiKey = trim(Setting::get('pan_to_aadhar_api_key', Setting::get('goodapi_api_key', 'ff43c0db8b9cdb5869ccac19872ce22936bc8508e8baaa66885aa5ec96289a41')));

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'API Key is not configured. Please enter your API key in Admin API Settings.'
            ]);
        }

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{pan}') || str_contains($baseUrl, '{name}')) {
            $url = str_replace(
                ['{apiKey}', '{pan}', '{name}', '{dob}'],
                [urlencode($apiKey), urlencode($pan), urlencode($name), urlencode($dob)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . "apiKey=" . urlencode($apiKey) . "&pan=" . urlencode($pan) . "&name=" . urlencode($name) . "&dob=" . urlencode($dob);
        }

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept'     => 'application/json, text/plain, */*',
            ])->connectTimeout(10)->timeout(35)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                if (!is_array($data)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid response from PAN To Aadhaar server.'
                    ]);
                }

                $status = $data['status'] ?? ($data['Status'] ?? null);
                $code = $data['code'] ?? ($data['StatusCode'] ?? null);

                $isSuccess = ($status === true || strtolower((string)$status) === 'success') || (int)$code === 200 || (int)$code === 100;

                // Extract payload
                $payload = $data['data'] ?? ($data['result'] ?? $data);

                $foundAadhar = $payload['aadhar_number'] ?? ($payload['aadhaar_number'] ?? ($payload['uid'] ?? ($payload['aadhar'] ?? ($payload['aadhaar'] ?? ($payload['aadhar_no'] ?? ($payload['uid_no'] ?? null))))));
                $foundName = $payload['name'] ?? ($payload['full_name'] ?? ($data['name'] ?? null));

                // If success and we have valid Aadhaar number or name
                if ($isSuccess && (!empty($foundAadhar) || !empty($foundName))) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "PAN To Aadhaar Unmasked: {$pan}");
                    }

                    $fatherName = $payload['father_name'] ?? ($payload['fathers_name'] ?? ($payload['care_of'] ?? ($data['father_name'] ?? null)));
                    $retDob = $payload['dob'] ?? ($payload['date_of_birth'] ?? $dob);
                    $gender = $payload['gender'] ?? ($data['gender'] ?? null);
                    $mobile = $payload['mobile'] ?? ($payload['phone'] ?? ($payload['mobile_no'] ?? ''));
                    $email = $payload['email'] ?? '';
                    $address = $payload['address'] ?? ($payload['full_address'] ?? '');
                    $city = $payload['city'] ?? ($payload['vtc'] ?? '');
                    $state = $payload['state'] ?? '';
                    $pincode = $payload['pincode'] ?? ($payload['pin'] ?? ($payload['zip'] ?? ($payload['pc'] ?? '')));

                    try {
                        ServiceRequest::create([
                            'user_id'       => $user->id,
                            'service_id'    => $service ? $service->id : null,
                            'service_name'  => $service ? $service->name : 'PAN To Aadhaar Unmasked Instant',
                            'input_data'    => [
                                'PAN Number'    => $pan,
                                'Name Entered'  => $name,
                                'DOB Entered'   => $dob,
                                'Aadhaar Found' => $foundAadhar,
                            ],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status'        => ServiceRequest::STATUS_COMPLETED,
                            'completed_at'  => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest create error in PanToAadhar: ' . $logEx->getMessage());
                    }

                    return response()->json([
                        'success' => true,
                        'data'    => [
                            'pan'            => $pan,
                            'aadhar_number'  => trim((string)$foundAadhar),
                            'aadhaar_number' => trim((string)$foundAadhar),
                            'name'           => trim((string)($foundName ?: $name)),
                            'father_name'    => trim((string)$fatherName),
                            'dob'            => trim((string)$retDob),
                            'gender'         => trim((string)$gender),
                            'mobile'         => trim((string)$mobile),
                            'email'          => trim((string)$email),
                            'address'        => trim((string)$address),
                            'city'           => trim((string)$city),
                            'state'          => trim((string)$state),
                            'pincode'        => trim((string)$pincode),
                        ],
                        'raw_data' => $data,
                        'message' => $data['message'] ?? 'Aadhaar details found successfully.',
                    ]);
                }

                $errorMsg = $data['message'] ?? 'Aadhaar details not found for this PAN card. Please check your credentials.';
                if (str_contains(strtolower($errorMsg), 'service currently unavailable') || str_contains(strtolower($errorMsg), 'temporarily unavailable')) {
                    $errorMsg = 'Service is temporarily unavailable at provider end. Please try again later.';
                }

                return response()->json([
                    'success' => false,
                    'message' => $errorMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to the service provider. HTTP Status: ' . $response->status(),
            ]);

        } catch (\Throwable $e) {
            Log::error('PanToAadhar Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with external server. Please try again.',
            ]);
        }
    }

    public function updateApi(Request $request)
    {
        $user = auth()->user();
        if (!$user || (!$user->isAdmin() && !$user->hasRole('admin') && !$user->hasRole('super_admin') && !in_array($user->type, ['admin', 'super_admin']))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'api_url' => ['required', 'string'],
            'api_key' => ['nullable', 'string'],
        ]);

        $url = trim($request->input('api_url'));
        Setting::set('pan_to_aadhar_api_url', $url);
        Setting::set('nexus_pan_to_aadhar_url', $url);

        if ($request->filled('api_key')) {
            $key = trim($request->input('api_key'));
            Setting::set('pan_to_aadhar_api_key', $key);
        }

        return response()->json([
            'success' => true,
            'message' => 'PAN to Aadhaar API settings saved successfully!'
        ]);
    }
}
