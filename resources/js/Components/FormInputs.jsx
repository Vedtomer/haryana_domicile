import React from 'react';
import { TextField, Box, Typography, Divider } from '@mui/material';

export const InputField = ({ 
    label, 
    name, 
    type = "text", 
    multiline = false, 
    rows = 1, 
    value, 
    onChange, 
    error, 
    required = true,
    ...props 
}) => (
    <TextField
        fullWidth
        label={label}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        error={!!error}
        helperText={error}
        multiline={multiline}
        rows={rows}
        variant="outlined"
        required={required}
        InputLabelProps={type === 'date' || value ? { shrink: true } : {}}
        {...props}
    />
);

export const SectionHeader = ({ title, ...props }) => (
    <Box sx={{ mt: 4, mb: 2 }} {...props}>
        <Typography variant="h6" color="primary" fontWeight="bold">
            {title}
        </Typography>
        <Divider />
    </Box>
);
