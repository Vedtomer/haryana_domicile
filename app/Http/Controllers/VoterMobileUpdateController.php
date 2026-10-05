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

class VoterMobileUpdateController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'voter-mobile-update')->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 149;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        $apiUrl = trim(Setting::get('voter_mobile_update_url', ''));
        if (empty($apiUrl) || str_contains($apiUrl, 'nexus-dashboard.space')) {
            $apiUrl = 'https://good-api-point.com/apis_partner/v1/voter_card_api/voter_mobile_link.php';
        }

        $apiKey = trim(Setting::get('voter_mobile_update_key', ''));
        if (empty($apiKey) || $apiKey === '38cc07892c07c566e3ce1a3289c589e284954d7c0e593386') {
            $apiKey = trim(Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1'));
        }

        return Inertia::render('Utilities/VoterMobileUpdate', [
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
            'epic'   => ['required', 'string', 'min:5', 'max:30'],
            'mobile' => ['required', 'string', 'size:10', 'regex:/^[0-9]{10}$/'],
        ], [
            'epic.required'   => 'Please enter a valid Voter ID / EPIC Number.',
            'mobile.required' => 'Please enter a valid 10-digit mobile number.',
            'mobile.regex'    => 'Mobile number must be exactly 10 digits.',
        ]);

        $service = Service::where('slug', 'voter-mobile-update')->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 149;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. (Current balance: {$user->coins} coins)"
            ]);
        }

        $epic = strtoupper(trim(preg_replace('/[^A-Za-z0-9]/', '', $request->input('epic'))));
        $mobile = trim($request->input('mobile'));

        $baseUrl = trim(Setting::get('voter_mobile_update_url', ''));
        if (empty($baseUrl) || str_contains($baseUrl, 'nexus-dashboard.space')) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/voter_card_api/voter_mobile_link.php';
        }

        // Clean query placeholders if pasted directly
        if (str_contains($baseUrl, 'apiKey=ENTER_API_KEY') || str_contains($baseUrl, 'epic=ENTER_VOTER_NUMBER')) {
            $baseUrl = explode('?', $baseUrl)[0];
        }

        $apiKey = trim(Setting::get('voter_mobile_update_key', ''));
        if (empty($apiKey) || $apiKey === '38cc07892c07c566e3ce1a3289c589e284954d7c0e593386') {
            $apiKey = trim(Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1'));
        }

        if (str_contains($baseUrl, '{apiKey}') || str_contains($baseUrl, '{epic}') || str_contains($baseUrl, '{mobile}')) {
            $url = str_replace(
                ['{apiKey}', '{epic}', '{mobile}'],
                [urlencode($apiKey), urlencode($epic), urlencode($mobile)],
                $baseUrl
            );
        } else {
            $separator = str_contains($baseUrl, '?') ? '&' : '?';
            $url = $baseUrl . $separator . 'apiKey=' . urlencode($apiKey) . '&epic=' . urlencode($epic) . '&mobile=' . urlencode($mobile);
        }

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept'     => 'application/json, */*',
            ])->connectTimeout(15)->timeout(60)->get($url);

            $data = $response->json();

            if (is_array($data)) {
                $status = strtolower($data['status'] ?? ($data['Status'] ?? ''));
                $statusCode = $data['StatusCode'] ?? ($data['statusCode'] ?? null);
                $isSuccess = ($status === 'success' || (int) $statusCode === 100 || (isset($data['success']) && ($data['success'] === true || $data['success'] === 'true' || $data['success'] === 1)));

                if ($isSuccess) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "Voter Mobile Update: {$epic} -> {$mobile}");
                    }

                    ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Voter Mobile Update Instant',
                        'input_data'    => ['EPIC Number' => $epic, 'Mobile Number' => $mobile],
                        'coins_charged' => $isStaff ? 0 : $coinCost,
                        'status'        => ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'data'    => $data['data'] ?? $data,
                        'epic'    => $epic,
                        'mobile'  => $mobile,
                        'message' => $data['message'] ?? 'Mobile number updated successfully.',
                    ]);
                }

                $errMsg = $data['message'] ?? ($data['msg'] ?? 'Failed to update mobile number. Please check the EPIC and mobile number.');
                return response()->json([
                    'success' => false,
                    'message' => $errMsg,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid response from Voter provider server.',
            ]);

        } catch (\Exception $e) {
            Log::warning('Good-API-Point Voter Mobile Update Exception', ['error' => $e->getMessage()]);

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

        Setting::set('voter_mobile_update_url', trim($request->api_url));
        if ($request->filled('api_key')) {
            Setting::set('voter_mobile_update_key', trim($request->api_key));
        }

        return response()->json([
            'success' => true,
            'message' => 'Voter Mobile Update API settings updated successfully!',
            'apiUrl'  => Setting::get('voter_mobile_update_url'),
            'apiKey'  => Setting::get('voter_mobile_update_key'),
        ]);
    }
}
