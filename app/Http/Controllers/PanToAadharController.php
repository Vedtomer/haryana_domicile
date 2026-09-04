<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Carbon;

class PanToAadharController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'pan'  => ['required', 'string', 'size:10', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/'],
            'name' => ['required', 'string', 'max:255'],
            'dob'  => ['required', 'string'] // Format typically expected as DD/MM/YYYY or DD-MM-YYYY
        ]);

        $service = \App\Models\Service::where('slug', 'pan-to-aadhar-unmasked')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 99;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json(['success' => false, 'message' => "Insufficient coins. This service requires {$coinCost} coins."]);
        }

        $pan = strtoupper(trim($request->input('pan')));
        $name = trim($request->input('name'));
        
        // Ensure DOB is in right format if needed, assuming the API expects what user typed
        // Let's pass it exactly as user typed (they should enter DD/MM/YYYY usually)
        $dob = trim($request->input('dob'));

        $url = "https://nexus-dashboard.space/api/v1/pan_card_api/pan_to_aadhar.php" .
               "?apiKey=38cc07892c07c566e3ce1a3289c589e284954d7c0e593386" .
               "&pan=" . urlencode($pan) .
               "&name=" . urlencode($name) .
               "&dob=" . urlencode($dob);

        try {
            $response = Http::timeout(30)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['Status']) && $data['Status'] === 'Success' && isset($data['data'])) {
                    if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                        $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, 'PAN to Aadhaar Unmasked: ' . $pan);
                    }

                    \App\Models\ServiceRequest::create([
                        'user_id'       => $user->id,
                        'service_id'    => $service ? $service->id : null,
                        'service_name'  => $service ? $service->name : 'PAN to Aadhaar Unmasked Instant',
                        'input_data'    => ['PAN Number' => $pan, 'Name' => $name, 'DOB' => $dob],
                        'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                        'status'        => \App\Models\ServiceRequest::STATUS_COMPLETED,
                        'completed_at'  => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'data'    => $data['data'],
                        'message' => 'Aadhaar details found successfully.',
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => $data['message'] ?? 'Aadhaar details not found. Please check your inputs.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Details not found for these credentials.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with the external server.',
            ]);
        }
    }
}
