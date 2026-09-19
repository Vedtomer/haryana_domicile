import React, { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Box, Typography, TextField, Button, Paper, Alert,
    CircularProgress, FormControlLabel, Checkbox,
    Grid, Card, CardContent, Chip, Radio
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import TranslateIcon from '@mui/icons-material/Translate';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import axios from 'axios';
import BilingualInputField from '../../Components/BilingualInputField';

export default function BirthCertificateDownload({ defaultRegNo = '', userCoins = 0, isStaff = false }) {
    // Service Type: 'color_pdf' (300 coins) | 'name_add' (400 coins)
    const [serviceType, setServiceType] = useState('color_pdf');
    const [childName, setChildName] = useState('');
    const [mergeRegNo, setMergeRegNo] = useState(defaultRegNo);
    const [includeCover, setIncludeCover] = useState(true);

    const [oldBirthCert, setOldBirthCert] = useState(null);
    const [fatherAadhar, setFatherAadhar] = useState(null);
    const [motherAadhar, setMotherAadhar] = useState(null);
    const [childAadhar, setChildAadhar] = useState(null);

    const [isMerging, setIsMerging] = useState(false);
    const [mergeError, setMergeError] = useState('');
    const [submissionResult, setSubmissionResult] = useState(null);

    const [currentCoins, setCurrentCoins] = useState(userCoins);

    const oldBirthRef = useRef(null);
    const fatherRef = useRef(null);
    const motherRef = useRef(null);
    const childRef = useRef(null);

    const selectedCost = serviceType === 'name_add' ? 400 : 300;
    const hasEnoughCoins = isStaff || currentCoins >= selectedCost;

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleMergeSubmit = async (e) => {
        e.preventDefault();
        if (!oldBirthCert) {
            setMergeError('कृपया "Old Birth Certificate" (पुराना जन्म प्रमाण पत्र) अपलोड करें।');
            return;
        }

        if (!hasEnoughCoins) {
            setMergeError(`अपर्याप्त कॉइन बैलेंस! इस सेवा के लिए ${selectedCost} कॉइन्स चाहिए। आपके पास सिर्फ ${currentCoins} कॉइन्स हैं।`);
            return;
        }

        setIsMerging(true);
        setMergeError('');
        setSubmissionResult(null);

        try {
            const formData = new FormData();
            formData.append('service_type', serviceType);
            formData.append('child_name', childName);
            formData.append('registration_no', mergeRegNo);
            formData.append('include_cover', includeCover ? '1' : '0');
            formData.append('old_birth_certificate', oldBirthCert);

            if (fatherAadhar) formData.append('father_aadhar', fatherAadhar);
            if (motherAadhar) formData.append('mother_aadhar', motherAadhar);
            if (childAadhar) formData.append('child_aadhar', childAadhar);

            const response = await axios.post('/utilities/birth-certificate/merge-documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data && response.data.success) {
                setSubmissionResult(response.data);
                if (typeof response.data.remaining_coins === 'number') {
                    setCurrentCoins(response.data.remaining_coins);
                }

                // Automatically trigger download of the merged PDF submission dossier
                if (response.data.download_url) {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = response.data.download_url;
                    downloadLink.download = response.data.download_name || 'Birth_Certificate_Submission.pdf';
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
            } else {
                setMergeError(response.data?.message || 'आवेदन सबमिट करते समय त्रुटि आई। कृपया पुनः प्रयास करें।');
            }
        } catch (err) {
            console.error('Merge error:', err);
            const msg = err.response?.data?.message || 'आवेदन सबमिट करते समय त्रुटि आई। कृपया सुनिश्चित करें कि सभी फाइलें सही PDF/Image हैं और साइज 10MB से कम है।';
            setMergeError(msg);
        } finally {
            setIsMerging(false);
        }
    };

    const renderFileUploadBox = (title, subtitle, file, setFile, inputRef, isRequired = false) => (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: file ? '#f0fdf4' : '#fafafa',
                borderColor: file ? '#86efac' : '#cbd5e1',
                transition: 'all 0.2s ease',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: '220px' }}>
                <Box
                    sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        bgcolor: file ? '#dcfce7' : '#f1f5f9',
                        color: file ? '#16a34a' : '#64748b',
                        display: 'flex',
                    }}
                >
                    {file ? <CheckCircleIcon fontSize="small" /> : <PictureAsPdfIcon fontSize="small" />}
                </Box>
                <Box>
                    <Typography variant="subtitle2" fontWeight="700" color={file ? '#166534' : 'text.primary'}>
                        {title} {isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {subtitle}
                    </Typography>
                    {file && (
                        <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                size="small"
                                color="success"
                                variant="outlined"
                                label={`${file.name} (${formatFileSize(file.size)})`}
                                sx={{ height: 22, fontSize: '0.72rem', maxWidth: '280px' }}
                            />
                        </Box>
                    )}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                    type="file"
                    ref={inputRef}
                    accept=".pdf,image/jpeg,image/png,image/jpg"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            setFile(e.target.files[0]);
                        }
                    }}
                    style={{ display: 'none' }}
                />

                {file ? (
                    <Button
                        size="small"
                        color="error"
                        variant="text"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                            setFile(null);
                            if (inputRef.current) inputRef.current.value = '';
                        }}
                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                        हटाएं (Remove)
                    </Button>
                ) : (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => inputRef.current && inputRef.current.click()}
                        sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.8rem', px: 2 }}
                    >
                        फाइल चुनें (Choose)
                    </Button>
                )}
            </Box>
        </Paper>
    );

    return (
        <AdminLayout header={
            <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </Link>
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-slate-200 leading-tight">
                            Birth Certificate Services (जन्म प्रमाण पत्र सेवाएं)
                        </h2>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 mt-0.5">
                            <AccessTimeIcon sx={{ fontSize: 14 }} />
                            Working Time: 15 Min - 24 Hours
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Chip
                        icon={<MonetizationOnIcon sx={{ color: '#d97706 !important', fontSize: '18px !important' }} />}
                        label={`${currentCoins} Coins`}
                        variant="outlined"
                        sx={{ fontWeight: 'bold', borderColor: '#fde68a', bgcolor: '#fefce8', color: '#b45309' }}
                    />
                    <Link
                        href="/admin/birth-records/create"
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                    >
                        <AssignmentIcon sx={{ fontSize: 16 }} />
                        <span>Name Add Form</span>
                    </Link>
                </div>
            </div>
        }>
            <Head title="Birth Certificate Services" />

            <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                
                {/* Working Time Notice Banner */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.2,
                        mb: 3,
                        borderRadius: 3,
                        bgcolor: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        border: '1px solid #bfdbfe',
                        boxShadow: '0 2px 8px 0 rgba(37, 99, 235, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1.2, bgcolor: '#2563eb', borderRadius: 2, color: '#ffffff', display: 'flex' }}>
                            <AccessTimeIcon />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="800" color="#1e3a8a">
                                ⏱️ कार्य समय (Working Time): 15 मिनट से 24 घंटे
                            </Typography>
                            <Typography variant="body2" color="#3b82f6" fontWeight="500">
                                आपका आवेदन जमा होने के बाद 15 Min से 24 Hours में प्रोसेस करके सर्टिफिकेट उपलब्ध कराया जाएगा।
                            </Typography>
                        </Box>
                    </Box>

                    <Chip
                        size="small"
                        color="primary"
                        label="Fast Processing"
                        sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                    />
                </Paper>

                {/* Success Screen after submission */}
                {submissionResult && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            mb: 4,
                            borderRadius: 3,
                            bgcolor: '#f0fdf4',
                            border: '2px solid #86efac',
                            textAlign: 'center',
                        }}
                    >
                        <Box sx={{ width: 64, height: 64, bgcolor: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                            <CheckCircleIcon sx={{ fontSize: 36 }} />
                        </Box>

                        <Typography variant="h5" fontWeight="900" color="#166534" gutterBottom>
                            आवेदन सफलतापूर्वक सबमिट हो गया है!
                        </Typography>

                        <Typography variant="body2" color="#15803d" sx={{ mb: 2 }}>
                            {submissionResult.message}
                        </Typography>

                        <Box sx={{ maxWidth: 450, mx: 'auto', p: 2, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #bbf7d0', mb: 3, textAlign: 'left' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                <strong>सेवा का नाम:</strong> {submissionResult.service_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                                <strong>कार्य समय:</strong> 15 मिनट से 24 घंटे (15 Min - 24 Hours)
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                                <strong>कॉइन चार्ज:</strong> 🪙 {submissionResult.coins_deducted} Coins (बचा हुआ बैलेंस: {submissionResult.remaining_coins} Coins)
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                                <strong>रिक्वेस्ट नंबर:</strong> #{submissionResult.request_id}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                            {submissionResult.download_url && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    href={submissionResult.download_url}
                                    download={submissionResult.download_name || 'Birth_Certificate_Submission.pdf'}
                                    startIcon={<FileDownloadIcon />}
                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', px: 3 }}
                                >
                                    सबमिशन फाइल डाउनलोड करें (Download PDF)
                                </Button>
                            )}

                            <Button
                                component={Link}
                                href="/admin/service-requests"
                                variant="outlined"
                                color="success"
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                            >
                                मेरी रिक्वेस्ट देखें (Track Request)
                            </Button>

                            <Button
                                variant="text"
                                onClick={() => {
                                    setSubmissionResult(null);
                                    setOldBirthCert(null);
                                    setFatherAadhar(null);
                                    setMotherAadhar(null);
                                    setChildAadhar(null);
                                    setChildName('');
                                    setMergeRegNo('');
                                }}
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                                नया आवेदन करें (New Application)
                            </Button>
                        </Box>
                    </Paper>
                )}

                {/* Main Form */}
                <Paper elevation={0} className="border border-slate-200/80 dark:border-slate-800 shadow-md p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900">
                    
                    {mergeError && (
                        <Alert severity="error" className="w-full mb-5 rounded-xl text-left" onClose={() => setMergeError('')}>
                            {mergeError}
                        </Alert>
                    )}

                    <form onSubmit={handleMergeSubmit} className="space-y-6">
                        
                        {/* 1. Service Option Selection (2 Options: Color PDF vs Name Add) */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight="800" color="text.primary" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>1. सेवा का प्रकार चुनें (Select Service Type & Fees)</span>
                                <span style={{ color: '#ef4444' }}>*</span>
                            </Typography>

                            <Grid container spacing={2}>
                                {/* Option A: Color PDF Download (300 Coins) */}
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Paper
                                        variant="outlined"
                                        onClick={() => setServiceType('color_pdf')}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2.5,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            bgcolor: serviceType === 'color_pdf' ? '#eff6ff' : '#ffffff',
                                            borderColor: serviceType === 'color_pdf' ? '#2563eb' : '#cbd5e1',
                                            borderWidth: serviceType === 'color_pdf' ? 2 : 1,
                                            boxShadow: serviceType === 'color_pdf' ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                                            position: 'relative',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Radio
                                                    checked={serviceType === 'color_pdf'}
                                                    value="color_pdf"
                                                    onChange={() => setServiceType('color_pdf')}
                                                    size="small"
                                                    sx={{ p: 0 }}
                                                />
                                                <Typography variant="subtitle2" fontWeight="800" color={serviceType === 'color_pdf' ? '#1e40af' : 'text.primary'}>
                                                    Color PDF Download
                                                </Typography>
                                            </Box>

                                            <Chip
                                                size="small"
                                                label="🪙 300 Coins"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    bgcolor: '#fef3c7',
                                                    color: '#92400e',
                                                    border: '1px solid #fde68a',
                                                    fontSize: '0.8rem',
                                                    height: 24,
                                                }}
                                            />
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ pl: 3.5 }}>
                                            जन्म प्रमाण पत्र की ओरिजिनल रंगीन PDF प्राप्त करें।
                                        </Typography>

                                        <Box sx={{ mt: 1.5, pl: 3.5, display: 'flex', alignItems: 'center', gap: 0.5, color: '#2563eb', fontSize: '0.75rem', fontWeight: 600 }}>
                                            <AccessTimeIcon sx={{ fontSize: 14 }} />
                                            <span>Working Time: 15 Min - 24 Hours</span>
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* Option B: Name Add (400 Coins) */}
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Paper
                                        variant="outlined"
                                        onClick={() => setServiceType('name_add')}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2.5,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            bgcolor: serviceType === 'name_add' ? '#eff6ff' : '#ffffff',
                                            borderColor: serviceType === 'name_add' ? '#2563eb' : '#cbd5e1',
                                            borderWidth: serviceType === 'name_add' ? 2 : 1,
                                            boxShadow: serviceType === 'name_add' ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                                            position: 'relative',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Radio
                                                    checked={serviceType === 'name_add'}
                                                    value="name_add"
                                                    onChange={() => setServiceType('name_add')}
                                                    size="small"
                                                    sx={{ p: 0 }}
                                                />
                                                <Typography variant="subtitle2" fontWeight="800" color={serviceType === 'name_add' ? '#1e40af' : 'text.primary'}>
                                                    Name Add in Certificate
                                                </Typography>
                                            </Box>

                                            <Chip
                                                size="small"
                                                label="🪙 400 Coins"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    bgcolor: '#fef3c7',
                                                    color: '#92400e',
                                                    border: '1px solid #fde68a',
                                                    fontSize: '0.8rem',
                                                    height: 24,
                                                }}
                                            />
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ pl: 3.5 }}>
                                            जन्म रिकार्ड में बच्चे का नया नाम जुड़वाने हेतु आवेदन करें।
                                        </Typography>

                                        <Box sx={{ mt: 1.5, pl: 3.5, display: 'flex', alignItems: 'center', gap: 0.5, color: '#2563eb', fontSize: '0.75rem', fontWeight: 600 }}>
                                            <AccessTimeIcon sx={{ fontSize: 14 }} />
                                            <span>Working Time: 15 Min - 24 Hours</span>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Coin Balance Status Alert */}
                        {!hasEnoughCoins ? (
                            <Box sx={{ p: 2, bgcolor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <WarningAmberIcon sx={{ color: '#e11d48' }} />
                                    <Typography variant="body2" color="#9f1239" fontWeight="600">
                                        Coins Insufficient: इस सेवा के लिए <strong>{selectedCost} कॉइन्स</strong> चाहिए (आपके पास: {currentCoins} Coins)।
                                    </Typography>
                                </Box>
                                <Button
                                    component={Link}
                                    href="/admin/coin-requests"
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                                >
                                    🪙 Coins Recharge Karein
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                                <Typography variant="caption" color="#166534" fontWeight="600">
                                    चयनित सेवा: <strong>{serviceType === 'name_add' ? 'Name Add (400 Coins)' : 'Color PDF (300 Coins)'}</strong> | कार्य समय: <strong>15 Min - 24 Hours</strong>
                                </Typography>
                            </Box>
                        )}

                        {/* 2. Child Name with Real-Time Hindi Auto Transliteration */}
                        <Card variant="outlined" sx={{ bgcolor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: 2.5 }}>
                            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <TranslateIcon fontSize="small" color="primary" />
                                    <Typography variant="subtitle2" fontWeight="700" color="#1e3a8a">
                                        2. Name to be Added (जो नाम जोड़ना है - English me likhein, Hindi sath me aayegi)
                                    </Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 8 }}>
                                        <BilingualInputField
                                            label="Child Name (बच्चे का नाम)"
                                            name="child_name"
                                            value={childName}
                                            onChange={(e) => setChildName(e.target.value)}
                                            required={false}
                                            placeholder="e.g. Aryan"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Registration No (Optional)"
                                            value={mergeRegNo}
                                            onChange={(e) => setMergeRegNo(e.target.value)}
                                            placeholder="B-2024:..."
                                            sx={{ mt: { xs: 0, sm: 2.8 } }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* 3. Document Uploads */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight="800" color="text.primary" sx={{ mb: 1.5 }}>
                                3. Upload Supporting Documents (PDF या Image: JPG/PNG)
                            </Typography>

                            <div className="space-y-3">
                                {/* 1. Old Birth Certificate */}
                                {renderFileUploadBox(
                                    'Old Birth Certificate (पुराना जन्म प्रमाण पत्र)',
                                    'बच्चे का पुराना जन्म प्रमाण पत्र (अनिवार्य / Mandatory)',
                                    oldBirthCert,
                                    setOldBirthCert,
                                    oldBirthRef,
                                    true
                                )}

                                {/* 2. Father Aadhaar */}
                                {renderFileUploadBox(
                                    "Father's Aadhaar Card (पिता का आधार कार्ड)",
                                    'पिता का आधार कार्ड या पहचान पत्र संलग्न करें',
                                    fatherAadhar,
                                    setFatherAadhar,
                                    fatherRef,
                                    false
                                )}

                                {/* 3. Mother Aadhaar */}
                                {renderFileUploadBox(
                                    "Mother's Aadhaar Card (माता का आधार कार्ड)",
                                    'माता का आधार कार्ड या पहचान पत्र संलग्न करें',
                                    motherAadhar,
                                    setMotherAadhar,
                                    motherRef,
                                    false
                                )}

                                {/* 4. Child Aadhaar */}
                                {renderFileUploadBox(
                                    "Child's Aadhaar Card (बच्चे का आधार कार्ड)",
                                    'जिसका जन्म है उसका आधार कार्ड (अगर बना हुआ है तो / Optional)',
                                    childAadhar,
                                    setChildAadhar,
                                    childRef,
                                    false
                                )}
                            </div>
                        </Box>

                        {/* Options */}
                        <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={includeCover}
                                        onChange={(e) => setIncludeCover(e.target.checked)}
                                    />
                                }
                                label={
                                    <Typography variant="body2" fontWeight="600" color="text.primary">
                                        पहले पेज पर "Index / Summary Slip" जोड़ें (Child Name, Date, Service Details & Checklist Slip)
                                    </Typography>
                                }
                            />
                        </Box>

                        {/* Submit Button with Cost Badge */}
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={!oldBirthCert || isMerging || !hasEnoughCoins}
                            startIcon={isMerging ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
                            sx={{
                                py: 1.8,
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontSize: '1.05rem',
                                fontWeight: 'bold',
                                background: 'linear-gradient(to right, #1e40af, #2563eb)',
                                boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.35)',
                                '&:hover': {
                                    background: 'linear-gradient(to right, #1e3a8a, #1d4ed8)',
                                }
                            }}
                        >
                            {isMerging
                                ? 'आवेदन सबमिट हो रहा है...'
                                : `आवेदन सबमिट करें (Submit Request & Download Dossier - 🪙 ${selectedCost} Coins)`}
                        </Button>
                    </form>
                </Paper>

            </div>
        </AdminLayout>
    );
}
