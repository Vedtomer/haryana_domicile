import React, { useState, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import StatusBadge from '../../Components/StatusBadge';
import axios from 'axios';

export default function VehiclePucWithoutOtp({ service, coinCost = 20, userCoins = 0, recentRequests = [] }) {
    const { auth } = usePage().props;
    const isAdmin = Boolean(
        auth?.user?.is_admin ||
        auth?.user?.is_staff ||
        auth?.user?.type === 'admin' ||
        auth?.user?.type === 'super_admin'
    );

    const [vehicleNo, setVehicleNo] = useState('');
    const [mobile, setMobile] = useState('');
    const [note, setNote] = useState('');
    const [numberPlateFile, setNumberPlateFile] = useState(null);
    const [numberPlatePreview, setNumberPlatePreview] = useState(null);
    const [rcFile, setRcFile] = useState(null);
    const [rcPreview, setRcPreview] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successData, setSuccessData] = useState(null);

    const plateInputRef = useRef(null);
    const rcInputRef = useRef(null);

    const handlePlateChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setNumberPlateFile(file);
            if (file.type.startsWith('image/')) {
                setNumberPlatePreview(URL.createObjectURL(file));
            } else {
                setNumberPlatePreview(null);
            }
        }
    };

    const handleRcChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setRcFile(file);
            if (file.type.startsWith('image/')) {
                setRcPreview(URL.createObjectURL(file));
            } else {
                setRcPreview(null);
            }
        }
    };

    const handleReset = () => {
        setVehicleNo('');
        setMobile('');
        setNote('');
        setNumberPlateFile(null);
        setNumberPlatePreview(null);
        setRcFile(null);
        setRcPreview(null);
        setError(null);
        setSuccessData(null);
        if (plateInputRef.current) plateInputRef.current.value = '';
        if (rcInputRef.current) rcInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const cleanNo = vehicleNo.replace(/[\s-]/g, '').toUpperCase();
        if (cleanNo.length < 4) {
            setError('कृपया एक वैध गाड़ी नंबर दर्ज करें। (Enter a valid vehicle number)');
            return;
        }

        if (!numberPlateFile) {
            setError('गाड़ी की नंबर प्लेट की फोटो अपलोड करना अनिवार्य है।');
            return;
        }

        if (!rcFile) {
            setError('गाड़ी की RC (Registration Certificate) की फोटो/PDF अपलोड करना अनिवार्य है।');
            return;
        }

        if (!isAdmin && userCoins < coinCost) {
            setError(`अपर्याप्त कॉइन्स! इस सर्विस के लिए ${coinCost} कॉइन्स आवश्यक हैं। आपके पास ${userCoins} कॉइन्स हैं।`);
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('vehicle_number', cleanNo);
        formData.append('number_plate_file', numberPlateFile);
        formData.append('rc_file', rcFile);
        if (mobile.trim()) formData.append('mobile', mobile.trim());
        if (note.trim()) formData.append('note', note.trim());

        try {
            const response = await axios.post('/utilities/vehicle-puc-without-otp/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                setSuccessData({
                    requestId: response.data.request_id,
                    vehicleNo: cleanNo,
                    message: response.data.message,
                    redirectUrl: response.data.redirect_url,
                });
            } else {
                setError(response.data.message || 'सर्विस रिक्वेस्ट सबमिट करने में विफल।');
            }
        } catch (err) {
            console.error('PUC Submission error:', err);
            const msg = err.response?.data?.message || err.response?.data?.errors
                ? Object.values(err.response?.data?.errors || {})[0]?.[0]
                : 'सर्विस रिक्वेस्ट सबमिट करते समय त्रुटि हुई। कृपया पुनः प्रयास करें।';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        Vehicle PUC Certificate (Without OTP)
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        गाड़ी की नंबर प्लेट और RC अपलोड करके PUC सर्टिफिकेट रिक्वेस्ट सबमिट करें
                    </p>
                </div>
            }
        >
            <Head title="Vehicle PUC (Without OTP) - Manual Request" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Information Banner */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-bold uppercase tracking-wider">
                                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                                <span>MANUAL VERIFICATION &bull; ADMIN APPROVED</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Vehicle PUC Certificate Request
                            </h2>
                            <p className="text-emerald-100/90 text-sm max-w-xl leading-relaxed">
                                गाड़ी का नंबर, नंबर प्लेट की फोटो और RC की कॉपी अपलोड करें। सबमिट करने के बाद आपकी रिक्वेस्ट Admin के पास जाएगी, और जांच के बाद ओरिजिनल PUC सर्टिफिकेट जारी किया जाएगा।
                            </p>
                        </div>

                        {/* Cost & Balance Pill */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0 gap-3">
                            <div className="text-left md:text-right">
                                <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">Service Charge</span>
                                <span className="text-2xl font-black text-amber-300">
                                    {isAdmin ? 'FREE (Admin)' : `🪙 ${coinCost} Coins`}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[11px] font-medium text-emerald-100 block">Your Wallet</span>
                                <span className="text-sm font-bold font-mono text-white">🪙 {userCoins} Coins</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Screen */}
                {successData ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/50 p-6 sm:p-10 shadow-xl text-center space-y-6 animate-fade-in">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                            <span className="material-symbols-outlined text-4xl">check_circle</span>
                        </div>

                        <div className="space-y-2 max-w-lg mx-auto">
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                                Status: Pending (प्रतीक्षारत)
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                                PUC Request Submitted!
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">
                                गाड़ी नंबर <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">{successData.vehicleNo}</strong> की PUC रिक्वेस्ट सफलतापूर्वक सबमिट हो गई है। Request ID: <strong>#{successData.requestId}</strong>
                            </p>
                            <p className="text-xs text-slate-400">
                                Admin द्वारा आपकी नंबर प्लेट और RC की जांच करने के बाद PUC सर्टिफिकेट जारी किया जाएगा।
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <Link
                                href={successData.redirectUrl || '/admin/service-requests'}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                <span>Track / View Request (#{successData.requestId})</span>
                            </Link>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs uppercase tracking-wider transition border border-slate-200 dark:border-slate-700"
                            >
                                + New PUC Request
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Main Submission Form */
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3 text-left">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0 text-xl">error</span>
                                <div className="text-sm font-semibold text-red-700 dark:text-red-300">
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Step 1: Vehicle Number */}
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                1. गाड़ी का रजिस्ट्रेशन नंबर (Vehicle Registration Number) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <span className="material-symbols-outlined text-2xl">directions_car</span>
                                </span>
                                <input
                                    type="text"
                                    maxLength={16}
                                    value={vehicleNo}
                                    onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                                    placeholder="e.g. HR26DK8337 or DL10CC1234"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-lg font-black font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition uppercase"
                                />
                            </div>
                            <p className="text-[11px] text-slate-400">बिना स्पेस या डैश के गाड़ी नंबर दर्ज करें (उदा. HR26DK8337)।</p>
                        </div>

                        {/* Step 2: Upload Documents Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                            {/* Number Plate Photo Upload */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                    <span>2. गाड़ी की नंबर प्लेट फोटो (Number Plate) <span className="text-red-500">*</span></span>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Mandatory</span>
                                </label>

                                <div
                                    onClick={() => plateInputRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                                        numberPlateFile
                                            ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                                            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                                    }`}
                                >
                                    <input
                                        ref={plateInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        onChange={handlePlateChange}
                                        className="hidden"
                                    />

                                    {numberPlatePreview ? (
                                        <div className="space-y-2">
                                            <img
                                                src={numberPlatePreview}
                                                alt="Number Plate Preview"
                                                className="h-32 w-auto max-w-full mx-auto object-contain rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs"
                                            />
                                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
                                                ✓ {numberPlateFile?.name}
                                            </p>
                                            <span className="text-[11px] text-slate-400 underline">फोटो बदलने के लिए क्लिक करें</span>
                                        </div>
                                    ) : numberPlateFile ? (
                                        <div className="space-y-1.5 py-4">
                                            <span className="material-symbols-outlined text-4xl text-emerald-600">description</span>
                                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                                {numberPlateFile.name}
                                            </p>
                                            <span className="text-[11px] text-slate-400 underline">फाइल बदलने के लिए क्लिक करें</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 py-4">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                                                <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 dark:text-white">
                                                    नंबर प्लेट की स्पष्ट फोटो चुनें
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, PDF (Max 10MB)</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RC Copy Upload */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                    <span>3. गाड़ी की RC की फोटो / PDF (RC Copy) <span className="text-red-500">*</span></span>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Mandatory</span>
                                </label>

                                <div
                                    onClick={() => rcInputRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                                        rcFile
                                            ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20'
                                            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                                    }`}
                                >
                                    <input
                                        ref={rcInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        onChange={handleRcChange}
                                        className="hidden"
                                    />

                                    {rcPreview ? (
                                        <div className="space-y-2">
                                            <img
                                                src={rcPreview}
                                                alt="RC Preview"
                                                className="h-32 w-auto max-w-full mx-auto object-contain rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs"
                                            />
                                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                                                ✓ {rcFile?.name}
                                            </p>
                                            <span className="text-[11px] text-slate-400 underline">RC बदलने के लिए क्लिक करें</span>
                                        </div>
                                    ) : rcFile ? (
                                        <div className="space-y-1.5 py-4">
                                            <span className="material-symbols-outlined text-4xl text-indigo-600">picture_as_pdf</span>
                                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                                {rcFile.name}
                                            </p>
                                            <span className="text-[11px] text-slate-400 underline">RC बदलने के लिए क्लिक करें</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 py-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                                                <span className="material-symbols-outlined text-2xl">upload_file</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 dark:text-white">
                                                    RC की फोटो या PDF अपलोड करें
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, PDF (Max 10MB)</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Optional Contact & Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    कस्टमर का मोबाइल नंबर (Optional Mobile)
                                </label>
                                <input
                                    type="tel"
                                    maxLength={15}
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                    placeholder="10 डिजिट मोबाइल नंबर (WhatsApp अपडेट्स के लिए)"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    टिप्पणी या नोट (Optional Note)
                                </label>
                                <input
                                    type="text"
                                    maxLength={250}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="उदा. अर्जेंट चाहिए या कोई विशेष विवरण..."
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Submit Button & Fee Details */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                सबमिट करने पर <strong className="text-slate-800 dark:text-white">{isAdmin ? '0 (Admin Free)' : `${coinCost} कॉइन्स`}</strong> कटेंगे। रिजेक्ट होने पर कॉइन्स तुरंत स्वतः वापस हो जाते हैं।
                            </div>

                            <button
                                type="submit"
                                disabled={loading || vehicleNo.trim().length < 4 || !numberPlateFile || !rcFile || (!isAdmin && userCoins < coinCost)}
                                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-md shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Submitting Request...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                        <span>Submit PUC Request ({isAdmin ? 'Free' : `🪙 ${coinCost} Coins`})</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Recent PUC Requests by Current User */}
                {recentRequests && recentRequests.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-600 text-[20px]">history</span>
                                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                                    आपकी पिछली PUC रिक्वेस्ट्स (My Recent PUC Requests)
                                </h3>
                            </div>
                            <Link
                                href="/admin/service-requests"
                                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                            >
                                <span>All Requests</span>
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentRequests.map((req) => {
                                const reg = req.input_data?.['Vehicle Registration Number'] || req.input_data?.reg_no || req.input_data?.Query || '—';
                                return (
                                    <div key={req.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-bold text-xs flex items-center justify-center">
                                                #{req.id}
                                            </span>
                                            <div>
                                                <span className="font-mono font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                                                    {reg}
                                                </span>
                                                <span className="text-[10px] text-slate-400 block font-mono">
                                                    {new Date(req.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(req.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <StatusBadge status={req.status} />

                                            {req.attachment && (
                                                <a
                                                    href={`/storage/${req.attachment}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-200/60"
                                                    title="Download Certificate"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">download</span>
                                                    <span>PUC</span>
                                                </a>
                                            )}

                                            <Link
                                                href={`/admin/service-requests/${req.id}`}
                                                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                            >
                                                <span>View</span>
                                                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
