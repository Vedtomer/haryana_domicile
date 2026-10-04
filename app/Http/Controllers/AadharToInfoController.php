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

class AadharToInfoController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'mobile-no-to-aadhar-number')->first()
            ?: Service::where('slug', 'aadhar-to-info')->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 99;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/AadharToInfo', [
            'coinCost' => $coinCost,
            'service' => $service,
            'isAdmin' => (bool) $isStaff,
            'apiUrl' => $isStaff ? Setting::get('aadhar_to_info_api_url', 'https://api.paanel.shop/api/gateway.php') : null,
            'apiKey' => $isStaff ? Setting::get('aadhar_to_info_api_key', 'SamXverma') : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'aadhar' => ['required', 'string', 'regex:/^[0-9]{12}$/'],
        ], [
            'aadhar.required' => 'Please enter a 12-digit Aadhaar Number.',
            'aadhar.regex' => 'Aadhaar Number must be exactly 12 numeric digits.',
        ]);

        $serviceSlug = $request->input('service_slug');
        $service = ($serviceSlug ? Service::where('slug', $serviceSlug)->first() : null)
            ?: Service::where('slug', 'mobile-no-to-aadhar-number')->first()
            ?: Service::where('slug', 'aadhar-to-info')->first();

        $user = auth()->user();
        $coinCost = $service ? (int) $service->coin_cost : 99;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet.",
            ]);
        }

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar'));
        $baseUrl = trim(Setting::get('aadhar_to_info_api_url') ?: 'https://api.paanel.shop/api/gateway.php');
        $apiKey = trim(Setting::get('aadhar_to_info_api_key') ?: 'SamXverma');

        // Handle URL building & replacements
        if (str_contains($baseUrl, '{key}') || str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{aadhar}') || str_contains($baseUrl, '{uid}')) {
            $apiUrl = str_replace(
                ['{key}', '{apiKey}', '{aadhar}', '{uid}'],
                [urlencode($apiKey), urlencode($apiKey), urlencode($cleanAadhar), urlencode($cleanAadhar)],
                $baseUrl
            );
        } else {
            // Replace hardcoded key if present or add
            if (preg_match('/([?&]key=)[^&]*/', $baseUrl)) {
                $baseUrl = preg_replace('/([?&]key=)[^&]*/', '$1' . urlencode($apiKey), $baseUrl);
            } else {
                $separator = str_contains($baseUrl, '?') ? '&' : '?';
                $baseUrl .= $separator . "key=" . urlencode($apiKey);
            }

            // Replace hardcoded aadhar if present or add
            if (preg_match('/([?&]aadhar=)[^&]*/', $baseUrl)) {
                $baseUrl = preg_replace('/([?&]aadhar=)[^&]*/', '$1' . urlencode($cleanAadhar), $baseUrl);
            } else {
                $separator = str_contains($baseUrl, '?') ? '&' : '?';
                $baseUrl .= $separator . "aadhar=" . urlencode($cleanAadhar);
            }
            $apiUrl = $baseUrl;
        }

        try {
            $response = Http::connectTimeout(10)->timeout(40)->get($apiUrl);

            if ($response->successful()) {
                $rawList = $response->json();

                // If response is a valid list of records
                if (is_array($rawList) && count($rawList) > 0 && isset($rawList[0]['NAME'])) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhaar Details Search: ' . $cleanAadhar);
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
                    try {
                        ServiceRequest::create([
                            'user_id' => $user->id,
                            'service_id' => $service ? $service->id : null,
                            'service_name' => $service ? $service->name : 'Sim No. To Aadhar Number',
                            'input_data' => [
                                'Aadhaar Number' => $cleanAadhar,
                                'Found Records' => count($cleanedRecords),
                                'Primary Mobile' => $cleanedRecords[0]['num'] ?? '',
                                'Primary Circle' => $cleanedRecords[0]['circle'] ?? '',
                            ],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status' => ServiceRequest::STATUS_COMPLETED,
                            'completed_at' => now(),
                        ]);
                    } catch (\Throwable $logErr) {
                        Log::warning('ServiceRequest log error: ' . $logErr->getMessage());
                    }

                    session(['aadhar_info_verified_' . $cleanAadhar => $cleanedRecords]);

                    return response()->json([
                        'success' => true,
                        'records' => $cleanedRecords,
                        'total' => count($cleanedRecords),
                        'remainingCoins' => $user->fresh()->coins,
                        'message' => 'Aadhaar details fetched successfully.',
                    ]);
                }

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
            Log::error('Aadhaar To Info API Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Unable to connect to the external gateway. Please try again in a few moments.',
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

        Setting::set('aadhar_to_info_api_url', $url);
        if (!empty($key)) {
            Setting::set('aadhar_to_info_api_key', $key);
        }

        return response()->json([
            'success' => true,
            'message' => 'API configuration saved successfully!',
        ]);
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
        $service = Service::where('slug', 'mobile-no-to-aadhar-number')->first()
            ?: Service::where('slug', 'aadhar-to-info')->first();
        $coinCost = $service ? (int) $service->coin_cost : 99;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        $sessionKey = 'aadhar_info_verified_' . $cleanAadhar;
        $cleanedRecords = session($sessionKey);

        if (empty($cleanedRecords) && $request->has('records') && is_array($request->input('records'))) {
            $cleanedRecords = $request->input('records');
        }

        if (empty($cleanedRecords)) {
            if (!$isStaff && $user->coins < $coinCost) {
                return back()->with('error', "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet.");
            }

            $baseUrl = trim(Setting::get('aadhar_to_info_api_url') ?: 'https://api.paanel.shop/api/gateway.php');
            $apiKey = trim(Setting::get('aadhar_to_info_api_key') ?: 'SamXverma');

            if (str_contains($baseUrl, '{key}') || str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{aadhar}') || str_contains($baseUrl, '{uid}')) {
                $apiUrl = str_replace(
                    ['{key}', '{apiKey}', '{aadhar}', '{uid}'],
                    [urlencode($apiKey), urlencode($apiKey), urlencode($cleanAadhar), urlencode($cleanAadhar)],
                    $baseUrl
                );
            } else {
                if (preg_match('/([?&]key=)[^&]*/', $baseUrl)) {
                    $baseUrl = preg_replace('/([?&]key=)[^&]*/', '$1' . urlencode($apiKey), $baseUrl);
                } else {
                    $separator = str_contains($baseUrl, '?') ? '&' : '?';
                    $baseUrl .= $separator . "key=" . urlencode($apiKey);
                }

                if (preg_match('/([?&]aadhar=)[^&]*/', $baseUrl)) {
                    $baseUrl = preg_replace('/([?&]aadhar=)[^&]*/', '$1' . urlencode($cleanAadhar), $baseUrl);
                } else {
                    $separator = str_contains($baseUrl, '?') ? '&' : '?';
                    $baseUrl .= $separator . "aadhar=" . urlencode($cleanAadhar);
                }
                $apiUrl = $baseUrl;
            }

            try {
                $response = Http::connectTimeout(10)->timeout(40)->get($apiUrl);
                if ($response->successful()) {
                    $rawList = $response->json();
                    if (is_array($rawList) && count($rawList) > 0 && isset($rawList[0]['NAME'])) {
                        if (!$isStaff && $coinCost > 0) {
                            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhaar Details PDF: ' . $cleanAadhar);
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

                        try {
                            ServiceRequest::create([
                                'user_id' => $user->id,
                                'service_id' => $service ? $service->id : null,
                                'service_name' => $service ? $service->name : 'Sim No. To Aadhar Number',
                                'input_data' => [
                                    'Aadhaar Number' => $cleanAadhar,
                                    'Found Records' => count($cleanedRecords),
                                    'Primary Mobile' => $cleanedRecords[0]['num'] ?? '',
                                ],
                                'coins_charged' => $isStaff ? 0 : $coinCost,
                                'status' => ServiceRequest::STATUS_COMPLETED,
                                'completed_at' => now(),
                            ]);
                        } catch (\Throwable $ex) {}

                        session([$sessionKey => $cleanedRecords]);
                    }
                }
            } catch (\Throwable $e) {
                Log::error('Aadhaar Download PDF API Error: ' . $e->getMessage());
            }
        }

        if (empty($cleanedRecords)) {
            return back()->with('error', 'Details not found for this Aadhaar Number.');
        }

        $recordIndex = (int) $request->input('record_index', 0);
        $primary = $cleanedRecords[$recordIndex] ?? $cleanedRecords[0];

        $emblemPath = public_path('images/emblem.svg');
        $emblemSvg = file_exists($emblemPath) ? 'data:image/svg+xml;base64,' . base64_encode(file_get_contents($emblemPath)) : null;

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
