import React, { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Box, Typography, TextField, Button, Paper, Alert,
    CircularProgress, FormControlLabel, Checkbox,
    Grid, Card, CardContent, Chip
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import TranslateIcon from '@mui/icons-material/Translate';
import AssignmentIcon from '@mui/icons-material/Assignment';
import axios from 'axios';
import BilingualInputField from '../../Components/BilingualInputField';

export default function BirthCertificateDownload({ defaultRegNo = '' }) {
    // ==========================================
    // Upload & Merge Documents State
    // ==========================================
    const [childName, setChildName] = useState('');
    const [mergeRegNo, setMergeRegNo] = useState(defaultRegNo);
    const [includeCover, setIncludeCover] = useState(true);

    const [oldBirthCert, setOldBirthCert] = useState(null);
    const [fatherAadhar, setFatherAadhar] = useState(null);
    const [motherAadhar, setMotherAadhar] = useState(null);
    const [childAadhar, setChildAadhar] = useState(null);

    const [isMerging, setIsMerging] = useState(false);
    const [mergeError, setMergeError] = useState('');
    const [mergeSuccess, setMergeSuccess] = useState('');

    const oldBirthRef = useRef(null);
    const fatherRef = useRef(null);
    const motherRef = useRef(null);
    const childRef = useRef(null);

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

        setIsMerging(true);
        setMergeError('');
        setMergeSuccess('');

        try {
            const formData = new FormData();
            formData.append('child_name', childName);
            formData.append('registration_no', mergeRegNo);
            formData.append('include_cover', includeCover ? '1' : '0');
            formData.append('old_birth_certificate', oldBirthCert);

            if (fatherAadhar) formData.append('father_aadhar', fatherAadhar);
            if (motherAadhar) formData.append('mother_aadhar', motherAadhar);
            if (childAadhar) formData.append('child_aadhar', childAadhar);

            const response = await axios.post('/utilities/birth-certificate/merge-documents', formData, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Trigger file download in browser
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeName = childName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Birth_Record';
            a.download = `Birth_Documents_${safeName}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setMergeSuccess('सभी दस्तावेज सफलतापूर्वक एक PDF में जोड़ दिए गए हैं और डाउनलोड हो गए हैं!');
        } catch (err) {
            console.error('Merge error:', err);
            setMergeError('दस्तावेज मर्ज करते समय त्रुटि आई। कृपया सुनिश्चित करें कि सभी फाइलें सही PDF/Image हैं और साइज 10MB से कम है।');
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
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-slate-200 leading-tight">
                        Birth Certificate Document Merger (दस्तावेज जोड़ें)
                    </h2>
                </div>

                <Link
                    href="/admin/birth-records/create"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                    <AssignmentIcon sx={{ fontSize: 16 }} />
                    <span>Name Add Form</span>
                </Link>
            </div>
        }>
            <Head title="Birth Certificate Document Merger" />

            <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                
                <Paper elevation={0} className="border border-slate-200/80 dark:border-slate-800 shadow-md p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900">
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Box sx={{ p: 1, bgcolor: '#eff6ff', borderRadius: '12px', color: '#2563eb', display: 'flex' }}>
                                <PictureAsPdfIcon />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight="800" color="text.primary">
                                    Birth Certificate Document Merger (एक ही PDF में जोड़ें)
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Old Birth Certificate, Father/Mother/Child Aadhaar को जोड़कर पोर्टल के लिए single PDF बनाएं।
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {mergeError && (
                        <Alert severity="error" className="w-full mb-4 rounded-xl" onClose={() => setMergeError('')}>
                            {mergeError}
                        </Alert>
                    )}

                    {mergeSuccess && (
                        <Alert severity="success" className="w-full mb-4 rounded-xl" onClose={() => setMergeSuccess('')}>
                            {mergeSuccess}
                        </Alert>
                    )}

                    <form onSubmit={handleMergeSubmit} className="space-y-5">
                        
                        {/* Section A: Child Name to be Added (Bilingual Auto Transliteration) */}
                        <Card variant="outlined" sx={{ bgcolor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: 2 }}>
                            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <TranslateIcon fontSize="small" color="primary" />
                                    <Typography variant="subtitle2" fontWeight="700" color="#1e3a8a">
                                        1. Name to be Added (जो नाम जोड़ना है - English me likhein, Hindi sath me aayegi)
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

                        {/* Section B: Document Uploads */}
                        <Typography variant="subtitle2" fontWeight="700" color="text.primary" sx={{ pt: 1 }}>
                            2. Upload Supporting Documents (PDF या Image: JPG/PNG)
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
                                        पहले पेज पर "Index / Summary Slip" जोड़ें (Child Name, Date & Checklist Slip)
                                    </Typography>
                                }
                            />
                        </Box>

                        {/* Submit & Download Button */}
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={!oldBirthCert || isMerging}
                            startIcon={isMerging ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
                            sx={{
                                py: 1.6,
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
                            {isMerging ? 'दस्तावेज मर्ज हो रहे हैं...' : 'दस्तावेज मर्ज करें और PDF डाउनलोड करें (Merge & Download Single PDF)'}
                        </Button>
                    </form>
                </Paper>

            </div>
        </AdminLayout>
    );
}
