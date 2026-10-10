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

class PanFullDetailsController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::whereIn('slug', [
            'pan-full-details',
            'pan-full-details-instant',
            'pan-full-detail',
            'pan-full',
            'pan-details-full',
        ])->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 29;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/PanFullDetails', [
            'service'  => $service,
            'coinCost' => $coinCost,
            'isAdmin'  => (bool) $isStaff,
            'apiUrl'   => $isStaff ? Setting::get('pan_full_details_api_url', Setting::get('nexus_pan_full_details_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_full_details.php')) : null,
            'apiKey'   => $isStaff ? Setting::get('pan_full_details_api_key', Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1')) : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'pan' => ['required', 'string', 'size:10', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i']
        ], [
            'pan.required' => 'Please enter a valid 10-character PAN number.',
            'pan.regex'    => 'Invalid PAN format. Example: ABCDE1234F',
        ]);

        $service = Service::whereIn('slug', [
            'pan-full-details',
            'pan-full-details-instant',
            'pan-full-detail',
            'pan-full',
            'pan-details-full',
        ])->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 29;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet."
            ]);
        }

        $pan = strtoupper(trim($request->input('pan')));

        $baseUrl = trim(Setting::get('pan_full_details_api_url', Setting::get('nexus_pan_full_details_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_full_details.php')));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_full_details.php';
        }

        $apiKey = \App\Services\GoodApiService::getApiKey(Setting::get('pan_full_details_api_key'));
        $url = \App\Services\GoodApiService::buildUrl($baseUrl, [
            'pan'    => $pan,
            'pan_no' => $pan,
        ], $apiKey);

        try {
            $response = \App\Services\GoodApiService::client(40, $apiKey)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                if (!is_array($data)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid response from PAN server.'
                    ]);
                }

                $status = $data['status'] ?? ($data['Status'] ?? null);
                $code = $data['code'] ?? ($data['StatusCode'] ?? null);

                $isSuccess = ($status === true || strtolower((string)$status) === 'success') || (int)$code === 200 || (int)$code === 100;

                // Extract payload
                $payload = $data['data'] ?? ($data['result'] ?? $data);

                $foundPan = $payload['pan'] ?? ($payload['pan_number'] ?? ($payload['pan_no'] ?? ($data['pan'] ?? null)));
                $foundName = $payload['name'] ?? ($payload['full_name'] ?? ($data['name'] ?? null));

                if ($isSuccess && (!empty($foundName) || !empty($foundPan))) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "PAN Full Details: {$pan}");
                    }

                    $fatherName = $payload['father_name'] ?? ($payload['fathers_name'] ?? ($payload['Fathers_name'] ?? ($data['father_name'] ?? null)));
                    $dob = $payload['dob'] ?? ($payload['date_of_birth'] ?? ($data['dob'] ?? null));
                    $gender = $payload['gender'] ?? ($data['gender'] ?? null);
                    $panType = $payload['pan_type'] ?? ($payload['type'] ?? ($data['pan_type'] ?? 'INDIVIDUAL'));
                    $aadhaarLinked = $payload['aadhaar_linked'] ?? ($payload['aadhar_linked'] ?? ($payload['aadhaar_seeding_status'] ?? ($data['aadhaar_linked'] ?? null)));
                    $panStatus = $payload['status'] ?? ($data['status'] ?? 'Active / Valid');
                    $mobile = $payload['mobile'] ?? ($payload['phone'] ?? ($payload['mobile_no'] ?? ''));
                    $email = $payload['email'] ?? '';
                    $address = $payload['address'] ?? '';
                    $city = $payload['city'] ?? '';
                    $state = $payload['state'] ?? '';
                    $pincode = $payload['pincode'] ?? ($payload['pin'] ?? ($payload['zip'] ?? ''));

                    try {
                        ServiceRequest::create([
                            'user_id'       => $user->id,
                            'service_id'    => $service ? $service->id : null,
                            'service_name'  => $service ? $service->name : 'PAN Full Details',
                            'input_data'    => [
                                'PAN Number' => $pan,
                                'Name Found' => $foundName,
                            ],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status'        => ServiceRequest::STATUS_COMPLETED,
                            'completed_at'  => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest create error in PanFullDetails: ' . $logEx->getMessage());
                    }

                    return response()->json([
                        'success' => true,
                        'data'    => [
                            'pan'            => strtoupper(trim((string)($foundPan ?: $pan))),
                            'name'           => trim((string)$foundName),
                            'father_name'    => trim((string)$fatherName),
                            'dob'            => trim((string)$dob),
                            'gender'         => trim((string)$gender),
                            'pan_type'       => trim((string)$panType),
                            'aadhaar_linked' => trim((string)$aadhaarLinked),
                            'status'         => trim((string)$panStatus),
                            'mobile'         => trim((string)$mobile),
                            'email'          => trim((string)$email),
                            'address'        => trim((string)$address),
                            'city'           => trim((string)$city),
                            'state'          => trim((string)$state),
                            'pincode'        => trim((string)$pincode),
                        ],
                        'raw_data' => $data,
                        'message' => $data['message'] ?? 'PAN Full Details found successfully.',
                    ]);
                }

                $errorMsg = $data['message'] ?? 'PAN verification record not found. Please check the PAN number.';
                if (str_contains(strtolower($errorMsg), 'service currently unavailable') || str_contains(strtolower($errorMsg), 'temporarily unavailable')) {
                    $errorMsg = 'Service is temporarily unavailable at provider end. Please try again in a few moments.';
                }

                return response()->json([
                    'success' => false,
                    'message' => $errorMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to PAN service provider. HTTP Status: ' . $response->status(),
            ]);

        } catch (\Throwable $e) {
            Log::error('PanFullDetails Error: ' . $e->getMessage());
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
        Setting::set('pan_full_details_api_url', $url);
        Setting::set('nexus_pan_full_details_url', $url);

        if ($request->filled('api_key')) {
            $key = trim($request->input('api_key'));
            Setting::set('pan_full_details_api_key', $key);
        }

        return response()->json([
            'success' => true,
            'message' => 'PAN Full Details API settings saved successfully!'
        ]);
    }
}
