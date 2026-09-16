<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $logo = 'service-logos/Yh61ZFPQAAE2Rfl7Jy4V0Lp3qzOTlu44eKCJUYuq.jpg';

        // 1. Ensure DHBVN Electricity Bill exists and is cleanly configured
        $dhbvn = DB::table('services')->where('slug', 'dhbvn-electricity-bill')->first();
        if ($dhbvn) {
            DB::table('services')->where('id', $dhbvn->id)->update([
                'name' => 'DHBVN Electricity Bill',
                'slug' => 'dhbvn-electricity-bill',
                'description' => 'Dakshin Haryana Bijli Vitran Nigam (DHBVN) duplicate electricity bill instant PDF download.',
                'icon' => '⚡',
                'logo' => $logo,
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
            DB::table('services')->insert([
                'name' => 'DHBVN Electricity Bill',
                'slug' => 'dhbvn-electricity-bill',
                'description' => 'Dakshin Haryana Bijli Vitran Nigam (DHBVN) duplicate electricity bill instant PDF download.',
                'icon' => '⚡',
                'logo' => $logo,
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

        // 2. Ensure UHBVN Electricity Bill exists and is cleanly configured
        $uhbvn = DB::table('services')->where('slug', 'uhbvn-electricity-bill')->first();
        if ($uhbvn) {
            DB::table('services')->where('id', $uhbvn->id)->update([
                'name' => 'UHBVN Electricity Bill',
                'slug' => 'uhbvn-electricity-bill',
                'description' => 'Uttar Haryana Bijli Vitran Nigam (UHBVN) duplicate electricity bill instant PDF download.',
                'icon' => '⚡',
                'logo' => $logo,
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
            DB::table('services')->insert([
                'name' => 'UHBVN Electricity Bill',
                'slug' => 'uhbvn-electricity-bill',
                'description' => 'Uttar Haryana Bijli Vitran Nigam (UHBVN) duplicate electricity bill instant PDF download.',
                'icon' => '⚡',
                'logo' => $logo,
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

        // 3. Deactivate legacy electricity-bill slug if present to avoid confusion
        DB::table('services')->where('slug', 'electricity-bill')->update([
            'is_active' => false,
            'deleted_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. Assign both services to ALL users in service_user table
        $serviceIds = DB::table('services')
            ->whereIn('slug', ['dhbvn-electricity-bill', 'uhbvn-electricity-bill'])
            ->pluck('id')
            ->toArray();

        $allUserIds = DB::table('users')->pluck('id')->toArray();

        foreach ($allUserIds as $uId) {
            foreach ($serviceIds as $sId) {
                DB::table('service_user')->updateOrInsert(
                    ['service_id' => $sId, 'user_id' => $uId],
                    ['created_at' => now(), 'updated_at' => now()]
                );
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
