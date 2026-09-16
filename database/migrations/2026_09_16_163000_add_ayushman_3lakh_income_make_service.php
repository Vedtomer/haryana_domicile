<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $logo = 'service-logos/0vX01V8ZE1NWJ6CGvSdMDXucWh5HcmMzw5RwHL2u.png';

        $service = DB::table('services')->where('slug', 'ayushman-3lakh-income-make')->first();
        $serviceId = null;

        if ($service) {
            $serviceId = $service->id;
            DB::table('services')->where('id', $serviceId)->update([
                'name' => 'Ayushman 3Lakh Income Make',
                'slug' => 'ayushman-3lakh-income-make',
                'description' => 'Chirayu Haryana - Apply & Make Ayushman Bharat Golden Card for 1.80L to 3.00L annual income families.',
                'icon' => '🏥',
                'logo' => $logo,
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'ayushman_3lakh_income_make',
                'is_active' => true,
                'visibility' => 'private',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 15,
                'deleted_at' => null,
                'updated_at' => now(),
            ]);
        } else {
            $serviceId = DB::table('services')->insertGetId([
                'name' => 'Ayushman 3Lakh Income Make',
                'slug' => 'ayushman-3lakh-income-make',
                'description' => 'Chirayu Haryana - Apply & Make Ayushman Bharat Golden Card for 1.80L to 3.00L annual income families.',
                'icon' => '🏥',
                'logo' => $logo,
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'ayushman_3lakh_income_make',
                'is_active' => true,
                'visibility' => 'private',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 15,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Grant permission to all users in service_user table
        if ($serviceId) {
            $allUserIds = DB::table('users')->pluck('id')->toArray();
            foreach ($allUserIds as $uId) {
                DB::table('service_user')->updateOrInsert(
                    ['service_id' => $serviceId, 'user_id' => $uId],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }

    public function down(): void
    {
    }
};
