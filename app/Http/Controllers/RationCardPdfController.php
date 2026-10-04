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

class RationCardPdfController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'ration-card-pdf')->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 19;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/RationCardPdf', [
            'service' => $service,
            'coinCost' => $coinCost,
            'isAdmin' => (bool) $isStaff,
            'apiUrl' => $isStaff ? Setting::get('ration_card_pdf_api_url', 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_card_pdf.php') : null,
            'apiKey' => $isStaff ? Setting::get('ration_card_pdf_api_key', Setting::get('aadhar_to_ration_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815')) : null,
        ]);
    }

    public function download(Request $request)
    {
        $request->validate([
            'ration_no' => ['required', 'string', 'min:4', 'max:30'],
        ], [
            'ration_no.required' => 'Please enter a valid Ration Card Number.',
            'ration_no.min' => 'Ration Card Number must be at least 4 characters.',
        ]);

        $service = Service::where('slug', 'ration-card-pdf')->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 19;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet."
            ]);
        }

        $cleanRationNo = trim($request->input('ration_no'));

        $baseUrl = trim(Setting::get('ration_card_pdf_api_url', 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_card_pdf.php'));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_card_pdf.php';
        }

        $apiKey = trim(Setting::get('ration_card_pdf_api_key', Setting::get('aadhar_to_ration_api_key', Setting::get('goodapi_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815'))));

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'message' => 'API Key is not configured. Please enter your API key in Admin API Settings.'
            ]);
        }

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{ration_no}') || str_contains($baseUrl, '{rc_no}')) {
            $url = str_replace(
                ['{apiKey}', '{ration_no}', '{rc_no}'],
                [urlencode($apiKey), urlencode($cleanRationNo), urlencode($cleanRationNo)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . "apiKey=" . urlencode($apiKey) . "&ration_no=" . urlencode($cleanRationNo);
        }

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept'     => 'application/json, application/pdf, */*',
            ])->connectTimeout(10)->timeout(45)->get($url);

            $contentType = $response->header('Content-Type') ?? '';

            // 1. Raw PDF binary response from provider
            if (str_contains($contentType, 'application/pdf') || str_starts_with($response->body(), '%PDF')) {
                $pdfBase64 = base64_encode($response->body());

                if (!$isStaff && $coinCost > 0) {
                    $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Ration Card PDF Download: ' . $cleanRationNo);
                }

                try {
                    ServiceRequest::create([
                        'user_id' => $user->id,
                        'service_id' => $service ? $service->id : null,
                        'service_name' => $service ? $service->name : 'Ration Card PDF Download',
                        'input_data' => ['Ration Card Number' => $cleanRationNo],
                        'coins_charged' => $isStaff ? 0 : $coinCost,
                        'status' => ServiceRequest::STATUS_COMPLETED,
                        'completed_at' => now(),
                    ]);
                } catch (\Throwable $logEx) {
                    Log::error('ServiceRequest create error in RationCardPdf: ' . $logEx->getMessage());
                }

                return response()->json([
                    'success' => true,
                    'pdf_base64' => $pdfBase64,
                    'ration_no' => $cleanRationNo,
                    'message' => 'Ration Card PDF generated successfully!'
                ]);
            }

            // 2. JSON response
            $data = $response->json();

            if (is_array($data)) {
                $status = $data['Status'] ?? ($data['status'] ?? null);
                $statusCode = $data['StatusCode'] ?? ($data['statusCode'] ?? null);
                $isSuccess = (is_string($status) && strtolower($status) === 'success') || (int) $statusCode === 100 || $status === true;

                $pdfUrl = $data['pdf_url'] ?? ($data['file_url'] ?? ($data['download_url'] ?? ($data['url'] ?? null)));
                $pdfBase64 = $data['pdf'] ?? ($data['base64'] ?? ($data['pdf_base64'] ?? null));

                if (!$pdfUrl && !$pdfBase64 && isset($data['data']) && is_array($data['data'])) {
                    $pdfUrl = $data['data']['pdf_url'] ?? ($data['data']['file_url'] ?? ($data['data']['download_url'] ?? ($data['data']['url'] ?? null)));
                    $pdfBase64 = $data['data']['pdf'] ?? ($data['data']['base64'] ?? ($data['data']['pdf_base64'] ?? null));
                }

                if ($isSuccess || !empty($pdfUrl) || !empty($pdfBase64)) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Ration Card PDF Download: ' . $cleanRationNo);
                    }

                    try {
                        ServiceRequest::create([
                            'user_id' => $user->id,
                            'service_id' => $service ? $service->id : null,
                            'service_name' => $service ? $service->name : 'Ration Card PDF Download',
                            'input_data' => ['Ration Card Number' => $cleanRationNo],
                            'coins_charged' => $isStaff ? 0 : $coinCost,
                            'status' => ServiceRequest::STATUS_COMPLETED,
                            'completed_at' => now(),
                        ]);
                    } catch (\Throwable $logEx) {
                        Log::error('ServiceRequest create error in RationCardPdf: ' . $logEx->getMessage());
                    }

                    return response()->json([
                        'success' => true,
                        'pdf_url' => $pdfUrl,
                        'pdf_base64' => $pdfBase64,
                        'ration_no' => $cleanRationNo,
                        'data' => $data['data'] ?? $data,
                        'message' => $data['message'] ?? 'Ration Card PDF generated successfully!'
                    ]);
                }

                $errMsg = $data['message'] ?? 'Ration Card PDF not found for this number.';
                return response()->json([
                    'success' => false,
                    'message' => $errMsg
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Unexpected response from provider. Status: ' . $response->status()
            ]);

        } catch (\Throwable $e) {
            Log::error('RationCardPdf Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Connection timeout or server error. Please try again later.'
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
            'api_url' => ['required', 'string'],
            'api_key' => ['nullable', 'string'],
        ]);

        Setting::set('ration_card_pdf_api_url', trim($request->input('api_url')));
        if ($request->filled('api_key')) {
            Setting::set('ration_card_pdf_api_key', trim($request->input('api_key')));
        }

        return response()->json([
            'success' => true,
            'message' => 'Ration Card PDF API settings saved successfully!'
        ]);
    }
}
