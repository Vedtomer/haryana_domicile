import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AadharUpdateFields from './Form';

export default function Edit({ record }) {
    const { data, setData, put, processing, errors } = useForm({
        aadhar_number: record.aadhar_number || '',
        name: record.name || '',
        c_o: record.c_o || '',
        house_no: record.house_no || '',
        street: record.street || '',
        landmark: record.landmark || '',
        locality: record.locality || '',
        village_town: record.village_town || '',
        post_office: record.post_office || '',
        district: record.district || '',
        state: record.state || '',
        pin_code: record.pin_code || '',
        dob: record.dob || '',
        certifier_name: record.certifier_name || '',
        certifier_designation: record.certifier_designation || '',
        certifier_address: record.certifier_address || '',
        certifier_contact: record.certifier_contact || '',
    });

    const submit = (e) => {
        put(`/admin/aadhar-update/${record.id}`);
    };

    return (
        <AdminLayout>
            <Head title="Edit Aadhar Update Form" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/aadhar-update" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Edit Aadhar Update Request
                </Typography>
            </Box>

            <AadharUpdateFields data={data} setData={setData} errors={errors} processing={processing} onSubmit={submit} submitLabel="Update Record" showSaveAndCreate={false} />
        </AdminLayout>
    );
}
