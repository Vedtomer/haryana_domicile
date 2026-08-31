<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\CoinTransaction;

class PassportMakerController extends Controller
{
    public function index()
    {
        $service = Service::where('slug', 'passport-maker')->first();
        
        $user = auth()->user();
        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        return Inertia::render('Utilities/PassportMaker', [
            'service' => $service
        ]);
    }

    public function deductCoins(Request $request)
    {
        $service = Service::where('slug', 'passport-maker')->first();
        $user = auth()->user();

        $coinCost = $service ? $service->coin_cost : 20;

        if (!$user->isAdmin() && !$user->hasRole('super_admin')) {
            if ($user->coins < $coinCost) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient coins. You need ' . $coinCost . ' coins to download.'
                ], 403);
            }

            $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'Passport Photo Download');
        }

        ServiceRequest::create([
            'user_id' => $user->id,
            'service_id' => $service ? $service->id : null,
            'service_name' => $service ? $service->name : 'Passport Photo Maker',
            'input_data' => $request->input('details', []),
            'coins_charged' => $user->isAdmin() || $user->hasRole('super_admin') ? 0 : $coinCost,
            'status' => ServiceRequest::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Coins deducted successfully.'
        ]);
    }
}
