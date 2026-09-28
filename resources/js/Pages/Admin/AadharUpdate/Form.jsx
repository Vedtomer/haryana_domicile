import React, { useState } from 'react';
import { Paper, Grid, Box, Button, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { InputField, SelectField, SectionHeader } from '../../../Components/FormInputs';

const RESIDENT_STATUS_OPTIONS = [
    { value: 'Resident', label: 'Resident' },
    { value: 'Non-Resident Indian (NRI)', label: 'Non-Resident Indian (NRI)' },
    { value: 'OCI / Foreign National', label: 'OCI / LTV / Nepal / Bhutan / Foreign National' },
];

const REQUEST_TYPE_OPTIONS = [
    { value: 'Update Request', label: 'Update Request' },
    { value: 'New Enrolment', label: 'New Enrolment' },
];

const CERTIFIER_CATEGORY_OPTIONS = [
    { value: 'Village Panchayat Head', label: 'Village Panchayat Head / Mukhiya / Village Panchayat Secretary' },
    { value: 'MP / MLA / MLC / Municipal Councillor', label: 'MP / MLA / MLC / Municipal Councillor' },
    { value: 'Gazetted Officer Group A', label: "Gazetted Officer Group 'A' / EPFO Officer" },
    { value: 'Tehsildar / Group B', label: "Tehsildar / Gazetted Officer Group 'B'" },
    { value: 'Gazetted Officer NACO', label: 'Gazetted Officer at NACO / State Health Department' },
    { value: 'Head of educational institution', label: 'Head of recognised educational institution' },
];

export default function AadharUpdateFields({ data, setData, errors, processing, onSubmit, submitLabel, showSaveAndCreate = false }) {
    const handleChange = (e) => setData(e.target.name, e.target.value);
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [isSaveAndCreate, setIsSaveAndCreate] = useState(false);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(e, isSaveAndCreate);
    };

    const handleAadharChange = (e) => {
        setData('aadhar_number', e.target.value.replace(/\D/g, '').slice(0, 12));
    };

    const handlePincodeChange = (e) => {
        const pincode = e.target.value.replace(/\D/g, '').slice(0, 6);
        setData('pin_code', pincode);

        if (pincode.length === 6) {
            setPincodeLoading(true);
            window.axios?.get(`/admin/pincode-lookup/${pincode}`)
                .then(({ data: result }) => {
                    if (result) {
                        setData((d) => ({
                            ...d,
                            pin_code: pincode,
                            district: result.district || d.district,
                            state: result.state || d.state || 'Haryana',
                        }));
                    }
                })
                .catch(() => {})
                .finally(() => setPincodeLoading(false));
        }
    };

    const handleContactChange = (e) => {
        setData('certifier_contact', e.target.value.replace(/\D/g, '').slice(0, 10));
    };

    return (
        <Paper component="form" onSubmit={handleFormSubmit} elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}>

            <SectionHeader title="Form Date & Enrolment Type" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField
                        label="Date (Date of Issue)"
                        name="date"
                        type="date"
                        value={data.date || ''}
                        onChange={handleChange}
                        error={errors.date}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <SelectField
                        label="Resident Status"
                        name="resident_status"
                        value={data.resident_status || 'Resident'}
                        onChange={handleChange}
                        options={RESIDENT_STATUS_OPTIONS}
                        error={errors.resident_status}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <SelectField
                        label="Request Type"
                        name="request_type"
                        value={data.request_type || 'Update Request'}
                        onChange={handleChange}
                        options={REQUEST_TYPE_OPTIONS}
                        error={errors.request_type}
                    />
                </Grid>
            </Grid>

            <SectionHeader title="Resident Details" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField
                        label="Aadhaar Number (12 Digits) *"
                        name="aadhar_number"
                        value={data.aadhar_number || ''}
                        onChange={handleAadharChange}
                        error={errors.aadhar_number}
                        inputProps={{ inputMode: 'numeric', maxLength: 12 }}
                        placeholder="e.g. 123456789012"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField
                        label="Full Name (As per Aadhaar/Documents) *"
                        name="name"
                        value={data.name || ''}
                        onChange={handleChange}
                        error={errors.name}
                        placeholder="NAME IN CAPITAL LETTERS"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField
                        label="C/O (Care Of / S/O / D/O / W/O)"
                        name="c_o"
                        required={false}
                        value={data.c_o || ''}
                        onChange={handleChange}
                        error={errors.c_o}
                        placeholder="e.g. C/O Father / Husband Name"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField
                        label="House No./ Bldg./ Apt"
                        name="house_no"
                        required={false}
                        value={data.house_no || ''}
                        onChange={handleChange}
                        error={errors.house_no}
                    />
                </Grid>
            </Grid>

            <SectionHeader title="Address Details" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField
                        label="Street/ Road/ Lane"
                        name="street"
                        required={false}
                        value={data.street || ''}
                        onChange={handleChange}
                        error={errors.street}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField
                        label="Landmark"
                        name="landmark"
                        required={false}
                        value={data.landmark || ''}
                        onChange={handleChange}
                        error={errors.landmark}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField
                        label="Area/ Locality/ Sector"
                        name="locality"
                        required={false}
                        value={data.locality || ''}
                        onChange={handleChange}
                        error={errors.locality}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField
                        label="Village/ Town/ City *"
                        name="village_town"
                        value={data.village_town || ''}
                        onChange={handleChange}
                        error={errors.village_town}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField
                        label="Post Office"
                        name="post_office"
                        required={false}
                        value={data.post_office || ''}
                        onChange={handleChange}
                        error={errors.post_office}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField
                        label="District *"
                        name="district"
                        value={data.district || ''}
                        onChange={handleChange}
                        error={errors.district}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField
                        label="State *"
                        name="state"
                        value={data.state || ''}
                        onChange={handleChange}
                        error={errors.state}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField
                        label="PIN Code *"
                        name="pin_code"
                        value={data.pin_code || ''}
                        onChange={handlePincodeChange}
                        error={errors.pin_code}
                        inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                        InputProps={pincodeLoading ? { endAdornment: <CircularProgress size={18} sx={{ mr: 1 }} /> } : undefined}
                    />
                </Grid>
            </Grid>

            <SectionHeader title="Certifier's Details (Optional / Editable)" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                    <InputField
                        label="Name of the Certifier"
                        name="certifier_name"
                        required={false}
                        value={data.certifier_name || ''}
                        onChange={handleChange}
                        error={errors.certifier_name}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                    <InputField
                        label="Designation"
                        name="certifier_designation"
                        required={false}
                        value={data.certifier_designation || ''}
                        onChange={handleChange}
                        error={errors.certifier_designation}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField
                        label="Office Address (Line 1)"
                        name="certifier_address"
                        required={false}
                        value={data.certifier_address || ''}
                        onChange={handleChange}
                        error={errors.certifier_address}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField
                        label="Office Address (Line 2)"
                        name="certifier_address2"
                        required={false}
                        value={data.certifier_address2 || ''}
                        onChange={handleChange}
                        error={errors.certifier_address2}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                    <InputField
                        label="Contact Number (10 Digits)"
                        name="certifier_contact"
                        required={false}
                        value={data.certifier_contact || ''}
                        onChange={handleContactChange}
                        error={errors.certifier_contact}
                        inputProps={{ inputMode: 'numeric', maxLength: 10 }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                    <SelectField
                        label="Certifier Category (Checkbox)"
                        name="certifier_category"
                        value={data.certifier_category || 'Village Panchayat Head'}
                        onChange={handleChange}
                        options={CERTIFIER_CATEGORY_OPTIONS}
                        error={errors.certifier_category}
                    />
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
                    startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
                    sx={{ px: 5, py: 1.5, fontWeight: 'bold' }}
                >
                    {submitLabel || 'Save Form'}
                </Button>
            </Box>
        </Paper>
    );
}
