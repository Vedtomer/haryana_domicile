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
        if (Schema::hasTable('salary_slips')) {
            Schema::table('salary_slips', function (Blueprint $table) {
                // Ensure all breakdown and optional fields can be nullable
                $table->string('gross_salary')->nullable()->change();
                $table->string('total_d')->nullable()->change();
                $table->string('hra_exemption')->nullable()->change();
                $table->string('leave_salary_exemption')->nullable()->change();
                $table->string('balance_3')->nullable()->change();
                $table->string('entertainment_allowance')->nullable()->change();
                $table->string('tax_on_employment')->nullable()->change();
                $table->string('aggregate_5')->nullable()->change();
                $table->string('income_salary_6')->nullable()->change();
                $table->string('other_income_7')->nullable()->change();
                $table->string('gross_total_salary')->nullable()->change();
                $table->string('deduction_80c')->nullable()->change();
                $table->string('home_loan_principal')->nullable()->change();
                $table->string('note_1_aggregate')->nullable()->change();
                $table->string('section_80c01')->nullable()->change();
                $table->string('section_80d')->nullable()->change();
                $table->string('aggregate_deductible_10')->nullable()->change();
                $table->string('total_income')->nullable()->change();
                $table->string('tax_on_total_income')->nullable()->change();
                $table->string('education_cess')->nullable()->change();
                $table->string('tax_payable_14')->nullable()->change();
                $table->string('relief_89')->nullable()->change();
                $table->string('tax_payable_16')->nullable()->change();

                $table->string('joining_date')->nullable()->change();
                $table->string('period')->nullable()->change();
                $table->string('pan_no')->nullable()->change();
                $table->string('aadhar_no')->nullable()->change();
                $table->string('verification_relation_title')->nullable()->change();
                $table->string('verification_relation_name')->nullable()->change();
                $table->string('verification_designation')->nullable()->change();
                $table->string('signatory_place')->nullable()->change();
                $table->string('signatory_name')->nullable()->change();
                $table->string('signatory_designation')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
