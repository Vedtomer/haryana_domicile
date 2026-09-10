<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\LicenseKey;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LicenseController extends Controller
{
    /**
     * User purchases a 6-month license key for 50 coins.
     */
    public function buy(Request $request)
    {
        $user = $request->user();
        $cost = 50;
        $autoActivate = $request->boolean('auto_activate', true);

        if (!$user->hasEnoughCoins($cost)) {
            return back()->with('error', "Insufficient coin balance. You need {$cost} coins to get a 6-Month Portal License. Please recharge coins.");
        }

        $key = LicenseKey::generateUniqueKey();

        if ($autoActivate) {
            // Deduct 50 coins and activate directly on user account
            $user->deductCoins(
                $cost,
                CoinTransaction::TYPE_SERVICE_DEDUCTION,
                "Purchased & Activated 6-Month Portal License (Key: {$key})",
                'portal_license'
            );

            $expiry = $user->activateLicense(6);

            $license = LicenseKey::create([
                'key'             => $key,
                'cost_coins'      => $cost,
                'duration_months' => 6,
                'status'          => LicenseKey::STATUS_ACTIVE,
                'purchased_by'    => $user->id,
                'activated_by'    => $user->id,
                'activated_at'    => now(),
                'expires_at'      => $expiry,
                'notes'           => 'Direct Purchase & Auto-Activation',
            ]);

            return back()->with('success', "🎉 6-Month Portal License activated successfully! Valid until " . $expiry->format('d M Y') . ".");
        } else {
            // Deduct 50 coins and provide an unused transferable key
            $user->deductCoins(
                $cost,
                CoinTransaction::TYPE_SERVICE_DEDUCTION,
                "Purchased 6-Month Portal License Key: {$key}",
                'portal_license'
            );

            $license = LicenseKey::create([
                'key'             => $key,

                'cost_coins'      => $cost,
                'duration_months' => 6,
                'status'          => LicenseKey::STATUS_UNUSED,
                'purchased_by'    => $user->id,
                'notes'           => 'Purchased as Unused Key',
            ]);

            return back()->with([
                'success' => "License key purchased successfully! Your key is: {$key}",
                'generated_key' => $key,
            ]);
        }
    }

    /**
     * User enters a license key to activate 6-Month Portal access.
     */
    public function activate(Request $request)
    {
        $request->validate([
            'key' => 'required|string|max:50',
        ]);

        $inputKey = strtoupper(trim($request->input('key')));
        $licenseKey = LicenseKey::where('key', $inputKey)->first();

        if (!$licenseKey) {
            return back()->with('error', 'Invalid License Key. Please check the key code and try again.');
        }

        if ($licenseKey->status === LicenseKey::STATUS_REVOKED) {
            return back()->with('error', 'This License Key has been revoked. Please contact support.');
        }

        if ($licenseKey->status === LicenseKey::STATUS_ACTIVE) {
            return back()->with('error', 'This License Key has already been redeemed and cannot be used again.');
        }

        $user = $request->user();
        $licenseKey->activateFor($user);

        return back()->with('success', "🎉 License Key verified! 6-Month Portal License is active until " . $user->license_expires_at->format('d M Y') . ".");
    }

    /**
     * Admin: View all license keys.
     */
    public function adminIndex(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');

        $query = LicenseKey::with(['purchaser', 'activator'])->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('key', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('purchaser', fn ($sub) => $sub->where('name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%"))
                  ->orWhereHas('activator', fn ($sub) => $sub->where('name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%"));
            });
        }

        if ($status && in_array($status, [LicenseKey::STATUS_UNUSED, LicenseKey::STATUS_ACTIVE, LicenseKey::STATUS_REVOKED])) {
            $query->where('status', $status);
        }

        $keys = $query->paginate(20)->withQueryString();

        $stats = [
            'total'   => LicenseKey::count(),
            'active'  => LicenseKey::where('status', LicenseKey::STATUS_ACTIVE)->count(),
            'unused'  => LicenseKey::where('status', LicenseKey::STATUS_UNUSED)->count(),
            'revoked' => LicenseKey::where('status', LicenseKey::STATUS_REVOKED)->count(),
        ];

        return Inertia::render('Admin/LicenseKeys/Index', [
            'keys'    => $keys,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'stats'   => $stats,
        ]);
    }

    /**
     * Admin: Generate license keys without coin charge.
     */
    public function adminGenerate(Request $request)
    {
        $request->validate([
            'quantity'        => 'required|integer|min:1|max:50',
            'duration_months' => 'nullable|integer|min:1|max:36',
            'notes'           => 'nullable|string|max:255',
        ]);

        $quantity = (int) $request->input('quantity', 1);
        $duration = (int) $request->input('duration_months', 6);
        $notes = $request->input('notes') ?: 'Admin Generated';

        $generated = [];
        for ($i = 0; $i < $quantity; $i++) {
            $key = LicenseKey::generateUniqueKey();
            LicenseKey::create([
                'key'             => $key,
                'cost_coins'      => 0,
                'duration_months' => $duration,
                'status'          => LicenseKey::STATUS_UNUSED,
                'purchased_by'    => $request->user()->id,
                'notes'           => $notes,
            ]);
            $generated[] = $key;
        }

        return back()->with('success', "Generated {$quantity} License Key(s) successfully!");
    }

    /**
     * Admin: Revoke a license key.
     */
    public function adminRevoke(Request $request, $id)
    {
        $licenseKey = LicenseKey::findOrFail($id);

        $licenseKey->update([
            'status' => LicenseKey::STATUS_REVOKED,
        ]);

        return back()->with('success', "License Key {$licenseKey->key} has been revoked.");
    }
}
