<?php

namespace App\Models;

use App\Models\Concerns\OwnedByUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalarySlip extends Model
{
    use HasFactory, OwnedByUser;

    protected $fillable = [
        'user_id',
        'employer_name',
        'employer_address',
        'joining_date',
        'period',
        'employee_name',
        'employee_address',
        'pan_no',
        'aadhar_no',
        'gross_salary',
        'total_d',
        'hra_exemption',
        'leave_salary_exemption',
        'balance_3',
        'entertainment_allowance',
        'tax_on_employment',
        'aggregate_5',
        'income_salary_6',
        'other_income_7',
        'gross_total_salary',
        'deduction_80c',
        'home_loan_principal',
        'note_1_aggregate',
        'section_80c01',
        'section_80d',
        'aggregate_deductible_10',
        'total_income',
        'tax_on_total_income',
        'education_cess',
        'tax_payable_14',
        'relief_89',
        'tax_payable_16',
        'verification_name',
        'verification_relation_title',
        'verification_relation_name',
        'verification_designation',
        'signatory_place',
        'signatory_name',
        'signatory_designation',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
