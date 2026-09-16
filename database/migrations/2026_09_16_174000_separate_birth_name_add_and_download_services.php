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
        // 1. Service: Birth Certificate Name Add (Form & records)
        DB::table('services')
            ->where('slug', 'birth-certificate')
            ->orWhere('module_key', 'birth_record')
            ->update([
                'name' => 'Birth Certificate Name Add',
                'slug' => 'birth-certificate',
                'module_key' => 'birth_record',
                'description' => 'जन्म रिकार्ड में नाम जुड़वाने हेतु स्वंय सत्यापित घोषणा पत्र (Name Add Form & Records)',
                'icon' => '📝',
                'is_active' => true,
                'visibility' => 'private',
                'coin_cost' => 10,
                'deleted_at' => null,
                'updated_at' => now(),
            ]);

        // 2. Service: Birth Certificate Download (Instant PDF download by registration no)
        $downloadService = DB::table('services')
            ->where('slug', 'birth-certificate-download')
            ->orWhere('slug', 'crs-birth-portal')
            ->orWhere('module_key', 'birth_certificate_download')
            ->first();

        if ($downloadService) {
            DB::table('services')
                ->where('id', $downloadService->id)
                ->update([
                    'name' => 'Birth Certificate Download',
                    'slug' => 'birth-certificate-download',
                    'module_key' => 'birth_certificate_download',
                    'description' => 'जन्म प्रमाण पत्र / रजिस्ट्रेशन नंबर दर्ज करके तुरंत PDF डाउनलोड करें (Color & B&W)',
                    'icon' => '👶',
                    'is_active' => true,
                    'visibility' => 'private',
                    'coin_cost' => 0,
                    'kind' => 'module',
                    'deleted_at' => null,
                    'updated_at' => now(),
                ]);
        } else {
            DB::table('services')->insert([
                'name' => 'Birth Certificate Download',
                'slug' => 'birth-certificate-download',
                'module_key' => 'birth_certificate_download',
                'description' => 'जन्म प्रमाण पत्र / रजिस्ट्रेशन नंबर दर्ज करके तुरंत PDF डाउनलोड करें (Color & B&W)',
                'icon' => '👶',
                'is_active' => true,
                'visibility' => 'private',
                'coin_cost' => 0,
                'kind' => 'module',
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Ensure both services are granted to all users
        $birthServices = DB::table('services')
            ->whereIn('slug', ['birth-certificate', 'birth-certificate-download'])
            ->pluck('id')
            ->toArray();

        $allUserIds = DB::table('users')->pluck('id')->toArray();
        foreach ($allUserIds as $uId) {
            foreach ($birthServices as $sId) {
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
