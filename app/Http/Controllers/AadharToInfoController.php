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
        $baseUrl = trim(\App\Models\Setting::get('aadhar_to_info_api_url') ?: 'https://api.paanel.shop/api/gateway.php');
        $apiKey = trim(\App\Models\Setting::get('aadhar_to_info_api_key') ?: 'SamXverma');

        if (str_contains($baseUrl, '{key}') || str_contains($baseUrl, '{aadhar}')) {
            $apiUrl = str_replace(
                ['{key}', '{apiKey}', '{aadhar}', '{uid}'],
                [urlencode($apiKey), urlencode($apiKey), urlencode($cleanAadhar), urlencode($cleanAadhar)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $apiUrl = $baseUrl . $separator . "key=" . urlencode($apiKey) . "&aadhar=" . urlencode($cleanAadhar);
        }

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

                    // Cache records in session for instant PDF download without recharging
                    session(['aadhar_info_verified_' . $cleanAadhar => $cleanedRecords]);

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

    public function downloadPdf(Request $request)
    {
        $request->validate([
            'aadhar' => 'required',
        ]);

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar'));
        if (strlen($cleanAadhar) !== 12) {
            return back()->with('error', 'Please provide a valid 12-digit Aadhaar Number.');
        }

        $user = auth()->user();
        $service = Service::where('slug', 'aadhar-to-info')->first();
        $coinCost = $service ? $service->coin_cost : 99;

        // 1. Check session cache
        $sessionKey = 'aadhar_info_verified_' . $cleanAadhar;
        $cleanedRecords = session($sessionKey);

        // 2. Check if records passed directly via POST
        if (empty($cleanedRecords) && $request->has('records') && is_array($request->input('records'))) {
            $cleanedRecords = $request->input('records');
        }

        // 3. Fallback: Query gateway if not in session
        if (empty($cleanedRecords)) {
            if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
                return back()->with('error', "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet.");
            }

            $baseUrl = trim(\App\Models\Setting::get('aadhar_to_info_api_url') ?: 'https://api.paanel.shop/api/gateway.php');
            $apiKey = trim(\App\Models\Setting::get('aadhar_to_info_api_key') ?: 'SamXverma');

            if (str_contains($baseUrl, '{key}') || str_contains($baseUrl, '{aadhar}')) {
                $apiUrl = str_replace(
                    ['{key}', '{apiKey}', '{aadhar}', '{uid}'],
                    [urlencode($apiKey), urlencode($apiKey), urlencode($cleanAadhar), urlencode($cleanAadhar)],
                    $baseUrl
                );
            } else {
                $separator = str_contains($baseUrl, '?') ? '&' : '?';
                $apiUrl = $baseUrl . $separator . "key=" . urlencode($apiKey) . "&aadhar=" . urlencode($cleanAadhar);
            }

            try {
                $response = Http::connectTimeout(10)->timeout(30)->get($apiUrl);
                if ($response->successful()) {
                    $rawList = $response->json();
                    if (is_array($rawList) && count($rawList) > 0 && isset($rawList[0]['NAME'])) {
                        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhaar No. To Info: ' . $cleanAadhar);
                        }

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

                        session([$sessionKey => $cleanedRecords]);
                    }
                }
            } catch (\Throwable $e) {
                \Log::error('Aadhaar Download PDF API Error: ' . $e->getMessage());
            }
        }

        if (empty($cleanedRecords)) {
            return back()->with('error', 'Details not found for this Aadhaar Number.');
        }

        $recordIndex = (int) $request->input('record_index', 0);
        $primary = $cleanedRecords[$recordIndex] ?? $cleanedRecords[0];

        // Load Emblem SVG Base64
        $emblemPath = public_path('images/emblem.svg');
        $emblemSvg = file_exists($emblemPath) ? 'data:image/svg+xml;base64,' . base64_encode(file_get_contents($emblemPath)) : null;

        // Generate QR Code as SVG data URI
        try {
            $formattedAadhar = implode(' ', str_split($cleanAadhar, 4));
            $qrText = "Aadhaar: " . $formattedAadhar . "\nName: " . ($primary['name'] ?? 'N/A') . "\nFather: " . ($primary['fname'] ?? 'N/A') . "\nMobile: " . ($primary['num'] ?? 'N/A') . "\nCircle: " . ($primary['circle'] ?? 'N/A') . "\nAddress: " . ($primary['address'] ?? 'N/A');
            $renderer = new \BaconQrCode\Renderer\ImageRenderer(
                new \BaconQrCode\Renderer\RendererStyle\RendererStyle(100, 0),
                new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
            );
            $writer = new \BaconQrCode\Writer($renderer);
            $qrCodeSvg = 'data:image/svg+xml;base64,' . base64_encode($writer->writeString($qrText));
        } catch (\Throwable $e) {
            $qrCodeSvg = null;
        }

        $formattedAadhar = implode(' ', str_split($cleanAadhar, 4));
        $verificationId = 'UID-VER-' . date('Ymd') . '-' . substr($primary['num'] ?? $cleanAadhar, -4);
        $verifiedAt = date('d-M-Y h:i A');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.aadhar_info', [
            'primary' => $primary,
            'records' => $cleanedRecords,
            'formattedAadhar' => $formattedAadhar,
            'emblemSvg' => $emblemSvg,
            'qrCodeSvg' => $qrCodeSvg,
            'verificationId' => $verificationId,
            'verifiedAt' => $verifiedAt,
        ]);

        $pdf->setPaper('a4', 'portrait');

        return response($pdf->output())
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="Aadhaar_Verification_Card_' . $cleanAadhar . '.pdf"');
    }
}
