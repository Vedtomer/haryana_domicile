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
        $service = Service::where('slug', 'mobile-to-info')
            ->orWhere('slug', 'mobile-number-to-info')
            ->orWhere('module_key', 'mobile_to_info')
            ->first();
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }
        $coinCost = $service ? $service->coin_cost : 99;

        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        $defaultApiUrl = 'https://infoking.online/Number_infoapi.php';
        $defaultApiKey = '';

        return Inertia::render('Utilities/MobileToInfo', [
            'coinCost' => $coinCost,
            'service' => $service,
            'isAdmin' => (bool) $isStaff,
            'apiUrl' => $isStaff ? Setting::get('mobile_to_info_api_url', $defaultApiUrl) : null,
            'apiKey' => $isStaff ? Setting::get('mobile_to_info_api_key', $defaultApiKey) : null,
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

        $service = Service::where('slug', 'mobile-to-info')
            ->orWhere('slug', 'mobile-number-to-info')
            ->orWhere('module_key', 'mobile_to_info')
            ->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 99;
        $isStaff = $user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']);

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coin balance. This service requires {$coinCost} coins. Please recharge your wallet.",
            ]);
        }

        $cleanMobile = preg_replace('/\D/', '', $request->input('mobile'));
        $defaultApiUrl = 'https://infoking.online/Number_infoapi.php';
        $defaultApiKey = '';

        $rawUrl = trim(Setting::get('mobile_to_info_api_url') ?: $defaultApiUrl);
        $apiKey = trim(Setting::get('mobile_to_info_api_key') ?: $defaultApiKey);

        // Auto-migrate legacy URLs to Infoking
        if (str_contains($rawUrl, 'osint-apis-hub') || str_contains($rawUrl, 'apinice.in')) {
            $rawUrl = $defaultApiUrl;
            $apiKey = $defaultApiKey;
            Setting::set('mobile_to_info_api_url', $rawUrl);
            Setting::set('mobile_to_info_api_key', $apiKey);
        }

        $mobileWithPrefix = (strlen($cleanMobile) === 10) ? ('91' . $cleanMobile) : $cleanMobile;

        if (str_contains($rawUrl, '{key}') || str_contains($rawUrl, '{apiKey}') || str_contains($rawUrl, '{q}') || str_contains($rawUrl, '{mobile}') || str_contains($rawUrl, '{number}') || str_contains($rawUrl, '{num}')) {
            $apiUrl = str_replace(
                ['{num}', '{key}', '{apiKey}', '{q}', '{mobile}', '{number}'],
                [urlencode($cleanMobile), urlencode($apiKey), urlencode($apiKey), urlencode($mobileWithPrefix), urlencode($cleanMobile), urlencode($cleanMobile)],
                $rawUrl
            );
        } else {
            if (preg_match('/([?&]num=)[^&]*/', $rawUrl)) {
                $apiUrl = preg_replace('/([?&]num=)[^&]*/', '$1' . urlencode($cleanMobile), $rawUrl);
            } elseif (preg_match('/([?&]number=)[^&]*/', $rawUrl)) {
                $apiUrl = preg_replace('/([?&]number=)[^&]*/', '$1' . urlencode($cleanMobile), $rawUrl);
            } elseif (preg_match('/([?&]mobile=)[^&]*/', $rawUrl)) {
                $apiUrl = preg_replace('/([?&]mobile=)[^&]*/', '$1' . urlencode($cleanMobile), $rawUrl);
            } elseif (preg_match('/([?&]q=)[^&]*/', $rawUrl)) {
                $apiUrl = preg_replace('/([?&]q=)[^&]*/', '$1' . urlencode($cleanMobile), $rawUrl);
            } else {
                $separator = str_contains($rawUrl, '?') ? '&' : '?';
                $apiUrl = $rawUrl . $separator . "num=" . urlencode($cleanMobile);
            }
        }

        try {
            $response = Http::withoutVerifying()->connectTimeout(10)->timeout(35)->get($apiUrl);

            if ($response->successful()) {
                $data = $response->json();

                // Check for explicit error responses or false status
                if (isset($data['status']) && ($data['status'] === false || $data['status'] === 'false' || $data['status'] === 0)) {
                    $errMsg = $data['error'] ?? ($data['message'] ?? ('No records found for mobile number ' . $cleanMobile . '.'));
                    return response()->json([
                        'success' => false,
                        'message' => $errMsg,
                    ]);
                }

                // Check for API-level status codes indicating errors (e.g. apinice {"status":"101", ...})
                if (isset($data['status']) && is_numeric($data['status']) && (int) $data['status'] !== 200 && empty($data['success'])) {
                    $errMsg = $data['error'] ?? ($data['message'] ?? 'Gateway returned an error.');
                    return response()->json([
                        'success' => false,
                        'message' => $errMsg,
                    ]);
                }

                if (isset($data['success']) && $data['success'] === false) {
                    return response()->json([
                        'success' => false,
                        'message' => $data['error'] ?? ($data['message'] ?? ('No records found for mobile number ' . $cleanMobile . '.')),
                    ]);
                }

                $rawResults = [];
                // Support OSINT num-info data.main_records and data.alternative_records
                if (isset($data['data']) && is_array($data['data'])) {
                    if (isset($data['data']['main_records']) || isset($data['data']['alternative_records'])) {
                        $main = is_array($data['data']['main_records'] ?? null) ? $data['data']['main_records'] : [];
                        $alt = is_array($data['data']['alternative_records'] ?? null) ? $data['data']['alternative_records'] : [];
                        $rawResults = array_merge($main, $alt);
                    } elseif (isset($data['data']['fields']) && is_array($data['data']['fields'])) {
                        $fields = $data['data']['fields'];
                        $rawResults = (isset($fields[0]) && is_array($fields[0])) ? $fields : [$fields];
                    } elseif (isset($data['data'][0]) && is_array($data['data'][0])) {
                        $rawResults = $data['data'];
                    } elseif (isset($data['data']['name']) || isset($data['data']['full_name']) || isset($data['data']['address'])) {
                        $rawResults = [$data['data']];
                    }
                } elseif (isset($data['results']) && is_array($data['results'])) {
                    $rawResults = $data['results'];
                } elseif (is_array($data)) {
                    // Support Infoking top-level array/object: {"0": {...}, "1": {...}, "Devloper": "...", "Tg": "..."}
                    foreach ($data as $k => $v) {
                        if (is_array($v) && (!empty($v['NAME']) || !empty($v['name']) || !empty($v['ADDRESS']) || !empty($v['address']) || !empty($v['CIRCLE']) || !empty($v['circle']))) {
                            $rawResults[] = $v;
                        } elseif (is_numeric($k) && is_array($v)) {
                            $rawResults[] = $v;
                        }
                    }
                    if (empty($rawResults) && isset($data[0]) && is_array($data[0])) {
                        $rawResults = $data;
                    }
                }

                // Filter out empty records
                $validRecords = [];
                foreach ($rawResults as $item) {
                    if (!is_array($item)) continue;
                    $hasAnyField = !empty($item['name']) || !empty($item['full_name']) || !empty($item['fname'])
                        || !empty($item['NAME']) || !empty($item['FNAME'])
                        || !empty($item['father_name']) || !empty($item['the_name_of_the_father'])
                        || !empty($item['address']) || !empty($item['ADDRESS'])
                        || !empty($item['circle']) || !empty($item['CIRCLE']) || !empty($item['region'])
                        || !empty($item['document_number']) || !empty($item['passport_number'])
                        || !empty($item['aadhar']) || !empty($item['aadhaar']) || !empty($item['AADHAAR'])
                        || !empty($item['phone']) || !empty($item['mobile']) || !empty($item['NUMBER']) || !empty($item['number']);
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
                        $cleanAddress = !empty($addressParts) ? implode(', ', $addressParts) : (!empty($addressRaw) ? trim((string) $addressRaw) : 'N/A');
                        $cleanAddress = preg_replace('/[,\s]+,[,\s]*/', ', ', $cleanAddress);
                        $cleanAddress = trim($cleanAddress, ", \t\n\r\0\x0B");
                        if ($cleanAddress === '') {
                            $cleanAddress = 'N/A';
                        }

                        $altNum = trim((string) ($item['alternate'] ?? ($item['alt'] ?? ($item['ALT'] ?? ''))));
                        if (in_array(strtoupper($altNum), ['NA', 'NULL', 'NONE', '0', 'N/A', ''])) {
                            $altNum = null;
                        }

                        // Check Aadhaar / Document / Passport number
                        $aadharNum = !empty($item['document_number']) ? trim((string) $item['document_number'])
                            : (!empty($item['passport_number']) ? trim((string) $item['passport_number'])
                            : (!empty($item['aadhar']) ? trim((string) $item['aadhar'])
                            : (!empty($item['aadhaar']) ? trim((string) $item['aadhaar'])
                            : (!empty($item['AADHAAR']) ? trim((string) $item['AADHAAR']) : ''))));
                        if (in_array(strtoupper((string) $aadharNum), ['NA', 'NULL', 'NONE', '0', 'N/A', ''])) {
                            $aadharNum = null;
                        }
                        if (!$aadharNum && !empty($item['id'])) {
                            $idVal = trim((string) $item['id']);
                            if (!in_array(strtoupper($idVal), ['NA', 'NULL', 'NONE', '0', 'N/A', ''])) {
                                $aadharNum = $idVal;
                            }
                        }

                        $emailVal = trim((string) ($item['email'] ?? ($item['EMAIL'] ?? '')));
                        if (in_array(strtoupper($emailVal), ['NA', 'NULL', 'NONE', '0', 'N/A', ''])) {
                            $emailVal = null;
                        }

                        $fatherVal = !empty($item['the_name_of_the_father']) ? trim((string) $item['the_name_of_the_father'])
                            : (!empty($item['father_name']) ? trim((string) $item['father_name'])
                            : (!empty($item['fname']) ? trim((string) $item['fname'])
                            : (!empty($item['FNAME']) ? trim((string) $item['FNAME']) : 'N/A')));
                        $fatherVal = trim($fatherVal, " \t\n\r\0\x0B\"'");

                        $nameVal = !empty($item['full_name']) ? trim((string) $item['full_name'])
                            : (!empty($item['name']) ? trim((string) $item['name'])
                            : (!empty($item['NAME']) ? trim((string) $item['NAME']) : 'N/A'));
                        $nameVal = trim($nameVal, " \t\n\r\0\x0B\"'");

                        $circleVal = !empty($item['region']) ? trim((string) $item['region'])
                            : (!empty($item['circle']) ? trim((string) $item['circle'])
                            : (!empty($item['CIRCLE']) ? trim((string) $item['CIRCLE']) : 'N/A'));

                        // Clean phone number (strip leading 91 if 12 digits so 10-digit is displayed)
                        $phoneRaw = !empty($item['phone']) ? trim((string) $item['phone'])
                            : (!empty($item['mobile']) ? trim((string) $item['mobile'])
                            : (!empty($item['NUMBER']) ? trim((string) $item['NUMBER'])
                            : (!empty($item['number']) ? trim((string) $item['number']) : $cleanMobile)));
                        $phoneDigits = preg_replace('/\D/', '', $phoneRaw);
                        if (strlen($phoneDigits) === 12 && str_starts_with($phoneDigits, '91')) {
                            $phoneDisplay = substr($phoneDigits, 2);
                        } elseif (strlen($phoneDigits) === 10) {
                            $phoneDisplay = $phoneDigits;
                        } else {
                            $phoneDisplay = !empty($phoneDigits) ? $phoneDigits : $cleanMobile;
                        }

                        $cleanedRecords[] = [
                            'mobile' => $phoneDisplay,
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
                            'service_name' => $service ? $service->name : 'Mobile Number to Info',
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
                    'message' => $data['error'] ?? ($data['message'] ?? ('No records found for mobile number ' . $cleanMobile . '.')),
                ]);
            }

            $errMsg = 'Gateway returned status code: ' . $response->status();
            $errBody = $response->json();
            if (isset($errBody['error'])) {
                $errMsg = $errBody['error'];
            } elseif (isset($errBody['message'])) {
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
