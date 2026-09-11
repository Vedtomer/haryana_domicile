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
            ->where('slug', 'passport-apply')
            ->orWhere('module_key', 'passport_apply')
            ->first();

        if ($existing) {
            DB::table('services')->where('id', $existing->id)->update([
                'name' => 'Passport Apply',
                'slug' => 'passport-apply',
                'description' => 'Online Passport application assistance. Complete form filling, document verification, and appointment booking.',
                'icon' => '🛂',
                'coin_cost' => 2750,
                'kind' => 'module',
                'module_key' => 'passport_apply',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 29,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('services')->insert([
                'name' => 'Passport Apply',
                'slug' => 'passport-apply',
                'description' => 'Online Passport application assistance. Complete form filling, document verification, and appointment booking.',
                'icon' => '🛂',
                'coin_cost' => 2750,
                'kind' => 'module',
                'module_key' => 'passport_apply',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 29,
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
        DB::table('services')->where('slug', 'passport-apply')->delete();
    }
};
