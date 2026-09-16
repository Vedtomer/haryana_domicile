<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LearningLicenceController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'applNum' => ['required', 'string']
        ]);

        $service = \App\Models\Service::where('slug', 'learning-licence-pdf')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 19;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json(['success' => false, 'message' => "Insufficient coins. This service requires {$coinCost} coins."]);
        }

        $applNum = strtoupper(trim($request->input('applNum')));
        $dob = trim($request->input('dob', ''));

        $apiKey = trim(\App\Models\Setting::get('nexus_api_key') ?: config('services.nexus.api_key', env('NEXUS_API_KEY', '38cc07892c07c566e3ce1a3289c589e284954d7c0e593386')));

        $queryParams = [
            'apiKey' => $apiKey,
            'applNum' => $applNum,
        ];
        if (!empty($dob)) {
            $queryParams['dob'] = $dob;
        }

        $url = "https://nexus-dashboard.space/api/v1/vahan_service_api/learning_license_pdf.php?" . http_build_query($queryParams);

        $maxRetries = 2;
        $lastError = null;

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                $response = Http::withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept' => 'application/json, application/pdf, */*',
                    'Referer' => 'https://nexus-dashboard.space/',
                ])->connectTimeout(10)->timeout(30)->get($url);

                $contentType = $response->header('Content-Type') ?? '';

                // Handle raw PDF binary response
                if (str_contains($contentType, 'application/pdf') || str_starts_with($response->body(), '%PDF')) {
                    $pdfBase64 = base64_encode($response->body());

                    if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                        $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Learning Licence PDF: ' . $applNum);
                    }

                    \App\Models\ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Learning Licence PDF',
                        'input_data'    => ['Application Number' => $applNum, 'DOB' => $dob],
                        'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                        'status'        => \App\Models\ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'data'    => ['pdf' => $pdfBase64],
                        'message' => 'PDF downloaded successfully.',
                    ]);
                }

                // Handle JSON response
                $data = $response->json();

                if (!is_array($data)) {
                    $lastError = 'Invalid response from API server.';
                    if ($attempt < $maxRetries) { usleep(500000); continue; }
                    break;
                }

                // Flexible success detection
                $isSuccess = false;
                $status = $data['Status'] ?? $data['status'] ?? null;
                if ($status === 'Success' || $status === 'success' || $status === true || $status === 1) {
                    $isSuccess = true;
                }

                // Check if any PDF data exists in response
                $hasPdfData = isset($data['data']) || isset($data['pdf_url']) || isset($data['pdf'])
                    || isset($data['file_url']) || isset($data['base64'])
                    || (isset($data['data']['pdf']) || isset($data['data']['pdf_url']) || isset($data['data']['base64']));

                if ($isSuccess || $hasPdfData) {
                    if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                        $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Learning Licence PDF: ' . $applNum);
                    }

                    \App\Models\ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Learning Licence PDF',
                        'input_data'    => ['Application Number' => $applNum, 'DOB' => $dob],
                        'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                        'status'        => \App\Models\ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'data'    => $data,
                        'message' => 'Details found successfully.',
                    ]);
                }

                // Failed response — check if 503 / temporarily unavailable (retry-worthy)
                $apiMsg = $data['message'] ?? $data['msg'] ?? null;
                $statusCode = $data['StatusCode'] ?? $response->status();

                if (($statusCode == 503 || (is_string($apiMsg) && stripos($apiMsg, 'temporarily unavailable') !== false)) && $attempt < $maxRetries) {
                    $lastError = $apiMsg ?? 'Service temporarily unavailable';
                    usleep(800000); // wait 800ms before retry
                    continue;
                }

                // Final failure — return error
                if ($apiMsg) {
                    if (stripos($apiMsg, 'temporarily unavailable') !== false || $statusCode == 503) {
                        $formattedMsg = "API Server अभी Temporarily Unavailable है। कृपया 1-2 मिनट बाद दोबारा प्रयास करें।";
                    } else {
                        $formattedMsg = $apiMsg;
                    }

                    return response()->json([
                        'success' => false,
                        'message' => $formattedMsg,
                        'raw_error' => $apiMsg,
                        'direct_portal' => 'https://sarathi.parivahan.gov.in/sarathiservice/printlearninglicence.do',
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Application Number ' . $applNum . ' के लिए Details नहीं मिली। कृपया Application Number जांच करें।',
                    'direct_portal' => 'https://sarathi.parivahan.gov.in/sarathiservice/printlearninglicence.do',
                ]);

            } catch (\Exception $e) {
                $lastError = $e->getMessage();
                if ($attempt < $maxRetries) { usleep(500000); continue; }
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'API सर्वर से संपर्क नहीं हो सका। कृपया थोड़ी देर बाद दोबारा प्रयास करें।' . ($lastError ? " ({$lastError})" : ''),
            'direct_portal' => 'https://sarathi.parivahan.gov.in/sarathiservice/printlearninglicence.do',
        ]);
    }
}
