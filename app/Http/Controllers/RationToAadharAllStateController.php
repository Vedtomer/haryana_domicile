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

class RationToAadharAllStateController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'ration-to-aadhar-all-state')->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 119;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/RationToAadharAllState', [
            'service' => $service,
            'coinCost' => $coinCost,
            'isAdmin' => (bool) $isStaff,
            'apiUrl' => $isStaff ? Setting::get('ration_to_aadhar_all_state_api_url', 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_to_uid_all.php') : null,
            'apiKey' => $isStaff ? Setting::get('ration_to_aadhar_all_state_api_key', Setting::get('aadhar_to_ration_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1')) : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'ration_no'  => ['required', 'string', 'min:4', 'max:35'],
            'statecode'  => ['required', 'string', 'max:5'],
        ], [
            'ration_no.required'  => 'Please enter a valid Ration Card Number.',
            'statecode.required'  => 'Please select a State / State Code.',
        ]);

        $service = Service::where('slug', 'ration-to-aadhar-all-state')->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 119;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet."
            ]);
        }

        $cleanRationNo = trim($request->input('ration_no'));
        $stateCode = trim($request->input('statecode'));

        $baseUrl = trim(Setting::get('ration_to_aadhar_all_state_api_url', 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_to_uid_all.php'));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_to_uid_all.php';
        }

        $apiKey = trim(Setting::get('ration_to_aadhar_all_state_api_key', Setting::get('aadhar_to_ration_api_key', Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1'))));

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'API Key is not configured. Please enter your API key in Admin API Settings.'
            ]);
        }

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{ration_no}') || str_contains($baseUrl, '{statecode}')) {
            $url = str_replace(
                ['{apiKey}', '{ration_no}', '{statecode}'],
                [urlencode($apiKey), urlencode($cleanRationNo), urlencode($stateCode)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . "apiKey=" . urlencode($apiKey) . "&ration_no=" . urlencode($cleanRationNo) . "&statecode=" . urlencode($stateCode);
        }

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept'     => 'application/json, text/plain, */*',
            ])->connectTimeout(10)->timeout(40)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                if (!is_array($data)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid response from Ration server.'
                    ]);
                }

                $status = $data['status'] ?? ($data['Status'] ?? null);
                $code = $data['code'] ?? ($data['StatusCode'] ?? null);

                $isSuccess = ($status === true || strtolower((string)$status) === 'success') || (int)$code === 200 || (int)$code === 100;

                // Extract members or records
                $payload = $data['data'] ?? ($data['members'] ?? ($data['result'] ?? ($data['member_list'] ?? [])));
                
                // If payload is a wrapper object
                if (is_array($payload) && isset($payload['members']) && is_array($payload['members'])) {
                    $rawMembers = $payload['members'];
                } elseif (is_array($payload) && isset($payload['data']) && is_array($payload['data'])) {
                    $rawMembers = $payload['data'];
                } elseif (is_array($payload)) {
                    $rawMembers = $payload;
                } else {
                    $rawMembers = [];
                }

                // If success or members exist
                if ($isSuccess || count($rawMembers) > 0) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "Ration to Aadhaar All State: {$cleanRationNo} (State: {$stateCode})");
                    }

                    // Format members
                    $cleanedMembers = [];
                    foreach ($rawMembers as $idx => $m) {
                        if (!is_array($m)) continue;

                        $mName = $m['member_name'] ?? ($m['name'] ?? ($m['MemberName'] ?? ($m['Name'] ?? 'Member ' . ($idx + 1))));
                        $mUid = $m['uid'] ?? ($m['aadhar'] ?? ($m['aadhaar'] ?? ($m['uid_no'] ?? ($m['aadhar_no'] ?? ($m['Aadhar'] ?? ($m['UID'] ?? 'N/A'))))));
                        $mRelation = $m['relation'] ?? ($m['relationship'] ?? ($m['Relation'] ?? ($m['RelationName'] ?? 'Family Member')));
                        $mGender = $m['gender'] ?? ($m['Gender'] ?? 'N/A');
                        $mFather = $m['father_name'] ?? ($m['husband_name'] ?? ($m['FatherName'] ?? ($m['father_husband_name'] ?? '')));
                        $mStatus = $m['uid_status'] ?? ($m['status'] ?? ($m['Status'] ?? 'Active / Verified'));

                        $cleanedMembers[] = [
                            'name' => trim((string)$mName),
                            'uid' => trim((string)$mUid),
                            'relation' => trim((string)$mRelation),
                            'gender' => trim((string)$mGender),
                            'father_husband' => trim((string)$mFather),
                            'status' => trim((string)$mStatus),
                            'raw' => $m,
                        ];
                    }

                    $headName = $payload['head_name'] ?? ($data['head_name'] ?? ($cleanedMembers[0]['name'] ?? 'N/A'));
                    $district = $payload['district'] ?? ($data['district'] ?? ($data['district_name'] ?? 'N/A'));
                    $fpsName = $payload['fps_name'] ?? ($data['fps_name'] ?? ($data['dealer_name'] ?? 'N/A'));
                    $scheme = $payload['scheme'] ?? ($data['scheme'] ?? ($data['card_type'] ?? 'NFSA / State PDS'));

                    try {
                        ServiceRequest::create([
                            'user_id' => $user->id,
                            'service_id' => $service ? $service->id : null,
                            'service_name' => $service ? $service->name : 'Ration to Aadhaar Find All State',
                            'input_data' => [
                                'Ration Card Number' => $cleanRationNo,
                                'State Code' => $stateCode,
                                'Total Members Found' => count($cleanedMembers),
                            ],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status' => ServiceRequest::STATUS_COMPLETED,
                            'completed_at' => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest create error in RationToAadharAllState: ' . $logEx->getMessage());
                    }

                    return response()->json([
                        'success' => true,
                        'ration_no' => $cleanRationNo,
                        'statecode' => $stateCode,
                        'head_name' => $headName,
                        'district' => $district,
                        'fps_name' => $fpsName,
                        'scheme' => $scheme,
                        'members' => $cleanedMembers,
                        'raw_data' => $data,
                        'message' => $data['message'] ?? 'Ration card Aadhaar details found successfully!'
                    ]);
                }

                $errMsg = $data['message'] ?? 'Ration card details not found for this State.';
                return response()->json([
                    'success' => false,
                    'message' => $errMsg
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to Ration service provider. HTTP Code: ' . $response->status()
            ]);

        } catch (\Throwable $e) {
            Log::error('RationToAadharAllState Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Connection timeout or server error. Please try again later.'
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

        Setting::set('ration_to_aadhar_all_state_api_url', trim($request->input('api_url')));
        if ($request->filled('api_key')) {
            Setting::set('ration_to_aadhar_all_state_api_key', trim($request->input('api_key')));
        }

        return response()->json([
            'success' => true,
            'message' => 'Ration to Aadhaar All State API settings saved successfully!'
        ]);
    }
}
