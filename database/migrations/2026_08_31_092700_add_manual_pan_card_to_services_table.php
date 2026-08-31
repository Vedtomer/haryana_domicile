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
        \App\Models\Service::firstOrCreate(['slug' => 'manual-pan-card'], [
            'name' => 'Manual PAN Card',
            'description' => 'Generate PAN Card instantly with uploaded photo and signature.',
            'coin_cost' => 10,
            'kind' => 'module',
            'module_key' => 'manual_pan_card',
            'is_premium' => false,
            'unlock_cost' => 0,
            'is_active' => true,
            'visibility' => 'public',
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \App\Models\Service::where('slug', 'manual-pan-card')->delete();
    }
};
