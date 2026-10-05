<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PanToUidController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'pan' => ['required', 'string', 'size:10', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i']
        ], [
            'pan.required' => 'Please enter a valid 10-character PAN number.',
            'pan.regex'    => 'Invalid PAN format. Example: ABCDE1234F',
        ]);

        $service = Service::where('slug', 'pan-to-uid-advance')->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 199;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet."
            ]);
        }

        $pan = strtoupper(trim($request->input('pan')));
        $baseUrl = trim(Setting::get('nexus_pan_to_uid_url') ?: Setting::get('pan_to_uid_api_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_uid_s1.php'));
        if (empty($baseUrl) || str_contains($baseUrl, 'nexus-dashboard.space')) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_uid_s1.php';
        }

        $apiKey = trim(Setting::get('pan_to_uid_api_key') ?: Setting::get('goodapi_api_key', Setting::get('nexus_api_key', 'ff43c0db8b9cdb5869ccac19872ce22936bc8508e8baaa66885aa5ec96289a41')));

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'API Key is not configured. Please enter your API key in Admin API Settings.'
            ]);
        }

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{pan}')) {
            $url = str_replace(['{apiKey}', '{pan}'], [urlencode($apiKey), urlencode($pan)], $baseUrl);
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . "apiKey=" . urlencode($apiKey) . "&pan=" . urlencode($pan);
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
                        'message' => 'Invalid response from PAN To UID Advance server.'
                    ]);
                }

                $status = $data['status'] ?? ($data['Status'] ?? null);
                $code = $data['code'] ?? ($data['StatusCode'] ?? null);

                $isSuccess = ($status === true || strtolower((string) $status) === 'success') || (int) $code === 200 || (int) $code === 100;
                $payload = $data['data'] ?? ($data['result'] ?? $data);

                $foundUid = is_array($payload) ? ($payload['uid'] ?? ($payload['aadhar_number'] ?? ($payload['aadhaar_number'] ?? ($payload['aadhar'] ?? ($payload['aadhaar'] ?? ($payload['uid_no'] ?? null)))))) : null;

                if ($isSuccess || !empty($foundUid)) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'PAN To UID Advance: ' . $pan);
                    }

                    try {
                        ServiceRequest::create([
                            'user_id'       => $user->id,
                            'service_id'    => $service ? $service->id : null,
                            'service_name'  => $service ? $service->name : 'Pan To Uid Advance Instant',
                            'input_data'    => ['PAN Number' => $pan],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status'        => ServiceRequest::STATUS_COMPLETED,
                            'completed_at'  => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest create error in PanToUid: ' . $logEx->getMessage());
                    }

                    return response()->json([
                        'success' => true,
                        'data'    => $payload,
                        'message' => $data['message'] ?? 'Details found successfully.',
                    ]);
                }

                $errorMsg = $data['message'] ?? 'Details not found for this PAN number.';
                if ((int) $code === 101 || $errorMsg === 'Invalid API Key') {
                    $errorMsg = $data['message'] ?? 'PAN does not exist or invalid response.';
                }

                return response()->json([
                    'success' => false,
                    'message' => $errorMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Details not found for this PAN number.',
            ]);

        } catch (\Throwable $e) {
            Log::error('PanToUid error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with the external server.',
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
        Setting::set('nexus_pan_to_uid_url', $url);
        Setting::set('pan_to_uid_api_url', $url);

        if ($request->filled('api_key')) {
            $key = trim($request->input('api_key'));
            Setting::set('pan_to_uid_api_key', $key);
        }

        return response()->json([
            'success' => true,
            'message' => 'PAN to UID Advance API settings saved successfully!'
        ]);
    }
}
