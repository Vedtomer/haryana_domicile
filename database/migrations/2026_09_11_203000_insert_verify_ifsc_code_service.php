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
        $existing = DB::table('services')
            ->where('slug', 'verify-ifsc-code')
            ->orWhere('module_key', 'verify_ifsc_code')
            ->first();

        if ($existing) {
            DB::table('services')->where('id', $existing->id)->update([
                'name' => 'Verify IFSC Code',
                'slug' => 'verify-ifsc-code',
                'description' => 'Verify IFSC code to get complete bank & branch details.',
                'icon' => '🏦',
                'coin_cost' => 9,
                'kind' => 'module',
                'module_key' => 'verify_ifsc_code',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 28,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('services')->insert([
                'name' => 'Verify IFSC Code',
                'slug' => 'verify-ifsc-code',
                'description' => 'Verify IFSC code to get complete bank & branch details.',
                'icon' => '🏦',
                'coin_cost' => 9,
                'kind' => 'module',
                'module_key' => 'verify_ifsc_code',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 28,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('services')->where('slug', 'verify-ifsc-code')->delete();
    }
};
