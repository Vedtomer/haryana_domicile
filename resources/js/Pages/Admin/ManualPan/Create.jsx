import React, { useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Paper, Grid, Box, Button, Typography, Alert } from '@mui/material';
import AdminLayout from '../../../Layouts/AdminLayout';
import { InputField, SectionHeader } from '../../../Components/FormInputs';

export default function Create({ service }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        father_name: '',
        dob: '',
        pan_number: '',
        photo: null,
        signature: null,
    });

    useEffect(() => {
        if (flash?.download_url) {
            // Automatically trigger the download
            window.location.href = flash.download_url;
        }
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.manual-pan.generate'));
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        Generate Manual PAN Card
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Fill details and upload photo/signature to generate a print-ready PDF.
                    </p>
                </div>
            }
        >
            <Head title="Generate Manual PAN" />

            <div className="max-w-4xl mx-auto py-6">
                {flash?.success && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                        {flash.success} {flash.download_url && "Your download should start automatically."}
                    </Alert>
                )}
                {flash?.error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                        {flash.error}
                    </Alert>
                )}
                
                {service && (
                    <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
                        Cost for this service is <strong>{service.coin_cost} Coins</strong> per download.
                    </Alert>
                )}

                <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                    <form onSubmit={handleSubmit}>
                        <SectionHeader title="PAN Details" icon="badge" />
                        
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={6}>
                                <InputField
                                    label="Full Name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <InputField
                                    label="Father's Name"
                                    name="father_name"
                                    value={data.father_name}
                                    onChange={(e) => setData('father_name', e.target.value)}
                                    error={errors.father_name}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <InputField
                                    label="Date of Birth"
                                    name="dob"
                                    type="date"
                                    value={data.dob}
                                    onChange={(e) => setData('dob', e.target.value)}
                                    error={errors.dob}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <InputField
                                    label="PAN Number"
                                    name="pan_number"
                                    value={data.pan_number}
                                    onChange={(e) => setData('pan_number', e.target.value.toUpperCase())}
                                    error={errors.pan_number}
                                    required
                                    inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }}
                                />
                            </Grid>
                        </Grid>

                        <SectionHeader title="Images (Passport Photo & Signature)" icon="image" />
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>Passport Photo (JPG/PNG)</Typography>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        onChange={(e) => setData('photo', e.target.files[0])}
                                        style={{ width: '100%' }}
                                        required
                                    />
                                    {errors.photo && <Typography color="error" variant="caption">{errors.photo}</Typography>}
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>Signature (JPG/PNG)</Typography>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        onChange={(e) => setData('signature', e.target.files[0])}
                                        style={{ width: '100%' }}
                                        required
                                    />
                                    {errors.signature && <Typography color="error" variant="caption">{errors.signature}</Typography>}
                                </Box>
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={processing}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '1rem'
                                }}
                            >
                                {processing ? 'Generating PDF...' : 'Generate PAN Card'}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </div>
        </AdminLayout>
    );
}
