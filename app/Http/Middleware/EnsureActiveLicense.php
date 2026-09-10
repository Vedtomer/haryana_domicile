<?php

namespace App\Http\Middleware;

use App\Models\LicenseKey;
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

        // 1. Check if user has active license
        if (!$user->hasActiveLicense()) {
            if ($request->expectsJson() || $request->isXmlHttpRequest()) {
                return response()->json([
                    'message' => 'Active 6-Month Portal License (50 Coins) is required to access this service.',
                    'requires_license' => true,
                ], 403);
            }

            return redirect()->route('dashboard')->with('error', 'Portal License Required: Services use karne ke liye 6-Month License (50 Coins) active hona zaroori hai. Kripya apna license activate karein.');
        }

        // 2. Hardware / Single Desktop PC Lock Check
        $deviceToken = $request->cookie('csp_device_token')
            ?: $request->header('X-Device-Token')
            ?: $request->input('device_token');

        // If user has active license but desktop is not bound yet (auto-bind first PC):
        if (empty($user->license_device_id)) {
            if ($deviceToken) {
                $ua = (string) $request->userAgent();
                $os = 'Desktop PC';
                if (str_contains($ua, 'Windows')) $os = 'Windows Desktop';
                elseif (str_contains($ua, 'Macintosh') || str_contains($ua, 'Mac')) $os = 'Mac Desktop';
                elseif (str_contains($ua, 'Linux')) $os = 'Linux Desktop';

                $browser = 'Browser';
                if (str_contains($ua, 'Edg')) $browser = 'Edge';
                elseif (str_contains($ua, 'Chrome')) $browser = 'Chrome';
                elseif (str_contains($ua, 'Firefox')) $browser = 'Firefox';
                elseif (str_contains($ua, 'Safari')) $browser = 'Safari';

                $deviceName = "{$browser} on {$os}";

                $user->update([
                    'license_device_id'       => $deviceToken,
                    'license_device_name'     => $deviceName,
                    'license_device_ip'       => $request->ip(),
                    'license_device_bound_at' => now(),
                ]);

                LicenseKey::where('activated_by', $user->id)
                    ->where('status', LicenseKey::STATUS_ACTIVE)
                    ->whereNull('device_id')
                    ->latest('activated_at')
                    ->first()?->update([
                        'device_id'   => $deviceToken,
                        'device_name' => $deviceName,
                        'device_ip'   => $request->ip(),
                        'bound_at'    => now(),
                    ]);
            }
        } else {
            // Desktop is already bound: verify it matches
            if (!$deviceToken || $deviceToken !== $user->license_device_id) {
                $boundDevice = $user->license_device_name ?: 'Registered Desktop PC';
                $errorMessage = "🔒 Desktop Lock Alert: Aapka 6-Month Portal License dusre Desktop/PC ({$boundDevice}) par locked hai. Ek license sirf ek hi desktop par use ho sakta hai. Agar aapne PC change kiya hai, toh Admin se Desktop Reset karwayein.";

                if ($request->expectsJson() || $request->isXmlHttpRequest()) {
                    return response()->json([
                        'message'       => $errorMessage,
                        'device_locked' => true,
                        'bound_device'  => $boundDevice,
                    ], 403);
                }

                return redirect()->route('dashboard')->with('error', $errorMessage);
            }
        }

        return $next($request);
    }
}
