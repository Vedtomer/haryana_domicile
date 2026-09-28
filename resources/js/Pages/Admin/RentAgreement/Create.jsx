import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RentAgreementForm from './Form';

export default function Create({ coinCost = 149 }) {
    // Current date formatted DD/MM/YYYY
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayFormatted = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`;

    // End date + 11 months - 1 day
    const nextYear = new Date(today);
    nextYear.setMonth(nextYear.getMonth() + 11);
    nextYear.setDate(nextYear.getDate() - 1);
    const endFormatted = `${pad(nextYear.getDate())}/${pad(nextYear.getMonth() + 1)}/${nextYear.getFullYear()}`;

    const { data, setData, post, processing, errors } = useForm({
        first_party_name: '',
        first_party_aadhar: '',
        first_party_father_name: '',
        first_party_address: '',
        second_party_name: '',
        second_party_aadhar: '',
        second_party_father_name: '',
        second_party_address: '',
        property_owner_title: 'Warehouse Owner',
        property_type: 'warehouse',
        property_area: '80 square yards',
        property_location: 'situated on Barsat Road, near Barsat Road Chungi',
        property_city: 'Panipat',
        tenancy_months: 11,
        from_date: todayFormatted,
        to_date: endFormatted,
        monthly_rent: '20,000',
        monthly_rent_words: 'Rupees Twenty Thousand only',
        agreement_date: todayFormatted,
    });

    const submit = (e, saveAndCreate = false) => {
        post(saveAndCreate ? '/admin/rent-agreement?save_and_create=1' : '/admin/rent-agreement');
    };

    return (
        <AdminLayout>
            <Head title="Create Rent Agreement" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/rent-agreement" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                        Create New Rent Agreement
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Fill in only the bold fields from the agreement. The ready-to-print 2-page document with stamps will be generated instantly.
                    </Typography>
                </Box>
            </Box>

            <RentAgreementForm
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Save & Ready Agreement"
                showSaveAndCreate={true}
                coinCost={coinCost}
            />
        </AdminLayout>
    );
}
