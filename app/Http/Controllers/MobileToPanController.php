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

class MobileToPanController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'mobile-to-pan')->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 99;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/MobileToPan', [
            'service'  => $service,
            'coinCost' => $coinCost,
            'isAdmin'  => (bool) $isStaff,
            'apiUrl'   => $isStaff ? Setting::get('mobile_to_pan_api_url', Setting::get('nexus_mobile_to_pan_url', 'https://good-api-point.com/apis_partner/v1/telecom_api/mobile_to_pan.php')) : null,
            'apiKey'   => $isStaff ? Setting::get('mobile_to_pan_api_key', Setting::get('nexus_mobile_to_pan_key', Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1'))) : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'mobile_number' => ['required', 'string', 'size:10', 'regex:/^[0-9]{10}$/'],
            'first_name'    => ['required', 'string', 'min:1'],
            'last_name'     => ['required', 'string', 'min:1'],
        ], [
            'mobile_number.required' => 'Please enter a valid 10-digit mobile number.',
            'first_name.required'    => 'Please enter the First Name.',
            'last_name.required'     => 'Please enter the Last Name.',
        ]);

        $service = Service::where('slug', 'mobile-to-pan')->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 99;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet."
            ]);
        }

        $mobile = trim($request->input('mobile_number'));
        $firstName = trim($request->input('first_name'));
        $lastName = trim($request->input('last_name'));

        $baseUrl = trim(Setting::get('mobile_to_pan_api_url', Setting::get('nexus_mobile_to_pan_url', 'https://good-api-point.com/apis_partner/v1/telecom_api/mobile_to_pan.php')));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/telecom_api/mobile_to_pan.php';
        }

        $apiKey = trim(Setting::get('mobile_to_pan_api_key', Setting::get('goodapi_api_key', Setting::get('nexus_mobile_to_pan_key', Setting::get('nexus_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1')))));

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'API Key is not configured. Please enter your API key in Admin API Settings.'
            ]);
        }

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{mobile}') || str_contains($baseUrl, '{first_name}')) {
            $url = str_replace(
                ['{apiKey}', '{mobile}', '{mobile_number}', '{first_name}', '{last_name}'],
                [urlencode($apiKey), urlencode($mobile), urlencode($mobile), urlencode($firstName), urlencode($lastName)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . "apiKey=" . urlencode($apiKey) . "&mobile_number=" . urlencode($mobile) . "&first_name=" . urlencode($firstName) . "&last_name=" . urlencode($lastName);
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
                        'message' => 'Invalid response from Mobile To PAN server.'
                    ]);
                }

                // Check for PAN in nested data or root
                $pan = $data['data']['pan'] ?? ($data['pan'] ?? null);
                $name = $data['data']['name'] ?? ($data['name'] ?? null);
                $dob = $data['data']['dob'] ?? ($data['dob'] ?? null);
                $gender = $data['data']['gender'] ?? ($data['gender'] ?? null);

                $status = $data['status'] ?? ($data['Status'] ?? null);
                $code = $data['code'] ?? ($data['StatusCode'] ?? null);

                $isSuccess = ($status === true || strtolower((string)$status) === 'success') || (int)$code === 200 || (int)$code === 100;

                if (!empty($pan) && $pan !== 'N/A') {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "Mobile To Pan: {$mobile}");
                    }

                    try {
                        ServiceRequest::create([
                            'user_id'       => $user->id,
                            'service_id'    => $service ? $service->id : null,
                            'service_name'  => $service ? $service->name : 'Mobile To Pan No. Instant',
                            'input_data'    => [
                                'Mobile Number' => $mobile,
                                'First Name'    => $firstName,
                                'Last Name'     => $lastName,
                                'PAN Found'     => strtoupper(trim((string)$pan)),
                            ],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status'        => ServiceRequest::STATUS_COMPLETED,
                            'completed_at'  => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest create error in MobileToPan: ' . $logEx->getMessage());
                    }

                    return response()->json([
                        'success' => true,
                        'data'    => [
                            'pan'           => strtoupper(trim((string)$pan)),
                            'name'          => trim((string)$name),
                            'dob'           => trim((string)$dob),
                            'gender'        => trim((string)$gender),
                            'mobile_number' => $mobile,
                            'first_name'    => $firstName,
                            'last_name'     => $lastName,
                        ],
                        'message' => $data['message'] ?? 'PAN Details found successfully.',
                    ]);
                }

                $errorMsg = $data['message'] ?? 'PAN Details not found for this Mobile Number and Name combination.';
                if (str_contains(strtolower($errorMsg), 'insufficient balance')) {
                    $errorMsg = 'API provider balance is currently low. Please contact administrator or try again later.';
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
            Log::error('MobileToPan Error: ' . $e->getMessage());
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
        Setting::set('mobile_to_pan_api_url', $url);
        Setting::set('nexus_mobile_to_pan_url', $url);

        if ($request->filled('api_key')) {
            $key = trim($request->input('api_key'));
            Setting::set('mobile_to_pan_api_key', $key);
            Setting::set('nexus_mobile_to_pan_key', $key);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mobile To PAN API settings saved successfully!'
        ]);
    }
}

