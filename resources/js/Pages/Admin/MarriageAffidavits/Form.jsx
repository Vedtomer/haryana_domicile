import React from 'react';
import { Paper, Grid, Box, Button, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { InputField, SelectField } from '../../../Components/FormInputs';

const RELIGION_OPTIONS = [
    { value: 'Hindu', label: 'Hindu' },
    { value: 'Muslim', label: 'Muslim' },
    { value: 'Sikh', label: 'Sikh' },
    { value: 'Christian', label: 'Christian' },
    { value: 'Jain', label: 'Jain' },
    { value: 'Buddhist', label: 'Buddhist' },
    { value: 'Other', label: 'Other' },
];

// Age "at the time of marriage" — derived, never typed in directly.
const calcAge = (dob, refDate) => {
    if (!dob) return '';
    const d = new Date(dob);
    const ref = refDate ? new Date(refDate) : new Date();
    if (Number.isNaN(d.getTime()) || Number.isNaN(ref.getTime())) return '';
    let age = ref.getFullYear() - d.getFullYear();
    const monthDiff = ref.getMonth() - d.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < d.getDate())) age--;
    return age >= 0 ? String(age) : '';
};

const FieldCard = ({ title, size = { xs: 12 }, children }) => (
    <Grid size={size}>
        <Box sx={{ bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 2, p: 3, height: '100%' }}>
            <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                {title}
            </Typography>
            <Grid container spacing={2}>
                {children}
            </Grid>
        </Box>
    </Grid>
);

// Defined at module scope so React keeps the same component identity across
// renders — nesting this inside the parent would remount every input on
// each keystroke and drop focus.
const Party = ({ prefix, title, data, errors, onChange, onDobChange }) => (
    <FieldCard title={title} size={{ xs: 12, md: 6 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
            <InputField label="Name" name={`${prefix}_name`} value={data[`${prefix}_name`]} onChange={onChange} error={errors[`${prefix}_name`]} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
            <InputField label="Father's Name" name={`${prefix}_father_name`} value={data[`${prefix}_father_name`]} onChange={onChange} error={errors[`${prefix}_father_name`]} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
            <InputField label="Date of Birth" name={`${prefix}_dob`} type="date" value={data[`${prefix}_dob`]} onChange={onDobChange} error={errors[`${prefix}_dob`]} />
        </Grid>
        <Grid size={12}>
            <InputField label="Complete Postal Address" name={`${prefix}_address`} value={data[`${prefix}_address`]} onChange={onChange} error={errors[`${prefix}_address`]} />
        </Grid>
    </FieldCard>
);

export default function MarriageAffidavitFields({ data, setData, errors, processing, onSubmit, submitLabel }) {
    const handleChange = (e) => setData(e.target.name, e.target.value);

    const handleMarriageDateChange = (e) => {
        const marriage_date = e.target.value;
        setData((d) => ({
            ...d,
            marriage_date,
            groom_age: calcAge(d.groom_dob, marriage_date),
            bride_age: calcAge(d.bride_dob, marriage_date),
        }));
    };

    const handleDobChange = (prefix) => (e) => {
        const dob = e.target.value;
        setData((d) => ({ ...d, [`${prefix}_dob`]: dob, [`${prefix}_age`]: calcAge(dob, d.marriage_date) }));
    };

    return (
        <Paper component="form" onSubmit={onSubmit} elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Grid container spacing={3}>

                <FieldCard title="Marriage Details" size={12}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InputField label="Date of Marriage" name="marriage_date" type="date" value={data.marriage_date} onChange={handleMarriageDateChange} error={errors.marriage_date} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <SelectField label="Religion" name="religion" value={data.religion} onChange={handleChange} error={errors.religion} required={false} options={RELIGION_OPTIONS} />
                    </Grid>
                    <Grid size={12}>
                        <InputField label="Marriage Venue" name="marriage_venue" value={data.marriage_venue} onChange={handleChange} error={errors.marriage_venue} />
                    </Grid>
                </FieldCard>

                <Party prefix="groom" title="Groom Details" data={data} errors={errors} onChange={handleChange} onDobChange={handleDobChange('groom')} />
                <Party prefix="bride" title="Bride Details" data={data} errors={errors} onChange={handleChange} onDobChange={handleDobChange('bride')} />

            </Grid>

            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={processing}
                    startIcon={<SaveIcon />}
                    sx={{ px: 4, py: 1.5 }}
                >
                    {submitLabel}
                </Button>
            </Box>
        </Paper>
    );
}
