import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TenthPassbookFields from './Form';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        father_name: '',
        mother_name: '',
        dob: '',
        image: null,
    });

    const submit = (e, saveAndCreate = false) => {
        post(saveAndCreate ? '/admin/tenth-passbook?save_and_create=1' : '/admin/tenth-passbook', {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout>
            <Head title="Create 10th Passbook" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/tenth-passbook" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Create 10th Passbook Record
                </Typography>
            </Box>

            <TenthPassbookFields 
                data={data} 
                setData={setData} 
                errors={errors} 
                processing={processing} 
                onSubmit={submit} 
                submitLabel="Save Passbook Record" 
                showSaveAndCreate={true} 
            />
        </AdminLayout>
    );
}
