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

class PanDetailsServer2Controller extends Controller
{
    public function index(Request $request)
    {
        $service = Service::whereIn('slug', ['pan-details-server-2', 'pan-details-server2', 'pan-to-details-server-2', 'pan-card-to-pan-details'])->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 19;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/PanDetailsServer2', [
            'service'  => $service,
            'coinCost' => $coinCost,
            'isAdmin'  => (bool) $isStaff,
            'apiUrl'   => $isStaff ? Setting::get('pan_details_server2_api_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_server2.php') : null,
            'apiKey'   => $isStaff ? Setting::get('pan_details_server2_api_key', Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1')) : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'pan' => ['required', 'string', 'size:10', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i'],
        ], [
            'pan.required' => 'Please enter a valid 10-character PAN number.',
            'pan.regex'    => 'Invalid PAN format. Example: ABCDE1234F',
        ]);

        $service = Service::whereIn('slug', ['pan-details-server-2', 'pan-details-server2', 'pan-to-details-server-2', 'pan-card-to-pan-details'])->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 19;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet."
            ]);
        }

        $pan = strtoupper(trim($request->input('pan')));

        $baseUrl = trim(Setting::get('pan_details_server2_api_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_server2.php'));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_server2.php';
        }

        $apiKey = \App\Services\GoodApiService::getApiKey(Setting::get('pan_details_server2_api_key'));
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
                        'message' => 'Invalid response from PAN Server 2.'
                    ]);
                }

                $status = $data['status'] ?? ($data['Status'] ?? null);
                $code = $data['code'] ?? ($data['StatusCode'] ?? null);

                $isSuccess = ($status === true || strtolower((string)$status) === 'success') || (int)$code === 200 || (int)$code === 100;

                // Extract data payload
                $payload = $data['data'] ?? ($data['result'] ?? $data);

                $foundPan = $payload['pan'] ?? ($payload['pan_number'] ?? ($data['pan'] ?? null));
                $foundName = $payload['name'] ?? ($payload['full_name'] ?? ($data['name'] ?? null));

                // If success or we have a valid name or pan returned
                if ($isSuccess && (!empty($foundName) || !empty($foundPan))) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "PAN Details Server 2: {$pan}");
                    }

                    $fatherName = $payload['father_name'] ?? ($payload['fathers_name'] ?? ($data['father_name'] ?? null));
                    $dob = $payload['dob'] ?? ($payload['date_of_birth'] ?? ($data['dob'] ?? null));
                    $gender = $payload['gender'] ?? ($data['gender'] ?? null);
                    $panType = $payload['pan_type'] ?? ($payload['type'] ?? ($data['pan_type'] ?? 'INDIVIDUAL'));
                    $aadhaarLinked = $payload['aadhaar_linked'] ?? ($payload['aadhar_linked'] ?? ($payload['aadhaar_seeding_status'] ?? ($data['aadhaar_linked'] ?? null)));
                    $panStatus = $payload['status'] ?? ($data['status'] ?? 'Active / Valid');

                    try {
                        ServiceRequest::create([
                            'user_id'       => $user->id,
                            'service_id'    => $service ? $service->id : null,
                            'service_name'  => $service ? $service->name : 'Pan Details Server 2',
                            'input_data'    => [
                                'PAN Number' => $pan,
                                'Name Found' => $foundName,
                            ],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status'        => ServiceRequest::STATUS_COMPLETED,
                            'completed_at'  => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest create error in PanDetailsServer2: ' . $logEx->getMessage());
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
                            'category'       => trim((string)($payload['category'] ?? '')),
                            'mobile'         => trim((string)($payload['mobile'] ?? ($payload['phone'] ?? ''))),
                            'email'          => trim((string)($payload['email'] ?? '')),
                            'address'        => trim((string)($payload['address'] ?? '')),
                            'city'           => trim((string)($payload['city'] ?? '')),
                            'state'          => trim((string)($payload['state'] ?? '')),
                            'pincode'        => trim((string)($payload['pincode'] ?? ($payload['pin'] ?? ''))),
                        ],
                        'raw_data' => $data,
                        'message' => $data['message'] ?? 'PAN details found successfully.',
                    ]);
                }

                $errorMsg = $data['message'] ?? 'PAN verification record not found. Please check the PAN number.';
                return response()->json([
                    'success' => false,
                    'message' => $errorMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to PAN server. HTTP Status: ' . $response->status(),
            ]);

        } catch (\Throwable $e) {
            Log::error('PanDetailsServer2 Error: ' . $e->getMessage());
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

        Setting::set('pan_details_server2_api_url', trim($request->input('api_url')));
        if ($request->filled('api_key')) {
            Setting::set('pan_details_server2_api_key', trim($request->input('api_key')));
        }

        return response()->json([
            'success' => true,
            'message' => 'PAN Details Server 2 API settings saved successfully!'
        ]);
    }
}
