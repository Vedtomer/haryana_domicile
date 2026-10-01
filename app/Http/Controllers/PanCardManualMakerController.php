<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PanCardManualMakerController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'pan_no' => 'required|string|min:10|max:10',
            'name' => 'required|string|max:100',
            'father_name' => 'required|string|max:100',
            'dob' => 'required|string',
        ]);

        $service = Service::where('slug', 'pan-card-manual-maker')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 20;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ], 422);
        }

        $panNo = strtoupper(trim($request->input('pan_no')));

        try {
            // Deduct coins and log request
            $this->deductCoinsAndLogRequest($user, $service, $coinCost, $panNo);

            return response()->json([
                'success' => true,
                'is_demo' => false,
                'card_data' => array_merge($request->all(), [
                    'pan_no' => $panNo,
                ]),
                'message' => 'PAN Card generated successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('PanCardManualMakerController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $queryIdentifier): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'PAN Card Manual: ' . $queryIdentifier);
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'PAN Card Manual Maker',
            'input_data' => ['PAN' => $queryIdentifier],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
