<?php

namespace App\Http\Controllers;

use App\Models\CoinPurchaseRequest;
use App\Models\ReferralLink;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class ReferralController extends Controller
{
    /**
     * Display the user's referral dashboard.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        // Ensure user has an active single-use referral code
        $referralCode = $user->getActiveReferralCode();
        $referralLink = $user->referral_link;

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

        // Fetch single-use referral links history
        $linkHistory = [];
        if (Schema::hasTable('referral_links')) {
            $linkHistory = ReferralLink::where('user_id', $user->id)
                ->with('usedBy:id,name,phone')
                ->latest('id')
                ->take(15)
                ->get()
                ->map(function ($link) {
                    $maskedPhone = $link->usedBy?->phone;
                    if ($maskedPhone && strlen($maskedPhone) >= 8) {
                        $maskedPhone = substr($maskedPhone, 0, 2) . '******' . substr($maskedPhone, -2);
                    }
                    return [
                        'id'           => $link->id,
                        'code'         => $link->code,
                        'is_used'      => (bool) $link->is_used,
                        'used_at'      => $link->used_at ? $link->used_at->format('d M Y, h:i A') : null,
                        'used_by_name' => $link->usedBy ? ($link->usedBy->name ?: 'User #' . $link->usedBy->id) : null,
                        'used_by_phone'=> $maskedPhone,
                        'created_at'   => $link->created_at ? $link->created_at->format('d M Y') : null,
                    ];
                });
        }

        return Inertia::render('Admin/Referrals/Index', [
            'referralCode' => $referralCode,
            'referralLink' => $referralLink,
            'stats' => [
                'totalReferrals'     => $totalReferrals,
                'qualifiedReferrals' => $qualifiedReferrals,
                'totalEarnedCoins'   => $totalEarnedCoins,
            ],
            'referrals'   => $referrals,
            'linkHistory' => $linkHistory,
        ]);
    }

    /**
     * Manually generate a fresh new single-use referral code.
     */
    public function generateNew(Request $request)
    {
        $user = auth()->user();
        $code = $user->generateNewReferralLink();

        return back()->with('success', "Naya single-use referral link generate ho gaya: {$code}");
    }
}
