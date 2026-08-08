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

        if (!$user || (!$user->isAdmin() && !$user->hasRole('super_admin'))) {
            abort(403);
        }

        return $next($request);
    }
}
