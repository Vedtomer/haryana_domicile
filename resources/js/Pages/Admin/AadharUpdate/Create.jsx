import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AadharUpdateFields from './Form';

export default function Create({ coinCost = 9 }) {
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors } = useForm({
        date: today,
        resident_status: 'Resident',
        request_type: 'Update Request',
        aadhar_number: '',
        name: '',
        c_o: '',
        house_no: '',
        street: '',
        landmark: '',
        locality: '',
        village_town: '',
        post_office: '',
        district: '',
        state: 'Haryana',
        pin_code: '',
        certifier_name: '',
        certifier_designation: '',
        certifier_address: '',
        certifier_address2: '',
        certifier_contact: '',
        certifier_category: 'Village Panchayat Head',
    });

    const submit = (e, saveAndCreate = false) => {
        post(saveAndCreate ? '/admin/aadhar-update?save_and_create=1' : '/admin/aadhar-update');
    };

    return (
        <AdminLayout>
            <Head title="Create Aadhar Card Form" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton component={Link} href="/admin/aadhar-update" sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                        Create Aadhar Card Form
                    </Typography>
                </Box>

                <Chip
                    icon={<MonetizationOnIcon />}
                    label={`Fee: ${coinCost} Coins (₹${coinCost})`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 'bold', fontSize: '0.9rem', py: 2 }}
                />
            </Box>

            <AadharUpdateFields
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Save & Ready File"
                showSaveAndCreate={true}
            />
        </AdminLayout>
    );
}
