<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // Admins and Super Admins are exempt from email verification
        if ($user->type === 'admin' || $user->type === 'super_admin' || (method_exists($user, 'hasRole') && ($user->hasRole('admin') || $user->hasRole('super_admin')))) {
            return $next($request);
        }

        // Check if user is regular user and their email is not verified
        if ($user->type === 'user' && !$user->email_verified_at) {
            // Whitelisted routes while in verification state
            if ($request->routeIs('email.verify') || 
                $request->routeIs('email.send-otp') || 
                $request->routeIs('email.update') || 
                $request->routeIs('logout')) {
                return $next($request);
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Your email address is not verified. Please verify your email first.',
                    'redirect' => route('email.verify'),
                ], 403);
            }

            return redirect()->route('email.verify');
        }

        return $next($request);
    }
}
