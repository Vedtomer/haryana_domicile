<?php

namespace App\Http\Controllers;

use App\Models\CoinPurchaseRequest;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isAdmin = $this->isStaff();

        $services = Service::active()
            ->with('users')
            ->when(!$isAdmin, fn ($q) => $q->visibleTo($user))
            ->ordered()
            ->get()
            ->map(function (Service $service) use ($user, $isAdmin) {
            return [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'icon' => $service->icon ?: '📄',
                'logo_url' => $service->logoUrl(),
                'coin_cost' => $service->coin_cost,
                'is_free' => $service->isFree(),
                'kind' => $service->kind,
                'is_premium' => $service->is_premium,
                'unlock_cost' => $service->unlock_cost,
                'is_unlocked' => $isAdmin || $service->users->contains('id', $user->id),
                'url' => $service->targetUrl(),
                'count' => $this->countFor($service, $user, $isAdmin),
            ];
        });

        return Inertia::render('Admin/Dashboard', [
            'services' => $services,
            'isAdmin' => $isAdmin,
            'stats' => $isAdmin ? $this->adminStats() : $this->userStats($user),
        ]);
    }

    /**
     * Records created through this service — everyone's for an admin,
     * only their own for a regular user.
     */
    private function countFor(Service $service, User $user, bool $isAdmin): int
    {
        if ($service->isModule()) {
            $model = $service->moduleModel();
            if (!$model) {
                return 0;
            }
            $query = $model::query();
        } else {
            $query = ServiceRequest::where('service_id', $service->id);
        }

        if (!$isAdmin) {
            $query->where('user_id', $user->id);
        }

        return $query->count();
    }

    private function userStats(User $user): array
    {
        $requests = ServiceRequest::where('user_id', $user->id);

        return [
            ['label' => 'My Coin Balance', 'value' => $user->coins, 'tone' => 'dark-amber', 'url' => '/admin/coin-requests'],
            ['label' => 'History & My Requests', 'value' => (clone $requests)->count(), 'tone' => 'dark-blue', 'url' => '/admin/service-requests'],
            ['label' => 'Pending', 'value' => (clone $requests)->where('status', ServiceRequest::STATUS_PENDING)->count(), 'tone' => 'dark-purple', 'url' => '/admin/service-requests?status=pending'],
            ['label' => 'Completed', 'value' => (clone $requests)->whereIn('status', ['completed', 'accepted'])->count(), 'tone' => 'dark-green', 'url' => '/admin/service-requests?status=completed'],
        ];
    }

    private function adminStats(): array
    {
        return [
            ['label' => 'Manage Users', 'value' => User::where('type', 'user')->count(), 'tone' => 'dark-blue', 'url' => '/admin/users'],
            ['label' => 'User Permissions', 'value' => 'Assign Services', 'tone' => 'dark-amber', 'url' => '/admin/user-permissions'],
            ['label' => 'Pending Requests', 'value' => ServiceRequest::where('status', 'pending')->count(), 'tone' => 'dark-purple', 'url' => '/admin/service-requests?status=pending'],
            ['label' => 'Add Service', 'value' => 'New Service', 'tone' => 'dark-green', 'url' => '/admin/services/create'],
            ['label' => 'Pending Coin Requests', 'value' => CoinPurchaseRequest::pending()->count(), 'tone' => 'dark-purple', 'url' => '/admin/coin-requests'],
            ['label' => 'Manage Service', 'value' => Service::count(), 'tone' => 'dark-green', 'url' => '/admin/services'],
            ['label' => 'Service Requests', 'value' => ServiceRequest::count(), 'tone' => 'dark-purple', 'url' => '/admin/service-requests'],
            ['label' => 'Coin Requests', 'value' => CoinPurchaseRequest::count(), 'tone' => 'dark-purple', 'url' => '/admin/coin-requests'],
            ['label' => 'Reactivation Requests', 'value' => \App\Models\ReactivationRequest::where('status', 'pending')->count() . ' Pending', 'tone' => 'dark-amber', 'url' => '/admin/reactivation-requests'],
        ];
    }
}
