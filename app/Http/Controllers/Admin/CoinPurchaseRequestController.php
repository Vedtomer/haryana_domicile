<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoinPurchaseRequest;
use App\Models\CoinTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CoinPurchaseRequestController extends Controller
{
    public function index()
    {
        $query = CoinPurchaseRequest::with('user');
        
        if (!auth()->user()->isAdmin() && !auth()->user()->hasRole('super_admin')) {
            $query->where('user_id', auth()->id());
        }
        
        $requests = $query->latest()->paginate(10);
        
        return Inertia::render('Admin/CoinPurchaseRequests/Index', [
            'requests' => $requests,
            'isAdmin' => auth()->user()->isAdmin() || auth()->user()->hasRole('super_admin'),
            'canAction' => auth()->user()->type === 'admin',
        ]);
    }

    public function update(Request $request, CoinPurchaseRequest $coinRequest)
    {
        if (!auth()->user()->isAdmin() && !auth()->user()->hasRole('super_admin')) {
            abort(403);
        }

        $data = $request->validate([
            'action' => 'required|in:approve,reject',
            'admin_notes' => 'nullable|string'
        ]);

        if ($data['action'] === 'approve' && $coinRequest->status === 'pending') {
            DB::transaction(function () use ($coinRequest) {
                $coinRequest->update([
                    'status'      => 'approved',
                    'approved_by' => auth()->id(),
                    'approved_at' => now(),
                ]);

                // Approved purchases are always marked as 'paid' coin_type
                // and contribute to platform revenue tracking.
                $coinRequest->user->addCoins(
                    $coinRequest->coins_requested,
                    CoinTransaction::TYPE_PURCHASE,
                    "Coin Purchase - {$coinRequest->coins_requested} Coins (₹{$coinRequest->package_amount})",
                    null,
                    CoinTransaction::COIN_TYPE_PAID   // Revenue: marked as paid
                );
            });

            return back()->with('success', "✅ Approved! {$coinRequest->coins_requested} paid coins added to user. ₹{$coinRequest->package_amount} added to platform revenue.");
        } 
        
        if ($data['action'] === 'reject') {
            $coinRequest->update([
                'status' => 'rejected',
                'admin_notes' => $data['admin_notes']
            ]);
            return back()->with('success', 'Request rejected.');
        }

        return back();
    }
}
