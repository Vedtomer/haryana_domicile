<?php

namespace App\Http\Controllers;

use App\Models\CoinPurchaseRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReferralController extends Controller
{
    /**
     * Display the user's referral dashboard.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        // Ensure user has a referral code
        if (empty($user->referral_code)) {
            $user->referral_code = User::generateReferralCode();
            $user->save();
        }

        $referralLink = url('/register?ref=' . $user->referral_code);

        // Fetch referred users with recharge status
        $referralsQuery = User::where('referred_by', $user->id)
            ->select(['id', 'name', 'phone', 'email', 'created_at', 'referral_reward_paid', 'referral_reward_paid_at'])
            ->withSum([
                'coinPurchaseRequests as total_recharged_amount' => function ($q) {
                    $q->where('status', 'approved');
                }
            ], 'package_amount')
            ->latest();

        $totalReferrals = (clone $referralsQuery)->count();
        $qualifiedReferrals = (clone $referralsQuery)->where('referral_reward_paid', true)->count();
        $totalEarnedCoins = $qualifiedReferrals * 10;

        $referrals = $referralsQuery->paginate(20)->through(function ($ref) {
            $maskedPhone = $ref->phone;
            if (strlen($maskedPhone) >= 8) {
                $maskedPhone = substr($maskedPhone, 0, 2) . '******' . substr($maskedPhone, -2);
            }

            return [
                'id'                      => $ref->id,
                'name'                    => $ref->name,
                'phone'                   => $maskedPhone,
                'joined_at'               => $ref->created_at ? $ref->created_at->format('d M Y, h:i A') : '',
                'referral_reward_paid'    => (bool) $ref->referral_reward_paid,
                'referral_reward_paid_at' => $ref->referral_reward_paid_at ? $ref->referral_reward_paid_at->format('d M Y, h:i A') : null,
                'total_recharged_amount'  => (int) ($ref->total_recharged_amount ?? 0),
            ];
        });

        return Inertia::render('Admin/Referrals/Index', [
            'referralCode' => $user->referral_code,
            'referralLink' => $referralLink,
            'stats' => [
                'totalReferrals'     => $totalReferrals,
                'qualifiedReferrals' => $qualifiedReferrals,
                'totalEarnedCoins'   => $totalEarnedCoins,
            ],
            'referrals' => $referrals,
        ]);
    }
}
