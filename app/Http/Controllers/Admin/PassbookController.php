<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoinTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PassbookController extends Controller
{
    /**
     * Display the Passbook / Coin Ledger.
     * Admin can view all users' transactions with user name, mobile, service used, and coin details.
     * Regular users see their own wallet transactions.
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        if (!$currentUser) {
            return redirect()->route('login');
        }

        $isAdmin = $currentUser->isAdmin();
        $scope = $isAdmin ? $request->query('scope', 'all') : 'my';
        $search = trim($request->query('search', ''));
        $type = $request->query('type', 'all');
        $dateFilter = $request->query('date', 'all');
        $selectedUserId = $request->query('user_id');

        $query = CoinTransaction::query()->with([
            'user:id,name,phone,email,type,coins',
            'creator:id,name',
        ]);

        if (!$isAdmin || $scope === 'my') {
            $query->where('user_id', $currentUser->id);
        } elseif (!empty($selectedUserId)) {
            $query->where('user_id', $selectedUserId);
        }

        if (!empty($type) && $type !== 'all') {
            $query->where('type', $type);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                if (is_numeric($search)) {
                    $q->where('id', (int) $search);
                }
                $q->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($dateFilter) && $dateFilter !== 'all') {
            match ($dateFilter) {
                'today' => $query->whereDate('created_at', today()),
                'yesterday' => $query->whereDate('created_at', today()->subDay()),
                'this_week' => $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]),
                'this_month' => $query->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year),
                default => null,
            };
        }

        $transactions = $query->latest('id')->paginate(25)->withQueryString();

        // Calculate summary metrics
        if ($isAdmin && $scope === 'all' && empty($selectedUserId)) {
            $summary = [
                'total_system_coins' => (int) User::sum('coins'),
                'today_spent' => (int) abs(CoinTransaction::whereDate('created_at', today())->where('amount', '<', 0)->sum('amount')),
                'today_added' => (int) CoinTransaction::whereDate('created_at', today())->where('amount', '>', 0)->sum('amount'),
                'today_services_count' => CoinTransaction::whereDate('created_at', today())->where('type', CoinTransaction::TYPE_SERVICE_DEDUCTION)->count(),
                'total_transactions' => CoinTransaction::count(),
            ];
        } else {
            $targetUserId = ($isAdmin && !empty($selectedUserId)) ? $selectedUserId : $currentUser->id;
            $summary = [
                'balance' => (int) User::where('id', $targetUserId)->value('coins'),
                'added' => (int) CoinTransaction::where('user_id', $targetUserId)->where('amount', '>', 0)->sum('amount'),
                'spent' => (int) abs(CoinTransaction::where('user_id', $targetUserId)->where('amount', '<', 0)->sum('amount')),
                'today_spent' => (int) abs(CoinTransaction::where('user_id', $targetUserId)->whereDate('created_at', today())->where('amount', '<', 0)->sum('amount')),
            ];
        }

        return Inertia::render('Admin/Passbook/Index', [
            'transactions' => $transactions,
            'summary' => $summary,
            'isAdmin' => $isAdmin,
            'filters' => [
                'scope' => $scope,
                'search' => $search,
                'type' => $type,
                'date' => $dateFilter,
                'user_id' => $selectedUserId,
            ],
        ]);
    }
}
