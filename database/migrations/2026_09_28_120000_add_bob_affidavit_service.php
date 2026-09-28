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
        $fields = [
            ['label' => 'Account Holder Name', 'type' => 'text', 'required' => true],
            ['label' => 'Father / Husband Name', 'type' => 'text', 'required' => true],
            ['label' => 'BOB Account Number', 'type' => 'text', 'required' => true],
            ['label' => 'Mobile Number', 'type' => 'text', 'required' => true],
            ['label' => 'Aadhaar Number', 'type' => 'text', 'required' => false],
            ['label' => 'Branch Name / IFSC Code', 'type' => 'text', 'required' => false],
            ['label' => 'Affidavit Reason / Purpose', 'type' => 'textarea', 'required' => true],
            ['label' => 'Upload Passbook / ID Proof', 'type' => 'file', 'required' => false],
        ];

        $service = DB::table('services')
            ->where('slug', 'bob-affidavit')
            ->first();

        $serviceId = null;

        if ($service) {
            $serviceId = $service->id;
            DB::table('services')->where('id', $serviceId)->update([
                'name' => 'BOB Affidavit',
                'slug' => 'bob-affidavit',
                'description' => 'Bank of Baroda (BOB) Affidavit Request - Submit customer details and documents for Bank of Baroda affidavit.',
                'icon' => '🏦',
                'coin_cost' => 149,
                'kind' => 'manual',
                'module_key' => null,
                'fields' => json_encode($fields),
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 0,
                'deleted_at' => null,
                'updated_at' => now(),
            ]);
        } else {
            $serviceId = DB::table('services')->insertGetId([
                'name' => 'BOB Affidavit',
                'slug' => 'bob-affidavit',
                'description' => 'Bank of Baroda (BOB) Affidavit Request - Submit customer details and documents for Bank of Baroda affidavit.',
                'icon' => '🏦',
                'coin_cost' => 149,
                'kind' => 'manual',
                'module_key' => null,
                'fields' => json_encode($fields),
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 0,
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
        $service = DB::table('services')->where('slug', 'bob-affidavit')->first();
        if ($service) {
            DB::table('service_user')->where('service_id', $service->id)->delete();
            DB::table('services')->where('id', $service->id)->delete();
        }
    }
};
