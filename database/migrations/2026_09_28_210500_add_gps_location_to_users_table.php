<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'latitude')) {
                $table->decimal('latitude', 10, 8)->nullable()->after('is_active');
            }
            if (!Schema::hasColumn('users', 'longitude')) {
                $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            }
            if (!Schema::hasColumn('users', 'location_address')) {
                $table->string('location_address')->nullable()->after('longitude');
            }
            if (!Schema::hasColumn('users', 'location_city')) {
                $table->string('location_city')->nullable()->after('location_address');
            }
            if (!Schema::hasColumn('users', 'location_state')) {
                $table->string('location_state')->nullable()->after('location_city');
            }
            if (!Schema::hasColumn('users', 'location_accuracy')) {
                $table->float('location_accuracy')->nullable()->after('location_state');
            }
            if (!Schema::hasColumn('users', 'location_updated_at')) {
                $table->timestamp('location_updated_at')->nullable()->after('location_accuracy');
            }
            if (!Schema::hasColumn('users', 'last_login_ip')) {
                $table->string('last_login_ip', 45)->nullable()->after('location_updated_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = [
                'latitude',
                'longitude',
                'location_address',
                'location_city',
                'location_state',
                'location_accuracy',
                'location_updated_at',
                'last_login_ip'
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
