import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AirtelPassbookFields from './Form';

export default function Edit({ record }) {
    const { data, setData, put, processing, errors } = useForm({
        reference_number: record.reference_number || '',
        uid_number: record.uid_number || '',
        account_number: record.account_number || '',
        ifsc_code: record.ifsc_code || '',
        first_name: record.first_name || '',
        last_name: record.last_name || '',
        address: record.address || '',
        nominee_name: record.nominee_name || '',
        nominee_relation: record.nominee_relation || '',
        city: record.city || '',
        gender: record.gender || '',
        mobile_number: record.mobile_number || '',
        pin_code: record.pin_code || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/airtel-passbook/${record.id}`);
    };

    return (
        <AdminLayout>
            <Head title={`Edit Airtel Passbook #${record.id}`} />
            
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/airtel-passbook" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Edit Airtel Passbook #{record.id}
                </Typography>
            </Box>

            <AirtelPassbookFields 
                data={data} 
                setData={setData} 
                errors={errors} 
                processing={processing} 
                onSubmit={submit} 
                submitLabel="Update Passbook" 
            />
        </AdminLayout>
    );
}
