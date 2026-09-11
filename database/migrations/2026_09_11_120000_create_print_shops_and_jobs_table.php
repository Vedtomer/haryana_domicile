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
        Schema::create('print_shops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('shop_code', 20)->unique();
            $table->string('shop_name');
            $table->string('phone', 25)->nullable();
            $table->string('upi_id')->nullable();
            $table->string('agent_secret', 64)->unique();
            $table->timestamp('agent_last_seen_at')->nullable();
            $table->string('printer_name')->nullable();
            $table->string('color_printer_name')->nullable();
            $table->json('available_printers')->nullable();
            $table->decimal('price_bw_page', 8, 2)->default(3.00);
            $table->decimal('price_color_page', 8, 2)->default(10.00);
            $table->decimal('price_photo_sheet', 8, 2)->default(30.00);
            $table->boolean('is_auto_print')->default(true);
            $table->boolean('is_cash_allowed')->default(true);
            $table->boolean('is_online_allowed')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('print_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('print_shop_id')->constrained('print_shops')->cascadeOnDelete();
            $table->string('job_code', 20)->unique();
            $table->string('customer_name')->nullable();
            $table->string('customer_phone', 25)->nullable();
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type', 30)->default('pdf');
            $table->unsignedBigInteger('file_size')->default(0);
            $table->unsignedInteger('copies')->default(1);
            $table->enum('color_mode', ['bw', 'color'])->default('bw');
            $table->string('page_range')->default('all');
            $table->unsignedInteger('total_pages')->default(1);
            $table->enum('duplex', ['simplex', 'duplex_long', 'duplex_short'])->default('simplex');
            $table->string('paper_size', 20)->default('A4');
            $table->enum('service_type', ['document', 'photo_sheet', 'id_card', 'resume'])->default('document');
            $table->decimal('calculated_cost', 8, 2)->default(0.00);
            $table->enum('payment_status', ['pending', 'paid_cash', 'paid_online'])->default('pending');
            $table->enum('job_status', ['queued', 'downloading', 'printing', 'printed', 'failed', 'cancelled'])->default('queued');
            $table->text('error_message')->nullable();
            $table->timestamp('printed_at')->nullable();
            $table->timestamps();
            
            $table->index(['print_shop_id', 'job_status']);
        });
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
