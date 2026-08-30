import React, { useState } from 'react';
import { Paper, Grid, Box, Button, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { InputField, SectionHeader } from '../../../Components/FormInputs';

export default function AadharUpdateFields({ data, setData, errors, processing, onSubmit, submitLabel, showSaveAndCreate = false }) {
    const handleChange = (e) => setData(e.target.name, e.target.value);
    const [isSaveAndCreate, setIsSaveAndCreate] = useState(false);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(e, isSaveAndCreate);
    };

    const handleAadharChange = (e) => {
        setData('aadhar_number', e.target.value.replace(/\D/g, '').slice(0, 12));
    };

    const handlePincodeChange = (e) => {
        setData('pin_code', e.target.value.replace(/\D/g, '').slice(0, 6));
    };

    return (
        <Paper component="form" onSubmit={handleFormSubmit} elevation={3} sx={{ p: 4, borderRadius: 2 }}>

            <SectionHeader title="Resident Details" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Aadhar Number" name="aadhar_number" value={data.aadhar_number} onChange={handleAadharChange} error={errors.aadhar_number} inputProps={{ inputMode: 'numeric', maxLength: 12 }} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Resident Name" name="name" value={data.name} onChange={handleChange} error={errors.name} />
                </Grid>
            </Grid>

            <SectionHeader title="Address Details" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="C/O (Care Of)" name="c_o" required={false} value={data.c_o} onChange={handleChange} error={errors.c_o} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="House No/ Bldg/ Apt" name="house_no" required={false} value={data.house_no} onChange={handleChange} error={errors.house_no} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Street/ Road/ Lane" name="street" required={false} value={data.street} onChange={handleChange} error={errors.street} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Landmark" name="landmark" required={false} value={data.landmark} onChange={handleChange} error={errors.landmark} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Area/ Locality/ Sector" name="locality" required={false} value={data.locality} onChange={handleChange} error={errors.locality} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Village/ Town/ City" name="village_town" value={data.village_town} onChange={handleChange} error={errors.village_town} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField label="Post Office" name="post_office" required={false} value={data.post_office} onChange={handleChange} error={errors.post_office} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField label="District" name="district" value={data.district} onChange={handleChange} error={errors.district} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField label="State" name="state" value={data.state} onChange={handleChange} error={errors.state} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField label="PIN Code" name="pin_code" value={data.pin_code} onChange={handlePincodeChange} error={errors.pin_code} inputProps={{ inputMode: 'numeric', maxLength: 6 }} />
                </Grid>
            </Grid>

            <SectionHeader title="Certifier Details (Optional)" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Certifier Name" name="certifier_name" required={false} value={data.certifier_name} onChange={handleChange} error={errors.certifier_name} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Designation" name="certifier_designation" required={false} value={data.certifier_designation} onChange={handleChange} error={errors.certifier_designation} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Office Address" name="certifier_address" required={false} value={data.certifier_address} onChange={handleChange} error={errors.certifier_address} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Contact No" name="certifier_contact" required={false} value={data.certifier_contact} onChange={handleChange} error={errors.certifier_contact} />
                </Grid>
            </Grid>

            <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {showSaveAndCreate && (
                    <Button 
                        type="submit" 
                        variant="outlined" 
                        color="primary" 
                        size="large" 
                        disabled={processing} 
                        onClick={() => setIsSaveAndCreate(true)} 
                        sx={{ px: 4, py: 1.5 }}
                    >
                        Save & Create New
                    </Button>
                )}
                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    size="large" 
                    disabled={processing} 
                    onClick={() => setIsSaveAndCreate(false)}
                    startIcon={<SaveIcon />} 
                    sx={{ px: 4, py: 1.5 }}
                >
                    {submitLabel}
                </Button>
            </Box>
        </Paper>
    );
}
