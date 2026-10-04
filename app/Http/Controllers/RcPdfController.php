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

class RcPdfController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'rc-pdf-owner-book-print')
            ->orWhere('slug', 'rc-pdf-instant')
            ->orWhere('slug', 'rc-pdf')
            ->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 49;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        $rcPdfUrl = trim(Setting::get('vahan_rc_pdf_url', ''));
        if (empty($rcPdfUrl) || str_contains($rcPdfUrl, 'nexus-dashboard.space')) {
            $rcPdfUrl = 'https://good-api-point.com/apis_partner/v1/vahan_service_api/vechil_rc_pdf.php';
        }

        $rcPdfKey = trim(Setting::get('vahan_rc_pdf_key', ''));
        if (empty($rcPdfKey)) {
            $rcPdfKey = trim(Setting::get('goodapi_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815'));
        }

        return Inertia::render('Utilities/RcPdf', [
            'service'        => $service,
            'currentService' => $service,
            'coinCost'       => $coinCost,
            'isAdmin'        => (bool) $isStaff,
            'apiUrl'         => $isStaff ? $rcPdfUrl : null,
            'apiKey'         => $isStaff ? $rcPdfKey : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'vechil_no' => ['required', 'string', 'min:6', 'max:15']
        ], [
            'vechil_no.required' => 'Please enter a valid Vehicle Registration Number (e.g. HR26DK8337).'
        ]);

        $service = Service::where('slug', 'rc-pdf-owner-book-print')
            ->orWhere('slug', 'rc-pdf-instant')
            ->orWhere('slug', 'rc-pdf')
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

        $vechilNo = strtoupper(trim(preg_replace('/[^A-Za-z0-9]/', '', $request->input('vechil_no'))));

        $baseUrl = trim(Setting::get('vahan_rc_pdf_url', 'https://good-api-point.com/apis_partner/v1/vahan_service_api/vechil_rc_pdf.php'));
        if (empty($baseUrl) || str_contains($baseUrl, 'nexus-dashboard.space')) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/vahan_service_api/vechil_rc_pdf.php';
        }

        // Clean query placeholders if pasted directly
        if (str_contains($baseUrl, 'apiKey=ENTER_API_KEY') || str_contains($baseUrl, 'vechil_no=ENTER_VEHICLE_NUMBER')) {
            $baseUrl = explode('?', $baseUrl)[0];
        }

        $apiKey = trim(Setting::get('vahan_rc_pdf_key')
            ?: (Setting::get('goodapi_api_key')
            ?: '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815'));

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{vechil_no}') || str_contains($baseUrl, '{vehicle_number}')) {
            $url = str_replace(
                ['{apiKey}', '{vechil_no}', '{vehicle_number}', '{vehicle_no}', '{reg_no}'],
                [urlencode($apiKey), urlencode($vechilNo), urlencode($vechilNo), urlencode($vechilNo), urlencode($vechilNo)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . 'apiKey=' . urlencode($apiKey) . '&vechil_no=' . urlencode($vechilNo);
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
                    $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'RC PDF Owner Book Download: ' . $vechilNo);
                }

                ServiceRequest::create([
                    'user_id'       => $user->id,
                    'service_id'    => $service ? $service->id : null,
                    'service_name'  => $service ? $service->name : 'Rc Pdf Owner Book Print',
                    'input_data'    => ['Vehicle Number' => $vechilNo],
                    'coins_charged' => $isStaff ? 0 : $coinCost,
                    'status'        => ServiceRequest::STATUS_COMPLETED,
                    'completed_at'  => now(),
                ]);

                return response()->json([
                    'success'    => true,
                    'pdf_base64' => $pdfBase64,
                    'vechil_no'  => $vechilNo,
                    'message'    => 'RC Owner Book PDF downloaded successfully.',
                ]);
            }

            $data = $response->json();

            if (is_array($data)) {
                $status = $data['Status'] ?? ($data['status'] ?? null);
                $statusCode = $data['StatusCode'] ?? ($data['statusCode'] ?? null);
                $isSuccess = ($status === 'Success' || $status === 'success' || $status === true || (int) $statusCode === 100);

                $pdfBase64 = $data['pdf_base64'] ?? ($data['pdf'] ?? ($data['base64'] ?? ($data['data']['pdf'] ?? ($data['data']['pdf_base64'] ?? null))));
                $pdfUrl = $data['file_url'] ?? ($data['pdf_url'] ?? ($data['url'] ?? ($data['download_url'] ?? ($data['data']['file_url'] ?? ($data['data']['pdf_url'] ?? null)))));

                if ($isSuccess && (!empty($pdfBase64) || !empty($pdfUrl) || !empty($data['data']))) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'RC PDF Owner Book Download: ' . $vechilNo);
                    }

                    ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Rc Pdf Owner Book Print',
                        'input_data'    => ['Vehicle Number' => $vechilNo],
                        'coins_charged' => $isStaff ? 0 : $coinCost,
                        'status'        => ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success'    => true,
                        'data'       => $data,
                        'pdf_base64' => $pdfBase64,
                        'pdf_url'    => $pdfUrl,
                        'vechil_no'  => $vechilNo,
                        'message'    => $data['message'] ?? 'RC Owner Book PDF downloaded successfully.',
                    ]);
                }

                $errMsg = $data['message'] ?? ($data['msg'] ?? "Vehicle RC PDF record not found for '{$vechilNo}'.");
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
            Log::warning('Good-API-Point RC PDF Exception', ['error' => $e->getMessage()]);

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

        Setting::set('vahan_rc_pdf_url', trim($request->api_url));
        if ($request->filled('api_key')) {
            Setting::set('vahan_rc_pdf_key', trim($request->api_key));
        }

        return response()->json([
            'success' => true,
            'message' => 'RC PDF API settings updated successfully!',
            'apiUrl'  => Setting::get('vahan_rc_pdf_url'),
            'apiKey'  => Setting::get('vahan_rc_pdf_key'),
        ]);
    }
}

