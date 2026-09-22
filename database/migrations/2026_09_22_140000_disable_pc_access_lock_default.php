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
        if (Schema::hasColumn('users', 'allowed_devices')) {
            // Set all existing users to allowed_devices = 0 (unlimited / no PC lock)
            DB::table('users')->where('allowed_devices', '!=', 0)->orWhereNull('allowed_devices')->update([
                'allowed_devices' => 0,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
