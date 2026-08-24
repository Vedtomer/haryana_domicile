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

// Age "in complete years, as on the date of marriage" — derived, never typed in directly.
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

// Every section renders as its own lightly-tinted card; fields inside pair off left/right (sm=6).
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

// Defined at module scope (not inside MarriageFormFields) so React keeps the same component
// identity across renders — nesting these in the parent's body recreated them on every
// keystroke, which remounted every input inside and dropped focus after each character.
const Party = ({ prefix, title, data, errors, onChange, onDobChange }) => (
    <FieldCard title={title} size={{ xs: 12, md: 6 }}>
        <Grid size={{ xs: 12 }}>
            <SelectField label="Affidavit By" name={`${prefix}_affidavit_by`} value={data[`${prefix}_affidavit_by`]} onChange={onChange} error={errors[`${prefix}_affidavit_by`]} options={[
                { value: 'father', label: 'Father' },
                { value: 'mother', label: 'Mother' },
            ]} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
            <InputField label="Name" name={`${prefix}_name`} value={data[`${prefix}_name`]} onChange={onChange} error={errors[`${prefix}_name`]} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
            <InputField label="Father's Name" name={`${prefix}_father_name`} value={data[`${prefix}_father_name`]} onChange={onChange} error={errors[`${prefix}_father_name`]} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
            <InputField label="Mother's Name" name={`${prefix}_mother_name`} value={data[`${prefix}_mother_name`]} onChange={onChange} error={errors[`${prefix}_mother_name`]} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
            <InputField label="Date of Birth" name={`${prefix}_dob`} type="date" value={data[`${prefix}_dob`]} onChange={onDobChange} error={errors[`${prefix}_dob`]} />
        </Grid>
        <Grid size={12}>
            <InputField label="Complete Postal Address" name={`${prefix}_address`} value={data[`${prefix}_address`]} onChange={onChange} error={errors[`${prefix}_address`]} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
            <InputField label="Father's Own Father's Name (for Father's Affidavit)" name={`${prefix}_father_father_name`} value={data[`${prefix}_father_father_name`]} onChange={onChange} error={errors[`${prefix}_father_father_name`]} required={false} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
            <InputField label="Father's Own Address (for Father's Affidavit)" name={`${prefix}_father_address`} value={data[`${prefix}_father_address`]} onChange={onChange} error={errors[`${prefix}_father_address`]} required={false} />
        </Grid>
    </FieldCard>
);

const Witness = ({ prefix, title, data, errors, onChange }) => (
    <FieldCard title={title} size={{ xs: 12, md: 6 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
            <InputField label="Name" name={`${prefix}_name`} value={data[`${prefix}_name`]} onChange={onChange} error={errors[`${prefix}_name`]} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
            <InputField label="Father's Name" name={`${prefix}_father_name`} value={data[`${prefix}_father_name`]} onChange={onChange} error={errors[`${prefix}_father_name`]} />
        </Grid>
        <Grid size={12}>
            <InputField label="Address" name={`${prefix}_address`} value={data[`${prefix}_address`]} onChange={onChange} error={errors[`${prefix}_address`]} />
        </Grid>
    </FieldCard>
);

export default function MarriageFormFields({ data, setData, errors, processing, onSubmit, submitLabel, showSaveAndCreate = false }) {
    const handleChange = (e) => setData(e.target.name, e.target.value);
    const [isSaveAndCreate, setIsSaveAndCreate] = React.useState(false);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(e, isSaveAndCreate);
    };

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
        <Paper component="form" onSubmit={handleFormSubmit} elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Grid container spacing={3}>

                <FieldCard title="Marriage Details" size={12}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InputField label="Date of Marriage" name="marriage_date" type="date" value={data.marriage_date} onChange={handleMarriageDateChange} error={errors.marriage_date} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InputField label="Registrar District" name="district" placeholder="e.g. Panipat" value={data.district} onChange={handleChange} error={errors.district} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <SelectField label="Religion" name="religion" value={data.religion} onChange={handleChange} error={errors.religion} required={false} options={RELIGION_OPTIONS} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InputField label="Nationality" name="nationality" value={data.nationality} onChange={handleChange} error={errors.nationality} required={false} />
                    </Grid>
                    <Grid size={12}>
                        <InputField label="Marriage Venue" name="marriage_venue" value={data.marriage_venue} onChange={handleChange} error={errors.marriage_venue} />
                    </Grid>
                </FieldCard>

                <Party prefix="groom" title="Groom Details" data={data} errors={errors} onChange={handleChange} onDobChange={handleDobChange('groom')} />
                <Party prefix="bride" title="Bride Details" data={data} errors={errors} onChange={handleChange} onDobChange={handleDobChange('bride')} />

                <Witness prefix="groom_witness" title="Groom's Witness" data={data} errors={errors} onChange={handleChange} />
                <Witness prefix="bride_witness" title="Bride's Witness" data={data} errors={errors} onChange={handleChange} />

                <FieldCard title="Pandit Details" size={12}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InputField label="Name" name="pandit_name" value={data.pandit_name} onChange={handleChange} error={errors.pandit_name} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InputField label="Father's Name" name="pandit_father_name" value={data.pandit_father_name} onChange={handleChange} error={errors.pandit_father_name} />
                    </Grid>
                    <Grid size={12}>
                        <InputField label="Address" name="pandit_address" value={data.pandit_address} onChange={handleChange} error={errors.pandit_address} />
                    </Grid>
                </FieldCard>

            </Grid>

            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
