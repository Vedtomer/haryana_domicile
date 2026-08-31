import React from 'react';
import { Paper, Grid, Box, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { InputField, SectionHeader } from '../../../Components/FormInputs';

export default function AirtelPassbookFields({ 
    data, setData, errors, processing, onSubmit, submitLabel, showSaveAndCreate = false 
}) {
    return (
        <Paper component="form" onSubmit={onSubmit} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
            <SectionHeader title="Airtel Passbook Details" subtitle="Enter the account and personal details to generate the passbook" />
            
            <Grid container spacing={3}>
                <InputField
                    label="Reference Number"
                    value={data.reference_number}
                    onChange={(e) => setData('reference_number', e.target.value)}
                    error={errors.reference_number}
                    placeholder="***********3807"
                />
                <InputField
                    label="UID Number"
                    value={data.uid_number}
                    onChange={(e) => setData('uid_number', e.target.value)}
                    error={errors.uid_number}
                    placeholder="********3447"
                />
                <InputField
                    label="Account Number"
                    value={data.account_number}
                    onChange={(e) => setData('account_number', e.target.value)}
                    error={errors.account_number}
                    required
                />
                <InputField
                    label="IFSC Code"
                    value={data.ifsc_code}
                    onChange={(e) => setData('ifsc_code', e.target.value)}
                    error={errors.ifsc_code}
                    required
                />
                
                <SectionHeader title="Personal Information" />
                <InputField
                    label="First Name"
                    value={data.first_name}
                    onChange={(e) => setData('first_name', e.target.value)}
                    error={errors.first_name}
                    required
                />
                <InputField
                    label="Last Name"
                    value={data.last_name}
                    onChange={(e) => setData('last_name', e.target.value)}
                    error={errors.last_name}
                />
                <InputField
                    label="Address"
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                    error={errors.address}
                    required
                    fullWidth
                    multiline
                    rows={2}
                />
                <InputField
                    label="City"
                    value={data.city}
                    onChange={(e) => setData('city', e.target.value)}
                    error={errors.city}
                />
                <InputField
                    label="Gender"
                    value={data.gender}
                    onChange={(e) => setData('gender', e.target.value)}
                    error={errors.gender}
                    placeholder="M or F"
                />
                <InputField
                    label="Mobile Number"
                    value={data.mobile_number}
                    onChange={(e) => setData('mobile_number', e.target.value)}
                    error={errors.mobile_number}
                />
                <InputField
                    label="Pin Code"
                    value={data.pin_code}
                    onChange={(e) => setData('pin_code', e.target.value)}
                    error={errors.pin_code}
                />

                <SectionHeader title="Nominee Information" />
                <InputField
                    label="Nominee Name"
                    value={data.nominee_name}
                    onChange={(e) => setData('nominee_name', e.target.value)}
                    error={errors.nominee_name}
                />
                <InputField
                    label="Nominee Relation"
                    value={data.nominee_relation}
                    onChange={(e) => setData('nominee_relation', e.target.value)}
                    error={errors.nominee_relation}
                />

            </Grid>

            <Box sx={{ mt: 5, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={processing}
                    startIcon={<SaveIcon />}
                    onClick={() => setData('save_and_create', false)}
                    sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                        px: 4, py: 1.5,
                        '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)' }
                    }}
                >
                    {submitLabel}
                </Button>
                
                {showSaveAndCreate && (
                    <Button
                        type="submit"
                        variant="outlined"
                        disabled={processing}
                        onClick={() => setData('save_and_create', true)}
                        sx={{ px: 4, py: 1.5, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                    >
                        Save & Create Another
                    </Button>
                )}
            </Box>
        </Paper>
    );
}
