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

        try {
            $response = Http::connectTimeout(5)->timeout(25)->get($url);
            $data = $response->json();

            if ($response->successful() && isset($data['Status']) && $data['Status'] === 'Success' && (isset($data['data']) || isset($data['pdf_url']) || isset($data['pdf']) || isset($data['file_url']))) {
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

            // Extract genuine message from API server if available
            $apiMsg = is_array($data) ? ($data['message'] ?? $data['msg'] ?? null) : null;
            if ($apiMsg) {
                if (stripos($apiMsg, 'temporarily unavailable') !== false || $response->status() === 503) {
                    $formattedMsg = "Nexus Vahan API Server Temporarily Unavailable (" . $apiMsg . ")। कृपया थोड़ी देर बाद प्रयास करें या नीचे दिए आधिकारिक Parivahan Sarathi पोर्टल से सीधे डाउनलोड करें।";
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
                'message' => 'Application Number ' . $applNum . ' के लिए रिकॉर्ड नहीं मिला। कृपया एप्लीकेशन नंबर व जन्मतिथि की जांच करें या Parivahan पोर्टल से सीधे देखें।',
                'direct_portal' => 'https://sarathi.parivahan.gov.in/sarathiservice/printlearninglicence.do',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'API सर्वर से संपर्क नहीं हो सका: ' . $e->getMessage(),
                'direct_portal' => 'https://sarathi.parivahan.gov.in/sarathiservice/printlearninglicence.do',
            ]);
        }
    }
}
