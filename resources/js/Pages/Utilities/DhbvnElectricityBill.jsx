import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';

export default function DhbvnElectricityBill() {
    const [accountNumber, setAccountNumber] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleDownload = async (e) => {
        e.preventDefault();
        const digitsOnly = accountNumber.replace(/\D/g, '');
        if (digitsOnly.length < 5) return;

        setIsDownloading(true);
        setErrorMessage('');
        setSuccessMessage('');

        const targetUrl = `/utilities/dhbvn-electricity-bill/download?uid=${digitsOnly}`;

        try {
            const response = await fetch(targetUrl);
            const contentType = response.headers.get('content-type') || '';

            if (response.ok && contentType.toLowerCase().includes('application/pdf')) {
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `DHBVN_Electricity_Bill_${digitsOnly}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(blobUrl);

                setSuccessMessage(`DHBVN Electricity Bill downloaded successfully for Account ${digitsOnly}!`);
            } else {
                setErrorMessage(`Bill not found on DHBVN for Account Number "${digitsOnly}". Please check your Account Number.`);
            }
        } catch (err) {
            window.location.href = targetUrl;
        } finally {
            setIsDownloading(false);
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
                    DHBVN Electricity Bill Download
                </h2>
            </div>
        }>
            <Head title="DHBVN Electricity Bill" />

            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <Paper elevation={0} className="border border-slate-200/60 dark:border-slate-800 shadow-md p-8 rounded-2xl overflow-hidden relative bg-white dark:bg-slate-900">
                    {/* Decorative Background Icon */}
                    <ElectricBoltIcon 
                        className="absolute -top-10 -right-10 text-amber-500/10 dark:text-amber-400/5 pointer-events-none" 
                        sx={{ fontSize: 200 }} 
                    />

                    <div className="relative z-10 flex flex-col items-center max-w-md mx-auto text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-amber-500/30">
                            <ElectricBoltIcon fontSize="large" />
                        </div>
                        
                        <Typography variant="h4" fontWeight="900" className="text-slate-800 dark:text-white mb-2 font-sans tracking-tight">
                            DHBVN Instant Bill PDF
                        </Typography>
                        
                        <Typography variant="body1" className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            Enter your DHBVN Account Number (UID) below to instantly view and download your electricity bill.
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

                        <form onSubmit={handleDownload} className="w-full flex flex-col gap-4">
                            <TextField
                                fullWidth
                                label="DHBVN Account Number (UID)"
                                variant="outlined"
                                value={accountNumber}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setAccountNumber(val);
                                    if (errorMessage) setErrorMessage('');
                                }}
                                required
                                placeholder="e.g. 6894882000"
                                InputProps={{
                                    className: "bg-white dark:bg-slate-800",
                                    sx: { borderRadius: '12px' }
                                }}
                            />
                            
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={!accountNumber || accountNumber.length < 5 || isDownloading}
                                startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
                                sx={{
                                    py: 1.5,
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontSize: '1.05rem',
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(to right, #f59e0b, #f97316)',
                                    boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.39)',
                                    '&:hover': {
                                        background: 'linear-gradient(to right, #d97706, #ea580c)',
                                        boxShadow: '0 6px 20px rgba(245, 158, 11, 0.23)'
                                    }
                                }}
                            >
                                {isDownloading ? 'Downloading DHBVN Bill...' : 'Download DHBVN Bill'}
                            </Button>
                        </form>

                        <Alert severity="info" className="mt-8 text-left rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                            <strong>Note:</strong> This service is provided directly via DHBVN portal (Dakshin Haryana) and is completely free of charge. No coins will be deducted.
                        </Alert>
                    </div>
                </Paper>
            </div>
        </AdminLayout>
    );
}
