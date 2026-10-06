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
        if (!Schema::hasTable('mobile_recharges')) {
            Schema::create('mobile_recharges', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('mobile', 25);
                $table->string('operator', 10);
                $table->string('operator_name', 50);
                $table->string('service_type', 20)->default('prepaid'); // prepaid, postpaid, dth
                $table->decimal('amount', 10, 2);
                $table->integer('coins_deducted');
                $table->string('txn_id', 100)->nullable()->index();
                $table->string('provider_status', 50)->nullable();
                $table->string('status', 30)->default('pending')->index(); // success, processing, failed, refunded
                $table->decimal('amount_deducted', 10, 2)->nullable();
                $table->decimal('commission', 10, 2)->nullable();
                $table->text('api_response')->nullable();
                $table->text('failure_reason')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mobile_recharges');
    }
};
