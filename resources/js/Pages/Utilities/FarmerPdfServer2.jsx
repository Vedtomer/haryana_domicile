import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

const INDIAN_STATES = [
    { code: 'UP', name: 'Uttar Pradesh (उत्तर प्रदेश)' },
    { code: 'HR', name: 'Haryana (हरियाणा)' },
    { code: 'PB', name: 'Punjab (पंजाब)' },
    { code: 'RJ', name: 'Rajasthan (राजस्थान)' },
    { code: 'MP', name: 'Madhya Pradesh (मध्य प्रदेश)' },
    { code: 'BR', name: 'Bihar (बिहार)' },
    { code: 'MH', name: 'Maharashtra (महाराष्ट्र)' },
    { code: 'GJ', name: 'Gujarat (गुजरात)' },
    { code: 'WB', name: 'West Bengal (पश्चिम बंगाल)' },
    { code: 'OD', name: 'Odisha (ओडिशा)' },
    { code: 'JH', name: 'Jharkhand (झारखंड)' },
    { code: 'CG', name: 'Chhattisgarh (छत्तीसगढ़)' },
    { code: 'UK', name: 'Uttarakhand (उत्तराखंड)' },
    { code: 'HP', name: 'Himachal Pradesh (हिमाचल प्रदेश)' },
    { code: 'JK', name: 'Jammu & Kashmir (जम्मू और कश्मीर)' },
    { code: 'KA', name: 'Karnataka (कर्नाटक)' },
    { code: 'AP', name: 'Andhra Pradesh (आंध्र प्रदेश)' },
    { code: 'TS', name: 'Telangana (तेलंगाना)' },
    { code: 'TN', name: 'Tamil Nadu (तमिलनाडु)' },
    { code: 'KL', name: 'Kerala (केरल)' },
    { code: 'AS', name: 'Assam (असम)' },
    { code: 'TR', name: 'Tripura (त्रिपुरा)' },
    { code: 'ML', name: 'Meghalaya (मेघालय)' },
    { code: 'MN', name: 'Manipur (मणिपुर)' },
    { code: 'NL', name: 'Nagaland (नागालैंड)' },
    { code: 'MZ', name: 'Mizoram (मिजोरम)' },
    { code: 'AR', name: 'Arunachal Pradesh (अरुणाचल प्रदेश)' },
    { code: 'SK', name: 'Sikkim (सिक्किम)' },
    { code: 'GA', name: 'Goa (गोवा)' },
    { code: 'DL', name: 'Delhi (दिल्ली)' },
    { code: 'CH', name: 'Chandigarh (चंडीगढ़)' },
    { code: 'PY', name: 'Puducherry (पुडुचेरी)' },
    { code: 'LA', name: 'Ladakh (लद्दाख)' },
];

