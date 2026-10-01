<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CoinTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        $search = trim($request->input('search', ''));
        $status = $request->input('status', 'all');

        $query = User::with(['roles', 'referrer:id,name,phone,email,referral_code'])
            ->withCount([
                'referrals',
                'chatMessages as unread_messages_count' => function ($q) {
                    $q->where('sender_type', 'user')->where('is_read', false);
                }
            ])
            ->latest();
        
        if (auth()->user()->type === 'admin') {
            $query->where('type', 'user');
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('referral_code', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
                
                if (is_numeric($search)) {
                    $q->orWhere('id', $search);
                }
            });
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $users = $query->paginate(15)->withQueryString();

        $allUsersQuery = User::select('id', 'name', 'phone', 'email', 'type');
        if (auth()->user()->type === 'admin') {
            $allUsersQuery->where('type', 'user');
        } else {
            $allUsersQuery->where('id', '!=', auth()->id());
        }
        $allUsers = $allUsersQuery->orderBy('name')->get();

        // Calculate counts for badges
        $countsQuery = User::query();
        if (auth()->user()->type === 'admin') {
            $countsQuery->where('type', 'user');
        }
        $totalCount = (clone $countsQuery)->count();
        $activeCount = (clone $countsQuery)->where('is_active', true)->count();
        $inactiveCount = (clone $countsQuery)->where('is_active', false)->count();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'allUsers' => $allUsers,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'counts' => [
                'total' => $totalCount,
                'active' => $activeCount,
                'inactive' => $inactiveCount,
            ],
        ]);
    }

    public function create()
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }
        return Inertia::render('Admin/Users/Create');
    }

    public function store(Request $request)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|required_without:phone|string|email|max:255|unique:users',
            'phone' => 'nullable|required_without:email|string|max:20|unique:users',
            'password' => 'required|string|min:4',
            'type' => 'required|in:super_admin,admin,user',
            'coins' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'allowed_devices' => 'nullable|integer|in:0,1,2',
        ]);

        $data['raw_password'] = $data['password'];
        $data['password'] = Hash::make($data['password']);
        $data['allowed_devices'] = $data['allowed_devices'] ?? 0;
        
        if (auth()->user()->type === 'admin' && $data['type'] !== 'user') {
            abort(403, 'You can only create regular users.');
        }
        
        $user = User::create($data);
        
        if ($data['type'] === 'super_admin') {
            $user->syncRoles(['super_admin']);
        } elseif ($data['type'] === 'admin') {
            $user->syncRoles(['admin']);
        } else {
            $user->syncRoles(['public']);
        }

        return redirect()->route('admin.users.index')->with('success', 'User created successfully!');
    }

    public function edit(User $user)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        if (auth()->user()->type === 'admin' && $user->type !== 'user') {
            abort(403, 'You can only edit regular users.');
        }

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user
        ]);
    }

    public function update(Request $request, User $user)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|required_without:phone|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|required_without:email|string|max:20|unique:users,phone,' . $user->id,
            'password' => 'nullable|string|min:4',
            'type' => 'required|in:super_admin,admin,user',
            'coins' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'allowed_devices' => 'nullable|integer|in:0,1,2',
        ]);

        if (!empty($data['password'])) {
            $data['raw_password'] = $data['password'];
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        if (auth()->user()->type === 'admin' && ($user->type !== 'user' || $data['type'] !== 'user')) {
            abort(403, 'You can only modify regular users.');
        }

        $user->update($data);
        
        if ($data['type'] === 'super_admin') {
            $user->syncRoles(['super_admin']);
        } elseif ($data['type'] === 'admin') {
            $user->syncRoles(['admin']);
        } else {
            $user->syncRoles(['public']);
        }

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully!');
    }

    public function addCoins(Request $request, User $user)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        $data = $request->validate([
            'amount' => 'required|numeric|min:1',
            'coin_type' => 'required|in:trial,paid',
            'description' => 'nullable|string|max:255',
        ]);

        if (auth()->user()->type === 'admin' && $user->type !== 'user') {
            abort(403, 'You can only add coins to regular users.');
        }

        $description = $data['coin_type'] === 'trial' ? 'Trial Coins' : 'Paid Coins';

        $user->addCoins(
            (int)$data['amount'],
            CoinTransaction::TYPE_ADMIN_CREDIT,
            $description,
            null,
            $data['coin_type']
        );

        if ($data['coin_type'] === 'paid') {
            $user->checkAndTriggerReferralBonus((int) $data['amount']);
        }

        return back()->with('success', 'Coins added.');
    }

    public function clearCoins(User $user)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        if (auth()->user()->type === 'admin' && $user->type !== 'user') {
            abort(403, 'You can only clear coins for regular users.');
        }

        $currentCoins = $user->coins;
        
        if ($currentCoins > 0) {
            $user->deductCoins(
                $currentCoins,
                CoinTransaction::TYPE_ADMIN_CREDIT,
                'Admin cleared all coins'
            );
        }

        return back()->with('success', 'User coins have been cleared to 0.');
    }

    public function toggleStatus(User $user)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }
        if (auth()->user()->type === 'admin' && $user->type !== 'user') {
            abort(403);
        }
        $user->update(['is_active' => !$user->is_active]);
        return back()->with('success', 'User status updated.');
    }

    public function destroy(User $user)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        if ($user->id === auth()->id()) {
            abort(403, 'You cannot delete your own account.');
        }

        if (auth()->user()->type === 'admin' && $user->type !== 'user') {
            abort(403, 'You can only delete regular users.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully!');
    }

    public function updateDeviceLimit(Request $request, User $user)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        $data = $request->validate([
            'allowed_devices' => 'required|integer|in:0,1,2',
        ]);

        $user->update([
            'allowed_devices' => (int) $data['allowed_devices'],
        ]);

        $label = match ((int)$data['allowed_devices']) {
            0 => 'Unlimited (No PC Lock)',
            1 => '1 PC',
            2 => '2 PCs',
            default => $data['allowed_devices'] . ' PCs',
        };

        return back()->with('success', "PC access limit for {$user->name} updated to {$label}.");
    }

    public function resetDeviceLock(User $user)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        $user->resetDesktopLock();

        return back()->with('success', "PC device lock for {$user->name} has been reset.");
    }

    public function clearAllWorkData(Request $request)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        $target = $request->input('target', $request->input('scope', 'users')); // 'users', 'all', or 'selected'
        $selectedUserIds = $request->input('user_ids', []);
        if (is_string($selectedUserIds)) {
            $selectedUserIds = array_filter(array_map('trim', explode(',', $selectedUserIds)));
        }

        $resetCoins = $request->boolean('reset_coins', false);
        $clearTransactions = $request->boolean('clear_transactions', false);
        $resetDevices = $request->boolean('reset_devices', false);
        $clearChat = $request->boolean('clear_chat', false);

        $query = User::query();
        if ($target === 'selected' && !empty($selectedUserIds)) {
            $query->whereIn('id', (array)$selectedUserIds);
            if (auth()->user()->type === 'admin') {
                $query->where('type', 'user');
            }
        } elseif ($target === 'users') {
            $query->where('type', 'user');
        } elseif (auth()->user()->type === 'admin') {
            $query->where('type', 'user');
        } else {
            $query->where('id', '!=', auth()->id());
        }

        $userIds = $query->pluck('id')->toArray();

        if (empty($userIds)) {
            return back()->with('error', 'No users selected or found to clear.');
        }

        $stats = $this->purgeWorkDataForUserIds($userIds, [
            'reset_coins' => $resetCoins,
            'clear_transactions' => $clearTransactions,
            'reset_devices' => $resetDevices,
            'clear_chat' => $clearChat,
            'also_orphans' => ($target === 'all' && auth()->user()->type === 'super_admin'),
        ]);

        return back()->with('success', "Work data cleared successfully! ({$stats['deleted_records']} service records deleted across {$stats['user_count']} users).");
    }

    public function clearUserWorkData(Request $request, User $user)
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        if (auth()->user()->type === 'admin' && $user->type !== 'user') {
            abort(403, 'You can only clear work data for regular users.');
        }

        $resetCoins = $request->boolean('reset_coins', false);
        $clearTransactions = $request->boolean('clear_transactions', false);
        $resetDevices = $request->boolean('reset_devices', false);
        $clearChat = $request->boolean('clear_chat', false);

        $stats = $this->purgeWorkDataForUserIds([$user->id], [
            'reset_coins' => $resetCoins,
            'clear_transactions' => $clearTransactions,
            'reset_devices' => $resetDevices,
            'clear_chat' => $clearChat,
            'also_orphans' => false,
        ]);

        return back()->with('success', "Work data for {$user->name} has been cleared! ({$stats['deleted_records']} records removed).");
    }

    private function purgeWorkDataForUserIds(array $userIds, array $options): array
    {
        if (empty($userIds) && empty($options['also_orphans'])) {
            return ['deleted_records' => 0, 'user_count' => 0];
        }

        $totalDeleted = 0;

        // Clean up files and records for TenthPassbook
        if (class_exists(\App\Models\TenthPassbook::class)) {
            $query = \App\Models\TenthPassbook::whereIn('user_id', $userIds);
            foreach ($query->get() as $item) {
                if ($item->image_path) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($item->image_path);
                }
            }
            $totalDeleted += $query->delete();
        }

        // Clean up files and records for ManualPanCard
        if (class_exists(\App\Models\ManualPanCard::class)) {
            $query = \App\Models\ManualPanCard::whereIn('user_id', $userIds);
            foreach ($query->get() as $item) {
                if ($item->photo_path) \Illuminate\Support\Facades\Storage::disk('public')->delete($item->photo_path);
                if ($item->signature_path) \Illuminate\Support\Facades\Storage::disk('public')->delete($item->signature_path);
            }
            $totalDeleted += $query->delete();
        }

        // Delete from all service work tables
        $workModels = [
            \App\Models\AadharUpdate::class,
            \App\Models\RentAgreement::class,
            \App\Models\BobAffidavit::class,
            \App\Models\HaryanaDomicile::class,
            \App\Models\BirthRecord::class,
            \App\Models\MarriageForm::class,
            \App\Models\MarriageAffidavit::class,
            \App\Models\AirtelPassbook::class,
            \App\Models\PanRequest::class,
            \App\Models\PanDetailsRequest::class,
            \App\Models\ServiceRequest::class,
            \App\Models\PdfConverter::class,
            \App\Models\PrintJob::class,
            \App\Models\ReactivationRequest::class,
        ];

        foreach ($workModels as $modelClass) {
            if (class_exists($modelClass)) {
                try {
                    $q = $modelClass::whereIn('user_id', $userIds);
                    if (!empty($options['also_orphans'])) {
                        $q->orWhereNull('user_id');
                    }
                    $totalDeleted += $q->delete();
                } catch (\Throwable $e) {
                    // Ignore if table does not exist
                }
            }
        }

        if (!empty($options['reset_coins'])) {
            User::whereIn('id', $userIds)->update(['coins' => 0]);
        }

        if (!empty($options['clear_transactions'])) {
            if (class_exists(\App\Models\CoinTransaction::class)) {
                $totalDeleted += \App\Models\CoinTransaction::whereIn('user_id', $userIds)->delete();
            }
            if (class_exists(\App\Models\CoinPurchaseRequest::class)) {
                $totalDeleted += \App\Models\CoinPurchaseRequest::whereIn('user_id', $userIds)->delete();
            }
        }

        if (!empty($options['reset_devices'])) {
            $users = User::whereIn('id', $userIds)->get();
            foreach ($users as $u) {
                $u->resetDesktopLock();
            }
        }

        if (!empty($options['clear_chat'])) {
            if (class_exists(\App\Models\ChatMessage::class)) {
                $totalDeleted += \App\Models\ChatMessage::whereIn('user_id', $userIds)->delete();
            }
        }

        return [
            'deleted_records' => $totalDeleted,
            'user_count' => count($userIds),
        ];
    }
}
