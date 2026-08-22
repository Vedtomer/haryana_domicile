<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoinPurchaseRequest;
use App\Models\CoinTransaction;
use App\Models\Setting;
use App\Notifications\SystemAlert;
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

        // 1 coin = ₹1 base rate.
        // Bonus % increases progressively for larger purchases.
        $packages = [
            ['amount' => 20,  'base_coins' => 20,  'bonus_coins' => 1,   'bonus_pct' => 5,  'label' => 'Mini',     'popular' => false],
            ['amount' => 49,  'base_coins' => 49,  'bonus_coins' => 0,   'bonus_pct' => 0,  'label' => 'Starter',  'popular' => false],
            ['amount' => 99,  'base_coins' => 99,  'bonus_coins' => 6,   'bonus_pct' => 6,  'label' => 'Basic',    'popular' => false],
            ['amount' => 199, 'base_coins' => 199, 'bonus_coins' => 20,  'bonus_pct' => 10, 'label' => 'Standard', 'popular' => true ],
            ['amount' => 399, 'base_coins' => 399, 'bonus_coins' => 60,  'bonus_pct' => 15, 'label' => 'Pro',      'popular' => false],
            ['amount' => 799, 'base_coins' => 799, 'bonus_coins' => 160, 'bonus_pct' => 20, 'label' => 'Business', 'popular' => false],
        ];

        // Compute total coins for each package
        foreach ($packages as &$pkg) {
            $pkg['coins_requested'] = $pkg['base_coins'] + $pkg['bonus_coins'];
        }

        return Inertia::render('Admin/CoinPurchaseRequests/Create', [
            'packages'   => $packages,
            'myRequests' => $myRequests,
            'userCoins'  => auth()->user()->coins,
            'upiId'      => Setting::get('upi_id',   'cspjaankari@upi'),
            'upiName'    => Setting::get('upi_name', 'CSP Jaankari'),
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

        $coinRequest = CoinPurchaseRequest::create([
            'user_id'            => auth()->id(),
            'package_amount'     => $data['package_amount'],
            'coins_requested'    => $data['coins_requested'],
            'utr_number'         => $data['utr_number'] ?? null,
            'payment_screenshot' => $path,
            'status'             => CoinPurchaseRequest::STATUS_PENDING,
        ]);

        SystemAlert::toAdmins(
            'New coin purchase request',
            auth()->user()->name . " paid ₹{$coinRequest->package_amount} for {$coinRequest->coins_requested} coins.",
            '/admin/coin-requests',
        );

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

            $coinRequest->user->notify(new SystemAlert(
                'Coins added',
                "Your purchase of {$coinRequest->coins_requested} coins (₹{$coinRequest->package_amount}) was approved. New balance: {$coinRequest->user->fresh()->coins} coins.",
                '/dashboard',
                'success',
            ));

            return back()->with('success', "✅ Approved! {$coinRequest->coins_requested} paid coins added to user. ₹{$coinRequest->package_amount} added to platform revenue.");
        } 
        
        if ($data['action'] === 'reject') {
            $coinRequest->update([
                'status' => 'rejected',
                'admin_notes' => $data['admin_notes']
            ]);

            $coinRequest->user->notify(new SystemAlert(
                'Coin request rejected',
                "Your request for {$coinRequest->coins_requested} coins was rejected."
                    . ($data['admin_notes'] ? ' Reason: ' . $data['admin_notes'] : ''),
                '/admin/coin-requests',
                'error',
            ));

            return back()->with('success', 'Request rejected.');
        }

        return back();
    }
}
