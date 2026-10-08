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

class VoterNameFindController extends Controller
{
    public function index(Request $request)
    {
        $service = Service::where('slug', 'voter-name-find')
            ->orWhere('slug', 'voter-to-name')
            ->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 9;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        $apiUrl = trim(Setting::get('voter_name_find_url', ''));
        if (empty($apiUrl)) {
            $apiUrl = 'https://good-api-point.com/apis_partner/v1/voter_card_api/voter_to_name.php';
        }

        $apiKey = trim(Setting::get('voter_name_find_key', ''));
        if (empty($apiKey)) {
            $apiKey = trim(Setting::get('goodapi_api_key', 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1'));
        }

        return Inertia::render('Utilities/VoterNameFind', [
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
            'epic' => ['required', 'string', 'min:5', 'max:30'],
        ], [
            'epic.required' => 'Please enter a valid Voter ID / EPIC Number.',
            'epic.min'      => 'EPIC Number must be at least 5 characters.',
        ]);

        $service = Service::where('slug', 'voter-name-find')
            ->orWhere('slug', 'voter-to-name')
            ->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 9;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. (Current balance: {$user->coins} coins)"
            ]);
        }

        $cleanEpic = strtoupper(trim(preg_replace('/[^A-Za-z0-9]/', '', $request->input('epic'))));

        $baseUrl = trim(Setting::get('voter_name_find_url', ''));
        if (empty($baseUrl)) {
            $baseUrl = 'https://good-api-point.com/apis_partner/v1/voter_card_api/voter_to_name.php';
        }

        // Clean query placeholders if pasted directly
        if (str_contains($baseUrl, 'apiKey=ENTER_API_KEY') || str_contains($baseUrl, 'epic=ENTER_VOTER_NUMBER')) {
            $baseUrl = explode('?', $baseUrl)[0];
        }

        $apiKey = \App\Services\GoodApiService::getApiKey(Setting::get('voter_name_find_key'));
        $url = \App\Services\GoodApiService::buildUrl($baseUrl, [
            'epic'     => $cleanEpic,
            'voter_no' => $cleanEpic,
        ], $apiKey);

        try {
            $response = \App\Services\GoodApiService::client(40, $apiKey)->get($url);

            $data = $response->json();

            if (is_array($data)) {
                $status = strtolower($data['status'] ?? ($data['Status'] ?? ''));
                $statusCode = $data['StatusCode'] ?? ($data['statusCode'] ?? null);
                $isSuccess = ($status === 'success' || (int) $statusCode === 100 || (isset($data['success']) && ($data['success'] === true || $data['success'] === 'true' || $data['success'] === 1)));

                $payloadData = is_array($data['data'] ?? null) ? $data['data'] : $data;

                $voterName = $payloadData['name'] ?? ($payloadData['voter_name'] ?? ($payloadData['elector_name'] ?? ($payloadData['applicant_name'] ?? null)));
                $hasName = !empty($voterName);

                if (($isSuccess || $hasName) && $status !== 'failed' && (int)$statusCode !== 101) {
                    if (!$isStaff && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, "Voter Name Find: {$cleanEpic}");
                    }

                    ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Voter Name Find',
                        'input_data'    => ['EPIC Number' => $cleanEpic],
                        'coins_charged' => $isStaff ? 0 : $coinCost,
                        'status'        => ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'data'    => $payloadData,
                        'epic'    => $cleanEpic,
                        'name'    => $voterName,
                        'message' => $data['message'] ?? 'Voter details fetched successfully.',
                    ]);
                }

                $errMsg = $data['message'] ?? ($data['msg'] ?? "Voter details not found for '{$cleanEpic}'.");
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
            Log::warning('Good-API-Point Voter Name Find Exception', ['error' => $e->getMessage()]);

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

        Setting::set('voter_name_find_url', trim($request->api_url));
        if ($request->filled('api_key')) {
            Setting::set('voter_name_find_key', trim($request->api_key));
        }

        return response()->json([
            'success' => true,
            'message' => 'Voter Name Find API settings updated successfully!',
            'apiUrl'  => Setting::get('voter_name_find_url'),
            'apiKey'  => Setting::get('voter_name_find_key'),
        ]);
    }
}
