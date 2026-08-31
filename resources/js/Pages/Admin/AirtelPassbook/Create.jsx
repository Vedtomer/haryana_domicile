import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AirtelPassbookFields from './Form';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        reference_number: '',
        uid_number: '',
        account_number: '',
        ifsc_code: '',
        first_name: '',
        last_name: '',
        address: '',
        nominee_name: '',
        nominee_relation: '',
        city: '',
        gender: '',
        mobile_number: '',
        pin_code: '',
        save_and_create: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/airtel-passbook');
    };

    return (
        <AdminLayout>
            <Head title="Create Airtel Passbook" />
            
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/airtel-passbook" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Create Airtel Passbook Record
                </Typography>
            </Box>

            <AirtelPassbookFields 
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
