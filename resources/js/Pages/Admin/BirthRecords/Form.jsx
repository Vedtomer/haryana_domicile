import React, { useState } from 'react';
import { Paper, Grid, Box, Button, Typography, ToggleButton, ToggleButtonGroup, Card, CardContent } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import TranslateIcon from '@mui/icons-material/Translate';
import LinkIcon from '@mui/icons-material/Link';
import { InputField, SelectField, SectionHeader } from '../../../Components/FormInputs';
import BilingualInputField from '../../../Components/BilingualInputField';

const GENDER_OPTIONS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Transgender', label: 'Transgender' },
];

export default function BirthRecordFields({ data, setData, errors, processing, onSubmit, submitLabel, showSaveAndCreate = false }) {
    const handleChange = (e) => setData(e.target.name, e.target.value);
    const [isSaveAndCreate, setIsSaveAndCreate] = useState(false);
    const [formatMode, setFormatMode] = useState('both'); // 'both' | 'hindi' | 'english'

    // Track whether dependent fields were manually overridden by the user
    const [customized, setCustomized] = useState({
        record_father_name: !!(data.record_father_name && data.father_name && data.record_father_name !== data.father_name),
        school_father_name: !!(data.school_father_name && data.father_name && data.school_father_name !== data.father_name),
        record_mother_name: !!(data.record_mother_name && data.mother_name && data.record_mother_name !== data.mother_name),
        school_mother_name: !!(data.school_mother_name && data.mother_name && data.school_mother_name !== data.mother_name),
        school_child_name: !!(data.school_child_name && data.child_name && data.school_child_name !== data.child_name),
        address_parents_birth: !!(data.address_parents_birth && data.permanent_address && data.address_parents_birth !== data.permanent_address),
    });

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(e, isSaveAndCreate);
    };

    // Auto-sync Applicant Father Name -> Recorded Father & School Certificate Father
    const handleFatherNameChange = (e) => {
        const val = e.target.value;
        setData(prev => {
            const updates = { father_name: val };
            if (!customized.record_father_name) {
                updates.record_father_name = val;
            }
            if (!customized.school_father_name) {
                updates.school_father_name = val;
            }
            return { ...prev, ...updates };
        });
    };

    // Auto-sync Applicant Mother Name -> Recorded Mother & School Certificate Mother
    const handleMotherNameChange = (e) => {
        const val = e.target.value;
        setData(prev => {
            const updates = { mother_name: val };
            if (!customized.record_mother_name) {
                updates.record_mother_name = val;
            }
            if (!customized.school_mother_name) {
                updates.school_mother_name = val;
            }
            return { ...prev, ...updates };
        });
    };

    // Auto-sync Child Name to be Added -> School Certificate Child Name
    const handleChildNameChange = (e) => {
        const val = e.target.value;
        setData(prev => {
            const updates = { child_name: val };
            if (!customized.school_child_name) {
                updates.school_child_name = val;
            }
            return { ...prev, ...updates };
        });
    };

    // Auto-sync Permanent Address -> Address of Parents at Birth
    const handlePermanentAddressChange = (e) => {
        const val = e.target.value;
        setData(prev => {
            const updates = { permanent_address: val };
            if (!customized.address_parents_birth) {
                updates.address_parents_birth = val;
            }
            return { ...prev, ...updates };
        });
    };

    // Manual change handlers for dependent fields (marks them customized)
    const handleRecordFatherChange = (e) => {
        setCustomized(prev => ({ ...prev, record_father_name: true }));
        setData('record_father_name', e.target.value);
    };

    const handleSchoolFatherChange = (e) => {
        setCustomized(prev => ({ ...prev, school_father_name: true }));
        setData('school_father_name', e.target.value);
    };

    const handleRecordMotherChange = (e) => {
        setCustomized(prev => ({ ...prev, record_mother_name: true }));
        setData('record_mother_name', e.target.value);
    };

    const handleSchoolMotherChange = (e) => {
        setCustomized(prev => ({ ...prev, school_mother_name: true }));
        setData('school_mother_name', e.target.value);
    };

    const handleSchoolChildChange = (e) => {
        setCustomized(prev => ({ ...prev, school_child_name: true }));
        setData('school_child_name', e.target.value);
    };

    const handleAddressParentsBirthChange = (e) => {
        setCustomized(prev => ({ ...prev, address_parents_birth: true }));
        setData('address_parents_birth', e.target.value);
    };

    // Manual Re-sync helpers
    const resyncRecordFather = () => {
        setCustomized(prev => ({ ...prev, record_father_name: false }));
        setData('record_father_name', data.father_name);
    };

    const resyncSchoolFather = () => {
        setCustomized(prev => ({ ...prev, school_father_name: false }));
        setData('school_father_name', data.father_name);
    };

    const resyncRecordMother = () => {
        setCustomized(prev => ({ ...prev, record_mother_name: false }));
        setData('record_mother_name', data.mother_name);
    };

    const resyncSchoolMother = () => {
        setCustomized(prev => ({ ...prev, school_mother_name: false }));
        setData('school_mother_name', data.mother_name);
    };

    const resyncSchoolChild = () => {
        setCustomized(prev => ({ ...prev, school_child_name: false }));
        setData('school_child_name', data.child_name);
    };

    const resyncAddressParentsBirth = () => {
        setCustomized(prev => ({ ...prev, address_parents_birth: false }));
        setData('address_parents_birth', data.permanent_address);
    };

    return (
        <Paper component="form" onSubmit={handleFormSubmit} elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}>
            
            {/* Bilingual & Auto-Fill Information Banner */}
            <Card variant="outlined" sx={{ mb: 4, bgcolor: '#f8fafc', borderColor: '#cbd5e1', borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ p: 1, bgcolor: '#eff6ff', borderRadius: '50%', color: '#2563eb', display: 'flex' }}>
                                <TranslateIcon fontSize="small" />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" fontWeight="700" color="#1e3a8a">
                                    Bilingual Auto-Fill & Sync Enabled (अंग्रेजी + हिंदी ऑटो-ट्रांसलेशन)
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    English me likhte hi Hindi sath me generate hogi. Father/Mother/Child names dusri jagah apne aap fill honge.
                                </Typography>
                            </Box>
                        </Box>

                        {/* Format Mode Selector */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" fontWeight="600" color="text.secondary">
                                Format:
                            </Typography>
                            <ToggleButtonGroup
                                size="small"
                                value={formatMode}
                                exclusive
                                onChange={(e, newMode) => { if (newMode) setFormatMode(newMode); }}
                                sx={{ height: 30 }}
                            >
                                <ToggleButton value="both" sx={{ fontSize: '0.72rem', px: 1.2, py: 0.2, textTransform: 'none', fontWeight: 'bold' }}>
                                    English / Hindi (साथ में)
                                </ToggleButton>
                                <ToggleButton value="hindi" sx={{ fontSize: '0.72rem', px: 1.2, py: 0.2, textTransform: 'none', fontWeight: 'bold' }}>
                                    Hindi Only (केवल हिंदी)
                                </ToggleButton>
                                <ToggleButton value="english" sx={{ fontSize: '0.72rem', px: 1.2, py: 0.2, textTransform: 'none', fontWeight: 'bold' }}>
                                    English Only
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* 1. Search Details */}
            <SectionHeader title="Search Details" />
            <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <BilingualInputField
                        label="District"
                        name="district"
                        value={data.district}
                        onChange={handleChange}
                        error={errors.district}
                        formatMode={formatMode}
                        placeholder="e.g. Karnal"
                    />
                </Grid>
            </Grid>

            {/* 2. Declaration By (Applicants) */}
            <SectionHeader title="Declaration By (Applicants)" />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Yahan Father aur Mother ka name likhein, ye Existing Record aur Certificate section me automatically fill ho jayega.
            </Typography>
            <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <BilingualInputField
                        label="Applicant Father Name"
                        name="father_name"
                        value={data.father_name}
                        onChange={handleFatherNameChange}
                        error={errors.father_name}
                        formatMode={formatMode}
                        placeholder="e.g. Ramesh Kumar"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <BilingualInputField
                        label="Applicant Mother Name"
                        name="mother_name"
                        value={data.mother_name}
                        onChange={handleMotherNameChange}
                        error={errors.mother_name}
                        formatMode={formatMode}
                        placeholder="e.g. Sunita Devi"
                    />
                </Grid>
                <Grid size={12}>
                    <BilingualInputField
                        label="Permanent Address"
                        name="permanent_address"
                        multiline
                        rows={2}
                        value={data.permanent_address}
                        onChange={handlePermanentAddressChange}
                        error={errors.permanent_address}
                        formatMode={formatMode}
                        placeholder="e.g. VPO Nilokheri, Karnal"
                    />
                </Grid>
            </Grid>

            {/* 3. Existing Birth Record Details */}
            <SectionHeader title="Existing Birth Record Details" />
            <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InputField
                        label="Issuing Authority"
                        name="issuing_authority"
                        placeholder="Zila Registrar/Nagar Nigam"
                        value={data.issuing_authority}
                        onChange={handleChange}
                        error={errors.issuing_authority}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InputField
                        label="Record Year"
                        name="record_year"
                        placeholder="e.g. 2024"
                        value={data.record_year}
                        onChange={handleChange}
                        error={errors.record_year}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InputField
                        label="Registration No."
                        name="registration_no"
                        placeholder="e.g. 12345"
                        value={data.registration_no}
                        onChange={handleChange}
                        error={errors.registration_no}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InputField
                        label="Registration Date"
                        name="date_of_registration"
                        type="date"
                        value={data.date_of_registration}
                        onChange={handleChange}
                        error={errors.date_of_registration}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <BilingualInputField
                        label="Recorded Father Name"
                        name="record_father_name"
                        required={false}
                        value={data.record_father_name}
                        onChange={handleRecordFatherChange}
                        error={errors.record_father_name}
                        formatMode={formatMode}
                        syncNotice={customized.record_father_name ? "Custom (Click to Sync)" : "Auto-synced with Father"}
                        isCustomized={customized.record_father_name}
                        onSyncClick={resyncRecordFather}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <BilingualInputField
                        label="Recorded Mother Name"
                        name="record_mother_name"
                        required={false}
                        value={data.record_mother_name}
                        onChange={handleRecordMotherChange}
                        error={errors.record_mother_name}
                        formatMode={formatMode}
                        syncNotice={customized.record_mother_name ? "Custom (Click to Sync)" : "Auto-synced with Mother"}
                        isCustomized={customized.record_mother_name}
                        onSyncClick={resyncRecordMother}
                    />
                </Grid>
            </Grid>

            {/* 4. Child Details to Add */}
            <SectionHeader title="Child Details to Add" />
            <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <BilingualInputField
                        label="Name to be Added (Child Name)"
                        name="child_name"
                        value={data.child_name}
                        onChange={handleChildNameChange}
                        error={errors.child_name}
                        formatMode={formatMode}
                        placeholder="e.g. Aryan"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SelectField
                        label="Gender"
                        name="gender"
                        value={data.gender}
                        onChange={handleChange}
                        error={errors.gender}
                        options={GENDER_OPTIONS}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField
                        label="Date of Birth"
                        name="dob"
                        type="date"
                        value={data.dob}
                        onChange={handleChange}
                        error={errors.dob}
                    />
                </Grid>
                <Grid size={12}>
                    <BilingualInputField
                        label="Address of Parents at Birth"
                        name="address_parents_birth"
                        multiline
                        rows={2}
                        value={data.address_parents_birth}
                        onChange={handleAddressParentsBirthChange}
                        error={errors.address_parents_birth}
                        formatMode={formatMode}
                        syncNotice={customized.address_parents_birth ? "Custom (Click to Sync)" : "Auto-synced with Permanent Address"}
                        isCustomized={customized.address_parents_birth}
                        onSyncClick={resyncAddressParentsBirth}
                    />
                </Grid>
            </Grid>

            {/* 5. Supporting Document (School/Metric) */}
            <SectionHeader title="Supporting Document (School/Metric)" />
            <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <BilingualInputField
                        label="Name in Certificate"
                        name="school_child_name"
                        required={false}
                        value={data.school_child_name}
                        onChange={handleSchoolChildChange}
                        error={errors.school_child_name}
                        formatMode={formatMode}
                        syncNotice={customized.school_child_name ? "Custom (Click to Sync)" : "Auto-synced with Child"}
                        isCustomized={customized.school_child_name}
                        onSyncClick={resyncSchoolChild}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InputField
                        label="DOB in Certificate"
                        name="school_dob"
                        type="date"
                        required={false}
                        value={data.school_dob}
                        onChange={handleChange}
                        error={errors.school_dob}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <BilingualInputField
                        label="Father Name in Certificate"
                        name="school_father_name"
                        required={false}
                        value={data.school_father_name}
                        onChange={handleSchoolFatherChange}
                        error={errors.school_father_name}
                        formatMode={formatMode}
                        syncNotice={customized.school_father_name ? "Custom (Click to Sync)" : "Auto-synced with Father"}
                        isCustomized={customized.school_father_name}
                        onSyncClick={resyncSchoolFather}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <BilingualInputField
                        label="Mother Name in Certificate"
                        name="school_mother_name"
                        required={false}
                        value={data.school_mother_name}
                        onChange={handleSchoolMotherChange}
                        error={errors.school_mother_name}
                        formatMode={formatMode}
                        syncNotice={customized.school_mother_name ? "Custom (Click to Sync)" : "Auto-synced with Mother"}
                        isCustomized={customized.school_mother_name}
                        onSyncClick={resyncSchoolMother}
                    />
                </Grid>
            </Grid>

            {/* Form Actions */}
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
