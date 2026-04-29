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
        Schema::table('pan_requests', function (Blueprint $table) {
            // New Document Uploads
            $table->string('photo')->nullable();
            $table->string('signature')->nullable();
            $table->string('aadhar_card_doc')->nullable();
            $table->string('additional_document')->nullable();
            
            // Admin Uploads
            $table->string('slip_document')->nullable();
            $table->string('final_pdf')->nullable();

            // Changing name and aadhar_number to nullable, in case users only upload docs
            $table->string('name')->nullable()->change();
            $table->string('aadhar_number', 12)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pan_requests', function (Blueprint $table) {
            $table->dropColumn([
                'photo', 
                'signature', 
                'aadhar_card_doc', 
                'additional_document',
                'slip_document',
                'final_pdf'
            ]);
        });
    }
};
