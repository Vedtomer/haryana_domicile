<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BiharRationCardMakerController extends Controller
{
    public const PORTAL_URL = 'https://ar.smartpds.nic.in/login';

    public function index(Request $request)
    {
        $service = Service::where('slug', 'bihar-ration-card-maker')
            ->orWhere('module_key', 'bihar_ration_card_maker')
            ->first();

        $coinCost = $service ? $service->coin_cost : 99;
        $user = auth()->user();

        $isUnlocked = session('bihar_ration_card_unlocked', false) || $user->isAdmin() || $user->hasRole('super_admin');

        return Inertia::render('Utilities/BiharRationCardMaker', [
            'service' => $service,
            'coinCost' => $coinCost,
            'userCoins' => $user->coins,
            'isUnlocked' => $isUnlocked,
            'portalUrl' => self::PORTAL_URL,
        ]);
    }

    public function deductCoins(Request $request)
    {
        $service = Service::where('slug', 'bihar-ration-card-maker')
            ->orWhere('module_key', 'bihar_ration_card_maker')
            ->first();

        $coinCost = $service ? $service->coin_cost : 99;
        $user = auth()->user();
        $isAdmin = $user->isAdmin() || $user->hasRole('super_admin');

        // Check if already unlocked in this session
        if (session('bihar_ration_card_unlocked', false) || $isAdmin) {
            return response()->json([
                'success' => true,
                'message' => 'Portal access already active.',
                'portalUrl' => self::PORTAL_URL,
                'remainingCoins' => $user->coins,
            ]);
        }

        if ($user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet.",
            ], 403);
        }

        if ($coinCost > 0) {
            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Bihar Ration Card Maker Access');
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'Bihar Ration Card Maker',
            'input_data' => [
                'Action' => 'Smart PDS Bihar Portal Access & Card Maker',
                'Portal URL' => self::PORTAL_URL,
            ],
            'coins_charged' => $isAdmin ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);

        session(['bihar_ration_card_unlocked' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Access granted! 99 Coins deducted.',
            'portalUrl' => self::PORTAL_URL,
            'remainingCoins' => $user->fresh()->coins,
        ]);
    }
}
