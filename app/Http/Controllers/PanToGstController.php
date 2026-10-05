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

class PanToGstController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'pan-to-gst')
            ->orWhere('slug', 'pan-to-gst-number')
            ->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 19;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/PanToGst', [
            'service'  => $service,
            'coinCost' => $coinCost,
            'isAdmin'  => (bool) $isStaff,
            'apiUrl'   => $isStaff ? Setting::get('pan_to_gst_api_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_gst.php') : null,
            'apiKey'   => $isStaff ? Setting::get('pan_to_gst_api_key', Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1')) : null,
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

        $service = Service::where('slug', 'pan-to-gst')
            ->orWhere('slug', 'pan-to-gst-number')
            ->first();
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

        $baseUrl = trim(Setting::get('pan_to_gst_api_url', 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_gst.php'));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_gst.php';
        }

        $apiKey = trim(Setting::get('pan_to_gst_api_key', Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1')));

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'API Key is not configured. Please enter your API key in Admin API Settings.'
            ]);
        }

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{pan}')) {
            $url = str_replace(
                ['{apiKey}', '{pan}'],
                [urlencode($apiKey), urlencode($pan)],
                $baseUrl
            );
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
                        'message' => 'Invalid response from PAN To GST server.'
                    ]);
                }

                $status = $data['status'] ?? ($data['Status'] ?? null);
                $code = $data['code'] ?? ($data['StatusCode'] ?? null);

                $isSuccess = ($status === true || strtolower((string)$status) === 'success') || (int)$code === 200 || (int)$code === 100;

                // Extract list of records
                $rawList = null;
                if (isset($data['data'])) {
                    $rawList = $data['data'];
                } elseif (isset($data['result'])) {
                    $rawList = $data['result'];
                } elseif (isset($data['gst_list'])) {
                    $rawList = $data['gst_list'];
                } elseif (isset($data['gstin_list'])) {
                    $rawList = $data['gstin_list'];
                } else {
                    $rawList = $data;
                }

                $gstRecords = [];
                $primaryGstin = null;
                $legalName = null;
                $tradeName = null;

                if (is_array($rawList)) {
                    $isSequential = array_is_list($rawList) || isset($rawList[0]);
                    if ($isSequential) {
                        foreach ($rawList as $item) {
                            if (is_string($item)) {
                                $gstRecords[] = [
                                    'gstin'             => trim($item),
                                    'legal_name'        => '',
                                    'trade_name'        => '',
                                    'status'            => 'Active',
                                    'state'             => '',
                                    'address'           => '',
                                    'registration_date' => '',
                                    'taxpayer_type'     => '',
                                ];
                                if (!$primaryGstin) $primaryGstin = trim($item);
                            } elseif (is_array($item)) {
                                $itemGstin = $item['gstin'] ?? ($item['gst_number'] ?? ($item['gst_no'] ?? ($item['gst'] ?? ($item['gstin_number'] ?? ''))));
                                $itemLegalName = $item['legal_name'] ?? ($item['legal_name_of_business'] ?? ($item['name'] ?? ($item['business_name'] ?? '')));
                                $itemTradeName = $item['trade_name'] ?? ($item['trade_name_of_business'] ?? ($item['tradeName'] ?? ''));
                                $itemStatus = $item['status'] ?? ($item['gst_status'] ?? ($item['sts'] ?? 'Active'));
                                $itemState = $item['state'] ?? ($item['state_name'] ?? ($item['state_code'] ?? ''));
                                $itemAddress = $item['address'] ?? ($item['principal_place_of_business'] ?? ($item['full_address'] ?? ($item['pradr'] ?? '')));
                                $itemRegDate = $item['registration_date'] ?? ($item['reg_date'] ?? ($item['rgdt'] ?? ''));
                                $itemTaxpayerType = $item['taxpayer_type'] ?? ($item['constitution_of_business'] ?? ($item['dty'] ?? ($item['ctb'] ?? '')));

                                $gstRecords[] = [
                                    'gstin'             => trim((string)$itemGstin),
                                    'legal_name'        => trim((string)$itemLegalName),
                                    'trade_name'        => trim((string)$itemTradeName),
                                    'status'            => trim((string)$itemStatus) ?: 'Active',
                                    'state'             => trim((string)$itemState),
                                    'address'           => trim((string)$itemAddress),
                                    'registration_date' => trim((string)$itemRegDate),
                                    'taxpayer_type'     => trim((string)$itemTaxpayerType),
                                ];
                                if (!$primaryGstin && !empty($itemGstin)) $primaryGstin = trim((string)$itemGstin);
                                if (!$legalName && !empty($itemLegalName)) $legalName = trim((string)$itemLegalName);
                                if (!$tradeName && !empty($itemTradeName)) $tradeName = trim((string)$itemTradeName);
                            }
                        }
                    } else {
                        // Single record object
                        $itemGstin = $rawList['gstin'] ?? ($rawList['gst_number'] ?? ($rawList['gst_no'] ?? ($rawList['gst'] ?? ($data['gstin'] ?? null))));
                        $itemLegalName = $rawList['legal_name'] ?? ($rawList['legal_name_of_business'] ?? ($rawList['name'] ?? ($data['legal_name'] ?? null)));
                        $itemTradeName = $rawList['trade_name'] ?? ($rawList['trade_name_of_business'] ?? ($data['trade_name'] ?? null));
                        $itemStatus = $rawList['status'] ?? ($rawList['gst_status'] ?? ($data['status'] ?? 'Active'));
                        $itemState = $rawList['state'] ?? ($rawList['state_name'] ?? ($data['state'] ?? null));
                        $itemAddress = $rawList['address'] ?? ($rawList['principal_place_of_business'] ?? ($rawList['full_address'] ?? ($data['address'] ?? null)));
                        $itemRegDate = $rawList['registration_date'] ?? ($rawList['reg_date'] ?? ($data['registration_date'] ?? null));
                        $itemTaxpayerType = $rawList['taxpayer_type'] ?? ($rawList['constitution_of_business'] ?? ($data['taxpayer_type'] ?? null));

                        if (!empty($itemGstin) || !empty($itemLegalName)) {
                            $gstRecords[] = [
                                'gstin'             => trim((string)$itemGstin),
                                'legal_name'        => trim((string)$itemLegalName),
                                'trade_name'        => trim((string)$itemTradeName),
                                'status'            => trim((string)$itemStatus) ?: 'Active',
                                'state'             => trim((string)$itemState),
                                'address'           => trim((string)$itemAddress),
                                'registration_date' => trim((string)$itemRegDate),
                                'taxpayer_type'     => trim((string)$itemTaxpayerType),
                            ];
                            $primaryGstin = trim((string)$itemGstin);
                            $legalName = trim((string)$itemLegalName);
                            $tradeName = trim((string)$itemTradeName);
                        }
                    }
                }

                // If success and we have GST records or a primary GSTIN
                if ($isSuccess && (!empty($gstRecords) || !empty($primaryGstin) || !empty($legalName))) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "PAN To GST Number: {$pan}");
                    }

                    try {
                        ServiceRequest::create([
                            'user_id'       => $user->id,
                            'service_id'    => $service ? $service->id : null,
                            'service_name'  => $service ? $service->name : 'PAN To GST Number Instant',
                            'input_data'    => [
                                'PAN Number'    => $pan,
                                'GST Records'   => count($gstRecords),
                                'Primary GSTIN' => $primaryGstin,
                                'Legal Name'    => $legalName,
                            ],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status'        => ServiceRequest::STATUS_COMPLETED,
                            'completed_at'  => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest create error in PanToGst: ' . $logEx->getMessage());
                    }

                    return response()->json([
                        'success' => true,
                        'data'    => [
                            'pan'        => $pan,
                            'gstin'      => $primaryGstin,
                            'legal_name' => $legalName,
                            'trade_name' => $tradeName,
                            'total_gst'  => count($gstRecords),
                            'records'    => $gstRecords,
                        ],
                        'raw_data' => $data,
                        'message'  => $data['message'] ?? 'GST details retrieved successfully.',
                    ]);
                }

                $errorMsg = $data['message'] ?? 'No GST registrations found for this PAN number.';
                if (str_contains(strtolower($errorMsg), 'non-json response') || str_contains(strtolower($errorMsg), 'third-party')) {
                    $errorMsg = 'No active GST registrations found for this PAN number or provider is busy. Please verify the PAN.';
                }

                return response()->json([
                    'success' => false,
                    'message' => $errorMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to the GST service provider. HTTP Status: ' . $response->status(),
            ]);

        } catch (\Throwable $e) {
            Log::error('PanToGst Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with external GST server. Please try again.',
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
        Setting::set('pan_to_gst_api_url', $url);

        if ($request->filled('api_key')) {
            $key = trim($request->input('api_key'));
            Setting::set('pan_to_gst_api_key', $key);
        }

        return response()->json([
            'success' => true,
            'message' => 'PAN to GST API settings saved successfully!'
        ]);
    }
}
