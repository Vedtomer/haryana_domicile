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
        // Admins always bypass — check this first before any DB query
        $user = $request->user();
        if ($user && ($user->isAdmin() || $user->hasRole('super_admin'))) {
            return $next($request);
        }

        // Always allow these paths regardless of maintenance
        $excluded = [
            'login', 'register', 'logout',
            'reactivate', 'maintenance-page', 'cc', 'up', 'migrate-db',
        ];
        foreach ($excluded as $path) {
            if ($request->is($path)) {
                return $next($request);
            }
        }

        // Check maintenance mode (catch any DB errors gracefully)
        try {
            $isOn = Setting::get('maintenance_mode', '0') === '1';
        } catch (\Throwable $e) {
            // If settings table unavailable, don't block anyone
            return $next($request);
        }

        if (!$isOn) {
            return $next($request);
        }

        $message = Setting::get('maintenance_message', 'Site par kaam chal raha hai. Thodi der mein wapas aayein.');

        // For Inertia XHR requests, redirect to a simple maintenance URL
        // so Inertia can handle the redirect cleanly (avoids "refresh" bug)
        if ($request->header('X-Inertia')) {
            return redirect('/maintenance-page');
        }

        // For regular browser requests, show the blade page
        return response()->view('maintenance', ['message' => $message], 503);
    }
}

