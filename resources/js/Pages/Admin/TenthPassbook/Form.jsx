import React, { useState } from 'react';
import { Paper, Grid, Box, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { InputField, SectionHeader } from '../../../Components/FormInputs';

export default function TenthPassbookFields({ data, setData, errors, processing, onSubmit, submitLabel, showSaveAndCreate = false, isEdit = false, currentImagePath = null }) {
    const handleChange = (e) => setData(e.target.name, e.target.value);
    const [isSaveAndCreate, setIsSaveAndCreate] = useState(false);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(e, isSaveAndCreate);
    };

    const handleImageChange = (e) => {
        setData('image', e.target.files[0]);
    };

    return (
        <Paper component="form" onSubmit={handleFormSubmit} elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <SectionHeader title="10th Passbook Information" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Name" name="name" value={data.name} onChange={handleChange} error={errors.name} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Father's Name" name="father_name" value={data.father_name} onChange={handleChange} error={errors.father_name} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Mother's Name" name="mother_name" value={data.mother_name} onChange={handleChange} error={errors.mother_name} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <InputField label="Date of Birth" name="dob" placeholder="DD/MM/YYYY" value={data.dob} onChange={handleChange} error={errors.dob} />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ mt: 2 }}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Passport Photo {isEdit && '(Leave empty to keep existing)'}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                        
                        {isEdit && currentImagePath && (
                            <Box sx={{ mt: 2 }}>
                                <p className="text-sm text-gray-500 mb-1">Current Image:</p>
                                <img src={`/storage/${currentImagePath}`} alt="Current" className="h-24 w-24 object-cover rounded border border-gray-200" />
                            </Box>
                        )}
                    </Box>
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
