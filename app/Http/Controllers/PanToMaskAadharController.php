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

class PanToMaskAadharController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'pan-to-mask-aadhar')
            ->orWhere('slug', 'pan-to-mask-uid')
            ->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 29;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/PanToMaskAadhar', [
            'service'  => $service,
            'coinCost' => $coinCost,
            'isAdmin'  => (bool) $isStaff,
            'apiUrl'   => $isStaff ? Setting::get('pan_to_mask_uid_api_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_mask_uid.php') : null,
            'apiKey'   => $isStaff ? Setting::get('pan_to_mask_uid_api_key', Setting::get('goodapi_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815')) : null,
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

        $service = Service::where('slug', 'pan-to-mask-aadhar')
            ->orWhere('slug', 'pan-to-mask-uid')
            ->first();
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

        $baseUrl = trim(Setting::get('pan_to_mask_uid_api_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_mask_uid.php'));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_mask_uid.php';
        }

        $apiKey = trim(Setting::get('pan_to_mask_uid_api_key', Setting::get('goodapi_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815')));

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'API Key is not configured. Please enter your API key in Admin API Settings.'
            ]);
        }

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{pan_no}') || str_contains($baseUrl, '{pan}')) {
            $url = str_replace(
                ['{apiKey}', '{pan_no}', '{pan}'],
                [urlencode($apiKey), urlencode($pan), urlencode($pan)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . "apiKey=" . urlencode($apiKey) . "&pan_no=" . urlencode($pan);
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
                        'message' => 'Invalid response from PAN To Mask Aadhaar server.'
                    ]);
                }

                $status = $data['status'] ?? ($data['Status'] ?? null);
                $code = $data['code'] ?? ($data['StatusCode'] ?? null);

                $isSuccess = ($status === true || strtolower((string) $status) === 'success') || (int) $code === 200 || (int) $code === 100;

                // Extract data payload
                $payload = $data['data'] ?? ($data['result'] ?? $data);

                // Find Masked Aadhaar from various potential keys
                $foundAadhar = null;
                if (is_array($payload)) {
                    $foundAadhar = $payload['masked_aadhaar']
                        ?? ($payload['masked_uid']
                        ?? ($payload['aadhaar_number']
                        ?? ($payload['aadhar_number']
                        ?? ($payload['aadhaar_no']
                        ?? ($payload['aadhar_no']
                        ?? ($payload['aadhaar']
                        ?? ($payload['aadhar']
                        ?? ($payload['uid']
                        ?? ($payload['masked_aadhar']
                        ?? null)))))))));
                }

                if (!$foundAadhar && isset($data['masked_aadhaar'])) {
                    $foundAadhar = $data['masked_aadhaar'];
                }
                if (!$foundAadhar && isset($data['masked_uid'])) {
                    $foundAadhar = $data['masked_uid'];
                }
                if (!$foundAadhar && isset($data['aadhaar_number'])) {
                    $foundAadhar = $data['aadhaar_number'];
                }
                if (!$foundAadhar && isset($data['aadhar_number'])) {
                    $foundAadhar = $data['aadhar_number'];
                }
                if (!$foundAadhar && isset($data['aadhaar'])) {
                    $foundAadhar = $data['aadhaar'];
                }
                if (!$foundAadhar && isset($data['aadhar'])) {
                    $foundAadhar = $data['aadhar'];
                }
                if (!$foundAadhar && isset($data['uid'])) {
                    $foundAadhar = $data['uid'];
                }

                // If not found by known key, search string values in payload for masked format
                if (!$foundAadhar && is_array($payload)) {
                    foreach ($payload as $k => $v) {
                        if (is_string($v) && (str_contains(strtoupper($v), 'X') || preg_match('/\b\d{4}\b/', $v)) && strlen($v) >= 8) {
                            $foundAadhar = $v;
                            break;
                        }
                    }
                }

                $foundName = is_array($payload) ? ($payload['name'] ?? ($payload['full_name'] ?? ($payload['holder_name'] ?? ($data['name'] ?? null)))) : null;
                $fatherName = is_array($payload) ? ($payload['father_name'] ?? ($payload['fathers_name'] ?? ($data['father_name'] ?? null))) : null;
                $dob = is_array($payload) ? ($payload['dob'] ?? ($payload['date_of_birth'] ?? ($data['dob'] ?? null))) : null;
                $gender = is_array($payload) ? ($payload['gender'] ?? ($data['gender'] ?? null)) : null;
                $panStatus = is_array($payload) ? ($payload['status'] ?? ($payload['pan_status'] ?? 'Active / Valid')) : 'Active / Valid';
                $aadhaarLinked = is_array($payload) ? ($payload['aadhaar_linked'] ?? ($payload['aadhar_linked'] ?? ($payload['is_linked'] ?? 'Yes / Linked'))) : 'Yes / Linked';

                if ($isSuccess && (!empty($foundAadhar) || !empty($foundName))) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "PAN To Mask Aadhar: {$pan}");
                    }

                    try {
                        ServiceRequest::create([
                            'user_id'       => $user->id,
                            'service_id'    => $service ? $service->id : null,
                            'service_name'  => $service ? $service->name : 'PAN To Mask Aadhar',
                            'input_data'    => [
                                'PAN Number'     => $pan,
                                'Masked Aadhaar' => $foundAadhar,
                                'Name Found'     => $foundName,
                            ],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status'        => ServiceRequest::STATUS_COMPLETED,
                            'completed_at'  => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest create error in PanToMaskAadhar: ' . $logEx->getMessage());
                    }

                    return response()->json([
                        'success'        => true,
                        'pan'            => $pan,
                        'masked_aadhaar' => $foundAadhar,
                        'data'           => [
                            'pan'            => $pan,
                            'masked_aadhaar' => $foundAadhar,
                            'name'           => $foundName,
                            'father_name'    => $fatherName,
                            'dob'            => $dob,
                            'gender'         => $gender,
                            'status'         => $panStatus,
                            'aadhaar_linked' => $aadhaarLinked,
                        ],
                        'raw_data'       => $data,
                        'checked_at'     => now()->format('d M Y, h:i A'),
                        'message'        => $data['message'] ?? 'Masked Aadhaar retrieved successfully.',
                    ]);
                }

                $errorMsg = $data['message'] ?? 'Masked Aadhaar not found for this PAN number.';
                if ((int) $code === 101 || $errorMsg === 'Something went wrong.' || $errorMsg === 'Invalid API Key') {
                    $errorMsg = 'API Provider returned an error or PAN was not found. Please verify the PAN or check API Key in settings.';
                }

                return response()->json([
                    'success' => false,
                    'message' => $errorMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to the PAN To Mask Aadhaar provider. HTTP Status: ' . $response->status(),
            ]);

        } catch (\Throwable $e) {
            Log::error('PanToMaskAadhar Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with external server. Please try again later.',
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
        Setting::set('pan_to_mask_uid_api_url', $url);

        if ($request->filled('api_key')) {
            $key = trim($request->input('api_key'));
            Setting::set('pan_to_mask_uid_api_key', $key);
        }

        return response()->json([
            'success' => true,
            'message' => 'PAN to Mask Aadhaar API settings saved successfully!'
        ]);
    }
}
