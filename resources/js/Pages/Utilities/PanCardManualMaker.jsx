import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function PanCardManualMaker() {
    const [formData, setFormData] = useState({
        pan_no: 'ABCDE1234F',
        name: 'RAHUL SHARMA',
        father_name: 'RAMESH SHARMA',
        dob: '15/08/1995',
    });

    const [photoPreview, setPhotoPreview] = useState(null);
    const [signPreview, setSignPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'pan_no') {
            setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPhotoPreview(url);
        }
    };

    const handleSignChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setSignPreview(url);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const response = await axios.post('/utilities/pan-card-manual-maker/generate', formData);
            if (response.data.success) {
                setResult(response.data);
                setSuccessMsg('PAN Card generated & saved! You can now print the PVC card.');
            } else {
                setError(response.data.message || 'Failed to generate PAN Card.');
            }
        } catch (err) {
            console.error('PAN Card Error:', err);
            setError(err.response?.data?.message || 'Error occurred while generating PAN Card.');
        } finally {
            setLoading(false);
        }
    };

    // Encode QR data
    const qrData = `PAN:${formData.pan_no}|NAME:${formData.name}|FATHER:${formData.father_name}|DOB:${formData.dob}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=2&data=${encodeURIComponent(qrData)}`;

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300">
                                Manual Service
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                100% Working
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white leading-tight mt-1">
                            PAN Card Manual Maker (PVC Print)
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Generate authentic Income Tax PAN card layout with photo, signature, and QR code
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-lg">print</span>
                            Print PVC Card
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="PAN Card Manual Maker - PVC Card Print" />

            {/* Custom Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #pan-card-print-area, #pan-card-print-area * {
                        visibility: visible !important;
                    }
                    #pan-card-print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        padding: 15mm 0 !important;
                        background: #ffffff !important;
                        display: flex !important;
                        flex-direction: row !important;
                        justify-content: center !important;
                        gap: 10mm !important;
                        box-shadow: none !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="max-w-7xl mx-auto mt-6 px-4 pb-12">
                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <span>{error}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                        <span>{successMsg}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Input Form (5 cols) */}
                    <div className="lg:col-span-5 space-y-6 no-print">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 sm:p-7">
                            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-xs">
                                    <span className="material-symbols-outlined text-2xl">credit_card</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-800 dark:text-white">PAN Card Details</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Card preview updates live as you type</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        PAN Number (10 Digits) *
                                    </label>
                                    <input
                                        type="text"
                                        name="pan_no"
                                        value={formData.pan_no}
                                        onChange={handleChange}
                                        required
                                        maxLength={10}
                                        placeholder="e.g. ABCDE1234F"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-base uppercase text-cyan-700 dark:text-cyan-300 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Full Name (English) *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. RAHUL SHARMA"
                                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Father's Name (English) *
                                    </label>
                                    <input
                                        type="text"
                                        name="father_name"
                                        value={formData.father_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. RAMESH SHARMA"
                                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Date of Birth (DD/MM/YYYY) *
                                    </label>
                                    <input
                                        type="text"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        required
                                        placeholder="DD/MM/YYYY"
                                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                {/* Upload Photo & Signature */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Upload Photo
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-cyan-900/40 dark:file:text-cyan-300 cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            Upload Signature
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSignChange}
                                            className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-cyan-900/40 dark:file:text-cyan-300 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-700 hover:to-indigo-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-lg">save</span>
                                                <span>Generate & Save (20 Coins)</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => window.print()}
                                        className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm rounded-2xl transition-all flex items-center gap-1 cursor-pointer"
                                        title="Print PVC Card"
                                    >
                                        <span className="material-symbols-outlined text-lg">print</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Live PVC PAN Card Preview (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7">
                            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200 dark:border-slate-800 no-print">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-cyan-600 text-2xl">visibility</span>
                                    <h3 className="text-base font-black text-slate-800 dark:text-white">
                                        Live Realistic PVC Card Preview
                                    </h3>
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    Standard CR-80 PVC Size
                                </span>
                            </div>

                            {/* PRINT AREA (Contains Front and Back Cards) */}
                            <div id="pan-card-print-area" className="flex flex-col xl:flex-row items-center justify-center gap-6">
                                
                                {/* FRONT CARD */}
                                <div
                                    className="relative w-[345px] h-[216px] rounded-[14px] overflow-hidden border border-slate-300 dark:border-slate-700 shadow-2xl flex flex-col justify-between p-3 select-none text-slate-900 bg-gradient-to-b from-[#e0f2fe] via-[#ecfeff] to-[#f0fdfa]"
                                    style={{
                                        boxShadow: '0 12px 30px -6px rgba(0, 0, 0, 0.25)',
                                    }}
                                >
                                    {/* Security Guilloche Pattern Overlay */}
                                    <div
                                        className="absolute inset-0 opacity-15 pointer-events-none"
                                        style={{
                                            backgroundImage: 'radial-gradient(circle at 50% 50%, #0284c7 1px, transparent 1px)',
                                            backgroundSize: '12px 12px',
                                        }}
                                    />

                                    {/* Central Watermark Ashok Stambh */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                        <div className="w-32 h-32 rounded-full border-4 border-slate-700 flex items-center justify-center font-bold text-5xl">
                                            🏛️
                                        </div>
                                    </div>

                                    {/* Top Header Row */}
                                    <div className="relative z-10 flex items-center justify-between border-b border-cyan-800/20 pb-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className="text-lg">🏛️</div>
                                            <div className="leading-tight">
                                                <div className="text-[8px] font-black text-cyan-950 uppercase tracking-wider">
                                                    INCOME TAX DEPARTMENT
                                                </div>
                                                <div className="text-[7.5px] font-extrabold text-cyan-900">
                                                    आयकर विभाग
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right leading-tight">
                                            <div className="text-[8px] font-black text-cyan-950 uppercase tracking-wider">
                                                GOVT. OF INDIA
                                            </div>
                                            <div className="text-[7.5px] font-extrabold text-cyan-900">
                                                भारत सरकार
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subheader: Permanent Account Number Card */}
                                    <div className="relative z-10 text-center py-0.5">
                                        <div className="text-[8px] font-extrabold text-slate-700 tracking-wide">
                                            स्थायी लेखा संख्या कार्ड / Permanent Account Number Card
                                        </div>
                                    </div>

                                    {/* Card Body: Left (Photo + Sign) | Middle (Details) | Right (QR + Hologram) */}
                                    <div className="relative z-10 flex gap-2.5 items-start mt-0.5">
                                        {/* Photo Box */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-[62px] h-[76px] bg-slate-200 border border-slate-500 rounded-sm overflow-hidden flex items-center justify-center shadow-xs">
                                                {photoPreview ? (
                                                    <img src={photoPreview} alt="Card Photo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                                                )}
                                            </div>

                                            {/* Signature below Photo */}
                                            <div className="w-[62px] h-[20px] mt-1 border-b border-slate-600 flex items-center justify-center overflow-hidden">
                                                {signPreview ? (
                                                    <img src={signPreview} alt="Signature" className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <span className="text-[7px] italic text-slate-500 font-serif">Signature</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Middle: Details */}
                                        <div className="flex-1 space-y-1 text-[8.5px] leading-tight pt-0.5">
                                            <div>
                                                <span className="text-[7px] font-bold text-slate-600 block">
                                                    नाम / Name
                                                </span>
                                                <div className="font-black text-[9.5px] text-slate-900 tracking-wide uppercase truncate">
                                                    {formData.name || 'NAME SURNAME'}
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-[7px] font-bold text-slate-600 block">
                                                    पिता का नाम / Father's Name
                                                </span>
                                                <div className="font-bold text-[9px] text-slate-900 tracking-wide uppercase truncate">
                                                    {formData.father_name || "FATHER'S NAME"}
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-[7px] font-bold text-slate-600 block">
                                                    जन्म की तारीख / Date of Birth
                                                </span>
                                                <div className="font-bold text-[9px] text-slate-900 tracking-wider">
                                                    {formData.dob || 'DD/MM/YYYY'}
                                                </div>
                                            </div>

                                            <div className="pt-0.5">
                                                <span className="text-[7px] font-bold text-slate-600 block">
                                                    स्थायी लेखा संख्या / PAN
                                                </span>
                                                <div className="font-mono font-black text-[12px] text-slate-950 tracking-wider">
                                                    {formData.pan_no || 'ABCDE1234F'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: QR Code & Hologram */}
                                        <div className="flex flex-col items-center justify-between h-[96px] w-[62px] shrink-0">
                                            {/* Hologram badge simulation */}
                                            <div
                                                className="w-7 h-7 rounded-full border border-amber-300/80 shadow-xs flex items-center justify-center text-[9px] font-black text-amber-900"
                                                style={{
                                                    background: 'radial-gradient(circle at 30% 30%, #fef08a, #f59e0b, #d97706)',
                                                    boxShadow: '0 0 6px rgba(245, 158, 11, 0.4)',
                                                }}
                                                title="Govt of India Security Hologram"
                                            >
                                                🇮🇳
                                            </div>

                                            {/* Dynamic Scannable 2D QR Code */}
                                            <div className="w-[58px] h-[58px] bg-white p-0.5 border border-slate-400 rounded-sm shadow-xs flex items-center justify-center">
                                                <img
                                                    src={qrUrl}
                                                    alt="PAN QR"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* BACK CARD */}
                                <div
                                    className="relative w-[345px] h-[216px] rounded-[14px] overflow-hidden border border-slate-300 dark:border-slate-700 shadow-2xl flex flex-col justify-between p-3 select-none text-slate-900 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]"
                                    style={{
                                        boxShadow: '0 12px 30px -6px rgba(0, 0, 0, 0.25)',
                                    }}
                                >
                                    {/* Security Pattern */}
                                    <div
                                        className="absolute inset-0 opacity-10 pointer-events-none"
                                        style={{
                                            backgroundImage: 'radial-gradient(circle at 50% 50%, #475569 1px, transparent 1px)',
                                            backgroundSize: '10px 10px',
                                        }}
                                    />

                                    {/* Legal Information / Terms */}
                                    <div className="relative z-10 space-y-1">
                                        <div className="text-[7px] text-slate-700 leading-snug font-medium">
                                            1. इस कार्ड के खोने/पाने पर कृपया सूचित करें/लौटाएं:
                                            <br />
                                            <b>आयकर पैन सेवा केंद्र, NSDL (Protean eGov Technologies Limited)</b>
                                        </div>
                                        <div className="text-[6.5px] text-slate-600 leading-snug">
                                            If found, please return to:
                                            <br />
                                            <b>Income Tax PAN Services Unit, Protean eGov Technologies Limited</b>
                                            <br />
                                            Trade World, A Wing, 4th Floor, Kamala Mills Compound, Senapati Bapat Marg, Lower Parel, Mumbai - 400 013.
                                        </div>
                                    </div>

                                    {/* Middle: Barcode Representation */}
                                    <div className="relative z-10 flex flex-col items-center justify-center my-1 py-1 bg-white/70 rounded-md border border-slate-300/80">
                                        {/* Barcode Lines */}
                                        <div className="flex items-center gap-[2px] h-7">
                                            <div className="w-[2px] h-full bg-slate-900" />
                                            <div className="w-[1px] h-full bg-slate-900" />
                                            <div className="w-[3px] h-full bg-slate-900" />
                                            <div className="w-[1px] h-full bg-slate-900" />
                                            <div className="w-[2px] h-full bg-slate-900" />
                                            <div className="w-[4px] h-full bg-slate-900" />
                                            <div className="w-[1px] h-full bg-slate-900" />
                                            <div className="w-[3px] h-full bg-slate-900" />
                                            <div className="w-[2px] h-full bg-slate-900" />
                                            <div className="w-[1px] h-full bg-slate-900" />
                                            <div className="w-[3px] h-full bg-slate-900" />
                                            <div className="w-[2px] h-full bg-slate-900" />
                                            <div className="w-[1px] h-full bg-slate-900" />
                                            <div className="w-[4px] h-full bg-slate-900" />
                                            <div className="w-[2px] h-full bg-slate-900" />
                                            <div className="w-[1px] h-full bg-slate-900" />
                                            <div className="w-[3px] h-full bg-slate-900" />
                                            <div className="w-[1px] h-full bg-slate-900" />
                                            <div className="w-[2px] h-full bg-slate-900" />
                                            <div className="w-[4px] h-full bg-slate-900" />
                                            <div className="w-[2px] h-full bg-slate-900" />
                                            <div className="w-[1px] h-full bg-slate-900" />
                                            <div className="w-[3px] h-full bg-slate-900" />
                                            <div className="w-[2px] h-full bg-slate-900" />
                                        </div>
                                        <div className="font-mono font-black text-[9px] tracking-widest text-slate-800 mt-0.5">
                                            *{formData.pan_no || 'ABCDE1234F'}*
                                        </div>
                                    </div>

                                    {/* Footer Contact Details */}
                                    <div className="relative z-10 border-t border-slate-300 pt-1 flex items-center justify-between text-[6.5px] font-bold text-slate-600">
                                        <span>📞 020-2721 8080</span>
                                        <span>✉ tininfo@proteantech.in</span>
                                        <span>🌐 www.incometax.gov.in</span>
                                    </div>
                                </div>

                            </div>

                            {/* Helpful Instructions */}
                            <div className="mt-6 p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/40 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 no-print">
                                <div className="font-bold text-cyan-900 dark:text-cyan-300 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base">info</span>
                                    Printing Instructions for Cyber Cafes:
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                                    <li>Click <b>"Print PVC Card"</b> button to print directly onto standard CR-80 PVC plastic cards or photo paper.</li>
                                    <li>In the print preview dialog, set paper size to <b>A4</b>, Margins to <b>None/Default</b>, and Scale to <b>100%</b>.</li>
                                    <li>The cards are rendered at exact 85.6mm × 53.98mm scale with front and back side-by-side.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
