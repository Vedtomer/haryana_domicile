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
        if (!auth()->user()->isAdmin() && !auth()->user()->hasRole('super_admin')) {
            abort(403);
        }

        $users = User::with('roles')->latest()->paginate(10);
        return Inertia::render('Admin/Users/Index', ['users' => $users]);
    }

    public function create()
    {
        if (!auth()->user()->isAdmin() && !auth()->user()->hasRole('super_admin')) {
            abort(403);
        }
        return Inertia::render('Admin/Users/Create');
    }

    public function store(Request $request)
    {
        if (!auth()->user()->isAdmin() && !auth()->user()->hasRole('super_admin')) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'type' => 'required|in:user,admin,super_admin',
            'coins' => 'required|numeric|min:0'
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

        return redirect()->route('admin.users.index')->with('success', 'User created.');
    }

    public function edit(User $user)
    {
        if (!auth()->user()->isAdmin() && !auth()->user()->hasRole('super_admin')) {
            abort(403);
        }
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user
        ]);
    }

    public function update(Request $request, User $user)
    {
        if (!auth()->user()->isAdmin() && !auth()->user()->hasRole('super_admin')) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:6',
            'type' => 'required|in:user,admin,super_admin',
            'coins' => 'required|numeric|min:0'
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

        return redirect()->route('admin.users.index')->with('success', 'User updated.');
    }

    public function addCoins(Request $request, User $user)
    {
        if (!auth()->user()->isAdmin() && !auth()->user()->hasRole('super_admin')) {
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
