import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HaryanaDomicileFields from './Form';

export default function Edit({ record }) {
    const { data, setData, put, processing, errors } = useForm({
        pincode: record.pincode ?? '',
        tehsil: record.tehsil ?? '',
        district: record.district ?? '',
        name: record.name ?? '',
        father_name: record.father_name ?? '',
        village: record.village ?? '',
        ward_no: record.ward_no ?? '',
        age: record.age ?? '',
        mobile: record.mobile ?? '',
        aadhar: record.aadhar ?? '',
        ration_card_no: record.ration_card_no ?? '',
        caste: record.caste ?? '',
        religion: record.religion ?? '',
        child_name: record.child_name ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/haryana-domicile/${record.id}`);
    };

    return (
        <AdminLayout>
            <Head title="Edit Haryana Domicile Form" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/haryana-domicile" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Edit Haryana Domicile Record
                </Typography>
            </Box>

            <HaryanaDomicileFields data={data} setData={setData} errors={errors} processing={processing} onSubmit={submit} submitLabel="Update Domicile Record" />
        </AdminLayout>
    );
}
