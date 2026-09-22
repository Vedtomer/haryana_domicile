<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $exists = \Illuminate\Support\Facades\DB::table('services')->where('slug', 'manual-pan-card')->exists();
        if (!$exists) {
            \Illuminate\Support\Facades\DB::table('services')->insert([
                'name' => 'Manual PAN Card',
                'slug' => 'manual-pan-card',
                'description' => 'Generate PAN Card instantly with uploaded photo and signature.',
                'coin_cost' => 10,
                'kind' => 'module',
                'module_key' => 'manual_pan_card',
                'is_premium' => false,
                'unlock_cost' => 0,
                'is_active' => true,
                'visibility' => 'public',
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
        \Illuminate\Support\Facades\DB::table('services')->where('slug', 'manual-pan-card')->delete();
    }
};
