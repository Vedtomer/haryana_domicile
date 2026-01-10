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
        Schema::create('pdf_coordinates', function (Blueprint $table) {
            $table->id();
            $table->integer('page')->default(1); // Page number (1-4)
            $table->string('field_name'); // e.g., 'name', 'father_name', 'doc_applicant_name'
            $table->integer('x')->default(0); // X coordinate
            $table->integer('y')->default(0); // Y coordinate
            $table->integer('font_size')->default(20); // Font size
            $table->integer('spacing')->nullable(); // Spacing for number boxes (mobile, aadhar)
            $table->timestamps();
            
            // Unique constraint: one entry per page + field combination
            $table->unique(['page', 'field_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pdf_coordinates');
    }
};
