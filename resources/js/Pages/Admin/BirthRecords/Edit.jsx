import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BirthRecordFields from './Form';

export default function Edit({ record }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        district: record.district ?? '',
        father_name: record.father_name ?? '',
        mother_name: record.mother_name ?? '',
        permanent_address: record.permanent_address ?? '',
        issuing_authority: record.issuing_authority ?? '',
        record_year: record.record_year ?? '',
        registration_no: record.registration_no ?? '',
        date_of_registration: record.date_of_registration?.slice(0, 10) ?? '',
        record_father_name: record.record_father_name ?? '',
        record_mother_name: record.record_mother_name ?? '',
        child_name: record.child_name ?? '',
        gender: record.gender ?? 'Male',
        dob: record.dob?.slice(0, 10) ?? '',
        address_parents_birth: record.address_parents_birth ?? '',
        school_child_name: record.school_child_name ?? '',
        school_dob: record.school_dob?.slice(0, 10) ?? '',
        school_father_name: record.school_father_name ?? '',
        school_mother_name: record.school_mother_name ?? '',
        other_children: record.other_children ?? [],
        father_signature: null,
        mother_signature: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/admin/birth-records/${record.id}`);
    };

    return (
        <AdminLayout>
            <Head title="Edit Birth Record" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/birth-records" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Edit Birth Record
                </Typography>
            </Box>

            <BirthRecordFields data={data} setData={setData} errors={errors} processing={processing} onSubmit={submit} submitLabel="Update Birth Record" />
        </AdminLayout>
    );
}
