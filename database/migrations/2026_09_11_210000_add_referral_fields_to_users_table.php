<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'referral_code')) {
                $table->string('referral_code', 20)->nullable()->unique()->after('phone');
            }
            if (!Schema::hasColumn('users', 'referred_by')) {
                $table->foreignId('referred_by')->nullable()->after('referral_code')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('users', 'referral_reward_paid')) {
                $table->boolean('referral_reward_paid')->default(false)->after('referred_by');
            }
            if (!Schema::hasColumn('users', 'referral_reward_paid_at')) {
                $table->timestamp('referral_reward_paid_at')->nullable()->after('referral_reward_paid');
            }
        });

        // Generate referral codes for existing users who don't have one
        $existingUsers = DB::table('users')->whereNull('referral_code')->get();
        foreach ($existingUsers as $user) {
            $code = 'CSP' . strtoupper(substr(md5($user->id . $user->email . 'csp_referral_secret'), 0, 5));
            // Ensure uniqueness
            $candidate = $code;
            $counter = 1;
            while (DB::table('users')->where('referral_code', $candidate)->exists()) {
                $candidate = 'CSP' . strtoupper(Str::random(5));
            }
            DB::table('users')->where('id', $user->id)->update(['referral_code' => $candidate]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'referred_by')) {
                $table->dropForeign(['referred_by']);
                $table->dropColumn('referred_by');
            }
            if (Schema::hasColumn('users', 'referral_reward_paid')) {
                $table->dropColumn('referral_reward_paid');
            }
            if (Schema::hasColumn('users', 'referral_reward_paid_at')) {
                $table->dropColumn('referral_reward_paid_at');
            }
            if (Schema::hasColumn('users', 'referral_code')) {
                $table->dropColumn('referral_code');
            }
        });
    }
};
