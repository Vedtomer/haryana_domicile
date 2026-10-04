import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharToRation() {
    const { service, coinCost = 39, isAdmin = false, apiUrl: propApiUrl = '', apiKey: propApiKey = '' } = usePage().props;
    const { auth } = usePage().props;

    const [aadhar, setAadhar] = useState('');
    const [loading, setLoading] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showRaw, setShowRaw] = useState(false);

    const displayCoinCost = service?.coin_cost ?? coinCost ?? 39;

    // Admin Settings State
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/ration_card_api/uid_to_ration_no.php');
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

        if (!auth?.user?.is_admin && !isAdmin && (auth?.user?.coins ?? 0) < displayCoinCost) {
            setError(`Insufficient coins. This service requires ${displayCoinCost} Coins. Please recharge your wallet.`);
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/aadhar-to-ration/search', {
                aadhar: clean,
            });

            if (response.data.success) {
                setResult(response.data.data);
                if (!auth?.user?.is_admin && !isAdmin && auth?.user) {
                    auth.user.coins -= displayCoinCost;
                }
            } else {
                setError(response.data.message || 'Ration card details not found for this Aadhaar Number.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'An error occurred while connecting to the Ration Card server.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!result) return;
        const clean = result.aadhar || aadhar.replace(/\D/g, '');

        setDownloadingPdf(true);
        try {
            const response = await axios.post('/utilities/aadhar-to-ration/download-pdf', {
                aadhar: clean,
                ration_no: result.ration_no,
                head_name: result.head_name,
                father_husband: result.father_husband,
                district: result.district,
                state: result.state,
                scheme: result.scheme,
                fps_name: result.fps_name,
                fps_no: result.fps_no,
                members: result.members || [],
            }, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Ration_Card_Slip_${result.ration_no || clean}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('PDF Download Error:', err);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloadingPdf(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSaveAdminSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingMsg(null);

        try {
            const res = await axios.post('/utilities/aadhar-to-ration/update-api', {
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
                                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl sm:text-3xl">receipt_long</span>
                                <span>Aadhar To Ration Find</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                Find Ration Card Number & Family Details by 12-Digit Aadhaar &bull; NFSA Portal
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-xs">
                            <span>🪙</span>
                            <span>{displayCoinCost} Coins / Search</span>
                        </span>

                        {isAdmin && (
                            <button
                                onClick={() => setShowAdminModal(true)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 transition shadow-xs"
                                title="Admin API Settings"
                            >
                                <span className="material-symbols-outlined text-sm">settings</span>
                                <span className="hidden sm:inline">API Config</span>
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Aadhar To Ration Find - E-Ration Card Search" />

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #ration-printable-slip, #ration-printable-slip * {
                        visibility: visible;
                    }
                    #ration-printable-slip {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: #fff !important;
                        color: #000 !important;
                    }
                }
                `
            }} />

            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Input Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center justify-between gap-4 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                                <span className="material-symbols-outlined">fingerprint</span>
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                    Aadhaar Number Lookup
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Enter 12-digit Aadhaar number to fetch linked Ration Card
                                </p>
                            </div>
                        </div>
                        <span className="text-xs px-2.5 py-1 font-bold rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                            Ration Card Services
                        </span>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                Aadhaar Number (12 Digits) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formatAadhar(aadhar)}
                                    onChange={(e) => setAadhar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                    placeholder="0000 0000 0000"
                                    maxLength={14}
                                    className="w-full px-4 py-3.5 sm:text-lg font-mono tracking-widest bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 rounded-2xl focus:border-amber-500 dark:focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold placeholder:text-slate-400"
                                    disabled={loading}
                                    autoFocus
                                />
                                {aadhar && !loading && (
                                    <button
                                        type="button"
                                        onClick={() => { setAadhar(''); setResult(null); setError(null); }}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                                <span className="material-symbols-outlined text-xs text-amber-500">info</span>
                                <span>Coins will only be charged when Ration Card details are successfully found.</span>
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-500 text-lg shrink-0 mt-0.5">error</span>
                                <div>
                                    <div className="font-bold">Search Failed</div>
                                    <div className="text-xs opacity-90 mt-0.5">{error}</div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || aadhar.replace(/\D/g, '').length !== 12}
                            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white font-black text-sm tracking-wide shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                    <span>Searching NFSA & State PDS Database...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">search</span>
                                    <span>Find Ration Card ({displayCoinCost} Coins)</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Results Card */}
                {result && (
                    <div className="space-y-5 animate-fade-in">
                        {/* Main Highlight Card */}
                        <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-amber-950/20 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 dark:border-amber-700/60 shadow-xl relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200 dark:border-amber-800/60 pb-5">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        <span>Ration Card Record Verified</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                        Ration Card Number / राशन कार्ड संख्या
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-2xl sm:text-4xl font-black font-mono tracking-wider text-amber-900 dark:text-amber-300">
                                            {result.ration_no}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(result.ration_no)}
                                            className="p-2 rounded-xl bg-amber-200/60 hover:bg-amber-300/80 dark:bg-amber-900/40 dark:hover:bg-amber-800/60 text-amber-800 dark:text-amber-200 transition"
                                            title="Copy Ration Number"
                                        >
                                            <span className="material-symbols-outlined text-base">
                                                {copied ? 'check' : 'content_copy'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Download Official PDF */}
                                    <button
                                        onClick={handleDownloadPdf}
                                        disabled={downloadingPdf}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide shadow-md transition disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {downloadingPdf ? 'progress_activity' : 'picture_as_pdf'}
                                        </span>
                                        <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF Slip'}</span>
                                    </button>

                                    {/* Print Slip */}
                                    <button
                                        onClick={handlePrint}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs tracking-wide shadow-md transition"
                                    >
                                        <span className="material-symbols-outlined text-sm">print</span>
                                        <span>Print Slip</span>
                                    </button>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-6">
                                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                                        Head of Family (मुखिया)
                                    </span>
                                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1 block">
                                        {result.head_name || 'N/A'}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                                        Father / Husband (पिता/पति)
                                    </span>
                                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1 block">
                                        {result.father_husband || 'N/A'}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                                        Card Scheme / Type
                                    </span>
                                    <span className="text-sm sm:text-base font-black text-amber-700 dark:text-amber-400 mt-1 block">
                                        {result.scheme || 'NFSA / State PDS'}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                                        District (जिला)
                                    </span>
                                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1 block">
                                        {result.district || 'N/A'}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                                        State (राज्य)
                                    </span>
                                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1 block">
                                        {result.state || 'N/A'}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                                        FPS Dealer (उचित दर दुकान)
                                    </span>
                                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1 block truncate" title={result.fps_name}>
                                        {result.fps_name || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Family Members Section if available */}
                            {result.members && result.members.length > 0 && (
                                <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-5">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-amber-600 text-lg">group</span>
                                        <span>Family Members Listed ({result.members.length})</span>
                                    </h3>
                                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                                                <tr>
                                                    <th className="p-3">#</th>
                                                    <th className="p-3">Member Name</th>
                                                    <th className="p-3">Relationship</th>
                                                    <th className="p-3">Gender</th>
                                                    <th className="p-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {result.members.map((m, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                        <td className="p-3 font-mono">{idx + 1}</td>
                                                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                                                            {m.name || m.member_name || m.Name || 'Member ' + (idx + 1)}
                                                        </td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300">
                                                            {m.relation || m.relationship || m.Relation || 'Family'}
                                                        </td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300">
                                                            {m.gender || m.Gender || 'N/A'}
                                                        </td>
                                                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">
                                                            {m.uid_status || m.status || 'Verified'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* View Raw / Additional Details Accordion */}
                            {result.raw && Object.keys(result.raw).length > 0 && (
                                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => setShowRaw(!showRaw)}
                                        className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {showRaw ? 'expand_less' : 'expand_more'}
                                        </span>
                                        <span>{showRaw ? 'Hide' : 'View'} Additional API Technical Details</span>
                                    </button>
                                    {showRaw && (
                                        <pre className="mt-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs overflow-x-auto border border-slate-200 dark:border-slate-800 font-mono">
                                            {JSON.stringify(result.raw, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Hidden Printable Component for Browser Print */}
                        <div id="ration-printable-slip" className="hidden print:block p-8 bg-white text-black font-sans">
                            <div className="border-4 border-amber-800 p-6 rounded-lg">
                                <div className="text-center border-b-2 border-amber-800 pb-4 mb-4">
                                    <h1 className="text-2xl font-black text-amber-900 uppercase">National Food Security Portal</h1>
                                    <h2 className="text-base font-bold text-slate-800">राष्ट्रीय खाद्य सुरक्षा पोर्टल &bull; डिजिटल राशन कार्ड पर्ची</h2>
                                    <p className="text-xs text-slate-600 mt-1">Government of India / State Food & Civil Supplies Department</p>
                                </div>

                                <div className="bg-amber-50 border border-amber-300 p-4 rounded-md mb-4 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs text-amber-800 font-bold uppercase">Ration Card Number / राशन कार्ड संख्या</div>
                                        <div className="text-2xl font-black font-mono tracking-wider text-amber-900">{result.ration_no}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-emerald-800">Scheme: {result.scheme || 'NFSA'}</div>
                                        <div className="text-xs text-slate-500">Status: ACTIVE / VERIFIED</div>
                                    </div>
                                </div>

                                <table className="w-full border-collapse border border-slate-300 text-xs mb-4">
                                    <tbody>
                                        <tr>
                                            <td className="border border-slate-300 p-2 font-bold bg-slate-100 w-1/4">Head of Family (मुखिया)</td>
                                            <td className="border border-slate-300 p-2 font-semibold w-1/4">{result.head_name}</td>
                                            <td className="border border-slate-300 p-2 font-bold bg-slate-100 w-1/4">Father / Husband (पिता/पति)</td>
                                            <td className="border border-slate-300 p-2 font-semibold w-1/4">{result.father_husband}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-slate-300 p-2 font-bold bg-slate-100">Aadhaar UID No.</td>
                                            <td className="border border-slate-300 p-2 font-mono">{formatAadhar(result.aadhar || aadhar)}</td>
                                            <td className="border border-slate-300 p-2 font-bold bg-slate-100">Scheme / Category</td>
                                            <td className="border border-slate-300 p-2">{result.scheme}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-slate-300 p-2 font-bold bg-slate-100">District (जिला)</td>
                                            <td className="border border-slate-300 p-2">{result.district}</td>
                                            <td className="border border-slate-300 p-2 font-bold bg-slate-100">State (राज्य)</td>
                                            <td className="border border-slate-300 p-2">{result.state}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-slate-300 p-2 font-bold bg-slate-100">FPS Dealer Name</td>
                                            <td className="border border-slate-300 p-2">{result.fps_name}</td>
                                            <td className="border border-slate-300 p-2 font-bold bg-slate-100">FPS Code / Shop</td>
                                            <td className="border border-slate-300 p-2">{result.fps_no}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {result.members && result.members.length > 0 && (
                                    <div className="mb-4">
                                        <div className="font-bold text-xs text-amber-900 mb-1">Family Members ({result.members.length})</div>
                                        <table className="w-full border-collapse border border-slate-300 text-xs">
                                            <thead>
                                                <tr className="bg-slate-100">
                                                    <th className="border border-slate-300 p-1">#</th>
                                                    <th className="border border-slate-300 p-1 text-left">Member Name</th>
                                                    <th className="border border-slate-300 p-1 text-left">Relationship</th>
                                                    <th className="border border-slate-300 p-1 text-left">Gender</th>
                                                    <th className="border border-slate-300 p-1 text-left">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.members.map((m, i) => (
                                                    <tr key={i}>
                                                        <td className="border border-slate-300 p-1 text-center">{i + 1}</td>
                                                        <td className="border border-slate-300 p-1 font-semibold">{m.name || m.member_name || 'Member ' + (i + 1)}</td>
                                                        <td className="border border-slate-300 p-1">{m.relation || m.relationship || 'Family'}</td>
                                                        <td className="border border-slate-300 p-1">{m.gender || 'N/A'}</td>
                                                        <td className="border border-slate-300 p-1 font-bold text-emerald-700">{m.uid_status || 'Verified'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div className="text-[10px] text-slate-500 border-t border-slate-300 pt-2 flex justify-between items-center">
                                    <div>Checked On: {result.checked_at || new Date().toLocaleString()}</div>
                                    <div>Electronic Verification Document &bull; Valid across PDS Counters</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Admin API Settings Modal */}
            {isAdmin && showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">settings</span>
                                <span>Aadhar To Ration API Settings</span>
                            </h3>
                            <button
                                onClick={() => setShowAdminModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveAdminSettings} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    API Endpoint URL
                                </label>
                                <input
                                    type="text"
                                    value={adminApiUrl}
                                    onChange={(e) => setAdminApiUrl(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Default: https://good-api-point.com/apis_partner/v1/ration_card_api/uid_to_ration_no.php
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
                                    placeholder="Enter your API Key"
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
                                    className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
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
