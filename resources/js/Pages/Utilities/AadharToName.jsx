import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharToName() {
    const { currentService, coinCost = 19, isAdmin = false, apiUrl: propApiUrl = '', apiKey: propApiKey = '' } = usePage().props;
    const [aadhar, setAadhar] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const displayCoinCost = currentService?.coin_cost ?? coinCost ?? 19;

    // Admin Quick Settings State
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_name.php');
    const [adminApiKey, setAdminApiKey] = useState(propApiKey || '');
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingMsg, setSettingMsg] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        const clean = aadhar.replace(/\D/g, '');
        if (clean.length !== 12) {
            setError('Please enter a valid 12-digit Aadhaar Number.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/aadhar-to-name/search', { aadhar: clean });
            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'Details not found for this Aadhaar number.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'An error occurred while fetching the details.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAdminSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingMsg(null);

        try {
            const res = await axios.post('/utilities/aadhar-to-name/update-api', {
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

    const formatAadhar = (val) => {
        const raw = val.replace(/\D/g, '').slice(0, 12);
        return raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">badge</span>
                            Aadhar To Name Search
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
                            Instantly retrieve Name & Mobile details using 12-digit Aadhaar Number
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            type="button"
                            onClick={() => setShowAdminModal(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm self-start sm:self-auto cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-base text-blue-600 dark:text-blue-400">tune</span>
                            API Config (Admin)
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Aadhar To Name" />

            {/* High-Contrast Visibility & Print Styles */}
            <style>{`
                .npci-input {
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                    border-color: #3b82f6 !important;
                    font-weight: 900 !important;
                    letter-spacing: 0.2em !important;
                }
                .dark .npci-input {
                    background-color: #1e293b !important;
                    color: #ffffff !important;
                    border-color: #60a5fa !important;
                }
                .npci-input::placeholder {
                    color: #94a3b8 !important;
                    opacity: 0.6;
                }
                .dark .npci-input::placeholder {
                    color: #94a3b8 !important;
                    opacity: 0.6;
                }
                .npci-label {
                    color: #0f172a !important;
                    font-weight: 900 !important;
                }
                .dark .npci-label {
                    color: #f8fafc !important;
                    font-weight: 900 !important;
                }
                .npci-subtext {
                    color: #475569 !important;
                    font-weight: 600 !important;
                }
                .dark .npci-subtext {
                    color: #cbd5e1 !important;
                    font-weight: 600 !important;
                }
                .npci-detail-title {
                    color: #0f172a !important;
                    font-weight: 900 !important;
                }
                .dark .npci-detail-title {
                    color: #ffffff !important;
                    font-weight: 900 !important;
                }
                .npci-detail-label {
                    color: #475569 !important;
                    font-weight: 800 !important;
                }
                .dark .npci-detail-label {
                    color: #94a3b8 !important;
                    font-weight: 800 !important;
                }
                .npci-detail-box {
                    background-color: #f8fafc !important;
                    border-color: #cbd5e1 !important;
                }
                .dark .npci-detail-box {
                    background-color: #1e293b !important;
                    border-color: #334155 !important;
                }
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #name-printable-slip, #name-printable-slip * {
                        visibility: visible;
                    }
                    #name-printable-slip {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: #fff !important;
                        color: #000 !important;
                        padding: 20px;
                        margin: 0;
                        box-shadow: none !important;
                        border: 2px solid #000 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="max-w-2xl mx-auto mt-6 px-4 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden no-print">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl mb-5 mx-auto border border-blue-200 dark:border-blue-900/50">
                            <span className="material-symbols-outlined text-3xl">badge</span>
                        </div>
                        <h2 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2 tracking-tight">
                            Find Name from Aadhaar
                        </h2>
                        <p className="text-center npci-subtext mb-6 text-sm">
                            Enter a 12-digit Aadhaar number to fetch the associated beneficiary name and mobile instantly.
                        </p>

                        <form onSubmit={handleSearch} className="space-y-5">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs uppercase tracking-wider npci-label">
                                        12-Digit Aadhaar Number
                                    </label>
                                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200">
                                        {aadhar.length}/12 Digits
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength="14"
                                        value={formatAadhar(aadhar)}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                                            setAadhar(val);
                                        }}
                                        placeholder="XXXX XXXX XXXX"
                                        className="npci-input w-full px-5 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/30 outline-none text-2xl font-black font-mono transition-all text-center shadow-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || aadhar.length !== 12}
                                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Searching Aadhaar Gateway...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold">search</span>
                                        <span>Find Details ({displayCoinCost} Coins)</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-2xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0 mt-0.5">error</span>
                                <div>
                                    <p className="text-sm font-black text-red-900 dark:text-red-200">Lookup Failed</p>
                                    <p className="text-xs text-red-700 dark:text-red-300 mt-0.5 font-bold">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sm:px-8">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live instant lookup
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 px-3.5 py-1.5 rounded-full border border-amber-300 dark:border-amber-700">
                            <span className="material-symbols-outlined text-[15px]">monetization_on</span>
                            {displayCoinCost} Coins
                        </div>
                    </div>
                </div>

                {/* Printable Result Slip */}
                {result && (
                    <div id="name-printable-slip" className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                                    🪪
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                        Aadhaar To Name Verification Report
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                        Ref No: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{result.application_no || 'UID_VERIFICATION'}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 no-print">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-base">print</span>
                                    Print Receipt
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setResult(null);
                                        setAadhar('');
                                    }}
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    New Search
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Beneficiary Name */}
                            <div className="npci-detail-box p-4 rounded-2xl border">
                                <span className="text-xs uppercase tracking-wide npci-detail-label">
                                    Beneficiary Name (English)
                                </span>
                                <p className="text-lg npci-detail-title mt-1">
                                    {result.name || 'Not Available'}
                                </p>
                            </div>

                            {/* Local Name */}
                            {result.localName ? (
                                <div className="npci-detail-box p-4 rounded-2xl border">
                                    <span className="text-xs uppercase tracking-wide npci-detail-label">
                                        Beneficiary Name (Local)
                                    </span>
                                    <p className="text-lg npci-detail-title mt-1">
                                        {result.localName}
                                    </p>
                                </div>
                            ) : (
                                <div className="npci-detail-box p-4 rounded-2xl border">
                                    <span className="text-xs uppercase tracking-wide npci-detail-label">
                                        Aadhaar Number
                                    </span>
                                    <p className="text-lg font-mono npci-detail-title mt-1">
                                        {result.uid || aadhar}
                                    </p>
                                </div>
                            )}

                            {/* Mobile Number */}
                            <div className="npci-detail-box p-4 rounded-2xl border">
                                <span className="text-xs uppercase tracking-wide npci-detail-label">
                                    Linked Mobile Number
                                </span>
                                <p className="text-lg font-mono npci-detail-title mt-1">
                                    {result.mobile || 'Not Available'}
                                </p>
                            </div>

                            {/* Transaction ID */}
                            <div className="npci-detail-box p-4 rounded-2xl border">
                                <span className="text-xs uppercase tracking-wide npci-detail-label">
                                    Transaction ID
                                </span>
                                <p className="text-sm font-mono npci-detail-title mt-1">
                                    {result.transaction_id || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2 font-medium">
                            <div>
                                Verified On: <span className="font-bold text-slate-900 dark:text-white">{result.checked_at || 'Just Now'}</span>
                            </div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                Verified via Aadhaar API
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Quick Configuration Modal */}
            {isAdmin && showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">settings</span>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                    Aadhar to Name API Settings
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAdminModal(false)}
                                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {settingMsg && (
                            <div className={`p-3 rounded-xl text-xs font-bold ${
                                settingMsg.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                                {settingMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleSaveAdminSettings} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
                                    Endpoint URL
                                </label>
                                <input
                                    type="text"
                                    value={adminApiUrl}
                                    onChange={(e) => setAdminApiUrl(e.target.value)}
                                    placeholder="https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_name.php"
                                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                                    required
                                />
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                    Query parameters <code>apiKey</code> and <code>uid</code> will be automatically passed.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
                                    Partner API Key
                                </label>
                                <input
                                    type="text"
                                    value={adminApiKey}
                                    onChange={(e) => setAdminApiKey(e.target.value)}
                                    placeholder="Enter your API Key..."
                                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="px-5 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                                >
                                    {savingSettings ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
