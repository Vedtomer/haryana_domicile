<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class SwitchAccountController extends Controller
{
    /**
     * Authenticate and switch into another account using credentials.
     */
    public function login(Request $request)
    {
        $request->validate([
            'login'    => 'required|string',
            'password' => 'required|string',
        ]);

        $login = trim($request->login);
        $user = filter_var($login, FILTER_VALIDATE_EMAIL)
            ? User::where('email', $login)->first()
            : User::where('phone', $login)->first();

        if (!$user) {
            // Fallback check on either field
            $user = User::where('email', $login)->orWhere('phone', $login)->first();
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'switch_login' => 'The provided credentials do not match any active account.',
            ]);
        }

        if (!$user->is_active) {
            return back()->withErrors([
                'switch_login' => 'This account has been deactivated. Please contact admin.',
            ]);
        }

        $currentUser = Auth::user();
        $currentId = $currentUser?->id;
        $switched = session('switched_accounts', []);

        if ($currentId && !in_array($currentId, $switched)) {
            $switched[] = $currentId;
        }
        if (!in_array($user->id, $switched)) {
            $switched[] = $user->id;
        }

        $origAdminId = session('original_admin_id');
        if ($currentUser && $currentUser->isAdmin() && !$origAdminId && !$user->isAdmin()) {
            $origAdminId = $currentUser->id;
        }

        Auth::login($user);
        $request->session()->regenerate();
        session(['switched_accounts' => $switched]);

        if ($origAdminId && $user->id !== $origAdminId) {
            session(['original_admin_id' => $origAdminId]);
        } else {
            session()->forget('original_admin_id');
        }

        return redirect()->route('dashboard')->with('success', "Switched to account: {$user->name}");
    }

    /**
     * Switch into an account that is already in the session's authenticated list,
     * or allow admin to switch into any user account.
     */
    public function switch(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $currentUser = Auth::user();
        $targetUserId = (int) $request->user_id;
        $switched = session('switched_accounts', []);
        $origAdminId = session('original_admin_id');

        $isAllowed = in_array($targetUserId, $switched)
            || ($currentUser && $currentUser->isAdmin())
            || ($origAdminId && $targetUserId === (int) $origAdminId);

        if (!$isAllowed) {
            return back()->withErrors([
                'switch_login' => 'Password required to switch to this account.',
            ]);
        }

        $targetUser = User::findOrFail($targetUserId);

        if (!$targetUser->is_active) {
            return back()->with('error', 'Target account is deactivated.');
        }

        $currentId = $currentUser?->id;
        if ($currentId && !in_array($currentId, $switched)) {
            $switched[] = $currentId;
        }
        if (!in_array($targetUser->id, $switched)) {
            $switched[] = $targetUser->id;
        }

        if ($currentUser && $currentUser->isAdmin() && !$origAdminId && !$targetUser->isAdmin()) {
            $origAdminId = $currentUser->id;
        }

        Auth::login($targetUser);
        $request->session()->regenerate();
        session(['switched_accounts' => $switched]);

        if ($origAdminId && $targetUser->id !== $origAdminId) {
            session(['original_admin_id' => $origAdminId]);
        } else {
            session()->forget('original_admin_id');
        }

        return redirect()->route('dashboard')->with('success', "Switched to account: {$targetUser->name}");
    }

    /**
     * Switch back to the original admin account.
     */
    public function switchBackAdmin(Request $request)
    {
        $origAdminId = session('original_admin_id');
        if (!$origAdminId) {
            return back()->with('error', 'No active admin session to return to.');
        }

        $admin = User::find($origAdminId);
        if (!$admin || !$admin->isAdmin() || !$admin->is_active) {
            session()->forget('original_admin_id');
            return back()->with('error', 'Original admin account is not available.');
        }

        $currentId = Auth::id();
        $switched = session('switched_accounts', []);
        if ($currentId && !in_array($currentId, $switched)) {
            $switched[] = $currentId;
        }

        Auth::login($admin);
        $request->session()->regenerate();
        session(['switched_accounts' => $switched]);
        session()->forget('original_admin_id');

        return redirect()->route('dashboard')->with('success', "Switched back to Admin: {$admin->name}");
    }

    /**
     * Remove an account from the session's switcher list.
     */
    public function remove(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
        ]);

        $removeId = (int) $request->user_id;
        if ($removeId === Auth::id()) {
            return back()->with('error', 'Cannot remove the currently active account.');
        }

        $switched = session('switched_accounts', []);
        $switched = array_values(array_filter($switched, fn ($id) => (int) $id !== $removeId));
        session(['switched_accounts' => $switched]);

        return back()->with('success', 'Account removed from switcher.');
    }

    /**
     * Search users for admin account switching.
     */
    public function searchUsers(Request $request)
    {
        $currentUser = Auth::user();
        if (!$currentUser || !$currentUser->isAdmin()) {
            abort(403, 'Unauthorized.');
        }

        $query = trim($request->get('q', ''));
        $users = User::where('id', '!=', $currentUser->id)
            ->when($query, function ($q) use ($query) {
                $q->where(function ($sub) use ($query) {
                    $sub->where('name', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%")
                        ->orWhere('phone', 'like', "%{$query}%");
                });
            })
            ->latest()
            ->limit(10)
            ->get(['id', 'name', 'email', 'phone', 'type', 'coins']);

        return response()->json($users);
    }
}
