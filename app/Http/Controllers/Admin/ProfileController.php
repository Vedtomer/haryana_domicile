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

        return Inertia::render('Admin/Profile/Edit', [
            'user' => $user,
            // Full coin history so the user can audit every credit and deduction themselves.
            'ledger' => CoinTransaction::where('user_id', $user->id)
                ->with('creator:id,name')
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
