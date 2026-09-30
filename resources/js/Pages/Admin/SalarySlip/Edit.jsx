import React from 'react';
import { useForm, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import SalarySlipForm from './Form';
import { Box, Typography, Breadcrumbs, IconButton, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Edit({ record }) {
    const { flash } = usePage().props;
    const { data, setData, put, processing, errors } = useForm({
        employer_name: record.employer_name || '',
        employer_address: record.employer_address || '',
        joining_date: record.joining_date || '',
        period: record.period || '',

        employee_name: record.employee_name || '',
        employee_address: record.employee_address || '',
        pan_no: record.pan_no || '',
        aadhar_no: record.aadhar_no || '',

        gross_salary: record.gross_salary || '0.00',
        total_d: record.total_d || '0.00',
        hra_exemption: record.hra_exemption || '0.00',
        leave_salary_exemption: record.leave_salary_exemption || '0.00',
        balance_3: record.balance_3 || '0.00',
        entertainment_allowance: record.entertainment_allowance || '0.00',
        tax_on_employment: record.tax_on_employment || '0.00',
        aggregate_5: record.aggregate_5 || '0.00',
        income_salary_6: record.income_salary_6 || '0.00',
        other_income_7: record.other_income_7 || '',
        gross_total_salary: record.gross_total_salary || '0.00',
        deduction_80c: record.deduction_80c || '0.00',
        home_loan_principal: record.home_loan_principal || '0.00',
        note_1_aggregate: record.note_1_aggregate || '0.00',
        section_80c01: record.section_80c01 || '0.00',
        section_80d: record.section_80d || '0.00',
        aggregate_deductible_10: record.aggregate_deductible_10 || '0.00',
        total_income: record.total_income || '0.00',
        tax_on_total_income: record.tax_on_total_income || '0.00',
        education_cess: record.education_cess || '0.00',
        tax_payable_14: record.tax_payable_14 || '0.00',
        relief_89: record.relief_89 || '0.00',
        tax_payable_16: record.tax_payable_16 || '0.00',

        verification_name: record.verification_name || '',
        verification_relation_title: record.verification_relation_title || 'wife/son/daughter of',
        verification_relation_name: record.verification_relation_name || '',
        verification_designation: record.verification_designation || '',

        signatory_place: record.signatory_place || '',
        signatory_name: record.signatory_name || '',
        signatory_designation: record.signatory_designation || '',
    });

    const handleSubmit = (e) => {
        put(`/admin/salary-slip/${record.id}`);
    };

    return (
        <AdminLayout>
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                    <Link href="/admin/salary-slip" className="text-slate-500 hover:text-slate-700 text-sm">
                        Salary Slip Records
                    </Link>
                    <Typography color="text.primary" variant="body2" fontWeight="bold">
                        Edit Salary Slip #{record.id}
                    </Typography>
                </Breadcrumbs>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton component={Link} href="/admin/salary-slip" sx={{ mr: 2, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <div>
                        <Typography variant="h5" fontWeight="bold" color="text.primary">
                            Edit Salary Slip #{record.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Modify any details of this Salary Slip. No coins are charged for edits.
                        </Typography>
                    </div>
                </Box>
            </Box>

            {flash?.error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {flash.error}
                </Alert>
            )}

            <SalarySlipForm
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleSubmit}
                submitLabel="Update Salary Slip"
                showSaveAndCreate={false}
                coinCost={0}
            />
        </AdminLayout>
    );
}
