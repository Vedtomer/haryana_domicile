<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class AadharToInfoController extends Controller
{
    public function index()
    {
        $service = Service::where('slug', 'aadhar-to-info')->first();
        $coinCost = $service ? $service->coin_cost : 99;

        return Inertia::render('Utilities/AadharToInfo', [
            'coinCost' => $coinCost,
            'service' => $service,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'aadhar' => 'required|digits:12',
        ], [
            'aadhar.required' => 'Please enter a 12-digit Aadhaar Number.',
            'aadhar.digits' => 'Aadhaar Number must be exactly 12 digits.',
        ]);

        $service = Service::where('slug', 'aadhar-to-info')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 99;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet.",
            ]);
        }

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar'));
        $apiKey = 'SamXverma';
        $apiUrl = "https://api.paanel.shop/api/gateway.php?key=" . urlencode($apiKey) . "&aadhar=" . urlencode($cleanAadhar);

        try {
            $response = Http::connectTimeout(10)->timeout(30)->get($apiUrl);

            if ($response->successful()) {
                $rawList = $response->json();

                // If response is a valid list of records
                if (is_array($rawList) && count($rawList) > 0 && isset($rawList[0]['NAME'])) {
                    // Deduct coins only if not admin and cost > 0
                    if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhaar No. To Info: ' . $cleanAadhar);
                    }

                    // Format and clean records
                    $cleanedRecords = [];
                    foreach ($rawList as $item) {
                        $addressRaw = $item['ADDRESS'] ?? '';
                        $addressParts = array_values(array_filter(array_map('trim', explode('!', $addressRaw))));
                        $cleanAddress = !empty($addressParts) ? implode(', ', $addressParts) : 'N/A';

                        $cleanedRecords[] = [
                            'name' => !empty($item['NAME']) ? trim($item['NAME']) : 'N/A',
                            'fname' => !empty($item['fname']) ? trim($item['fname']) : 'N/A',
                            'num' => !empty($item['num']) ? trim($item['num']) : 'N/A',
                            'alt' => (!empty($item['alt']) && strtoupper($item['alt']) !== 'NA') ? trim($item['alt']) : null,
                            'circle' => !empty($item['circle']) ? trim($item['circle']) : 'N/A',
                            'address' => $cleanAddress,
                            'email' => !empty($item['email']) ? trim($item['email']) : null,
                            'aadhar' => !empty($item['aadhar']) ? trim($item['aadhar']) : $cleanAadhar,
                        ];
                    }

                    // Log service request
                    ServiceRequest::create([
                        'user_id' => $user->id,
                        'service_id' => $service ? $service->id : null,
                        'service_name' => $service ? $service->name : 'Aadhaar No. To Info',
                        'input_data' => [
                            'Aadhaar Number' => $cleanAadhar,
                            'Found Records' => count($cleanedRecords),
                            'Primary Mobile' => $cleanedRecords[0]['num'] ?? '',
                        ],
                        'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                        'status' => ServiceRequest::STATUS_COMPLETED,
                        'completed_at' => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'records' => $cleanedRecords,
                        'total' => count($cleanedRecords),
                        'remainingCoins' => $user->fresh()->coins,
                        'message' => 'Aadhaar details fetched successfully.',
                    ]);
                }

                // If error message in JSON
                if (is_array($rawList) && isset($rawList['status']) && $rawList['status'] === 'error') {
                    return response()->json([
                        'success' => false,
                        'message' => $rawList['message'] ?? 'Details not found for this Aadhaar Number.',
                    ]);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'No records found for this Aadhaar Number. Please verify and try again.',
            ]);

        } catch (\Throwable $e) {
            \Log::error('Aadhaar To Info API Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Unable to connect to the external verification gateway. Please try again in a few moments.',
            ]);
        }
    }
}
