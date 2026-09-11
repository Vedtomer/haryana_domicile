import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function PublicUpload({ shop }) {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [serviceType, setServiceType] = useState('document');
    const [copies, setCopies] = useState(1);
    const [colorMode, setColorMode] = useState('bw');
    const [pageRange, setPageRange] = useState('all');
    const [customRange, setCustomRange] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [duplex, setDuplex] = useState('simplex');
    const [paperSize, setPaperSize] = useState('A4');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMode, setPaymentMode] = useState('cash');

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [activeJob, setActiveJob] = useState(null);
    const [jobStatus, setJobStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const fileInputRef = useRef(null);

    // Auto calculate estimated total pages if PDF
    const handleFileSelect = (e) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        setFile(selected);
        setErrorMessage(null);

        if (selected.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(selected));
            setTotalPages(1);
        } else {
            setPreviewUrl(null);
            // Default 1, customer can adjust
            setTotalPages(1);
        }
    };

    // Calculate estimated cost
    const calculateCost = () => {
        if (serviceType === 'photo_sheet') {
            return copies * shop.price_photo_sheet;
        }
        const rate = colorMode === 'color' ? shop.price_color_page : shop.price_bw_page;
        return totalPages * copies * rate;
    };

    const cost = calculateCost();

    // Submit print job
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setErrorMessage('Please select a document or image to print.');
            return;
        }

        setUploading(true);
        setUploadProgress(10);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('copies', copies);
        formData.append('color_mode', colorMode);
        formData.append('page_range', pageRange === 'custom' ? customRange : 'all');
        formData.append('total_pages', totalPages);
        formData.append('duplex', duplex);
        formData.append('paper_size', paperSize);
        formData.append('service_type', serviceType);
        formData.append('customer_name', customerName);
        formData.append('customer_phone', customerPhone);
        formData.append('payment_mode', paymentMode);

        try {
            const res = await axios.post(`/p/${shop.code}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                },
            });

            if (res.data.success) {
                setActiveJob(res.data);
                setJobStatus(res.data.status);
            } else {
                setErrorMessage(res.data.message || 'Failed to submit print job.');
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Upload failed. Please check file size and try again.');
        } finally {
            setUploading(false);
        }
    };

    // Poll status when active job is running
    useEffect(() => {
        if (!activeJob?.job_code || jobStatus === 'printed' || jobStatus === 'failed') {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`/p/status/${activeJob.job_code}`);
                if (res.data.success) {
                    setJobStatus(res.data.job_status);
                }
            } catch (e) {}
        }, 2500);

        return () => clearInterval(interval);
    }, [activeJob, jobStatus]);

    const resetForm = () => {
        setFile(null);
        setPreviewUrl(null);
        setActiveJob(null);
        setJobStatus(null);
        setUploadProgress(0);
        setCopies(1);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col justify-between">
            <Head title={`Print at ${shop.name}`} />

            {/* Top Navigation Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-30 shadow-xs">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-blue-500/30">
                            <span className="material-symbols-outlined text-xl">print</span>
                        </div>
                        <div>
                            <h1 className="font-extrabold text-slate-900 dark:text-white text-sm leading-tight truncate max-w-[200px]">
                                {shop.name}
                            </h1>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <span className={`w-1.5 h-1.5 rounded-full ${shop.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                <span>{shop.is_online ? 'Printer Connected' : 'Queue Active'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Shop Code</span>
                        <span className="text-xs font-mono font-extrabold text-blue-600 dark:text-blue-400">{shop.code}</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-md mx-auto w-full p-4 flex-1">

                {/* ACTIVE JOB PROGRESS VIEW */}
                {activeJob ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center shadow-inner">
                            {jobStatus === 'printed' ? (
                                <span className="material-symbols-outlined text-4xl text-emerald-500">check_circle</span>
                            ) : jobStatus === 'printing' ? (
                                <span className="material-symbols-outlined text-4xl animate-bounce">print</span>
                            ) : (
                                <span className="material-symbols-outlined text-4xl animate-pulse">cloud_upload</span>
                            )}
                        </div>

                        <div>
                            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                                {activeJob.job_code}
                            </span>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-3">
                                {jobStatus === 'printed' && 'Print Completed!'}
                                {jobStatus === 'printing' && 'Printing in Progress...'}
                                {jobStatus === 'downloading' && 'Sending to Printer...'}
                                {jobStatus === 'queued' && 'Document in Print Queue'}
                                {jobStatus === 'failed' && 'Printing Error'}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {jobStatus === 'printed'
                                    ? 'Please collect your printed pages from the shop counter.'
                                    : 'Your document has been sent directly to the shop printer.'}
                            </p>
                        </div>

                        {/* Status Stepper */}
                        <div className="space-y-3 text-left bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">1. Document Uploaded</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {jobStatus === 'downloading' || jobStatus === 'printing' || jobStatus === 'printed' ? (
                                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                ) : (
                                    <span className="material-symbols-outlined text-slate-300 text-lg">radio_button_unchecked</span>
                                )}
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">2. Received by Windows Printer</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {jobStatus === 'printed' ? (
                                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                ) : jobStatus === 'printing' ? (
                                    <span className="material-symbols-outlined text-blue-500 text-lg animate-spin">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-slate-300 text-lg">radio_button_unchecked</span>
                                )}
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">3. Paper Output & Finish</span>
                            </div>
                        </div>

                        {/* Bill Amount */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-900 dark:text-blue-200">Total Amount:</span>
                            <span className="text-lg font-black text-blue-600 dark:text-blue-400">₹{activeJob.cost}</span>
                        </div>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md transition-all cursor-pointer"
                        >
                            Print Another Document
                        </button>
                    </div>
                ) : (
                    /* UPLOAD & CONFIGURATION FORM */
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Service Type Selector */}
                        <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                            <button
                                type="button"
                                onClick={() => setServiceType('document')}
                                className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                                    serviceType === 'document'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                Document
                            </button>
                            <button
                                type="button"
                                onClick={() => setServiceType('photo_sheet')}
                                className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                                    serviceType === 'photo_sheet'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                Photos
                            </button>
                            <button
                                type="button"
                                onClick={() => setServiceType('id_card')}
                                className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                                    serviceType === 'id_card'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                ID Card
                            </button>
                        </div>

                        {/* Upload Dropzone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                                file
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,image/png,image/jpeg,image/webp"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {file ? (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-md shadow-blue-500/30">
                                        <span className="material-symbols-outlined text-2xl">description</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[250px] mx-auto">
                                            {file.name}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB • Tap to change
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 py-3">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                                        <span className="material-symbols-outlined text-3xl">upload_file</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Tap to Upload Document or Photo
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Supports PDF, JPG, PNG (up to 50MB)
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Configuration Controls */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">

                            {/* Color Mode Toggle */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Color Mode
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setColorMode('bw')}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                            colorMode === 'bw'
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-600'
                                                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        <span>Black & White</span>
                                        <span className="text-[11px] font-normal text-slate-500">₹{shop.price_bw_page}/p</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setColorMode('color')}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                            colorMode === 'color'
                                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 ring-1 ring-purple-600'
                                                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        <span>Color Print</span>
                                        <span className="text-[11px] font-normal text-purple-600">₹{shop.price_color_page}/p</span>
                                    </button>
                                </div>
                            </div>

                            {/* Copies & Pages in Document */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Copies
                                    </label>
                                    <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setCopies(Math.max(1, copies - 1))}
                                            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-bold"
                                        >
                                            -
                                        </button>
                                        <span className="flex-1 text-center text-sm font-bold text-slate-800 dark:text-white">
                                            {copies}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setCopies(copies + 1)}
                                            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Total Pages
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="500"
                                        value={totalPages}
                                        onChange={(e) => setTotalPages(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full text-center py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm font-bold"
                                    />
                                </div>
                            </div>

                            {/* Duplex (Double-sided) Option */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Sides
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDuplex('simplex')}
                                        className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center ${
                                            duplex === 'simplex'
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                                                : 'border-slate-200 dark:border-slate-800 text-slate-600'
                                        }`}
                                    >
                                        Single-Sided (1 Side)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDuplex('duplex_long')}
                                        className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center ${
                                            duplex !== 'simplex'
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                                                : 'border-slate-200 dark:border-slate-800 text-slate-600'
                                        }`}
                                    >
                                        Double-Sided (Both Sides)
                                    </button>
                                </div>
                            </div>

                            {/* Payment Mode */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMode('cash')}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                                            paymentMode === 'cash'
                                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600'
                                                : 'border-slate-200 dark:border-slate-800 text-slate-600'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">payments</span>
                                        Cash at Counter
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMode('online')}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                                            paymentMode === 'online'
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                                                : 'border-slate-200 dark:border-slate-800 text-slate-600'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">qr_code_2</span>
                                        Online UPI
                                    </button>
                                </div>
                            </div>

                            {/* Optional Customer Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Your Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your name for identification"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-white"
                                />
                            </div>

                        </div>

                        {/* Error Alert */}
                        {errorMessage && (
                            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">error</span>
                                {errorMessage}
                            </div>
                        )}

                        {/* Price & Submit Button */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
                            <div className="flex items-center justify-between text-slate-900 dark:text-white">
                                <span className="text-xs font-bold text-slate-500 uppercase">Estimated Total</span>
                                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                    ₹{cost.toFixed(2)}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {uploading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                                        Sending to Printer ({uploadProgress}%)...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">print</span>
                                        Send to Printer Now
                                    </>
                                )}
                            </button>

                            <p className="text-[11px] text-center text-slate-400">
                                File is processed directly on the counter printer and deleted afterwards.
                            </p>
                        </div>

                    </form>
                )}

            </main>

            {/* Bottom Footer */}
            <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span>Powered by <strong>CSP Jaankari</strong> Cloud Printing</span>
            </footer>
        </div>
    );
}
