<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveLicense
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If no user or user is admin/super_admin, bypass
        if (!$user || $user->isAdmin() || $user->hasRole('super_admin')) {
            return $next($request);
        }

        // Check if user has active license
        if (!$user->hasActiveLicense()) {
            if ($request->expectsJson() || $request->isXmlHttpRequest()) {
                return response()->json([
                    'message' => 'Active 6-Month Portal License (50 Coins) is required to access this service.',
                    'requires_license' => true,
                ], 403);
            }

            return redirect()->route('dashboard')->with('error', 'Portal License Required: Services use karne ke liye 6-Month License (50 Coins) active hona zaroori hai. Kripya apna license activate karein.');
        }

        return $next($request);
    }
}
