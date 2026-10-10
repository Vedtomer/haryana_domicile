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

const CARD_TYPES = [
    { id: 'card', label: 'Card (कार्ड)', desc: 'Standard Smart Card' },
    { id: 'pdf', label: 'PDF (पीडीएफ)', desc: 'Full Document PDF' },
    { id: 'pvc', label: 'PVC (पीवीसी)', desc: 'PVC Printable Format' },
    { id: 'slip', label: 'Slip (रसीद)', desc: 'Summary Acknowledgement' },
    { id: 'a4', label: 'A4 Page', desc: 'Standard A4 Sheet' },
];

export default function AadharToFarmerPdf() {
    const {
        service,
        coinCost = 49,
        isAdmin = false,
        apiUrl: propApiUrl = '',
        apiKey: propApiKey = '',
        currentService,
        auth,
    } = usePage().props;

    const [uid, setUid] = useState('');
    const [selectedState, setSelectedState] = useState('UP');
    const [customState, setCustomState] = useState('');
    const [isCustomState, setIsCustomState] = useState(false);

    const [cardType, setCardType] = useState('card');
    const [customType, setCustomType] = useState('');
    const [isCustomType, setIsCustomType] = useState(false);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedText, setCopiedText] = useState(null);

    const displayCoinCost = service?.coin_cost ?? currentService?.coin_cost ?? coinCost ?? 49;
    const isUserAdmin = auth?.user?.is_admin || auth?.user?.type === 'super_admin' || auth?.user?.type === 'admin' || isAdmin;

    // Admin Quick Settings Modal
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/farmer_card_api/farmer_card_pdf.php');
    const [adminApiKey, setAdminApiKey] = useState(propApiKey || '');
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingMsg, setSettingMsg] = useState(null);

    const formatUid = (val) => {
        const raw = val.replace(/\D/g, '').slice(0, 12);
        return raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    };

    const handleUidChange = (e) => {
        setUid(formatUid(e.target.value));
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
            const resp = await axios.post('/utilities/aadhar-to-farmer-all-state-pdf/update-api', {
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

    const triggerDownload = (dataObj, cleanUid, stateCode, resolvedType) => {
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

            const filename = dataObj.filename || `Farmer_Card_${stateCode || 'ALL'}_${cleanUid || 'DOWNLOAD'}_${resolvedType || 'card'}.pdf`;
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
        const cleanUid = uid.replace(/\D/g, '');

        if (cleanUid.length !== 12) {
            setError('कृपया 12 अंकों का वैध आधार नंबर (UID) दर्ज करें (Please enter 12-digit Aadhaar UID).');
            return;
        }

        const stateToSend = isCustomState ? customState.trim().toUpperCase() : selectedState;
        if (!stateToSend) {
            setError('कृपया राज्य चुनें या दर्ज करें (Please select or enter State).');
            return;
        }

        const typeToSend = isCustomType ? customType.trim().toLowerCase() : cardType;
        if (!typeToSend) {
            setError('कृपया कार्ड का प्रकार चुनें (Please select or enter Card Type).');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const resp = await axios.post('/utilities/aadhar-to-farmer-all-state-pdf/search', {
                uid: cleanUid,
                state: stateToSend,
                type: typeToSend,
            });

            if (resp.data.success) {
                setResult(resp.data);
                triggerDownload(resp.data, cleanUid, stateToSend, typeToSend);
            } else {
                setError(resp.data.message || 'किसान कार्ड PDF प्राप्त नहीं हो सका। कृपया विवरण पुनः जांचें।');
            }
        } catch (err) {
            const serverMsg = err.response?.data?.message;
            setError(serverMsg || 'सर्वर से संपर्क करने में त्रुटि हुई। कृपया कुछ समय बाद पुनः प्रयास करें।');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setUid('');
        setResult(null);
        setError(null);
    };

    const currentStateCode = isCustomState ? customState.trim().toUpperCase() : selectedState;
    const currentCardType = isCustomType ? customType.trim().toLowerCase() : cardType;

    const pdfSrc = result?.pdf_base64
        ? (result.pdf_base64.startsWith('data:application/pdf;base64,') ? result.pdf_base64 : `data:application/pdf;base64,${result.pdf_base64}`)
        : (result?.pdf_url || result?.file_url || null);

    return (
        <AdminLayout>
            <Head title="Aadhar To Farmer All State Pdf | Kisan Card PDF" />

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {/* Header Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-700 to-green-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/10">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-emerald-100 border border-white/20">
                                <span>🌾 ALL INDIA FARMER REGISTRATION</span>
                                <span>•</span>
                                <span>INSTANT PDF DOWNLOAD</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                Aadhar To Farmer All State Pdf
                            </h1>
                            <p className="text-emerald-100 text-sm sm:text-base max-w-xl">
                                आधार नंबर (UID), राज्य (State) और कार्ड टाइप (Type) से पूरे भारत का किसान कार्ड तुरंत खोजें और असली PDF डाउनलोड करें।
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 12H9v-2h2v2zm0-4H9V6h2v4z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">Service Charge</div>
                                    <div className="text-lg font-black text-white">{displayCoinCost} Coins</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                    <form onSubmit={handleSearch} className="space-y-6">
                        {/* Aadhaar Input */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                                आधार कार्ड नंबर (UID / Aadhaar Number) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={uid}
                                    onChange={handleUidChange}
                                    placeholder="1234 5678 9012"
                                    maxLength="14"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-mono text-lg font-bold tracking-wider placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                />
                                {uid && (
                                    <button
                                        type="button"
                                        onClick={() => setUid('')}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                कृपया 12 अंकों का वैध आधार कार्ड नंबर दर्ज करें।
                            </p>
                        </div>

                        {/* State Selection */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-gray-900 dark:text-gray-100">
                                    राज्य चुनें (Select State) <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsCustomState(!isCustomState)}
                                    className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                                >
                                    {isCustomState ? '← सूची से चुनें (Select from list)' : 'अन्य राज्य टाइप करें (Enter custom)'}
                                </button>
                            </div>

                            {!isCustomState ? (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <select
                                            value={selectedState}
                                            onChange={(e) => setSelectedState(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition appearance-none cursor-pointer"
                                        >
                                            {INDIAN_STATES.map((st) => (
                                                <option key={st.code} value={st.code} className="text-gray-900 bg-white">
                                                    {st.code} — {st.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Quick State Chips */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        <span className="text-xs font-semibold text-gray-500 mr-1">Quick Select:</span>
                                        {['UP', 'HR', 'PB', 'RJ', 'MP', 'BR', 'MH', 'GJ', 'UK', 'CG'].map((code) => (
                                            <button
                                                key={code}
                                                type="button"
                                                onClick={() => setSelectedState(code)}
                                                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                                                    selectedState === code
                                                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                                                        : 'bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                {code}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="text"
                                        value={customState}
                                        onChange={(e) => setCustomState(e.target.value.toUpperCase())}
                                        placeholder="e.g. UP, HR, PUNJAB, RAJASTHAN"
                                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-bold uppercase placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        राज्य का 2-अक्षर कोड या पूरा नाम दर्ज करें (State code or name).
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Card Type Selection */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-gray-900 dark:text-gray-100">
                                    कार्ड टाइप (Card Type) <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsCustomType(!isCustomType)}
                                    className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                                >
                                    {isCustomType ? '← प्रीसेट टाइप चुनें (Select preset)' : 'कस्टम टाइप टाइप करें (Enter custom type)'}
                                </button>
                            </div>

                            {!isCustomType ? (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                        {CARD_TYPES.map((t) => {
                                            const isSelected = cardType === t.id;
                                            return (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => setCardType(t.id)}
                                                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                                                        isSelected
                                                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="font-extrabold text-sm">{t.label}</span>
                                                        {isSelected && (
                                                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{t.desc}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="text"
                                        value={customType}
                                        onChange={(e) => setCustomType(e.target.value)}
                                        placeholder="e.g. card, pdf, pvc, slip, a4"
                                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        API के लिए कार्ड टाइप स्ट्रिंग दर्ज करें (e.g. card, pdf, pvc, slip).
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3 text-red-700 dark:text-red-300 animate-fadeIn">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm font-semibold">{error}</div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition transform active:scale-[0.99]"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        <span>किसान कार्ड PDF खोजी जा रही है...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        <span>Farmer Card PDF डाउनलोड करें ({displayCoinCost} Coins)</span>
                                    </>
                                )}
                            </button>

                            {(uid || result) && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="w-full sm:w-auto py-4 px-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Result Section */}
                {result && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Success Status Banner */}
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                                        Farmer Card PDF Fetched Successfully!
                                    </h3>
                                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                        UID: <span className="font-mono font-bold">{uid}</span> | State: <span className="font-bold">{currentStateCode}</span> | Type: <span className="font-bold uppercase">{currentCardType}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => triggerDownload(result, uid.replace(/\D/g, ''), currentStateCode, currentCardType)}
                                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span>Download PDF</span>
                                </button>

                                {pdfSrc && (
                                    <a
                                        href={pdfSrc}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm transition flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        <span>Open in New Tab</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* PDF In-browser Preview */}
                        {pdfSrc && (
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Farmer Card PDF Document Preview
                                    </h4>
                                    <span className="text-xs text-gray-400">PDF Reader</span>
                                </div>
                                <div className="w-full h-[650px] bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <iframe
                                        src={pdfSrc}
                                        title="Farmer Card PDF Preview"
                                        className="w-full h-full border-0"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Additional JSON Details if returned */}
                        {result?.data && typeof result.data === 'object' && Object.keys(result.data).length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                    Farmer Record Additional Details
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(result.data)
                                        .filter(([k]) => !['pdf', 'pdf_base64', 'base64'].includes(k))
                                        .map(([key, value]) => (
                                            <div key={key} className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700">
                                                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                                    {key.replace(/_/g, ' ')}
                                                </div>
                                                <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5 break-words">
                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Helpful Guide / FAQ */}
                <div className="bg-gray-50 dark:bg-gray-800/40 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700/60 space-y-4">
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        निर्देश एवं जानकारी (Instructions & Notes)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-300">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-1.5">
                            <div className="font-bold text-gray-900 dark:text-gray-100">1. सही आधार नंबर (UID)</div>
                            <p>ग्राहक का 12 अंकों का वैध आधार नंबर दर्ज करें। किसान पोर्टल पर इस आधार का पंजीकृत होना आवश्यक है।</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-1.5">
                            <div className="font-bold text-gray-900 dark:text-gray-100">2. राज्य चयन (State)</div>
                            <p>जिस राज्य का किसान कार्ड बना हुआ है, ड्रॉपडाउन सूची या त्वरित बटन से वही राज्य कोड (जैसे UP, HR, PB, RJ, MP) चुनें।</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-1.5">
                            <div className="font-bold text-gray-900 dark:text-gray-100">3. कार्ड टाइप (Card Type)</div>
                            <p>डिफ़ॉल्ट रूप से <span className="font-mono font-bold">card</span> या <span className="font-mono font-bold">pdf</span> चुनें। कस्टम फ़ॉर्मेट के लिए अन्य टाइप भी दर्ज किया जा सकता है।</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Quick API Config Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Farmer Card PDF API Settings
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Good-API-Point Aadhar To Farmer All State API Endpoint
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAdminModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {settingMsg && (
                            <div className={`p-3 rounded-xl text-xs font-semibold ${
                                settingMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {settingMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleSaveAdminSettings} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                                    API Endpoint URL
                                </label>
                                <input
                                    type="text"
                                    value={adminApiUrl}
                                    onChange={(e) => setAdminApiUrl(e.target.value)}
                                    placeholder="https://good-api-point.com/apis_partner/v1/farmer_card_api/farmer_card_pdf.php"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono font-medium text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                                    API Key (Good-API-Point)
                                </label>
                                <input
                                    type="text"
                                    value={adminApiKey}
                                    onChange={(e) => setAdminApiKey(e.target.value)}
                                    placeholder="Enter your API Key"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono font-medium text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow disabled:opacity-50"
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
