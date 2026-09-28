import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RentAgreementForm from './Form';

export default function Edit({ record }) {
    const { data, setData, put, processing, errors } = useForm({
        first_party_name: record.first_party_name || '',
        first_party_aadhar: record.first_party_aadhar || '',
        first_party_father_name: record.first_party_father_name || '',
        first_party_address: record.first_party_address || '',
        second_party_name: record.second_party_name || '',
        second_party_aadhar: record.second_party_aadhar || '',
        second_party_father_name: record.second_party_father_name || '',
        second_party_address: record.second_party_address || '',
        property_owner_title: record.property_owner_title || 'Warehouse Owner',
        property_type: record.property_type || 'warehouse',
        property_area: record.property_area || '80 square yards',
        property_location: record.property_location || '',
        property_city: record.property_city || 'Panipat',
        tenancy_months: record.tenancy_months || 11,
        from_date: record.from_date || '',
        to_date: record.to_date || '',
        monthly_rent: record.monthly_rent || '',
        monthly_rent_words: record.monthly_rent_words || '',
        agreement_date: record.agreement_date || '',
    });

    const submit = (e) => {
        put(`/admin/rent-agreement/${record.id}`);
    };

    return (
        <AdminLayout>
            <Head title={`Edit Rent Agreement #${record.id}`} />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/rent-agreement" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                        Edit Rent Agreement #{record.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Tenant: {record.first_party_name} | Landlord: {record.second_party_name}
                    </Typography>
                </Box>
            </Box>

            <RentAgreementForm
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Update Agreement"
                showSaveAndCreate={false}
            />
        </AdminLayout>
    );
}
