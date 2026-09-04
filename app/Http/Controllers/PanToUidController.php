<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PanToUidController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'pan' => ['required', 'string', 'size:10', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/']
        ]);

        $service = \App\Models\Service::where('slug', 'pan-to-uid-advance')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 149;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json(['success' => false, 'message' => "Insufficient coins. This service requires {$coinCost} coins."]);
        }

        $pan = strtoupper(trim($request->input('pan')));
        $url = "https://nexus-dashboard.space/api/v1/pan_card_api/pan_to_uid_s1.php?apiKey=38cc07892c07c566e3ce1a3289c589e284954d7c0e593386&pan=" . urlencode($pan);

        try {
            $response = Http::timeout(30)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['Status']) && $data['Status'] === 'Success' && isset($data['data'])) {
                    if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                        $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, 'PAN To UID Advance: ' . $pan);
                    }

                    \App\Models\ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Pan To Uid Advance Instant',
                        'input_data'    => ['PAN Number' => $pan],
                        'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                        'status'        => \App\Models\ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'data'    => $data['data'],
                        'message' => 'Details found successfully.',
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => $data['message'] ?? 'Details not found. Please check the PAN number.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Details not found for this PAN number.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with the external server.',
            ]);
        }
    }
}
