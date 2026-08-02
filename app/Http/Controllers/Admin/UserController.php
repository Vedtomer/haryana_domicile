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
        if (auth()->user()->type !== 'super_admin') {
            abort(403);
        }

        $users = User::with('roles')->latest()->paginate(10);
        return Inertia::render('Admin/Users/Index', ['users' => $users]);
    }

    public function create()
    {
        if (auth()->user()->type !== 'super_admin') {
            abort(403);
        }
        return Inertia::render('Admin/Users/Create');
    }

    public function store(Request $request)
    {
        if (auth()->user()->type !== 'super_admin') {
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

        $data['password'] = Hash::make($data['password']);
        
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
        if (auth()->user()->type !== 'super_admin') {
            abort(403);
        }
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user
        ]);
    }

    public function update(Request $request, User $user)
    {
        if (auth()->user()->type !== 'super_admin') {
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
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
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
        if (auth()->user()->type !== 'super_admin') {
            abort(403);
        }

        $data = $request->validate([
            'amount' => 'required|numeric|min:1',
            'description' => 'nullable|string|max:255'
        ]);

        $user->addCoins(
            (int)$data['amount'],
            CoinTransaction::TYPE_ADMIN_CREDIT,
            $data['description'] ?? 'Added by Admin'
        );

        return back()->with('success', 'Coins added.');
    }
}
