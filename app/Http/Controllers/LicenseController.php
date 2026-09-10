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

        if ($status) {
            $checkStatus = ($status === 'deactivated') ? LicenseKey::STATUS_REVOKED : $status;
            if (in_array($checkStatus, [LicenseKey::STATUS_UNUSED, LicenseKey::STATUS_ACTIVE, LicenseKey::STATUS_REVOKED])) {
                $query->where('status', $checkStatus);
            }
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
     * Admin: Activate or re-activate a license key.
     */
    public function adminActivate(Request $request, $id)
    {
        $licenseKey = LicenseKey::with(['activator', 'purchaser'])->findOrFail($id);

        $user = null;
        if ($request->filled('user_id')) {
            $user = User::find($request->input('user_id'));
        } elseif ($request->filled('user_query')) {
            $target = trim($request->input('user_query'));
            $user = User::where('email', $target)->orWhere('phone', $target)->first();
            if (!$user) {
                return back()->with('error', "User not found with email/phone '{$target}'");
            }
        } elseif ($licenseKey->activator) {
            $user = $licenseKey->activator;
        } elseif ($licenseKey->purchaser) {
            $user = $licenseKey->purchaser;
        }

        $months = (int) ($licenseKey->duration_months ?: 6);

        if ($user) {
            $newExpiry = now()->addMonths($months);

            $licenseKey->update([
                'status'       => LicenseKey::STATUS_ACTIVE,
                'activated_by' => $user->id,
                'activated_at' => $licenseKey->activated_at ?: now(),
                'expires_at'   => $newExpiry,
            ]);

            $user->update([
                'license_expires_at' => $newExpiry,
            ]);

            return back()->with('success', "License Key {$licenseKey->key} activated for {$user->name} until " . $newExpiry->format('d M Y') . ".");
        } else {
            // Key has no user attached: mark it unused and ready for redemption
            $licenseKey->update([
                'status' => LicenseKey::STATUS_UNUSED,
            ]);

            return back()->with('success', "License Key {$licenseKey->key} marked as Active/Unused and ready for use.");
        }
    }

    /**
     * Admin: Deactivate a license key.
     */
    public function adminDeactivate(Request $request, $id)
    {
        $licenseKey = LicenseKey::with('activator')->findOrFail($id);

        $licenseKey->update([
            'status' => LicenseKey::STATUS_REVOKED,
        ]);

        // Revoke user's portal access if they were active with this key
        if ($licenseKey->activator) {
            $licenseKey->activator->update([
                'license_expires_at' => now()->subSecond(),
            ]);
        }

        return back()->with('success', "License Key {$licenseKey->key} has been deactivated.");
    }

    /**
     * Admin: Revoke alias.
     */
    public function adminRevoke(Request $request, $id)
    {
        return $this->adminDeactivate($request, $id);
    }

    /**
     * Admin: Delete a license key permanently.
     */
    public function adminDestroy(Request $request, $id)
    {
        $licenseKey = LicenseKey::with('activator')->findOrFail($id);
        $keyString = $licenseKey->key;

        // If it was currently active, deactivate the user's license
        if ($licenseKey->status === LicenseKey::STATUS_ACTIVE && $licenseKey->activator) {
            $licenseKey->activator->update([
                'license_expires_at' => now()->subSecond(),
            ]);
        }

        $licenseKey->delete();

        return back()->with('success', "License Key {$keyString} has been deleted.");
    }
}
