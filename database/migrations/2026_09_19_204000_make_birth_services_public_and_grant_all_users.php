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
        $nameAddService = DB::table('services')
            ->where('slug', 'birth-certificate')
            ->orWhere('module_key', 'birth_record')
            ->first();

        $nameAddId = null;
        if ($nameAddService) {
            $nameAddId = $nameAddService->id;
            DB::table('services')->where('id', $nameAddId)->update([
                'name' => 'Birth Certificate Name Add',
                'slug' => 'birth-certificate',
                'module_key' => 'birth_record',
                'description' => 'जन्म रिकार्ड में नाम जुड़वाने हेतु स्वंय सत्यापित घोषणा पत्र (Name Add Form & Records)',
                'icon' => '📝',
                'coin_cost' => 10,
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'deleted_at' => null,
                'updated_at' => now(),
            ]);
        } else {
            $nameAddId = DB::table('services')->insertGetId([
                'name' => 'Birth Certificate Name Add',
                'slug' => 'birth-certificate',
                'module_key' => 'birth_record',
                'description' => 'जन्म रिकार्ड में नाम जुड़वाने हेतु स्वंय सत्यापित घोषणा पत्र (Name Add Form & Records)',
                'icon' => '📝',
                'coin_cost' => 10,
                'kind' => 'module',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Service: Birth Certificate Document Merger (Single PDF Merger & Download)
        $downloadService = DB::table('services')
            ->where('slug', 'birth-certificate-download')
            ->orWhere('slug', 'crs-birth-portal')
            ->orWhere('module_key', 'birth_certificate_download')
            ->first();

        $downloadId = null;
        if ($downloadService) {
            $downloadId = $downloadService->id;
            DB::table('services')->where('id', $downloadId)->update([
                'name' => 'Birth Certificate Document Merger',
                'slug' => 'birth-certificate-download',
                'module_key' => 'birth_certificate_download',
                'description' => 'पुराना जन्म प्रमाण पत्र और आधार कार्ड जोड़कर 1 सिंगल PDF बनाएं (Document Merger)',
                'icon' => '👶',
                'coin_cost' => 0,
                'kind' => 'module',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'deleted_at' => null,
                'updated_at' => now(),
            ]);
        } else {
            $downloadId = DB::table('services')->insertGetId([
                'name' => 'Birth Certificate Document Merger',
                'slug' => 'birth-certificate-download',
                'module_key' => 'birth_certificate_download',
                'description' => 'पुराना जन्म प्रमाण पत्र और आधार कार्ड जोड़कर 1 सिंगल PDF बनाएं (Document Merger)',
                'icon' => '👶',
                'coin_cost' => 0,
                'kind' => 'module',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Grant access to all users in service_user table
        $targetIds = array_filter([$nameAddId, $downloadId]);
        if (!empty($targetIds)) {
            $userIds = DB::table('users')->pluck('id')->toArray();
            foreach ($userIds as $uid) {
                foreach ($targetIds as $sid) {
                    DB::table('service_user')->updateOrInsert(
                        ['service_id' => $sid, 'user_id' => $uid],
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
