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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'allowed_devices')) {
                $table->unsignedTinyInteger('allowed_devices')->default(1)->after('is_active');
            }
            if (!Schema::hasColumn('users', 'license_device_id_2')) {
                $table->string('license_device_id_2')->nullable()->after('license_device_bound_at');
            }
            if (!Schema::hasColumn('users', 'license_device_name_2')) {
                $table->string('license_device_name_2')->nullable()->after('license_device_id_2');
            }
            if (!Schema::hasColumn('users', 'license_device_ip_2')) {
                $table->string('license_device_ip_2')->nullable()->after('license_device_name_2');
            }
            if (!Schema::hasColumn('users', 'license_device_bound_at_2')) {
                $table->timestamp('license_device_bound_at_2')->nullable()->after('license_device_ip_2');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'allowed_devices',
                'license_device_id_2',
                'license_device_name_2',
                'license_device_ip_2',
                'license_device_bound_at_2',
            ]);
        });
    }
};
