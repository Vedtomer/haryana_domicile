<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AadharToPanController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'aadhar' => ['required', 'string', 'regex:/^[0-9]{12}$/']
        ], [
            'aadhar.required' => 'Please enter a 12-digit Aadhaar number.',
            'aadhar.regex' => 'Aadhaar number must be exactly 12 numeric digits.'
        ]);

        $service = Service::where('slug', 'aadhar-to-pan')->first();
        $user = auth()->user();
        
        $coinCost = $service ? (int) $service->coin_cost : 69;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet."
            ]);
        }

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar'));
        
        $baseUrl = trim(Setting::get('aadhar_to_pan_api_url') ?: Setting::get('nexus_aadhar_to_pan_url', ''));
        if (empty($baseUrl) || str_contains($baseUrl, 'nexus-dashboard.space')) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhaar_to_unmasked_pan.php';
        }

        $apiKey = trim(Setting::get('aadhar_to_pan_api_key') ?: 
            Setting::get('aadhar_to_mask_pan_api_key', 
            Setting::get('goodapi_api_key', 
            Setting::get('aadhar_to_name_api_key', 
            Setting::get('aadhar_to_npci_api_key', 
            Setting::get('nexus_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815'))))));

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'API Key is not configured. Please enter your API key in Admin API Settings.'
            ]);
        }

        // Replace placeholders if present
        if (str_contains($baseUrl, 'ENTER_KAY') || str_contains($baseUrl, 'ENTER_KEY') || str_contains($baseUrl, 'ENTER_API_KEY') || str_contains($baseUrl, '{apiKey}')) {
            $baseUrl = str_replace(
                ['ENTER_KAY', 'ENTER_KEY', 'ENTER_API_KEY', '{apiKey}'],
                urlencode($apiKey),
                $baseUrl
            );
        }
        if (str_contains($baseUrl, 'ENTER_AADHAR') || str_contains($baseUrl, 'ENTER_AADHAR_NUMBER') || str_contains($baseUrl, 'ENTER_UID') || str_contains($baseUrl, '{uidNumber}') || str_contains($baseUrl, '{uid}') || str_contains($baseUrl, '{aadhar}')) {
            $baseUrl = str_replace(
                ['ENTER_AADHAR', 'ENTER_AADHAR_NUMBER', 'ENTER_UID', '{uidNumber}', '{uid}', '{aadhar}'],
                urlencode($cleanAadhar),
                $baseUrl
            );
        }

        if (!str_contains($baseUrl, 'apiKey=')) {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . "apiKey=" . urlencode($apiKey) . "&uidNumber=" . urlencode($cleanAadhar);
        } else if (!str_contains($baseUrl, 'uidNumber=') && !str_contains($baseUrl, 'uid=')) {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . "uidNumber=" . urlencode($cleanAadhar);
        } else {
            $url = $baseUrl;
        }

        try {
            $response = Http::connectTimeout(10)->timeout(45)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                $isSuccess = (isset($data['Status']) && strtolower($data['Status']) === 'success') ||
                             (isset($data['StatusCode']) && (int) $data['StatusCode'] === 100);

                $panNumber = null;
                if (!empty($data['full_panno'])) {
                    $panNumber = strtoupper($data['full_panno']);
                } else if ($this->findPanRecursively($data)) {
                    $panNumber = $this->findPanRecursively($data);
                }

                if ($isSuccess && !empty($panNumber)) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhar to PAN Unmasked: ' . $cleanAadhar);
                    }

                    try {
                        ServiceRequest::create([
                            'user_id' => $user->id,
                            'service_id' => $service ? $service->id : null,
                            'service_name' => $service ? $service->name : 'Aadhar To Pan Unmasked Instant',
                            'input_data' => [
                                'Aadhar Number' => $cleanAadhar,
                                'PAN Number' => $panNumber,
                                'Mask PAN' => $data['mask_pan'] ?? null,
                            ],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status' => ServiceRequest::STATUS_COMPLETED,
                            'completed_at' => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::warning('ServiceRequest log error: ' . $logEx->getMessage());
                    }

                    return response()->json([
                        'success' => true,
                        'pan_number' => $panNumber,
                        'pan' => $panNumber,
                        'mask_pan' => $data['mask_pan'] ?? null,
                        'application_no' => $data['application_no'] ?? null,
                        'transaction_id' => $data['transaction_id'] ?? null,
                        'checked_at' => now()->format('d M Y, h:i A'),
                        'data' => $data,
                        'message' => $data['message'] ?? 'PAN details found successfully.'
                    ]);
                }

                $msg = $data['message'] ?? 'PAN details not found for this Aadhaar number.';
                return response()->json([
                    'success' => false,
                    'message' => $msg
                ]);
            } else {
                $errorData = $response->json();
                $msg = $errorData['message'] ?? ('HTTP Server Error: ' . $response->status());
                return response()->json([
                    'success' => false,
                    'message' => $msg
                ]);
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Third-party API server timeout. Kripya thodi der baad prayas karein.'
            ]);
        } catch (\Exception $e) {
            Log::error('AadharToPan API error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with the external server: ' . $e->getMessage()
            ]);
        }
    }

    public function updateApi(Request $request)
    {
        $user = auth()->user();
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));
        if (!$isStaff) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admins can configure API credentials.'
            ], 403);
        }

        $request->validate([
            'api_url' => 'required|url',
            'api_key' => 'nullable|string',
        ]);

        Setting::set('aadhar_to_pan_api_url', trim($request->input('api_url')));
        Setting::set('nexus_aadhar_to_pan_url', trim($request->input('api_url')));
        
        if ($request->filled('api_key')) {
            $key = trim($request->input('api_key'));
            Setting::set('aadhar_to_pan_api_key', $key);
            Setting::set('goodapi_api_key', $key);
            Setting::set('aadhar_to_mask_pan_api_key', $key);
            Setting::set('aadhar_to_name_api_key', $key);
            Setting::set('aadhar_to_npci_api_key', $key);
        }

        return response()->json([
            'success' => true,
            'message' => 'Aadhar to Unmasked PAN API settings updated successfully.'
        ]);
    }

    private function findPanRecursively($array)
    {
        if (!is_array($array)) return false;
        
        $possibleKeys = ['full_panno', 'pan', 'pan_number', 'panNumber', 'PAN', 'panNo', 'pan_no'];
        foreach ($possibleKeys as $key) {
            if (isset($array[$key]) && is_string($array[$key]) && preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i', $array[$key])) {
                return strtoupper($array[$key]);
            }
        }
        
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $result = $this->findPanRecursively($value);
                if ($result) return $result;
            } else if (is_string($value) && preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i', $value)) {
                return strtoupper($value);
            }
        }
        
        return false;
    }
}
