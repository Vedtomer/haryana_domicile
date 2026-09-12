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
        // Reset any accidental Linux Desktop developer/server bindings so real user Windows PCs can bind
        DB::table('users')
            ->where('license_device_name', 'like', '%Linux%')
            ->update([
                'license_device_id'       => null,
                'license_device_name'     => null,
                'license_device_ip'       => null,
                'license_device_bound_at' => null,
            ]);

        DB::table('license_keys')
            ->where('device_name', 'like', '%Linux%')
            ->update([
                'device_id'   => null,
                'device_name' => null,
                'device_ip'   => null,
                'bound_at'    => null,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
