import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TenthPassbookFields from './Form';

export default function Edit({ record }) {
    const { data, setData, post, processing, errors } = useForm({
        name: record.name || '',
        father_name: record.father_name || '',
        mother_name: record.mother_name || '',
        dob: record.dob || '',
        image: null,
    });

    const submit = (e, saveAndCreate = false) => {
        post(`/admin/tenth-passbook/${record.id}?_method=PUT`, {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout>
            <Head title="Edit 10th Passbook" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/tenth-passbook" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Edit 10th Passbook Record
                </Typography>
            </Box>

            <TenthPassbookFields 
                data={data} 
                setData={setData} 
                errors={errors} 
                processing={processing} 
                onSubmit={submit} 
                submitLabel="Update Passbook Record" 
                isEdit={true}
                currentImagePath={record.image_path}
            />
        </AdminLayout>
    );
}
