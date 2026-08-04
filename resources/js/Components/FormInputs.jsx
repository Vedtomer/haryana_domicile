import React from 'react';
import { TextField, Box, Typography, Divider, MenuItem } from '@mui/material';

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
    size = "small",
    ...props
}) => (
    <TextField
        fullWidth
        size={size}
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
        {...(type === 'date' ? { slotProps: { inputLabel: { shrink: true } } } : {})}
        {...props}
    />
);

export const SelectField = ({
    label,
    name,
    value,
    onChange,
    error,
    required = true,
    options = [],
    size = "small",
    ...props
}) => (
    <TextField
        select
        fullWidth
        size={size}
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        error={!!error}
        helperText={error}
        variant="outlined"
        required={required}
        {...props}
    >
        {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
            </MenuItem>
        ))}
    </TextField>
);

export const SectionHeader = ({ title, ...props }) => (
    <Box sx={{ mt: 4, mb: 2 }} {...props}>
        <Typography variant="h6" color="primary" fontWeight="bold">
            {title}
        </Typography>
        <Divider />
    </Box>
);
