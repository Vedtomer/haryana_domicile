import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MarriageFormFields from './Form';

export default function Edit({ form }) {
    const { data, setData, put, processing, errors } = useForm({
        marriage_date: form.marriage_date ?? '',
        marriage_venue: form.marriage_venue ?? '',
        district: form.district ?? '',
        religion: form.religion ?? '',
        nationality: form.nationality ?? '',
        groom_affidavit_by: form.groom_affidavit_by ?? 'father',
        groom_name: form.groom_name ?? '',
        groom_father_name: form.groom_father_name ?? '',
        groom_father_father_name: form.groom_father_father_name ?? '',
        groom_mother_name: form.groom_mother_name ?? '',
        groom_dob: form.groom_dob ?? '',
        groom_age: form.groom_age ?? '',
        groom_address: form.groom_address ?? '',
        groom_father_address: form.groom_father_address ?? '',
        bride_affidavit_by: form.bride_affidavit_by ?? 'father',
        bride_name: form.bride_name ?? '',
        bride_father_name: form.bride_father_name ?? '',
        bride_father_father_name: form.bride_father_father_name ?? '',
        bride_mother_name: form.bride_mother_name ?? '',
        bride_dob: form.bride_dob ?? '',
        bride_age: form.bride_age ?? '',
        bride_address: form.bride_address ?? '',
        bride_father_address: form.bride_father_address ?? '',
        groom_witness_name: form.groom_witness_name ?? '',
        groom_witness_father_name: form.groom_witness_father_name ?? '',
        groom_witness_address: form.groom_witness_address ?? '',
        bride_witness_name: form.bride_witness_name ?? '',
        bride_witness_father_name: form.bride_witness_father_name ?? '',
        bride_witness_address: form.bride_witness_address ?? '',
        pandit_name: form.pandit_name ?? '',
        pandit_father_name: form.pandit_father_name ?? '',
        pandit_address: form.pandit_address ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/marriage-forms/${form.id}`);
    };

    return (
        <AdminLayout>
            <Head title="Edit Marriage Form" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/marriage-forms" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Edit Marriage Form
                </Typography>
            </Box>

            <MarriageFormFields
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Update Marriage Form"
            />
        </AdminLayout>
    );
}
