<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CourierSlipMakerController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'sender_name' => 'required|string|max:100',
            'sender_phone' => 'required|string|max:30',
            'sender_address' => 'required|string|max:300',
            'receiver_name' => 'required|string|max:100',
            'receiver_phone' => 'required|string|max:30',
            'receiver_address' => 'required|string|max:300',
            'receiver_pincode' => 'required|string|max:15',
        ]);

        $service = Service::where('slug', 'courier-slip-maker')->first();
        $user = auth()->user();

        // Service cost is 5 coins as requested
        $coinCost = $service ? $service->coin_cost : 5;
        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins (₹{$coinCost}). Current balance: {$user->coins} coins."
            ], 422);
        }

        $trackingNo = strtoupper(trim($request->input('tracking_no', '')));
        if (empty($trackingNo)) {
            $prefix = strtoupper(substr($request->input('courier_type', 'SP'), 0, 2));
            if (!in_array($prefix, ['SP', 'DT', 'BD', 'DL', 'TR', 'XP', 'EK'])) {
                $prefix = 'CS';
            }
            $trackingNo = $prefix . date('ymd') . rand(1000, 9999) . 'IN';
        }

        try {
            // Deduct 5 coins and log service request
            $this->deductCoinsAndLogRequest($user, $service, $coinCost, $trackingNo, $request->input('receiver_name'));

            return response()->json([
                'success' => true,
                'tracking_no' => $trackingNo,
                'slip_data' => array_merge($request->all(), [
                    'tracking_no' => $trackingNo,
                ]),
                'remaining_coins' => $user->coins,
                'message' => "Courier Slip generated successfully! {$coinCost} Coins charged."
            ]);

        } catch (\Exception $e) {
            Log::error('CourierSlipMakerController error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    private function deductCoinsAndLogRequest($user, $service, int $coinCost, string $trackingNo, string $receiverName): void
    {
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Courier Slip: ' . $receiverName . ' (' . $trackingNo . ')');
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'Courier & Parcel Slip Maker',
            'input_data' => [
                'Tracking No' => $trackingNo,
                'Receiver' => $receiverName,
            ],
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
}
