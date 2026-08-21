import React, { useState } from 'react';
import { Paper, Grid, Box, Button, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { InputField, SelectField, SectionHeader } from '../../../Components/FormInputs';

const RELIGION_OPTIONS = [
    { value: 'Hindu', label: 'Hindu' },
    { value: 'Muslim', label: 'Muslim' },
    { value: 'Sikh', label: 'Sikh' },
    { value: 'Christian', label: 'Christian' },
    { value: 'Jain', label: 'Jain' },
    { value: 'Buddhist', label: 'Buddhist' },
    { value: 'Zoroastrian', label: 'Zoroastrian' },
    { value: 'Other', label: 'Other' },
];

export default function HaryanaDomicileFields({ data, setData, errors, processing, onSubmit, submitLabel }) {
    const handleChange = (e) => setData(e.target.name, e.target.value);
    const [pincodeLoading, setPincodeLoading] = useState(false);

    const handleAadharChange = (e) => {
        setData('aadhar', e.target.value.replace(/\D/g, '').slice(0, 12));
    };

    const handleMobileChange = (e) => {
        setData('mobile', e.target.value.replace(/\D/g, '').slice(0, 10));
    };

    const handlePincodeChange = (e) => {
        const pincode = e.target.value.replace(/\D/g, '').slice(0, 6);
        setData('pincode', pincode);

        if (pincode.length === 6) {
            setPincodeLoading(true);
            window.axios.get(`/admin/pincode-lookup/${pincode}`)
                .then(({ data: result }) => {
                    setData((d) => ({ ...d, pincode, district: result.district, tehsil: result.tehsil }));
                })
                .catch(() => {})
                .finally(() => setPincodeLoading(false));
        }
    };

    return (
        <Paper component="form" onSubmit={onSubmit} elevation={3} sx={{ p: 4, borderRadius: 2 }}>

            <SectionHeader title="Personal Information" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField
                        label="Pincode"
                        name="pincode"
                        required={false}
                        value={data.pincode}
                        onChange={handlePincodeChange}
                        error={errors.pincode}
                        inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                        InputProps={pincodeLoading ? { endAdornment: <CircularProgress size={18} sx={{ mr: 1 }} /> } : undefined}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField label="Tehsil" name="tehsil" value={data.tehsil} onChange={handleChange} error={errors.tehsil} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField label="District" name="district" value={data.district} onChange={handleChange} error={errors.district} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField label="Name" name="name" value={data.name} onChange={handleChange} error={errors.name} />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Father/Husband Name" name="father_name" value={data.father_name} onChange={handleChange} error={errors.father_name} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Address" name="village" value={data.village} onChange={handleChange} error={errors.village} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField label="Ward No." name="ward_no" required={false} value={data.ward_no} onChange={handleChange} error={errors.ward_no} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField label="Age" name="age" type="number" required={false} value={data.age} onChange={handleChange} error={errors.age} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField label="Mobile" name="mobile" type="tel" value={data.mobile} onChange={handleMobileChange} error={errors.mobile} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField label="Aadhar" name="aadhar" value={data.aadhar} onChange={handleAadharChange} error={errors.aadhar} inputProps={{ inputMode: 'numeric', maxLength: 12 }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField label="Ration Card No." name="ration_card_no" required={false} value={data.ration_card_no} onChange={handleChange} error={errors.ration_card_no} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField label="Caste" name="caste" value={data.caste} onChange={handleChange} error={errors.caste} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <SelectField label="Religion (Dharam)" name="religion" required={false} value={data.religion} onChange={handleChange} error={errors.religion} options={RELIGION_OPTIONS} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField label="Child Name (Optional)" name="child_name" required={false} value={data.child_name} onChange={handleChange} error={errors.child_name} />
                </Grid>
            </Grid>

            <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" color="primary" size="large" disabled={processing} startIcon={<SaveIcon />} sx={{ px: 4, py: 1.5 }}>
                    {submitLabel}
                </Button>
            </Box>
        </Paper>
    );
}
