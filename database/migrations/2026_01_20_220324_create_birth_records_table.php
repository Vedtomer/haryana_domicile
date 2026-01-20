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
        Schema::create('birth_records', function (Blueprint $table) {
            $table->id();
            $table->string('district');
            
            // Applicant Details
            $table->string('father_name'); // Applicant Father
            $table->string('mother_name'); // Applicant Mother
            $table->text('permanent_address'); // Applicant Address
            
            // Existing Birth Record Details
            $table->string('issuing_authority'); // Zila Registrar/Nagar Nigam etc.
            $table->string('record_year');
            $table->string('registration_no');
            $table->date('date_of_registration');
            $table->string('record_father_name')->nullable();
            $table->string('record_mother_name')->nullable();
            
            // Child to be added
            $table->string('child_name');
            $table->string('gender'); // Male/Female/Transgender
            $table->date('dob');
            $table->text('address_parents_birth'); // Address at birth
            
            // Supporting Documents (School)
            $table->string('school_child_name')->nullable();
            $table->date('school_dob')->nullable();
            $table->string('school_father_name')->nullable();
            $table->string('school_mother_name')->nullable();
            
            // Other Children
            $table->json('other_children')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('birth_records');
    }
};
