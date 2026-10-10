import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

const InfoRow = ({ label, value, icon, copyable, onCopy, isCopied, badge }) => {
    if (!value || value === 'N/A' || value === '') return null;
    return (
        <div className="flex items-center justify-between py-3.5 px-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-colors">
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40">
                    <span className="material-symbols-outlined text-[19px]">{icon}</span>
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm sm:text-base font-black text-slate-800 dark:text-white break-words">{value}</p>
                        {badge && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                {badge}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {copyable && (
                <button
                    type="button"
                    onClick={() => onCopy(value)}
                    className="flex-shrink-0 ml-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 transition-all flex items-center gap-1.5"
                    title="Copy to clipboard"
                >
                    <span className="material-symbols-outlined text-[15px]">{isCopied ? 'done' : 'content_copy'}</span>
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
            )}
        </div>
    );
};

export default function PanToAadhar() {
    const { service, coinCost = 99, isAdmin = false, apiUrl: propApiUrl = '', apiKey: propApiKey = '', currentService, auth } = usePage().props;

    const [pan, setPan] = useState('');
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedField, setCopiedField] = useState(null);
    const [copiedAll, setCopiedAll] = useState(false);

    const displayCoinCost = service?.coin_cost ?? currentService?.coin_cost ?? coinCost ?? 99;

    // Admin API Settings State
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_aadhar.php');
    const [adminApiKey, setAdminApiKey] = useState(propApiKey || '');
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingMsg, setSettingMsg] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        const cleanPan = pan.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
            setError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).');
            return;
        }

        if (!name.trim()) {
            setError('Please enter the cardholder Name as per PAN.');
            return;
        }

        if (!dob.trim()) {
            setError('Please enter the Date of Birth (DD/MM/YYYY).');
            return;
        }

        const isUserAdmin = auth?.user?.is_admin || isAdmin;
        if (!isUserAdmin && (auth?.user?.coins ?? 0) < displayCoinCost) {
            setError(`Insufficient coins. This service requires ${displayCoinCost} Coins. Please recharge your wallet.`);
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/pan-to-aadhar-unmasked/search', {
                pan: cleanPan,
                name: name.trim().toUpperCase(),
                dob: dob.trim(),
            });

            if (response.data.success) {
                setResult(response.data.data);
                if (!isUserAdmin && auth?.user) {
                    auth.user.coins -= displayCoinCost;
                }
            } else {
                setError(response.data.message || 'Aadhaar details not found for this PAN card.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'An error occurred while communicating with the PAN server.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, fieldName) => {
        if (!text || text === 'N/A') return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const copyAllDetails = () => {
        if (!result) return;
        const text = `--- PAN TO AADHAAR UNMASKED DETAILS ---
Aadhaar Number: ${result.aadhar_number || result.aadhaar_number || 'N/A'}
PAN Number: ${result.pan || pan}
Cardholder Name: ${result.name || name}
Father's Name: ${result.father_name || 'N/A'}
Date of Birth: ${result.dob || dob}
Gender: ${result.gender || 'N/A'}
Mobile: ${result.mobile || 'N/A'}
Email: ${result.email || 'N/A'}
Address: ${result.address || 'N/A'}
City/State/Pin: ${[result.city, result.state, result.pincode].filter(Boolean).join(', ') || 'N/A'}
Source: Good-API-Point PAN To Aadhaar`;
        navigator.clipboard.writeText(text);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSaveAdminSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingMsg(null);

        try {
            const res = await axios.post('/utilities/pan-to-aadhar-unmasked/update-api', {
                api_url: adminApiUrl,
                api_key: adminApiKey,
            });
            if (res.data.success) {
                setSettingMsg({ type: 'success', text: res.data.message });
                setTimeout(() => setShowAdminModal(false), 1200);
            } else {
                setSettingMsg({ type: 'error', text: res.data.message || 'Failed to save settings.' });
            }
        } catch (err) {
            setSettingMsg({ type: 'error', text: 'Error saving settings.' });
        } finally {
            setSavingSettings(false);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Back to Dashboard"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl sm:text-3xl">badge</span>
                                <span>PAN to Aadhaar Unmasked Instant</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                Get unmasked Aadhaar details instantly using PAN, Name & DOB &bull; Good-API-Point
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
                            <span>🪙</span>
                            <span>{displayCoinCost} Coins / Search</span>
                        </span>

                    </div>
                </div>
            }
        >
            <Head title="PAN to Aadhaar Unmasked Instant" />

            <div className="max-w-2xl mx-auto mt-6 sm:mt-8 space-y-6 pb-12">
                {/* Search Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-500/10 to-violet-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-5 mx-auto border border-indigo-100 dark:border-indigo-900/30">
                            <span className="material-symbols-outlined text-3xl">badge</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-center text-slate-800 dark:text-white mb-1.5 tracking-tight">
                            Find Unmasked Aadhaar
                        </h2>
                        <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm font-medium">
                            Enter the PAN number, Name, and Date of Birth to retrieve unmasked Aadhaar details.
                        </p>

                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                                    PAN Card Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">
                                        credit_card
                                    </span>
                                    <input
                                        type="text"
                                        maxLength="10"
                                        value={pan}
                                        onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                        placeholder="e.g. ABCDE1234F"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xl font-black tracking-[0.25em] text-slate-900 dark:text-white transition-all text-center uppercase"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                                    Full Name as on PAN <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">
                                        person
                                    </span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value.toUpperCase())}
                                        placeholder="Enter cardholder full name"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-base font-bold text-slate-900 dark:text-white transition-all uppercase"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                                    Date of Birth (DOB) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">
                                        calendar_today
                                    </span>
                                    <input
                                        type="text"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        placeholder="DD/MM/YYYY (e.g. 15/08/1990)"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-base font-bold tracking-wider text-slate-900 dark:text-white transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || pan.length !== 10 || !name.trim() || !dob.trim()}
                                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-base sm:text-lg rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4 active:scale-[0.99]"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Fetching Aadhaar Details...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold text-xl">manage_search</span>
                                        <span>Get Aadhaar ({displayCoinCost} Coins)</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-5 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">error</span>
                                <div className="flex-1">
                                    <p className="text-red-700 dark:text-red-300 font-bold text-sm">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sm:px-8">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live instant server lookup
                        </p>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800/40">
                            <span className="material-symbols-outlined text-[14px]">monetization_on</span>
                            {displayCoinCost} Coins
                        </div>
                    </div>
                </div>

                {/* Result Card */}
                {result && (
                    <div id="pan-to-aadhar-result-card" className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-300">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                                    <span className="material-symbols-outlined text-white text-2xl">verified</span>
                                </div>
                                <div>
                                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">
                                        Unmasked Aadhaar Number
                                    </p>
                                    <h3 className="text-2xl sm:text-3xl font-black tracking-widest font-mono text-white mt-0.5">
                                        {result.aadhar_number || result.aadhaar_number || 'Data Found'}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(result.aadhar_number || result.aadhaar_number, 'aadhar')}
                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all backdrop-blur-sm"
                                >
                                    <span className="material-symbols-outlined text-[16px]">{copiedField === 'aadhar' ? 'done' : 'content_copy'}</span>
                                    <span>{copiedField === 'aadhar' ? 'Copied' : 'Copy Aadhaar'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="p-4 sm:p-6 space-y-1">
                            <InfoRow
                                label="Unmasked Aadhaar Number"
                                value={result.aadhar_number || result.aadhaar_number}
                                icon="fingerprint"
                                copyable={true}
                                onCopy={(v) => copyToClipboard(v, 'aadhar')}
                                isCopied={copiedField === 'aadhar'}
                                badge="Verified"
                            />
                            <InfoRow
                                label="PAN Card Number"
                                value={result.pan || pan}
                                icon="badge"
                                copyable={true}
                                onCopy={(v) => copyToClipboard(v, 'pan')}
                                isCopied={copiedField === 'pan'}
                            />
                            <InfoRow
                                label="Full Name"
                                value={result.name}
                                icon="person"
                                copyable={true}
                                onCopy={(v) => copyToClipboard(v, 'name')}
                                isCopied={copiedField === 'name'}
                            />
                            <InfoRow
                                label="Father's Name"
                                value={result.father_name}
                                icon="family_restroom"
                                copyable={true}
                                onCopy={(v) => copyToClipboard(v, 'father_name')}
                                isCopied={copiedField === 'father_name'}
                            />
                            <InfoRow
                                label="Date of Birth (DOB)"
                                value={result.dob || dob}
                                icon="calendar_today"
                                copyable={true}
                                onCopy={(v) => copyToClipboard(v, 'dob')}
                                isCopied={copiedField === 'dob'}
                            />
                            <InfoRow
                                label="Gender"
                                value={result.gender}
                                icon="wc"
                            />
                            <InfoRow
                                label="Mobile Number"
                                value={result.mobile}
                                icon="smartphone"
                                copyable={true}
                                onCopy={(v) => copyToClipboard(v, 'mobile')}
                                isCopied={copiedField === 'mobile'}
                            />
                            <InfoRow
                                label="Email Address"
                                value={result.email}
                                icon="mail"
                                copyable={true}
                                onCopy={(v) => copyToClipboard(v, 'email')}
                                isCopied={copiedField === 'email'}
                            />
                            <InfoRow
                                label="Address"
                                value={result.address}
                                icon="home"
                                copyable={true}
                                onCopy={(v) => copyToClipboard(v, 'address')}
                                isCopied={copiedField === 'address'}
                            />
                            <InfoRow
                                label="City / State / Pincode"
                                value={[result.city, result.state, result.pincode].filter(Boolean).join(', ')}
                                icon="location_on"
                            />
                        </div>

                        {/* Actions Footer */}
                        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={copyAllDetails}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 shadow-xs"
                                >
                                    <span className="material-symbols-outlined text-[16px]">{copiedAll ? 'done' : 'copy_all'}</span>
                                    <span>{copiedAll ? 'Details Copied' : 'Copy All Info'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 shadow-xs"
                                >
                                    <span className="material-symbols-outlined text-[16px]">print</span>
                                    <span>Print Slip</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setResult(null);
                                    setPan('');
                                    setName('');
                                    setDob('');
                                }}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 transition-all flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">replay</span>
                                <span>Search Another PAN</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Admin API Settings Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                        <div className="p-5 bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-2xl">tune</span>
                                <h3 className="font-black text-lg">PAN to Aadhaar API Settings</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAdminModal(false)}
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveAdminSettings} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    API Endpoint URL
                                </label>
                                <input
                                    type="text"
                                    value={adminApiUrl}
                                    onChange={(e) => setAdminApiUrl(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                                    placeholder="https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_aadhar.php"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Default: https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_aadhar.php
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    API Key (Good-API-Point)
                                </label>
                                <input
                                    type="text"
                                    value={adminApiKey}
                                    onChange={(e) => setAdminApiKey(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                                    placeholder="Enter Good-API-Point API Key"
                                />
                            </div>

                            {settingMsg && (
                                <div className={`p-3 rounded-xl text-xs font-bold ${
                                    settingMsg.type === 'success'
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                                        : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300'
                               }`}>
                                    {settingMsg.text}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
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
