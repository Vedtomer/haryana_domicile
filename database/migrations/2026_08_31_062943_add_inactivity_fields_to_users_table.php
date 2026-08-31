<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Last time user did any activity (coin purchase or service use)
            // Defaults to now() so existing/new users get a fresh 7-day window
            $table->timestamp('last_activity_at')->nullable()->after('is_active');
            // Why the account was deactivated: 'inactivity' | 'admin' | null
            $table->string('deactivated_reason', 30)->nullable()->after('last_activity_at');
        });

        // Seed last_activity_at for all existing active users so they don't get
        // instantly deactivated when the scheduler first runs
        \Illuminate\Support\Facades\DB::statement(
            "UPDATE users SET last_activity_at = NOW() WHERE last_activity_at IS NULL"
        );
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['last_activity_at', 'deactivated_reason']);
        });
    }
};
