import React, { useState } from 'react';
import {
    Paper, Grid, Box, Button, CircularProgress, Typography, Alert,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalculateIcon from '@mui/icons-material/Calculate';
import { InputField, SectionHeader } from '../../../Components/FormInputs';

export default function SalarySlipForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel = 'Save Salary Slip',
    showSaveAndCreate = false,
    coinCost = 99,
}) {
    const [isSaveAndCreate, setIsSaveAndCreate] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleAadharChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
        const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        setData('aadhar_no', formatted);
    };

    const handlePanChange = (e) => {
        setData('pan_no', e.target.value.toUpperCase());
    };

    // Auto calculate Gross Total Salary & Total Income from Gross + Total (d)
    const handleCalculateTotals = () => {
        const gross = parseFloat(data.gross_salary || 0) || 0;
        const totalD = parseFloat(data.total_d || 0) || 0;
        const total = (gross + totalD).toFixed(2);
        setData((prev) => ({
            ...prev,
            gross_total_salary: total,
            total_income: total,
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
            noValidate
            elevation={0}
            sx={{
                p: { xs: 2.5, md: 4 },
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
            }}
        >
            {Object.keys(errors).length > 0 && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    <strong>Please check the following error(s):</strong>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                        {Object.entries(errors).map(([field, msg]) => (
                            <li key={field}>{msg}</li>
                        ))}
                    </ul>
                </Alert>
            )}

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} icon={<DescriptionIcon />}>
                Only the bold fields from the official Salary Slip are editable below.
                Upon saving, <strong>{coinCost} coins</strong> will be deducted and your complete Salary Slip will be ready to print instantly.
            </Alert>

            {/* EMPLOYER DETAILS */}
            <SectionHeader title="1. Employer Details (नियोक्ता का विवरण)" />
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <InputField
                        label="Name of Employer"
                        name="employer_name"
                        value={data.employer_name}
                        onChange={handleChange}
                        error={errors.employer_name}
                        required
                        placeholder="e.g. SUNIL MERCHANDISING"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <InputField
                        label="Joining From"
                        name="joining_date"
                        value={data.joining_date}
                        onChange={handleChange}
                        error={errors.joining_date}
                        required
                        placeholder="e.g. AUGUST 2022"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <InputField
                        label="Salary Period"
                        name="period"
                        value={data.period}
                        onChange={handleChange}
                        error={errors.period}
                        required
                        placeholder="e.g. FEBRUARY 2026"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <InputField
                        label="Address of Employer"
                        name="employer_address"
                        value={data.employer_address}
                        onChange={handleChange}
                        error={errors.employer_address}
                        required
                        multiline
                        rows={2}
                        placeholder="#03, SWASTIK COMPLEX, MOHIT PUB. SCHOOL, BABAIL ROAD, PANIPAT"
                    />
                </Grid>
            </Grid>

            {/* EMPLOYEE DETAILS */}
            <SectionHeader title="2. Employee Details (कर्मचारी का विवरण)" />
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <InputField
                        label="Name of Employee"
                        name="employee_name"
                        value={data.employee_name}
                        onChange={handleChange}
                        error={errors.employee_name}
                        required
                        placeholder="e.g. MR. GURINDER SINGH"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <InputField
                        label="PAN No."
                        name="pan_no"
                        value={data.pan_no}
                        onChange={handlePanChange}
                        error={errors.pan_no}
                        required
                        placeholder="e.g. FZNPS0647Q"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <InputField
                        label="Aadhaar No."
                        name="aadhar_no"
                        value={data.aadhar_no}
                        onChange={handleAadharChange}
                        error={errors.aadhar_no}
                        required
                        placeholder="e.g. 4473 1131 0719"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <InputField
                        label="Address of Employee"
                        name="employee_address"
                        value={data.employee_address}
                        onChange={handleChange}
                        error={errors.employee_address}
                        required
                        multiline
                        rows={2}
                        placeholder="SAS NAGAR, KURLI MOHALI, PUNJAB"
                    />
                </Grid>
            </Grid>

            {/* BASIC DETAILS OF PAY */}
            <SectionHeader title="3. Basic Details of Pay (वेतन का विवरण)" />
            <Grid container spacing={2.5} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <InputField
                        label="1. Gross Salary (INR)"
                        name="gross_salary"
                        value={data.gross_salary}
                        onChange={handleChange}
                        error={errors.gross_salary}
                        required
                        placeholder="48500.00"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InputField
                        label="1(d). Total Perquisites/Profit (INR)"
                        name="total_d"
                        value={data.total_d}
                        onChange={handleChange}
                        error={errors.total_d}
                        required
                        placeholder="6500.00"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InputField
                        label="8. Gross Total Salary (INR)"
                        name="gross_total_salary"
                        value={data.gross_total_salary}
                        onChange={handleChange}
                        error={errors.gross_total_salary}
                        required
                        placeholder="55000.00"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InputField
                        label="11. Total Income (INR)"
                        name="total_income"
                        value={data.total_income}
                        onChange={handleChange}
                        error={errors.total_income}
                        required
                        placeholder="55000.00"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        startIcon={<CalculateIcon />}
                        onClick={handleCalculateTotals}
                        sx={{ textTransform: 'none' }}
                    >
                        Auto-Calculate Gross Total & Total Income (1 + 1d)
                    </Button>
                </Grid>
            </Grid>

            {/* EXPANDABLE OTHER BREAKDOWN FIGURES */}
            <Accordion sx={{ mb: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: '8px !important' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                        Additional Pay & Tax Breakdown Fields (Default 0.00)
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="HRA Exemption" name="hra_exemption" value={data.hra_exemption} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="Leave Salary Exemption" name="leave_salary_exemption" value={data.leave_salary_exemption} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="3. Balance (1-2)" name="balance_3" value={data.balance_3} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="Entertainment Allowance" name="entertainment_allowance" value={data.entertainment_allowance} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="Tax on Employment" name="tax_on_employment" value={data.tax_on_employment} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="5. Aggregate of 4(a) & 4(b)" name="aggregate_5" value={data.aggregate_5} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="6. Income Under Salary" name="income_salary_6" value={data.income_salary_6} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="7. Any Other Income" name="other_income_7" value={data.other_income_7 || ''} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="9. Deduction 80C/CCC/CCD" name="deduction_80c" value={data.deduction_80c} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="Home Loan Principal" name="home_loan_principal" value={data.home_loan_principal} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="Note 1 Aggregate 80C" name="note_1_aggregate" value={data.note_1_aggregate || '0.00'} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="Section 80C(01)" name="section_80c01" value={data.section_80c01} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="Section 80D" name="section_80d" value={data.section_80d} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="10. Chapter VI-A Aggregate" name="aggregate_deductible_10" value={data.aggregate_deductible_10} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="12. Tax on Total Income" name="tax_on_total_income" value={data.tax_on_total_income} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="13. Education Cess @ 3%" name="education_cess" value={data.education_cess} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="14. Tax Payable (12+13)" name="tax_payable_14" value={data.tax_payable_14} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="15. Relief u/s 89" name="relief_89" value={data.relief_89} onChange={handleChange} required={false} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InputField label="16. Tax Payable (14-15)" name="tax_payable_16" value={data.tax_payable_16} onChange={handleChange} required={false} />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* VERIFICATION DETAILS */}
            <SectionHeader title="4. Verification Details (सत्यापन विवरण)" />
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <InputField
                        label="Verification Full Name"
                        name="verification_name"
                        value={data.verification_name}
                        onChange={handleChange}
                        error={errors.verification_name}
                        required
                        placeholder="e.g. GURINDER SINGH"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <InputField
                        label="Relation Title"
                        name="verification_relation_title"
                        value={data.verification_relation_title}
                        onChange={handleChange}
                        error={errors.verification_relation_title}
                        required
                        placeholder="wife/son/daughter of"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <InputField
                        label="Relation Name (Father/Husband)"
                        name="verification_relation_name"
                        value={data.verification_relation_name}
                        onChange={handleChange}
                        error={errors.verification_relation_name}
                        required
                        placeholder="e.g. MR. NASIB SINGH"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <InputField
                        label="Working Designation"
                        name="verification_designation"
                        value={data.verification_designation}
                        onChange={handleChange}
                        error={errors.verification_designation}
                        required
                        placeholder="e.g. BUSINESS DEVELOPMENT MANAGER (REMOTLY)"
                    />
                </Grid>
            </Grid>

            {/* SIGNATORY DETAILS */}
            <SectionHeader title="5. Signatory Details (हस्ताक्षरकर्ता विवरण)" />
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <InputField
                        label="Place"
                        name="signatory_place"
                        value={data.signatory_place}
                        onChange={handleChange}
                        error={errors.signatory_place}
                        required
                        placeholder="e.g. PANIPAT"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <InputField
                        label="Signatory Full Name"
                        name="signatory_name"
                        value={data.signatory_name}
                        onChange={handleChange}
                        error={errors.signatory_name}
                        required
                        placeholder="e.g. SUNIL KUMAR"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <InputField
                        label="Signatory Designation"
                        name="signatory_designation"
                        value={data.signatory_designation}
                        onChange={handleChange}
                        error={errors.signatory_designation}
                        required
                        placeholder="e.g. DIRECTOR"
                    />
                </Grid>
            </Grid>

            {/* SUBMIT BUTTONS */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end', pt: 2, borderTop: '1px solid #f1f5f9' }}>
                {showSaveAndCreate && (
                    <Button
                        type="submit"
                        variant="outlined"
                        color="primary"
                        disabled={processing}
                        onClick={() => setIsSaveAndCreate(true)}
                        startIcon={processing && isSaveAndCreate ? <CircularProgress size={18} /> : null}
                    >
                        Save & Create Another
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={processing}
                    onClick={() => setIsSaveAndCreate(false)}
                    startIcon={processing && !isSaveAndCreate ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    sx={{ px: 4, py: 1.2, fontWeight: 700, borderRadius: 2 }}
                >
                    {submitLabel} ({coinCost} Coins)
                </Button>
            </Box>
        </Paper>
    );
}
