import React, { useState } from 'react';
import { Paper, Grid, Box, Button, CircularProgress, MenuItem, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { InputField, SelectField, SectionHeader } from '../../../Components/FormInputs';

const AFFIDAVIT_TYPES = [
    { value: 'name_correction', label: 'Name / Spelling Correction in Bank Account' },
    { value: 'mobile_update', label: 'Mobile Number Update / Registration' },
    { value: 'passbook_lost', label: 'Loss of Original Passbook (Issue Duplicate)' },
    { value: 'dormant_activation', label: 'Reactivation of Inoperative / Dormant Account' },
    { value: 'signature_change', label: 'Specimen Signature Update / Change' },
    { value: 'general', label: 'General Banking Declaration / KYC Purpose' },
];

const DEFAULT_REASONS = {
    name_correction: 'There is a minor spelling discrepancy in my name in Bank of Baroda account records compared to my Aadhaar Card / PAN Card. Both names belong to me, and I request the bank to correct it.',
    mobile_update: 'I request the branch to register my current active mobile number in my Bank of Baroda account for OTP alerts and SMS banking services.',
    passbook_lost: 'My original Bank of Baroda passbook has been misplaced/lost. I request the bank to issue a duplicate passbook. I undertake to return the old passbook if found.',
    dormant_activation: 'My Bank of Baroda savings account has become dormant due to lack of transactions. I am submitting fresh KYC documents and request immediate reactivation.',
    signature_change: 'My physical signature has evolved over time. I request the bank to update my specimen signature in account records as affixed on this affidavit.',
    general: 'I am submitting this declaration to Bank of Baroda for KYC verification and account maintenance.',
};

export default function BobAffidavitFields({ 
    data, 
    setData, 
    errors, 
    processing, 
    onSubmit, 
    submitLabel = 'Save BOB Affidavit', 
    showSaveAndCreate = true 
}) {
    const handleChange = (e) => setData(e.target.name, e.target.value);
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [isSaveAndCreate, setIsSaveAndCreate] = useState(false);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(e, isSaveAndCreate);
    };

    const handleAadharChange = (e) => {
        setData('aadhar', e.target.value.replace(/\D/g, '').slice(0, 12));
    };

    const handleMobileChange = (e) => {
        setData('mobile', e.target.value.replace(/\D/g, '').slice(0, 10));
    };

    const handleAccountNoChange = (e) => {
        setData('account_no', e.target.value.replace(/\s/g, '').slice(0, 30));
    };

    const handleAffidavitTypeChange = (e) => {
        const type = e.target.value;
        setData((d) => ({
            ...d,
            affidavit_type: type,
            reason: DEFAULT_REASONS[type] || d.reason || '',
        }));
    };

    const handlePincodeChange = (e) => {
        const pincode = e.target.value.replace(/\D/g, '').slice(0, 6);
        setData('pincode', pincode);

        if (pincode.length === 6) {
            setPincodeLoading(true);
            window.axios.get(`/admin/pincode-lookup/${pincode}`)
                .then(({ data: result }) => {
                    setData((d) => ({ 
                        ...d, 
                        pincode, 
                        district: result.district || d.district, 
                        tehsil: result.tehsil || d.tehsil,
                        state: result.state || d.state || 'Haryana',
                    }));
                })
                .catch(() => {})
                .finally(() => setPincodeLoading(false));
        }
    };

    return (
        <Paper 
            component="form" 
            onSubmit={handleFormSubmit} 
            elevation={0} 
            sx={{ 
                p: { xs: 2.5, sm: 4 }, 
                borderRadius: 3, 
                bgcolor: '#ffffff', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' 
            }}
        >
            {/* Header Notice Banner */}
            <Box sx={{ mb: 3.5, p: 2, bgcolor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h6" sx={{ fontSize: '1.25rem' }}>🏦</Typography>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="#9a3412">
                            Bank of Baroda Official Affidavit Generator
                        </Typography>
                        <Typography variant="caption" color="#c2410c">
                            Fill all required fields accurately. Once generated, you can print/download the official affidavit ready for branch submission.
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ bgcolor: '#ffedd5', px: 2, py: 0.5, borderRadius: 1.5, border: '1px solid #fdba74' }}>
                    <Typography variant="caption" fontWeight="bold" color="#9a3412">
                        🪙 Fee: 149 Coins
                    </Typography>
                </Box>
            </Box>

            {/* Section 1: Bank of Baroda Account Details */}
            <SectionHeader title="1. Bank of Baroda Account Details" />
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField 
                        label="BOB Account Number" 
                        name="account_no" 
                        required={true}
                        value={data.account_no} 
                        onChange={handleAccountNoChange} 
                        error={errors.account_no} 
                        helperText="Enter 14-digit Bank of Baroda account number"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField 
                        label="Branch Name" 
                        name="branch_name" 
                        required={true}
                        placeholder="e.g. Rohtak Main Branch"
                        value={data.branch_name} 
                        onChange={handleChange} 
                        error={errors.branch_name} 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField 
                        label="IFSC Code" 
                        name="ifsc_code" 
                        required={false}
                        placeholder="e.g. BARB0ROHTAK"
                        value={data.ifsc_code} 
                        onChange={handleChange} 
                        error={errors.ifsc_code} 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField 
                        label="Customer ID / CIF (Optional)" 
                        name="cif_no" 
                        required={false}
                        value={data.cif_no} 
                        onChange={handleChange} 
                        error={errors.cif_no} 
                    />
                </Grid>
            </Grid>

            {/* Section 2: Account Holder Personal Details */}
            <SectionHeader title="2. Account Holder Personal Information" />
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField 
                        label="Account Holder Name" 
                        name="name" 
                        required={true}
                        value={data.name} 
                        onChange={handleChange} 
                        error={errors.name} 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField 
                        label="Father / Husband Name" 
                        name="father_name" 
                        required={true}
                        value={data.father_name} 
                        onChange={handleChange} 
                        error={errors.father_name} 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <SelectField 
                        label="Gender" 
                        name="gender" 
                        value={data.gender || 'Male'} 
                        onChange={handleChange} 
                        error={errors.gender}
                    >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </SelectField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField 
                        label="Mobile Number (10 Digits)" 
                        name="mobile" 
                        type="tel" 
                        required={true}
                        value={data.mobile} 
                        onChange={handleMobileChange} 
                        error={errors.mobile} 
                        inputProps={{ inputMode: 'numeric', maxLength: 10 }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField 
                        label="Aadhaar Number (12 Digits)" 
                        name="aadhar" 
                        required={false}
                        value={data.aadhar} 
                        onChange={handleAadharChange} 
                        error={errors.aadhar} 
                        inputProps={{ inputMode: 'numeric', maxLength: 12 }} 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField 
                        label="PAN Card Number (Optional)" 
                        name="pan_no" 
                        required={false}
                        value={data.pan_no} 
                        onChange={(e) => setData('pan_no', e.target.value.toUpperCase().slice(0, 10))} 
                        error={errors.pan_no} 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField 
                        label="Age (in Years)" 
                        name="age" 
                        type="number" 
                        required={false} 
                        value={data.age} 
                        onChange={handleChange} 
                        error={errors.age} 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InputField 
                        label="Date of Birth" 
                        name="dob" 
                        type="date" 
                        required={false} 
                        value={data.dob} 
                        onChange={handleChange} 
                        error={errors.dob} 
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
            </Grid>

            {/* Section 3: Residential Address */}
            <SectionHeader title="3. Residential Address" />
            <Grid container spacing={3} sx={{ mb: 4 }}>
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
                    <InputField 
                        label="Tehsil / Sub-district" 
                        name="tehsil" 
                        required={true}
                        value={data.tehsil} 
                        onChange={handleChange} 
                        error={errors.tehsil} 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField 
                        label="District" 
                        name="district" 
                        required={true}
                        value={data.district} 
                        onChange={handleChange} 
                        error={errors.district} 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField 
                        label="State" 
                        name="state" 
                        required={true}
                        value={data.state || 'Haryana'} 
                        onChange={handleChange} 
                        error={errors.state} 
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <InputField 
                        label="Full Address (Village / Ward / Street / Landmark)" 
                        name="village" 
                        required={true}
                        multiline
                        rows={2}
                        value={data.village} 
                        onChange={handleChange} 
                        error={errors.village} 
                    />
                </Grid>
            </Grid>

            {/* Section 4: Affidavit Purpose & Reason */}
            <SectionHeader title="4. Affidavit Purpose &amp; Declaration" />
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <SelectField
                        label="Affidavit Purpose / Subject"
                        name="affidavit_type"
                        value={data.affidavit_type || 'name_correction'}
                        onChange={handleAffidavitTypeChange}
                        error={errors.affidavit_type}
                    >
                        {AFFIDAVIT_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </SelectField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <InputField
                        label="Reason / Statement for Affidavit"
                        name="reason"
                        required={true}
                        multiline
                        rows={3}
                        value={data.reason}
                        onChange={handleChange}
                        error={errors.reason}
                        helperText="Provide specific details or statement explaining why this affidavit is submitted."
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <InputField
                        label="Additional Notes / Instructions (Optional)"
                        name="notes"
                        required={false}
                        multiline
                        rows={2}
                        value={data.notes}
                        onChange={handleChange}
                        error={errors.notes}
                    />
                </Grid>
            </Grid>

            {/* Submit Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap', pt: 2, borderTop: '1px solid #f1f5f9' }}>
                {showSaveAndCreate && (
                    <Button
                        type="button"
                        variant="outlined"
                        color="primary"
                        disabled={processing}
                        startIcon={processing && isSaveAndCreate ? <CircularProgress size={18} /> : <AddIcon />}
                        onClick={(e) => {
                            setIsSaveAndCreate(true);
                            onSubmit(e, true);
                        }}
                        sx={{ px: 3, py: 1.2, fontWeight: 'bold', borderRadius: 2 }}
                    >
                        Save &amp; Create Another
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={processing}
                    startIcon={processing && !isSaveAndCreate ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    onClick={() => setIsSaveAndCreate(false)}
                    sx={{ px: 4, py: 1.2, fontWeight: 'bold', borderRadius: 2, bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}
                >
                    {processing && !isSaveAndCreate ? 'Saving...' : submitLabel}
                </Button>
            </Box>
        </Paper>
    );
}
