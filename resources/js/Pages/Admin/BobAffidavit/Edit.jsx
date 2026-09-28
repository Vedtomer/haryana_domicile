import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BobAffidavitFields from './Form';

export default function Edit({ record }) {
    const { data, setData, put, processing, errors } = useForm({
        name: record.name || '',
        father_name: record.father_name || '',
        gender: record.gender || 'Male',
        age: record.age || '',
        dob: record.dob ? record.dob.substring(0, 10) : '',
        mobile: record.mobile || '',
        aadhar: record.aadhar || '',
        pan_no: record.pan_no || '',
        village: record.village || '',
        tehsil: record.tehsil || '',
        district: record.district || '',
        state: record.state || 'Haryana',
        pincode: record.pincode || '',
        account_no: record.account_no || '',
        cif_no: record.cif_no || '',
        branch_name: record.branch_name || '',
        ifsc_code: record.ifsc_code || 'BARB0',
        affidavit_type: record.affidavit_type || 'name_correction',
        reason: record.reason || '',
        notes: record.notes || '',
    });

    const submit = (e) => {
        put(`/admin/bob-affidavit/${record.id}`);
    };

    return (
        <AdminLayout>
            <Head title={`Edit BOB Affidavit #${record.id}`} />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/bob-affidavit" sx={{ mr: 1.5 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                        Edit BOB Affidavit Record
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Update customer and Bank of Baroda account details for affidavit #{record.id}
                    </Typography>
                </Box>
            </Box>

            <BobAffidavitFields 
                data={data} 
                setData={setData} 
                errors={errors} 
                processing={processing} 
                onSubmit={submit} 
                submitLabel="Update Affidavit Record" 
                showSaveAndCreate={false} 
            />
        </AdminLayout>
    );
}
