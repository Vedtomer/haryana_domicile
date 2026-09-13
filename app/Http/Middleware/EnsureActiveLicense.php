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
            $errorMessage = 'Portal License Required: Services use karne ke liye 6-Month License (50 Coins) active hona zaroori hai. Kripya apna license activate karein.';

            if ($request->header('X-Inertia')) {
                return redirect()->route('dashboard')->with('error', $errorMessage);
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Active 6-Month Portal License (50 Coins) is required to access this service.',
                    'requires_license' => true,
                ], 403);
            }

            return redirect()->route('dashboard')->with('error', $errorMessage);
        }

        // 2. Hardware / Desktop PC Lock Check
        $allowedDevices = (int) ($user->allowed_devices ?? 1); // 0 = no lock, 1 = 1 PC, 2 = 2 PC

        // If Admin has disabled PC lock for this user (0 = Unlimited / No Lock):
        if ($allowedDevices === 0) {
            return $next($request);
        }

        $deviceToken = $request->cookie('csp_device_token')
            ?: $request->header('X-Device-Token')
            ?: $request->input('device_token');

        // Check if device matches PC 1 or PC 2
        $isMatch1 = !empty($user->license_device_id) && ($deviceToken === $user->license_device_id);
        $isMatch2 = ($allowedDevices >= 2) && !empty($user->license_device_id_2) && ($deviceToken === $user->license_device_id_2);

        $isLinuxDevBinding1 = str_contains($user->license_device_name ?? '', 'Linux Desktop');
        $isLinuxDevBinding2 = str_contains($user->license_device_name_2 ?? '', 'Linux Desktop');

        if ($isMatch1 || $isMatch2) {
            return $next($request);
        }

        // Helper to detect current browser and OS
        $getDeviceName = function () use ($request) {
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

            return "{$browser} on {$os}";
        };

        // Bind to available slot if deviceToken is present
        if ($deviceToken) {
            $deviceName = $getDeviceName();

            // Slot 1 is available:
            if (empty($user->license_device_id) || $isLinuxDevBinding1) {
                $user->update([
                    'license_device_id'       => $deviceToken,
                    'license_device_name'     => $deviceName,
                    'license_device_ip'       => $request->ip(),
                    'license_device_bound_at' => now(),
                ]);

                LicenseKey::where('activated_by', $user->id)
                    ->where('status', LicenseKey::STATUS_ACTIVE)
                    ->latest('activated_at')
                    ->first()?->update([
                        'device_id'   => $deviceToken,
                        'device_name' => $deviceName,
                        'device_ip'   => $request->ip(),
                        'bound_at'    => now(),
                    ]);

                return $next($request);
            }

            // Slot 2 is available (when allowed_devices >= 2):
            if ($allowedDevices >= 2 && (empty($user->license_device_id_2) || $isLinuxDevBinding2)) {
                $user->update([
                    'license_device_id_2'       => $deviceToken,
                    'license_device_name_2'     => $deviceName,
                    'license_device_ip_2'       => $request->ip(),
                    'license_device_bound_at_2' => now(),
                ]);

                return $next($request);
            }
        }

        // All allowed PC slots are occupied and device token did not match
        if ($allowedDevices === 1) {
            $boundDevice = $user->license_device_name ?: 'Registered Desktop PC';
            $errorMessage = "🔒 Desktop Lock Alert: Aapka 6-Month Portal License dusre Desktop/PC ({$boundDevice}) par locked hai. Ek license sirf 1 PC par use ho sakta hai. Agar aapne PC change kiya hai ya 2 PC access chahiye, toh Admin se sampark karein.";
        } else {
            $p1 = $user->license_device_name ?: 'PC 1';
            $p2 = $user->license_device_name_2 ?: 'PC 2';
            $boundDevice = "{$p1} & {$p2}";
            $errorMessage = "🔒 Desktop Lock Alert: Aapka account 2 Desktop PCs par pehle se registered hai (1: {$p1}, 2: {$p2}). Aap sirf inhi 2 PCs par use kar sakte hain. PC change karne ke liye Admin se Desktop Reset karwayein.";
        }

        if ($request->header('X-Inertia')) {
            return redirect()->route('dashboard')->with('error', $errorMessage);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message'       => $errorMessage,
                'device_locked' => true,
                'bound_device'  => $boundDevice,
            ], 403);
        }

        return redirect()->route('dashboard')->with('error', $errorMessage);

        return $next($request);
    }
}
