<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Blocks routes that only platform admins may touch.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Please login first.');
        }

        $isAdmin = false;

        if (in_array($user->type ?? '', ['admin', 'super_admin']) || ($user->is_admin ?? false)) {
            $isAdmin = true;
        }

        if (!$isAdmin) {
            try {
                if ($user->isAdmin() || $user->hasRole('super_admin') || $user->hasRole('admin')) {
                    $isAdmin = true;
                }
            } catch (\Throwable $e) {}
        }

        if (!$isAdmin) {
            abort(403, 'Admin access required.');
        }

        return $next($request);
    }
}
