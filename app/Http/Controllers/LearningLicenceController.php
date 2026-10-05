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

class LearningLicenceController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'learning-licence-pdf')
            ->orWhere('slug', 'learning-license-pdf')
            ->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 19;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/LearningLicencePdf', [
            'service'        => $service,
            'currentService' => $service,
            'coinCost'       => $coinCost,
            'isAdmin'        => (bool) $isStaff,
            'apiUrl'         => $isStaff ? Setting::get('vahan_learning_licence_url', 'https://good-api-point.com/apis_partner/v1/vahan_service_api/learning_license_pdf.php') : null,
            'apiKey'         => $isStaff ? Setting::get('vahan_learning_licence_key', Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1')) : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'applNum' => ['required', 'string']
        ], [
            'applNum.required' => 'Please enter a valid Application Number.'
        ]);

        $service = Service::where('slug', 'learning-licence-pdf')
            ->orWhere('slug', 'learning-license-pdf')
            ->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 19;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. (Current balance: {$user->coins} coins)"
            ]);
        }

        $applNum = strtoupper(trim($request->input('applNum')));
        $dob = trim($request->input('dob', ''));

        $baseUrl = trim(Setting::get('vahan_learning_licence_url', 'https://good-api-point.com/apis_partner/v1/vahan_service_api/learning_license_pdf.php'));
        if (empty($baseUrl) || str_contains($baseUrl, 'nexus-dashboard.space')) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/vahan_service_api/learning_license_pdf.php';
        }

        // Clean base URL if user pasted example query string
        if (str_contains($baseUrl, 'apiKey=ENTER_API_KEY') || str_contains($baseUrl, 'applNum=ENTER_APPLICATION_NUMBER')) {
            $baseUrl = explode('?', $baseUrl)[0];
        }

        $apiKey = trim(Setting::get('vahan_learning_licence_key')
            ?: (Setting::get('goodapi_api_key')
            ?: 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1'));

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{applNum}') || str_contains($baseUrl, '{application_number}')) {
            $url = str_replace(
                ['{apiKey}', '{applNum}', '{application_number}', '{dob}'],
                [urlencode($apiKey), urlencode($applNum), urlencode($applNum), urlencode($dob)],
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
            ])->connectTimeout(10)->timeout(45)->get($url);

            $contentType = $response->header('Content-Type') ?? '';

            // 1. Handle raw PDF binary response from provider
            if (str_contains($contentType, 'application/pdf') || str_starts_with($response->body(), '%PDF')) {
                $pdfBase64 = base64_encode($response->body());

                if (!$isStaff && $coinCost > 0) {
                    $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Learning Licence Download: ' . $applNum);
                }

                ServiceRequest::create([
                    'user_id'       => $user->id,
                    'service_id'    => $service ? $service->id : null,
                    'service_name'  => $service ? $service->name : 'Learning Licence Download',
                    'input_data'    => ['Application Number' => $applNum, 'DOB' => $dob],
                    'coins_charged' => $isStaff ? 0 : $coinCost,
                    'status'        => ServiceRequest::STATUS_COMPLETED,
                    'completed_at'  => now(),
                ]);

                return response()->json([
                    'success' => true,
                    'data'    => [
                        'pdf'        => $pdfBase64,
                        'pdf_base64' => $pdfBase64,
                        'appl_num'   => $applNum,
                        'dob'        => $dob,
                    ],
                    'message' => 'Learning Licence PDF downloaded successfully.',
                ]);
            }

            $data = $response->json();

            if (is_array($data)) {
                $status = $data['Status'] ?? ($data['status'] ?? null);
                $statusCode = $data['StatusCode'] ?? ($data['statusCode'] ?? null);
                $isSuccess = ($status === 'Success' || $status === 'success' || $status === true || (int) $statusCode === 100);

                $pdfUrl = $data['pdf_url'] ?? ($data['file_url'] ?? ($data['download_url'] ?? ($data['url'] ?? ($data['a4_pdf'] ?? ($data['a4'] ?? null)))));
                $pdfBase64 = $data['pdf'] ?? ($data['base64'] ?? ($data['pdf_base64'] ?? null));

                if (!$pdfUrl && !$pdfBase64 && isset($data['data']) && is_array($data['data'])) {
                    $pdfUrl = $data['data']['pdf_url'] ?? ($data['data']['file_url'] ?? ($data['data']['download_url'] ?? ($data['data']['url'] ?? ($data['data']['a4_pdf'] ?? null))));
                    $pdfBase64 = $data['data']['pdf'] ?? ($data['data']['base64'] ?? ($data['data']['pdf_base64'] ?? null));
                }

                if ($isSuccess || !empty($pdfUrl) || !empty($pdfBase64)) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Learning Licence Download: ' . $applNum);
                    }

                    ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Learning Licence Download',
                        'input_data'    => ['Application Number' => $applNum, 'DOB' => $dob],
                        'coins_charged' => $isStaff ? 0 : $coinCost,
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
                $apiMsg = $data['message'] ?? ($data['msg'] ?? null);
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
            Log::warning('Good-API-Point LL API Exception', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'API सर्वर से संपर्क नहीं हो सका: ' . $e->getMessage(),
                'direct_portal' => 'https://sarathi.parivahan.gov.in/sarathiservice/printlearninglicence.do',
            ]);
        }
    }

    public function updateApi(Request $request)
    {
        $user = auth()->user();
        if (!$user || (!$user->isAdmin() && !$user->hasRole('admin') && !$user->hasRole('super_admin') && !in_array($user->type, ['admin', 'super_admin']))) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'api_url' => 'required|url',
            'api_key' => 'nullable|string',
        ]);

        Setting::set('vahan_learning_licence_url', trim($request->api_url));
        if ($request->filled('api_key')) {
            Setting::set('vahan_learning_licence_key', trim($request->api_key));
        }

        return response()->json([
            'success' => true,
            'message' => 'Learning Licence API settings updated successfully!',
            'apiUrl'  => Setting::get('vahan_learning_licence_url'),
            'apiKey'  => Setting::get('vahan_learning_licence_key'),
        ]);
    }

    public function deductCoins(Request $request)
    {
        $request->validate(['applNum' => ['required', 'string']]);

        $service = Service::where('slug', 'learning-licence-pdf')->first();
        $user = auth()->user();
        $coinCost = $service ? (int) $service->coin_cost : 19;
        $applNum = strtoupper(trim($request->input('applNum')));
        $dob = trim($request->input('dob', ''));

        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $coinCost > 0) {
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
            'coins_charged' => $isStaff ? 0 : $coinCost,
            'status'        => ServiceRequest::STATUS_COMPLETED,
            'completed_at'  => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Coins deducted.']);
    }
}

