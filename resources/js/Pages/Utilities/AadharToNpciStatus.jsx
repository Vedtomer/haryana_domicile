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
                        <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">account_balance</span>
                            Aadhar To Check Ncpi Status
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
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

            {/* Print Styles */}
            <style>{`
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

                        <h2 className="text-2xl font-black text-center text-slate-800 dark:text-white tracking-tight mb-2">
                            Check Aadhaar NPCI / DBT Seeding Status
                        </h2>
                        <p className="text-center text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
                            Enter the 12-digit Aadhaar Number to verify linked Bank Name, Account Status, Mobile & PAN details in real-time.
                        </p>

                        <form onSubmit={handleSearch} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                    12-Digit Aadhaar Number
                                </label>
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
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xl tracking-widest font-black transition-all text-center text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                        {aadhar.length}/12
                                    </span>
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
                                        <span>Check NPCI Status ({currentService?.coin_cost ?? coinCost} Coins)</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0 mt-0.5">error</span>
                                <div>
                                    <p className="text-sm font-bold text-red-800 dark:text-red-300">Lookup Failed</p>
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 font-medium">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sm:px-8">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live NPCI Bank Seeding API
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
                            <span className="material-symbols-outlined text-[15px]">monetization_on</span>
                            {currentService?.coin_cost ?? coinCost} Coins per check
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
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                        Aadhaar - NPCI Bank Linking Report
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Ref No: <span className="font-mono font-bold">{result.application_no || 'NPCI_REF'}</span>
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
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    New Check
                                </button>
                            </div>
                        </div>

                        {/* Status Highlight Banner */}
                        <div className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isStatusActive
                                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                                : 'bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-800'
                        }`}>
                            <div>
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Linked Bank
                                </span>
                                <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                                    <span>🏦</span>
                                    <span>{result.bank_name || 'Not Available'}</span>
                                </h4>
                            </div>

                            <div className="flex flex-col sm:items-end">
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Aadhaar Seeding Status
                                </span>
                                <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                    isStatusActive
                                        ? 'bg-emerald-500 text-white shadow-sm'
                                        : 'bg-red-500 text-white shadow-sm'
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
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Beneficiary Name
                                </span>
                                <p className="text-lg font-black text-slate-800 dark:text-white mt-1">
                                    {result.name || 'N/A'}
                                </p>
                                {result.local_name && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                        ({result.local_name})
                                    </p>
                                )}
                            </div>

                            {/* Aadhaar Number */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Aadhaar Number
                                </span>
                                <p className="text-lg font-black font-mono text-slate-800 dark:text-white mt-1">
                                    {result.uid || aadhar}
                                </p>
                            </div>

                            {/* Linked Mobile */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Registered Mobile
                                </span>
                                <p className="text-lg font-black font-mono text-slate-800 dark:text-white mt-1">
                                    {result.mobile || 'N/A'}
                                </p>
                            </div>

                            {/* Linked PAN */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Linked PAN Card
                                </span>
                                <p className="text-lg font-black font-mono text-slate-800 dark:text-white mt-1">
                                    {result.pan || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Footer Meta */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                            <div>
                                Verified On: <span className="font-semibold text-slate-700 dark:text-slate-300">{result.checked_at}</span>
                            </div>
                            {result.transaction_id && (
                                <div>
                                    Txn ID: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{result.transaction_id}</span>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 rounded-xl text-[11px] text-blue-700 dark:text-blue-300">
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
                                <h3 className="text-lg font-black text-slate-800 dark:text-white">
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
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Endpoint URL
                                </label>
                                <input
                                    type="text"
                                    value={adminApiUrl}
                                    onChange={(e) => setAdminApiUrl(e.target.value)}
                                    placeholder="https://good-api-point.com/apis_partner/v1/bank_info_api/aadhar_to_npci.php"
                                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Query parameters <code>apiKey</code> and <code>uid</code> will be automatically passed.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Partner API Key
                                </label>
                                <input
                                    type="text"
                                    value={adminApiKey}
                                    onChange={(e) => setAdminApiKey(e.target.value)}
                                    placeholder="Enter your API Key..."
                                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
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
