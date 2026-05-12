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
    }
}
