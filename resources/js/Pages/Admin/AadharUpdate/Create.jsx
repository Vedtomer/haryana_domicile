import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AadharUpdateFields from './Form';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
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
        state: '',
        pin_code: '',
        certifier_name: '',
        certifier_designation: '',
        certifier_address: '',
        certifier_contact: '',
    });

    const submit = (e, saveAndCreate = false) => {
        post(saveAndCreate ? '/admin/aadhar-update?save_and_create=1' : '/admin/aadhar-update');
    };

    return (
        <AdminLayout>
            <Head title="Create Aadhar Update Form" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/aadhar-update" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Create Aadhar Update Request
                </Typography>
            </Box>

            <AadharUpdateFields data={data} setData={setData} errors={errors} processing={processing} onSubmit={submit} submitLabel="Save Aadhar Request" showSaveAndCreate={true} />
        </AdminLayout>
    );
}
