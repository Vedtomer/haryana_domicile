import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Box, Typography, TextField, Button, Paper, Alert,
    CircularProgress, RadioGroup, FormControlLabel, Radio,
    Checkbox, Grid, Divider, Table, TableHead, TableRow,
    TableCell, TableBody, Chip, MenuItem
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PrintIcon from '@mui/icons-material/Print';
import PostAddIcon from '@mui/icons-material/PostAdd';
import axios from 'axios';

export default function BirthCertificateDownload({ recentRecords = [], defaultRegNo = '' }) {
    const [registrationNo, setRegistrationNo] = useState(defaultRegNo);
    const [colorMode, setColorMode] = useState('blue');
    const [showBorder, setShowBorder] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showQuickForm, setShowQuickForm] = useState(false);

    // Quick Form State
    const [quickForm, setQuickForm] = useState({
        child_name: '',
        gender: 'Male',
        dob: '',
        father_name: '',
        mother_name: '',
        district: '',
        permanent_address: '',
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        const cleanNo = registrationNo.trim();
        if (!cleanNo) return;

        setIsSearching(true);
        setErrorMessage('');
        setSuccessMessage('');
        setShowQuickForm(false);

        try {
            const res = await axios.post('/utilities/birth-certificate/search', {
                registration_no: cleanNo,
                color: colorMode,
                border: showBorder,
            });

            if (res.data.success && res.data.print_url) {
                setSuccessMessage(res.data.message || 'Record found! Opening PDF...');
                window.open(res.data.print_url, '_blank');
            } else {
                setErrorMessage(res.data.message || 'Record not found.');
                if (res.data.not_found) {
                    setShowQuickForm(true);
                }
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Error occurred while searching certificate.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleQuickGenerate = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setErrorMessage('');

        try {
            const res = await axios.post('/utilities/birth-certificate/quick-generate', {
                registration_no: registrationNo.trim(),
                color: colorMode,
                border: showBorder,
                ...quickForm,
            });

            if (res.data.success && res.data.print_url) {
                setSuccessMessage('Birth Certificate declaration generated successfully! Opening PDF...');
                setShowQuickForm(false);
                window.open(res.data.print_url, '_blank');
            } else {
                setErrorMessage(res.data.message || 'Failed to generate certificate.');
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Error generating declaration.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AdminLayout header={
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-slate-200 leading-tight">
                        Birth Certificate Download
                    </h2>
                </div>

                <Link
                    href="/admin/birth-records"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                    <PostAddIcon sx={{ fontSize: 18 }} />
                    Name Add Form & Records →
                </Link>
            </div>
        }>
            <Head title="Birth Certificate Download" />

            <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
                
                {/* Search & Download Card */}
                <Paper elevation={0} className="border border-slate-200/80 dark:border-slate-800 shadow-md p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 relative overflow-hidden">
                    <div className="flex flex-col items-center max-w-xl mx-auto text-center">
                        
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-blue-500/30">
                            <ChildCareIcon sx={{ fontSize: 36 }} />
                        </div>

                        <Typography variant="h5" fontWeight="900" className="text-slate-900 dark:text-white mb-2 tracking-tight">
                            Instant Birth Certificate PDF
                        </Typography>

                        <Typography variant="body2" className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            Enter the Birth Certificate Registration Number / Application Number to download or print your certificate declaration.
                        </Typography>

                        {errorMessage && (
                            <Alert severity="error" className="w-full mb-4 text-left rounded-xl" onClose={() => setErrorMessage('')}>
                                {errorMessage}
                            </Alert>
                        )}

                        {successMessage && (
                            <Alert severity="success" className="w-full mb-4 text-left rounded-xl" onClose={() => setSuccessMessage('')}>
                                {successMessage}
                            </Alert>
                        )}

                        <form onSubmit={handleSearch} className="w-full space-y-5 text-left">
                            <TextField
                                fullWidth
                                label="Birth Certificate / Registration Number"
                                variant="outlined"
                                value={registrationNo}
                                onChange={(e) => {
                                    setRegistrationNo(e.target.value);
                                    if (errorMessage) setErrorMessage('');
                                }}
                                required
                                placeholder="e.g. 2024/12345 or B-XXXXX"
                                helperText="पंजीकरण संख्या या सर्टिफिकेट नंबर दर्ज करें"
                                InputProps={{
                                    className: "bg-slate-50/50 dark:bg-slate-800/50",
                                    sx: { borderRadius: '12px' }
                                }}
                            />

                            {/* Color Selection Options */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                                <Typography variant="caption" className="font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider">
                                    PDF Color Mode (कलर विकल्प)
                                </Typography>
                                
                                <RadioGroup
                                    row
                                    value={colorMode}
                                    onChange={(e) => setColorMode(e.target.value)}
                                    className="flex gap-4"
                                >
                                    <FormControlLabel
                                        value="blue"
                                        control={<Radio size="small" color="primary" />}
                                        label={
                                            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                                                Color (रंगीन / Blue Ink)
                                            </span>
                                        }
                                    />
                                    <FormControlLabel
                                        value="bw"
                                        control={<Radio size="small" color="default" />}
                                        label={
                                            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                <span className="w-3 h-3 rounded-full bg-slate-900 inline-block"></span>
                                                B&W (सादा / Black & White)
                                            </span>
                                        }
                                    />
                                </RadioGroup>

                                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={showBorder}
                                                onChange={(e) => setShowBorder(e.target.checked)}
                                            />
                                        }
                                        label={<span className="text-xs font-medium text-slate-600 dark:text-slate-400">आधिकारिक डबल बॉर्डर लगाएं (Official Double Border)</span>}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={!registrationNo.trim() || isSearching}
                                startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
                                sx={{
                                    py: 1.6,
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontSize: '1.05rem',
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(to right, #2563eb, #3b82f6)',
                                    boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.35)',
                                    '&:hover': {
                                        background: 'linear-gradient(to right, #1d4ed8, #2563eb)',
                                    }
                                }}
                            >
                                {isSearching ? 'Searching Certificate...' : 'Download Birth Certificate PDF'}
                            </Button>

                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                                <Link
                                    href="/admin/birth-records/create"
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
                                >
                                    <PostAddIcon sx={{ fontSize: 16 }} />
                                    नया नाम जुड़वाने हेतु घोषणा पत्र भरें (Birth Certificate Name Add Form) →
                                </Link>
                            </div>
                        </form>

                    </div>
                </Paper>

                {/* Quick Generate Form (If record not found) */}
                {showQuickForm && (
                    <Paper elevation={0} className="border-2 border-blue-400 dark:border-blue-700 p-6 sm:p-8 rounded-2xl bg-blue-50/30 dark:bg-slate-900 shadow-lg animate-fadeIn">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                                <PostAddIcon />
                            </div>
                            <div>
                                <Typography variant="h6" fontWeight="bold" className="text-slate-900 dark:text-white">
                                    नया घोषणा पत्र / PDF जनरेट करें
                                </Typography>
                                <Typography variant="caption" className="text-slate-600 dark:text-slate-400">
                                    रजिस्ट्रेशन नंबर <strong>"{registrationNo}"</strong> के लिए नीचे दिए विवरण भरें और 1-क्लिक में PDF डाउनलोड करें:
                                </Typography>
                            </div>
                        </div>

                        <form onSubmit={handleQuickGenerate} className="space-y-4">
                            <Grid container spacing={2.5}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Child Name (बच्चे का नाम)"
                                        required
                                        value={quickForm.child_name}
                                        onChange={(e) => setQuickForm({ ...quickForm, child_name: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        select
                                        size="small"
                                        label="Gender"
                                        value={quickForm.gender}
                                        onChange={(e) => setQuickForm({ ...quickForm, gender: e.target.value })}
                                    >
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                        <MenuItem value="Transgender">Transgender</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        size="small"
                                        label="DOB (जन्म तिथि)"
                                        InputLabelProps={{ shrink: true }}
                                        required
                                        value={quickForm.dob}
                                        onChange={(e) => setQuickForm({ ...quickForm, dob: e.target.value })}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Father Name (पिता का नाम)"
                                        required
                                        value={quickForm.father_name}
                                        onChange={(e) => setQuickForm({ ...quickForm, father_name: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Mother Name (माता का नाम)"
                                        required
                                        value={quickForm.mother_name}
                                        onChange={(e) => setQuickForm({ ...quickForm, mother_name: e.target.value })}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="District (जिला)"
                                        required
                                        value={quickForm.district}
                                        onChange={(e) => setQuickForm({ ...quickForm, district: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Permanent Address (स्थायी पता)"
                                        required
                                        value={quickForm.permanent_address}
                                        onChange={(e) => setQuickForm({ ...quickForm, permanent_address: e.target.value })}
                                    />
                                </Grid>
                            </Grid>

                            <div className="pt-3 flex justify-end gap-3">
                                <Button
                                    variant="outlined"
                                    onClick={() => setShowQuickForm(false)}
                                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="success"
                                    disabled={isGenerating}
                                    startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <FileDownloadIcon />}
                                    sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 'bold', px: 3 }}
                                >
                                    {isGenerating ? 'Generating PDF...' : 'तुरंत PDF बनाएं व डाउनलोड करें'}
                                </Button>
                            </div>
                        </form>
                    </Paper>
                )}

                {/* Recent Birth Certificates Table */}
                {recentRecords.length > 0 && (
                    <Paper elevation={0} className="border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <Typography variant="h6" fontWeight="bold" className="text-slate-900 dark:text-white text-base">
                                    Recent Birth Certificates
                                </Typography>
                                <Typography variant="caption" className="text-slate-500">
                                    हाल ही में जनरेट किए गए जन्म प्रमाण पत्र घोषणा पत्र
                                </Typography>
                            </div>
                            <Link
                                href="/admin/birth-records"
                                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                            >
                                View All Records &rarr;
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '12px' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '12px' }}>Reg. No.</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '12px' }}>Child Name</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '12px' }}>Father Name</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '12px' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentRecords.map((r) => (
                                        <TableRow key={r.id} hover>
                                            <TableCell sx={{ fontSize: '13px' }}>
                                                {new Date(r.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '13px', fontWeight: 600, color: '#1d4ed8' }}>
                                                {r.registration_no}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>
                                                {r.child_name}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '13px', color: '#64748b' }}>
                                                {r.father_name}
                                            </TableCell>
                                            <TableCell align="right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="primary"
                                                        component="a"
                                                        href={`/birth-records/${r.id}/print?color=blue&auto=1`}
                                                        target="_blank"
                                                        sx={{ fontSize: '11px', textTransform: 'none', py: 0.5, px: 1.5, borderRadius: '6px' }}
                                                    >
                                                        Color PDF
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="inherit"
                                                        component="a"
                                                        href={`/birth-records/${r.id}/print?color=bw&auto=1`}
                                                        target="_blank"
                                                        sx={{ fontSize: '11px', textTransform: 'none', py: 0.5, px: 1.5, borderRadius: '6px' }}
                                                    >
                                                        B&W
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Paper>
                )}

            </div>
        </AdminLayout>
    );
}
