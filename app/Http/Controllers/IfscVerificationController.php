<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class IfscVerificationController extends Controller
{
    /**
     * Display the IFSC verification page.
     */
    public function index()
    {
        $service = Service::where('slug', 'verify-ifsc-code')->first();
        $user = auth()->user();

        if ($service && $service->is_premium && !$user->isAdmin() && !$user->hasRole('super_admin') && !$service->users()->where('user_id', $user->id)->exists()) {
            return redirect('/dashboard')->with('error', 'Please unlock this premium service first.');
        }

        $coinCost = $service ? (int) $service->coin_cost : 9;

        return Inertia::render('Utilities/IfscVerification', [
            'service' => $service,
            'coinCost' => $coinCost,
        ]);
    }

    /**
     * Verify an IFSC code, deduct coins, and return bank details.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'ifsc' => ['required', 'string', 'size:11', 'regex:/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/'],
        ], [
            'ifsc.size' => 'IFSC Code must be exactly 11 characters.',
            'ifsc.regex' => 'Please enter a valid IFSC code (e.g. HDFC0002707). The 5th character must be 0.',
        ]);

        $ifsc = strtoupper(trim($request->input('ifsc')));

        $service = Service::where('slug', 'verify-ifsc-code')->first();
        $user = auth()->user();

        $coinCost = $service ? (int) $service->coin_cost : 9;

        if ($user->coins < $coinCost && !$user->isAdmin() && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => "Insufficient coins. This service requires {$coinCost} coins. Please recharge your wallet.",
            ], 400);
        }

        try {
            // Razorpay IFSC API - Open, official RBI-backed data
            $response = Http::connectTimeout(6)->timeout(12)->get("https://ifsc.razorpay.com/{$ifsc}");

            if ($response->successful()) {
                $data = $response->json();

                if (!empty($data) && isset($data['BANK'])) {
                    $charged = 0;

                    // Deduct coins for non-admin users if cost > 0
                    if (!$user->isAdmin() && !$user->hasRole('super_admin') && $coinCost > 0) {
                        $user->deductCoins($coinCost, CoinTransaction::TYPE_SERVICE_DEDUCTION, 'IFSC Verification: ' . $ifsc, 'verify_ifsc_code', $service?->id);
                        $charged = $coinCost;
                    }

                    // Record completed service request for user records
                    ServiceRequest::create([
                        'user_id' => $user->id,
                        'service_id' => $service ? $service->id : null,
                        'service_name' => $service ? $service->name : 'Verify IFSC Code',
                        'input_data' => [
                            'IFSC Code' => $ifsc,
                            'Bank Name' => $data['BANK'] ?? '',
                            'Branch' => $data['BRANCH'] ?? '',
                        ],
                        'admin_response' => json_encode($data),
                        'coins_charged' => $charged,
                        'status' => ServiceRequest::STATUS_COMPLETED,
                        'completed_at' => now(),
                    ]);

                    return response()->json([
                        'success' => true,
                        'data' => [
                            'ifsc' => $data['IFSC'] ?? $ifsc,
                            'bank_name' => $data['BANK'] ?? '',
                            'branch' => $data['BRANCH'] ?? '',
                            'address' => $data['ADDRESS'] ?? '',
                            'state' => $data['STATE'] ?? '',
                            'district' => $data['DISTRICT'] ?? '',
                            'city' => $data['CITY'] ?? '',
                            'micr' => $data['MICR'] ?? '',
                            'contact' => $data['CONTACT'] ?? '',
                            'upi' => !empty($data['UPI']),
                            'imps' => !empty($data['IMPS']),
                            'neft' => !empty($data['NEFT']),
                            'rtgs' => !empty($data['RTGS']),
                        ],
                        'coins_charged' => $charged,
                        'user_coins' => $user->fresh()->coins,
                        'message' => 'Valid IFSC Code',
                    ]);
                }
            }

            if ($response->status() === 404) {
                return response()->json([
                    'success' => false,
                    'message' => "Invalid IFSC Code. No bank branch found for \"{$ifsc}\".",
                ], 404);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to verify IFSC Code. Please check the code and try again.',
            ], 400);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'External bank lookup service timed out. Please try again in a moment.',
            ], 500);
        }
    }
}
