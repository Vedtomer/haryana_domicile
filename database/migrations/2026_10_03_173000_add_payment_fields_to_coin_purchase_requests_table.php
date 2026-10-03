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
        Schema::table('coin_purchase_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('coin_purchase_requests', 'payment_method')) {
                $table->string('payment_method')->default('manual')->after('status');
            }
            if (!Schema::hasColumn('coin_purchase_requests', 'gateway_order_id')) {
                $table->string('gateway_order_id')->nullable()->index()->after('payment_method');
            }
            if (!Schema::hasColumn('coin_purchase_requests', 'gateway_response')) {
                $table->longText('gateway_response')->nullable()->after('gateway_order_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coin_purchase_requests', function (Blueprint $table) {
            if (Schema::hasColumn('coin_purchase_requests', 'gateway_response')) {
                $table->dropColumn('gateway_response');
            }
            if (Schema::hasColumn('coin_purchase_requests', 'gateway_order_id')) {
                $table->dropColumn('gateway_order_id');
            }
            if (Schema::hasColumn('coin_purchase_requests', 'payment_method')) {
                $table->dropColumn('payment_method');
            }
        });
    }
};
