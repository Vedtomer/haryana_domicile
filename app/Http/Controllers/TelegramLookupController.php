<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Service;
use App\Models\ServiceRequest;

class TelegramLookupController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'number' => 'required|string|min:10|max:15',
        ]);

        $number = $request->input('number');
        $user = auth()->user();
        $service = Service::where('slug', 'mobile-to-details')->first();
        $coinCost = $service ? $service->coin_cost : 10;

        // Check user coins if they are not admin
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }

        try {
            // Call the local Node.js Telegram API
            $response = Http::timeout(10)->get('http://localhost:4000/api/lookup', [
                'number' => $number
            ]);

            if ($response->successful() && $response->json('success')) {
                $botResponseText = $response->json('data');
                
                // Deduct coins only if successful
                if (!$user->isAdmin() && !$user->hasRole('super_admin')) {
                    $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Mobile Lookup: ' . $number);
                }

                // Log the service request
                ServiceRequest::create([
                    'user_id' => $user->id,
                    'service_id' => $service ? $service->id : null,
                    'service_name' => $service ? $service->name : 'Mobile to Details',
                    'input_data' => ['Mobile Number' => $number],
                    'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
                    'status' => ServiceRequest::STATUS_COMPLETED,
                    'completed_at' => now(),
                ]);

                return response()->json([
                    'success' => true,
                    'details' => $botResponseText
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch details. Telegram Bot might be offline or rate limited.'
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error communicating with local Telegram service. Is Node.js running? ' . $e->getMessage()
            ]);
        }
    }
}
