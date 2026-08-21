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
    public function index()
    {
        if (!in_array(auth()->user()->type, ['admin', 'super_admin'])) {
            abort(403);
        }

        $query = User::with('roles')->latest();
        
        if (auth()->user()->type === 'admin') {
            $query->where('type', 'user');
        }

        $users = $query->paginate(10);
        return Inertia::render('Admin/Users/Index', ['users' => $users]);
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
            'is_active' => 'boolean'
        ]);

        $data['raw_password'] = $data['password'];
        $data['password'] = Hash::make($data['password']);
        
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
            'is_active' => 'boolean'
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
}
