<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for admins — they always get through
        $user = $request->user();
        if ($user && ($user->isAdmin() || $user->hasRole('super_admin'))) {
            return $next($request);
        }

        // Skip maintenance check for admin routes, login, logout, register, reactivate
        $excluded = ['/login', '/register', '/logout', '/reactivate', '/cc', '/up', '/migrate-db'];
        foreach ($excluded as $path) {
            if ($request->is(ltrim($path, '/'))) {
                return $next($request);
            }
        }

        // Check maintenance mode from settings
        if (Setting::get('maintenance_mode') === '1') {
            $message = Setting::get('maintenance_message', 'Site par kaam chal raha hai. Thodi der mein wapas aayein.');

            return response()->view('maintenance', [
                'message' => $message,
            ], 503);
        }

        return $next($request);
    }
}
