import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { 
    Button, 
    Paper, 
    Typography, 
    Grid, 
    Box, 
    IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { InputField, SectionHeader } from '../../../Components/FormInputs';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        marriage_date: '',
        marriage_venue: '',
        groom_name: '',
        groom_father_name: '',
        groom_age: '',
        groom_address: '',
        bride_name: '',
        bride_father_name: '',
        bride_age: '',
        bride_address: '',
        groom_witness_name: '',
        groom_witness_father_name: '',
        groom_witness_address: '',
        bride_witness_name: '',
        bride_witness_father_name: '',
        bride_witness_address: '',
        pandit_name: '',
        pandit_father_name: '',
        pandit_address: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/marriage-forms');
    };

    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    return (
        <AdminLayout>
            <Head title="Create Marriage Form" />
            
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton component={Link} href="/admin/marriage-forms" sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Create Marriage Form
                </Typography>
            </Box>

            <Paper component="form" onSubmit={submit} elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                
                {/* General Info */}
                <SectionHeader title="Marriage Details" />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <InputField label="Date of Marriage" name="marriage_date" type="date" value={data.marriage_date} onChange={handleChange} error={errors.marriage_date} />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <InputField label="Marriage Venue" name="marriage_venue" value={data.marriage_venue} onChange={handleChange} error={errors.marriage_venue} />
                    </Grid>
                </Grid>

                {/* Groom */}
                <SectionHeader title="Groom Details" />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <InputField label="Groom Name" name="groom_name" value={data.groom_name} onChange={handleChange} error={errors.groom_name} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <InputField label="Groom Father Name" name="groom_father_name" value={data.groom_father_name} onChange={handleChange} error={errors.groom_father_name} />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <InputField label="Groom Age" name="groom_age" type="number" value={data.groom_age} onChange={handleChange} error={errors.groom_age} />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <InputField label="Groom Address" name="groom_address" value={data.groom_address} onChange={handleChange} error={errors.groom_address} />
                    </Grid>
                </Grid>

                {/* Bride */}
                <SectionHeader title="Bride Details" />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <InputField label="Bride Name" name="bride_name" value={data.bride_name} onChange={handleChange} error={errors.bride_name} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <InputField label="Bride Father Name" name="bride_father_name" value={data.bride_father_name} onChange={handleChange} error={errors.bride_father_name} />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <InputField label="Bride Age" name="bride_age" type="number" value={data.bride_age} onChange={handleChange} error={errors.bride_age} />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <InputField label="Bride Address" name="bride_address" value={data.bride_address} onChange={handleChange} error={errors.bride_address} />
                    </Grid>
                </Grid>
                
                {/* Witnesses */}
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <SectionHeader title="Groom's Witness" />
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <InputField label="Name" name="groom_witness_name" value={data.groom_witness_name} onChange={handleChange} error={errors.groom_witness_name} />
                            </Grid>
                            <Grid item xs={12}>
                                <InputField label="Father Name" name="groom_witness_father_name" value={data.groom_witness_father_name} onChange={handleChange} error={errors.groom_witness_father_name} />
                            </Grid>
                            <Grid item xs={12}>
                                <InputField label="Address" name="groom_witness_address" value={data.groom_witness_address} onChange={handleChange} error={errors.groom_witness_address} />
                            </Grid>
                        </Grid>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <SectionHeader title="Bride's Witness" />
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <InputField label="Name" name="bride_witness_name" value={data.bride_witness_name} onChange={handleChange} error={errors.bride_witness_name} />
                            </Grid>
                            <Grid item xs={12}>
                                <InputField label="Father Name" name="bride_witness_father_name" value={data.bride_witness_father_name} onChange={handleChange} error={errors.bride_witness_father_name} />
                            </Grid>
                            <Grid item xs={12}>
                                <InputField label="Address" name="bride_witness_address" value={data.bride_witness_address} onChange={handleChange} error={errors.bride_witness_address} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Pandit */}
                <SectionHeader title="Pandit Details" />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <InputField label="Name" name="pandit_name" value={data.pandit_name} onChange={handleChange} error={errors.pandit_name} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <InputField label="Father Name" name="pandit_father_name" value={data.pandit_father_name} onChange={handleChange} error={errors.pandit_father_name} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <InputField label="Address" name="pandit_address" value={data.pandit_address} onChange={handleChange} error={errors.pandit_address} />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        size="large"
                        disabled={processing}
                        startIcon={<SaveIcon />}
                        sx={{ px: 4, py: 1.5 }}
                    >
                        Save Marriage Form
                    </Button>
                </Box>
            </Paper>
        </AdminLayout>
    );
}
