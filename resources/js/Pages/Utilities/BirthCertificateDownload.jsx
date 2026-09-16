import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Box, Typography, TextField, Button, Paper, Alert,
    CircularProgress, RadioGroup, FormControlLabel, Radio,
    Checkbox
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import axios from 'axios';

export default function BirthCertificateDownload({ defaultRegNo = '' }) {
    const [registrationNo, setRegistrationNo] = useState(defaultRegNo);
    const [colorMode, setColorMode] = useState('blue');
    const [showBorder, setShowBorder] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        const cleanNo = registrationNo.trim();
        if (!cleanNo) return;

        setIsSearching(true);
        setErrorMessage('');
        setSuccessMessage('');

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
                setErrorMessage(res.data.message || 'इस रजिस्ट्रेशन नंबर का कोई रिकॉर्ड नहीं मिला।');
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'इस रजिस्ट्रेशन नंबर का कोई रिकॉर्ड नहीं मिला। कृपया सही रजिस्ट्रेशन नंबर दर्ज करें।');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <AdminLayout header={
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
        }>
            <Head title="Birth Certificate Download" />

            <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                
                {/* Search & Download Card */}
                <Paper elevation={0} className="border border-slate-200/80 dark:border-slate-800 shadow-md p-6 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 relative overflow-hidden">
                    <div className="flex flex-col items-center max-w-lg mx-auto text-center">
                        
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-blue-500/30">
                            <ChildCareIcon sx={{ fontSize: 36 }} />
                        </div>

                        <Typography variant="h5" fontWeight="900" className="text-slate-900 dark:text-white mb-2 tracking-tight">
                            Instant Birth Certificate PDF
                        </Typography>

                        <Typography variant="body2" className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            अपना जन्म प्रमाण पत्र / रजिस्ट्रेशन नंबर दर्ज करें और तुरंत PDF डाउनलोड करें।
                        </Typography>

                        {errorMessage && (
                            <Alert severity="error" className="w-full mb-5 text-left rounded-xl" onClose={() => setErrorMessage('')}>
                                {errorMessage}
                            </Alert>
                        )}

                        {successMessage && (
                            <Alert severity="success" className="w-full mb-5 text-left rounded-xl" onClose={() => setSuccessMessage('')}>
                                {successMessage}
                            </Alert>
                        )}

                        <form onSubmit={handleSearch} className="w-full space-y-6 text-left">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                    Birth Certificate / Registration Number *
                                </label>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="e.g. B-2024: 06-90403-000001 या रजिस्ट्रेशन नंबर"
                                    value={registrationNo}
                                    onChange={(e) => {
                                        setRegistrationNo(e.target.value);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    autoFocus
                                    required
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc',
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                        }
                                    }}
                                />
                            </div>

                            {/* Color Selection & Options */}
                            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
                                <div>
                                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        PDF Color Mode (रंग चयन)
                                    </span>
                                    <RadioGroup
                                        row
                                        value={colorMode}
                                        onChange={(e) => setColorMode(e.target.value)}
                                        className="gap-4"
                                    >
                                        <FormControlLabel
                                            value="blue"
                                            control={<Radio size="small" color="primary" />}
                                            label={
                                                <span className="text-xs font-semibold flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                                                    Color (रंगीन / Blue Ink)
                                                </span>
                                            }
                                        />
                                        <FormControlLabel
                                            value="bw"
                                            control={<Radio size="small" color="default" />}
                                            label={
                                                <span className="text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block"></span>
                                                    B&W (सादा / Black & White)
                                                </span>
                                            }
                                        />
                                    </RadioGroup>
                                </div>

                                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60">
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
                        </form>

                    </div>
                </Paper>

            </div>
        </AdminLayout>
    );
}
