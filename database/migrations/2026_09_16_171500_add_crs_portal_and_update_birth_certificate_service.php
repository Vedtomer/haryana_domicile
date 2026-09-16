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
        // 1. Update Birth Certificate Name Add service
        DB::table('services')
            ->where('slug', 'birth-certificate')
            ->orWhere('module_key', 'birth_record')
            ->update([
                'name' => 'Birth Certificate Name Add',
                'description' => 'जन्म प्रमाण पत्र में नाम जुड़वाने हेतु स्वंय सत्यापित घोषणा पत्र (Color & B&W PDF Print).',
                'is_active' => true,
                'visibility' => 'private',
                'updated_at' => now(),
            ]);

        // 2. Add CRS Birth & Death Portal service
        $existingCrs = DB::table('services')->where('slug', 'crs-birth-portal')->first();
        if ($existingCrs) {
            DB::table('services')->where('id', $existingCrs->id)->update([
                'name' => 'CRS Birth & Death Portal',
                'slug' => 'crs-birth-portal',
                'description' => 'Civil Registration System (CRS) - भारत सरकार का आधिकारिक जन्म एवं मृत्यु पंजीकरण पोर्टल (dc.crsorgi.gov.in).',
                'icon' => '🏛️',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'crs_portal',
                'is_active' => true,
                'visibility' => 'private',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 2,
                'deleted_at' => null,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('services')->insert([
                'name' => 'CRS Birth & Death Portal',
                'slug' => 'crs-birth-portal',
                'description' => 'Civil Registration System (CRS) - भारत सरकार का आधिकारिक जन्म एवं मृत्यु पंजीकरण पोर्टल (dc.crsorgi.gov.in).',
                'icon' => '🏛️',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'crs_portal',
                'is_active' => true,
                'visibility' => 'private',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Grant both services to ALL users
        $serviceIds = DB::table('services')
            ->whereIn('slug', ['birth-certificate', 'crs-birth-portal'])
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
