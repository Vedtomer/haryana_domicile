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

class AadharToIdIntelligenceController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'aadhar-to-id-intelligence')
            ->orWhere('slug', 'aadhar-to-id-intelligence-details')
            ->orWhere('slug', 'id-intelligence')
            ->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 199;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        $apiUrl = trim(Setting::get('id_intelligence_api_url', ''));
        if (empty($apiUrl)) {
            $apiUrl = 'https://good-api-point.com/apis_partner/v1/telecom_api/id_intelligence.php';
        }

        $apiKey = trim(Setting::get('id_intelligence_api_key', ''));
        if (empty($apiKey)) {
            $apiKey = trim(Setting::get('goodapi_api_key', '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815'));
        }

        return Inertia::render('Utilities/AadharToIdIntelligence', [
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
            'aadhaar' => ['required', 'string', 'regex:/^[0-9]{12}$/'],
        ], [
            'aadhaar.required' => 'Please enter a valid 12-digit Aadhaar number.',
            'aadhaar.regex'    => 'Aadhaar number must be exactly 12 numeric digits.',
        ]);

        $service = Service::where('slug', 'aadhar-to-id-intelligence')
            ->orWhere('slug', 'aadhar-to-id-intelligence-details')
            ->orWhere('slug', 'id-intelligence')
            ->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 199;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. (Current balance: {$user->coins} coins)"
            ]);
        }

        $cleanAadhaar = preg_replace('/\D/', '', $request->input('aadhaar'));

        $baseUrl = trim(Setting::get('id_intelligence_api_url', ''));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/telecom_api/id_intelligence.php';
        }

        // Clean query placeholders or missing slash
        if (str_contains($baseUrl, 'good-api-point.comapis_partner')) {
            $baseUrl = str_replace('good-api-point.comapis_partner', 'good-api-point.com/apis_partner', $baseUrl);
        }
        if (str_contains($baseUrl, 'apiKey=ENTER_API_KEY') || str_contains($baseUrl, 'aadhaar=ENTER_AADHAR_NUMBER')) {
            $baseUrl = explode('?', $baseUrl)[0];
        }

        $apiKey = trim(Setting::get('id_intelligence_api_key')
            ?: (Setting::get('goodapi_api_key')
            ?: '9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815'));

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{aadhaar}') || str_contains($baseUrl, '{uid}')) {
            $url = str_replace(
                ['{apiKey}', '{aadhaar}', '{uid}'],
                [urlencode($apiKey), urlencode($cleanAadhaar), urlencode($cleanAadhaar)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . 'apiKey=' . urlencode($apiKey) . '&aadhaar=' . urlencode($cleanAadhaar);
        }

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept'     => 'application/json, application/pdf, */*',
            ])->connectTimeout(15)->timeout(60)->get($url);

            $data = $response->json();

            if (is_array($data)) {
                $status = strtolower($data['status'] ?? ($data['Status'] ?? ''));
                $statusCode = $data['StatusCode'] ?? ($data['statusCode'] ?? null);
                $isSuccess = ($status === 'success' || (int) $statusCode === 100 || (isset($data['success']) && ($data['success'] === true || $data['success'] === 'true' || $data['success'] === 1)));

                $payloadData = is_array($data['data'] ?? null) ? $data['data'] : $data;

                $records = $payloadData['records'] ?? [];
                $associatedMobiles = $payloadData['associated_mobiles'] ?? [];
                $hasRecords = !empty($records) || !empty($associatedMobiles) || isset($payloadData['total_records']);

                if (($isSuccess || $hasRecords) && $status !== 'failed' && (int)$statusCode !== 101) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "Aadhar To ID Intelligence: {$cleanAadhaar}");
                    }

                    ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Aadhar To ID Intelligence Details',
                        'input_data'    => ['Aadhaar Number' => $cleanAadhaar],
                        'coins_charged' => $isStaff ? 0 : $coinCost,
                        'status'        => ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success'              => true,
                        'data'                 => $payloadData,
                        'aadhaar'              => $cleanAadhaar,
                        'total_records'        => $payloadData['total_records'] ?? count($records),
                        'unique_mobiles_count' => $payloadData['unique_mobiles_count'] ?? count($associatedMobiles),
                        'records'              => $records,
                        'associated_mobiles'   => $associatedMobiles,
                        'pdf_url'              => $payloadData['pdf_url'] ?? ($payloadData['file_url'] ?? null),
                        'pdf_base64'           => $payloadData['pdf_base64'] ?? ($payloadData['pdf'] ?? null),
                        'filename'             => 'ID_Intelligence_' . $cleanAadhaar . '.pdf',
                        'message'              => $data['message'] ?? 'ID Intelligence data retrieved successfully.',
                    ]);
                }

                $errMsg = $data['message'] ?? ($data['msg'] ?? "No telecom ID records found for Aadhaar '{$cleanAadhaar}'.");
                return response()->json([
                    'success' => false,
                    'message' => $errMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid response from Telecom ID Intelligence provider.',
            ]);

        } catch (\Exception $e) {
            Log::warning('Good-API-Point ID Intelligence Exception', ['error' => $e->getMessage()]);

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

        Setting::set('id_intelligence_api_url', trim($request->api_url));
        if ($request->filled('api_key')) {
            Setting::set('id_intelligence_api_key', trim($request->api_key));
        }

        return response()->json([
            'success' => true,
            'message' => 'Aadhar To ID Intelligence API settings updated successfully!',
            'apiUrl'  => Setting::get('id_intelligence_api_url'),
            'apiKey'  => Setting::get('id_intelligence_api_key'),
        ]);
    }
}
