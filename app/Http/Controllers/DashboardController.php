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

        // Admin staff see all services in the catalog.
        // Regular users see ONLY services that are BOTH globally active AND explicitly assigned to them.
        $rawServices = Service::query()
            ->with('users')
            ->when(!$isAdmin, fn ($q) => $q->where('is_active', true))
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
            \App\Models\BobAffidavit::class,
            \App\Models\AadharUpdate::class,
            \App\Models\MobileRecharge::class,
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
                || in_array($service->slug, ['mobile-recharge', 'qr-to-print', 'make-driving-licence-card', 'passport-maker', 'passport-apply', 'kundli-generator', 'mobile-to-info', 'bob-affidavit']);

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
                'module_key' => $service->module_key,
                'description' => $service->description,
                'icon' => $service->icon ?: '📄',
                'logo_url' => $service->logoUrl(),
                'coin_cost' => $service->coin_cost,
                'is_free' => $service->isFree(),
                'kind' => $service->kind,
                'is_premium' => $service->is_premium,
                'unlock_cost' => $service->unlock_cost,
                'is_unlocked' => $isAdmin || $service->users->contains('id', $user->id),
                'is_active' => (bool) $service->is_active,
                'can_access' => true,
                'url' => $service->targetUrl(),
                'count' => $count,
                'is_new' => (bool) $isNew,
            ];
        });

        $servicesCount = $rawServices->count();

        $todayDebit = 0;
        try {
            $todayDebit = abs((float) \App\Models\CoinTransaction::where('user_id', $user->id)
                ->whereDate('created_at', today())
                ->where('amount', '<', 0)
                ->sum('amount'));
        } catch (\Throwable $e) {
            $todayDebit = 0;
        }

        $totalUsers = 0;
        try {
            $totalUsers = User::count();
        } catch (\Throwable $e) {
            $totalUsers = 0;
        }

        $pendingCoins = 0;
        try {
            $pendingCoins = \App\Models\CoinPurchaseRequest::where('status', 'pending')->count();
        } catch (\Throwable $e) {
            $pendingCoins = 0;
        }

        $pendingRequests = 0;
        $totalRequests = 0;
        try {
            $pendingRequests = ServiceRequest::where('status', 'pending')->count();
            $totalRequests = ServiceRequest::count();
        } catch (\Throwable $e) {
            $pendingRequests = 0;
            $totalRequests = 0;
        }

        $supportWhatsApp = \App\Models\Setting::get('whatsapp_number', '380630323112');
        $supportTelegram = \App\Models\Setting::get('telegram_handle', '@cspjaankari');

        $noticesCount = 0;
        try {
            $noticesCount = \App\Models\Notice::count();
        } catch (\Throwable $e) {
            $noticesCount = 0;
        }

        $referralsCount = 0;
        try {
            $referralsCount = \App\Models\Referral::count();
        } catch (\Throwable $e) {
            $referralsCount = 0;
        }

        return Inertia::render('Admin/Dashboard', [
            'siteName' => 'CSP Jaankari',
            'siteLogo' => '/images/logo.png',
            'services' => $services,
            'isAdmin' => $isAdmin,
            'stats' => $isAdmin ? $this->adminStats($servicesCount) : $this->userStats($user, $servicesCount),
            'walletBalance' => (int) ($user->coins ?? 0),
            'todayDebit' => $todayDebit,
            'totalUsers' => $totalUsers,
            'pendingCoins' => $pendingCoins,
            'pendingRequests' => $pendingRequests,
            'totalRequests' => $totalRequests,
            'servicesCount' => $servicesCount,
            'noticesCount' => $noticesCount,
            'referralsCount' => $referralsCount,
            'apiBalance' => 487.00,
            'userRole' => $isAdmin ? 'ADMINISTRATOR' : 'RETAILER',
            'supportWhatsApp' => $supportWhatsApp,
            'supportTelegram' => $supportTelegram,
            'referralCode' => $user->getActiveReferralCode(),
            'referralLink' => $user->referral_link,
        ]);
    }

    private function userStats(User $user, int $servicesCount = 0): array
    {
        try {
            $requests = ServiceRequest::visibleTo($user);
            $totalCount = (clone $requests)->count();
            $pendingCount = (clone $requests)->where('status', ServiceRequest::STATUS_PENDING)->count();
            $completedCount = (clone $requests)->whereIn('status', ['completed', 'accepted'])->count();
        } catch (\Throwable $e) {
            $totalCount = 0;
            $pendingCount = 0;
            $completedCount = 0;
        }

        return [
            ['label' => 'Total Services', 'value' => $servicesCount, 'tone' => 'dark-blue', 'url' => '#services', 'icon' => 'home_repair_service'],
            ['label' => 'My Coin Balance', 'value' => $user->coins, 'tone' => 'dark-amber', 'url' => '/admin/coin-requests', 'icon' => 'monetization_on'],
            ['label' => 'History & My Requests', 'value' => $totalCount, 'tone' => 'dark-indigo', 'url' => '/admin/service-requests', 'icon' => 'history'],
            ['label' => 'Pending', 'value' => $pendingCount, 'tone' => 'dark-purple', 'url' => '/admin/service-requests?status=pending', 'icon' => 'pending_actions'],
            ['label' => 'Completed', 'value' => $completedCount, 'tone' => 'dark-green', 'url' => '/admin/service-requests?status=completed', 'icon' => 'check_circle'],
        ];
    }

    private function adminStats(int $servicesCount = 0): array
    {
        try {
            $userCount = User::where('type', 'user')->count();
        } catch (\Throwable $e) {
            $userCount = 0;
        }

        try {
            $pendingRequests = ServiceRequest::where('status', 'pending')->count();
            $totalRequests   = ServiceRequest::count();
        } catch (\Throwable $e) {
            $pendingRequests = 0;
            $totalRequests   = 0;
        }

        try {
            $pendingCoins = \App\Models\CoinPurchaseRequest::where('status', 'pending')->count();
        } catch (\Throwable $e) {
            $pendingCoins = 0;
        }

        return [
            ['label' => 'Manage Users',     'value' => $userCount,                'tone' => 'dark-blue',   'url' => '/admin/users',                           'icon' => 'group'],
            ['label' => 'Manage Services',  'value' => $servicesCount,            'tone' => 'dark-blue',   'url' => '/admin/services',                        'icon' => 'home_repair_service'],
            ['label' => 'User Permissions', 'value' => 'Assign Services',         'tone' => 'dark-purple', 'url' => '/admin/user-permissions',                'icon' => 'admin_panel_settings'],
            ['label' => 'Pending Requests', 'value' => $pendingRequests,          'tone' => 'dark-purple', 'url' => '/admin/service-requests?status=pending', 'icon' => 'hourglass_top'],
            ['label' => 'Service Requests', 'value' => $totalRequests,            'tone' => 'dark-purple', 'url' => '/admin/service-requests',                'icon' => 'assignment'],
            ['label' => 'Coin Requests',    'value' => "{$pendingCoins} Pending", 'tone' => 'dark-amber',  'url' => '/admin/coin-requests',                   'icon' => 'monetization_on'],
        ];
    }
}
