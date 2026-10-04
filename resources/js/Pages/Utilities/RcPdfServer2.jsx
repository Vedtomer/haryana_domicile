import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

const InfoRow = ({ label, value, icon, copyable = false, onCopy = null }) => {
    if (!value || value === 'N/A' || value === '') return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-500 text-[18px]">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800 dark:text-white break-words">{value}</p>
                    {copyable && onCopy && (
                        <button
                            type="button"
                            onClick={() => onCopy(value)}
                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Copy to clipboard"
                        >
                            <span className="material-symbols-outlined text-[15px]">content_copy</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function RcPdfServer2() {
    const {
        service,
        coinCost = 149,
        isAdmin = false,
        apiUrl: propApiUrl = '',
        apiKey: propApiKey = '',
        currentService,
        auth,
    } = usePage().props;

    const [rcno, setRcno] = useState('');
    const [chipType, setChipType] = useState('');
    const [cardType, setCardType] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedText, setCopiedText] = useState(null);

    const displayCoinCost = service?.coin_cost ?? currentService?.coin_cost ?? coinCost ?? 149;
    const isUserAdmin = auth?.user?.is_admin || auth?.user?.type === 'super_admin' || auth?.user?.type === 'admin' || isAdmin;

    // Admin Quick Settings Modal
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/vahan_service_api/vechil_rc_pdf2.php');
    const [adminApiKey, setAdminApiKey] = useState(propApiKey || '');
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingMsg, setSettingMsg] = useState(null);

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const handleSaveAdminSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingMsg(null);
        try {
            const resp = await axios.post('/utilities/rc-pdf-server-2/update-api', {
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

    const triggerDownload = (dataObj, regNo) => {
        if (!dataObj) return;

        const directUrl = dataObj.pdf_url || dataObj.file_url || dataObj.download_url || dataObj.url || dataObj.data?.pdf_url || dataObj.data?.file_url;
        if (directUrl) {
            window.open(directUrl, '_blank');
            return;
        }

        let pdfData = dataObj.pdf_base64 || dataObj.pdf || dataObj.base64 || dataObj.data?.pdf_base64 || dataObj.data?.pdf;
        if (pdfData) {
            if (pdfData.startsWith('http://') || pdfData.startsWith('https://')) {
                window.open(pdfData, '_blank');
                return;
            }

            if (!pdfData.startsWith('data:application/pdf;base64,')) {
                pdfData = 'data:application/pdf;base64,' + pdfData;
            }

            const cleanReg = (regNo || rcno).replace(/[\s-]/g, '').toUpperCase();
            const filename = dataObj.filename || `RC_${cleanReg || 'SERVER2'}.pdf`;
            const link = document.createElement('a');
            link.href = pdfData;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const clean = rcno.trim().toUpperCase().replace(/[\s-]/g, '');
        if (!clean) {
            setError('Please enter a valid RC Number.');
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
            const response = await axios.post('/utilities/rc-pdf-server-2/search', {
                rcno: clean,
                chiptype: chipType.trim(),
                cardtype: cardType.trim(),
            });

            if (response.data.success) {
                const fetchedData = {
                    ...(response.data.data?.data || {}),
                    ...(response.data.data || {}),
                    pdf_base64: response.data.pdf_base64 || response.data.data?.pdf || response.data.data?.pdf_base64,
                    pdf_url: response.data.pdf_url || response.data.data?.pdf_url || response.data.data?.file_url,
                    rcno: response.data.rcno || clean,
                    order_id: response.data.order_id || response.data.data?.order_id,
                    filename: response.data.filename || response.data.data?.filename || `RC_${clean}.pdf`,
                    message: response.data.message,
                };

                setResult(fetchedData);

                if (!isUserAdmin && auth?.user) {
                    auth.user.coins -= displayCoinCost;
                }

                // Automatically trigger download
                triggerDownload(fetchedData, clean);
            } else {
                setError(response.data.message || 'RC PDF record not found for this vehicle.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'API server connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const hasPdf = Boolean(
        result && (
            result.pdf_base64 ||
            result.pdf_url ||
            result.file_url ||
            result.download_url ||
            result.url ||
            result.pdf ||
            result.base64 ||
            result.data?.pdf_base64 ||
            result.data?.pdf
        )
    );

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                            <span className="material-symbols-outlined text-2xl">drive_eta</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                                    Rc Pdf Sarver 2
                                </h1>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                    149 Coins
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Vehicle RC PDF Server 2 - Smart Chip & PVC Card Official PDF Download
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isUserAdmin && (
                            <button
                                type="button"
                                onClick={() => setShowAdminModal(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                            >
                                <span className="material-symbols-outlined text-[16px]">tune</span>
                                API Settings
                            </button>
                        )}
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
            <Head title="Rc Pdf Sarver 2" />

            <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
                {/* Search Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Download Vehicle RC PDF (Server 2)
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Enter RC Number with optional Chip Type and Card Type
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-4">
                        {/* RC Number */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                                RC Number (rcno) *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                                    directions_car
                                </span>
                                <input
                                    type="text"
                                    value={rcno}
                                    onChange={(e) => setRcno(e.target.value.toUpperCase())}
                                    placeholder="Enter rcno (e.g. HR26DK8337)"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-base font-bold text-slate-800 dark:text-white placeholder:text-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all tracking-wider"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Two columns for Chip Type & Card Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                                    Chip Type (chiptype)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                                        memory
                                    </span>
                                    <input
                                        type="text"
                                        list="chipTypeOptions"
                                        value={chipType}
                                        onChange={(e) => setChipType(e.target.value)}
                                        placeholder="Enter chiptype"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                    />
                                    <datalist id="chipTypeOptions">
                                        <option value="Smart Chip" />
                                        <option value="Old Chip" />
                                        <option value="New Chip" />
                                        <option value="Non-Chip" />
                                    </datalist>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                                    Card Type (cardtype)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                                        credit_card
                                    </span>
                                    <input
                                        type="text"
                                        list="cardTypeOptions"
                                        value={cardType}
                                        onChange={(e) => setCardType(e.target.value)}
                                        placeholder="Enter cardtype"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                    />
                                    <datalist id="cardTypeOptions">
                                        <option value="PVC Smart Card" />
                                        <option value="Standard Card" />
                                        <option value="Paper Card" />
                                    </datalist>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !rcno.trim()}
                                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-black text-base rounded-2xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Fetching RC PDF from Server 2...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl">download</span>
                                        <span>Download RC PDF ({displayCoinCost} Coins)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Server 2 Parivahan Connected
                        </span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                            Charges: {displayCoinCost} Coins / Download
                        </span>
                    </div>

                    {error && (
                        <div className="mt-5 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-start gap-3 text-red-700 dark:text-red-400">
                            <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">error</span>
                            <div className="text-sm font-medium leading-relaxed">{error}</div>
                        </div>
                    )}
                </div>

                {/* Result Card */}
                {result && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all animate-in fade-in zoom-in-95 duration-200">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-6 text-white">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-2xl text-white">verified</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                                            Server 2 PDF Ready
                                        </span>
                                        <h3 className="text-xl font-black font-mono tracking-wider mt-0.5">
                                            {result.rcno || rcno.toUpperCase()}
                                        </h3>
                                    </div>
                                </div>

                                {hasPdf && (
                                    <button
                                        type="button"
                                        onClick={() => triggerDownload(result, result.rcno || rcno)}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-700 hover:bg-slate-100 font-black text-sm shadow-md transition-transform active:scale-95 shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-xl">download</span>
                                        Download PDF Now
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Details Card */}
                        <div className="p-6 space-y-2">
                            {result.order_id && (
                                <InfoRow
                                    label="Order ID / Transaction Ref"
                                    value={result.order_id}
                                    icon="receipt_long"
                                    copyable={true}
                                    onCopy={handleCopy}
                                />
                            )}
                            <InfoRow
                                label="Vehicle RC Number"
                                value={result.rcno || rcno.toUpperCase()}
                                icon="directions_car"
                                copyable={true}
                                onCopy={handleCopy}
                            />
                            {chipType && (
                                <InfoRow
                                    label="Chip Type"
                                    value={chipType}
                                    icon="memory"
                                />
                            )}
                            {cardType && (
                                <InfoRow
                                    label="Card Type"
                                    value={cardType}
                                    icon="credit_card"
                                />
                            )}
                            {result.filename && (
                                <InfoRow
                                    label="PDF Filename"
                                    value={result.filename}
                                    icon="description"
                                    copyable={true}
                                    onCopy={handleCopy}
                                />
                            )}

                            {/* Download Action Box */}
                            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => triggerDownload(result, result.rcno || rcno)}
                                    className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-xl">cloud_download</span>
                                    <span>Download Original RC PDF (Server 2)</span>
                                </button>
                                <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
                                    If the download did not start automatically, click the button above.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Quick Settings Modal */}
            {showAdminModal && isUserAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-600">tune</span>
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                    RC PDF Server 2 API Settings
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAdminModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {settingMsg && (
                            <div
                                className={`mt-4 p-3 rounded-xl text-xs font-medium ${
                                    settingMsg.type === 'success'
                                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                        : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                }`}
                            >
                                {settingMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleSaveAdminSettings} className="space-y-4 mt-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    API Endpoint URL
                                </label>
                                <input
                                    type="url"
                                    value={adminApiUrl}
                                    onChange={(e) => setAdminApiUrl(e.target.value)}
                                    placeholder="https://good-api-point.com/apis_partner/v1/vahan_service_api/vechil_rc_pdf2.php"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Endpoint must accept apiKey and rcno.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    API Key (Good-API-Point Key)
                                </label>
                                <input
                                    type="text"
                                    value={adminApiKey}
                                    onChange={(e) => setAdminApiKey(e.target.value)}
                                    placeholder="9d55e89b7aeee35171f269af07b6013a3b83db637f04ace03dbc8566a4461815"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition disabled:opacity-50"
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
