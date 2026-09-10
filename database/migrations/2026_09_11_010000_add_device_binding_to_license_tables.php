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
        if (Schema::hasTable('license_keys')) {
            Schema::table('license_keys', function (Blueprint $table) {
                if (!Schema::hasColumn('license_keys', 'device_id')) {
                    $table->string('device_id')->nullable()->after('expires_at');
                    $table->string('device_name')->nullable()->after('device_id');
                    $table->string('device_ip')->nullable()->after('device_name');
                    $table->timestamp('bound_at')->nullable()->after('device_ip');
                }
            });
        }

        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'license_device_id')) {
                    $table->string('license_device_id')->nullable()->after('license_expires_at');
                    $table->string('license_device_name')->nullable()->after('license_device_id');
                    $table->string('license_device_ip')->nullable()->after('license_device_name');
                    $table->timestamp('license_device_bound_at')->nullable()->after('license_device_ip');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('license_keys')) {
            Schema::table('license_keys', function (Blueprint $table) {
                $table->dropColumn(['device_id', 'device_name', 'device_ip', 'bound_at']);
            });
        }

        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn(['license_device_id', 'license_device_name', 'license_device_ip', 'license_device_bound_at']);
            });
        }
    }
};
