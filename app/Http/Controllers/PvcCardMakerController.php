<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Services\IdCardStoreService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PvcCardMakerController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $this->isStaff();

        $selectedCard = $request->query('card', 'haryana_familyid');
        $cards = IdCardStoreService::ENDPOINTS;

        // Fetch configured service cost from DB if exists
        $dbService = Service::where('slug', 'pvc-card-maker')->first();
        $defaultCost = $dbService ? $dbService->coin_cost : 20;

        $cardsData = [];
        foreach ($cards as $key => $card) {
            $cardsData[] = [
                'key'              => $key,
                'name'             => $card['name'],
                'description'      => $card['description'],
                'icon'             => $card['icon'],
                'accepts_password' => $card['accepts_password'],
                'coin_cost'        => $defaultCost,
            ];
        }

        return Inertia::render('Utilities/PvcCardMaker', [
            'cards'         => $cardsData,
            'defaultCard'   => $selectedCard,
            'userCoins'     => $user->coins,
            'isAdmin'       => $isAdmin,
            'isConfigured'  => !empty(config('services.idcard_store.api_key')),
        ]);
    }

    public function generate(Request $request, IdCardStoreService $idCardStoreService)
    {
        $request->validate([
            'card_type' => 'required|string',
            'file'      => 'required|file|mimes:pdf|max:15360',
            'password'  => 'nullable|string|max:100',
        ]);

        $cardType = $request->input('card_type');
        if (!isset(IdCardStoreService::ENDPOINTS[$cardType])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid card type specified.',
            ], 422);
        }

        $user = auth()->user();
        $isAdmin = $this->isStaff();

        $dbService = Service::where('slug', 'pvc-card-maker')->first();
        $coinCost = $dbService ? $dbService->coin_cost : 20;

        if (!$isAdmin && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. You need {$coinCost} coins to generate this card.",
            ]);
        }

        $file = $request->file('file');
        $extraParams = [];
        if ($request->filled('password')) {
            $extraParams['password'] = $request->input('password');
        }

        $result = $idCardStoreService->generateCard($cardType, $file, $extraParams);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ]);
        }

        // Deduct coins if not admin
        if (!$isAdmin && $coinCost > 0) {
            $user->deductCoins(
                $coinCost,
                CoinTransaction::TYPE_SERVICE_DEDUCTION,
                'PVC Card Maker (' . ($result['card_name'] ?? $cardType) . ')'
            );
        }

        // Record service request in database
        ServiceRequest::create([
            'user_id'       => $user->id,
            'service_id'    => $dbService ? $dbService->id : null,
            'service_name'  => 'PVC Card Maker: ' . ($result['card_name'] ?? $cardType),
            'input_data'    => [
                'card_type' => $cardType,
                'file_name' => $file->getClientOriginalName(),
                'has_password' => $request->filled('password'),
            ],
            'coins_charged' => $isAdmin ? 0 : $coinCost,
            'status'        => ServiceRequest::STATUS_COMPLETED,
            'completed_at'  => now(),
        ]);

        return response()->json([
            'success'   => true,
            'message'   => $result['message'] ?? 'PVC Card generated successfully!',
            'card_name' => $result['card_name'],
            'cards'     => $result['cards'] ?? [],
            'a4_common' => $result['a4_common'] ?? null,
            'sample'    => $result['sample'] ?? false,
            'userCoins' => $user->fresh()->coins,
        ]);
    }
}
