<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SalarySlip;
use App\Notifications\SystemAlert;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalarySlipController extends Controller
{
    public function index()
    {
        $records = SalarySlip::query()
            ->visibleTo(auth()->user())
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/SalarySlip/Index', [
            'records' => $records,
        ]);
    }

    public function create()
    {
        $service = $this->moduleService('salary_slip');
        if ($error = $this->serviceBlocker($service)) {
            return redirect()->route('dashboard')->with('error', $error);
        }

        return Inertia::render('Admin/SalarySlip/Create', [
            'coinCost' => $service?->coin_cost ?? 99,
        ]);
    }

    public function store(Request $request)
    {
        $service = $this->moduleService('salary_slip');

        if ($error = $this->serviceBlocker($service)) {
            return back()->withInput()->with('error', $error);
        }

        try {
            $data = $this->validated($request);
            $data['user_id'] = auth()->id();

            // Fill breakdown defaults if empty
            $breakdownDefaults = [
                'gross_salary' => '48500.00',
                'total_d' => '6500.00',
                'hra_exemption' => '0.00',
                'leave_salary_exemption' => '0.00',
                'balance_3' => '0.00',
                'entertainment_allowance' => '0.00',
                'tax_on_employment' => '0.00',
                'aggregate_5' => '0.00',
                'income_salary_6' => '0.00',
                'other_income_7' => '',
                'gross_total_salary' => '55000.00',
                'deduction_80c' => '0.00',
                'home_loan_principal' => '0.00',
                'note_1_aggregate' => '0.00',
                'section_80c01' => '0.00',
                'section_80d' => '0.00',
                'aggregate_deductible_10' => '0.00',
                'total_income' => '55000.00',
                'tax_on_total_income' => '0.00',
                'education_cess' => '0.00',
                'tax_payable_14' => '0.00',
                'relief_89' => '0.00',
                'tax_payable_16' => '0.00',
            ];
            foreach ($breakdownDefaults as $k => $def) {
                if (!isset($data[$k]) || $data[$k] === null || $data[$k] === '') {
                    $data[$k] = $def;
                }
            }

            $record = SalarySlip::create($data);

            $this->chargeForService($service, $record->id, "Salary Slip #{$record->id}");

            try {
                SystemAlert::toAdmins(
                    'New Salary Slip Created',
                    auth()->user()->name . " created a Salary Slip (#{$record->id}) for {$record->employee_name}.",
                    '/admin/salary-slip'
                );
            } catch (\Throwable $ne) {
                \Illuminate\Support\Facades\Log::warning("Notification alert warning: " . $ne->getMessage());
            }

            if ($request->boolean('save_and_create')) {
                return redirect()->route('admin.salary-slip.create')
                    ->with('success', 'Salary Slip created successfully.' . $this->chargeNote($service));
            }

            return redirect()->route('admin.salary-slip.index')
                ->with('success', 'Salary Slip created successfully. File is ready to print!' . $this->chargeNote($service))
                ->with('print_id', $record->id);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Salary Slip Creation Error: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Error creating Salary Slip: ' . $e->getMessage());
        }
    }

    public function edit(SalarySlip $salarySlip)
    {
        $this->authorizeOwner($salarySlip);

        return Inertia::render('Admin/SalarySlip/Edit', [
            'record' => $salarySlip,
        ]);
    }

    public function update(Request $request, SalarySlip $salarySlip)
    {
        $this->authorizeOwner($salarySlip);

        $salarySlip->update($this->validated($request));

        return redirect()->route('admin.salary-slip.index')
            ->with('success', 'Salary Slip updated successfully.')
            ->with('print_id', $salarySlip->id);
    }

    public function destroy(SalarySlip $salarySlip)
    {
        $this->authorizeOwner($salarySlip);

        $salarySlip->delete();

        return redirect()->route('admin.salary-slip.index')
            ->with('success', 'Salary Slip record deleted successfully.');
    }

    public function print(SalarySlip $salarySlip)
    {
        $this->authorizeOwner($salarySlip);

        return Inertia::render('Admin/SalarySlip/Print', [
            'record' => $salarySlip,
        ]);
    }

    /**
     * Anti-Download endpoint: Any direct file download returns a completely solid black page.
     */
    public function download(SalarySlip $salarySlip)
    {
        $this->authorizeOwner($salarySlip);

        $pdf = Pdf::loadView('pdf.black_salary_slip');
        $pdf->setPaper('A4', 'portrait');

        $cleanName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $salarySlip->employee_name);
        $filename = 'Salary_Slip_' . ($cleanName ?: $salarySlip->id) . '.pdf';

        return $pdf->download($filename);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            // Employer
            'employer_name' => 'required|string|max:255',
            'employer_address' => 'required|string|max:1000',
            'joining_date' => 'required|string|max:100',
            'period' => 'required|string|max:100',

            // Employee
            'employee_name' => 'required|string|max:255',
            'employee_address' => 'required|string|max:1000',
            'pan_no' => 'required|string|max:50',
            'aadhar_no' => 'required|string|max:50',

            // Figures (All nullable with smart defaults)
            'gross_salary' => 'nullable|string|max:50',
            'total_d' => 'nullable|string|max:50',
            'hra_exemption' => 'nullable|string|max:50',
            'leave_salary_exemption' => 'nullable|string|max:50',
            'balance_3' => 'nullable|string|max:50',
            'entertainment_allowance' => 'nullable|string|max:50',
            'tax_on_employment' => 'nullable|string|max:50',
            'aggregate_5' => 'nullable|string|max:50',
            'income_salary_6' => 'nullable|string|max:50',
            'other_income_7' => 'nullable|string|max:50',
            'gross_total_salary' => 'nullable|string|max:50',
            'deduction_80c' => 'nullable|string|max:50',
            'home_loan_principal' => 'nullable|string|max:50',
            'note_1_aggregate' => 'nullable|string|max:50',
            'section_80c01' => 'nullable|string|max:50',
            'section_80d' => 'nullable|string|max:50',
            'aggregate_deductible_10' => 'nullable|string|max:50',
            'total_income' => 'nullable|string|max:50',
            'tax_on_total_income' => 'nullable|string|max:50',
            'education_cess' => 'nullable|string|max:50',
            'tax_payable_14' => 'nullable|string|max:50',
            'relief_89' => 'nullable|string|max:50',
            'tax_payable_16' => 'nullable|string|max:50',

            // Verification
            'verification_name' => 'required|string|max:255',
            'verification_relation_title' => 'required|string|max:100',
            'verification_relation_name' => 'required|string|max:255',
            'verification_designation' => 'required|string|max:255',

            // Signatory
            'signatory_place' => 'required|string|max:100',
            'signatory_name' => 'required|string|max:255',
            'signatory_designation' => 'required|string|max:255',
        ]);
    }
}