export default function FarmerPdfServer2() {
    const {
        service,
        coinCost = 49,
        isAdmin = false,
        apiUrl: propApiUrl = '',
        apiKey: propApiKey = '',
        currentService,
        auth,
    } = usePage().props;

    const [aadhaar, setAadhaar] = useState('');
    const [selectedState, setSelectedState] = useState('UP');
    const [customState, setCustomState] = useState('');
    const [isCustomState, setIsCustomState] = useState(false);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedText, setCopiedText] = useState(null);

    const displayCoinCost = service?.coin_cost ?? currentService?.coin_cost ?? coinCost ?? 49;
    const isUserAdmin = auth?.user?.is_admin || auth?.user?.type === 'super_admin' || auth?.user?.type === 'admin' || isAdmin;

    // Admin Quick Settings Modal
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/farmer_card_api/farmer_pdf_server2.php');
    const [adminApiKey, setAdminApiKey] = useState(propApiKey || '');
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingMsg, setSettingMsg] = useState(null);

    const formatAadhaar = (val) => {
        const raw = val.replace(/\D/g, '').slice(0, 12);
        return raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    };

    const handleAadhaarChange = (e) => {
        setAadhaar(formatAadhaar(e.target.value));
        if (error) setError(null);
    };

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
            const resp = await axios.post('/utilities/farmer-pdf-server-2/update-api', {
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

    const triggerDownload = (dataObj, cleanAadhaar, stateCode) => {
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

            const filename = dataObj.filename || `Farmer_Card_${stateCode || 'ALL'}_${cleanAadhaar || 'DOWNLOAD'}.pdf`;
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
        const cleanAadhaar = aadhaar.replace(/\D/g, '');

        if (cleanAadhaar.length !== 12) {
            setError('कृपया 12 अंकों का वैध आधार नंबर दर्ज करें (Please enter 12-digit Aadhaar Number).');
            return;
        }

        const effectiveState = isCustomState ? customState.trim().toUpperCase() : selectedState;
        if (!effectiveState) {
            setError('कृपया राज्य चुनें या दर्ज करें (Please select or enter State).');
            return;
        }

        if (!isUserAdmin && (auth?.user?.coins ?? 0) < displayCoinCost) {
            setError(`पर्याप्त कॉइन्स नहीं हैं। इस सर्विस के लिए ${displayCoinCost} कॉइन्स आवश्यक हैं। (आपके पास: ${auth?.user?.coins ?? 0} coins)`);
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/farmer-pdf-server-2/search', {
                aadhaar: cleanAadhaar,
                state: effectiveState,
            });

            if (response.data.success) {
                const fetchedData = {
                    ...(response.data.data?.data || {}),
                    ...(response.data.data || {}),
                    pdf_base64: response.data.pdf_base64 || response.data.data?.pdf || response.data.data?.pdf_base64,
                    pdf_url: response.data.pdf_url || response.data.data?.pdf_url || response.data.data?.file_url,
                    aadhaar: response.data.aadhaar || cleanAadhaar,
                    state: response.data.state || effectiveState,
                    order_id: response.data.order_id || response.data.data?.order_id,
                    filename: response.data.filename || response.data.data?.filename || `Farmer_Card_${effectiveState}_${cleanAadhaar}.pdf`,
                    message: response.data.message || 'Farmer Card PDF fetched successfully.',
                };

                setResult(fetchedData);

                if (!isUserAdmin && auth?.user) {
                    auth.user.coins -= displayCoinCost;
                }

                // Automatically trigger download
                triggerDownload(fetchedData, cleanAadhaar, effectiveState);
            } else {
                setError(response.data.message || 'Farmer Card PDF record not found for this Aadhaar.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'API सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।');
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
            result.data?.pdf_base64 ||
            result.data?.pdf ||
            result.data?.pdf_url
        )
    );

    const getPdfDataUri = () => {
        if (!result) return null;
        let pdfData = result.pdf_base64 || result.pdf || result.base64 || result.data?.pdf_base64 || result.data?.pdf;
        if (pdfData && !pdfData.startsWith('http://') && !pdfData.startsWith('https://')) {
            if (!pdfData.startsWith('data:application/pdf;base64,')) {
                pdfData = 'data:application/pdf;base64,' + pdfData;
            }
            return pdfData;
        }
        return result.pdf_url || result.file_url || result.download_url || result.url || result.data?.pdf_url || null;
    };

    return (
        <AdminLayout>
            <Head title="Farmer Pdf Sarver All State 2 - किसान कार्ड PDF डाउनलोड" />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Top Navigation & Breadcrumb */}
                    <div className="flex items-center justify-between">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Back to Dashboard
                        </Link>
                    </div>

                    {/* Main Header Card */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/20">
                        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-40 h-40 rounded-full bg-emerald-400/20 blur-xl pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-bold uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-[15px]">agriculture</span>
                                    PM Kisan & AgriStack Portal
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                    Farmer Pdf Sarver All State 2
                                </h1>
                                <p className="text-emerald-100 text-sm max-w-xl font-medium leading-relaxed">
                                    Instant Farmer Registration Card / Kisan Card PDF Download for All Indian States via Aadhaar Number.
                                </p>
                            </div>

                            <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/20 pt-4 sm:pt-0">
                                <div className="text-left sm:text-right">
                                    <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-200 block">Service Charge</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-3xl font-black text-amber-300 drop-shadow-sm">{displayCoinCost}</span>
                                        <span className="text-sm font-bold text-emerald-100">Coins</span>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/20 text-emerald-100 backdrop-blur-sm border border-white/10">
                                    Your Coins: <span className="font-black text-white">{auth?.user?.coins ?? 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search / Download Form */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                        <form onSubmit={handleSearch} className="space-y-6">
                            <div className="space-y-1">
                                <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600">badge</span>
                                    Enter Farmer Aadhaar & State
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    किसान का 12 अंकों का आधार नंबर और राज्य चुनें, फिर ओरिजिनल किसान कार्ड PDF डाउनलोड करें।
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Aadhaar Number Input */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                        Aadhaar Number (आधार संख्या) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={aadhaar}
                                            onChange={handleAadhaarChange}
                                            placeholder="XXXX XXXX XXXX"
                                            maxLength={14}
                                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-base font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                                        Enter 12 digits Aadhaar Number of the farmer
                                    </p>
                                </div>

                                {/* State Select / Input */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Select State (राज्य) <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsCustomState(!isCustomState)}
                                            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                        >
                                            {isCustomState ? '← Dropdown List' : 'Custom State Code?'}
                                        </button>
                                    </div>

                                    {!isCustomState ? (
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <span className="material-symbols-outlined text-[20px]">map</span>
                                            </div>
                                            <select
                                                value={selectedState}
                                                onChange={(e) => setSelectedState(e.target.value)}
                                                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none"
                                            >
                                                {INDIAN_STATES.map((st) => (
                                                    <option key={st.code} value={st.code}>
                                                        {st.name} [{st.code}]
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                                                <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <span className="material-symbols-outlined text-[20px]">edit_location_alt</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={customState}
                                                onChange={(e) => setCustomState(e.target.value.toUpperCase())}
                                                placeholder="e.g. UP, HR, RJ, MP, PB"
                                                maxLength={20}
                                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    )}

                                    {/* Quick State Selection Chips */}
                                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Quick:</span>
                                        {['UP', 'HR', 'PB', 'RJ', 'MP', 'BR', 'MH'].map((code) => (
                                            <button
                                                key={code}
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomState(false);
                                                    setSelectedState(code);
                                                }}
                                                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                                                    !isCustomState && selectedState === code
                                                        ? 'bg-emerald-600 text-white shadow-sm'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                                                }`}
                                            >
                                                {code}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Error Alert */}
                            {error && (
                                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
                                    <span className="material-symbols-outlined text-red-500 mt-0.5 flex-shrink-0">error</span>
                                    <div className="font-medium">{error}</div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || aadhaar.replace(/\D/g, '').length !== 12}
                                    className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 flex items-center justify-center gap-3 transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Fetching Farmer Card PDF from Govt Server...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[22px]">download_for_offline</span>
                                            <span>Download Farmer PDF ({displayCoinCost} Coins)</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Result Card */}
                    {result && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 animate-fade-in">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[28px]">check_circle</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                            Farmer Card PDF Ready!
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            Aadhaar: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{result.aadhaar}</span> | State: <span className="font-bold text-emerald-600 dark:text-emerald-400">{result.state}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => triggerDownload(result, result.aadhaar, result.state)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">download</span>
                                        Download PDF
                                    </button>
                                    {getPdfDataUri() && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const uri = getPdfDataUri();
                                                if (uri) window.open(uri, '_blank');
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                            Open in Tab
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Details Overview */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Aadhaar Number</p>
                                    <p className="text-sm font-mono font-black text-slate-800 dark:text-white">
                                        {formatAadhaar(result.aadhaar)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">State Code</p>
                                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                        {result.state}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">File Name</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate" title={result.filename}>
                                        {result.filename || 'Farmer_Card.pdf'}
                                    </p>
                                </div>
                            </div>

                            {/* Embedded PDF Preview if Data URI is available */}
                            {getPdfDataUri() && (
                                <div className="mt-4 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-inner">
                                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                                            Document Preview
                                        </span>
                                        <span className="text-[11px] text-slate-400">A4 Printable Format</span>
                                    </div>
                                    <iframe
                                        src={getPdfDataUri()}
                                        title="Farmer Card PDF Preview"
                                        className="w-full h-[550px] border-0"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Information Note Card */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-5 border border-emerald-200/50 dark:border-emerald-900/30 text-xs text-emerald-900 dark:text-emerald-300 space-y-2">
                        <div className="flex items-center gap-2 font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            Important Guidelines (महत्वपूर्ण निर्देश)
                        </div>
                        <ul className="list-disc list-inside space-y-1 font-medium text-slate-600 dark:text-slate-400">
                            <li>यह सेवा भारत के सभी राज्यों (All State) के लिए उपलब्ध है।</li>
                            <li>किसान का 12 अंकों का आधार नंबर और राज्य सही से चुनें।</li>
                            <li>डाउनलोड की गई PDF ओरिजिनल गवर्नमेंट फॉर्मेट में उच्च गुणवत्ता (HD) में प्रिंट के लिए तैयार रहती है।</li>
                            <li>किसी भी समस्या या सर्वर एरर की स्थिति में अपने एडमिन से संपर्क करें।</li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* Admin Quick API Settings Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-600">settings</span>
                                <h3 className="font-black text-slate-800 dark:text-white text-base">
                                    Farmer PDF Server 2 API Settings
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAdminModal(false)}
                                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {settingMsg && (
                            <div className={`p-3 rounded-xl text-xs font-bold ${
                                settingMsg.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {settingMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleSaveAdminSettings} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                    Endpoint URL
                                </label>
                                <input
                                    type="url"
                                    value={adminApiUrl}
                                    onChange={(e) => setAdminApiUrl(e.target.value)}
                                    placeholder="https://good-api-point.com/apis_partner/v1/farmer_card_api/farmer_pdf_server2.php"
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                    API Key (Good-API-Point)
                                </label>
                                <input
                                    type="text"
                                    value={adminApiKey}
                                    onChange={(e) => setAdminApiKey(e.target.value)}
                                    placeholder="Enter API Key"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-md hover:bg-emerald-700 disabled:opacity-50"
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
