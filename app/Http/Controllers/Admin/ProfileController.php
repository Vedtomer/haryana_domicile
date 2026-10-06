<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoinTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function edit()
    {
        $user = auth()->user();
        if ($user->referred_by) {
            $user->load('referrer:id,name,phone,email,referral_code');
        }

        $isAdmin = $user->isAdmin();
        $scope = $isAdmin ? request('scope', 'my') : 'my';

        $ledgerQuery = CoinTransaction::query()->with([
            'user:id,name,phone,email',
            'creator:id,name',
        ]);

        if (!$isAdmin || $scope === 'my') {
            $ledgerQuery->where('user_id', $user->id);
        }

        return Inertia::render('Admin/Profile/Edit', [
            'user' => $user,
            'isAdmin' => $isAdmin,
            'scope' => $scope,
            'referralCode' => $user->getActiveReferralCode(),
            'referralLink' => $user->referral_link,
            'referrer' => $user->referrer,
            // Full coin history so the user can audit every credit and deduction themselves.
            'ledger' => $ledgerQuery
                ->latest('id')
                ->paginate(15)
                ->withQueryString(),
            'ledgerSummary' => [
                'balance' => $user->coins,
                'added' => (int) CoinTransaction::where('user_id', $user->id)->where('amount', '>', 0)->sum('amount'),
                'spent' => (int) abs(CoinTransaction::where('user_id', $user->id)->where('amount', '<', 0)->sum('amount')),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'required_without:phone', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'required_without:email', 'string', 'max:20', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return back()->with('success', 'Profile updated successfully!');
    }
}
