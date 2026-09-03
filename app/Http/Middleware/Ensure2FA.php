<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Ensure2FA
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        if ($request->routeIs('2fa.*') || $request->routeIs('logout')) {
            return $next($request);
        }

        if ($user->google2fa_secret) {
            if (!$request->session()->has('2fa_verified')) {
                return redirect()->route('2fa.challenge');
            }
        }

        return $next($request);
    }
}
