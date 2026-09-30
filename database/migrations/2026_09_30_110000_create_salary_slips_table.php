<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('salary_slips')) {
            Schema::create('salary_slips', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();

                // Employer Details
                $table->string('employer_name')->default('SUNIL MERCHANDISING');
                $table->text('employer_address');
                $table->string('joining_date')->default('AUGUST 2022');
                $table->string('period')->default('FEBRUARY 2026');

                // Employee Details
                $table->string('employee_name')->default('MR. GURINDER SINGH');
                $table->text('employee_address');
                $table->string('pan_no')->default('FZNPS0647Q');
                $table->string('aadhar_no')->default('4473 1131 0719');

                // Salary & Pay Breakdown Figures
                $table->string('gross_salary')->default('48500.00');
                $table->string('total_d')->default('6500.00');
                $table->string('hra_exemption')->default('0.00');
                $table->string('leave_salary_exemption')->default('0.00');
                $table->string('balance_3')->default('0.00');
                $table->string('entertainment_allowance')->default('0.00');
                $table->string('tax_on_employment')->default('0.00');
                $table->string('aggregate_5')->default('0.00');
                $table->string('income_salary_6')->default('0.00');
                $table->string('other_income_7')->nullable()->default('');
                $table->string('gross_total_salary')->default('55000.00');
                $table->string('deduction_80c')->default('0.00');
                $table->string('home_loan_principal')->default('0.00');
                $table->string('note_1_aggregate')->default('0.00');
                $table->string('section_80c01')->default('0.00');
                $table->string('section_80d')->default('0.00');
                $table->string('aggregate_deductible_10')->default('0.00');
                $table->string('total_income')->default('55000.00');
                $table->string('tax_on_total_income')->default('0.00');
                $table->string('education_cess')->default('0.00');
                $table->string('tax_payable_14')->default('0.00');
                $table->string('relief_89')->default('0.00');
                $table->string('tax_payable_16')->default('0.00');

                // Verification Details
                $table->string('verification_name')->default('GURINDER SINGH');
                $table->string('verification_relation_title')->default('wife/son/daughter of');
                $table->string('verification_relation_name')->default('MR. NASIB SINGH');
                $table->string('verification_designation')->default('BUSINESS DEVELOPMENT MANAGER (REMOTLY)');

                // Signatory Details
                $table->string('signatory_place')->default('PANIPAT');
                $table->string('signatory_name')->default('SUNIL KUMAR');
                $table->string('signatory_designation')->default('DIRECTOR');

                $table->timestamps();
            });
        }

        // Configure Service in services table
        $allUserIds = DB::table('users')->pluck('id')->toArray();

        $service = DB::table('services')->where('slug', 'salary-slip')->first();
        if ($service) {
            DB::table('services')->where('id', $service->id)->update([
                'name' => 'Salary Slip',
                'description' => 'Official Salary Slip Generator - Create, edit and print authentic Salary Slips.',
                'icon' => '💼',
                'coin_cost' => 99,
                'kind' => 'module',
                'module_key' => 'salary_slip',
                'fields' => null,
                'is_active' => true,
                'visibility' => 'public',
                'updated_at' => now(),
            ]);
            $serviceId = $service->id;
        } else {
            $serviceId = DB::table('services')->insertGetId([
                'name' => 'Salary Slip',
                'slug' => 'salary-slip',
                'description' => 'Official Salary Slip Generator - Create, edit and print authentic Salary Slips.',
                'icon' => '💼',
                'coin_cost' => 99,
                'kind' => 'module',
                'module_key' => 'salary_slip',
                'fields' => null,
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Attach to all users
        if ($serviceId) {
            foreach ($allUserIds as $uId) {
                DB::table('service_user')->updateOrInsert(
                    ['service_id' => $serviceId, 'user_id' => $uId],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_slips');
    }
};
