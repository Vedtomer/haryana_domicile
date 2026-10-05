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

class FarmerPdfServer2Controller extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'farmer-pdf-server-2')
            ->orWhere('slug', 'farmer-pdf-sarver-all-state-2')
            ->orWhere('slug', 'farmer-pdf-server-all-state-2')
            ->orWhere('slug', 'farmer-card-pdf-server-2')
            ->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 49;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        $apiUrl = trim(Setting::get('farmer_pdf_server2_url', ''));
        if (empty($apiUrl)) {
            $apiUrl = 'https://good-api-point.com/apis_partner/v1/farmer_card_api/farmer_pdf_server2.php';
        }

        $apiKey = trim(Setting::get('farmer_pdf_server2_key', ''));
        if (empty($apiKey)) {
            $apiKey = trim(Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1'));
        }

        return Inertia::render('Utilities/FarmerPdfServer2', [
            'service'        => $service,
            'currentService' => $service,
            'coinCost'       => $coinCost,
            'isAdmin'        => (bool) $isStaff,
            'apiUrl'         => $isStaff ? $apiUrl : null,
            'apiKey'         => $isStaff ? $apiKey : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'aadhaar' => ['required', 'string', 'min:12', 'max:16'],
            'state'   => ['required', 'string', 'min:2', 'max:50'],
        ], [
            'aadhaar.required' => 'Please enter 12-digit Aadhaar Number.',
            'state.required'   => 'Please select or enter State (e.g. UP, HR, PB, RJ).',
        ]);

        $service = Service::where('slug', 'farmer-pdf-server-2')
            ->orWhere('slug', 'farmer-pdf-sarver-all-state-2')
            ->orWhere('slug', 'farmer-pdf-server-all-state-2')
            ->orWhere('slug', 'farmer-card-pdf-server-2')
            ->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 49;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. (Current balance: {$user->coins} coins)"
            ]);
        }

        $aadhaar = preg_replace('/\D/', '', $request->input('aadhaar'));
        if (strlen($aadhaar) !== 12) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Aadhaar number. Must be exactly 12 digits.'
            ]);
        }

        $state = strtoupper(trim($request->input('state')));

        $baseUrl = trim(Setting::get('farmer_pdf_server2_url', 'https://good-api-point.com/apis_partner/v1/farmer_card_api/farmer_pdf_server2.php'));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/farmer_card_api/farmer_pdf_server2.php';
        }

        // Clean query placeholders if pasted directly
        if (str_contains($baseUrl, 'apiKey=ENTER_API_KEY') || str_contains($baseUrl, 'aadhaar=ENTER_AADHAR_NUMBER')) {
            $baseUrl = explode('?', $baseUrl)[0];
        }

        $apiKey = trim(Setting::get('farmer_pdf_server2_key')
            ?: (Setting::get('goodapi_api_key')
            ?: 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1'));

        $queryParams = [
            'apiKey'  => $apiKey,
            'aadhaar' => $aadhaar,
            'state'   => $state,
        ];

        $url = $baseUrl . (str_contains($baseUrl, '?') ? '&' : '?') . http_build_query($queryParams);

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept'     => 'application/json, application/pdf, */*',
            ])->connectTimeout(15)->timeout(60)->get($url);

            $contentType = $response->header('Content-Type') ?? '';

            // 1. Raw PDF binary response from provider
            if (str_contains($contentType, 'application/pdf') || str_starts_with($response->body(), '%PDF')) {
                $pdfBase64 = base64_encode($response->body());

                if (!$isStaff && $coinCost > 0) {
                    $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Farmer PDF Download: ' . $aadhaar . ' (' . $state . ')');
                }

                ServiceRequest::create([
                    'user_id'       => $user->id,
                    'service_id'    => $service ? $service->id : null,
                    'service_name'  => $service ? $service->name : 'Farmer Pdf Sarver All State 2',
                    'input_data'    => [
                        'Aadhaar Number' => substr($aadhaar, 0, 4) . ' ' . substr($aadhaar, 4, 4) . ' ' . substr($aadhaar, 8, 4),
                        'State'          => $state,
                    ],
                    'coins_charged' => $isStaff ? 0 : $coinCost,
                    'status'        => ServiceRequest::STATUS_COMPLETED,
                    'completed_at'  => now(),
                ]);

                return response()->json([
                    'success'    => true,
                    'pdf_base64' => $pdfBase64,
                    'aadhaar'    => $aadhaar,
                    'state'      => $state,
                    'filename'   => 'Farmer_Card_' . $state . '_' . $aadhaar . '.pdf',
                    'message'    => 'Farmer Card PDF fetched successfully.',
                ]);
            }

            $data = $response->json();

            if (is_array($data)) {
                $status = strtolower($data['status'] ?? ($data['Status'] ?? ''));
                $statusCode = $data['StatusCode'] ?? ($data['statusCode'] ?? null);
                $isSuccess = ($status === 'success' || (int) $statusCode === 100 || (isset($data['success']) && $data['success'] === true));

                $pdfBase64 = $data['pdf'] ?? ($data['pdf_base64'] ?? ($data['base64'] ?? ($data['data']['pdf'] ?? ($data['data']['pdf_base64'] ?? null))));
                $pdfUrl = $data['file_url'] ?? ($data['pdf_url'] ?? ($data['download_url'] ?? ($data['url'] ?? ($data['data']['file_url'] ?? null))));

                if ($isSuccess && (!empty($pdfBase64) || !empty($pdfUrl))) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Farmer PDF Download: ' . $aadhaar . ' (' . $state . ')');
                    }

                    ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Farmer Pdf Sarver All State 2',
                        'input_data'    => [
                            'Aadhaar Number' => substr($aadhaar, 0, 4) . ' ' . substr($aadhaar, 4, 4) . ' ' . substr($aadhaar, 8, 4),
                            'State'          => $state,
                        ],
                        'coins_charged' => $isStaff ? 0 : $coinCost,
                        'status'        => ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success'    => true,
                        'data'       => $data,
                        'pdf_base64' => $pdfBase64,
                        'pdf_url'    => $pdfUrl,
                        'aadhaar'    => $aadhaar,
                        'state'      => $state,
                        'order_id'   => $data['order_id'] ?? null,
                        'filename'   => $data['filename'] ?? ('Farmer_Card_' . $state . '_' . $aadhaar . '.pdf'),
                        'message'    => $data['message'] ?? 'Farmer Card PDF fetched successfully.',
                    ]);
                }

                $errMsg = $data['message'] ?? ($data['msg'] ?? "Farmer PDF record not found for Aadhaar {$aadhaar}.");
                return response()->json([
                    'success' => false,
                    'message' => $errMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid response from Farmer Card provider server.',
            ]);

        } catch (\Exception $e) {
            Log::warning('Good-API-Point Farmer PDF Server 2 Exception', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'API सर्वर से संपर्क नहीं हो सका: ' . $e->getMessage(),
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

        Setting::set('farmer_pdf_server2_url', trim($request->api_url));
        if ($request->filled('api_key')) {
            Setting::set('farmer_pdf_server2_key', trim($request->api_key));
        }

        return response()->json([
            'success' => true,
            'message' => 'Farmer PDF Server 2 API settings updated successfully!',
            'apiUrl'  => Setting::get('farmer_pdf_server2_url'),
            'apiKey'  => Setting::get('farmer_pdf_server2_key'),
        ]);
    }
}
