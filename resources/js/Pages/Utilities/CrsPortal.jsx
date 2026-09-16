import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Box, Typography, Button, Paper, Grid, Alert } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function CrsPortal() {
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
                    Civil Registration System (CRS) - Birth & Death Portal
                </h2>
            </div>
        }>
            <Head title="CRS Official Portal - Birth & Death Registration" />

            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* Hero Card */}
                <Paper elevation={0} className="border border-blue-200/80 dark:border-blue-900 shadow-md p-6 sm:p-8 rounded-2xl overflow-hidden relative bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-800">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                                <span>🏛️ Government of India • Office of the Registrar General</span>
                            </div>
                            <Typography variant="h4" fontWeight="900" className="text-slate-900 dark:text-white tracking-tight">
                                CRS Birth & Death Registration Portal
                            </Typography>
                            <Typography variant="body1" className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                                आधिकारिक सिविल रजिस्ट्रेशन सिस्टम (CRS) पोर्टल पर जन्म एवं मृत्यु प्रमाण पत्र पंजीकरण, नाम जुड़वाने (Child Name Addition), सुधार व डाउनलोड करने के लिए मुख्य लिंक:
                            </Typography>
                            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-blue-200 dark:border-slate-700 inline-block font-mono text-sm font-semibold text-blue-700 dark:text-blue-400 select-all">
                                https://dc.crsorgi.gov.in/
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full sm:w-auto flex-shrink-0">
                            <Button
                                variant="contained"
                                size="large"
                                component="a"
                                href="https://dc.crsorgi.gov.in/"
                                target="_blank"
                                rel="noopener noreferrer"
                                endIcon={<OpenInNewIcon />}
                                sx={{
                                    py: 1.6,
                                    px: 3.5,
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                                    boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.35)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1e40af, #1d4ed8)',
                                    }
                                }}
                            >
                                Open CRS Portal (dc.crsorgi.gov.in)
                            </Button>

                            <Button
                                variant="outlined"
                                size="large"
                                component={Link}
                                href="/admin/birth-records/create"
                                startIcon={<AddCircleIcon />}
                                sx={{
                                    py: 1.4,
                                    px: 3,
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                }}
                            >
                                Make Name Add Declaration
                            </Button>
                        </div>
                    </div>
                </Paper>

                {/* Quick Shortcuts Grid */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={0} className="h-full border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl bg-white dark:bg-slate-900 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4">
                                    <DescriptionIcon fontSize="medium" />
                                </div>
                                <Typography variant="h6" fontWeight="bold" className="text-slate-900 dark:text-white mb-2">
                                    जन्म रिकॉर्ड नाम जुड़वाने का घोषणा पत्र (Declaration)
                                </Typography>
                                <Typography variant="body2" className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                    अगर जन्म प्रमाण पत्र में बच्चे का नाम खाली है, तो माता-पिता का स्वयं सत्यापित शपथ पत्र / घोषणा पत्र तैयार करें। अब रंगीन (Blue Ink / Color) और B&W PDF प्रिंट उपलब्ध है।
                                </Typography>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    component={Link}
                                    href="/admin/birth-records/create"
                                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' }}
                                >
                                    + नया फॉर्म बनाएं
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    component={Link}
                                    href="/admin/birth-records"
                                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' }}
                                >
                                    सभी रिकॉर्ड देखें
                                </Button>
                            </div>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper elevation={0} className="h-full border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl bg-white dark:bg-slate-900 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
                                    <CheckCircleIcon fontSize="medium" />
                                </div>
                                <Typography variant="h6" fontWeight="bold" className="text-slate-900 dark:text-white mb-2">
                                    CRS पोर्टल पर आवेदन प्रक्रिया (Step-by-Step Guide)
                                </Typography>
                                <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2 mb-4">
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-blue-600">1.</span>
                                        <span>हमारे पोर्टल से घोषणा पत्र (Declaration PDF) भरें और रंगीन या B&W प्रिंट निकालें।</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-blue-600">2.</span>
                                        <span>माता-पिता के हस्ताक्षर करवाएं और स्कूल/पहचान दस्तावेज संलग्न करें।</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-blue-600">3.</span>
                                        <span>CRS पोर्टल (<a href="https://dc.crsorgi.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">dc.crsorgi.gov.in</a>) पर लॉगिन करें अथवा नजदीकी रजिस्ट्रार कार्यालय में जमा करें।</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="pt-2">
                                <a
                                    href="https://dc.crsorgi.gov.in/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline"
                                >
                                    <span>dc.crsorgi.gov.in पोर्टल पर जाएं</span>
                                    <OpenInNewIcon sx={{ fontSize: 16 }} />
                                </a>
                            </div>
                        </Paper>
                    </Grid>
                </Grid>

                <Alert severity="info" className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30">
                    <strong>नोट:</strong> CRS (Civil Registration System) भारत सरकार का आधिकारिक रजिस्ट्रार पोर्टल है। इस सेवा का उपयोग करने के लिए कोई अतिरिक्त कॉइन नहीं कटेंगे।
                </Alert>
            </div>
        </AdminLayout>
    );
}
