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
        Schema::create('coin_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('amount'); // Positive for additions, negative for deductions
            $table->integer('balance_after');
            $table->enum('type', ['purchase', 'admin_credit', 'service_deduction', 'refund']);
            $table->string('service_type')->nullable(); // 'birth_record', 'haryana_domicile', 'pdf_converter'
            $table->unsignedBigInteger('service_id')->nullable();
            $table->text('description');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coin_transactions');
    }
};
