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
            if (!Auth::user()->is_active) {
                Auth::logout();
                return back()->withErrors(['login' => 'Your account has been deactivated.'])->onlyInput('login');
            }
            $request->session()->regenerate();
            return redirect()->intended('/dashboard');
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
            'email' => $loginType === 'email' ? $data['login'] : null,
            'phone' => $loginType === 'phone' ? $data['login'] : null,
            'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
            'type' => 'user',
        ]);

        // Trigger booted method or sync manually just in case
        $user->syncRoles(['public']);

        Auth::login($user);

        return redirect()->intended('/dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}
