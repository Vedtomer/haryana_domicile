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
        if (Schema::hasTable('coin_purchase_requests')) {
            Schema::table('coin_purchase_requests', function (Blueprint $table) {
                if (!Schema::hasColumn('coin_purchase_requests', 'order_id')) {
                    $table->string('order_id')->nullable()->unique()->after('id');
                }
                if (!Schema::hasColumn('coin_purchase_requests', 'gateway')) {
                    $table->string('gateway', 32)->default('manual')->after('status');
                }
                if (!Schema::hasColumn('coin_purchase_requests', 'payment_url')) {
                    $table->text('payment_url')->nullable()->after('gateway');
                }
                if (!Schema::hasColumn('coin_purchase_requests', 'qr_data')) {
                    $table->longText('qr_data')->nullable()->after('payment_url');
                }
                if (!Schema::hasColumn('coin_purchase_requests', 'payment_data')) {
                    $table->json('payment_data')->nullable()->after('qr_data');
                }
            });
        }

        // Seed default PayCoreX settings
        if (Schema::hasTable('settings')) {
            $defaultSettings = [
                'paycorex_enabled'  => '1',
                'paycorex_username' => '7494945476',
                'paycorex_api_key'  => '2d7bcd6c2467d343d9f1110ebd59da51',
                'paycorex_base_url' => 'https://paycorex.in/api/v1',
            ];

            foreach ($defaultSettings as $key => $val) {
                DB::table('settings')->updateOrInsert(
                    ['key' => $key],
                    ['value' => $val, 'updated_at' => now(), 'created_at' => now()]
                );
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('coin_purchase_requests')) {
            Schema::table('coin_purchase_requests', function (Blueprint $table) {
                $cols = ['order_id', 'gateway', 'payment_url', 'qr_data', 'payment_data'];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('coin_purchase_requests', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
