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
        if (!Schema::hasTable('print_shops')) {
            Schema::create('print_shops', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('shop_code')->unique()->index();
                $table->string('shop_name');
                $table->string('upi_id')->nullable();
                $table->decimal('bw_rate', 8, 2)->default(2.00);
                $table->decimal('color_rate', 8, 2)->default(10.00);
                $table->boolean('is_online')->default(false);
                $table->timestamp('last_heartbeat_at')->nullable();
                $table->string('agent_token')->unique();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('print_jobs')) {
            Schema::create('print_jobs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('print_shop_id')->constrained('print_shops')->onDelete('cascade');
                $table->string('job_code')->unique()->index();
                $table->string('customer_name')->nullable();
                $table->string('customer_phone')->nullable();
                $table->string('original_filename');
                $table->string('file_path');
                $table->string('file_type')->default('pdf');
                $table->integer('total_pages')->default(1);
                $table->string('color_type')->default('bw'); // bw, color
                $table->integer('copies')->default(1);
                $table->decimal('total_amount', 8, 2)->default(0.00);
                $table->string('payment_method')->default('cash'); // cash, upi
                $table->string('payment_status')->default('paid'); // paid, pending
                $table->string('status')->default('pending'); // pending, printing, completed, failed
                $table->string('printer_name')->nullable();
                $table->text('error_message')->nullable();
                $table->timestamp('printed_at')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('print_jobs');
        Schema::dropIfExists('print_shops');
    }
};
