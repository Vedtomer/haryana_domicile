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

class VehicleChallanController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'vehicle-challan-check')
            ->orWhere('slug', 'challan-check')
            ->orWhere('slug', 'challan-find')
            ->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 14;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/VehicleChallan', [
            'service'  => $service,
            'coinCost' => $coinCost,
            'isAdmin'  => (bool) $isStaff,
            'apiUrl'   => $isStaff ? Setting::get('vahan_challan_api_url', 'https://good-api-point.com/apis_partner/v1/vahan_service_api/challan_find.php') : null,
            'apiKey'   => $isStaff ? Setting::get('vahan_challan_api_key', Setting::get('goodapi_api_key', 'ff43c0db8b9cdb5869ccac19872ce22936bc8508e8baaa66885aa5ec96289a41')) : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'vehicle_number' => ['required', 'string', 'min:6', 'max:15'],
        ], [
            'vehicle_number.required' => 'Please enter a valid vehicle registration number (e.g. HR26DK8337 or DL1CAB1234).',
        ]);

        $service = Service::where('slug', 'vehicle-challan-check')
            ->orWhere('slug', 'challan-check')
            ->orWhere('slug', 'challan-find')
            ->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 14;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet."
            ]);
        }

        $cleanVehicleNo = strtoupper(trim(preg_replace('/[^A-Za-z0-9]/', '', $request->input('vehicle_number'))));

        $baseUrl = trim(Setting::get('vahan_challan_api_url', 'https://good-api-point.com/apis_partner/v1/vahan_service_api/challan_find.php'));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/vahan_service_api/challan_find.php';
        }

        $apiKey = trim(Setting::get('vahan_challan_api_key', Setting::get('goodapi_api_key', 'ff43c0db8b9cdb5869ccac19872ce22936bc8508e8baaa66885aa5ec96289a41')));

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'API Key is not configured. Please enter your API key in Admin API Settings.'
            ]);
        }

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{vehicle_number}') || str_contains($baseUrl, '{vehicle_no}')) {
            $url = str_replace(
                ['{apiKey}', '{vehicle_number}', '{vehicle_no}'],
                [urlencode($apiKey), urlencode($cleanVehicleNo), urlencode($cleanVehicleNo)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . "apiKey=" . urlencode($apiKey) . "&vehicle_number=" . urlencode($cleanVehicleNo);
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
                        'message' => 'Invalid response received from Challan server.'
                    ]);
                }

                $status = $data['status'] ?? ($data['Status'] ?? null);
                $code = $data['code'] ?? ($data['StatusCode'] ?? null);

                $isSuccess = ($status === true || strtolower((string) $status) === 'success') || (int) $code === 200 || (int) $code === 100;

                // Extract payload
                $payload = $data['data'] ?? ($data['result'] ?? ($data['challans'] ?? $data));

                // Process challans list or single record
                $challansList = [];
                $totalChallans = 0;
                $pendingAmount = 0;
                $paidAmount = 0;

                if (is_array($payload)) {
                    // Check if payload is a list of challans or has a 'challans' key
                    $items = isset($payload['challans']) && is_array($payload['challans']) 
                        ? $payload['challans'] 
                        : (isset($payload[0]) ? $payload : []);

                    if (!empty($items)) {
                        foreach ($items as $item) {
                            if (is_array($item)) {
                                $cNo = $item['challan_number'] ?? ($item['challan_no'] ?? ($item['number'] ?? 'N/A'));
                                $amt = (float) ($item['amount'] ?? ($item['challan_amount'] ?? ($item['fine'] ?? 0)));
                                $cStatus = $item['challan_status'] ?? ($item['status'] ?? 'Pending');
                                
                                if (strcasecmp($cStatus, 'paid') === 0 || strcasecmp($cStatus, 'disposed') === 0) {
                                    $paidAmount += $amt;
                                } else {
                                    $pendingAmount += $amt;
                                }

                                $challansList[] = [
                                    'challan_number' => $cNo,
                                    'date'           => $item['challan_date'] ?? ($item['date_time'] ?? ($item['date'] ?? 'N/A')),
                                    'amount'         => $amt,
                                    'status'         => $cStatus,
                                    'violator_name'  => $item['violator_name'] ?? ($item['accused_name'] ?? ($item['owner_name'] ?? ($item['name'] ?? null))),
                                    'violation'      => $item['offense_details'] ?? ($item['offence'] ?? ($item['violation'] ?? ($item['reason'] ?? 'Traffic Violation'))),
                                    'state'          => $item['state'] ?? ($item['rto'] ?? null),
                                    'court_name'     => $item['court_name'] ?? null,
                                    'receipt_url'    => $item['payment_url'] ?? ($item['receipt_url'] ?? ($item['challan_pdf'] ?? null)),
                                ];
                            }
                        }
                    } elseif (isset($payload['challan_number']) || isset($payload['challan_no'])) {
                        // Single challan object
                        $amt = (float) ($payload['amount'] ?? ($payload['challan_amount'] ?? ($payload['fine'] ?? 0)));
                        $cStatus = $payload['challan_status'] ?? ($payload['status'] ?? 'Pending');
                        if (strcasecmp($cStatus, 'paid') === 0 || strcasecmp($cStatus, 'disposed') === 0) {
                            $paidAmount += $amt;
                        } else {
                            $pendingAmount += $amt;
                        }

                        $challansList[] = [
                            'challan_number' => $payload['challan_number'] ?? ($payload['challan_no'] ?? 'N/A'),
                            'date'           => $payload['challan_date'] ?? ($payload['date_time'] ?? ($payload['date'] ?? 'N/A')),
                            'amount'         => $amt,
                            'status'         => $cStatus,
                            'violator_name'  => $payload['violator_name'] ?? ($payload['accused_name'] ?? ($payload['owner_name'] ?? ($payload['name'] ?? null))),
                            'violation'      => $payload['offense_details'] ?? ($payload['offence'] ?? ($payload['violation'] ?? ($payload['reason'] ?? 'Traffic Violation'))),
                            'state'          => $payload['state'] ?? ($payload['rto'] ?? null),
                            'court_name'     => $payload['court_name'] ?? null,
                            'receipt_url'    => $payload['payment_url'] ?? ($payload['receipt_url'] ?? ($payload['challan_pdf'] ?? null)),
                        ];
                    }
                }

                $totalChallans = count($challansList);

                // If success or valid response:
                // Note: Even if totalChallans == 0, if the vehicle was looked up successfully and has 0 challans, that's a successful verification!
                if ($isSuccess) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "Vehicle Challan Check: {$cleanVehicleNo}");
                    }

                    try {
                        ServiceRequest::create([
                            'user_id'       => $user->id,
                            'service_id'    => $service ? $service->id : null,
                            'service_name'  => $service ? $service->name : 'Vehicle Challan Check',
                            'input_data'    => [
                                'Vehicle Number' => $cleanVehicleNo,
                                'Total Challans' => $totalChallans,
                                'Pending Amount' => $pendingAmount,
                            ],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status'        => ServiceRequest::STATUS_COMPLETED,
                            'completed_at'  => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest create error in VehicleChallan: ' . $logEx->getMessage());
                    }

                    return response()->json([
                        'success'        => true,
                        'vehicle_number' => $cleanVehicleNo,
                        'total_challans' => $totalChallans,
                        'pending_amount' => $pendingAmount,
                        'paid_amount'    => $paidAmount,
                        'challans'       => $challansList,
                        'raw_data'       => $data,
                        'checked_at'     => now()->format('d M Y, h:i A'),
                        'message'        => $totalChallans > 0 
                            ? "Found {$totalChallans} challan(s) for {$cleanVehicleNo}." 
                            : "Clean record! No pending or active challans found for {$cleanVehicleNo}.",
                    ]);
                }

                $errorMsg = $data['message'] ?? 'Unable to find challan details for this vehicle number.';
                if ((int) $code === 101 || $errorMsg === 'Invalid Token' || $errorMsg === 'Invalid API Key') {
                    $errorMsg = 'API Key or Token needs configuration. Please verify your Good-API-Point credentials in Admin API Settings.';
                }

                return response()->json([
                    'success' => false,
                    'message' => $errorMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'External server returned an error (HTTP ' . $response->status() . '). Please try again later.'
            ]);

        } catch (\Throwable $e) {
            Log::error('VehicleChallan Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with Challan server. Please try again.'
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
        Setting::set('vahan_challan_api_url', $url);

        if ($request->filled('api_key')) {
            $key = trim($request->input('api_key'));
            Setting::set('vahan_challan_api_key', $key);
        }

        return response()->json([
            'success' => true,
            'message' => 'Vehicle Challan API settings saved successfully!'
        ]);
    }
}
