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
                $table->string('shop_code', 32)->unique();
                $table->string('shop_name', 191);
                $table->string('upi_id', 191)->nullable();
                $table->decimal('bw_rate', 8, 2)->default(2.00);
                $table->decimal('color_rate', 8, 2)->default(10.00);
                $table->boolean('is_online')->default(false);
                $table->timestamp('last_heartbeat_at')->nullable();
                $table->string('agent_token', 64)->unique();
                $table->timestamps();
            });
        } else {
            Schema::table('print_shops', function (Blueprint $table) {
                if (!Schema::hasColumn('print_shops', 'shop_code')) {
                    $table->string('shop_code', 32)->nullable()->unique();
                }
                if (!Schema::hasColumn('print_shops', 'shop_name')) {
                    $table->string('shop_name', 191)->default('My Shop');
                }
                if (!Schema::hasColumn('print_shops', 'upi_id')) {
                    $table->string('upi_id', 191)->nullable();
                }
                if (!Schema::hasColumn('print_shops', 'bw_rate')) {
                    $table->decimal('bw_rate', 8, 2)->default(2.00);
                }
                if (!Schema::hasColumn('print_shops', 'color_rate')) {
                    $table->decimal('color_rate', 8, 2)->default(10.00);
                }
                if (!Schema::hasColumn('print_shops', 'is_online')) {
                    $table->boolean('is_online')->default(false);
                }
                if (!Schema::hasColumn('print_shops', 'last_heartbeat_at')) {
                    $table->timestamp('last_heartbeat_at')->nullable();
                }
                if (!Schema::hasColumn('print_shops', 'agent_token')) {
                    $table->string('agent_token', 64)->nullable()->unique();
                }
            });
        }

        if (!Schema::hasTable('print_jobs')) {
            Schema::create('print_jobs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('print_shop_id')->constrained('print_shops')->onDelete('cascade');
                $table->string('job_code', 32)->unique();
                $table->string('customer_name', 191)->nullable();
                $table->string('customer_phone', 32)->nullable();
                $table->string('original_filename', 255);
                $table->string('file_path', 255);
                $table->string('file_type', 32)->default('pdf');
                $table->integer('total_pages')->default(1);
                $table->string('color_type', 32)->default('bw'); // bw, color
                $table->integer('copies')->default(1);
                $table->decimal('total_amount', 8, 2)->default(0.00);
                $table->string('payment_method', 32)->default('cash'); // cash, upi
                $table->string('payment_status', 32)->default('paid'); // paid, pending
                $table->string('status', 32)->default('pending'); // pending, printing, completed, failed
                $table->string('printer_name', 191)->nullable();
                $table->text('error_message')->nullable();
                $table->timestamp('printed_at')->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('print_jobs', function (Blueprint $table) {
                if (!Schema::hasColumn('print_jobs', 'job_code')) {
                    $table->string('job_code', 32)->nullable()->unique();
                }
                if (!Schema::hasColumn('print_jobs', 'customer_name')) {
                    $table->string('customer_name', 191)->nullable();
                }
                if (!Schema::hasColumn('print_jobs', 'customer_phone')) {
                    $table->string('customer_phone', 32)->nullable();
                }
                if (!Schema::hasColumn('print_jobs', 'original_filename')) {
                    $table->string('original_filename', 255)->default('');
                }
                if (!Schema::hasColumn('print_jobs', 'file_path')) {
                    $table->string('file_path', 255)->default('');
                }
                if (!Schema::hasColumn('print_jobs', 'file_type')) {
                    $table->string('file_type', 32)->default('pdf');
                }
                if (!Schema::hasColumn('print_jobs', 'total_pages')) {
                    $table->integer('total_pages')->default(1);
                }
                if (!Schema::hasColumn('print_jobs', 'color_type')) {
                    $table->string('color_type', 32)->default('bw');
                }
                if (!Schema::hasColumn('print_jobs', 'copies')) {
                    $table->integer('copies')->default(1);
                }
                if (!Schema::hasColumn('print_jobs', 'total_amount')) {
                    $table->decimal('total_amount', 8, 2)->default(0.00);
                }
                if (!Schema::hasColumn('print_jobs', 'payment_method')) {
                    $table->string('payment_method', 32)->default('cash');
                }
                if (!Schema::hasColumn('print_jobs', 'payment_status')) {
                    $table->string('payment_status', 32)->default('paid');
                }
                if (!Schema::hasColumn('print_jobs', 'status')) {
                    $table->string('status', 32)->default('pending');
                }
                if (!Schema::hasColumn('print_jobs', 'printer_name')) {
                    $table->string('printer_name', 191)->nullable();
                }
                if (!Schema::hasColumn('print_jobs', 'error_message')) {
                    $table->text('error_message')->nullable();
                }
                if (!Schema::hasColumn('print_jobs', 'printed_at')) {
                    $table->timestamp('printed_at')->nullable();
                }
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
