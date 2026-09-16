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
        // 1. Update Birth Certificate service
        DB::table('services')
            ->where('slug', 'birth-certificate')
            ->orWhere('module_key', 'birth_record')
            ->update([
                'name' => 'Birth Certificate Name Add',
                'description' => 'Enter Certificate / Registration Number to download PDF instantly (Color & B&W Options).',
                'is_active' => true,
                'visibility' => 'private',
                'coin_cost' => 0,
                'updated_at' => now(),
            ]);

        // 2. Hide / deactivate any crs-birth-portal to remove external link from frontend
        DB::table('services')->where('slug', 'crs-birth-portal')->update([
            'is_active' => false,
            'deleted_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Ensure Birth Certificate is granted to all users
        $birthService = DB::table('services')->where('slug', 'birth-certificate')->first();
        if ($birthService) {
            $allUserIds = DB::table('users')->pluck('id')->toArray();
            foreach ($allUserIds as $uId) {
                DB::table('service_user')->updateOrInsert(
                    ['service_id' => $birthService->id, 'user_id' => $uId],
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
