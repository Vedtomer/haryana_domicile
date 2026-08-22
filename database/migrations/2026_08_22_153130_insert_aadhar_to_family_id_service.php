<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $exists = DB::table('services')->where('slug', 'aadhar-to-family-id')->exists();
        if (!$exists) {
            DB::table('services')->insert([
                'name' => 'Aadhar to Family ID',
                'slug' => 'aadhar-to-family-id',
                'description' => 'Get Family ID instantly from Aadhar Number',
                'icon' => 'badge',
                'coin_cost' => 0,
                'kind' => 'module',
                'module_key' => 'aadhar_to_family_id',
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
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
        DB::table('services')->where('slug', 'aadhar-to-family-id')->delete();
    }
};
