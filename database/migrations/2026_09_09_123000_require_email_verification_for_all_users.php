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
        // Require email verification for all regular users (keep admins verified)
        DB::table('users')
            ->whereNotIn('type', ['admin', 'super_admin'])
            ->update(['email_verified_at' => null]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
