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
        \Illuminate\Support\Facades\DB::table('services')->updateOrInsert(
            ['module_key' => 'airtel_passbook'],
            [
                'name' => 'Airtel Passbook Editor',
                'slug' => 'airtel-passbook',
                'description' => 'Generate and edit Airtel Payment Bank passbook/reference cards.',
                'coin_cost' => 10,
                'is_active' => true,
                'kind' => 'module',
                'visibility' => 'public',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::table('services')->where('module_key', 'airtel_passbook')->delete();
    }
};
