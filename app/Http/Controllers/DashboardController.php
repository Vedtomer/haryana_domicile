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

        // Admin users see ONLY their explicitly assigned services (same as regular users)
        $rawServices = Service::query()
            ->with('users')
            ->visibleTo($user)
            ->ordered()
            ->get();

        // Pre-aggregate ServiceRequest counts in 2 bulk queries instead of 50+ sequential queries
        try {
            $reqByServiceId = ServiceRequest::query()
                ->where('user_id', $user->id)
                ->whereNotNull('service_id')
                ->groupBy('service_id')
                ->selectRaw('service_id, count(*) as aggregate')
                ->pluck('aggregate', 'service_id')
                ->all();
        } catch (\Throwable $e) {
            $reqByServiceId = [];
        }

        try {
            $reqByServiceName = ServiceRequest::query()
                ->where('user_id', $user->id)
                ->whereNull('service_id')
                ->whereNotNull('service_name')
                ->groupBy('service_name')
                ->selectRaw('service_name, count(*) as aggregate')
                ->pluck('aggregate', 'service_name')
                ->all();
        } catch (\Throwable $e) {
            $reqByServiceName = [];
        }

        // Pre-calculate QR print count
        $printJobCount = 0;
        try {
            if ($isAdmin) {
                $printJobCount = \App\Models\PrintJob::count();
            } else {
                $shop = \App\Models\PrintShop::where('user_id', $user->id)->first();
                $printJobCount = $shop ? \App\Models\PrintJob::where('print_shop_id', $shop->id)->count() : 0;
            }
        } catch (\Throwable $e) {
            $printJobCount = 0;
        }

        // Pre-calculate built-in module model counts
        $modelCounts = [];
        $moduleModels = [
            \App\Models\MarriageForm::class,
            \App\Models\MarriageAffidavit::class,
            \App\Models\BirthRecord::class,
            \App\Models\HaryanaDomicile::class,
            \App\Models\PanRequest::class,
            \App\Models\ManualPanCard::class,
            \App\Models\AirtelPassbook::class,
        ];
        foreach ($moduleModels as $modelClass) {
            if (class_exists($modelClass)) {
                try {
                    $q = $modelClass::query();
                    $q->where('user_id', $user->id);
                    $modelCounts[$modelClass] = $q->count();
                } catch (\Throwable $e) {
                    $modelCounts[$modelClass] = 0;
                }
            }
        }

        $services = $rawServices->map(function (Service $service) use ($user, $isAdmin, $reqByServiceId, $reqByServiceName, $printJobCount, $modelCounts) {
            $isNew = ($service->created_at && $service->created_at->gt(now()->subDays(30)))
                || in_array($service->slug, ['qr-to-print', 'make-driving-licence-card', 'passport-maker', 'passport-apply', 'kundli-generator']);

            $count = 0;
            if ($service->module_key === 'qr_to_print') {
                $count = $printJobCount;
            } elseif ($service->isModule()) {
                $model = $service->moduleModel();
                if ($model && isset($modelCounts[$model])) {
                    $count = $modelCounts[$model];
                } else {
                    $count = ($reqByServiceId[$service->id] ?? 0) + ($reqByServiceName[$service->name] ?? 0);
                }
            } else {
                $count = ($reqByServiceId[$service->id] ?? 0) + ($reqByServiceName[$service->name] ?? 0);
            }

            return [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'description' => $service->description,
                'icon' => $service->icon ?: '📄',
                'logo_url' => $service->logoUrl(),
                'coin_cost' => $service->coin_cost,
                'is_free' => $service->isFree(),
                'kind' => $service->kind,
                'is_premium' => $service->is_premium,
                'unlock_cost' => $service->unlock_cost,
                'is_unlocked' => $service->users->contains('id', $user->id),
                'is_active' => (bool) $service->is_active,
                'url' => $service->targetUrl(),
                'count' => $count,
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

    private function userStats(User $user): array
    {
        try {
            $requests = ServiceRequest::where('user_id', $user->id);
            $pendingCount = (clone $requests)->where('status', ServiceRequest::STATUS_PENDING)->count();
            $completedCount = (clone $requests)->whereIn('status', ['completed', 'accepted'])->count();
        } catch (\Throwable $e) {
            $pendingCount = 0;
            $completedCount = 0;
        }

        try {
            $totalServices = Service::visibleTo($user)->count();
        } catch (\Throwable $e) {
            $totalServices = 0;
        }

        return [
            ['label' => 'Total Services', 'value' => $totalServices, 'tone' => 'dark-blue', 'url' => '#services', 'icon' => 'home_repair_service'],
            ['label' => 'My Coin Balance', 'value' => $user->coins, 'tone' => 'dark-amber', 'url' => '/admin/coin-requests', 'icon' => 'monetization_on'],
            ['label' => 'History & My Requests', 'value' => $pendingCount + $completedCount, 'tone' => 'dark-indigo', 'url' => '/admin/service-requests', 'icon' => 'history'],
            ['label' => 'Pending', 'value' => $pendingCount, 'tone' => 'dark-purple', 'url' => '/admin/service-requests?status=pending', 'icon' => 'pending_actions'],
            ['label' => 'Completed', 'value' => $completedCount, 'tone' => 'dark-green', 'url' => '/admin/service-requests?status=completed', 'icon' => 'check_circle'],
        ];
    }

    private function adminStats(): array
    {
        try {
            $activeKeys = \App\Models\LicenseKey::where('status', \App\Models\LicenseKey::STATUS_ACTIVE)->count();
        } catch (\Throwable $e) {
            $activeKeys = 0;
        }

        try {
            $userCount = User::where('type', 'user')->count();
        } catch (\Throwable $e) {
            $userCount = 0;
        }

        try {
            $serviceCount = Service::count();
        } catch (\Throwable $e) {
            $serviceCount = 0;
        }

        try {
            $pendingRequests = ServiceRequest::where('status', 'pending')->count();
            $totalRequests = ServiceRequest::count();
        } catch (\Throwable $e) {
            $pendingRequests = 0;
            $totalRequests = 0;
        }

        try {
            $pendingReactivations = \App\Models\ReactivationRequest::where('status', 'pending')->count();
        } catch (\Throwable $e) {
            $pendingReactivations = 0;
        }

        try {
            $pendingCoins = \App\Models\CoinPurchaseRequest::where('status', 'pending')->count();
        } catch (\Throwable $e) {
            $pendingCoins = 0;
        }

        return [
            ['label' => 'Manage Users', 'value' => $userCount, 'tone' => 'dark-blue', 'url' => '/admin/users', 'icon' => 'group'],
            ['label' => 'API Settings', 'value' => 'Configure Keys', 'tone' => 'dark-green', 'url' => '/admin/api-settings', 'icon' => 'key'],
            ['label' => 'Manage License Keys', 'value' => "{$activeKeys} Active", 'tone' => 'dark-indigo', 'url' => '/admin/license-keys', 'icon' => 'vpn_key'],
            ['label' => 'Manage Services', 'value' => $serviceCount, 'tone' => 'dark-blue', 'url' => '/admin/services', 'icon' => 'home_repair_service'],
            ['label' => 'User Permissions', 'value' => 'Assign Services', 'tone' => 'dark-purple', 'url' => '/admin/user-permissions', 'icon' => 'admin_panel_settings'],
            ['label' => 'Pending Requests', 'value' => $pendingRequests, 'tone' => 'dark-purple', 'url' => '/admin/service-requests?status=pending', 'icon' => 'hourglass_top'],
            ['label' => 'Service Requests', 'value' => $totalRequests, 'tone' => 'dark-purple', 'url' => '/admin/service-requests', 'icon' => 'assignment'],
            ['label' => 'Reactivation Requests', 'value' => "{$pendingReactivations} Pending", 'tone' => 'dark-amber', 'url' => '/admin/reactivation-requests', 'icon' => 'how_to_reg'],
            ['label' => 'Coin Requests', 'value' => "{$pendingCoins} Pending", 'tone' => 'dark-amber', 'url' => '/admin/coin-requests', 'icon' => 'monetization_on'],
        ];
    }
}
