<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LearningLicenceController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'applNum' => ['required', 'string']
        ]);

        $service = Service::where('slug', 'learning-licence-pdf')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 19;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. (Current balance: {$user->coins} coins)"
            ]);
        }

        $applNum = strtoupper(trim($request->input('applNum')));
        $dob = trim($request->input('dob', ''));

        $apiKey = trim(Setting::get('vahan_learning_licence_key') ?: (Setting::get('nexus_api_key') ?: config('services.nexus.api_key', env('NEXUS_API_KEY', '38cc07892c07c566e3ce1a3289c589e284954d7c0e593386'))));
        $baseUrl = trim(Setting::get('vahan_learning_licence_url') ?: 'https://nexus-dashboard.space/api/v1/vahan_service_api/learning_license_pdf.php');

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{applNum}')) {
            $url = str_replace(
                ['{apiKey}', '{applNum}', '{dob}'],
                [urlencode($apiKey), urlencode($applNum), urlencode($dob)],
                $baseUrl
            );
        } else {
            $queryParams = [
                'apiKey'  => $apiKey,
                'applNum' => $applNum,
            ];
            if (!empty($dob)) {
                $queryParams['dob'] = $dob;
            }
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . http_build_query($queryParams);
        }

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept'     => 'application/json, application/pdf, */*',
            ])->connectTimeout(10)->timeout(30)->get($url);

            $contentType = $response->header('Content-Type') ?? '';

            // Handle raw PDF binary response
            if (str_contains($contentType, 'application/pdf') || str_starts_with($response->body(), '%PDF')) {
                $pdfBase64 = base64_encode($response->body());

                if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                    $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Learning Licence Download: ' . $applNum);
                }

                ServiceRequest::create([
                    'user_id'       => $user->id,
                    'service_id'    => $service ? $service->id : null,
                    'service_name'  => $service ? $service->name : 'Learning Licence Download',
                    'input_data'    => ['Application Number' => $applNum, 'DOB' => $dob],
                    'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                    'status'        => ServiceRequest::STATUS_COMPLETED,
                    'completed_at'  => now(),
                ]);

                return response()->json([
                    'success' => true,
                    'data'    => [
                        'pdf'      => $pdfBase64,
                        'appl_num' => $applNum,
                        'dob'      => $dob,
                    ],
                    'message' => 'Learning Licence PDF downloaded successfully.',
                ]);
            }

            $data = $response->json();

            if (is_array($data)) {
                $status = $data['Status'] ?? $data['status'] ?? null;
                $isSuccess = ($status === 'Success' || $status === 'success' || $status === true || $status === 1);

                $hasPdfData = isset($data['pdf_url']) || isset($data['file_url']) || isset($data['pdf'])
                    || isset($data['base64']) || isset($data['a4_pdf']) || isset($data['a4'])
                    || (isset($data['data']['pdf']) || isset($data['data']['pdf_url']) || isset($data['data']['file_url']) || isset($data['data']['base64']));

                if ($isSuccess || $hasPdfData) {
                    if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Learning Licence Download: ' . $applNum);
                    }

                    ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Learning Licence Download',
                        'input_data'    => ['Application Number' => $applNum, 'DOB' => $dob],
                        'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                        'status'        => ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'data'    => $data,
                        'message' => 'Learning Licence PDF fetched successfully.',
                    ]);
                }

                // If API returned a specific message
                $apiMsg = $data['message'] ?? $data['msg'] ?? null;
                if ($apiMsg) {
                    return response()->json([
                        'success' => false,
                        'message' => $apiMsg,
                        'direct_portal' => 'https://sarathi.parivahan.gov.in/sarathiservice/printlearninglicence.do',
                    ]);
                }
            }

            return response()->json([
                'success' => false,
                'message' => "Application Number '{$applNum}' के लिए रिकॉर्ड नहीं मिला। कृपया एप्लीकेशन नंबर जांचें।",
                'direct_portal' => 'https://sarathi.parivahan.gov.in/sarathiservice/printlearninglicence.do',
            ]);

        } catch (\Exception $e) {
            Log::warning('Nexus LL API Exception', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'API सर्वर से संपर्क नहीं हो सका: ' . $e->getMessage(),
                'direct_portal' => 'https://sarathi.parivahan.gov.in/sarathiservice/printlearninglicence.do',
            ]);
        }
    }

    /**
     * Deduct coins when frontend calls API directly if needed
     */
    public function deductCoins(Request $request)
    {
        $request->validate(['applNum' => ['required', 'string']]);

        $service = Service::where('slug', 'learning-licence-pdf')->first();
        $user = auth()->user();
        $coinCost = $service ? $service->coin_cost : 19;
        $applNum = strtoupper(trim($request->input('applNum')));
        $dob = trim($request->input('dob', ''));

        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            if ($user->coins < $coinCost) {
                return response()->json(['success' => false, 'message' => "Insufficient coins."]);
            }
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Learning Licence Download: ' . $applNum);
        }

        ServiceRequest::create([
            'user_id'       => $user->id,
            'service_id'    => $service ? $service->id : null,
            'service_name'  => $service ? $service->name : 'Learning Licence Download',
            'input_data'    => ['Application Number' => $applNum, 'DOB' => $dob],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status'        => ServiceRequest::STATUS_COMPLETED,
            'completed_at'  => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Coins deducted.']);
    }
}

