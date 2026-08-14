import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MarriageAffidavitFields from './Form';

export default function Edit({ affidavit }) {
    const { data, setData, put, processing, errors } = useForm({
        marriage_date: affidavit.marriage_date ?? '',
        marriage_venue: affidavit.marriage_venue ?? '',
        religion: affidavit.religion ?? '',
        groom_name: affidavit.groom_name ?? '',
        groom_father_name: affidavit.groom_father_name ?? '',
        groom_dob: affidavit.groom_dob ?? '',
        groom_age: affidavit.groom_age ?? '',
        groom_address: affidavit.groom_address ?? '',
        bride_name: affidavit.bride_name ?? '',
        bride_father_name: affidavit.bride_father_name ?? '',
        bride_dob: affidavit.bride_dob ?? '',
        bride_age: affidavit.bride_age ?? '',
        bride_address: affidavit.bride_address ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/marriage-affidavits/${affidavit.id}`);
    };

    return (
        <AdminLayout>
            <Head title="Edit Marriage Affidavit" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/marriage-affidavits" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Edit Marriage Affidavit
                </Typography>
            </Box>

            <MarriageAffidavitFields
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Update Marriage Affidavit"
            />
        </AdminLayout>
    );
}
