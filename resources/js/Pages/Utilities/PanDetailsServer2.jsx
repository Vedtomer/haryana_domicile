import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

const InfoRow = ({ label, value, icon, copyable, onCopy, isCopied, badge }) => {
    if (!value || value === 'N/A' || value === '') return null;
    return (
        <div className="flex items-center justify-between py-3.5 px-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-colors">
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center border border-cyan-100 dark:border-cyan-900/40">
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
                    className="flex-shrink-0 ml-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/50 dark:hover:bg-cyan-900/50 text-cyan-600 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60 transition-all flex items-center gap-1.5"
                    title="Copy to clipboard"
                >
                    <span className="material-symbols-outlined text-[15px]">{isCopied ? 'done' : 'content_copy'}</span>
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
            )}
        </div>
    );
};

export default function PanDetailsServer2() {
    const { service, coinCost = 19, isAdmin = false, apiUrl: propApiUrl = '', apiKey: propApiKey = '', currentService, auth } = usePage().props;

    const [pan, setPan] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedField, setCopiedField] = useState(null);
    const [copiedAll, setCopiedAll] = useState(false);

    const displayCoinCost = service?.coin_cost ?? currentService?.coin_cost ?? coinCost ?? 19;

    // Admin API Settings State
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_server2.php');
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

        const isUserAdmin = auth?.user?.is_admin || isAdmin;
        if (!isUserAdmin && (auth?.user?.coins ?? 0) < displayCoinCost) {
            setError(`Insufficient coins. This service requires ${displayCoinCost} Coins. Please recharge your wallet.`);
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/pan-details-server-2/search', {
                pan: cleanPan,
            });

            if (response.data.success) {
                setResult(response.data.data);
                if (!isUserAdmin && auth?.user) {
                    auth.user.coins -= displayCoinCost;
                }
            } else {
                setError(response.data.message || 'PAN verification record not found.');
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
        const text = `--- PAN CARD VERIFICATION DETAILS (SERVER 2) ---
PAN Number: ${result.pan || 'N/A'}
Cardholder Name: ${result.name || 'N/A'}
Father's Name: ${result.father_name || 'N/A'}
Date of Birth: ${result.dob || 'N/A'}
Gender: ${result.gender || 'N/A'}
PAN Type: ${result.pan_type || 'INDIVIDUAL'}
Aadhaar Linked: ${result.aadhaar_linked || 'N/A'}
Status: ${result.status || 'Active / Valid'}
Address: ${result.address || 'N/A'}
Verified via Good-API-Point Server 2`;
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
            const res = await axios.post('/utilities/pan-details-server-2/update-api', {
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
                                <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-2xl sm:text-3xl">badge</span>
                                <span>Pan Details Server 2</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                Instant PAN Card Verification & Cardholder Full Details &bull; Server 2
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-cyan-100 dark:bg-cyan-900/40 text-cyan-900 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-xs">
                            <span>🪙</span>
                            <span>{displayCoinCost} Coins / Search</span>
                        </span>

                        {(isAdmin || auth?.user?.is_admin || auth?.user?.type === 'super_admin' || auth?.user?.type === 'admin') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAdminModal(true);
                                    setSettingMsg(null);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 shadow-xs transition-colors"
                                title="Admin API Settings"
                            >
                                <span className="material-symbols-outlined text-[15px]">settings</span>
                                <span className="hidden sm:inline">API Config</span>
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Pan Details Server 2" />

            <div className="max-w-2xl mx-auto mt-6 sm:mt-8 space-y-6 pb-12">
                {/* Search Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-cyan-500/10 to-blue-500/20 text-cyan-600 dark:text-cyan-400 rounded-2xl mb-5 mx-auto border border-cyan-100 dark:border-cyan-900/30">
                            <span className="material-symbols-outlined text-3xl">credit_card</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-center text-slate-800 dark:text-white mb-1.5 tracking-tight">
                            Verify PAN Details (Server 2)
                        </h2>
                        <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm font-medium">
                            Enter the 10-character Permanent Account Number to verify instant details.
                        </p>

                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                                    PAN Card Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">
                                        badge
                                    </span>
                                    <input
                                        type="text"
                                        maxLength="10"
                                        value={pan}
                                        onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                        placeholder="e.g. ABCDE1234F"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none text-xl font-black tracking-[0.25em] text-slate-900 dark:text-white transition-all text-center uppercase"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || pan.length !== 10}
                                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-black text-base sm:text-lg rounded-xl shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4 active:scale-[0.99]"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Fetching PAN Details...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold text-xl">manage_search</span>
                                        <span>Get PAN Details ({displayCoinCost} Coins)</span>
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
                            Live Server 2 verification
                        </p>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-200/60 dark:border-cyan-800/40">
                            <span className="material-symbols-outlined text-[14px]">monetization_on</span>
                            {displayCoinCost} Coins
                        </div>
                    </div>
                </div>

                {/* Result Card */}
                {result && (
                    <div id="pan-result-card" className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-300">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                                    <span className="material-symbols-outlined text-white text-2xl">verified</span>
                                </div>
                                <div>
                                    <p className="text-cyan-150 text-xs font-bold uppercase tracking-wider text-cyan-200">
                                        PAN Verified &bull; Server 2
                                    </p>
                                    <h3 className="text-2xl sm:text-3xl font-black tracking-widest font-mono text-white mt-0.5">
                                        {result.pan || pan}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(result.pan || pan, 'pan')}
                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all backdrop-blur-sm"
                                >
                                    <span className="material-symbols-outlined text-[16px]">{copiedField === 'pan' ? 'done' : 'content_copy'}</span>
                                    <span>{copiedField === 'pan' ? 'Copied' : 'Copy PAN'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="p-4 sm:p-6 space-y-1">
                            <InfoRow
                                label="Permanent Account Number (PAN)"
                                value={result.pan || pan}
                                icon="badge"
                                copyable={true}
                                onCopy={(v) => copyToClipboard(v, 'pan')}
                                isCopied={copiedField === 'pan'}
                            />
                            <InfoRow
                                label="Cardholder Full Name"
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
                                value={result.dob}
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
                                label="Aadhaar Linked Status"
                                value={result.aadhaar_linked}
                                icon="link"
                                badge={result.aadhaar_linked ? 'Linked' : null}
                            />
                            <InfoRow
                                label="PAN Card Type / Category"
                                value={result.pan_type || result.category}
                                icon="category"
                            />
                            <InfoRow
                                label="Status"
                                value={result.status}
                                icon="verified"
                            />
                            <InfoRow
                                label="Mobile Number"
                                value={result.mobile}
                                icon="smartphone"
                            />
                            <InfoRow
                                label="Email Address"
                                value={result.email}
                                icon="mail"
                            />
                            <InfoRow
                                label="Registered Address"
                                value={result.address}
                                icon="home"
                            />
                            <InfoRow
                                label="City / State / PIN"
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
                                }}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 transition-all flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">replay</span>
                                <span>Verify Another PAN</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Admin API Settings Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                        <div className="p-5 bg-gradient-to-r from-cyan-700 via-blue-700 to-indigo-700 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-2xl">tune</span>
                                <h3 className="font-black text-lg">PAN Details Server 2 API Settings</h3>
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
                                    placeholder="https://good-api-point.com/apis_partner/v1/pan_card_api/pan_server2.php"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Default: https://good-api-point.com/apis_partner/v1/pan_card_api/pan_server2.php
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
                                    className="px-5 py-2 text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50"
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
