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

    public function sendOtp(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'phone'    => 'required|string|max:20|unique:users,phone',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:4',
        ], [
            'phone.unique' => 'This mobile number is already registered.',
            'email.unique' => 'This email address is already registered.',
        ]);

        $email = strtolower(trim($data['email']));
        $cacheKey = 'reg_otp_' . md5($email);
        $cooldownKey = 'reg_otp_cooldown_' . md5($email);

        // Check 60-second cooldown
        if (\Illuminate\Support\Facades\Cache::store('file')->has($cooldownKey)) {
            $remaining = (int) \Illuminate\Support\Facades\Cache::store('file')->get($cooldownKey) - time();
            if ($remaining > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Please wait {$remaining} seconds before requesting a new OTP.",
                    'cooldown' => $remaining,
                ], 429);
            }
        }

        // Generate 6-digit OTP
        $otp = (string) random_int(100000, 999999);

        // Store OTP in File Cache for 10 minutes (600 seconds)
        \Illuminate\Support\Facades\Cache::store('file')->put($cacheKey, [
            'otp'        => $otp,
            'email'      => $email,
            'created_at' => time(),
        ], 600);

        // Set 60-second cooldown
        \Illuminate\Support\Facades\Cache::store('file')->put($cooldownKey, time() + 60, 60);

        $mailSent = false;
        $lastError = '';

        // Attempt 1: Default SMTP (Port 587 TLS)
        try {
            \Illuminate\Support\Facades\Mail::mailer('smtp')->to($email)
                ->send(new \App\Mail\RegistrationOtpMail($otp, $data['name']));
            $mailSent = true;
        } catch (\Throwable $e) {
            $lastError = $e->getMessage();
            \Illuminate\Support\Facades\Log::warning('Registration OTP email (587 TLS) failed, retrying on 465 SSL: ' . $lastError);
        }

        // Attempt 2: Fallback to Port 465 SSL (in case hosting firewall blocks 587)
        if (!$mailSent) {
            try {
                config([
                    'mail.mailers.smtp.port' => 465,
                    'mail.mailers.smtp.scheme' => 'smtps',
                    'mail.mailers.smtp.encryption' => 'ssl',
                ]);
                app('mail.manager')->purge('smtp');
                \Illuminate\Support\Facades\Mail::mailer('smtp')->to($email)
                    ->send(new \App\Mail\RegistrationOtpMail($otp, $data['name']));
                $mailSent = true;
            } catch (\Throwable $e2) {
                $lastError = $e2->getMessage();
                \Illuminate\Support\Facades\Log::error('Registration OTP email (465 SSL) also failed: ' . $lastError);
            }
        }

        if (!$mailSent) {
            // Remove OTP from cache so user can retry immediately without being stuck
            \Illuminate\Support\Facades\Cache::store('file')->forget($cacheKey);
            \Illuminate\Support\Facades\Cache::store('file')->forget($cooldownKey);

            return response()->json([
                'success' => false,
                'message' => 'Email deliver karne me samasya aayi: ' . $lastError,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => "Verification code sent to {$email}.",
            'cooldown' => 60,
        ]);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'phone'    => 'required|string|max:20|unique:users,phone',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:4',
            'otp'      => 'required|string|size:6',
        ], [
            'phone.unique' => 'This mobile number is already registered.',
            'email.unique' => 'This email address is already registered.',
            'otp.required' => 'Please enter the 6-digit OTP sent to your email.',
            'otp.size'     => 'The OTP must be exactly 6 digits.',
        ]);

        $email = strtolower(trim($data['email']));
        $cacheKey = 'reg_otp_' . md5($email);
        $cached = \Illuminate\Support\Facades\Cache::store('file')->get($cacheKey);

        if (!$cached || !isset($cached['otp']) || $cached['otp'] !== trim($data['otp'])) {
            return back()->withErrors([
                'otp' => 'Invalid or expired OTP. Please check your email or request a new code.',
            ])->onlyInput('name', 'phone', 'email');
        }

        // OTP is valid - remove from cache
        \Illuminate\Support\Facades\Cache::store('file')->forget($cacheKey);
        \Illuminate\Support\Facades\Cache::store('file')->forget('reg_otp_cooldown_' . md5($email));

        $user = \App\Models\User::create([
            'name'              => $data['name'],
            'email'             => $data['email'],
            'phone'             => $data['phone'],
            'password'          => \Illuminate\Support\Facades\Hash::make($data['password']),
            'raw_password'      => $data['password'],
            'type'              => 'user',
            'email_verified_at' => now(),
            'last_activity_at'  => now(),
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
