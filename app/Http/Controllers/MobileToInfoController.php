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

class MobileToInfoController extends Controller
{
    public function index()
    {
        $service = Service::where('slug', 'mobile-to-info')->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        $coinCost = $service ? $service->coin_cost : 149;

        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/MobileToInfo', [
            'coinCost' => $coinCost,
            'service' => $service,
            'isAdmin' => (bool) $isStaff,
            'apiUrl' => $isStaff ? Setting::get('mobile_to_info_api_url', 'https://apinice.in/api/v1/mobile_number_info?apiKey=Y3VK89K8V8&mobile=9876543210') : null,
            'apiKey' => $isStaff ? Setting::get('mobile_to_info_api_key', 'Y3VK89K8V8') : null,
        ]);
    }

    public function updateApi(Request $request)
    {
        $user = auth()->user();
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));
        if (!$isStaff) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action. Only admins can configure API settings.',
            ], 403);
        }

        $request->validate([
            'api_url' => ['required', 'string'],
            'api_key' => ['nullable', 'string'],
        ], [
            'api_url.required' => 'Please enter the API URL.',
        ]);

        $url = trim($request->input('api_url'));
        $key = trim((string) $request->input('api_key', ''));

        Setting::set('mobile_to_info_api_url', $url);
        Setting::set('mobile_to_info_api_key', $key);

        return response()->json([
            'success' => true,
            'message' => 'Mobile to Info API configuration successfully saved!',
            'api_url' => $url,
            'api_key' => $key,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'mobile' => ['required', 'string', 'regex:/^[0-9]{10}$/'],
        ], [
            'mobile.required' => 'Please enter a 10-digit mobile number.',
            'mobile.regex' => 'Mobile number must be exactly 10 numerical digits.',
        ]);

        $service = Service::where('slug', 'mobile-to-info')->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 149;
        $isStaff = $user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']);

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coin balance. This service requires {$coinCost} coins. Please recharge your wallet.",
            ]);
        }

        $cleanMobile = preg_replace('/\D/', '', $request->input('mobile'));
        $rawUrl = trim(Setting::get('mobile_to_info_api_url') ?: 'https://apinice.in/api/v1/mobile_number_info?apiKey=Y3VK89K8V8&mobile=9876543210');
        $apiKey = trim(Setting::get('mobile_to_info_api_key') ?: 'Y3VK89K8V8');

        if (str_contains($rawUrl, '{key}') || str_contains($rawUrl, '{apiKey}') || str_contains($rawUrl, '{q}') || str_contains($rawUrl, '{mobile}') || str_contains($rawUrl, '{number}')) {
            $apiUrl = str_replace(
                ['{key}', '{apiKey}', '{q}', '{mobile}', '{number}'],
                [urlencode($apiKey), urlencode($apiKey), urlencode($cleanMobile), urlencode($cleanMobile), urlencode($cleanMobile)],
                $rawUrl
            );
        } else {
            $parts = parse_url($rawUrl);
            $query = [];
            if (!empty($parts['query'])) {
                parse_str($parts['query'], $query);
            }

            // Update API key in query
            if (isset($query['apiKey'])) {
                $query['apiKey'] = !empty($apiKey) ? $apiKey : $query['apiKey'];
            } elseif (isset($query['key'])) {
                $query['key'] = !empty($apiKey) ? $apiKey : $query['key'];
            } elseif (!empty($apiKey)) {
                $query['apiKey'] = $apiKey;
            }

            // Update mobile in query
            if (isset($query['mobile'])) {
                $query['mobile'] = $cleanMobile;
            } elseif (isset($query['q'])) {
                $query['q'] = $cleanMobile;
            } else {
                $query['mobile'] = $cleanMobile;
            }

            $scheme = isset($parts['scheme']) ? $parts['scheme'] . '://' : 'https://';
            $host = $parts['host'] ?? '';
            $port = isset($parts['port']) ? ':' . $parts['port'] : '';
            $path = $parts['path'] ?? '';
            $apiUrl = $scheme . $host . $port . $path . '?' . http_build_query($query);
        }

        try {
            $response = Http::connectTimeout(10)->timeout(30)->get($apiUrl);

            if ($response->successful()) {
                $data = $response->json();

                // Check for API-level status codes indicating errors (e.g. apinice {"status":"101", ...})
                if (isset($data['status']) && $data['status'] != '200' && empty($data['success'])) {
                    $errMsg = $data['message'] ?? 'Gateway returned an error.';
                    return response()->json([
                        'success' => false,
                        'message' => $errMsg,
                    ]);
                }

                if (isset($data['success']) && $data['success'] === false) {
                    return response()->json([
                        'success' => false,
                        'message' => $data['message'] ?? ('No records found for mobile number ' . $cleanMobile . '.'),
                    ]);
                }

                $rawResults = [];
                // Support apinice data.fields structure
                if (isset($data['data']['fields']) && is_array($data['data']['fields'])) {
                    $fields = $data['data']['fields'];
                    if (isset($fields[0]) && is_array($fields[0])) {
                        $rawResults = $fields;
                    } else {
                        $rawResults = [$fields];
                    }
                } elseif (isset($data['data']) && is_array($data['data'])) {
                    if (isset($data['data'][0]) && is_array($data['data'][0])) {
                        $rawResults = $data['data'];
                    } elseif (isset($data['data']['name']) || isset($data['data']['address']) || isset($data['data']['circle'])) {
                        $rawResults = [$data['data']];
                    }
                } elseif (isset($data['results']) && is_array($data['results'])) {
                    $rawResults = $data['results'];
                } elseif (is_array($data) && isset($data[0])) {
                    $rawResults = $data;
                }

                // Filter out empty records
                $validRecords = [];
                foreach ($rawResults as $item) {
                    if (!is_array($item)) continue;
                    $hasAnyField = !empty($item['name']) || !empty($item['fname']) || !empty($item['father_name']) || !empty($item['address']) || !empty($item['ADDRESS']) || !empty($item['circle']);
                    if ($hasAnyField) {
                        $validRecords[] = $item;
                    }
                }

                if (!empty($validRecords)) {
                    // Deduct coins only for regular users
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "Mobile to Info: {$cleanMobile}");
                    }

                    // Format and clean records
                    $cleanedRecords = [];
                    foreach ($validRecords as $item) {
                        $addressRaw = $item['address'] ?? ($item['ADDRESS'] ?? '');
                        $addressParts = array_values(array_filter(array_map('trim', explode('!', (string) $addressRaw))));
                        $cleanAddress = !empty($addressParts) ? implode(', ', $addressParts) : 'N/A';

                        $altNum = $item['alternate'] ?? ($item['alt'] ?? null);
                        if ($altNum && in_array(strtoupper(trim((string) $altNum)), ['NA', 'NULL', 'NONE', '0', 'N/A'])) {
                            $altNum = null;
                        }

                        // Check Aadhaar / ID number
                        $aadharNum = $item['aadhar'] ?? ($item['aadhaar'] ?? null);
                        if (!$aadharNum && !empty($item['id'])) {
                            $idVal = trim((string) $item['id']);
                            if (!in_array(strtoupper($idVal), ['NA', 'NULL', 'NONE', '0', 'N/A'])) {
                                $aadharNum = $idVal;
                            }
                        }

                        $emailVal = $item['email'] ?? null;
                        if ($emailVal && in_array(strtoupper(trim((string) $emailVal)), ['NA', 'NULL', 'NONE', '0', 'N/A'])) {
                            $emailVal = null;
                        }

                        $fatherVal = !empty($item['father_name']) ? trim((string) $item['father_name']) : (!empty($item['fname']) ? trim((string) $item['fname']) : 'N/A');
                        $fatherVal = trim($fatherVal, " \t\n\r\0\x0B\"'");

                        $nameVal = !empty($item['name']) ? trim((string) $item['name']) : 'N/A';
                        $nameVal = trim($nameVal, " \t\n\r\0\x0B\"'");

                        $circleVal = !empty($item['circle']) ? trim((string) $item['circle']) : 'N/A';

                        $cleanedRecords[] = [
                            'mobile' => !empty($item['mobile']) ? trim((string) $item['mobile']) : $cleanMobile,
                            'name' => $nameVal,
                            'father_name' => $fatherVal,
                            'circle' => $circleVal,
                            'address' => $cleanAddress,
                            'alternate' => $altNum,
                            'aadhar' => $aadharNum,
                            'email' => $emailVal,
                        ];
                    }

                    // Log Service Request
                    try {
                        ServiceRequest::create([
                            'user_id' => $user->id,
                            'service_id' => $service ? $service->id : null,
                            'service_name' => $service ? $service->name : 'Mobile to Info',
                            'input_data' => [
                                'Mobile Number' => $cleanMobile,
                                'Found Records' => count($cleanedRecords),
                                'Primary Name' => $cleanedRecords[0]['name'] ?? '',
                            ],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status' => ServiceRequest::STATUS_COMPLETED,
                            'completed_at' => now(),
                        ]);
                    } catch (\Throwable $e) {
                        Log::error('MobileToInfo ServiceRequest Log Error: ' . $e->getMessage());
                    }

                    return response()->json([
                        'success' => true,
                        'records' => $cleanedRecords,
                        'total' => count($cleanedRecords),
                        'remaining_coins' => $user->fresh()->coins,
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => $data['message'] ?? ('No records found for mobile number ' . $cleanMobile . '.'),
                ]);
            }

            $errMsg = 'Gateway returned status code: ' . $response->status();
            $errBody = $response->json();
            if (isset($errBody['message'])) {
                $errMsg = $errBody['message'];
            }

            return response()->json([
                'success' => false,
                'message' => 'Unable to fetch details from gateway. ' . $errMsg,
            ]);
        } catch (\Throwable $e) {
            Log::error('MobileToInfo search error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to gateway server. Please try again.',
            ]);
        }
    }
}
