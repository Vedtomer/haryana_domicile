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
        // 1. wallets table
        if (!Schema::hasTable('wallets')) {
            Schema::create('wallets', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();
                $table->decimal('balance', 12, 2)->default(0.00);
                $table->string('currency', 10)->default('INR');
                $table->string('status', 20)->default('active');
                $table->timestamps();
            });
        }

        // 2. payment_orders table
        if (!Schema::hasTable('payment_orders')) {
            Schema::create('payment_orders', function (Blueprint $table) {
                $table->id();
                $table->string('order_id', 64)->unique()->index();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete()->index();
                $table->decimal('requested_amount', 12, 2);
                $table->decimal('verified_amount', 12, 2)->nullable();
                $table->string('transaction_id', 100)->nullable()->index();
                $table->string('payment_status', 32)->default('PENDING')->index(); // PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED
                $table->string('verification_status', 32)->default('UNVERIFIED')->index(); // UNVERIFIED, VALID, INVALID, DUPLICATE
                $table->string('payment_gateway', 64)->default('paycorex');
                $table->text('payment_url')->nullable();
                $table->longText('qr_data')->nullable();
                $table->json('raw_response')->nullable();
                $table->timestamps();
            });
        }

        // 3. wallet_transactions table
        if (!Schema::hasTable('wallet_transactions')) {
            Schema::create('wallet_transactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete()->index();
                $table->decimal('amount', 12, 2);
                $table->string('transaction_id', 100)->nullable()->index();
                $table->string('order_id', 64)->nullable()->index();
                $table->string('type', 32)->default('CREDIT'); // CREDIT, DEBIT
                $table->string('status', 32)->default('COMPLETED'); // COMPLETED, PENDING, FAILED
                $table->text('description')->nullable();
                $table->decimal('balance_after', 12, 2)->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('payment_orders');
        Schema::dropIfExists('wallets');
    }
};
