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

class RationAdvanceDetailsController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'ration-advance-details')
            ->orWhere('slug', 'ration-advanse-details')
            ->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 39;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        $apiUrl = trim(Setting::get('ration_advance_details_api_url', ''));
        if (empty($apiUrl)) {
            $apiUrl = 'https://good-api-point.com/apis_partner/v1/ration_card_api/up_ration_details.php';
        }

        $apiKey = trim(Setting::get('ration_advance_details_api_key', ''));
        if (empty($apiKey)) {
            $apiKey = trim(Setting::get('aadhar_to_ration_api_key', Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1')));
        }

        return Inertia::render('Utilities/RationAdvanceDetails', [
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
            'ration_no' => ['required', 'string', 'min:4', 'max:30'],
        ], [
            'ration_no.required' => 'Please enter a valid Ration Card Number.',
            'ration_no.min'      => 'Ration Card Number must be at least 4 characters.',
        ]);

        $service = Service::where('slug', 'ration-advance-details')
            ->orWhere('slug', 'ration-advanse-details')
            ->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 39;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. (Current balance: {$user->coins} coins)"
            ]);
        }

        $cleanRationNo = strtoupper(trim(preg_replace('/[^A-Za-z0-9]/', '', $request->input('ration_no'))));

        $baseUrl = trim(Setting::get('ration_advance_details_api_url', 'https://good-api-point.com/apis_partner/v1/ration_card_api/up_ration_details.php'));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/ration_card_api/up_ration_details.php';
        }

        // Clean query placeholders if pasted directly
        if (str_contains($baseUrl, 'apiKey=ENTER_API_KEY') || str_contains($baseUrl, 'ration_no=ENTER_RATION_NUMBER')) {
            $baseUrl = explode('?', $baseUrl)[0];
        }

        $apiKey = trim(Setting::get('ration_advance_details_api_key')
            ?: (Setting::get('aadhar_to_ration_api_key')
            ?: (Setting::get('goodapi_api_key')
            ?: 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1')));

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{ration_no}') || str_contains($baseUrl, '{rc_no}')) {
            $url = str_replace(
                ['{apiKey}', '{ration_no}', '{rc_no}'],
                [urlencode($apiKey), urlencode($cleanRationNo), urlencode($cleanRationNo)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . 'apiKey=' . urlencode($apiKey) . '&ration_no=' . urlencode($cleanRationNo);
        }

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
                    $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Ration Advance Details Download: ' . $cleanRationNo);
                }

                ServiceRequest::create([
                    'user_id'       => $user->id,
                    'service_id'    => $service ? $service->id : null,
                    'service_name'  => $service ? $service->name : 'Ration Advanse Details',
                    'input_data'    => ['Ration Card Number' => $cleanRationNo],
                    'coins_charged' => $isStaff ? 0 : $coinCost,
                    'status'        => ServiceRequest::STATUS_COMPLETED,
                    'completed_at'  => now(),
                ]);

                return response()->json([
                    'success'    => true,
                    'pdf_base64' => $pdfBase64,
                    'ration_no'  => $cleanRationNo,
                    'filename'   => 'Ration_' . $cleanRationNo . '.pdf',
                    'message'    => 'Ration Advance Details PDF generated successfully!',
                ]);
            }

            $data = $response->json();

            if (is_array($data)) {
                $status = strtolower($data['status'] ?? ($data['Status'] ?? ''));
                $statusCode = $data['StatusCode'] ?? ($data['statusCode'] ?? null);
                $isSuccess = ($status === 'success' || (int) $statusCode === 100 || (isset($data['success']) && $data['success'] === true));

                $pdfBase64 = $data['pdf'] ?? ($data['pdf_base64'] ?? ($data['base64'] ?? ($data['data']['pdf'] ?? ($data['data']['pdf_base64'] ?? null))));
                $pdfUrl = $data['file_url'] ?? ($data['pdf_url'] ?? ($data['download_url'] ?? ($data['url'] ?? ($data['data']['file_url'] ?? ($data['data']['pdf_url'] ?? null)))));

                $payloadData = $data['data'] ?? $data;

                if ($isSuccess && (!empty($pdfBase64) || !empty($pdfUrl) || !empty($data['data']))) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Ration Advance Details Download: ' . $cleanRationNo);
                    }

                    ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Ration Advanse Details',
                        'input_data'    => ['Ration Card Number' => $cleanRationNo],
                        'coins_charged' => $isStaff ? 0 : $coinCost,
                        'status'        => ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success'    => true,
                        'data'       => $payloadData,
                        'pdf_base64' => $pdfBase64,
                        'pdf_url'    => $pdfUrl,
                        'ration_no'  => $cleanRationNo,
                        'filename'   => 'Ration_' . $cleanRationNo . '.pdf',
                        'message'    => $data['message'] ?? 'Ration Advance Details fetched successfully!',
                    ]);
                }

                $errMsg = $data['message'] ?? ($data['msg'] ?? "Ration card details not found for '{$cleanRationNo}'.");
                return response()->json([
                    'success' => false,
                    'message' => $errMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid response from Ration provider server.',
            ]);

        } catch (\Exception $e) {
            Log::warning('Good-API-Point Ration Advance Details Exception', ['error' => $e->getMessage()]);

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

        Setting::set('ration_advance_details_api_url', trim($request->api_url));
        if ($request->filled('api_key')) {
            Setting::set('ration_advance_details_api_key', trim($request->api_key));
        }

        return response()->json([
            'success' => true,
            'message' => 'Ration Advance Details API settings updated successfully!',
            'apiUrl'  => Setting::get('ration_advance_details_api_url'),
            'apiKey'  => Setting::get('ration_advance_details_api_key'),
        ]);
    }
}
