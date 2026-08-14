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
            ->when(!$isAdmin, fn ($q) => $q->visibleTo($user))
            ->ordered()
            ->get()
            ->map(function (Service $service) use ($user, $isAdmin) {
            return [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'icon' => $service->icon ?: '📄',
                'coin_cost' => $service->coin_cost,
                'is_free' => $service->isFree(),
                'kind' => $service->kind,
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
            ['label' => 'My Coin Balance', 'value' => $user->coins, 'tone' => 'amber', 'url' => '/admin/coin-requests'],
            ['label' => 'My Requests', 'value' => (clone $requests)->count(), 'tone' => 'blue', 'url' => '/admin/service-requests'],
            ['label' => 'Pending', 'value' => (clone $requests)->whereIn('status', ['pending', 'accepted', 'in_progress'])->count(), 'tone' => 'purple', 'url' => '/admin/service-requests?status=pending'],
            ['label' => 'Completed', 'value' => (clone $requests)->where('status', 'completed')->count(), 'tone' => 'green', 'url' => '/admin/service-requests?status=completed'],
        ];
    }

    private function adminStats(): array
    {
        return [
            ['label' => 'Total Users', 'value' => User::where('type', 'user')->count(), 'tone' => 'blue', 'url' => '/admin/users'],
            ['label' => 'Pending Requests', 'value' => ServiceRequest::where('status', 'pending')->count(), 'tone' => 'purple', 'url' => '/admin/service-requests?status=pending'],
            ['label' => 'Pending Coin Requests', 'value' => CoinPurchaseRequest::pending()->count(), 'tone' => 'amber', 'url' => '/admin/coin-requests'],
            ['label' => 'Active Services', 'value' => Service::active()->count(), 'tone' => 'green', 'url' => '/admin/services'],
        ];
    }
}
