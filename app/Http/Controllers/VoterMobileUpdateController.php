<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class VoterMobileUpdateController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'epic' => ['required', 'string'],
            'mobile' => ['required', 'string', 'size:10', 'regex:/^[0-9]{10}$/']
        ]);

        $service = \App\Models\Service::where('slug', 'voter-mobile-update')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 49;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json(['success' => false, 'message' => "Insufficient coins. This service requires {$coinCost} coins."]);
        }

        $epic = strtoupper(trim($request->input('epic')));
        $mobile = trim($request->input('mobile'));
        $url = "https://nexus-dashboard.space/api/v1/voter_card_api/voter_mobile_link.php?apiKey=38cc07892c07c566e3ce1a3289c589e284954d7c0e593386&epic=" . urlencode($epic) . "&mobile=" . urlencode($mobile);

        try {
            $response = Http::timeout(30)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['Status']) && $data['Status'] === 'Success') {
                    if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                        $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, "Voter Mobile Update: {$epic}");
                    }

                    \App\Models\ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Voter Mobile Update Instant',
                        'input_data'    => ['EPIC Number' => $epic, 'Mobile Number' => $mobile],
                        'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                        'status'        => \App\Models\ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'data'    => $data['data'] ?? $data,
                        'message' => $data['message'] ?? 'Mobile number updated successfully.',
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => $data['message'] ?? 'Failed to update mobile number. Please check the EPIC number.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to the service provider.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with the external server.',
            ]);
        }
    }
}
