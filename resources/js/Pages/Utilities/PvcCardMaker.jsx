import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function PvcCardMaker({ cards, defaultCard, userCoins, isAdmin, isConfigured: initialConfigured, apiKey: initialApiKey }) {
    const { auth } = usePage().props;
    const [selectedCardKey, setSelectedCardKey] = useState(defaultCard || 'aadhaar');
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [phoneOption, setPhoneOption] = useState('false');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const [configured] = useState(initialConfigured);

    const currentCard = cards.find(c => c.key === selectedCardKey) || cards[0];

    // Read query param if URL has ?card=...
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const cardParam = params.get('card');
        if (cardParam && cards.some(c => c.key === cardParam)) {
            setSelectedCardKey(cardParam);
        }
    }, []);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
                setError('Only PDF files are supported for PVC card generation.');
                setFile(null);
                return;
            }
            setFile(selected);
            setError(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const dropped = e.dataTransfer.files[0];
            if (dropped.type !== 'application/pdf' && !dropped.name.toLowerCase().endsWith('.pdf')) {
                setError('Only PDF files are supported.');
                return;
            }
            setFile(dropped);
            setError(null);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select or upload a PDF document.');
            return;
        }

        const cost = currentCard.coin_cost || 20;
        const currentBalance = auth.user?.coins ?? userCoins;

        if (!isAdmin && currentBalance < cost) {
            setError(`Insufficient coins. This card requires ${cost} coins. (Your balance: ${currentBalance} coins)`);
            return;
        }

        if (!confirm(`Generate ${currentCard.name}? ${!isAdmin ? cost + ' coins will be deducted.' : 'Free for Staff'}`)) {
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('card_type', selectedCardKey);
        formData.append('file', file);
        if (password.trim()) {
            formData.append('password', password.trim());
        }
        if (currentCard.accepts_phone) {
            formData.append('phone', phoneOption);
        }

        try {
            const response = await axios.post('/utilities/pvc-card-maker/generate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                setResult(response.data);
                if (!isAdmin && auth.user && response.data.userCoins !== undefined) {
                    auth.user.coins = response.data.userCoins;
                }
            } else {
                setError(response.data.message || 'Failed to generate PVC card. Please try again.');
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'An error occurred while contacting the server.';
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const downloadImage = (url, filename) => {
        if (!url) return;
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.download = filename || 'pvc_card.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        {currentCard.name}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        {currentCard.description}
                    </p>
                </div>
            }
        >
            <Head title={currentCard.name} />

            <div className="max-w-6xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to All Services
                    </Link>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-bold shadow-sm">
                        <span className="material-symbols-outlined text-sm text-amber-500">monetization_on</span>
                        <span>Wallet: {auth.user?.coins ?? userCoins} Coins</span>
                    </div>
                </div>

                {/* Active Card Form & Upload Box */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Upload Form */}
                    <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">{currentCard.icon}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white leading-snug">
                                        {currentCard.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {currentCard.description}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                {currentCard.coin_cost} Coins
                            </span>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-4">
                            {/* Drag & Drop Upload */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Upload PDF Document <span className="text-red-500">*</span>
                                </label>
                                
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all duration-150 ${
                                        dragOver
                                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                                            : file
                                            ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-600'
                                            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30'
                                    }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    {file ? (
                                        <div className="flex items-center justify-center gap-3 text-emerald-700 dark:text-emerald-300">
                                            <span className="material-symbols-outlined text-3xl text-emerald-500">picture_as_pdf</span>
                                            <div className="text-left">
                                                <p className="font-bold text-sm truncate max-w-xs">{file.name}</p>
                                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                                                <span className="material-symbols-outlined text-2xl">upload_file</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                    Click to browse or drag & drop PDF here
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Standard PDF from official portals (Max 15MB)
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card-Specific Upload Guidance */}
                            {currentCard.key === 'haryana_familyid' && (
                                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs space-y-1.5 shadow-sm">
                                    <p className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                                        <span className="material-symbols-outlined text-base text-amber-600">info</span>
                                        Family ID PDF Requirements:
                                    </p>
                                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-800 dark:text-amber-300">
                                        <li>Kripya <strong>meraparivar.haryana.gov.in</strong> se download kiya hua official <strong>Parivar Pehchan Patra (Signed PPP)</strong> digital PDF hi upload karein.</li>
                                        <li>Scanner se scan ki hui copy, mobile se li gayi photo, ya browser se 'Print to PDF' kiya hua page <strong>support nahi karta</strong>.</li>
                                        <li>Aavedan slip ya edit receipt ke bajaye main Signed Family ID document upload karein.</li>
                                    </ul>
                                </div>
                            )}

                            {/* Password Field (Shown if card supports/accepts password) */}
                            {currentCard.accepts_password && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                        PDF Password (Optional)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="e.g. First 4 letters of name + Birth Year"
                                            className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                        <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">
                                            lock
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Required if your Aadhaar / PAN PDF is password-locked.
                                    </p>
                                </div>
                            )}

                            {/* Phone / Mobile Number Option (e.g. for Aadhaar Card) */}
                            {currentCard.accepts_phone && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                        Card Par Mobile Number Dalna Hai? (Phone Number)
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPhoneOption('false')}
                                            className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                                phoneOption === 'false'
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-base">close</span>
                                            No (Nahi)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPhoneOption('true')}
                                            className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                                phoneOption === 'true'
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-base">check</span>
                                            Yes (Haan)
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        PVC Card par mobile number print karne ke liye 'Yes' chunein.
                                    </p>
                                </div>
                            )}

                            {/* Error Alert */}
                            {error && (
                                <div className="p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2.5 text-red-700 dark:text-red-300 text-sm">
                                    <span className="material-symbols-outlined text-lg mt-0.5 flex-shrink-0">error</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !file}
                                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Generating {currentCard.name}...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">auto_fix_high</span>
                                        <span>Generate {currentCard.name}</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Information & Feature Guide */}
                    <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-500">verified</span>
                                PVC Print Specifications
                            </h3>
                            <div className="space-y-3.5">
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <span className="material-symbols-outlined text-indigo-600 mt-0.5">credit_card</span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Standard ISO CR80 PVC Size</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">85.60 mm × 53.98 mm (Standard ATM/Plastic ID card dimensions)</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <span className="material-symbols-outlined text-indigo-600 mt-0.5">print</span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">A4 Print Sheet Ready</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Pre-formatted 5-card layout sheet optimized for inkjet/laser photo paper</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <span className="material-symbols-outlined text-indigo-600 mt-0.5">qr_code_2</span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">High-Resolution QR & Scannability</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Maintains original UIDAI / NSDL / Election Commission encrypted QR codes</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                            <span>Supported: UIDAI, Parivar Pehchan Patra, PMJAY, ECI, NSDL</span>
                            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Ready
                            </span>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {result && result.cards && result.cards.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-emerald-300 dark:border-emerald-800/60 shadow-lg space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <span className="material-symbols-outlined text-2xl">check_circle</span>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                    {result.card_name || 'Card'} Generated Successfully!
                                </h3>
                            </div>
                            {result.a4_common && (
                                <a
                                    href={result.a4_common}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">print</span>
                                    Print A4 Sheet
                                </a>
                            )}
                        </div>

                        {/* Card Cards Preview Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {result.cards.map((card, idx) => (
                                <React.Fragment key={idx}>
                                    {/* Front Card */}
                                    {card.front && (
                                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                                    Front PVC Card
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => downloadImage(card.front, `${selectedCardKey}_front.png`)}
                                                    className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-600 shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-sm">download</span>
                                                    Download Front
                                                </button>
                                            </div>
                                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white shadow-md flex items-center justify-center p-2">
                                                <img
                                                    src={card.front}
                                                    alt="Front Card Preview"
                                                    className="max-h-64 object-contain rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Back Card */}
                                    {card.back && (
                                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                                    Back PVC Card
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => downloadImage(card.back, `${selectedCardKey}_back.png`)}
                                                    className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-600 shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-sm">download</span>
                                                    Download Back
                                                </button>
                                            </div>
                                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white shadow-md flex items-center justify-center p-2">
                                                <img
                                                    src={card.back}
                                                    alt="Back Card Preview"
                                                    className="max-h-64 object-contain rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Direct A4 Sheet Links if available */}
                        {result.cards[0]?.a4 && (
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-indigo-600 text-2xl">description</span>
                                    <div>
                                        <p className="font-bold text-sm text-indigo-950 dark:text-indigo-200">A4 Single/Batch Print Sheet</p>
                                        <p className="text-xs text-indigo-700 dark:text-indigo-400">Download formatted A4 document ready for your card printer tray</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={result.cards[0].a4}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">download</span>
                                        Download A4 File
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
