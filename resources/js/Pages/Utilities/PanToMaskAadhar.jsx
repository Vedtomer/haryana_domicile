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
                    className="flex-shrink-0 ml-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/50 dark:hover:bg-cyan-900/50 text-cyan-600 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Copy to clipboard"
                >
                    <span className="material-symbols-outlined text-[15px]">{isCopied ? 'done' : 'content_copy'}</span>
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
            )}
        </div>
    );
};

export default function PanToMaskAadhar() {
    const { service, coinCost = 29, isAdmin = false, apiUrl: propApiUrl = '', apiKey: propApiKey = '', currentService, auth } = usePage().props;

    const [pan, setPan] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedField, setCopiedField] = useState(null);
    const [copiedAll, setCopiedAll] = useState(false);

    const displayCoinCost = service?.coin_cost ?? currentService?.coin_cost ?? coinCost ?? 29;

    // Admin API Settings State
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_mask_uid.php');
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
            const response = await axios.post('/utilities/pan-to-mask-aadhar/search', {
                pan: cleanPan,
            });

            if (response.data.success) {
                setResult(response.data);
                if (!isUserAdmin && auth?.user) {
                    auth.user.coins -= displayCoinCost;
                }
            } else {
                setError(response.data.message || 'Masked Aadhaar not found for this PAN card.');
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
        const resData = result.data || {};
        const text = `--- PAN TO MASK AADHAAR VERIFICATION DETAILS ---
PAN Number: ${result.pan || pan}
Linked Masked Aadhaar: ${result.masked_aadhaar || resData.masked_aadhaar || 'N/A'}
Cardholder Name: ${resData.name || 'N/A'}
Father Name: ${resData.father_name || 'N/A'}
Date of Birth: ${resData.dob || 'N/A'}
Gender: ${resData.gender || 'N/A'}
Link Status: ${resData.aadhaar_linked || 'Linked'}
Checked At: ${result.checked_at || new Date().toLocaleString()}
Portal: cspjaankari.in`;

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
            const res = await axios.post('/utilities/pan-to-mask-aadhar/update-api', {
                api_url: adminApiUrl,
                api_key: adminApiKey,
            });

            if (res.data.success) {
                setSettingMsg({ type: 'success', text: res.data.message });
                setTimeout(() => setShowAdminModal(false), 1500);
            } else {
                setSettingMsg({ type: 'error', text: res.data.message || 'Failed to save settings.' });
            }
        } catch (err) {
            setSettingMsg({ type: 'error', text: 'Error saving settings.' });
        } finally {
            setSavingSettings(false);
        }
    };

    const resData = result?.data || {};

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <span className="material-symbols-outlined text-2xl">fingerprint</span>
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                <span>PAN To Mask Aadhaar</span>
                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-800">
                                    Instant Live
                                </span>
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Find linked masked Aadhaar card number using 10-character PAN Card number &bull; Good-API-Point
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setShowAdminModal(true)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[17px] text-cyan-500">tune</span>
                                <span>API Config</span>
                            </button>
                        )}
                        <Link
                            href="/dashboard"
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all flex items-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
                            <span>Back</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="PAN To Mask Aadhaar Instant" />

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #mask-uid-printable-slip, #mask-uid-printable-slip * {
                        visibility: visible;
                    }
                    #mask-uid-printable-slip {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        padding: 30px;
                        font-family: Arial, sans-serif;
                    }
                }
            `}</style>

            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                {/* Search Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xl border border-cyan-500/20">
                                    <span className="material-symbols-outlined text-2xl">credit_card</span>
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                        Enter 10-Digit PAN Card Number
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Format: 5 Alphabets + 4 Digits + 1 Alphabet (e.g. ABCDE1234F)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-black shadow-xs">
                                <span className="material-symbols-outlined text-sm">toll</span>
                                <span>{displayCoinCost} Coins / Search</span>
                            </div>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                    PAN Card Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength="10"
                                        value={pan}
                                        onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                        placeholder="ABCDE1234F"
                                        className="w-full pl-12 pr-4 py-4 text-xl sm:text-2xl font-mono font-bold tracking-widest text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-cyan-500 dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-inner uppercase"
                                        required
                                        autoFocus
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <span className="material-symbols-outlined text-2xl">badge</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm text-cyan-500">info</span>
                                    Instant retrieval from Good-API-Point gateway. No OTP required.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || pan.length !== 10}
                                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-cyan-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Searching Masked Aadhaar...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl">search</span>
                                        <span>Find Masked Aadhaar ({displayCoinCost} Coins)</span>
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

                {/* Result Card */}
                {result && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/30 dark:border-emerald-500/30 shadow-xl overflow-hidden animate-in fade-in duration-300">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                                    <span className="material-symbols-outlined text-white text-2xl">verified</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-black">Masked Aadhaar Found Successfully</h3>
                                    <p className="text-xs text-emerald-100">{result.message || 'Linked Aadhaar retrieved from database'}</p>
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
                                <button
                                    type="button"
                                    onClick={copyAllDetails}
                                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">{copiedAll ? 'done' : 'content_copy'}</span>
                                    <span>{copiedAll ? 'Copied All' : 'Copy All'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 space-y-6">
                            {/* Prominent Masked Aadhaar Display */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-2 border-dashed border-cyan-300 dark:border-cyan-800 text-center relative">
                                <span className="text-xs font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-400 block mb-1">
                                    Linked Masked Aadhaar Number
                                </span>
                                <div className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-slate-900 dark:text-white my-3 select-all">
                                    {result.masked_aadhaar || resData.masked_aadhaar || 'N/A'}
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(result.masked_aadhaar || resData.masked_aadhaar, 'masked_aadhaar')}
                                        className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-cyan-50 text-cyan-700 dark:text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-cyan-200 dark:border-cyan-700 shadow-sm transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-base">
                                            {copiedField === 'masked_aadhaar' ? 'done' : 'content_copy'}
                                        </span>
                                        <span>{copiedField === 'masked_aadhaar' ? 'Copied' : 'Copy Aadhaar'}</span>
                                    </button>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm text-emerald-500">check_circle</span>
                                        UID Linked Status Verified
                                    </span>
                                </div>
                            </div>

                            {/* Details Table */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/50">
                                <InfoRow
                                    label="PAN Card Number"
                                    value={result.pan || pan}
                                    icon="credit_card"
                                    copyable
                                    onCopy={(val) => copyToClipboard(val, 'pan')}
                                    isCopied={copiedField === 'pan'}
                                />
                                <InfoRow
                                    label="Masked Aadhaar Number"
                                    value={result.masked_aadhaar || resData.masked_aadhaar}
                                    icon="fingerprint"
                                    copyable
                                    onCopy={(val) => copyToClipboard(val, 'masked_aadhaar')}
                                    isCopied={copiedField === 'masked_aadhaar'}
                                    badge="VERIFIED"
                                />
                                {resData.name && (
                                    <InfoRow
                                        label="Cardholder Name"
                                        value={resData.name}
                                        icon="person"
                                        copyable
                                        onCopy={(val) => copyToClipboard(val, 'name')}
                                        isCopied={copiedField === 'name'}
                                    />
                                )}
                                {resData.father_name && (
                                    <InfoRow
                                        label="Father Name"
                                        value={resData.father_name}
                                        icon="family_restroom"
                                    />
                                )}
                                {resData.dob && (
                                    <InfoRow
                                        label="Date of Birth"
                                        value={resData.dob}
                                        icon="calendar_month"
                                    />
                                )}
                                {resData.gender && (
                                    <InfoRow
                                        label="Gender"
                                        value={resData.gender}
                                        icon="male"
                                    />
                                )}
                                <InfoRow
                                    label="Aadhaar Seeding Status"
                                    value={resData.aadhaar_linked || 'Yes / Linked'}
                                    icon="link"
                                    badge="LINKED"
                                />
                                <InfoRow
                                    label="PAN Status"
                                    value={resData.status || 'Active / Operative'}
                                    icon="verified_user"
                                    badge="ACTIVE"
                                />
                                <InfoRow
                                    label="Verification Checked At"
                                    value={result.checked_at || new Date().toLocaleString()}
                                    icon="schedule"
                                />
                            </div>

                            {/* Actions Footer */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setResult(null);
                                        setPan('');
                                    }}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-base">refresh</span>
                                    <span>Search Another PAN</span>
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handlePrint}
                                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-base">print</span>
                                        <span>Print Official Slip</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Printable Slip (Hidden on screen, shown in @media print) */}
            <div id="mask-uid-printable-slip" style={{ display: 'none' }}>
                <div style={{ maxWidth: '650px', margin: '0 auto', border: '2px solid #0891b2', padding: '24px', borderRadius: '12px', background: '#fff' }}>
                    <div style={{ textAlign: 'center', borderBottom: '2px solid #0891b2', paddingBottom: '16px', marginBottom: '20px' }}>
                        <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 'bold', color: '#0891b2' }}>cspjaankari.in Portal</h2>
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#334155' }}>PAN To Mask Aadhaar Verification Receipt</h4>
                        <p style={{ margin: '0', fontSize: '12px', color: '#64748b' }}>Date & Time: {result?.checked_at || new Date().toLocaleString()}</p>
                    </div>

                    <div style={{ background: '#ecfeff', border: '1px dashed #06b6d4', padding: '16px', textAlign: 'center', borderRadius: '8px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0e7490', textTransform: 'uppercase' }}>Linked Masked Aadhaar Number</div>
                        <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '4px', fontFamily: 'monospace', color: '#0f172a', margin: '8px 0' }}>
                            {result?.masked_aadhaar || resData.masked_aadhaar || 'N/A'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#047857', fontWeight: 'bold' }}>✓ SEEDING STATUS: LINKED & ACTIVE</div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#475569', width: '40%' }}>PAN Number:</td>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#0f172a' }}>{result?.pan || pan}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#475569' }}>Masked Aadhaar:</td>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#0f172a' }}>{result?.masked_aadhaar || resData.masked_aadhaar || 'N/A'}</td>
                            </tr>
                            {resData.name && (
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#475569' }}>Cardholder Name:</td>
                                    <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#0f172a' }}>{resData.name}</td>
                                </tr>
                            )}
                            {resData.father_name && (
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#475569' }}>Father Name:</td>
                                    <td style={{ padding: '8px 4px', color: '#0f172a' }}>{resData.father_name}</td>
                                </tr>
                            )}
                            {resData.dob && (
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#475569' }}>Date of Birth:</td>
                                    <td style={{ padding: '8px 4px', color: '#0f172a' }}>{resData.dob}</td>
                                </tr>
                            )}
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#475569' }}>Aadhaar Seeding:</td>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#047857' }}>{resData.aadhaar_linked || 'Yes / Linked'}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#475569' }}>PAN Status:</td>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#047857' }}>{resData.status || 'Active / Operative'}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                        This is a computer-generated verification receipt generated from cspjaankari.in. No signature required.
                    </div>
                </div>
            </div>

            {/* Admin Quick API Settings Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-cyan-500">tune</span>
                                <span>PAN to Mask Aadhaar API Settings</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowAdminModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
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
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    API Endpoint URL
                                </label>
                                <input
                                    type="text"
                                    value={adminApiUrl}
                                    onChange={(e) => setAdminApiUrl(e.target.value)}
                                    placeholder="https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_mask_uid.php"
                                    className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Default: https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_mask_uid.php
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Dedicated API Key (Optional)
                                </label>
                                <input
                                    type="password"
                                    value={adminApiKey}
                                    onChange={(e) => setAdminApiKey(e.target.value)}
                                    placeholder="Khali chhodne par Master Good-API key use hogi"
                                    className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="px-5 py-2 text-xs font-black text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-md transition-all disabled:opacity-50"
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
