import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HaryanaDomicileFields from './Form';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        pincode: '',
        tehsil: '',
        district: '',
        name: '',
        father_name: '',
        village: '',
        ward_no: '',
        age: '',
        mobile: '',
        aadhar: '',
        ration_card_no: '',
        caste: '',
        religion: '',
        child_name: '',
    });

    const submit = (e, saveAndCreate = false) => {
        post(saveAndCreate ? '/admin/haryana-domicile?save_and_create=1' : '/admin/haryana-domicile');
    };

    return (
        <AdminLayout>
            <Head title="Create Haryana Domicile Form" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/haryana-domicile" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Create Haryana Domicile Record
                </Typography>
            </Box>

            <HaryanaDomicileFields data={data} setData={setData} errors={errors} processing={processing} onSubmit={submit} submitLabel="Save Domicile Record" showSaveAndCreate={true} />
        </AdminLayout>
    );
}
