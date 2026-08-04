import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BirthRecordFields from './Form';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        district: '',
        father_name: '',
        mother_name: '',
        permanent_address: '',
        issuing_authority: '',
        record_year: '',
        registration_no: '',
        date_of_registration: '',
        record_father_name: '',
        record_mother_name: '',
        child_name: '',
        gender: 'Male',
        dob: '',
        address_parents_birth: '',
        school_child_name: '',
        school_dob: '',
        school_father_name: '',
        school_mother_name: '',
        other_children: [],
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/birth-records');
    };

    return (
        <AdminLayout>
            <Head title="Create Birth Record" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/birth-records" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Add Child Name to Birth Record
                </Typography>
            </Box>

            <BirthRecordFields data={data} setData={setData} errors={errors} processing={processing} onSubmit={submit} submitLabel="Save Birth Record" />
        </AdminLayout>
    );
}
