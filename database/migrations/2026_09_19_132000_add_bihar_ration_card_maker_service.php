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
        $service = DB::table('services')
            ->where('slug', 'bihar-ration-card-maker')
            ->orWhere('module_key', 'bihar_ration_card_maker')
            ->first();

        $serviceId = null;

        if ($service) {
            $serviceId = $service->id;
            DB::table('services')->where('id', $serviceId)->update([
                'name' => 'Bihar Ration Card Maker',
                'slug' => 'bihar-ration-card-maker',
                'description' => 'Bihar Smart PDS Ration Card Maker & Portal Access (RCMS Bihar) - Apply, Search, Download & Print Ration Card.',
                'icon' => 'local_mall',
                'coin_cost' => 99,
                'kind' => 'module',
                'module_key' => 'bihar_ration_card_maker',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 16,
                'deleted_at' => null,
                'updated_at' => now(),
            ]);
        } else {
            $serviceId = DB::table('services')->insertGetId([
                'name' => 'Bihar Ration Card Maker',
                'slug' => 'bihar-ration-card-maker',
                'description' => 'Bihar Smart PDS Ration Card Maker & Portal Access (RCMS Bihar) - Apply, Search, Download & Print Ration Card.',
                'icon' => 'local_mall',
                'coin_cost' => 99,
                'kind' => 'module',
                'module_key' => 'bihar_ration_card_maker',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 16,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Attach to all existing users in service_user table so it appears immediately on everyone's dashboard
        if ($serviceId) {
            $allUserIds = DB::table('users')->pluck('id')->toArray();
            foreach ($allUserIds as $userId) {
                DB::table('service_user')->updateOrInsert(
                    ['service_id' => $serviceId, 'user_id' => $userId],
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
