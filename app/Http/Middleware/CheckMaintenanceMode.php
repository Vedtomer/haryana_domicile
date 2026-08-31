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
        // Admins always bypass — no DB query needed for them
        $user = $request->user();
        if ($user && ($user->isAdmin() || $user->hasRole('super_admin'))) {
            return $next($request);
        }

        // Check maintenance mode safely
        try {
            $isOn = Setting::get('maintenance_mode', '0') === '1';
        } catch (\Throwable $e) {
            return $next($request); // If DB error, don't block
        }

        if (!$isOn) {
            return $next($request);
        }

        $message = Setting::get('maintenance_message', 'Site par kaam chal raha hai. Thodi der mein wapas aayein.');

        // Inertia XHR request → redirect so Inertia handles it cleanly
        if ($request->header('X-Inertia')) {
            return redirect('/maintenance-page');
        }

        return response()->view('maintenance', ['message' => $message], 503);
    }
}
