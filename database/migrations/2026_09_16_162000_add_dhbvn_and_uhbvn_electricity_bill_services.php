<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Service;
use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Handle UHBVN Electricity Bill
        $oldElectricService = DB::table('services')->where('slug', 'electricity-bill')->first();
        $uhbvnService = DB::table('services')->where('slug', 'uhbvn-electricity-bill')->first();

        $uhbvnId = null;
        if ($uhbvnService) {
            $uhbvnId = $uhbvnService->id;
            DB::table('services')->where('id', $uhbvnId)->update([
                'name' => 'UHBVN Electricity Bill',
                'slug' => 'uhbvn-electricity-bill',
                'description' => 'View and instantly download Uttar Haryana (UHBVN) electricity bill PDF.',
                'icon' => '⚡',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'uhbvn_electricity_bill',
                'is_active' => true,
                'visibility' => 'private',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 6,
                'deleted_at' => null,
                'updated_at' => now(),
            ]);
        } elseif ($oldElectricService) {
            $uhbvnId = $oldElectricService->id;
            DB::table('services')->where('id', $uhbvnId)->update([
                'name' => 'UHBVN Electricity Bill',
                'slug' => 'uhbvn-electricity-bill',
                'description' => 'View and instantly download Uttar Haryana (UHBVN) electricity bill PDF.',
                'icon' => '⚡',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'uhbvn_electricity_bill',
                'is_active' => true,
                'visibility' => 'private',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 6,
                'deleted_at' => null,
                'updated_at' => now(),
            ]);
        } else {
            $uhbvnId = DB::table('services')->insertGetId([
                'name' => 'UHBVN Electricity Bill',
                'slug' => 'uhbvn-electricity-bill',
                'description' => 'View and instantly download Uttar Haryana (UHBVN) electricity bill PDF.',
                'icon' => '⚡',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'uhbvn_electricity_bill',
                'is_active' => true,
                'visibility' => 'private',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Handle DHBVN Electricity Bill
        $dhbvnService = DB::table('services')->where('slug', 'dhbvn-electricity-bill')->first();
        $dhbvnId = null;
        if ($dhbvnService) {
            $dhbvnId = $dhbvnService->id;
            DB::table('services')->where('id', $dhbvnId)->update([
                'name' => 'DHBVN Electricity Bill',
                'slug' => 'dhbvn-electricity-bill',
                'description' => 'View and instantly download Dakshin Haryana (DHBVN) electricity bill PDF.',
                'icon' => '⚡',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'dhbvn_electricity_bill',
                'is_active' => true,
                'visibility' => 'private',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 5,
                'deleted_at' => null,
                'updated_at' => now(),
            ]);
        } else {
            $dhbvnId = DB::table('services')->insertGetId([
                'name' => 'DHBVN Electricity Bill',
                'slug' => 'dhbvn-electricity-bill',
                'description' => 'View and instantly download Dakshin Haryana (DHBVN) electricity bill PDF.',
                'icon' => '⚡',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'dhbvn_electricity_bill',
                'is_active' => true,
                'visibility' => 'private',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Sync permissions for users
        $newServiceIds = array_filter([$uhbvnId, $dhbvnId]);

        if (!empty($newServiceIds)) {
            // Find all users who had the old service or have any services assigned
            $userIdsToGrant = DB::table('service_user')
                ->whereIn('service_id', array_filter([$uhbvnId, $oldElectricService?->id]))
                ->pluck('user_id')
                ->unique()
                ->toArray();

            // Also include all admin and super_admin users
            $adminUserIds = User::whereIn('type', ['admin', 'super_admin'])->pluck('id')->toArray();
            $allTargetUserIds = array_unique(array_merge($userIdsToGrant, $adminUserIds));

            foreach ($allTargetUserIds as $userId) {
                foreach ($newServiceIds as $svcId) {
                    DB::table('service_user')->updateOrInsert(
                        ['service_id' => $svcId, 'user_id' => $userId],
                        ['created_at' => now(), 'updated_at' => now()]
                    );
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
