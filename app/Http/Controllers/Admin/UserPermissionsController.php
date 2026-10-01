<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserPermissionsController extends Controller
{
    public function index()
    {
        if (!auth()->user()->isAdmin()) {
            abort(403, 'Unauthorized. Admin access required.');
        }

        // Get all regular users with their assigned services (in a single bulk query)
        $users = User::where(function ($q) {
                $q->where('type', 'user')->orWhereNull('type');
            })
            ->whereNotIn('type', ['admin', 'super_admin'])
            ->with('services:id')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone'])
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'service_ids' => $user->services->pluck('id')->map(fn ($id) => (int) $id)->values()->all(),
                ];
            });

        // Get all services with active status
        $services = Service::ordered()
            ->get(['id', 'name', 'icon', 'slug', 'description', 'coin_cost', 'logo', 'is_active'])
            ->map(function ($service) {
                return [
                    'id' => (int) $service->id,
                    'name' => $service->name,
                    'icon' => $service->icon,
                    'slug' => $service->slug,
                    'description' => $service->description,
                    'coin_cost' => $service->coin_cost,
                    'logo_url' => $service->logoUrl(),
                    'is_active' => (bool) $service->is_active,
                ];
            });

        return Inertia::render('Admin/UserPermissions/Index', [
            'users' => $users,
            'services' => $services,
        ]);
    }

    public function update(Request $request, User $user)
    {
        if (!auth()->user()->isAdmin()) {
            abort(403, 'Unauthorized. Admin access required.');
        }

        $data = $request->validate([
            'service_ids' => 'present|array',
            'service_ids.*' => 'integer|exists:services,id',
        ]);

        $user->services()->sync($data['service_ids']);

        try {
            \Illuminate\Support\Facades\Cache::flush();
            \Illuminate\Support\Facades\Artisan::call('cache:clear');
            if (function_exists('opcache_reset')) {
                @opcache_reset();
            }
        } catch (\Throwable $e) {}

        return back()->with('success', "Permissions updated successfully for {$user->name}.");
    }
}
