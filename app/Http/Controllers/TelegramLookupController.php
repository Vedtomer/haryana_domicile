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
            'type' => 'required|string|in:num,aadhar,familyinfo,pan,ration',
            'input' => 'required|string|min:4|max:20',
        ]);

        $type = $request->input('type');
        $inputVal = $request->input('input');
        
        $serviceSlugMap = [
            'num' => 'mobile-to-details',
            'aadhar' => 'telegram-aadhar',
            'familyinfo' => 'telegram-familyinfo',
            'pan' => 'telegram-pan',
            'ration' => 'telegram-ration',
        ];
        
        $serviceNameMap = [
            'num' => 'Mobile to Details',
            'aadhar' => 'Aadhar Details',
            'familyinfo' => 'Family Info',
            'pan' => 'PAN Details',
            'ration' => 'Ration Details',
        ];

        $slug = $serviceSlugMap[$type];
        $user = auth()->user();
        $service = Service::where('slug', $slug)->first();
        $coinCost = $service ? $service->coin_cost : 10;

        // Check user coins if they are not admin
        if (!$user->isAdmin() && !$user->hasRole('super_admin') && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins."
            ]);
        }
        
        // Construct the command based on the type
        $commandMap = [
            'num' => "/num $inputVal",
            'aadhar' => "/aadhar $inputVal",
            'familyinfo' => "/familyinfo $inputVal",
            'pan' => "/pan $inputVal",
            'ration' => "/ration $inputVal",
        ];
        
        $fullCommand = $commandMap[$type];
        $apiUrl = env('TELEGRAM_API_URL', 'http://localhost:4000');

        try {
            // Call the Telegram API
            $response = Http::timeout(10)->get($apiUrl . '/api/lookup', [
                'command' => $fullCommand
            ]);

            if ($response->successful() && $response->json('success')) {
                $botResponseText = $response->json('data');
                
                // Deduct coins only if successful
                if (!$user->isAdmin() && !$user->hasRole('super_admin')) {
                    $user->deductCoins($coinCost, \App\Models\CoinTransaction::TYPE_SERVICE_DEDUCTION, $serviceNameMap[$type] . ': ' . $inputVal);
                }

                // Log the service request
                ServiceRequest::create([
                    'user_id' => $user->id,
                    'service_id' => $service ? $service->id : null,
                    'service_name' => $service ? $service->name : $serviceNameMap[$type],
                    'input_data' => ['Input' => $inputVal, 'Command' => $fullCommand],
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
