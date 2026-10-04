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

class AadharToRationController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'aadhar-to-ration')->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 39;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/AadharToRation', [
            'service' => $service,
            'coinCost' => $coinCost,
            'isAdmin' => (bool) $isStaff,
            'apiUrl' => $isStaff ? Setting::get('aadhar_to_ration_api_url', 'https://good-api-point.com/apis_partner/v1/ration_card_api/uid_to_ration_no.php') : null,
            'apiKey' => $isStaff ? Setting::get('aadhar_to_ration_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815') : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'aadhar' => ['required', 'string', 'regex:/^[0-9]{12}$/']
        ], [
            'aadhar.required' => 'Please enter a 12-digit Aadhaar number.',
            'aadhar.regex' => 'Aadhaar number must be exactly 12 numeric digits.'
        ]);

        $service = Service::where('slug', 'aadhar-to-ration')->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 39;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet."
            ]);
        }

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar'));

        $baseUrl = trim(Setting::get('aadhar_to_ration_api_url', 'https://good-api-point.com/apis_partner/v1/ration_card_api/uid_to_ration_no.php'));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/ration_card_api/uid_to_ration_no.php';
        }

        $apiKey = trim(Setting::get('aadhar_to_ration_api_key', Setting::get('goodapi_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815')));

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'API Key is not configured. Please enter your API key in Admin API Settings.'
            ]);
        }

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{uid}') || str_contains($baseUrl, '{aadhar}')) {
            $url = str_replace(
                ['{apiKey}', '{uid}', '{aadhar}'],
                [urlencode($apiKey), urlencode($cleanAadhar), urlencode($cleanAadhar)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . "apiKey=" . urlencode($apiKey) . "&uid=" . urlencode($cleanAadhar);
        }

        try {
            $response = Http::connectTimeout(8)->timeout(30)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                $isSuccess = (isset($data['Status']) && strtolower($data['Status']) === 'success') ||
                             (isset($data['StatusCode']) && (int) $data['StatusCode'] === 100);

                $payload = $data['data'] ?? $data;

                // Extract Ration Card Number
                $rationNo = null;
                if (is_array($payload)) {
                    $possibleKeys = [
                        'ration_no', 'ration_card_no', 'rc_no', 'ration_number', 'rationCardNo',
                        'rationCardNumber', 'rc_number', 'RationNo', 'RationCardNo', 'card_no'
                    ];
                    foreach ($possibleKeys as $k) {
                        if (!empty($payload[$k])) {
                            $rationNo = trim((string) $payload[$k]);
                            break;
                        }
                    }
                }

                if (!$rationNo && !empty($data['ration_no'])) {
                    $rationNo = trim((string) $data['ration_no']);
                }

                // If success or ration number found
                if ($isSuccess || !empty($rationNo)) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhar To Ration: ' . $cleanAadhar);
                    }

                    // Extract structured fields
                    $headName = $payload['head_name'] ?? ($payload['name'] ?? ($payload['HeadName'] ?? ($payload['Name'] ?? ($payload['member_name'] ?? 'N/A'))));
                    $fatherHusband = $payload['father_name'] ?? ($payload['husband_name'] ?? ($payload['father_husband_name'] ?? ($payload['FatherName'] ?? 'N/A')));
                    $district = $payload['district'] ?? ($payload['district_name'] ?? ($payload['District'] ?? 'N/A'));
                    $state = $payload['state'] ?? ($payload['state_name'] ?? ($payload['State'] ?? 'N/A'));
                    $scheme = $payload['scheme'] ?? ($payload['scheme_name'] ?? ($payload['card_type'] ?? ($payload['Scheme'] ?? 'NFSA / State PDS')));
                    $fpsName = $payload['fps_name'] ?? ($payload['dealer_name'] ?? ($payload['fps_no'] ?? ($payload['shop_name'] ?? 'N/A')));
                    $fpsNo = $payload['fps_no'] ?? ($payload['dealer_code'] ?? ($payload['shop_no'] ?? 'N/A'));
                    $members = $payload['members'] ?? ($payload['member_list'] ?? ($payload['family_members'] ?? []));

                    if (!is_array($members)) {
                        $members = [];
                    }

                    $structured = [
                        'aadhar' => $cleanAadhar,
                        'ration_no' => $rationNo ?: 'NOT SPECIFIED',
                        'head_name' => $headName,
                        'father_husband' => $fatherHusband,
                        'district' => $district,
                        'state' => $state,
                        'scheme' => $scheme,
                        'fps_name' => $fpsName,
                        'fps_no' => $fpsNo,
                        'members' => $members,
                        'raw' => is_array($payload) ? $payload : [],
                        'checked_at' => now()->format('d M Y, h:i A')
                    ];

                    try {
                        ServiceRequest::create([
                            'user_id' => $user->id,
                            'service_id' => $service ? $service->id : null,
                            'service_name' => $service ? $service->name : 'Aadhar To Ration Find',
                            'input_data' => [
                                'Aadhaar Number' => $cleanAadhar,
                                'Ration Card Number' => $rationNo ?: 'Found',
                                'Head Name' => $headName,
                                'District' => $district,
                                'State' => $state,
                            ],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status' => ServiceRequest::STATUS_COMPLETED,
                            'completed_at' => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest create error in AadharToRation: ' . $logEx->getMessage());
                    }

                    // Save to session for PDF generation
                    session(["ration_last_result_{$cleanAadhar}" => $structured]);

                    return response()->json([
                        'success' => true,
                        'ration_no' => $rationNo ?: 'Found',
                        'data' => $structured,
                        'message' => $data['message'] ?? 'Ration card details found successfully.'
                    ]);
                }

                $errMsg = $data['message'] ?? 'Ration card not found for this Aadhaar number.';
                return response()->json([
                    'success' => false,
                    'message' => $errMsg
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to Ration service provider. Status code: ' . $response->status()
            ]);

        } catch (\Throwable $e) {
            Log::error('AadharToRation Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Connection timeout or server error. Please try again later.'
            ]);
        }
    }

    public function downloadPdf(Request $request)
    {
        $request->validate([
            'aadhar' => ['required', 'string', 'regex:/^[0-9]{12}$/']
        ]);

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar'));
        $cached = session("ration_last_result_{$cleanAadhar}");

        // If not found in session, try to reconstruct from request parameters
        if (!$cached) {
            $rationNo = $request->input('ration_no');
            if ($rationNo) {
                $cached = [
                    'aadhar' => $cleanAadhar,
                    'ration_no' => $rationNo,
                    'head_name' => $request->input('head_name', 'N/A'),
                    'father_husband' => $request->input('father_husband', 'N/A'),
                    'district' => $request->input('district', 'N/A'),
                    'state' => $request->input('state', 'N/A'),
                    'scheme' => $request->input('scheme', 'NFSA / State PDS'),
                    'fps_name' => $request->input('fps_name', 'N/A'),
                    'fps_no' => $request->input('fps_no', 'N/A'),
                    'members' => $request->input('members', []),
                    'raw' => [],
                    'checked_at' => now()->format('d M Y, h:i A')
                ];
            }
        }

        if (!$cached) {
            return back()->with('error', 'Ration card details not found. Please search again first.');
        }

        $formattedAadhar = implode(' ', str_split($cleanAadhar, 4));
        $emblemPath = public_path('images/emblem.svg');
        $emblemSvg = file_exists($emblemPath) ? 'data:image/svg+xml;base64,' . base64_encode(file_get_contents($emblemPath)) : null;

        // Generate QR Code
        $qrCodeSvg = null;
        try {
            $qrText = "NATIONAL FOOD SECURITY PORTAL\nRation Card No: " . ($cached['ration_no'] ?? 'N/A') .
                      "\nHead of Family: " . ($cached['head_name'] ?? 'N/A') .
                      "\nAadhaar: " . $formattedAadhar .
                      "\nDistrict: " . ($cached['district'] ?? 'N/A') .
                      "\nState: " . ($cached['state'] ?? 'N/A') .
                      "\nScheme: " . ($cached['scheme'] ?? 'NFSA') .
                      "\nVerified: " . ($cached['checked_at'] ?? date('d-M-Y'));

            $renderer = new \BaconQrCode\Renderer\ImageRenderer(
                new \BaconQrCode\Renderer\RendererStyle\RendererStyle(120, 0),
                new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
            );
            $writer = new \BaconQrCode\Writer($renderer);
            $qrCodeSvg = 'data:image/svg+xml;base64,' . base64_encode($writer->writeString($qrText));
        } catch (\Throwable $e) {
            $qrCodeSvg = null;
        }

        $verificationId = 'RC-VER-' . date('Ymd') . '-' . substr($cleanAadhar, -4);
        $verifiedAt = $cached['checked_at'] ?? date('d-M-Y h:i A');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.ration_slip', [
            'ration' => $cached,
            'cleanAadhar' => $cleanAadhar,
            'formattedAadhar' => $formattedAadhar,
            'emblemSvg' => $emblemSvg,
            'qrCodeSvg' => $qrCodeSvg,
            'verificationId' => $verificationId,
            'verifiedAt' => $verifiedAt,
        ]);

        $pdf->setPaper('a4', 'portrait');

        return response($pdf->output())
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="Ration_Card_Slip_' . ($cached['ration_no'] ?: $cleanAadhar) . '.pdf"');
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

        Setting::set('aadhar_to_ration_api_url', trim($request->input('api_url')));
        if ($request->filled('api_key')) {
            Setting::set('aadhar_to_ration_api_key', trim($request->input('api_key')));
        }

        return response()->json([
            'success' => true,
            'message' => 'Aadhar To Ration API configuration saved successfully!'
        ]);
    }
}
