<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Schema::defaultStringLength(191);

        \Illuminate\Support\Facades\Gate::before(function ($user, $ability) {
            if ($ability === 'page_CustomDashboard' && $user->type === 'user') {
                return true;
            }
        });

        // Auto-create Public role if it doesn't exist
        try {
            if (class_exists(\Spatie\Permission\Models\Role::class)) {
                \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Public', 'guard_name' => 'web']);
            }
        } catch (\Exception $e) {
            // Silently fail if DB is not ready
        }

        // Ensure Vehicle PUC is instant without OTP
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('services')) {
                \Illuminate\Support\Facades\Cache::remember('sync_puc_service_v2', 86400, function () {
                    \App\Models\Service::where('slug', 'vehicle-puc-without-otp')->update([
                        'name' => 'Vehicle PUC Certificate Download',
                        'description' => 'Download Vehicle Pollution Under Control (PUC) certificate details instantly by Car / Vehicle Number without OTP.',
                        'icon' => '🚗',
                        'is_active' => true,
                        'visibility' => \App\Models\Service::VISIBILITY_PUBLIC,
                    ]);
                    \App\Models\Service::where('slug', 'vehicle-puc-with-otp')->update([
                        'name' => 'Vehicle PUC Certificate Download',
                        'description' => 'Download Vehicle Pollution Under Control (PUC) certificate details instantly by Car / Vehicle Number without OTP.',
                        'icon' => '🚗',
                        'is_active' => false,
                    ]);
                    return true;
                });
            }
        } catch (\Throwable $e) {
            // Silently fail if DB is not ready
        }
    }
}
