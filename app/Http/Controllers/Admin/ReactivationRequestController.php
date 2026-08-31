<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReactivationRequest;
use App\Notifications\SystemAlert;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReactivationRequestController extends Controller
{
    public function index()
    {
        $requests = ReactivationRequest::with('user', 'approvedBy')
            ->latest()
            ->paginate(30);

        return Inertia::render('Admin/ReactivationRequests/Index', [
            'requests' => $requests,
        ]);
    }

    public function approve(ReactivationRequest $reactivationRequest)
    {
        if ($reactivationRequest->status !== 'pending') {
            return back()->with('error', 'Request already processed.');
        }

        $reactivationRequest->update([
            'status'      => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        $reactivationRequest->user->update([
            'is_active'          => true,
            'deactivated_reason' => null,
            'last_activity_at'   => now(), // fresh 7-day window
        ]);

        $reactivationRequest->user->notify(new SystemAlert(
            'Account Activated',
            'Aapki ID dubara activate kar di gayi hai. Welcome back!',
            '/dashboard',
            'success'
        ));

        return back()->with('success', '✅ User ID activate kar di gayi.');
    }

    public function reject(Request $request, ReactivationRequest $reactivationRequest)
    {
        $data = $request->validate([
            'admin_note' => 'nullable|string|max:500',
        ]);

        $reactivationRequest->update([
            'status'     => 'rejected',
            'admin_note' => $data['admin_note'] ?? null,
        ]);

        $reactivationRequest->user->notify(new SystemAlert(
            'Reactivation Rejected',
            'Aapka reactivation request reject kar diya gaya.'
                . ($data['admin_note'] ? ' Reason: ' . $data['admin_note'] : ''),
            '/reactivate?user_id=' . $reactivationRequest->user_id,
            'error'
        ));

        return back()->with('success', 'Request reject kar di gayi.');
    }
}
