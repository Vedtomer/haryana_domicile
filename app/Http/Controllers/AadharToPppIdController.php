<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Setting;
use App\Services\FasalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AadharToPppIdController extends Controller
{
    public function index()
    {
        $service = Service::where('slug', 'aadhar-to-ppp-id')->first()
            ?: Service::where('slug', 'aadhar-to-family-id')->first();

        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 0;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        return Inertia::render('Utilities/AadharToPppId', [
            'coinCost' => $coinCost,
            'service' => $service,
            'isAdmin' => (bool) $isStaff,
            'apiUrl' => $isStaff ? Setting::get('ppp_aadhar_to_ppp_url', 'https://fasal.haryana.gov.in/Home/GetFDbyAadhar?aadharnum={aadhar}') : null,
            'apiKey' => $isStaff ? Setting::get('ppp_api_key', '') : null,
        ]);
    }

    public function updateApi(Request $request)
    {
        $user = auth()->user();
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));
        if (!$isStaff) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action. Only admins can configure API settings.',
            ], 403);
        }

        $request->validate([
            'api_url' => ['required', 'string'],
            'api_key' => ['nullable', 'string'],
        ], [
            'api_url.required' => 'Please enter the API URL.',
        ]);

        $url = trim($request->input('api_url'));
        $key = trim((string) $request->input('api_key', ''));

        Setting::set('ppp_aadhar_to_ppp_url', $url);
        Setting::set('ppp_api_key', $key);

        return response()->json([
            'success' => true,
            'message' => 'Aadhar to PPP ID API configuration successfully saved!',
            'api_url' => $url,
            'api_key' => $key,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'aadhar' => ['required', 'string', 'regex:/^[0-9]{12}$/'],
        ], [
            'aadhar.required' => 'Please enter a 12-digit Aadhaar number.',
            'aadhar.regex' => 'Aadhaar number must be exactly 12 numerical digits.',
        ]);

        $service = Service::where('slug', 'aadhar-to-ppp-id')->first()
            ?: Service::where('slug', 'aadhar-to-family-id')->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 0;
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coin balance. This service requires {$coinCost} coins. Please recharge your wallet.",
            ]);
        }

        $cleanAadhar = preg_replace('/\D/', '', $request->input('aadhar'));
        $customUrl = trim((string) Setting::get('ppp_aadhar_to_ppp_url', ''));
        $apiKey = trim((string) Setting::get('ppp_api_key', ''));

        // Check if custom vendor API is configured (not empty and not pointing to fasal.haryana.gov.in)
        $isFasalUrl = empty($customUrl) || str_contains($customUrl, 'fasal.haryana.gov.in');

        if (!$isFasalUrl) {
            // Use custom third-party vendor API
            try {
                if (str_contains($customUrl, '{aadhar}') || str_contains($customUrl, '{aadharnum}')) {
                    $targetUrl = str_replace(
                        ['{aadhar}', '{aadharnum}', '{key}', '{apiKey}'],
                        [urlencode($cleanAadhar), urlencode($cleanAadhar), urlencode($apiKey), urlencode($apiKey)],
                        $customUrl
                    );
                } else {
                    $parts = parse_url($customUrl);
                    $query = [];
                    if (!empty($parts['query'])) {
                        parse_str($parts['query'], $query);
                    }
                    $query['aadharnum'] = $cleanAadhar;
                    if (!empty($apiKey)) {
                        $query['key'] = $apiKey;
                    }

                    $scheme = isset($parts['scheme']) ? $parts['scheme'] . '://' : 'https://';
                    $host = $parts['host'] ?? '';
                    $port = isset($parts['port']) ? ':' . $parts['port'] : '';
                    $path = $parts['path'] ?? '';
                    $targetUrl = $scheme . $host . $port . $path . '?' . http_build_query($query);
                }

                $headers = ['X-Requested-With' => 'XMLHttpRequest'];
                if (!empty($apiKey)) {
                    $headers['Authorization'] = 'Bearer ' . $apiKey;
                }

                $response = Http::withoutVerifying()
                    ->connectTimeout(8)
                    ->timeout(20)
                    ->withHeaders($headers)
                    ->post($targetUrl, ['aadhar' => $cleanAadhar]);

                if ($response->successful()) {
                    $data = $response->json();

                    $familyId = $data['family_id']
                        ?? $data['familyId']
                        ?? $data['data']['family_id']
                        ?? $data['Payload'][0]['familyID']
                        ?? null;

                    if ($familyId) {
                        $memberName = $data['member_name'] ?? $data['Payload'][0]['memberName'] ?? null;
                        $this->deductCoinsAndLogRequest($user, $service, $coinCost, $cleanAadhar, $familyId);

                        return response()->json([
                            'success' => true,
                            'family_id' => $familyId,
                            'member_name' => $memberName,
                            'message' => 'Family ID found successfully.',
                        ]);
                    }

                    if (!empty($data['message'])) {
                        return response()->json([
                            'success' => false,
                            'message' => $data['message'],
                        ]);
                    }
                }
            } catch (\Throwable $e) {
                Log::error('AadharToPppIdController custom API error: ' . $e->getMessage());
                // Fall back to FasalService if custom API fails
            }
        }

        // Default: Query official Haryana Fasal portal session flow
        $fasalService = app(FasalService::class);
        $result = $fasalService->searchByAadhar($cleanAadhar);

        if (!empty($result['success']) && !empty($result['family_id'])) {
            $this->deductCoinsAndLogRequest($user, $service, $coinCost, $cleanAadhar, $result['family_id']);

            return response()->json([
                'success' => true,
                'family_id' => $result['family_id'],
                'member_name' => $result['member_name'] ?? null,
                'message' => 'Family ID found successfully.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message'] ?? 'Family ID (PPP ID) not found for this Aadhaar Number.',
        ]);
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $aadhar, string $familyId): void
    {
        $isStaff = $user && ($user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']));

        if (!$isStaff && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Aadhar to PPP ID: ' . $aadhar);
        }

        try {
            ServiceRequest::create([
                'user_id' => $user->id,
                'service_id' => $service ? $service->id : null,
                'service_name' => $service ? $service->name : 'Aadhar Card to PPP ID Instant',
                'input_data' => ['Aadhar Number' => $aadhar, 'Family ID' => $familyId],
                'coins_charged' => $isStaff ? 0 : $coinCost,
                'status' => ServiceRequest::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('AadharToPppId ServiceRequest error: ' . $e->getMessage());
        }
    }
}
