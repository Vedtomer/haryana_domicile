import React, { useState } from 'react';
import { Paper, Grid, Box, Button, CircularProgress, Typography, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import DescriptionIcon from '@mui/icons-material/Description';
import { InputField, SelectField, SectionHeader } from '../../../Components/FormInputs';

function numberToWordsINR(amount) {
    const num = parseInt(String(amount).replace(/[^0-9]/g, ''), 10);
    if (isNaN(num) || num === 0) return '';

    const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n) {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
        if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
        return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
    }

    return `Rupees ${inWords(num)} only`;
}

export default function RentAgreementForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel = 'Save Rent Agreement',
    showSaveAndCreate = false,
    coinCost = 149
}) {
    const [isSaveAndCreate, setIsSaveAndCreate] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleAadharChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
        // format as XXXX XXXX XXXX
        const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        setData('first_party_aadhar', formatted);
    };

    const handleSecondPartyAadharChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
        // format as XXXX XXXX XXXX
        const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        setData('second_party_aadhar', formatted);
    };

    const handleRentChange = (e) => {
        const val = e.target.value;
        const words = numberToWordsINR(val);
        setData((prev) => ({
            ...prev,
            monthly_rent: val,
            monthly_rent_words: words || prev.monthly_rent_words,
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(e, isSaveAndCreate);
    };

    return (
        <Paper
            component="form"
            onSubmit={handleFormSubmit}
            elevation={0}
            sx={{
                p: { xs: 2.5, md: 4 },
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
            }}
        >
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} icon={<DescriptionIcon />}>
                Only the bold fields from the 2-page Rent Agreement format are editable below.
                Upon saving, <strong>{coinCost} coins</strong> will be deducted and your complete 2-page document with stamps and notary attestation will be ready to print instantly.
            </Alert>

            {/* FIRST PARTY / TENANT DETAILS */}
            <SectionHeader title="1. First Party (Tenant / किराएदार) Details" />
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <InputField
                        label="Tenant Full Name"
                        name="first_party_name"
                        value={data.first_party_name}
                        onChange={handleChange}
                        error={errors.first_party_name}
                        placeholder="e.g. Satyal"
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <InputField
                        label="Tenant Aadhaar Number"
                        name="first_party_aadhar"
                        value={data.first_party_aadhar}
                        onChange={handleAadharChange}
                        error={errors.first_party_aadhar}
                        placeholder="e.g. XXXX XXXX 2430"
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <InputField
                        label="Tenant Father / Husband Name"
                        name="first_party_father_name"
                        value={data.first_party_father_name}
                        onChange={handleChange}
                        error={errors.first_party_father_name}
                        placeholder="e.g. Chunni Lal"
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <InputField
                        label="Tenant Full Address"
                        name="first_party_address"
                        value={data.first_party_address}
                        onChange={handleChange}
                        error={errors.first_party_address}
                        placeholder="e.g. House No. 1998, Dhoop Singh Nagar, Ward 12, Panipat"
                        required
                    />
                </Grid>
            </Grid>

            {/* SECOND PARTY / LANDLORD DETAILS */}
            <SectionHeader title="2. Second Party (Landlord / मकान/दुकान मालिक) Details" />
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <InputField
                        label="Landlord Full Name"
                        name="second_party_name"
                        value={data.second_party_name}
                        onChange={handleChange}
                        error={errors.second_party_name}
                        placeholder="e.g. Ved Prkash"
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InputField
                        label="Landlord Aadhaar Number"
                        name="second_party_aadhar"
                        value={data.second_party_aadhar}
                        onChange={handleSecondPartyAadharChange}
                        error={errors.second_party_aadhar}
                        placeholder="e.g. 4044 5705 6996"
                        required={false}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InputField
                        label="Landlord Father Name"
                        name="second_party_father_name"
                        value={data.second_party_father_name}
                        onChange={handleChange}
                        error={errors.second_party_father_name}
                        placeholder="e.g. Jograj"
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InputField
                        label="Owner Title / Role"
                        name="property_owner_title"
                        value={data.property_owner_title}
                        onChange={handleChange}
                        error={errors.property_owner_title}
                        placeholder="e.g. Warehouse Owner or House Owner"
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <InputField
                        label="Landlord Full Address"
                        name="second_party_address"
                        value={data.second_party_address}
                        onChange={handleChange}
                        error={errors.second_party_address}
                        placeholder="e.g. Village Bargwan, Bareilly, UP 293303"
                        required
                    />
                </Grid>
            </Grid>

            {/* PROPERTY DETAILS */}
            <SectionHeader title="3. Property Details (किराए पर दी जाने वाली संपत्ति)" />
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <InputField
                        label="Property Type"
                        name="property_type"
                        value={data.property_type}
                        onChange={handleChange}
                        error={errors.property_type}
                        placeholder="e.g. warehouse, house, shop, flat"
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InputField
                        label="Property Area / Size"
                        name="property_area"
                        value={data.property_area}
                        onChange={handleChange}
                        error={errors.property_area}
                        placeholder="e.g. 80 square yards"
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InputField
                        label="Property City / Municipality"
                        name="property_city"
                        value={data.property_city}
                        onChange={handleChange}
                        error={errors.property_city}
                        placeholder="e.g. Panipat"
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InputField
                        label="Tenancy Period (Months)"
                        name="tenancy_months"
                        type="number"
                        value={data.tenancy_months}
                        onChange={handleChange}
                        error={errors.tenancy_months}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <InputField
                        label="Property Location / Landmark"
                        name="property_location"
                        value={data.property_location}
                        onChange={handleChange}
                        error={errors.property_location}
                        placeholder="e.g. situated on Barsat Road, near Barsat Road Chungi"
                        required
                    />
                </Grid>
            </Grid>

            {/* TENANCY & RENT TERMS */}
            <SectionHeader title="4. Tenancy Dates & Monthly Rent (किराया एवं अवधि)" />
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <InputField
                        label="From Date (DD/MM/YYYY)"
                        name="from_date"
                        value={data.from_date}
                        onChange={handleChange}
                        error={errors.from_date}
                        placeholder="e.g. 04/08/2026"
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <InputField
                        label="To Date (DD/MM/YYYY)"
                        name="to_date"
                        value={data.to_date}
                        onChange={handleChange}
                        error={errors.to_date}
                        placeholder="e.g. 03/07/2027"
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <InputField
                        label="Agreement Execution Date"
                        name="agreement_date"
                        value={data.agreement_date}
                        onChange={handleChange}
                        error={errors.agreement_date}
                        placeholder="e.g. 04/08/2026"
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <InputField
                        label="Monthly Rent (Rs.)"
                        name="monthly_rent"
                        value={data.monthly_rent}
                        onChange={handleRentChange}
                        error={errors.monthly_rent}
                        placeholder="e.g. 20,000"
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={8}>
                    <InputField
                        label="Monthly Rent in Words"
                        name="monthly_rent_words"
                        value={data.monthly_rent_words}
                        onChange={handleChange}
                        error={errors.monthly_rent_words}
                        placeholder="e.g. Rupees Twenty Thousand only"
                        required
                    />
                </Grid>
            </Grid>

            {/* SUBMIT BUTTONS */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', pt: 2, borderTop: '1px solid #f1f5f9' }}>
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={processing}
                    onClick={() => setIsSaveAndCreate(false)}
                    startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        px: 4,
                        py: 1.2,
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                    }}
                >
                    {submitLabel}
                </Button>

                {showSaveAndCreate && (
                    <Button
                        type="submit"
                        variant="outlined"
                        size="large"
                        disabled={processing}
                        onClick={() => setIsSaveAndCreate(true)}
                        sx={{
                            px: 3,
                            py: 1.2,
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 2,
                        }}
                    >
                        Save & Create Another
                    </Button>
                )}
            </Box>
        </Paper>
    );
}
