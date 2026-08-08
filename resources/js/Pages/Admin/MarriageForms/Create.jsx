import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MarriageFormFields from './Form';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        marriage_date: '',
        marriage_venue: '',
        district: '',
        religion: 'Hindu',
        nationality: 'Indian',
        groom_affidavit_by: 'father',
        groom_name: '',
        groom_father_name: '',
        groom_father_father_name: '',
        groom_mother_name: '',
        groom_dob: '',
        groom_age: '',
        groom_address: '',
        groom_father_address: '',
        bride_affidavit_by: 'father',
        bride_name: '',
        bride_father_name: '',
        bride_father_father_name: '',
        bride_mother_name: '',
        bride_dob: '',
        bride_age: '',
        bride_address: '',
        bride_father_address: '',
        groom_witness_name: '',
        groom_witness_father_name: '',
        groom_witness_address: '',
        bride_witness_name: '',
        bride_witness_father_name: '',
        bride_witness_address: '',
        pandit_name: '',
        pandit_father_name: '',
        pandit_address: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/marriage-forms');
    };

    return (
        <AdminLayout>
            <Head title="Create Marriage Form" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/marriage-forms" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Create Marriage Form
                </Typography>
            </Box>

            <MarriageFormFields
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Save Marriage Form"
            />
        </AdminLayout>
    );
}
