import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

const LANGUAGES = [
    { code: 'HI', name: 'Hindi (हिंदी)', native: 'हिंदी' },
    { code: 'PA', name: 'Punjabi (ਪੰਜਾਬੀ)', native: 'ਪੰਜਾਬੀ' },
    { code: 'GU', name: 'Gujarati (ગુજરાતી)', native: 'ગુજરાતી' },
    { code: 'MR', name: 'Marathi (मराठी)', native: 'मराठी' },
    { code: 'TA', name: 'Tamil (தமிழ்)', native: 'தமிழ்' },
    { code: 'KN', name: 'Kannada (ಕನ್ನಡ)', native: 'ಕನ್ನಡ' },
    { code: 'BN', name: 'Bengali (বাংলা)', native: 'বাংলা' },
    { code: 'TE', name: 'Telugu (తెలుగు)', native: 'తెలుగు' },
    { code: 'OR', name: 'Odia (ଓଡ଼ିଆ)', native: 'ଓଡ଼ିଆ' },
    { code: 'SD', name: 'Sindhi (سنڌي)', native: 'سنڌي' },
];

export default function VoterPdfManualInstant({ service, userCoins = 0, isStaff = false, apiUrl = '', apiKey = '' }) {
    const coinCost = service?.coin_cost ?? 30;

    const [form, setForm] = useState({
        epic_no: '',
        name: '',
        name_local: '',
        gender: 'MALE',
        gender_local: 'पुरुष',
        father_type: 'Father',
        father_name: '',
        father_name_local: '',
        age: '',
        dob_local: '',
        tahshil: '',
        district: '',
        house_no: '',
        assembly_no_name: '',
        assembly_no_name_local: '',
        part_no: '',
        part_name: '',
        part_name_local: '',
        address: '',
        address_local: '',
        language: 'HI',
    });

    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const [loading, setLoading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    // Admin Settings Modal
    const [showSettings, setShowSettings] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(apiUrl || 'https://apinice.in/api/v2/voter-manual-pdf.php');
    const [adminApiKey, setAdminApiKey] = useState(apiKey || 'Y3VK89K8V8');
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsNotice, setSettingsNotice] = useState(null);

    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const updated = { ...prev, [name]: value };

            // Auto-sync gender_local when gender changes (for Hindi)
            if (name === 'gender' && prev.language === 'HI') {
                if (value === 'MALE') updated.gender_local = 'पुरुष';
                else if (value === 'FEMALE') updated.gender_local = 'महिला';
                else updated.gender_local = 'अन्य';
            }

            // Auto-compose address if house_no, tahshil or district changed and address is empty
            if (name === 'house_no' || name === 'tahshil' || name === 'district') {
                const parts = [updated.house_no, updated.tahshil, updated.district].filter(Boolean);
                if (parts.length > 0 && !prev.addressManual) {
                    updated.address = parts.join(', ');
                }
            }

            return updated;
        });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Photo size 2MB se jyada nahi hona chahiye.');
                return;
            }
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    // Free Google Translate helper for instant local language translation
    const handleAutoTranslate = async () => {
        setTranslating(true);
        setError(null);

        const targetLang = form.language.toLowerCase();
        const translateText = async (text) => {
            if (!text || !text.trim()) return '';
            try {
                const res = await axios.get(
                    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
                        text.trim()
                    )}`
                );
                if (res.data && res.data[0] && res.data[0][0]) {
                    return res.data[0].map((t) => t[0]).join('');
                }
            } catch (e) {
                console.warn('Translate error:', e);
            }
            return '';
        };

        try {
            const [nameLocal, fatherLocal, addrLocal, assemblyLocal, partLocal] = await Promise.all([
                translateText(form.name),
                translateText(form.father_name),
                translateText(form.address),
                translateText(form.assembly_no_name),
                translateText(form.part_name),
            ]);

            setForm((prev) => ({
                ...prev,
                name_local: nameLocal || prev.name_local,
                father_name_local: fatherLocal || prev.father_name_local,
                address_local: addrLocal || prev.address_local,
                assembly_no_name_local: assemblyLocal || prev.assembly_no_name_local,
                part_name_local: partLocal || prev.part_name_local,
                dob_local: prev.age,
            }));
        } catch (err) {
            console.error('Auto translate failed:', err);
        } finally {
            setTranslating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!photoFile && !result) {
            setError('Kripya voter photo upload karein (Required).');
            return;
        }

        if (!form.epic_no.trim()) {
            setError('EPIC (Voter ID) Number bharna anivarya hai.');
            return;
        }

        if (!form.name.trim()) {
            setError('Voter Name (English) bharna anivarya hai.');
            return;
        }

        if (!form.father_name.trim()) {
            setError('Father / Husband Name bharna anivarya hai.');
            return;
        }

        if (!form.tahshil.trim()) {
            setError('Tahshil / Block name bharna anivarya hai.');
            return;
        }

        if (!form.address.trim()) {
            setError('Full Address bharna anivarya hai.');
            return;
        }

        if (!isStaff && userCoins < coinCost) {
            setError(`Insufficient balance. Is service ke liye ${coinCost} coins chahiye.`);
            return;
        }

        setLoading(true);

        const formData = new FormData();
        Object.keys(form).forEach((key) => {
            if (form[key] !== null && form[key] !== undefined) {
                formData.append(key, form[key]);
            }
        });

        if (photoFile) {
            formData.append('imagefile', photoFile);
        }

        try {
            const response = await axios.post('/utilities/voter-pdf-manual-instant/generate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                setResult(response.data);
                // Scroll to result preview
                setTimeout(() => {
                    const el = document.getElementById('voter-card-preview');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                setError(response.data.message || 'Voter card generation failed.');
            }
        } catch (err) {
            console.error('Voter generate error:', err);
            const msg = err.response?.data?.message || 'Server error occurred during generation.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReset = () => {
        setResult(null);
        setPhotoFile(null);
        setPhotoPreview(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingsNotice(null);

        try {
            const res = await axios.post('/utilities/voter-pdf-manual-instant/settings', {
                api_url: adminApiUrl,
                api_key: adminApiKey,
            });
            if (res.data.success) {
                setSettingsNotice({ type: 'success', text: 'API Settings updated successfully!' });
                setTimeout(() => setShowSettings(false), 1200);
            }
        } catch (err) {
            setSettingsNotice({
                type: 'error',
                text: err.response?.data?.message || 'Failed to save settings.',
            });
        } finally {
            setSavingSettings(false);
        }
    };

    // Compute live values for card
    const cardData = result?.card_data || form;
    const finalPhotoUrl = result?.photo_url || photoPreview;

    const qrPayload = `EPIC:${cardData.epic_no || 'NA'}|NAME:${cardData.name || 'NA'}|FATHER:${
        cardData.father_name || 'NA'
    }|GENDER:${cardData.gender || 'NA'}|DOB:${cardData.age || 'NA'}|ADDRESS:${cardData.address || 'NA'}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data=${encodeURIComponent(
        qrPayload
    )}`;

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl shadow-xs border border-indigo-100 dark:border-indigo-900">
                            🗳️
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                                    Voter PDF Manual Instant
                                </h1>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    Instant API
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Generate Voter ID Card PDF with photo &amp; local language support via API
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-right px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
                            <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                                {isStaff ? 'FREE (Admin)' : `₹${Number(coinCost).toFixed(2)}`}
                            </span>
                            <span className="block text-[9px] font-bold text-slate-400 uppercase">
                                {coinCost} COINS / REQUEST
                            </span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Voter PDF Manual Instant" />

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-section, #print-section * {
                        visibility: visible;
                    }
                    #print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 20px;
                        background: white !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="max-w-7xl mx-auto py-2 sm:py-4 space-y-6">
                {/* 1. TOP NOTICE BANNER */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 border border-blue-200/80 dark:border-indigo-900/60 rounded-3xl p-4 sm:p-5 shadow-xs flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                            <span className="material-symbols-outlined text-[20px]">badge</span>
                        </div>
                        <div>
                            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                                Voter Card PVC Front &amp; Back Instant Generation
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Voter photo upload karein, English me details bharein aur local language select karein.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>API Server Live</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-mono">Cost: {coinCost} Coins</span>
                    </div>
                </div>

                {/* 2. MAIN LAYOUT: Form (7 cols) + Live Card Preview (5 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT FORM */}
                    <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                            <div className="flex items-center gap-2">
                                <span className="text-indigo-600 text-lg">📝</span>
                                <h2 className="text-base font-black text-slate-900 dark:text-white">
                                    Voter Details Form
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={handleAutoTranslate}
                                disabled={translating || !form.name}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                title="Translate English fields to local language"
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    {translating ? 'sync' : 'g_translate'}
                                </span>
                                <span>{translating ? 'Translating...' : 'Auto-Translate to Local'}</span>
                            </button>
                        </div>

                        {error && (
                            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-2.5 text-xs font-bold text-red-700 dark:text-red-300">
                                <span className="material-symbols-outlined text-[18px] text-red-500 shrink-0 mt-0.5">
                                    error
                                </span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* PHOTO UPLOAD */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                <label className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-2">
                                    Photo Upload <span className="text-red-500">*</span>
                                    <span className="text-[10px] text-slate-400 font-normal lowercase ml-1">
                                        (JPEG / PNG, max 2MB)
                                    </span>
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-20 rounded-xl bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="material-symbols-outlined text-3xl text-slate-400">
                                                add_a_photo
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            onChange={handlePhotoChange}
                                            className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer cursor-pointer"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Clear passport-size photo select karein.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* EPIC NO & LANGUAGE */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Epic No. (Voter ID) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="epic_no"
                                        value={form.epic_no}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, epic_no: e.target.value.toUpperCase() }))
                                        }
                                        placeholder="e.g. ABC1234567"
                                        maxLength={25}
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Language Selection <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="language"
                                        value={form.language}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {LANGUAGES.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* AGE / DOB & AGE LOCAL */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Age / DOB (English)
                                    </label>
                                    <input
                                        type="text"
                                        name="age"
                                        value={form.age}
                                        onChange={handleChange}
                                        placeholder="e.g. 32 or 15/08/1992"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Age / DOB (Local Language)
                                    </label>
                                    <input
                                        type="text"
                                        name="dob_local"
                                        value={form.dob_local}
                                        onChange={handleChange}
                                        placeholder="Auto-translated or type local"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* VOTER NAME (ENGLISH & LOCAL) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Name (English) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, name: e.target.value.toUpperCase() }))
                                        }
                                        placeholder="RAHUL KUMAR"
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Name (Local Language)
                                    </label>
                                    <input
                                        type="text"
                                        name="name_local"
                                        value={form.name_local}
                                        onChange={handleChange}
                                        placeholder="राहुल कुमार"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* GENDER & GENDER LOCAL */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Gender <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="MALE">MALE</option>
                                        <option value="FEMALE">FEMALE</option>
                                        <option value="OTHER">OTHER</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Gender (Local)
                                    </label>
                                    <input
                                        type="text"
                                        name="gender_local"
                                        value={form.gender_local}
                                        onChange={handleChange}
                                        placeholder="पुरुष / महिला"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* FATHER / HUSBAND TYPE & NAME */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Relation Type
                                    </label>
                                    <select
                                        name="father_type"
                                        value={form.father_type}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Father">Father</option>
                                        <option value="Husband">Husband</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Father / Husband Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="father_name"
                                        value={form.father_name}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, father_name: e.target.value.toUpperCase() }))
                                        }
                                        placeholder="SURESH KUMAR"
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Father / Husband (Local)
                                    </label>
                                    <input
                                        type="text"
                                        name="father_name_local"
                                        value={form.father_name_local}
                                        onChange={handleChange}
                                        placeholder="सुरेश कुमार"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* TAHSHIL & DISTRICT & HOUSE NO */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Tahshil / Block <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="tahshil"
                                        value={form.tahshil}
                                        onChange={handleChange}
                                        placeholder="Varanasi"
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        District <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={form.district}
                                        onChange={handleChange}
                                        placeholder="Varanasi"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        House No. / Street
                                    </label>
                                    <input
                                        type="text"
                                        name="house_no"
                                        value={form.house_no}
                                        onChange={handleChange}
                                        placeholder="123, Main Road"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* ASSEMBLY CONST. NO & NAME */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Assembly Const. No &amp; Name
                                    </label>
                                    <input
                                        type="text"
                                        name="assembly_no_name"
                                        value={form.assembly_no_name}
                                        onChange={handleChange}
                                        placeholder="101 - Varanasi North"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Assembly Name (Local)
                                    </label>
                                    <input
                                        type="text"
                                        name="assembly_no_name_local"
                                        value={form.assembly_no_name_local}
                                        onChange={handleChange}
                                        placeholder="१०१ - वाराणसी उत्तर"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* PART NO & PART NAME */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Part No
                                    </label>
                                    <input
                                        type="text"
                                        name="part_no"
                                        value={form.part_no}
                                        onChange={handleChange}
                                        placeholder="45"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Part Name
                                    </label>
                                    <input
                                        type="text"
                                        name="part_name"
                                        value={form.part_name}
                                        onChange={handleChange}
                                        placeholder="Ward 5"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Part Name (Local)
                                    </label>
                                    <input
                                        type="text"
                                        name="part_name_local"
                                        value={form.part_name_local}
                                        onChange={handleChange}
                                        placeholder="वार्ड ५"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* FULL ADDRESS & ADDRESS LOCAL */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Address (Full English) <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={2}
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="123 Main Road, Varanasi, UP"
                                        required
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Address (Local Language)
                                    </label>
                                    <textarea
                                        rows={2}
                                        name="address_local"
                                        value={form.address_local}
                                        onChange={handleChange}
                                        placeholder="123 मेन रोड, वाराणसी, उत्तर प्रदेश"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined text-lg animate-spin">
                                            progress_activity
                                        </span>
                                        <span>Generating Voter Card...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">badge</span>
                                        <span>
                                            Generate Voter Card PDF{' '}
                                            {isStaff ? '(Admin Free)' : `(${coinCost} Coins)`}
                                        </span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: LIVE PVC CARD PREVIEW */}
                    <div id="voter-card-preview" className="lg:col-span-5 space-y-4">
                        <div className="sticky top-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <span>Live PVC Card Preview</span>
                                    {result && (
                                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                            ✓ Ready to Print
                                        </span>
                                    )}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handlePrint}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-sm">print</span>
                                        <span>Print Card</span>
                                    </button>
                                    {result && (
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* PRINTABLE CARD SECTION */}
                            <div id="print-section" className="space-y-4">
                                {/* ================= FRONT CARD ================= */}
                                <div className="w-full max-w-[370px] mx-auto bg-gradient-to-b from-amber-50/90 via-white to-amber-50/80 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden text-slate-900 text-[10px] leading-tight p-3.5 relative select-none">
                                    {/* Header */}
                                    <div className="text-center border-b border-slate-300 pb-1.5 mb-2">
                                        <div className="flex items-center justify-center gap-1 text-[9px] font-black text-red-700 tracking-wider">
                                            <span>🇮🇳</span>
                                            <span>भारत निर्वाचन आयोग</span>
                                        </div>
                                        <div className="text-[9px] font-black tracking-widest text-slate-800 uppercase">
                                            ELECTION COMMISSION OF INDIA
                                        </div>
                                    </div>

                                    {/* EPIC NUMBER BADGE */}
                                    <div className="text-center bg-slate-900 text-white py-1 px-3 rounded-lg font-mono font-black text-xs tracking-widest mb-3 shadow-2xs">
                                        {cardData.epic_no || 'ABC1234567'}
                                    </div>

                                    {/* Photo + Details */}
                                    <div className="flex gap-3 items-start">
                                        {/* Photo Box */}
                                        <div className="w-20 h-24 bg-slate-200 border border-slate-400 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative shadow-2xs">
                                            {finalPhotoUrl ? (
                                                <img
                                                    src={finalPhotoUrl}
                                                    alt="Voter"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-slate-400">
                                                    person
                                                </span>
                                            )}
                                            {/* Hologram stamp */}
                                            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-300 to-cyan-300 opacity-80 border border-white/60 shadow-xs"></div>
                                        </div>

                                        {/* Text Details */}
                                        <div className="flex-1 space-y-1.5">
                                            <div>
                                                <span className="text-[8px] text-slate-500 font-bold block">
                                                    नाम / Name
                                                </span>
                                                {cardData.name_local && (
                                                    <div className="font-black text-[11px] text-slate-900">
                                                        {cardData.name_local}
                                                    </div>
                                                )}
                                                <div className="font-black text-[10px] uppercase text-slate-800">
                                                    {cardData.name || 'VOTER NAME'}
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-[8px] text-slate-500 font-bold block">
                                                    {cardData.father_type === 'Husband'
                                                        ? "पति का नाम / Husband's Name"
                                                        : "पिता का नाम / Father's Name"}
                                                </span>
                                                {cardData.father_name_local && (
                                                    <div className="font-bold text-[10px] text-slate-900">
                                                        {cardData.father_name_local}
                                                    </div>
                                                )}
                                                <div className="font-bold text-[9px] uppercase text-slate-700">
                                                    {cardData.father_name || 'RELATION NAME'}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-1.5 pt-0.5 border-t border-slate-200">
                                                <div>
                                                    <span className="text-[8px] text-slate-500 font-bold block">
                                                        लिंग / Gender
                                                    </span>
                                                    <span className="font-bold text-[9px]">
                                                        {cardData.gender_local
                                                            ? `${cardData.gender_local} / `
                                                            : ''}
                                                        {cardData.gender || 'MALE'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[8px] text-slate-500 font-bold block">
                                                        आयु / Age
                                                    </span>
                                                    <span className="font-bold text-[9px]">
                                                        {cardData.age || '32'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer Stamp */}
                                    <div className="mt-3 pt-1.5 border-t border-slate-300 flex items-center justify-between text-[8px] text-slate-500">
                                        <span className="font-mono">SEC-ID: {cardData.epic_no || 'NA'}</span>
                                        <span className="font-bold text-slate-700">निर्वाचक रजिस्ट्रीकरण अधिकारी</span>
                                    </div>
                                </div>

                                {/* ================= BACK CARD ================= */}
                                <div className="w-full max-w-[370px] mx-auto bg-gradient-to-b from-amber-50/90 via-white to-amber-50/80 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden text-slate-900 text-[10px] leading-tight p-3.5 relative select-none">
                                    <div className="flex gap-2.5 items-start mb-2.5">
                                        {/* QR CODE */}
                                        <div className="w-18 h-18 bg-white border border-slate-300 rounded-lg shrink-0 flex items-center justify-center p-1 shadow-2xs">
                                            <img
                                                src={qrCodeUrl}
                                                alt="QR Code"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        {/* ADDRESS INFO */}
                                        <div className="flex-1 space-y-0.5">
                                            <span className="text-[8px] text-slate-500 font-bold block">
                                                पता / Address
                                            </span>
                                            {cardData.address_local && (
                                                <div className="font-bold text-[9px] text-slate-900 leading-snug">
                                                    {cardData.address_local}
                                                </div>
                                            )}
                                            <div className="font-medium text-[8px] text-slate-700 leading-snug">
                                                {cardData.address || 'Full address here'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* CONSTITUENCY & PART */}
                                    <div className="space-y-1 border-t border-slate-200 pt-1.5 text-[9px]">
                                        <div>
                                            <span className="text-slate-500 font-bold">निर्वाचन क्षेत्र / Assembly: </span>
                                            <span className="font-bold text-slate-900">
                                                {cardData.assembly_no_name_local
                                                    ? `${cardData.assembly_no_name_local} / `
                                                    : ''}
                                                {cardData.assembly_no_name || '101 - Constituency'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 font-bold">भाग संख्या / Part: </span>
                                            <span className="font-bold text-slate-900">
                                                {cardData.part_no ? `Part ${cardData.part_no}` : ''}
                                                {cardData.part_name ? ` - ${cardData.part_name}` : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* DATE & SIGN */}
                                    <div className="mt-3 pt-1.5 border-t border-slate-300 flex justify-between items-end text-[8px] text-slate-500">
                                        <span>
                                            Issue Date:{' '}
                                            {new Date().toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </span>
                                        <div className="text-right">
                                            <div className="font-bold text-slate-800">
                                                Electoral Registration Officer
                                            </div>
                                            <span className="text-[7px] text-slate-400">
                                                Election Commission of India
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ADMIN API SETTINGS MODAL */}
            {showSettings && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-600">tune</span>
                                <span>Voter Manual PDF API Settings</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowSettings(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        {settingsNotice && (
                            <div
                                className={`p-3 rounded-2xl text-xs font-bold ${
                                    settingsNotice.type === 'success'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-red-50 text-red-700'
                                }`}
                            >
                                {settingsNotice.text}
                            </div>
                        )}

                        <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    API Endpoint URL
                                </label>
                                <input
                                    type="url"
                                    value={adminApiUrl}
                                    onChange={(e) => setAdminApiUrl(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    API Key (X-API-Key)
                                </label>
                                <input
                                    type="text"
                                    value={adminApiKey}
                                    onChange={(e) => setAdminApiKey(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSettings(false)}
                                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50"
                                >
                                    {savingSettings ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
