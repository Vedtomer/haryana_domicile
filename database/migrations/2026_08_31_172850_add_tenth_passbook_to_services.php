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
            ['module_key' => 'tenth_passbook'],
            [
                'name' => '10th Passbook Editor',
                'slug' => 'tenth-passbook',
                'description' => 'Generate and edit 10th marksheet/passbook with your photo.',
                'coin_cost' => 15,
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
        \Illuminate\Support\Facades\DB::table('services')->where('module_key', 'tenth_passbook')->delete();
    }
};
