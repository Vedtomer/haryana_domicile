import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MarriageAffidavitFields from './Form';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        marriage_date: '',
        marriage_venue: '',
        religion: 'Hindu',
        groom_name: '',
        groom_father_name: '',
        groom_dob: '',
        groom_age: '',
        groom_address: '',
        bride_name: '',
        bride_father_name: '',
        bride_dob: '',
        bride_age: '',
        bride_address: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/marriage-affidavits');
    };

    return (
        <AdminLayout>
            <Head title="Create Marriage Affidavit" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/marriage-affidavits" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Create Marriage Affidavit
                </Typography>
            </Box>

            <MarriageAffidavitFields
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Save Marriage Affidavit"
            />
        </AdminLayout>
    );
}
