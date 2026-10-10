import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function RationCardPdf() {
    const { service, coinCost = 19, isAdmin = false, apiUrl: propApiUrl = '', apiKey: propApiKey = '' } = usePage().props;
    const { auth } = usePage().props;

    const [rationNo, setRationNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const displayCoinCost = service?.coin_cost ?? coinCost ?? 19;

    // Admin Settings State
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_card_pdf.php');
    const [adminApiKey, setAdminApiKey] = useState(propApiKey || '');
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingMsg, setSettingMsg] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();

        const clean = rationNo.trim().toUpperCase();
        if (!clean || clean.length < 4) {
            setError('Please enter a valid Ration Card Number (at least 4 characters).');
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
            const response = await axios.post('/utilities/ration-card-pdf/download', {
                ration_no: clean,
            });

            if (response.data.success) {
                setResult(response.data);
                if (!auth?.user?.is_admin && !isAdmin && auth?.user) {
                    auth.user.coins -= displayCoinCost;
                }
            } else {
                setError(response.data.message || 'Ration Card PDF could not be found for this number.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'An error occurred while generating Ration Card PDF.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const getPdfDataUri = () => {
        if (!result) return null;
        if (result.pdf_url) return result.pdf_url;
        if (result.pdf_base64) {
            if (result.pdf_base64.startsWith('data:application/pdf;base64,')) {
                return result.pdf_base64;
            }
            return `data:application/pdf;base64,${result.pdf_base64}`;
        }
        return null;
    };

    const handleDownloadPdf = () => {
        const uri = getPdfDataUri();
        if (!uri) {
            alert('PDF data not available.');
            return;
        }

        if (result.pdf_url && !result.pdf_base64) {
            window.open(result.pdf_url, '_blank');
            return;
        }

        const link = document.createElement('a');
        link.href = uri;
        link.download = `Ration_Card_${result.ration_no || 'Document'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenInNewTab = () => {
        const uri = getPdfDataUri();
        if (!uri) return;
        window.open(uri, '_blank');
    };

    const handleSaveAdminSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingMsg(null);

        try {
            const res = await axios.post('/utilities/ration-card-pdf/update-api', {
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

    const pdfDataUri = getPdfDataUri();

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
                                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl sm:text-3xl">picture_as_pdf</span>
                                <span>Ration Card PDF Download</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                Instant Official NFSA & State PDS Ration Card PDF Download &bull; High Resolution
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-xs">
                            <span>🪙</span>
                            <span>{displayCoinCost} Coins / Download</span>
                        </span>

                    </div>
                </div>
            }
        >
            <Head title="Ration Card PDF Download - Instant E-Ration Card" />

            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Input Form Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center justify-between gap-4 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                                <span className="material-symbols-outlined">receipt_long</span>
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                    Ration Card Number Lookup
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Enter Ration Card Number to download official PDF copy
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
                                Ration Card Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={rationNo}
                                    onChange={(e) => setRationNo(e.target.value.toUpperCase())}
                                    placeholder="Enter Ration Card No. (e.g. 064000...)"
                                    className="w-full px-4 py-3.5 sm:text-lg font-mono tracking-wider bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 rounded-2xl focus:border-amber-500 dark:focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold placeholder:text-slate-400"
                                    disabled={loading}
                                    autoFocus
                                />
                                {rationNo && !loading && (
                                    <button
                                        type="button"
                                        onClick={() => { setRationNo(''); setResult(null); setError(null); }}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                                <span className="material-symbols-outlined text-xs text-amber-500">info</span>
                                <span>Coins will only be charged when the PDF is successfully generated and delivered.</span>
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-500 text-lg shrink-0 mt-0.5">error</span>
                                <div>
                                    <div className="font-bold">Generation Failed</div>
                                    <div className="text-xs opacity-90 mt-0.5">{error}</div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !rationNo.trim()}
                            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white font-black text-sm tracking-wide shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                    <span>Fetching Official Ration Card PDF from NFSA Server...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">download</span>
                                    <span>Download Ration Card PDF ({displayCoinCost} Coins)</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* PDF Output Preview & Download Card */}
                {result && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-amber-950/20 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 dark:border-amber-700/60 shadow-xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200 dark:border-amber-800/60 pb-5">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        <span>PDF Ready for Download</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                        Ration Card Number / राशन कार्ड संख्या
                                    </p>
                                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-amber-900 dark:text-amber-300 mt-1">
                                        {result.ration_no}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5">
                                    <button
                                        onClick={handleDownloadPdf}
                                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-600/20 transition transform active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-lg">download</span>
                                        <span>Download PDF</span>
                                    </button>

                                    {pdfDataUri && (
                                        <button
                                            onClick={handleOpenInNewTab}
                                            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition"
                                        >
                                            <span className="material-symbols-outlined text-lg">open_in_new</span>
                                            <span>Open in New Tab</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Embedded PDF Viewer if base64/data URI is available */}
                            {pdfDataUri && (
                                <div className="mt-6 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white shadow-inner">
                                    <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                        <span className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm text-amber-600">visibility</span>
                                            <span>Document Preview</span>
                                        </span>
                                        <span className="text-[11px] font-mono text-slate-400">PDF Viewer</span>
                                    </div>
                                    <div className="h-[600px] w-full bg-slate-50 dark:bg-slate-950">
                                        <iframe
                                            src={pdfDataUri}
                                            title="Ration Card PDF Preview"
                                            className="w-full h-full border-0"
                                        />
                                    </div>
                                </div>
                            )}
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
                                <span>Ration Card PDF API Settings</span>
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
                                    Default: https://good-api-point.com/apis_partner/v1/ration_card_api/ration_card_pdf.php
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
