<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $logo = 'service-logos/Yh61ZFPQAAE2Rfl7Jy4V0Lp3qzOTlu44eKCJUYuq.jpg';

        DB::table('services')->where('slug', 'dhbvn-electricity-bill')->update([
            'name' => 'Electricity Bill (DHBVN)',
            'description' => 'Bijli Bill - Dakshin Haryana Bijli Vitran Nigam (DHBVN) duplicate electricity bill instant PDF download.',
            'logo' => $logo,
            'is_active' => true,
            'visibility' => 'private',
            'updated_at' => now(),
        ]);

        DB::table('services')->where('slug', 'uhbvn-electricity-bill')->update([
            'name' => 'Electricity Bill (UHBVN)',
            'description' => 'Bijli Bill - Uttar Haryana Bijli Vitran Nigam (UHBVN) duplicate electricity bill instant PDF download.',
            'logo' => $logo,
            'is_active' => true,
            'visibility' => 'private',
            'updated_at' => now(),
        ]);

        // Also ensure ALL active services are granted to all users in service_user table
        $serviceIds = DB::table('services')->whereIn('slug', ['dhbvn-electricity-bill', 'uhbvn-electricity-bill'])->pluck('id')->toArray();
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

    public function down(): void
    {
    }
};
