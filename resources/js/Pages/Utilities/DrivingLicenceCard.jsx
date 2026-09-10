import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function DrivingLicenceCard({ service, coinCost, userCoins, isAdmin }) {
    const { auth } = usePage().props;
    const [relation, setRelation] = useState('DL No'); // 'DL No' or 'LL No'
    const [dl, setDl] = useState('');
    const [dob, setDob] = useState('');
    const [background, setBackground] = useState('false'); // 'false' (White) or 'true' (Light Blue)
    const [cardType, setCardType] = useState('1'); // '1' (Normal PVC) or '2' (Chip PVC)

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('cards'); // 'cards' or 'a4'

    const currentBalance = auth?.user?.coins ?? userCoins ?? 0;
    const cost = coinCost || 20;

    const handleGenerate = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);

        const cleanDl = dl.trim().toUpperCase();
        if (!cleanDl) {
            setError('Please enter your Driving Licence (DL/LL) Number.');
            return;
        }

        if (!dob.trim()) {
            setError('Please enter your Date of Birth (DD-MM-YYYY).');
            return;
        }

        if (!isAdmin && currentBalance < cost) {
            setError(`Insufficient coins. You need ${cost} coins to generate this card. (Your balance: ${currentBalance} coins)`);
            return;
        }

        if (!confirm(`Generate Driving Licence Card for ${cleanDl}? ${!isAdmin ? cost + ' coins will be deducted from your wallet.' : 'Free for Staff'}`)) {
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/utilities/make-driving-licence-card/generate', {
                relation,
                dl: cleanDl,
                dob: dob.trim(),
                background,
                card_type: cardType,
            });

            if (response.data.success) {
                setResult(response.data);
                if (!isAdmin && auth.user && response.data.userCoins !== undefined) {
                    auth.user.coins = response.data.userCoins;
                }
            } else {
                setError(response.data.message || 'Failed to generate Driving Licence Card. Please verify details and try again.');
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Server error occurred while generating Driving Licence card.';
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = (url, filename) => {
        if (!url) return;
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.download = filename || 'driving_licence_card.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = (imageUrl) => {
        if (!imageUrl) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Print Driving Licence Card</title>
                    <style>
                        @page { size: A4 portrait; margin: 0; }
                        body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
                        img { max-width: 100%; height: auto; }
                    </style>
                </head>
                <body>
                    <img src="${imageUrl}" onload="window.print(); window.close();" />
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const resetForm = () => {
        setResult(null);
        setError(null);
        setDl('');
        setDob('');
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        Make Driving Licence (Cards)
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Generate Print-Ready PVC Front, Back & A4 Sheet from Driving Licence Number
                    </p>
                </div>
            }
        >
            <Head title="Make Driving Licence (Cards)" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Top Navigation & Balance */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to All Services
                    </Link>
                    <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 dark:border-amber-700/50 rounded-xl text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-bold shadow-sm">
                        <span className="material-symbols-outlined text-base text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                            monetization_on
                        </span>
                        <span>Wallet: {currentBalance} Coins</span>
                    </div>
                </div>

                {/* Hero Header Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/40">
                    <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                        <span className="material-symbols-outlined text-9xl">directions_car</span>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                                <span className="material-symbols-outlined text-3xl text-white">directions_car</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                                        Make Driving Licence (Cards)
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 uppercase tracking-wider">
                                        PVC Instant
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-indigo-200/80 font-medium mt-1">
                                    Official Parivahan DL to Print-Ready Smart PVC Front, Back & A4 Sheet.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 w-fit flex-shrink-0">
                            <span className="material-symbols-outlined text-amber-400 text-lg">bolt</span>
                            <div className="text-right">
                                <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">Service Fee</p>
                                <p className="text-sm font-black text-white">{cost} Coins <span className="text-[11px] font-normal text-indigo-300">/ Card</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400/80 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-200 text-sm flex items-start gap-3 shadow-lg shadow-rose-500/5 animate-shake">
                        <span className="material-symbols-outlined text-xl text-rose-600 flex-shrink-0 mt-0.5">error</span>
                        <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-sm">Failed to generate card</p>
                            <p className="text-xs mt-0.5 font-medium leading-relaxed">{error}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setError(null)}
                            className="text-rose-500 hover:text-rose-700 font-bold text-xs"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Result Section */}
                {result && result.cards && result.cards.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                        Driving Licence Card Generated!
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        High resolution print-ready card assets ready for download.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                Make Another Card
                            </button>
                        </div>

                        {/* View Tabs (Individual Cards vs A4 Sheet) */}
                        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
                            <button
                                type="button"
                                onClick={() => setActiveTab('cards')}
                                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                                    activeTab === 'cards'
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                Front & Back Cards (PVC)
                            </button>
                            {(result.a4_common || (result.cards[0] && result.cards[0].a4)) && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('a4')}
                                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                                        activeTab === 'a4'
                                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    A4 Print Sheet Layout
                                </button>
                            )}
                        </div>

                        {/* Front & Back Cards View */}
                        {activeTab === 'cards' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {result.cards.map((card, idx) => (
                                    <React.Fragment key={idx}>
                                        {/* Front Side */}
                                        {card.front && (
                                            <div className="flex flex-col bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                                                        Front Side
                                                    </span>
                                                    <span className="text-[11px] font-bold text-slate-500">
                                                        CR80 Standard PVC
                                                    </span>
                                                </div>
                                                <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white shadow-md group">
                                                    <img
                                                        src={card.front}
                                                        alt="Driving Licence Front"
                                                        className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => downloadFile(card.front, `DL_${dl}_Front.png`)}
                                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">download</span>
                                                        Download Front (PNG)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePrint(card.front)}
                                                        className="px-3.5 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                                                        title="Print Front"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">print</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Back Side */}
                                        {card.back && (
                                            <div className="flex flex-col bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                                        Back Side
                                                    </span>
                                                    <span className="text-[11px] font-bold text-slate-500">
                                                        CR80 Standard PVC
                                                    </span>
                                                </div>
                                                <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white shadow-md group">
                                                    <img
                                                        src={card.back}
                                                        alt="Driving Licence Back"
                                                        className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => downloadFile(card.back, `DL_${dl}_Back.png`)}
                                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">download</span>
                                                        Download Back (PNG)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePrint(card.back)}
                                                        className="px-3.5 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                                                        title="Print Back"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">print</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}

                        {/* A4 Sheet View */}
                        {activeTab === 'a4' && (
                            <div className="space-y-4">
                                {(() => {
                                    const a4Url = result.a4_common || (result.cards[0] && result.cards[0].a4);
                                    return a4Url ? (
                                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center space-y-4">
                                            <div className="w-full max-w-lg bg-white rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-lg">
                                                <img
                                                    src={a4Url}
                                                    alt="A4 Print Sheet Layout"
                                                    className="w-full h-auto object-contain"
                                                />
                                            </div>
                                            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                                                <button
                                                    type="button"
                                                    onClick={() => downloadFile(a4Url, `DL_${dl}_A4_Sheet.png`)}
                                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-lg">download</span>
                                                    Download A4 Print Sheet (PNG)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handlePrint(a4Url)}
                                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 font-bold text-sm rounded-xl transition-all cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-lg">print</span>
                                                    Print A4 Sheet
                                                </button>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
                    <form onSubmit={handleGenerate} className="space-y-6">
                        {/* 1. Licence Criteria / Type */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                1. Select Criteria / Licence Type <span className="text-rose-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRelation('DL No')}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 font-black text-sm transition-all cursor-pointer ${
                                        relation === 'DL No'
                                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                            : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-lg">directions_car</span>
                                    Driving Licence (DL No)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRelation('LL No')}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 font-black text-sm transition-all cursor-pointer ${
                                        relation === 'LL No'
                                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                            : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-lg">description</span>
                                    Learner Licence (LL No)
                                </button>
                            </div>
                        </div>

                        {/* 2. Licence Number */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                2. {relation === 'DL No' ? 'Driving Licence Number' : 'Learner Licence Number'} <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
                                    badge
                                </span>
                                <input
                                    type="text"
                                    value={dl}
                                    onChange={(e) => setDl(e.target.value.toUpperCase())}
                                    placeholder={relation === 'DL No' ? 'e.g. DL-1420110012345 or HR0619850034761' : 'e.g. LL-1420110012345'}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-extrabold text-base focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                                />
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                Enter exact licence number as printed on driving licence or parivahan portal.
                            </p>
                        </div>

                        {/* 3. Date of Birth */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                3. Date of Birth (DOB) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
                                    calendar_month
                                </span>
                                <input
                                    type="text"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    placeholder="DD-MM-YYYY (e.g. 15-05-1985)"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-bold text-base focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                                />
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                Format: DD-MM-YYYY (For example: 01-01-1990)
                            </p>
                        </div>

                        {/* 4. Options Grid: Background & Card Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            {/* Background Style */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                    4. Card Background
                                </label>
                                <select
                                    value={background}
                                    onChange={(e) => setBackground(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:border-indigo-600 outline-none transition-all"
                                >
                                    <option value="false">White Background (Standard)</option>
                                    <option value="true">Light Blue Background</option>
                                </select>
                            </div>

                            {/* Card Type */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                    5. Card Design Type
                                </label>
                                <select
                                    value={cardType}
                                    onChange={(e) => setCardType(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:border-indigo-600 outline-none transition-all"
                                >
                                    <option value="1">Normal PVC (Standard)</option>
                                    <option value="2">Chip PVC (Smart Card)</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-3 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Connecting to Parivahan API & Generating Card...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-2xl">credit_card</span>
                                        <span>Generate Driving Licence Card ({cost} Coins)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
