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

        // If no user, reject
        if (!$user) {
            return $next($request);
        }

        // super_admin bypasses for system management
        if ($user->hasRole('super_admin') && !$user->isAdmin()) {
            return $next($request);
        }

        return $this->allowWithPermissionCheck($request, $next, $user);
    }

    /**
     * Verify that the user has permission to access the requested service.
     */
    protected function allowWithPermissionCheck(Request $request, Closure $next, $user): Response
    {
        $path = '/' . ltrim($request->path(), '/');
        $targetService = null;

        if (str_starts_with($path, '/admin/service-requests/create') && $request->query('service')) {
            $targetService = \App\Models\Service::where('slug', $request->query('service'))->first();
        }

        if (!$targetService) {
            foreach (\App\Models\Service::MODULES as $moduleKey => $cfg) {
                $indexPath = parse_url($cfg['index'], PHP_URL_PATH);
                $createPath = parse_url($cfg['create'], PHP_URL_PATH);
                if ($path === $indexPath || $path === $createPath || str_starts_with($path, $indexPath . '/') || str_starts_with($path, $createPath . '/')) {
                    $targetService = \App\Models\Service::where('module_key', $moduleKey)->first();
                    break;
                }
            }
        }

        if (!$targetService && str_starts_with($path, '/utilities/')) {
            $segment = explode('/', trim($path, '/'))[1] ?? null;
            if ($segment) {
                if ($segment === 'birth-certificate') {
                    $targetService = \App\Models\Service::where('slug', 'birth-certificate-download')
                        ->orWhere('module_key', 'birth_certificate_download')
                        ->orWhere('slug', 'birth-certificate')
                        ->first();
                } else {
                    $targetService = \App\Models\Service::where('slug', $segment)->first();
                }
            }
        }

        if ($targetService) {
            $isStaff = $user->isAdmin() || $user->hasRole('admin') || $user->hasRole('super_admin') || in_array($user->type, ['admin', 'super_admin']);
            $hasAccess = $isStaff || $targetService->users()->where('user_id', $user->id)->exists();
            if (!$hasAccess) {
                $errorMsg = "🔒 Service Permission Required: Aapke account par '{$targetService->name}' service activate nahi hai. Kripya Admin se permission activate karwayein.";

                if ($request->header('X-Inertia')) {
                    return redirect()->route('dashboard')->with('error', $errorMsg);
                }

                if ($request->expectsJson()) {
                    return response()->json([
                        'message'             => $errorMsg,
                        'requires_permission' => true,
                    ], 403);
                }

                return redirect()->route('dashboard')->with('error', $errorMsg);
            }
        }

        return $next($request);
    }
}
