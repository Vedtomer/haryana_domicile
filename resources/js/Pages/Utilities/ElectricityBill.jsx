import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Box, Typography, TextField, Button, Paper, Alert } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';

export default function ElectricityBill() {
    const [accountNumber, setAccountNumber] = useState('');

    const handleDownload = (e) => {
        e.preventDefault();
        const digitsOnly = accountNumber.replace(/\D/g, '');
        if (digitsOnly.length < 5) return; // Basic check
        window.open(`https://uhbvn.org.in/Rapdrp/BD?UID=${digitsOnly}`, '_blank');
        setAccountNumber('');
    };

    return (
        <AdminLayout header={
            <h2 className="font-semibold text-xl text-gray-800 dark:text-slate-200 leading-tight">
                Electricity Bill Download
            </h2>
        }>
            <Head title="Electricity Bill" />

            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <Paper elevation={0} className="border border-slate-200/60 shadow-sm p-8 rounded-2xl overflow-hidden relative">
                    {/* Decorative Background Icon */}
                    <ElectricBoltIcon 
                        className="absolute -top-10 -right-10 text-amber-500/10" 
                        sx={{ fontSize: 200 }} 
                    />

                    <div className="relative z-10 flex flex-col items-center max-w-md mx-auto text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-amber-500/30">
                            <ElectricBoltIcon fontSize="large" />
                        </div>
                        
                        <Typography variant="h4" fontWeight="900" className="text-slate-800 mb-2 font-sans tracking-tight">
                            Instant Bill PDF
                        </Typography>
                        
                        <Typography variant="body1" className="text-slate-500 mb-8 leading-relaxed">
                            Enter your UHBVN Account Number (UID) below to instantly view and download your electricity bill.
                        </Typography>

                        <form onSubmit={handleDownload} className="w-full flex flex-col gap-4">
                            <TextField
                                fullWidth
                                label="Account Number (UID)"
                                variant="outlined"
                                value={accountNumber}
                                onChange={(e) => {
                                    // Restrict to digits only, similar to other forms
                                    const val = e.target.value.replace(/\D/g, '');
                                    setAccountNumber(val);
                                }}
                                required
                                placeholder="e.g. 6894882000"
                                InputProps={{
                                    className: "bg-white",
                                    sx: { borderRadius: '12px' }
                                }}
                            />
                            
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={!accountNumber || accountNumber.length < 5}
                                startIcon={<FileDownloadIcon />}
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
                                Download Bill
                            </Button>
                        </form>

                        <Alert severity="info" className="mt-8 text-left rounded-xl bg-blue-50/50 border border-blue-100">
                            <strong>Note:</strong> This service is provided directly via UHBVN portal and is completely free of charge. No coins will be deducted.
                        </Alert>
                    </div>
                </Paper>
            </div>
        </AdminLayout>
    );
}
