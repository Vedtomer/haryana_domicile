import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharToIdIntelligence() {
    const {
        service,
        coinCost = 199,
        isAdmin = false,
        apiUrl: propApiUrl = '',
        apiKey: propApiKey = '',
        currentService,
        auth,
    } = usePage().props;

    const [aadhaar, setAadhaar] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [copiedAll, setCopiedAll] = useState(false);

    const displayCoinCost = service?.coin_cost ?? currentService?.coin_cost ?? coinCost ?? 199;
    const isUserAdmin = auth?.user?.is_admin || auth?.user?.type === 'super_admin' || auth?.user?.type === 'admin' || isAdmin;

    // Admin Quick Settings Modal
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/telecom_api/id_intelligence.php');
    const [adminApiKey, setAdminApiKey] = useState(propApiKey || '');
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingMsg, setSettingMsg] = useState(null);

    const formatAadhaar = (val) => {
        const raw = val.replace(/\D/g, '').slice(0, 12);
        return raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    const handleCopy = (text, idx) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleCopyAllMobiles = () => {
        if (!result?.associated_mobiles?.length) return;
        const allNums = result.associated_mobiles.filter(Boolean).join('\n');
        navigator.clipboard.writeText(allNums);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    };

    const handlePrintOrPdf = () => {
        if (result?.pdf_url) {
            window.open(result.pdf_url, '_blank');
            return;
        }
        if (result?.pdf_base64) {
            let b64 = result.pdf_base64;
            if (!b64.startsWith('data:application/pdf;base64,')) {
                b64 = 'data:application/pdf;base64,' + b64;
            }
            const link = document.createElement('a');
            link.href = b64;
            link.download = `ID_Intelligence_${result.aadhaar || 'report'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }
        window.print();
    };

    const handleSaveAdminSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingMsg(null);
        try {
            const resp = await axios.post('/utilities/aadhar-to-id-intelligence/update-api', {
                api_url: adminApiUrl,
                api_key: adminApiKey,
            });
            if (resp.data.success) {
                setSettingMsg({ type: 'success', text: resp.data.message || 'API settings saved successfully!' });
                setTimeout(() => setShowAdminModal(false), 1500);
            } else {
                setSettingMsg({ type: 'error', text: resp.data.message || 'Failed to save settings.' });
            }
        } catch (err) {
            setSettingMsg({ type: 'error', text: err.response?.data?.message || 'Error saving API settings.' });
        } finally {
            setSavingSettings(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const clean = aadhaar.replace(/\D/g, '');
        if (clean.length !== 12) {
            setError('Please enter a valid 12-digit Aadhaar Number.');
            return;
        }

        if (!isUserAdmin && (auth?.user?.coins ?? 0) < displayCoinCost) {
            setError(`Insufficient coins. This service requires ${displayCoinCost} Coins. (Your balance: ${auth?.user?.coins ?? 0} coins)`);
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/aadhar-to-id-intelligence/search', {
                aadhaar: clean,
            });

            if (response.data.success) {
                const payload = {
                    ...response.data,
                    records: Array.isArray(response.data.records) ? response.data.records : [],
                    associated_mobiles: Array.isArray(response.data.associated_mobiles)
                        ? response.data.associated_mobiles.filter(m => m && m.trim && m.trim() !== '' && m !== 'NA')
                        : [],
                };
                setResult(payload);

                if (!isUserAdmin && auth?.user) {
                    auth.user.coins -= displayCoinCost;
                }
            } else {
                setError(response.data.message || 'No telecom ID records found for this Aadhaar.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'API server connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (raw) => {
        if (!raw) return 'N/A';
        return raw.split('!').filter(Boolean).join(', ');
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
                            <span className="material-symbols-outlined text-2xl">manage_search</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                                    Aadhar To ID Intelligence Details
                                </h1>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                                    {displayCoinCost} Coins
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Telecom ID Intelligence, Subscriber Records & Associated Mobile Numbers &bull; Official Report
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Dashboard
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Aadhar To ID Intelligence Details" />

            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #id-intel-print-slip, #id-intel-print-slip * {
                        visibility: visible !important;
                    }
                    #id-intel-print-slip {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        display: block !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        padding: 24px !important;
                        font-family: Arial, sans-serif !important;
                    }
                }
            `}</style>

            <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
                {/* Search Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined text-2xl">fingerprint</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Telecom ID Intelligence Verification
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Enter 12-digit Aadhaar number to retrieve all registered SIMs, subscriber names, circles, and download PDF
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                                Aadhaar Number (आधार कार्ड संख्या) *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                                    pin
                                </span>
                                <input
                                    type="text"
                                    value={formatAadhaar(aadhaar)}
                                    onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                    placeholder="Enter 12-digit Aadhaar number"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-base font-bold text-slate-800 dark:text-white placeholder:text-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all tracking-wider"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || aadhaar.replace(/\D/g, '').length !== 12}
                                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black text-base rounded-2xl shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Fetching ID Intelligence Dossier...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl">manage_search</span>
                                        <span>Fetch ID Intelligence & Download PDF ({displayCoinCost} Coins)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Telecom Department (DoT) Gateway
                        </span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                            Charges: {displayCoinCost} Coins / Search
                        </span>
                    </div>

                    {error && (
                        <div className="mt-5 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-start gap-3 text-red-700 dark:text-red-400">
                            <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">error</span>
                            <div className="text-sm font-medium leading-relaxed">{error}</div>
                        </div>
                    )}
                </div>

                {/* Result Section */}
                {result && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        {/* Summary Banner Card */}
                        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md">
                                        ID Intelligence Dossier
                                    </span>
                                    <h2 className="text-2xl font-black mt-2">
                                        Aadhaar: {result.aadhaar?.replace(/(\d{4})/g, '$1 ').trim()}
                                    </h2>
                                    <p className="text-xs text-purple-100 mt-1">
                                        Status: Verified &bull; Active telecom registrations found
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handlePrintOrPdf}
                                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-purple-900 hover:bg-slate-100 font-black text-sm shadow-md transition-transform active:scale-95 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-xl">download</span>
                                        Download PDF Report
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCopyAllMobiles}
                                        className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-sm transition"
                                    >
                                        <span className="material-symbols-outlined text-lg">content_copy</span>
                                        {copiedAll ? 'Copied All!' : 'Copy Numbers'}
                                    </button>
                                </div>
                            </div>

                            {/* Stat Counter Badges */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                                <div className="bg-white/10 rounded-2xl p-4">
                                    <p className="text-xs text-purple-200 font-bold uppercase">Total Registrations</p>
                                    <p className="text-2xl font-black mt-0.5">{result.total_records || result.records?.length || 0}</p>
                                </div>
                                <div className="bg-white/10 rounded-2xl p-4">
                                    <p className="text-xs text-purple-200 font-bold uppercase">Unique Mobile Numbers</p>
                                    <p className="text-2xl font-black mt-0.5">{result.unique_mobiles_count || result.associated_mobiles?.length || 0}</p>
                                </div>
                                <div className="bg-white/10 rounded-2xl p-4 col-span-2 sm:col-span-1">
                                    <p className="text-xs text-purple-200 font-bold uppercase">Telecom Source</p>
                                    <p className="text-lg font-black mt-0.5 truncate">DoT Live Gateway</p>
                                </div>
                            </div>
                        </div>

                        {/* Associated Mobiles List */}
                        {result.associated_mobiles?.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">cell_tower</span>
                                        <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                                            Associated Mobile Numbers ({result.associated_mobiles.length})
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCopyAllMobiles}
                                        className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400"
                                    >
                                        {copiedAll ? '✓ Copied' : 'Copy All'}
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2.5">
                                    {result.associated_mobiles.map((mob, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleCopy(mob, `mob-${idx}`)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-purple-900/30 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer transition"
                                            title="Click to copy"
                                        >
                                            <span>{mob}</span>
                                            <span className="material-symbols-outlined text-[14px] text-slate-400">
                                                {copiedIndex === `mob-${idx}` ? 'check' : 'content_copy'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Detailed Registration Records Table */}
                        {result.records?.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">list_alt</span>
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                                        Detailed SIM Registration Records ({result.records.length})
                                    </h3>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
                                            <tr>
                                                <th className="p-3 rounded-l-xl">#</th>
                                                <th className="p-3">Subscriber Name</th>
                                                <th className="p-3">Mobile No</th>
                                                <th className="p-3">Alt Mobile</th>
                                                <th className="p-3">Circle / Operator</th>
                                                <th className="p-3 rounded-r-xl">Address</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {result.records.map((rec, i) => (
                                                <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                                    <td className="p-3 font-mono text-slate-400">{i + 1}</td>
                                                    <td className="p-3 font-bold text-slate-800 dark:text-white whitespace-nowrap">
                                                        {rec.name || 'N/A'}
                                                        {rec.father_name ? (
                                                            <span className="block text-[11px] font-normal text-slate-400">
                                                                S/O: {rec.father_name}
                                                            </span>
                                                        ) : null}
                                                    </td>
                                                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                        {rec.mobile || 'N/A'}
                                                    </td>
                                                    <td className="p-3 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                        {rec.alternate_mobile || '-'}
                                                    </td>
                                                    <td className="p-3 whitespace-nowrap">
                                                        <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold text-[11px]">
                                                            {rec.circle || 'UNKNOWN'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs break-words">
                                                        {formatAddress(rec.address)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hidden Printable A4 Report Slip for window.print() / PDF Download */}
            {result && (
                <div id="id-intel-print-slip" style={{ display: 'none' }}>
                    <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '12px', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>
                            Government of India - Department of Telecommunications
                        </h2>
                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '4px 0', color: '#4338ca' }}>
                            CONFIDENTIAL: TELECOM ID INTELLIGENCE DOSSIER
                        </h3>
                        <p style={{ fontSize: '11px', margin: 0, color: '#666' }}>
                            Report Generated on {new Date().toLocaleString('en-IN')} &bull; Official Digital Verification
                        </p>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '12px' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '6px', border: '1px solid #ccc', fontWeight: 'bold', width: '25%' }}>Aadhaar Number</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc', width: '25%' }}>{result.aadhaar?.replace(/(\d{4})/g, '$1 ').trim()}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc', fontWeight: 'bold', width: '25%' }}>Total Registrations</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc', width: '25%' }}>{result.total_records || result.records?.length || 0}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '6px', border: '1px solid #ccc', fontWeight: 'bold' }}>Unique Mobile Numbers</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{result.unique_mobiles_count || result.associated_mobiles?.length || 0}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc', fontWeight: 'bold' }}>Verification Gateway</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>DoT Live Partner</td>
                            </tr>
                        </tbody>
                    </table>

                    {result.associated_mobiles?.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '13px', margin: '0 0 6px 0', fontWeight: 'bold' }}>
                                Associated Mobile Numbers ({result.associated_mobiles.length}):
                            </h4>
                            <p style={{ fontSize: '11px', lineHeight: '1.6', margin: 0, padding: '8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px' }}>
                                {result.associated_mobiles.join('  •  ')}
                            </p>
                        </div>
                    )}

                    {result.records?.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '13px', margin: '0 0 6px 0', fontWeight: 'bold' }}>
                                Detailed Subscriber Registrations ({result.records.length}):
                            </h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                <thead>
                                    <tr style={{ background: '#eee' }}>
                                        <th style={{ border: '1px solid #ccc', padding: '6px' }}>#</th>
                                        <th style={{ border: '1px solid #ccc', padding: '6px' }}>Subscriber Name</th>
                                        <th style={{ border: '1px solid #ccc', padding: '6px' }}>Mobile No</th>
                                        <th style={{ border: '1px solid #ccc', padding: '6px' }}>Alt Mobile</th>
                                        <th style={{ border: '1px solid #ccc', padding: '6px' }}>Circle</th>
                                        <th style={{ border: '1px solid #ccc', padding: '6px' }}>Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.records.map((r, i) => (
                                        <tr key={i}>
                                            <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{i + 1}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '5px', fontWeight: 'bold' }}>
                                                {r.name || 'N/A'}
                                                {r.father_name ? ` (S/O ${r.father_name})` : ''}
                                            </td>
                                            <td style={{ border: '1px solid #ccc', padding: '5px', fontWeight: 'bold' }}>{r.mobile}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '5px' }}>{r.alternate_mobile || '-'}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '5px' }}>{r.circle}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '5px' }}>{formatAddress(r.address)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div style={{ marginTop: '24px', borderTop: '1px solid #999', paddingTop: '8px', fontSize: '10px', color: '#666', textAlign: 'center' }}>
                        This is a computer-generated Telecom ID Intelligence verification dossier. Official CSP Jaankari Portal.
                    </div>
                </div>
            )}

            {/* Admin Quick API Settings Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">tune</span>
                                <h3 className="font-bold text-base text-slate-800 dark:text-white">
                                    ID Intelligence API Settings
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAdminModal(false)}
                                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveAdminSettings} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    API Endpoint URL
                                </label>
                                <input
                                    type="text"
                                    value={adminApiUrl}
                                    onChange={(e) => setAdminApiUrl(e.target.value)}
                                    placeholder="https://good-api-point.com/apis_partner/v1/telecom_api/id_intelligence.php"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Parameter format: ?apiKey=...&aadhaar=...
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    API Key (Good-API-Point)
                                </label>
                                <input
                                    type="text"
                                    value={adminApiKey}
                                    onChange={(e) => setAdminApiKey(e.target.value)}
                                    placeholder="Enter your API Key"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {settingMsg && (
                                <div
                                    className={`p-3 rounded-xl text-xs font-bold ${
                                        settingMsg.type === 'success'
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    }`}
                                >
                                    {settingMsg.text}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow transition disabled:opacity-50 cursor-pointer"
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
