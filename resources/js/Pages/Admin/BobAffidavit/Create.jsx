import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BobAffidavitFields from './Form';

export default function Create({ coinCost = 149 }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        father_name: '',
        gender: 'Male',
        age: '',
        dob: '',
        mobile: '',
        aadhar: '',
        pan_no: '',
        village: '',
        tehsil: '',
        district: '',
        state: 'Haryana',
        pincode: '',
        account_no: '',
        cif_no: '',
        branch_name: '',
        ifsc_code: 'BARB0',
        affidavit_type: 'name_correction',
        reason: 'There is a minor spelling discrepancy in my name in Bank of Baroda account records compared to my Aadhaar Card / PAN Card. Both names belong to me, and I request the bank to correct it.',
        notes: '',
    });

    const submit = (e, saveAndCreate = false) => {
        post(saveAndCreate ? '/admin/bob-affidavit?save_and_create=1' : '/admin/bob-affidavit');
    };

    return (
        <AdminLayout>
            <Head title="Create Bank of Baroda (BOB) Affidavit" />

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton component={Link} href="/admin/bob-affidavit" sx={{ mr: 1.5 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h5" fontWeight="bold" color="text.primary">
                            Create BOB Affidavit
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Generate official Bank of Baroda declaration for customer KYC &amp; account services
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#eff6ff', px: 2, py: 0.75, borderRadius: 2, border: '1px solid #bfdbfe' }}>
                    <span className="material-symbols-outlined text-blue-600 text-sm">monetization_on</span>
                    <Typography variant="caption" fontWeight="bold" color="#1e40af">
                        Cost: {coinCost} Coins
                    </Typography>
                </Box>
            </Box>

            <BobAffidavitFields 
                data={data} 
                setData={setData} 
                errors={errors} 
                processing={processing} 
                onSubmit={submit} 
                submitLabel="Save &amp; Generate Affidavit" 
                showSaveAndCreate={true} 
            />
        </AdminLayout>
    );
}
