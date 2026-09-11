import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function PublicUpload({ shop }) {
    const [file, setFile] = useState(null);
    const [copies, setCopies] = useState(1);
    const [colorType, setColorType] = useState('bw');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [submittedJob, setSubmittedJob] = useState(null);
    const [jobStatus, setJobStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const fileInputRef = useRef(null);

    // Calculate approximate cost (assuming 1 page for estimation before server parse)
    const ratePerPage = colorType === 'color' ? shop.color_rate : shop.bw_rate;
    const estimatedCost = (ratePerPage * copies).toFixed(2);

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (selected) {
            // Max 50MB
            if (selected.size > 52428800) {
                setErrorMessage('File size must be under 50MB.');
                return;
            }
            setFile(selected);
            setErrorMessage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setErrorMessage('Please select a PDF or image document to print.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setErrorMessage('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('copies', copies);
        formData.append('color_type', colorType);
        formData.append('customer_name', customerName);
        formData.append('customer_phone', customerPhone);
        formData.append('payment_method', paymentMethod);

        try {
            const res = await axios.post(`/p/${shop.shop_code}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percent);
                },
            });

            if (res.data.success) {
                setSubmittedJob(res.data);
                setJobStatus(res.data.status);
            } else {
                setErrorMessage(res.data.message || 'Upload failed. Please try again.');
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Upload failed. Please check your network and try again.');
        } finally {
            setUploading(false);
        }
    };

    // Poll status after submission
    useEffect(() => {
        if (!submittedJob?.job_code) return;
        if (jobStatus === 'completed' || jobStatus === 'failed') return;

        const timer = setInterval(async () => {
            try {
                const res = await axios.get(`/p/job/${submittedJob.job_code}/status`);
                if (res.data.success) {
                    setJobStatus(res.data.status);
                }
            } catch {}
        }, 3000);

        return () => clearInterval(timer);
    }, [submittedJob?.job_code, jobStatus]);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans">
            <Head title={`Print Document - ${shop.shop_name}`} />

            {/* Header */}
            <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sticky top-0 z-30">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="font-black text-base text-white truncate">
                            {shop.shop_name}
                        </h1>
                        <p className="text-[11px] text-slate-400 font-mono">
                            Counter Code: #{shop.shop_code}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Printer Ready</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col justify-center">
                {/* 1. Success Screen if submitted */}
                {submittedJob ? (
                    <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center space-y-6">
                        <div className="relative inline-flex items-center justify-center">
                            {jobStatus === 'completed' ? (
                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center text-4xl">
                                    ✓
                                </div>
                            ) : jobStatus === 'failed' ? (
                                <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-400 border-2 border-red-500 flex items-center justify-center text-4xl">
                                    ✕
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-blue-500/20 text-blue-400 border-2 border-blue-500 flex items-center justify-center text-3xl animate-bounce">
                                    🖨️
                                </div>
                            )}
                        </div>

                        <div>
                            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                                Print Job Code
                            </span>
                            <span className="text-3xl font-black text-white font-mono tracking-wider block mt-1">
                                #{submittedJob.job_code}
                            </span>
                        </div>

                        {/* Status Tracker */}
                        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 text-left space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Total Pages:</span>
                                <span className="font-bold text-white">{submittedJob.total_pages} pages</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Copies:</span>
                                <span className="font-bold text-white">{submittedJob.copies} copy</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Total Amount:</span>
                                <span className="font-black text-emerald-400 text-sm">₹{submittedJob.total_amount}</span>
                            </div>

                            <div className="pt-3 border-t border-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-300 font-semibold">Print Status:</span>
                                    {jobStatus === 'completed' && (
                                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                            <span>✓</span> PRINTED! Collect now.
                                        </span>
                                    )}
                                    {jobStatus === 'printing' && (
                                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1 animate-pulse">
                                            <span>🖨️</span> Printing right now...
                                        </span>
                                    )}
                                    {jobStatus === 'pending' && (
                                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                                            <span>⏳</span> In Printer Queue...
                                        </span>
                                    )}
                                    {jobStatus === 'failed' && (
                                        <span className="text-xs font-bold text-red-400">
                                            Printing Error. Check counter.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                            {jobStatus === 'completed' 
                                ? 'Aapka document print ho chuka hai! Kripya counter se apna print collect karein.'
                                : 'Aapka document direct counter printer ko bhej diya gaya hai. Kuch hi seconds me print nikal jayega.'}
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setSubmittedJob(null);
                                setJobStatus(null);
                                setFile(null);
                            }}
                            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm rounded-xl transition-all"
                        >
                            Print Another Document
                        </button>
                    </div>
                ) : (
                    /* 2. Upload Form */
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* File Upload Box */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                                file 
                                ? 'border-emerald-500 bg-emerald-950/20' 
                                : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {file ? (
                                <div className="space-y-2">
                                    <span className="text-4xl block">📄</span>
                                    <p className="font-bold text-sm text-white truncate max-w-xs mx-auto">
                                        {file.name}
                                    </p>
                                    <span className="text-xs text-emerald-400 font-mono block">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Selected
                                    </span>
                                    <span className="text-[11px] text-slate-400 underline block pt-1">
                                        Tap to change file
                                    </span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <span className="text-4xl block">📤</span>
                                    <p className="font-bold text-base text-white">
                                        Tap to Select Document
                                    </p>
                                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                        Upload PDF, Aadhaar, PAN, Photo, Marksheet or Take Camera Photo
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mt-2">
                                        <span>PDF • JPG • PNG</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {errorMessage && (
                            <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300 font-medium">
                                {errorMessage}
                            </div>
                        )}

                        {/* Print Options Card */}
                        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-4">
                            {/* Copies Stepper */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-white block">Number of Copies</span>
                                    <span className="text-[11px] text-slate-400">Kitni copies chahiye?</span>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl p-1">
                                    <button
                                        type="button"
                                        onClick={() => setCopies(Math.max(1, copies - 1))}
                                        className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center active:scale-95 text-base"
                                    >
                                        -
                                    </button>
                                    <span className="font-mono font-bold text-base text-white px-1">
                                        {copies}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setCopies(copies + 1)}
                                        className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center active:scale-95 text-base"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Color Type Selector */}
                            <div>
                                <span className="text-xs font-bold text-white block mb-2">Print Color</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setColorType('bw')}
                                        className={`p-3 rounded-xl border text-center transition-all ${
                                            colorType === 'bw'
                                            ? 'border-blue-500 bg-blue-600/20 text-white font-bold'
                                            : 'border-slate-700 bg-slate-900/60 text-slate-400'
                                        }`}
                                    >
                                        <span className="text-xs block">Black & White</span>
                                        <span className="text-xs font-black text-slate-200 mt-0.5 block">
                                            ₹{parseFloat(shop.bw_rate).toFixed(0)}/page
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setColorType('color')}
                                        className={`p-3 rounded-xl border text-center transition-all ${
                                            colorType === 'color'
                                            ? 'border-pink-500 bg-pink-600/20 text-white font-bold'
                                            : 'border-slate-700 bg-slate-900/60 text-slate-400'
                                        }`}
                                    >
                                        <span className="text-xs block">Color Print</span>
                                        <span className="text-xs font-black text-pink-400 mt-0.5 block">
                                            ₹{parseFloat(shop.color_rate).toFixed(0)}/page
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Customer Name & Phone */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50">
                                <div>
                                    <label className="text-[11px] text-slate-400 block mb-1">Your Name (Optional)</label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Naam likhein"
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] text-slate-400 block mb-1">Mobile No (Optional)</label>
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        placeholder="Phone number"
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cost & Submit Button */}
                        <div className="pt-2">
                            {uploading && (
                                <div className="mb-3 space-y-1">
                                    <div className="flex justify-between text-xs text-slate-300">
                                        <span>Uploading document to printer...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500 transition-all duration-200" 
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={uploading || !file}
                                className={`w-full py-4 rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-2 transition-all ${
                                    uploading || !file 
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                <span>{uploading ? 'Sending to Printer...' : 'Print Document Now'}</span>
                            </button>
                            <p className="text-center text-[11px] text-slate-400 mt-2">
                                Counter par direct print nikalne ke liye click karein
                            </p>
                        </div>
                    </form>
                )}
            </main>

            {/* Footer */}
            <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-800/60">
                Powered by CSP Jaankari Cloud Counter Printing
            </footer>
        </div>
    );
}
