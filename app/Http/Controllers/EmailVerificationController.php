<?php

namespace App\Http\Controllers;

use App\Mail\RegistrationOtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class EmailVerificationController extends Controller
{
    /**
     * Show the email verification notice / OTP entry page.
     */
    public function show(Request $request)
    {
        $user = $request->user();

        // If already verified, redirect to dashboard
        if ($user->email_verified_at) {
            return redirect('/dashboard');
        }

        $email = strtolower(trim($user->email));
        $cooldownKey = 'reg_otp_cooldown_' . md5($email);
        $cooldown = 0;

        if (Cache::store('file')->has($cooldownKey)) {
            $cooldown = max(0, (int) Cache::store('file')->get($cooldownKey) - time());
        }

        return Inertia::render('Auth/VerifyEmail', [
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'cooldown' => $cooldown,
        ]);
    }

    /**
     * Send OTP to the logged-in user's email.
     */
    public function sendOtp(Request $request)
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json([
                'success'  => true,
                'message'  => 'Email is already verified.',
                'verified' => true,
            ]);
        }

        $email = strtolower(trim($user->email));
        $cacheKey = 'reg_otp_' . md5($email);
        $cooldownKey = 'reg_otp_cooldown_' . md5($email);

        // Check cooldown
        if (Cache::store('file')->has($cooldownKey)) {
            $remaining = (int) Cache::store('file')->get($cooldownKey) - time();
            if ($remaining > 0) {
                return response()->json([
                    'success'  => false,
                    'message'  => "Please wait {$remaining} seconds before requesting a new OTP.",
                    'cooldown' => $remaining,
                ], 429);
            }
        }

        $otp = (string) random_int(100000, 999999);

        $payload = [
            'otp'        => $otp,
            'email'      => $email,
            'created_at' => time(),
        ];

        // Store in file cache and session for 10 minutes
        Cache::store('file')->put($cacheKey, $payload, 600);
        Cache::put($cacheKey, $payload, 600);
        $request->session()->put($cacheKey, $payload);

        Cache::store('file')->put($cooldownKey, time() + 60, 60);

        $mailSent = false;
        $lastError = '';

        // Attempt 1: Port 587 TLS
        try {
            Mail::mailer('smtp')->to($email)
                ->send(new RegistrationOtpMail($otp, $user->name));
            $mailSent = true;
        } catch (\Throwable $e) {
            $lastError = $e->getMessage();
            Log::warning('Verification OTP (587 TLS) failed, retrying 465 SSL: ' . $lastError);
        }

        // Attempt 2: Port 465 SSL
        if (!$mailSent) {
            try {
                config([
                    'mail.mailers.smtp.port' => 465,
                    'mail.mailers.smtp.scheme' => 'smtps',
                    'mail.mailers.smtp.encryption' => 'ssl',
                ]);
                app('mail.manager')->purge('smtp');
                Mail::mailer('smtp')->to($email)
                    ->send(new RegistrationOtpMail($otp, $user->name));
                $mailSent = true;
            } catch (\Throwable $e2) {
                $lastError = $e2->getMessage();
                Log::error('Verification OTP (465 SSL) also failed: ' . $lastError);
            }
        }

        if (!$mailSent) {
            Cache::store('file')->forget($cacheKey);
            Cache::store('file')->forget($cooldownKey);

            return response()->json([
                'success' => false,
                'message' => 'Email deliver karne me dikkat aayi: ' . $lastError,
            ], 500);
        }

        return response()->json([
            'success'  => true,
            'message'  => "Verification OTP sent to {$email}.",
            'cooldown' => 60,
        ]);
    }

    /**
     * Verify the entered 6-digit OTP.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ], [
            'otp.required' => 'Please enter the 6-digit OTP.',
            'otp.size'     => 'The OTP must be exactly 6 digits.',
        ]);

        $user = $request->user();
        $email = strtolower(trim($user->email));
        $cacheKey = 'reg_otp_' . md5($email);
        
        $cached = Cache::store('file')->get($cacheKey) 
            ?? Cache::get($cacheKey) 
            ?? $request->session()->get($cacheKey);

        if (!$cached || !isset($cached['otp']) || trim($cached['otp']) !== trim($request->otp)) {
            return back()->withErrors([
                'otp' => 'Invalid or expired OTP code. Please request a new code.',
            ]);
        }

        // Clean up cache and session
        Cache::store('file')->forget($cacheKey);
        Cache::forget($cacheKey);
        $request->session()->forget($cacheKey);
        Cache::store('file')->forget('reg_otp_cooldown_' . md5($email));

        // Mark as verified
        $user->email_verified_at = now();
        $user->save();

        return redirect('/dashboard')
            ->with('success', '✅ Your email address has been verified successfully!');
    }

    /**
     * Update email address in case user registered with a typo/wrong email.
     */
    public function updateEmail(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'new_email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ], [
            'new_email.required' => 'Please enter a valid email address.',
            'new_email.email'    => 'Please enter a valid email format.',
            'new_email.unique'   => 'This email address is already in use by another account.',
        ]);

        $newEmail = strtolower(trim($data['new_email']));

        // Clear any old caches
        $oldEmail = strtolower(trim($user->email));
        Cache::store('file')->forget('reg_otp_' . md5($oldEmail));
        Cache::store('file')->forget('reg_otp_cooldown_' . md5($oldEmail));

        $user->email = $newEmail;
        $user->email_verified_at = null;
        $user->save();

        // Immediately send OTP to new email
        return $this->sendOtp($request);
    }
}
