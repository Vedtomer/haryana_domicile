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
        Schema::create('pan_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('aadhar_number', 12)->nullable(); // 12 digit Aadhar
            $table->string('name')->nullable(); // Name of person
            $table->string('mobile', 20)->nullable(); // Contact number
            $table->string('pan_number', 10)->nullable(); // PAN provided by admin
            $table->string('status', 50)->default('pending');
            $table->string('utr_number')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('photo')->nullable();
            $table->string('signature')->nullable();
            $table->string('aadhar_card_doc')->nullable();
            $table->string('additional_document')->nullable();
            $table->string('slip_document')->nullable();
            $table->string('final_pdf')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('aadhar_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pan_requests');
    }
};
