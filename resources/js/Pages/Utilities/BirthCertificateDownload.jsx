import React, { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Box, Typography, TextField, Button, Paper, Alert,
    CircularProgress, RadioGroup, FormControlLabel, Radio,
    Checkbox, Tabs, Tab, Grid, Divider, Card, CardContent, Chip
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import TranslateIcon from '@mui/icons-material/Translate';
import axios from 'axios';
import BilingualInputField from '../../Components/BilingualInputField';

export default function BirthCertificateDownload({ defaultRegNo = '' }) {
    const [activeTab, setActiveTab] = useState(0); // 0: Search & Download, 1: Upload & Merge

    // ==========================================
    // TAB 1: Search & Download State
    // ==========================================
    const [registrationNo, setRegistrationNo] = useState(defaultRegNo);
    const [colorMode, setColorMode] = useState('blue');
    const [showBorder, setShowBorder] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [searchSuccess, setSearchSuccess] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        const cleanNo = registrationNo.trim();
        if (!cleanNo) return;

        setIsSearching(true);
        setSearchError('');
        setSearchSuccess('');

        try {
            const res = await axios.post('/utilities/birth-certificate/search', {
                registration_no: cleanNo,
                color: colorMode,
                border: showBorder,
            });

            if (res.data.success && res.data.print_url) {
                setSearchSuccess(res.data.message || 'Record found! Opening PDF...');
                window.open(res.data.print_url, '_blank');
            } else {
                setSearchError(res.data.message || 'इस रजिस्ट्रेशन नंबर का कोई रिकॉर्ड नहीं मिला।');
            }
        } catch (err) {
            setSearchError(err.response?.data?.message || 'इस रजिस्ट्रेशन नंबर का कोई रिकॉर्ड नहीं मिला। कृपया सही रजिस्ट्रेशन नंबर दर्ज करें।');
        } finally {
            setIsSearching(false);
        }
    };

    // ==========================================
    // TAB 2: Upload & Merge Documents State
    // ==========================================
    const [childName, setChildName] = useState('');
    const [mergeRegNo, setMergeRegNo] = useState('');
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
            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </Link>
                <h2 className="font-semibold text-xl text-gray-800 dark:text-slate-200 leading-tight">
                    Birth Certificate Services (जन्म प्रमाण पत्र सेवाएं)
                </h2>
            </div>
        }>
            <Head title="Birth Certificate Services" />

            <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                
                {/* Mode Selector Tabs */}
                <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, val) => setActiveTab(val)}
                        variant="fullWidth"
                        sx={{
                            borderBottom: '1px solid #e2e8f0',
                            '& .MuiTab-root': {
                                py: 2,
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                textTransform: 'none',
                            }
                        }}
                    >
                        <Tab
                            icon={<FileDownloadIcon />}
                            iconPosition="start"
                            label="1. Download Certificate (रजिस्ट्रेशन नंबर से)"
                        />
                        <Tab
                            icon={<PictureAsPdfIcon />}
                            iconPosition="start"
                            label="2. Merge Documents for Name Add (एक PDF बनाएं)"
                        />
                    </Tabs>
                </Paper>

                {/* ============================================================== */}
                {/* TAB 1: Search & Download Certificate                           */}
                {/* ============================================================== */}
                {activeTab === 0 && (
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

                            {searchError && (
                                <Alert severity="error" className="w-full mb-5 text-left rounded-xl" onClose={() => setSearchError('')}>
                                    {searchError}
                                </Alert>
                            )}

                            {searchSuccess && (
                                <Alert severity="success" className="w-full mb-5 text-left rounded-xl" onClose={() => setSearchSuccess('')}>
                                    {searchSuccess}
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
                                            if (searchError) setSearchError('');
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
                )}

                {/* ============================================================== */}
                {/* TAB 2: Upload Documents & Merge into Single PDF                */}
                {/* ============================================================== */}
                {activeTab === 1 && (
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
                                        Old Birth Certificate, Father/Mother/Child Aadhaar ko jod kar portal ke liye single PDF banayein.
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
                                    background: 'linear-gradient(to right, #059669, #10b981)',
                                    boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.35)',
                                    '&:hover': {
                                        background: 'linear-gradient(to right, #047857, #059669)',
                                    }
                                }}
                            >
                                {isMerging ? 'Merging Documents into PDF...' : 'Merge Documents & Download Single PDF (एक PDF में डाउनलोड करें)'}
                            </Button>
                        </form>
                    </Paper>
                )}

            </div>
        </AdminLayout>
    );
}
