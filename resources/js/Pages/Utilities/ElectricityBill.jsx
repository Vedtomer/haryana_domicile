import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Paper, 
    Alert, 
    CircularProgress 
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function ElectricityBill({ defaultDiscom = 'dhbvn' }) {
    const { currentService } = usePage().props;
    const [discom, setDiscom] = useState(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const fromUrl = urlParams.get('discom');
            if (fromUrl === 'uhbvn' || fromUrl === 'dhbvn') return fromUrl;
        }
        return defaultDiscom || 'dhbvn';
    });

    const [accountNumber, setAccountNumber] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (defaultDiscom && (defaultDiscom === 'dhbvn' || defaultDiscom === 'uhbvn')) {
            setDiscom(defaultDiscom);
        }
    }, [defaultDiscom]);

    const handleDownload = async (e) => {
        e.preventDefault();
        const digitsOnly = accountNumber.replace(/\D/g, '');
        if (digitsOnly.length < 5) return;

        setIsDownloading(true);
        setErrorMessage('');
        setSuccessMessage('');

        const targetUrl = `/utilities/electricity-bill/download?uid=${digitsOnly}&discom=${discom}`;

        try {
            const response = await fetch(targetUrl, {
                headers: {
                    'Accept': 'application/pdf, text/html, */*'
                }
            });

            const contentType = response.headers.get('content-type') || '';

            if (response.ok && contentType.toLowerCase().includes('application/pdf')) {
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `${discom.toUpperCase()}_Electricity_Bill_${digitsOnly}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(blobUrl);

                setSuccessMessage(`${discom.toUpperCase()} Electricity Bill downloaded successfully!`);
            } else {
                const otherDiscom = discom === 'dhbvn' ? 'UHBVN' : 'DHBVN';
                setErrorMessage(
                    `Bill not found for Account Number "${digitsOnly}" on ${discom.toUpperCase()}. Please verify the number or try switching to ${otherDiscom}.`
                );
            }
        } catch (err) {
            // Fallback to direct navigation if fetch failed
            window.location.href = targetUrl;
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <AdminLayout header={
            <h2 className="font-semibold text-xl text-gray-800 dark:text-slate-200 leading-tight">
                Haryana Electricity Bill Download
            </h2>
        }>
            <Head title={`${discom.toUpperCase()} Electricity Bill`} />

            <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <Paper elevation={0} className="border border-slate-200/80 shadow-md p-6 sm:p-10 rounded-2xl overflow-hidden relative bg-white dark:bg-slate-900">
                    {/* Decorative Background Icon */}
                    <ElectricBoltIcon 
                        className="absolute -top-10 -right-10 text-amber-500/10 dark:text-amber-400/5 pointer-events-none" 
                        sx={{ fontSize: 220 }} 
                    />

                    <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-amber-500/30">
                            <ElectricBoltIcon sx={{ fontSize: 36 }} />
                        </div>
                        
                        <Typography variant="h5" fontWeight="900" className="text-slate-800 dark:text-white mb-2 font-sans tracking-tight">
                            Instant Haryana Electricity Bill PDF
                        </Typography>
                        
                        <Typography variant="body2" className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            Select your electricity board (DHBVN / UHBVN) and enter your 10-digit Account Number (UID) to download the duplicate bill instantly.
                        </Typography>

                        {/* Discom Selector Buttons */}
                        <div className="w-full grid grid-cols-2 gap-3 mb-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setDiscom('dhbvn');
                                    setErrorMessage('');
                                    setSuccessMessage('');
                                }}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                                    discom === 'dhbvn'
                                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 shadow-sm'
                                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-base">DHBVN</span>
                                    {discom === 'dhbvn' && <CheckCircleIcon sx={{ fontSize: 18 }} className="text-amber-600" />}
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Dakshin Haryana</span>
                                <span className="text-[10px] text-slate-400 mt-1">Hisar, Gurugram, Faridabad...</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setDiscom('uhbvn');
                                    setErrorMessage('');
                                    setSuccessMessage('');
                                }}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                                    discom === 'uhbvn'
                                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 shadow-sm'
                                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-base">UHBVN</span>
                                    {discom === 'uhbvn' && <CheckCircleIcon sx={{ fontSize: 18 }} className="text-amber-600" />}
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Uttar Haryana</span>
                                <span className="text-[10px] text-slate-400 mt-1">Ambala, Karnal, Rohtak...</span>
                            </button>
                        </div>

                        {/* Error Alert */}
                        {errorMessage && (
                            <Alert severity="error" className="w-full mb-4 text-left rounded-xl" onClose={() => setErrorMessage('')}>
                                {errorMessage}
                            </Alert>
                        )}

                        {/* Success Alert */}
                        {successMessage && (
                            <Alert severity="success" className="w-full mb-4 text-left rounded-xl" onClose={() => setSuccessMessage('')}>
                                {successMessage}
                            </Alert>
                        )}

                        <form onSubmit={handleDownload} className="w-full flex flex-col gap-4">
                            <TextField
                                fullWidth
                                label={`${discom.toUpperCase()} Account Number (UID)`}
                                variant="outlined"
                                value={accountNumber}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setAccountNumber(val);
                                    if (errorMessage) setErrorMessage('');
                                }}
                                required
                                placeholder="e.g. 6894882000"
                                helperText={`Enter your 10-digit ${discom.toUpperCase()} consumer account number`}
                                InputProps={{
                                    className: "bg-slate-50/50 dark:bg-slate-800/50",
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
                                {isDownloading ? `Downloading ${discom.toUpperCase()} Bill...` : `Download ${discom.toUpperCase()} Bill PDF`}
                            </Button>
                        </form>

                        <div className="w-full mt-8 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <ElectricBoltIcon className="text-amber-600" sx={{ fontSize: 20 }} />
                                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Direct Discom Portal Service</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                This service fetches current bill copies directly from Haryana Electricity portals ({discom.toUpperCase()}). It is completely free of cost ({currentService?.coin_cost ?? 0} Coins).
                            </p>
                        </div>
                    </div>
                </Paper>
            </div>
        </AdminLayout>
    );
}
