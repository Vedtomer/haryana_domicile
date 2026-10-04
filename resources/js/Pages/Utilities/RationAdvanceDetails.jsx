import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

const InfoRow = ({ label, value, icon, copyable = false, onCopy = null }) => {
    if (!value || value === 'N/A' || value === '') return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[18px]">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800 dark:text-white break-words">{value}</p>
                    {copyable && onCopy && (
                        <button
                            type="button"
                            onClick={() => onCopy(value)}
                            className="text-slate-400 hover:text-amber-600 transition-colors"
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

export default function RationAdvanceDetails() {
    const {
        service,
        coinCost = 39,
        isAdmin = false,
        apiUrl: propApiUrl = '',
        apiKey: propApiKey = '',
        currentService,
        auth,
    } = usePage().props;

    const [rationNo, setRationNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedText, setCopiedText] = useState(null);

    const displayCoinCost = service?.coin_cost ?? currentService?.coin_cost ?? coinCost ?? 39;
    const isUserAdmin = auth?.user?.is_admin || auth?.user?.type === 'super_admin' || auth?.user?.type === 'admin' || isAdmin;

    // Admin Quick Settings Modal
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/ration_card_api/up_ration_details.php');
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
            const resp = await axios.post('/utilities/ration-advance-details/update-api', {
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

            const cleanReg = (regNo || rationNo).replace(/[\s-]/g, '').toUpperCase();
            const filename = dataObj.filename || `Ration_${cleanReg || 'Document'}.pdf`;
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
        const clean = rationNo.trim().toUpperCase().replace(/[\s-]/g, '');
        if (!clean) {
            setError('Please enter a valid Ration Card Number.');
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
            const response = await axios.post('/utilities/ration-advance-details/search', {
                ration_no: clean,
            });

            if (response.data.success) {
                const fetchedData = {
                    ...(response.data.data?.data || {}),
                    ...(response.data.data || {}),
                    pdf_base64: response.data.pdf_base64 || response.data.data?.pdf || response.data.data?.pdf_base64,
                    pdf_url: response.data.pdf_url || response.data.data?.pdf_url || response.data.data?.file_url,
                    ration_no: response.data.ration_no || clean,
                    filename: response.data.filename || `Ration_${clean}.pdf`,
                    message: response.data.message,
                };

                setResult(fetchedData);

                if (!isUserAdmin && auth?.user) {
                    auth.user.coins -= displayCoinCost;
                }

                // If PDF is returned, trigger auto download
                if (fetchedData.pdf_base64 || fetchedData.pdf_url) {
                    triggerDownload(fetchedData, clean);
                }
            } else {
                setError(response.data.message || 'Ration card record not found.');
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

    const members = Array.isArray(result?.members)
        ? result.members
        : Array.isArray(result?.member_list)
        ? result.member_list
        : Array.isArray(result?.member_details)
        ? result.member_details
        : [];

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
                            <span className="material-symbols-outlined text-2xl">receipt_long</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                                    Ration Advanse Details
                                </h1>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                    39 Coins
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                UP Ration Card Advance Details & Official PDF Download
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
            <Head title="Ration Advanse Details" />

            <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
                {/* Search Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                UP Ration Card Advance Details & PDF
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Enter 12-digit Ration Card Number to fetch details and download PDF
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                                Ration Card Number (राशन कार्ड संख्या) *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                                    pin
                                </span>
                                <input
                                    type="text"
                                    value={rationNo}
                                    onChange={(e) => setRationNo(e.target.value.toUpperCase())}
                                    placeholder="Enter ration number (e.g. 105580173259)"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-base font-bold text-slate-800 dark:text-white placeholder:text-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all tracking-wider"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !rationNo.trim()}
                                className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Fetching Ration Advance Details...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl">download</span>
                                        <span>Fetch Details & Download PDF ({displayCoinCost} Coins)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live UP Food & Civil Supplies Gateway
                        </span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
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

                {/* Result Card */}
                {result && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all animate-in fade-in zoom-in-95 duration-200">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 text-white">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-2xl text-white">verified</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                                            Ration Card Found
                                        </span>
                                        <h3 className="text-xl font-black font-mono tracking-wider mt-0.5">
                                            {result.ration_no || rationNo.toUpperCase()}
                                        </h3>
                                    </div>
                                </div>

                                {hasPdf && (
                                    <button
                                        type="button"
                                        onClick={() => triggerDownload(result, result.ration_no || rationNo)}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-amber-800 hover:bg-slate-100 font-black text-sm shadow-md transition-transform active:scale-95 shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-xl">download</span>
                                        Download PDF Now
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Details Card */}
                        <div className="p-6 space-y-2">
                            <InfoRow
                                label="Ration Card Number"
                                value={result.ration_no || result.rationCardNo || rationNo.toUpperCase()}
                                icon="tag"
                                copyable={true}
                                onCopy={handleCopy}
                            />
                            {(result.headOfFamily || result.owner_name || result.name || result.head_name) && (
                                <InfoRow
                                    label="Head of Family (मुखिया का नाम)"
                                    value={result.headOfFamily || result.owner_name || result.name || result.head_name}
                                    icon="person"
                                    copyable={true}
                                    onCopy={handleCopy}
                                />
                            )}
                            {(result.father_husband_name || result.fathername || result.husband_name) && (
                                <InfoRow
                                    label="Father / Husband Name (पिता\/पति का नाम)"
                                    value={result.father_husband_name || result.fathername || result.husband_name}
                                    icon="family_restroom"
                                    copyable={true}
                                    onCopy={handleCopy}
                                />
                            )}
                            {(result.mother_name || result.mothername) && (
                                <InfoRow
                                    label="Mother's Name (माता का नाम)"
                                    value={result.mother_name || result.mothername}
                                    icon="person_outline"
                                    copyable={true}
                                    onCopy={handleCopy}
                                />
                            )}
                            {(result.card_type || result.scheme || result.category) && (
                                <InfoRow
                                    label="Card Scheme / Type (कार्ड प्रकार)"
                                    value={result.card_type || result.scheme || result.category}
                                    icon="category"
                                />
                            )}
                            {(result.fps_name || result.dealer_name || result.shop_name) && (
                                <InfoRow
                                    label="FPS / Dealer Name (उचित दर विक्रेता)"
                                    value={result.fps_name || result.dealer_name || result.shop_name}
                                    icon="store"
                                    copyable={true}
                                    onCopy={handleCopy}
                                />
                            )}
                            {(result.fps_code || result.dealer_code || result.shop_no) && (
                                <InfoRow
                                    label="FPS Code / Shop No."
                                    value={result.fps_code || result.dealer_code || result.shop_no}
                                    icon="pin"
                                />
                            )}
                            {(result.district || result.district_name) && (
                                <InfoRow
                                    label="District (जनपद)"
                                    value={result.district || result.district_name}
                                    icon="location_city"
                                />
                            )}
                            {(result.block || result.town || result.tehsil) && (
                                <InfoRow
                                    label="Block / Tehsil / Town"
                                    value={result.block || result.town || result.tehsil}
                                    icon="map"
                                />
                            )}
                            {(result.village || result.gram_panchayat || result.ward) && (
                                <InfoRow
                                    label="Village / Gram Panchayat / Ward"
                                    value={result.village || result.gram_panchayat || result.ward}
                                    icon="home"
                                />
                            )}
                            {(result.total_members || members.length > 0) && (
                                <InfoRow
                                    label="Total Family Members (कुल सदस्य)"
                                    value={String(result.total_members || members.length)}
                                    icon="groups"
                                />
                            )}

                            {/* Members Table if provided */}
                            {members.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base">groups</span>
                                        Family Member Details (सदस्यों का विवरण)
                                    </h4>
                                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                                        <table className="min-w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
                                            <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-600 dark:text-slate-300 uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">#</th>
                                                    <th className="px-4 py-3">Member Name</th>
                                                    <th className="px-4 py-3">Relation</th>
                                                    <th className="px-4 py-3">Gender</th>
                                                    <th className="px-4 py-3">UID Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-200">
                                                {members.map((m, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                                        <td className="px-4 py-2.5 font-bold">{idx + 1}</td>
                                                        <td className="px-4 py-2.5 font-bold">{m.name || m.member_name || 'N/A'}</td>
                                                        <td className="px-4 py-2.5">{m.relation || m.relationship || 'N/A'}</td>
                                                        <td className="px-4 py-2.5">{m.gender || 'N/A'}</td>
                                                        <td className="px-4 py-2.5">
                                                            {m.uid_status || m.aadhar_status ? (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                                    {m.uid_status || m.aadhar_status}
                                                                </span>
                                                            ) : (
                                                                'Linked'
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Download Action Box */}
                            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                {hasPdf ? (
                                    <button
                                        type="button"
                                        onClick={() => triggerDownload(result, result.ration_no || rationNo)}
                                        className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-xl">cloud_download</span>
                                        <span>Download Official Ration PDF</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => window.print()}
                                        className="w-full py-4 px-6 bg-amber-600 hover:bg-amber-700 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-600/25 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-xl">print</span>
                                        <span>Print / Save Details as PDF</span>
                                    </button>
                                )}
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
                                    Ration Advance Details API Settings
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
                                    placeholder="https://good-api-point.com/apis_partner/v1/ration_card_api/up_ration_details.php"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Endpoint must accept apiKey and ration_no.
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
