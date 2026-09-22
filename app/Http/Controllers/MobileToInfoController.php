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

        return Inertia::render('Utilities/MobileToInfo', [
            'coinCost' => $coinCost,
            'service' => $service,
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
        $baseUrl = trim(Setting::get('mobile_to_info_api_url') ?: 'https://maikyaladledarlinggggg.watchwere19.workers.dev/');
        $apiKey = trim(Setting::get('mobile_to_info_api_key') ?: '48hrs');

        if (str_contains($baseUrl, '{key}') || str_contains($baseUrl, '{q}') || str_contains($baseUrl, '{mobile}')) {
            $apiUrl = str_replace(
                ['{key}', '{apiKey}', '{q}', '{mobile}', '{number}'],
                [urlencode($apiKey), urlencode($apiKey), urlencode($cleanMobile), urlencode($cleanMobile), urlencode($cleanMobile)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $apiUrl = $baseUrl . $separator . "key=" . urlencode($apiKey) . "&q=" . urlencode($cleanMobile);
        }

        try {
            $response = Http::connectTimeout(8)->timeout(25)->get($apiUrl);

            if ($response->successful()) {
                $data = $response->json();

                $rawResults = [];
                if (isset($data['results']) && is_array($data['results'])) {
                    $rawResults = $data['results'];
                } elseif (is_array($data) && isset($data[0])) {
                    $rawResults = $data;
                }

                if (!empty($rawResults)) {
                    // Deduct coins only for regular users
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "Mobile to Info: {$cleanMobile}");
                    }

                    // Format and clean records
                    $cleanedRecords = [];
                    foreach ($rawResults as $item) {
                        $addressRaw = $item['address'] ?? ($item['ADDRESS'] ?? '');
                        $addressParts = array_values(array_filter(array_map('trim', explode('!', $addressRaw))));
                        $cleanAddress = !empty($addressParts) ? implode(', ', $addressParts) : 'N/A';

                        $altNum = $item['alternate'] ?? ($item['alt'] ?? null);
                        if ($altNum && (strtoupper(trim($altNum)) === 'NA' || strtoupper(trim($altNum)) === 'NULL')) {
                            $altNum = null;
                        }

                        $aadharNum = $item['aadhar'] ?? null;
                        if ($aadharNum && (strtoupper(trim($aadharNum)) === 'NA' || strtoupper(trim($aadharNum)) === 'NULL')) {
                            $aadharNum = null;
                        }

                        $emailVal = $item['email'] ?? null;
                        if ($emailVal && (strtoupper(trim($emailVal)) === 'NA' || strtoupper(trim($emailVal)) === 'NULL')) {
                            $emailVal = null;
                        }

                        $cleanedRecords[] = [
                            'mobile' => !empty($item['mobile']) ? trim($item['mobile']) : $cleanMobile,
                            'name' => !empty($item['name']) ? trim($item['name']) : 'N/A',
                            'father_name' => !empty($item['father_name']) ? trim($item['father_name']) : ($item['fname'] ?? 'N/A'),
                            'circle' => !empty($item['circle']) ? trim($item['circle']) : 'N/A',
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
                    'message' => 'No records found for mobile number ' . $cleanMobile . '.',
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
