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
        // Get all regular users
        $users = User::where('type', 'user')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone'])
            ->map(function ($user) {
                // Load their assigned service IDs
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'service_ids' => $user->services()->pluck('services.id'),
                ];
            });

        // Get all active services
        $services = Service::ordered()
            ->get(['id', 'name', 'icon', 'slug', 'description', 'coin_cost', 'logo_path'])
            ->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'icon' => $service->icon,
                    'slug' => $service->slug,
                    'description' => $service->description,
                    'coin_cost' => $service->coin_cost,
                    'logo_url' => $service->logoUrl(),
                ];
            });

        return Inertia::render('Admin/UserPermissions/Index', [
            'users' => $users,
            'services' => $services,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'service_ids' => 'present|array',
            'service_ids.*' => 'exists:services,id',
        ]);

        $user->services()->sync($data['service_ids']);

        return back()->with('success', "Permissions updated for {$user->name}.");
    }
}
