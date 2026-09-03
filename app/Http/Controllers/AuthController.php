<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Admin/Login');
    }

    public function showRegister()
    {
        return Inertia::render('Frontend/Register');
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginType = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $credentials = [
            $loginType => $request->login,
            'password' => $request->password
        ];

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            if (!$user->is_active) {
                Auth::logout();

                // Inactivity-deactivated users get a special reactivation page
                if ($user->deactivated_reason === 'inactivity') {
                    return redirect('/reactivate?user_id=' . $user->id)
                        ->with('info', 'Aapki ID inactive ho gayi hai. ₹99 reactivation fee de kar dobara activate karein.');
                }

                // Admin-banned users get generic error
                return back()->withErrors(['login' => 'Your account has been deactivated by admin.'])->onlyInput('login');
            }

            $request->session()->regenerate();
            Auth::logoutOtherDevices($request->password);
            return redirect()->intended('/dashboard')->with('login_voice', 'Welcome to C S P Jaankari');
        }

        return back()->withErrors([
            'login' => 'The provided credentials do not match our records.',
        ])->onlyInput('login');
    }

    public function register(Request $request)
    {
        $loginType = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $data = $request->validate([
            'login' => [
                'required',
                'string',
                $loginType === 'email' ? 'email' : 'max:20',
                'unique:users,' . $loginType,
            ],
            'password' => 'required|string|min:4',
        ]);

        $user = \App\Models\User::create([
            'email'            => $loginType === 'email' ? $data['login'] : null,
            'phone'            => $loginType === 'phone' ? $data['login'] : null,
            'password'         => \Illuminate\Support\Facades\Hash::make($data['password']),
            'raw_password'     => $data['password'],
            'type'             => 'user',
            'last_activity_at' => now(), // 7-din ka inactivity clock yahan se shuru hoga
        ]);

        // Trigger booted method or sync manually just in case
        $user->syncRoles(['public']);

        Auth::login($user);

        return redirect()->intended('/dashboard')->with('login_voice', 'Welcome to C S P Jaankari');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}
