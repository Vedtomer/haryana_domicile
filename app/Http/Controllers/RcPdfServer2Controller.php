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

class RcPdfServer2Controller extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'rc-pdf-server-2')
            ->orWhere('slug', 'rc-pdf-sarver-2')
            ->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 149;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        $rcPdf2Url = trim(Setting::get('vahan_rc_pdf2_url', ''));
        if (empty($rcPdf2Url) || str_contains($rcPdf2Url, 'nexus-dashboard.space')) {
            $rcPdf2Url = 'https://good-api-point.com/apis_partner/v1/vahan_service_api/vechil_rc_pdf2.php';
        }

        $rcPdf2Key = trim(Setting::get('vahan_rc_pdf2_key', ''));
        if (empty($rcPdf2Key)) {
            $rcPdf2Key = trim(Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1'));
        }

        return Inertia::render('Utilities/RcPdfServer2', [
            'service'        => $service,
            'currentService' => $service,
            'coinCost'       => $coinCost,
            'isAdmin'        => (bool) $isStaff,
            'apiUrl'         => $isStaff ? $rcPdf2Url : null,
            'apiKey'         => $isStaff ? $rcPdf2Key : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'rcno'     => ['required', 'string', 'min:6', 'max:20'],
            'chiptype' => ['nullable', 'string', 'max:50'],
            'cardtype' => ['nullable', 'string', 'max:50'],
        ], [
            'rcno.required' => 'Please enter RC Number (e.g. HR26DK8337).'
        ]);

        $service = Service::where('slug', 'rc-pdf-server-2')
            ->orWhere('slug', 'rc-pdf-sarver-2')
            ->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 149;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. (Current balance: {$user->coins} coins)"
            ]);
        }

        $rcNo = strtoupper(trim(preg_replace('/[^A-Za-z0-9]/', '', $request->input('rcno'))));
        $chipType = trim($request->input('chiptype', ''));
        $cardType = trim($request->input('cardtype', ''));

        $baseUrl = trim(Setting::get('vahan_rc_pdf2_url', 'https://good-api-point.com/apis_partner/v1/vahan_service_api/vechil_rc_pdf2.php'));
        if (empty($baseUrl) || str_contains($baseUrl, 'nexus-dashboard.space')) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/vahan_service_api/vechil_rc_pdf2.php';
        }

        // Clean query placeholders if pasted directly
        if (str_contains($baseUrl, 'apiKey=ENTER_API_KEY') || str_contains($baseUrl, 'rcno=ENTER_RC_NUMBER')) {
            $baseUrl = explode('?', $baseUrl)[0];
        }

        $apiKey = trim(Setting::get('vahan_rc_pdf2_key')
            ?: (Setting::get('goodapi_api_key')
            ?: 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1'));

        $queryParams = [
            'apiKey' => $apiKey,
            'rcno'   => $rcNo,
        ];
        if (!empty($chipType)) {
            $queryParams['chiptype'] = $chipType;
        }
        if (!empty($cardType)) {
            $queryParams['cardtype'] = $cardType;
        }

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
                    $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'RC PDF Server 2 Download: ' . $rcNo);
                }

                ServiceRequest::create([
                    'user_id'       => $user->id,
                    'service_id'    => $service ? $service->id : null,
                    'service_name'  => $service ? $service->name : 'Rc Pdf Sarver 2',
                    'input_data'    => [
                        'RC Number' => $rcNo,
                        'Chip Type' => $chipType ?: 'N/A',
                        'Card Type' => $cardType ?: 'N/A',
                    ],
                    'coins_charged' => $isStaff ? 0 : $coinCost,
                    'status'        => ServiceRequest::STATUS_COMPLETED,
                    'completed_at'  => now(),
                ]);

                return response()->json([
                    'success'    => true,
                    'pdf_base64' => $pdfBase64,
                    'rcno'       => $rcNo,
                    'filename'   => 'RC_' . $rcNo . '.pdf',
                    'message'    => 'RC PDF Server 2 fetched successfully.',
                ]);
            }

            $data = $response->json();

            if (is_array($data)) {
                $status = strtolower($data['status'] ?? ($data['Status'] ?? ''));
                $statusCode = $data['StatusCode'] ?? ($data['statusCode'] ?? null);
                $isSuccess = ($status === 'success' || (int) $statusCode === 100 || (isset($data['success']) && $data['success'] === true));

                $pdfBase64 = $data['pdf'] ?? ($data['pdf_base64'] ?? ($data['base64'] ?? ($data['data']['pdf'] ?? ($data['data']['pdf_base64'] ?? null))));
                $pdfUrl = $data['file_url'] ?? ($data['pdf_url'] ?? ($data['download_url'] ?? ($data['url'] ?? ($data['data']['file_url'] ?? null))));

                // Provider returns empty string in pdf if not found even when status is 'success'
                if ($isSuccess && (!empty($pdfBase64) || !empty($pdfUrl))) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'RC PDF Server 2 Download: ' . $rcNo);
                    }

                    ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Rc Pdf Sarver 2',
                        'input_data'    => [
                            'RC Number' => $rcNo,
                            'Chip Type' => $chipType ?: 'N/A',
                            'Card Type' => $cardType ?: 'N/A',
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
                        'rcno'       => $rcNo,
                        'order_id'   => $data['order_id'] ?? null,
                        'filename'   => $data['filename'] ?? ('RC_' . $rcNo . '.pdf'),
                        'message'    => $data['message'] ?? 'RC PDF Server 2 fetched successfully.',
                    ]);
                }

                $errMsg = $data['message'] ?? ($data['msg'] ?? "Vehicle RC PDF record not found for '{$rcNo}'.");
                return response()->json([
                    'success' => false,
                    'message' => $errMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid response from RC provider server.',
            ]);

        } catch (\Exception $e) {
            Log::warning('Good-API-Point RC PDF Server 2 Exception', ['error' => $e->getMessage()]);

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

        Setting::set('vahan_rc_pdf2_url', trim($request->api_url));
        if ($request->filled('api_key')) {
            Setting::set('vahan_rc_pdf2_key', trim($request->api_key));
        }

        return response()->json([
            'success' => true,
            'message' => 'RC PDF Server 2 API settings updated successfully!',
            'apiUrl'  => Setting::get('vahan_rc_pdf2_url'),
            'apiKey'  => Setting::get('vahan_rc_pdf2_key'),
        ]);
    }
}
