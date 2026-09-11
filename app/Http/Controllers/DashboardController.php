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
            $isNew = ($service->created_at && $service->created_at->gt(now()->subDays(30)))
                || in_array($service->slug, ['qr-to-print', 'make-driving-licence-card', 'passport-maker']);

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
                'is_new' => (bool) $isNew,
            ];
        });

        return Inertia::render('Admin/Dashboard', [
            'services' => $services,
            'isAdmin' => $isAdmin,
            'stats' => $isAdmin ? $this->adminStats() : $this->userStats($user),
            'referralCode' => $user->getActiveReferralCode(),
            'referralLink' => $user->referral_link,
        ]);
    }

    /**
     * Records created through this service — everyone's for an admin,
     * only their own for a regular user.
     */
    private function countFor(Service $service, User $user, bool $isAdmin): int
    {
        if ($service->module_key === 'qr_to_print') {
            if ($isAdmin) {
                return \App\Models\PrintJob::count();
            }
            $shop = \App\Models\PrintShop::where('user_id', $user->id)->first();
            return $shop ? \App\Models\PrintJob::where('print_shop_id', $shop->id)->count() : 0;
        }

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
        $totalServices = Service::active()->visibleTo($user)->count();

        $licenseLabel = $user->hasActiveLicense() 
            ? ($user->licenseDaysLeft() . ' Days Left') 
            : 'Inactive (50 Coins)';

        return [
            ['label' => 'Total Services', 'value' => $totalServices, 'tone' => 'dark-blue', 'url' => '#services', 'icon' => 'home_repair_service'],
            ['label' => 'My Coin Balance', 'value' => $user->coins, 'tone' => 'dark-amber', 'url' => '/admin/coin-requests', 'icon' => 'monetization_on'],
            ['label' => '6M Portal License', 'value' => $licenseLabel, 'tone' => $user->hasActiveLicense() ? 'dark-green' : 'dark-amber', 'url' => '#license', 'icon' => 'vpn_key'],
            ['label' => 'Pending', 'value' => (clone $requests)->where('status', ServiceRequest::STATUS_PENDING)->count(), 'tone' => 'dark-purple', 'url' => '/admin/service-requests?status=pending', 'icon' => 'pending_actions'],
            ['label' => 'Completed', 'value' => (clone $requests)->whereIn('status', ['completed', 'accepted'])->count(), 'tone' => 'dark-green', 'url' => '/admin/service-requests?status=completed', 'icon' => 'check_circle'],
        ];
    }

    private function adminStats(): array
    {
        $activeKeys = \App\Models\LicenseKey::where('status', \App\Models\LicenseKey::STATUS_ACTIVE)->count();
        $totalKeys = \App\Models\LicenseKey::count();

        return [
            ['label' => 'Manage Users', 'value' => User::where('type', 'user')->count(), 'tone' => 'dark-blue', 'url' => '/admin/users', 'icon' => 'group'],
            ['label' => 'Manage License Keys', 'value' => "{$activeKeys} Active", 'tone' => 'dark-indigo', 'url' => '/admin/license-keys', 'icon' => 'vpn_key'],
            ['label' => 'Manage Services', 'value' => Service::count(), 'tone' => 'dark-blue', 'url' => '/admin/services', 'icon' => 'home_repair_service'],
            ['label' => 'User Permissions', 'value' => 'Assign Services', 'tone' => 'dark-purple', 'url' => '/admin/user-permissions', 'icon' => 'admin_panel_settings'],
            ['label' => 'Pending Requests', 'value' => ServiceRequest::where('status', 'pending')->count(), 'tone' => 'dark-purple', 'url' => '/admin/service-requests?status=pending', 'icon' => 'hourglass_top'],
            ['label' => 'Service Requests', 'value' => ServiceRequest::count(), 'tone' => 'dark-purple', 'url' => '/admin/service-requests', 'icon' => 'assignment'],
            ['label' => 'Reactivation Requests', 'value' => \App\Models\ReactivationRequest::where('status', 'pending')->count() . ' Pending', 'tone' => 'dark-amber', 'url' => '/admin/reactivation-requests', 'icon' => 'how_to_reg'],
            ['label' => 'Coin Requests', 'value' => \App\Models\CoinPurchaseRequest::where('status', 'pending')->count() . ' Pending', 'tone' => 'dark-amber', 'url' => '/admin/coin-requests', 'icon' => 'monetization_on'],
        ];
    }

}
