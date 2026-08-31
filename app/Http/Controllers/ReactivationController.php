<?php

namespace App\Http\Controllers;

use App\Models\ReactivationRequest;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\SystemAlert;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReactivationController extends Controller
{
    /**
     * Show reactivation page (no auth required — user is logged out)
     */
    public function show(Request $request)
    {
        $userId = $request->query('user_id');
        $user   = $userId ? User::find($userId) : null;

        // Only show this page for inactivity-deactivated users
        if (!$user || $user->is_active || $user->deactivated_reason !== 'inactivity') {
            return redirect('/login');
        }

        // Check if user already has a pending request
        $hasPending = ReactivationRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        return Inertia::render('Reactivate', [
            'user'       => ['id' => $user->id, 'name' => $user->name, 'phone' => $user->phone, 'email' => $user->email],
            'hasPending' => $hasPending,
            'amount'     => 99,
            'upiId'      => Setting::get('upi_id',   'cspjaankari@upi'),
            'upiName'    => Setting::get('upi_name', 'CSP Jaankari'),
        ]);
    }

    /**
     * Submit reactivation payment proof
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'            => 'required|exists:users,id',
            'utr_number'         => 'required|string|max:100',
            'payment_screenshot' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:4096',
        ]);

        $user = User::findOrFail($data['user_id']);

        // Guard: only for inactivity-deactivated users
        if ($user->is_active || $user->deactivated_reason !== 'inactivity') {
            return redirect('/login')->with('error', 'Invalid request.');
        }

        // Prevent duplicate pending requests
        $exists = ReactivationRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($exists) {
            return back()->with('info', 'Aapka request already pending hai. Admin approval ka wait karein.');
        }

        $path = $request->file('payment_screenshot')->store('reactivation-screenshots', 'public');

        ReactivationRequest::create([
            'user_id'            => $user->id,
            'utr_number'         => $data['utr_number'],
            'amount'             => 99,
            'status'             => 'pending',
            'payment_screenshot' => $path,
        ]);

        SystemAlert::toAdmins(
            'Reactivation Request',
            ($user->name ?: $user->phone) . " ne ₹99 reactivation fee submit ki hai.",
            '/admin/reactivation-requests'
        );

        return back()->with('success', '✅ Aapka reactivation request submit ho gaya! Admin approval ke baad aapki ID activate ho jayegi.');
    }
}
