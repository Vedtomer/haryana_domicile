import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharToPppId({ coinCost = 0, service, isAdmin = false, apiUrl: initialApiUrl, apiKey: initialApiKey }) {
    const { auth } = usePage().props;
    const [aadhar, setAadhar] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    // Admin API Settings State
    const [showApiSettings, setShowApiSettings] = useState(false);
    const [apiUrlInput, setApiUrlInput] = useState(initialApiUrl || 'https://fasal.haryana.gov.in/Home/GetFDbyAadhar?aadharnum={aadhar}');
    const [apiKeyInput, setApiKeyInput] = useState(initialApiKey || '');
    const [savingApi, setSavingApi] = useState(false);
    const [apiSuccessMsg, setApiSuccessMsg] = useState(null);
    const [apiErrorMsg, setApiErrorMsg] = useState(null);

    const handleSaveApi = async (e) => {
        e?.preventDefault();
        setSavingApi(true);
        setApiSuccessMsg(null);
        setApiErrorMsg(null);

        try {
            const res = await axios.post('/utilities/aadhar-to-ppp-id/update-api', {
                api_url: apiUrlInput,
                api_key: apiKeyInput,
            });

            if (res.data.success) {
                setApiSuccessMsg('✅ Aadhar to PPP ID API settings successfully update ho gayi hain!');
                setTimeout(() => setApiSuccessMsg(null), 4000);
            } else {
                setApiErrorMsg(res.data.message || 'API settings update karne me error aaya.');
            }
        } catch (err) {
            setApiErrorMsg(err.response?.data?.message || 'API save karne me error aaya.');
        } finally {
            setSavingApi(false);
        }
    };

    const handleResetApi = () => {
        setApiUrlInput('https://fasal.haryana.gov.in/Home/GetFDbyAadhar?aadharnum={aadhar}');
        setApiKeyInput('');
    };

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const cleanAadhar = aadhar.replace(/\D/g, '');
        if (cleanAadhar.length !== 12) {
            setError('Please enter a valid 12-digit Aadhaar Number.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/aadhar-to-ppp-id/search', {
                aadhar: cleanAadhar
            });

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'Family ID (PPP ID) not found for this Aadhaar Number.');
            }
        } catch (err) {
            console.error('Error fetching details:', err);
            setError(err.response?.data?.message || 'An error occurred while fetching the details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">badge</span>
                            Aadhar Card to PPP ID Instant
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 font-medium">
                            Instantly retrieve Haryana Family ID (Parivar Pehchan Patra) using 12-digit Aadhaar Number without OTP
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setShowApiSettings(!showApiSettings)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer shadow-xs"
                            >
                                <span className="material-symbols-outlined text-[17px]">tune</span>
                                <span>API Settings</span>
                            </button>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700 shadow-xs">
                            <span>🪙</span>
                            <span>{coinCost > 0 ? `${coinCost} Coins Per Lookup` : 'Free Service'}</span>
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Aadhar Card to PPP ID Instant - Haryana Family ID Search" />

            <div className="max-w-2xl mx-auto mt-6 px-4 pb-20">

                {/* Admin API Configuration Panel */}
                {isAdmin && showApiSettings && (
                    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-800/50 mb-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                                    <span className="material-symbols-outlined text-2xl">settings_ethernet</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-black tracking-tight text-white">PPP ID Lookup - API Configuration</h3>
                                    <p className="text-xs text-indigo-200/70">Configure Haryana Fasal portal or custom third-party PPP gateway</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowApiSettings(false)}
                                className="text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        {apiSuccessMsg && (
                            <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                <span>{apiSuccessMsg}</span>
                            </div>
                        )}
                        {apiErrorMsg && (
                            <div className="p-3.5 bg-red-500/20 border border-red-500/40 text-red-300 rounded-2xl text-xs font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                <span>{apiErrorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveApi} className="space-y-4 pt-1">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1.5">
                                        API URL / Endpoint
                                    </label>
                                    <input
                                        type="text"
                                        value={apiUrlInput}
                                        onChange={(e) => setApiUrlInput(e.target.value)}
                                        placeholder="https://fasal.haryana.gov.in/Home/GetFDbyAadhar?aadharnum={aadhar}"
                                        className="w-full font-mono text-xs px-3.5 py-2.5 bg-slate-950/80 border border-indigo-700/60 rounded-xl text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                                    />
                                    <p className="text-[11px] text-indigo-300/60 mt-1">
                                        Default: <code>https://fasal.haryana.gov.in/Home/GetFDbyAadhar?aadharnum={'{aadhar}'}</code> (Live Fasal session integrated)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1.5">
                                        API Key (Optional for Custom Vendor)
                                    </label>
                                    <input
                                        type="text"
                                        value={apiKeyInput}
                                        onChange={(e) => setApiKeyInput(e.target.value)}
                                        placeholder="Enter optional vendor API key if using paid API..."
                                        className="w-full font-mono text-xs px-3.5 py-2.5 bg-slate-950/80 border border-indigo-700/60 rounded-xl text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                                    />
                                    <p className="text-[11px] text-indigo-300/60 mt-1">
                                        Haryana Fasal direct portal ke liye key ki zaroorat nahi hai (leave blank).
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-indigo-900/60">
                                <button
                                    type="button"
                                    onClick={handleResetApi}
                                    className="text-xs text-indigo-300 hover:text-white underline cursor-pointer self-start sm:self-auto"
                                >
                                    Reset to Fasal Portal Default
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingApi}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {savingApi ? (
                                        <>
                                            <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                                            <span>Saving Settings...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-base">save</span>
                                            <span>Save API Settings</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-8 sm:p-10">
                        <div className="flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-6 mx-auto shadow-inner">
                            <span className="material-symbols-outlined text-3xl">badge</span>
                        </div>
                        <h2 className="text-2xl font-black text-center text-slate-800 dark:text-white mb-2 tracking-tight">
                            Find PPP ID (Family ID)
                        </h2>
                        <p className="text-center text-slate-500 dark:text-slate-400 mb-8 font-medium text-sm">
                            Enter the 12-digit Aadhaar number to fetch the associated Family ID instantly without OTP.
                        </p>

                        <form onSubmit={handleSearch} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide text-center">
                                    Aadhaar Card Number
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength="14"
                                        value={aadhar}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                                            const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
                                            setAadhar(formatted);
                                        }}
                                        placeholder="1234 5678 9012"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-2xl tracking-widest font-black transition-all text-center dark:text-white placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 font-mono"
                                        autoFocus
                                    />
                                    {aadhar.replace(/\D/g, '').length === 12 && (
                                        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-emerald-500">
                                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-400 mt-2 px-1">
                                    <span>Standard 12-digit UID</span>
                                    <span className={aadhar.replace(/\D/g, '').length === 12 ? 'text-emerald-600 font-bold' : ''}>
                                        {aadhar.replace(/\D/g, '').length}/12 Digits
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || aadhar.replace(/\D/g, '').length !== 12}
                                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Searching Haryana PPP Portal...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold text-xl">search</span>
                                        <span>Find Family ID</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">error</span>
                                <p className="text-red-700 dark:text-red-300 font-medium text-sm">{error}</p>
                            </div>
                        )}

                        {result && (
                            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800/50 rounded-3xl text-center transform animate-in fade-in zoom-in duration-300">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-black uppercase tracking-widest rounded-full mb-3">
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    <span>PPP ID Found</span>
                                </div>

                                {result.member_name && (
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                                        Member: <span className="text-slate-900 dark:text-white font-extrabold">{result.member_name}</span>
                                    </p>
                                )}

                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Family ID (PPP ID)</p>
                                
                                <div className="text-3xl sm:text-4xl font-black text-green-700 dark:text-green-400 tracking-wider select-all font-mono py-2">
                                    {result.family_id}
                                </div>

                                <div className="mt-4 flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(result.family_id)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-base">
                                            {copied ? 'check' : 'content_copy'}
                                        </span>
                                        <span>{copied ? 'Copied!' : 'Copy PPP ID'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-t border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                            Live instant lookup connected with fasal.haryana.gov.in / home/login
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
