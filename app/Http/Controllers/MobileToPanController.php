<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MobileToPanController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'mobile_number' => ['required', 'string', 'size:10', 'regex:/^[0-9]{10}$/'],
            'first_name' => ['required', 'string'],
            'last_name' => ['required', 'string'],
        ]);

        $service = \App\Models\Service::where('slug', 'mobile-to-pan')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 149;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json(['success' => false, 'message' => "Insufficient coins. This service requires {$coinCost} coins."]);
        }

        $mobile = trim($request->input('mobile_number'));
        $firstName = trim($request->input('first_name'));
        $lastName = trim($request->input('last_name'));
        
        $url = "https://nexus-dashboard.space/api/v1/telecom_api/mobile_to_pan.php?apiKey=38cc07892c07c566e3ce1a3289c589e284954d7c0e593386&mobile_number=" . urlencode($mobile) . "&first_name=" . urlencode($firstName) . "&last_name=" . urlencode($lastName);

        try {
            $response = Http::timeout(30)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                // API might return Status = Success but empty data if provider failed
                if (isset($data['Status']) && $data['Status'] === 'Success' && !empty($data['data']['pan'])) {
                    if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                        $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, "Mobile To Pan: {$mobile}");
                    }

                    \App\Models\ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'Mobile To Pan No. Instant',
                        'input_data'    => ['Mobile Number' => $mobile, 'First Name' => $firstName, 'Last Name' => $lastName],
                        'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                        'status'        => \App\Models\ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'data'    => $data['data'],
                        'message' => 'PAN Details found successfully.',
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => $data['message'] ?? 'PAN Details not found for this combination.',
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
