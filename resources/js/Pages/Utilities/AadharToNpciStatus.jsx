import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharToNpciStatus() {
    const { currentService, coinCost = 14, isAdmin = false, apiUrl: propApiUrl = '', apiKey: propApiKey = '' } = usePage().props;
    const [aadhar, setAadhar] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const displayCoinCost = currentService?.coin_cost ?? coinCost ?? 14;

    // Admin Quick Settings State
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/bank_info_api/aadhar_to_npci.php');
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
            const response = await axios.post('/utilities/aadhar-to-npci-status/search', {
                aadhar: clean,
            });

            if (response.data.success) {
                setResult(response.data.data);
            } else {
                setError(response.data.message || 'Details not found for this Aadhaar Number.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'An error occurred while connecting to the NPCI server.';
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
            const res = await axios.post('/utilities/aadhar-to-npci-status/update-api', {
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

    const isStatusActive = result?.account_status?.toUpperCase() === 'A' || result?.account_status?.toUpperCase() === 'ACTIVE';

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">account_balance</span>
                            Aadhar To Check Ncpi Status
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
                            Real-time NPCI & DBT Bank Account Seeding Verification
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
            <Head title="Aadhar To Check Ncpi Status - NPCI Bank Linking" />

            {/* High-Contrast Visibility Styles */}
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
                    #npci-printable-slip, #npci-printable-slip * {
                        visibility: visible;
                    }
                    #npci-printable-slip {
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

            <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">

                {/* Search Form Box */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden no-print">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl mb-5 mx-auto border border-blue-200 dark:border-blue-900/50">
                            <span className="material-symbols-outlined text-3xl">account_balance</span>
                        </div>

                        <h2 className="text-2xl font-black text-center text-slate-900 dark:text-white tracking-tight mb-2">
                            Check Aadhaar NPCI / DBT Seeding Status
                        </h2>
                        <p className="text-center npci-subtext text-sm max-w-md mx-auto mb-6">
                            Enter the 12-digit Aadhaar Number to verify linked Bank Name, Account Status, Mobile & PAN details in real-time.
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
                                            const clean = e.target.value.replace(/\D/g, '').slice(0, 12);
                                            setAadhar(clean);
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
                                        <span>Connecting NPCI Gateway...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold">search</span>
                                        <span>Check NPCI Status ({displayCoinCost} Coins)</span>
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
                            Live NPCI Bank Seeding API
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 px-3.5 py-1.5 rounded-full border border-amber-300 dark:border-amber-700">
                            <span className="material-symbols-outlined text-[15px]">monetization_on</span>
                            {displayCoinCost} Coins per check
                        </div>
                    </div>
                </div>

                {/* Result Section */}
                {result && (
                    <div id="npci-printable-slip" className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Printable Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                                    🏛️
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                        Aadhaar - NPCI Bank Linking Report
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                        Ref No: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{result.application_no || 'NPCI_REF'}</span>
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
                                    New Check
                                </button>
                            </div>
                        </div>

                        {/* Status Highlight Banner */}
                        <div className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isStatusActive
                                ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700'
                                : 'bg-red-50/90 dark:bg-red-950/50 border-red-400 dark:border-red-700'
                        }`}>
                            <div>
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    Linked Bank
                                </span>
                                <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                                    <span>🏦</span>
                                    <span>{result.bank_name || 'Not Available'}</span>
                                </h4>
                            </div>

                            <div className="flex flex-col sm:items-end">
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                                    Aadhaar Seeding Status
                                </span>
                                <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                    isStatusActive
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-red-600 text-white shadow-sm'
                                }`}>
                                    <span className="material-symbols-outlined text-base">
                                        {isStatusActive ? 'check_circle' : 'cancel'}
                                    </span>
                                    {isStatusActive ? 'ACTIVE (A)' : `INACTIVE (${result.account_status})`}
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Beneficiary Name */}
                            <div className="npci-detail-box p-4 rounded-2xl border">
                                <span className="text-xs uppercase tracking-wide npci-detail-label">
                                    Beneficiary Name
                                </span>
                                <p className="text-lg npci-detail-title mt-1">
                                    {result.name || 'N/A'}
                                </p>
                                {result.local_name && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-bold">
                                        ({result.local_name})
                                    </p>
                                )}
                            </div>

                            {/* Aadhaar Number */}
                            <div className="npci-detail-box p-4 rounded-2xl border">
                                <span className="text-xs uppercase tracking-wide npci-detail-label">
                                    Aadhaar Number
                                </span>
                                <p className="text-lg font-mono npci-detail-title mt-1">
                                    {result.uid || aadhar}
                                </p>
                            </div>

                            {/* Linked Mobile */}
                            <div className="npci-detail-box p-4 rounded-2xl border">
                                <span className="text-xs uppercase tracking-wide npci-detail-label">
                                    Registered Mobile
                                </span>
                                <p className="text-lg font-mono npci-detail-title mt-1">
                                    {result.mobile || 'N/A'}
                                </p>
                            </div>

                            {/* Linked PAN */}
                            <div className="npci-detail-box p-4 rounded-2xl border">
                                <span className="text-xs uppercase tracking-wide npci-detail-label">
                                    Linked PAN Card
                                </span>
                                <p className="text-lg font-mono npci-detail-title mt-1">
                                    {result.pan || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Footer Meta */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2 font-medium">
                            <div>
                                Verified On: <span className="font-bold text-slate-900 dark:text-white">{result.checked_at}</span>
                            </div>
                            {result.transaction_id && (
                                <div>
                                    Txn ID: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{result.transaction_id}</span>
                                </div>
                            )}
                        </div>

                        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs text-blue-900 dark:text-blue-200 font-semibold">
                            ℹ️ Note: NPCI / Aadhaar Seeding is mandatory for receiving Direct Benefit Transfer (DBT), Govt Subsidies, PM-Kisan and scholarship credits into this bank account.
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
                                    Aadhar to NPCI API Settings
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
                                    placeholder="https://good-api-point.com/apis_partner/v1/bank_info_api/aadhar_to_npci.php"
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
