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
        $user = auth()->user();

        // Regular users should see their own buy page, not the admin list
        if ($user->type === 'user') {
            return redirect()->route('admin.coin-requests.create');
        }

        $query = CoinPurchaseRequest::with('user');
        $requests = $query->latest()->paginate(50);
        
        return Inertia::render('Admin/CoinPurchaseRequests/Index', [
            'requests'  => $requests,
            'isAdmin'   => $user->isAdmin() || $user->hasRole('super_admin'),
            'canAction' => $user->type === 'admin',
        ]);
    }

    public function create()
    {
        // Only regular users can buy coins
        if (auth()->user()->type !== 'user') {
            return redirect()->route('admin.coin-requests.index');
        }

        $myRequests = CoinPurchaseRequest::where('user_id', auth()->id())
            ->latest()->take(5)->get();

        // Predefined coin packages
        $packages = [
            ['coins' => 10,  'amount' => 49,  'label' => 'Starter',    'popular' => false],
            ['coins' => 25,  'amount' => 99,  'label' => 'Basic',      'popular' => false],
            ['coins' => 60,  'amount' => 199, 'label' => 'Standard',   'popular' => true],
            ['coins' => 130, 'amount' => 399, 'label' => 'Pro',        'popular' => false],
            ['coins' => 300, 'amount' => 799, 'label' => 'Business',   'popular' => false],
        ];

        return Inertia::render('Admin/CoinPurchaseRequests/Create', [
            'packages'   => $packages,
            'myRequests' => $myRequests,
            'userCoins'  => auth()->user()->coins,
        ]);
    }

    public function store(Request $request)
    {
        if (auth()->user()->type !== 'user') {
            abort(403);
        }

        $data = $request->validate([
            'package_amount'    => 'required|integer|min:1',
            'coins_requested'   => 'required|integer|min:1',
            'utr_number'        => 'nullable|string|max:100',
            'payment_screenshot'=> 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:4096',
        ]);

        $path = $request->file('payment_screenshot')->store('coin-screenshots', 'public');

        CoinPurchaseRequest::create([
            'user_id'            => auth()->id(),
            'package_amount'     => $data['package_amount'],
            'coins_requested'    => $data['coins_requested'],
            'utr_number'         => $data['utr_number'] ?? null,
            'payment_screenshot' => $path,
            'status'             => CoinPurchaseRequest::STATUS_PENDING,
        ]);

        return redirect()->route('admin.coin-requests.create')
            ->with('success', '✅ Your coin request has been submitted! We will review and approve it shortly.');
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
