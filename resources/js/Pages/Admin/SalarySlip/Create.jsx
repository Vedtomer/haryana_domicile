import React from 'react';
import { useForm, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import SalarySlipForm from './Form';
import { Box, Typography, Breadcrumbs, IconButton, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Create({ coinCost = 99 }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        // Employer
        employer_name: 'SUNIL MERCHANDISING',
        employer_address: '#03, SWASTIK COMPLEX,\nMOHIT PUB. SCHOOL,\nBABAIL ROAD, PANIPAT',
        joining_date: 'AUGUST 2022',
        period: 'FEBRUARY 2026',

        // Employee
        employee_name: 'MR. GURINDER SINGH',
        employee_address: 'SAS NAGAR, KURLI\nMOHALI, PUNJAB',
        pan_no: 'FZNPS0647Q',
        aadhar_no: '4473 1131 0719',

        // Breakdown figures
        gross_salary: '48500.00',
        total_d: '6500.00',
        hra_exemption: '0.00',
        leave_salary_exemption: '0.00',
        balance_3: '0.00',
        entertainment_allowance: '0.00',
        tax_on_employment: '0.00',
        aggregate_5: '0.00',
        income_salary_6: '0.00',
        other_income_7: '',
        gross_total_salary: '55000.00',
        deduction_80c: '0.00',
        home_loan_principal: '0.00',
        note_1_aggregate: '0.00',
        section_80c01: '0.00',
        section_80d: '0.00',
        aggregate_deductible_10: '0.00',
        total_income: '55000.00',
        tax_on_total_income: '0.00',
        education_cess: '0.00',
        tax_payable_14: '0.00',
        relief_89: '0.00',
        tax_payable_16: '0.00',

        // Verification
        verification_name: 'GURINDER SINGH',
        verification_relation_title: 'wife/son/daughter of',
        verification_relation_name: 'MR. NASIB SINGH',
        verification_designation: 'BUSINESS DEVELOPMENT MANAGER (REMOTLY)',

        // Signatory
        signatory_place: 'PANIPAT',
        signatory_name: 'SUNIL KUMAR',
        signatory_designation: 'DIRECTOR',
    });

    const handleSubmit = (e, isSaveAndCreate) => {
        post(isSaveAndCreate ? '/admin/salary-slip?save_and_create=1' : '/admin/salary-slip');
    };

    return (
        <AdminLayout>
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                    <Link href="/admin/salary-slip" className="text-slate-500 hover:text-slate-700 text-sm">
                        Salary Slip Records
                    </Link>
                    <Typography color="text.primary" variant="body2" fontWeight="bold">
                        Create Salary Slip
                    </Typography>
                </Breadcrumbs>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton component={Link} href="/admin/salary-slip" sx={{ mr: 2, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <div>
                        <Typography variant="h5" fontWeight="bold" color="text.primary">
                            Create Salary Slip
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Fill in the required bold fields to generate an authentic Salary Slip ({coinCost} coins).
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
                submitLabel="Save & Generate Salary Slip"
                showSaveAndCreate={true}
                coinCost={coinCost}
            />
        </AdminLayout>
    );
}
