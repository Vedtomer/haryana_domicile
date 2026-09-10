<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Services\IdCardStoreService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DrivingLicenceCardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user->isAdmin() || $user->hasRole('super_admin');

        // Check 6-month license enforcement for regular users
        if (!$isAdmin && !$user->hasActiveLicense()) {
            return redirect('/dashboard')->with('error', 'Portal ki sabhi services use karne ke liye 6-Month Portal License active hona zaroori hai.');
        }

        $service = Service::whereIn('slug', ['make-driving-licence-card', 'driving-licence-pvc'])->first();
        $coinCost = $service ? $service->coin_cost : 20;

        return Inertia::render('Utilities/DrivingLicenceCard', [
            'service'   => $service,
            'coinCost'  => $coinCost,
            'userCoins' => $user->coins,
            'isAdmin'   => $isAdmin,
        ]);
    }

    public function generate(Request $request, IdCardStoreService $idCardStoreService)
    {
        $request->validate([
            'relation'   => 'nullable|string|in:DL No,LL No',
            'dl'         => 'required|string|min:4|max:35',
            'dob'        => 'required|string|max:20',
            'background' => 'nullable|string|in:true,false',
            'card_type'  => 'nullable|string|in:1,2',
        ]);

        $user = auth()->user();
        $isAdmin = $user->isAdmin() || $user->hasRole('super_admin');

        if (!$isAdmin && !$user->hasActiveLicense()) {
            return response()->json([
                'success' => false,
                'message' => 'Portal License Inactive. Kripya pehle 6-Month License activate karein.',
            ], 403);
        }

        $service = Service::whereIn('slug', ['make-driving-licence-card', 'driving-licence-pvc'])->first();
        $coinCost = $service ? $service->coin_cost : 20;

        if (!$isAdmin && $user->coins < $coinCost) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. You need {$coinCost} coins to generate this card. (Your balance: {$user->coins} coins)",
            ]);
        }

        $relation = $request->input('relation', 'DL No');
        $dl = strtoupper(trim($request->input('dl')));
        $dob = trim($request->input('dob'));
        $background = $request->input('background', 'false');
        $cardType = $request->input('card_type', '1');

        $result = $idCardStoreService->generateDrivingLicenceCard($dl, $dob, $relation, $background, $cardType);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ]);
        }

        // Deduct coins for non-admin users
        if (!$isAdmin && $coinCost > 0) {
            $user->deductCoins(
                $coinCost,
                CoinTransaction::TYPE_SERVICE_DEDUCTION,
                'Make Driving Licence (Cards): ' . $dl
            );
        }

        // Format DOB for log
        $dobFormatted = $dob;
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $dob, $m)) {
            $dobFormatted = "{$m[3]}-{$m[2]}-{$m[1]}";
        }

        // Record service request
        ServiceRequest::create([
            'user_id'       => $user->id,
            'service_id'    => $service ? $service->id : null,
            'service_name'  => $service ? $service->name : 'Make Driving Licence (Cards)',
            'input_data'    => [
                'Criteria'       => $relation,
                'Licence Number' => $dl,
                'Date of Birth'  => $dobFormatted,
                'Background'     => $background === 'true' ? 'Light Blue' : 'White',
                'Card Type'      => $cardType === '2' ? 'Chip PVC' : 'Normal PVC',
            ],
            'coins_charged' => $isAdmin ? 0 : $coinCost,
            'status'        => ServiceRequest::STATUS_COMPLETED,
            'completed_at'  => now(),
        ]);

        return response()->json([
            'success'   => true,
            'message'   => 'Driving Licence PVC Card generated successfully!',
            'card_name' => 'Make Driving Licence (Cards)',
            'cards'     => $result['cards'] ?? [],
            'a4_common' => $result['a4_common'] ?? null,
            'userCoins' => $user->fresh()->coins,
        ]);
    }
}
