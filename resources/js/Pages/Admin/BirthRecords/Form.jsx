import React from 'react';
import { Paper, Grid, Box, Button, IconButton, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { InputField, SelectField, SectionHeader } from '../../../Components/FormInputs';

const GENDER_OPTIONS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Transgender', label: 'Transgender' },
];

export default function BirthRecordFields({ data, setData, errors, processing, onSubmit, submitLabel }) {
    const handleChange = (e) => setData(e.target.name, e.target.value);

    const addOtherChild = () => {
        setData('other_children', [...data.other_children, { name: '', dob: '', birth_place: '', is_recorded: 'Yes' }]);
    };

    const removeOtherChild = (index) => {
        const next = [...data.other_children];
        next.splice(index, 1);
        setData('other_children', next);
    };

    const handleChildChange = (index, field, value) => {
        const next = [...data.other_children];
        next[index][field] = value;
        setData('other_children', next);
    };

    return (
        <Paper component="form" onSubmit={onSubmit} elevation={3} sx={{ p: 4, borderRadius: 2 }}>

            <SectionHeader title="Search Details" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InputField label="District" name="district" value={data.district} onChange={handleChange} error={errors.district} />
                </Grid>
            </Grid>

            <SectionHeader title="Declaration By (Applicants)" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Applicant Father Name" name="father_name" value={data.father_name} onChange={handleChange} error={errors.father_name} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Applicant Mother Name" name="mother_name" value={data.mother_name} onChange={handleChange} error={errors.mother_name} />
                </Grid>
                <Grid size={12}>
                    <InputField label="Permanent Address" name="permanent_address" multiline rows={3} value={data.permanent_address} onChange={handleChange} error={errors.permanent_address} />
                </Grid>
            </Grid>

            <SectionHeader title="Existing Birth Record Details" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InputField label="Issuing Authority" name="issuing_authority" placeholder="Zila Registrar/Nagar Nigam" value={data.issuing_authority} onChange={handleChange} error={errors.issuing_authority} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InputField label="Record Year" name="record_year" value={data.record_year} onChange={handleChange} error={errors.record_year} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InputField label="Registration No." name="registration_no" value={data.registration_no} onChange={handleChange} error={errors.registration_no} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InputField label="Registration Date" name="date_of_registration" type="date" value={data.date_of_registration} onChange={handleChange} error={errors.date_of_registration} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InputField label="Recorded Father Name" name="record_father_name" required={false} value={data.record_father_name} onChange={handleChange} error={errors.record_father_name} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InputField label="Recorded Mother Name" name="record_mother_name" required={false} value={data.record_mother_name} onChange={handleChange} error={errors.record_mother_name} />
                </Grid>
            </Grid>

            <SectionHeader title="Child Details to Add" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Name to be Added" name="child_name" value={data.child_name} onChange={handleChange} error={errors.child_name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SelectField label="Gender" name="gender" value={data.gender} onChange={handleChange} error={errors.gender} options={GENDER_OPTIONS} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField label="Date of Birth" name="dob" type="date" value={data.dob} onChange={handleChange} error={errors.dob} />
                </Grid>
                <Grid size={12}>
                    <InputField label="Address of Parents at Birth" name="address_parents_birth" multiline rows={3} value={data.address_parents_birth} onChange={handleChange} error={errors.address_parents_birth} />
                </Grid>
            </Grid>

            <SectionHeader title="Supporting Document (School/Metric)" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField label="Name in Certificate" name="school_child_name" required={false} value={data.school_child_name} onChange={handleChange} error={errors.school_child_name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField label="DOB in Certificate" name="school_dob" type="date" required={false} value={data.school_dob} onChange={handleChange} error={errors.school_dob} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField label="Father Name in Certificate" name="school_father_name" required={false} value={data.school_father_name} onChange={handleChange} error={errors.school_father_name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField label="Mother Name in Certificate" name="school_mother_name" required={false} value={data.school_mother_name} onChange={handleChange} error={errors.school_mother_name} />
                </Grid>
            </Grid>

            <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" color="primary" fontWeight="bold">Other Children Details</Typography>
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addOtherChild}>Add Child</Button>
            </Box>
            {data.other_children.map((child, index) => (
                <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <InputField label="Name" value={child.name} onChange={(e) => handleChildChange(index, 'name', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <InputField label="DOB" type="date" value={child.dob} onChange={(e) => handleChildChange(index, 'dob', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <InputField label="Birth Place" required={false} value={child.birth_place} onChange={(e) => handleChildChange(index, 'birth_place', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5, md: 2 }}>
                        <SelectField label="Recorded?" value={child.is_recorded} onChange={(e) => handleChildChange(index, 'is_recorded', e.target.value)} options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 1, md: 1 }}>
                        <IconButton color="error" onClick={() => removeOtherChild(index)}><DeleteIcon /></IconButton>
                    </Grid>
                </Grid>
            ))}
            {data.other_children.length === 0 && (
                <Typography color="text.secondary" fontStyle="italic" sx={{ mb: 2 }}>No other children added.</Typography>
            )}

            <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" color="primary" size="large" disabled={processing} startIcon={<SaveIcon />} sx={{ px: 4, py: 1.5 }}>
                    {submitLabel}
                </Button>
            </Box>
        </Paper>
    );
}
