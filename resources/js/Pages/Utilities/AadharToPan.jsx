import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharToPan() {
    const { currentService, coinCost = 69, isAdmin = false, apiUrl: propApiUrl = '', apiKey: propApiKey = '' } = usePage().props;
    const { auth } = usePage().props;
    const [aadhar, setAadhar] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const displayCoinCost = currentService?.coin_cost ?? coinCost ?? 69;

    // Admin Quick Settings State
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhaar_to_unmasked_pan.php');
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

        if (!auth.user.is_admin && !isAdmin && auth.user.coins < displayCoinCost) {
            setError(`Insufficient coins. This service requires ${displayCoinCost} Coins. Please recharge your wallet.`);
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/aadhar-to-pan/search', { aadhar: clean });
            if (response.data.success) {
                setResult(response.data);
                if (!auth.user.is_admin && !isAdmin) {
                    auth.user.coins -= displayCoinCost;
                }
            } else {
                setError(response.data.message || 'PAN details not found for this Aadhaar number.');
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
            const res = await axios.post('/utilities/aadhar-to-pan/update-api', {
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

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-blue-500 text-3xl">credit_card</span>
                            Aadhar To Unmasked PAN Search
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
                            Find linked original Unmasked PAN card number using 12-digit Aadhaar Number
                        </p>
                    </div>

                </div>
            }
        >
            <Head title="Aadhar To Pan Unmasked" />

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #unmask-pan-printable-slip, #unmask-pan-printable-slip * {
                        visibility: visible;
                    }
                    #unmask-pan-printable-slip {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }
                }
            `}</style>

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Search Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <span className="material-symbols-outlined text-2xl">search_check</span>
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                                        Enter Aadhaar Number
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Instant Good-API-Point Partner Integration
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-black">
                                <span className="material-symbols-outlined text-sm">toll</span>
                                <span>{displayCoinCost} Coins / Search</span>
                            </div>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                    12-Digit Aadhaar Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength="14"
                                        value={formatAadhar(aadhar)}
                                        onChange={(e) => setAadhar(e.target.value)}
                                        placeholder="0000 0000 0000"
                                        className="w-full pl-12 pr-4 py-4 text-xl sm:text-2xl font-mono font-bold tracking-widest text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-inner"
                                        required
                                        autoFocus
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <span className="material-symbols-outlined text-2xl">credit_card</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm text-blue-500">info</span>
                                    Only 12-digit numeric Aadhaar is required.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || aadhar.replace(/\D/g, '').length !== 12}
                                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Fetching Unmasked PAN... (may take 10-20s)</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl">search</span>
                                        <span>Find Unmasked PAN ({displayCoinCost} Coins)</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0 text-xl">warning</span>
                                <div>
                                    <h4 className="text-xs font-bold text-red-900 dark:text-red-200 uppercase tracking-wide">Lookup Failed</h4>
                                    <p className="text-xs text-red-700 dark:text-red-300 font-medium mt-0.5">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Result Section */}
                {result && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/30 dark:border-emerald-500/30 shadow-xl overflow-hidden animate-in fade-in duration-300">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                                    <span className="material-symbols-outlined text-white text-2xl">verified</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-black">Unmasked PAN Found Successfully</h3>
                                    <p className="text-xs text-emerald-100">{result.message || 'Linked PAN retrieved from database'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="px-3.5 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">print</span>
                                    <span>Print Slip</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 space-y-6">
                            {/* Main Unmasked PAN Display */}
                            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border-2 border-dashed border-emerald-300 dark:border-emerald-800 text-center relative">
                                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                                    Original Unmasked PAN Number
                                </span>
                                <div className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-slate-900 dark:text-white my-3 select-all">
                                    {result.pan || result.pan_number}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(result.pan || result.pan_number)}
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow transition cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {copied ? 'check' : 'content_copy'}
                                    </span>
                                    <span>{copied ? 'Copied!' : 'Copy PAN'}</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Verified Aadhaar Number
                                    </span>
                                    <span className="text-sm font-mono font-black text-slate-800 dark:text-slate-100">
                                        {formatAadhar(aadhar)}
                                    </span>
                                </div>

                                {result.mask_pan && (
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                            Masked PAN
                                        </span>
                                        <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100">
                                            {result.mask_pan}
                                        </span>
                                    </div>
                                )}

                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Verification Time
                                    </span>
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                        {result.checked_at || 'Just now'}
                                    </span>
                                </div>

                                {result.application_no && (
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                            Application / Tracking No
                                        </span>
                                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                                            {result.application_no}
                                        </span>
                                    </div>
                                )}

                                {result.transaction_id && (
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                            Transaction ID
                                        </span>
                                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                                            {result.transaction_id}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Printable Slip (A4 / Thermal Friendly) */}
                {result && (
                    <div id="unmask-pan-printable-slip" className="hidden">
                        <div style={{ maxWidth: '650px', margin: '0 auto', border: '2px solid #000', padding: '24px', fontFamily: 'sans-serif' }}>
                            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
                                <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase' }}>
                                    Aadhaar to Unmasked PAN Verification Slip
                                </h2>
                                <p style={{ margin: '0', fontSize: '11px', color: '#555' }}>
                                    Online Verification Receipt • Citizen Copy
                                </p>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '16px' }}>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '8px 4px', fontWeight: 'bold', width: '40%' }}>Aadhaar Number:</td>
                                        <td style={{ padding: '8px 4px', fontFamily: 'monospace', fontWeight: 'bold' }}>{formatAadhar(aadhar)}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #ddd', background: '#f9f9f9' }}>
                                        <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>Unmasked PAN Number:</td>
                                        <td style={{ padding: '8px 4px', fontFamily: 'monospace', fontSize: '18px', fontWeight: '900', color: '#000' }}>
                                            {result.pan || result.pan_number}
                                        </td>
                                    </tr>
                                    {result.mask_pan && (
                                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                                            <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>Masked PAN:</td>
                                            <td style={{ padding: '8px 4px', fontFamily: 'monospace' }}>{result.mask_pan}</td>
                                        </tr>
                                    )}
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>Date & Time:</td>
                                        <td style={{ padding: '8px 4px' }}>{result.checked_at || new Date().toLocaleString()}</td>
                                    </tr>
                                    {result.application_no && (
                                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                                            <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>Tracking / App No:</td>
                                            <td style={{ padding: '8px 4px', fontFamily: 'monospace' }}>{result.application_no}</td>
                                        </tr>
                                    )}
                                    {result.transaction_id && (
                                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                                            <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>Transaction ID:</td>
                                            <td style={{ padding: '8px 4px', fontFamily: 'monospace' }}>{result.transaction_id}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div style={{ borderTop: '1px solid #000', paddingTop: '10px', fontSize: '10px', color: '#666', textAlign: 'center' }}>
                                This receipt confirms the online linked PAN search. Computer generated verification slip.
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Admin API Quick Settings Modal */}
            {isAdmin && showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-blue-500">tune</span>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                    Aadhar to Unmasked PAN API Settings
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
                                    placeholder="https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhaar_to_unmasked_pan.php"
                                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                                    required
                                />
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                    Query parameters <code>apiKey</code> and <code>uidNumber</code> will be automatically passed.
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
