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

class FamilyIdToMobileController extends Controller
{
    public function index()
    {
        $this->requireService('family-id-to-mobile');

        $service = Service::where('slug', 'family-id-to-mobile')->first();
        $user    = auth()->user();
        $isStaff = $this->isStaff();

        return Inertia::render('Utilities/FamilyIdToMobile', [
            'service'  => $service,
            'isAdmin'  => $isStaff,
            'apiUrl'   => $isStaff ? Setting::get('family_id_to_mobile_url', '') : null,
            'apiKey'   => $isStaff ? Setting::get('family_id_to_mobile_key', '') : null,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'family_id' => 'required|string|min:4|max:15',
        ], [
            'family_id.required' => 'Please enter a valid Family ID (PPP ID).',
            'family_id.min'      => 'Family ID must be at least 4 characters.',
        ]);

        $familyId = strtoupper(trim($request->input('family_id')));
        $service  = Service::where('slug', 'family-id-to-mobile')->first();
        $user     = auth()->user();
        $coinCost = $service ? (int) $service->coin_cost : 9;
        $isStaff  = $this->isStaff();

        if (!$isStaff && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins.",
            ]);
        }

        // =====================================================================
        // TRY CUSTOM API (configurable from admin API Settings)
        // =====================================================================
        $apiUrl = trim((string) Setting::get('family_id_to_mobile_url', ''));
        $apiKey = trim((string) Setting::get('family_id_to_mobile_key', ''));

        if (!empty($apiUrl)) {
            try {
                // Support {family_id} or {ppp_id} placeholder in URL
                if (str_contains($apiUrl, '{family_id}') || str_contains($apiUrl, '{ppp_id}')) {
                    $targetUrl = str_replace(
                        ['{family_id}', '{ppp_id}', '{key}'],
                        [urlencode($familyId), urlencode($familyId), urlencode($apiKey)],
                        $apiUrl
                    );
                } else {
                    $separator = str_contains($apiUrl, '?') ? '&' : '?';
                    $targetUrl = $apiUrl . $separator . 'family_id=' . urlencode($familyId);
                }

                $headers = ['Accept' => 'application/json', 'X-Requested-With' => 'XMLHttpRequest'];
                if (!empty($apiKey)) {
                    $headers['Authorization'] = 'Bearer ' . $apiKey;
                    $headers['X-API-KEY']     = $apiKey;
                }

                $response = Http::withoutVerifying()
                    ->connectTimeout(10)
                    ->timeout(25)
                    ->withHeaders($headers)
                    ->get($targetUrl, ['family_id' => $familyId, 'key' => $apiKey]);

                if ($response->successful()) {
                    $data    = $response->json();
                    $members = $data['members']
                        ?? $data['data']['members']
                        ?? $data['data']
                        ?? $data['Payload']
                        ?? [];

                    if (!empty($members) && is_array($members)) {
                        // Normalize member fields
                        $members = array_map(fn ($m) => [
                            'name'     => $m['name'] ?? $m['memberName'] ?? $m['member_name'] ?? 'N/A',
                            'relation' => $m['relation'] ?? $m['relationWithHead'] ?? 'Member',
                            'gender'   => $m['gender'] ?? $m['sex'] ?? 'N/A',
                            'age'      => $m['age'] ?? null,
                            'mobile'   => $m['mobile'] ?? $m['mobileNumber'] ?? $m['phone'] ?? null,
                            'status'   => $m['status'] ?? null,
                        ], $members);

                        $this->deductAndLog($user, $service, $coinCost, $isStaff, $familyId, count($members));

                        return response()->json([
                            'success'       => true,
                            'family_id'     => $familyId,
                            'total_members' => count($members),
                            'members'       => $members,
                        ]);
                    }

                    return response()->json([
                        'success' => false,
                        'message' => $data['message'] ?? 'No records found for this Family ID.',
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('FamilyIdToMobileController API error: ' . $e->getMessage());
            }
        }

        // =====================================================================
        // FALLBACK: Try meraparivar.haryana.gov.in public portal
        // =====================================================================
        try {
            $portalResponse = Http::withoutVerifying()
                ->connectTimeout(8)
                ->timeout(20)
                ->withHeaders([
                    'Accept'           => 'application/json, text/javascript, */*; q=0.01',
                    'X-Requested-With' => 'XMLHttpRequest',
                    'Referer'          => 'https://meraparivar.haryana.gov.in/',
                    'User-Agent'       => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ])
                ->get('https://meraparivar.haryana.gov.in/Home/GetFamilyMemberDetailsByFamilyId', [
                    'FamilyId' => $familyId,
                ]);

            if ($portalResponse->successful()) {
                $data    = $portalResponse->json();
                $members = $data['data'] ?? $data['members'] ?? $data ?? [];

                if (!empty($members) && is_array($members)) {
                    $members = array_map(fn ($m) => [
                        'name'     => $m['memberName']        ?? $m['name']     ?? 'N/A',
                        'relation' => $m['relationWithHead']  ?? $m['relation'] ?? 'Member',
                        'gender'   => $m['gender']            ?? $m['sex']      ?? 'N/A',
                        'age'      => $m['age']               ?? null,
                        'mobile'   => $m['mobileNumber']      ?? $m['mobile']   ?? null,
                        'status'   => $m['verificationStatus'] ?? $m['status']  ?? null,
                    ], $members);

                    $this->deductAndLog($user, $service, $coinCost, $isStaff, $familyId, count($members));

                    return response()->json([
                        'success'       => true,
                        'family_id'     => $familyId,
                        'total_members' => count($members),
                        'members'       => $members,
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::error('FamilyIdToMobileController portal error: ' . $e->getMessage());
        }

        return response()->json([
            'success' => false,
            'message' => 'No data found for this Family ID. Please check the ID and try again, or configure an API URL in Admin → API Settings.',
        ]);
    }

    public function updateApi(Request $request)
    {
        if (!$this->isStaff()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'api_url' => 'required|string',
            'api_key' => 'nullable|string',
        ]);

        Setting::set('family_id_to_mobile_url', trim($request->input('api_url')));
        Setting::set('family_id_to_mobile_key', trim((string) $request->input('api_key', '')));

        return response()->json(['success' => true, 'message' => 'API settings saved successfully!']);
    }

    private function deductAndLog($user, $service, int $coinCost, bool $isStaff, string $familyId, int $memberCount): void
    {
        if (!$isStaff && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Family ID to Mobile: ' . $familyId);
        }

        try {
            ServiceRequest::create([
                'user_id'      => $user->id,
                'service_id'   => $service ? $service->id : null,
                'service_name' => $service ? $service->name : 'Family ID to Mobile Number',
                'input_data'   => ['Family ID' => $familyId, 'Members Found' => $memberCount],
                'coins_charged'=> $isStaff ? 0 : $coinCost,
                'status'       => ServiceRequest::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('FamilyIdToMobile ServiceRequest log error: ' . $e->getMessage());
        }
    }
}
