import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function RationSleepPhoto() {
    const {
        service,
        coinCost = 49,
        isAdmin = false,
        apiUrl: propApiUrl = '',
        apiKey: propApiKey = '',
        currentService,
        auth,
    } = usePage().props;

    const [rationNo, setRationNo] = useState('');
    const [cardType, setCardType] = useState('R'); // R = Rural / Rashan, U = Urban
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
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/ration_card_api/bihar_ration_slip.php');
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
            const resp = await axios.post('/utilities/ration-sleep-photo/update-api', {
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

    const triggerDownload = (dataObj, cleanRation) => {
        if (!dataObj) return;

        const directUrl = dataObj.pdf_url || dataObj.file_url || dataObj.photo_url || dataObj.image_url || dataObj.slip_url || dataObj.download_url;
        if (directUrl) {
            window.open(directUrl, '_blank');
            return;
        }

        // PDF base64
        let pdfData = dataObj.pdf_base64 || dataObj.pdf;
        if (pdfData) {
            if (pdfData.startsWith('http://') || pdfData.startsWith('https://')) {
                window.open(pdfData, '_blank');
                return;
            }
            if (!pdfData.startsWith('data:application/pdf;base64,')) {
                pdfData = 'data:application/pdf;base64,' + pdfData;
            }
            const link = document.createElement('a');
            link.href = pdfData;
            link.download = dataObj.filename || `Ration_Slip_${cleanRation}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        // Image base64
        let imgData = dataObj.image_base64 || dataObj.photo_base64 || dataObj.photo || dataObj.image;
        if (imgData) {
            if (imgData.startsWith('http://') || imgData.startsWith('https://')) {
                window.open(imgData, '_blank');
                return;
            }
            if (!imgData.startsWith('data:image/')) {
                imgData = 'data:image/jpeg;base64,' + imgData;
            }
            const link = document.createElement('a');
            link.href = imgData;
            link.download = dataObj.filename || `Ration_Slip_${cleanRation}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const cleanRation = rationNo.trim();

        if (!cleanRation || cleanRation.length < 5) {
            setError('कृपया वैध राशन कार्ड नंबर दर्ज करें (Please enter a valid Ration Card Number).');
            return;
        }

        const resolvedType = isCustomType ? customType.trim().toUpperCase() : cardType;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const resp = await axios.post('/utilities/ration-sleep-photo/search', {
                ration: cleanRation,
                type: resolvedType || 'R',
            });

            if (resp.data.success) {
                setResult(resp.data);
                triggerDownload(resp.data, cleanRation);
            } else {
                setError(resp.data.message || 'राशन पर्ची फोटो विवरण नहीं मिला। कृपया नंबर जांचें।');
            }
        } catch (err) {
            const serverMsg = err.response?.data?.message;
            setError(serverMsg || 'सर्वर से संपर्क करने में त्रुटि हुई। कृपया कुछ समय बाद पुनः प्रयास करें।');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setRationNo('');
        setResult(null);
        setError(null);
    };

    const handlePrint = () => {
        window.print();
    };

    // Determine preview source
    const pdfSrc = result?.pdf_base64
        ? (result.pdf_base64.startsWith('data:application/pdf;base64,') ? result.pdf_base64 : `data:application/pdf;base64,${result.pdf_base64}`)
        : (result?.pdf_url || null);

    const imageSrc = result?.image_base64
        ? result.image_base64
        : (result?.photo_base64
            ? (result.photo_base64.startsWith('data:image/') ? result.photo_base64 : `data:image/jpeg;base64,${result.photo_base64}`)
            : (result?.photo_url || result?.image_url || null));

    return (
        <AdminLayout>
            <Head title="Ration Sleep Photo | Ration Slip With Photo Download" />

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {/* Header Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-blue-100 border border-white/20">
                                <span>🌾 RATION CARD SLIP & PHOTO</span>
                                <span>•</span>
                                <span>INSTANT ACCESS</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                Ration Sleep Photo
                            </h1>
                            <p className="text-blue-100 text-sm sm:text-base max-w-xl">
                                राशन कार्ड नंबर दर्ज करके राशन पर्ची / स्लिप फोटो सहित तुरंत निकालें और PDF/Image डाउनलोड करें।
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
                                    <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Service Charge</div>
                                    <div className="text-lg font-black text-white">{displayCoinCost} Coins</div>
                                </div>
                            </div>

                            {isUserAdmin && (
                                <button
                                    onClick={() => setShowAdminModal(true)}
                                    type="button"
                                    className="px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition border border-white/30 flex items-center gap-2 shadow"
                                    title="API URL & Key Configuration"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>API Config</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                    <form onSubmit={handleSearch} className="space-y-6">
                        {/* Ration Number Input */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                                राशन कार्ड नंबर (Ration Card Number) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-600 dark:text-blue-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={rationNo}
                                    onChange={(e) => {
                                        setRationNo(e.target.value.trim());
                                        if (error) setError(null);
                                    }}
                                    placeholder="Enter Ration Card Number (e.g. 101001234567)"
                                    className="w-full pl-12 pr-10 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-mono text-lg font-bold tracking-wider placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                />
                                {rationNo && (
                                    <button
                                        type="button"
                                        onClick={() => setRationNo('')}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                राशन कार्ड का वैध नंबर दर्ज करें (उदाहरण: 10 से 24 अंकों का राशन नंबर)।
                            </p>
                        </div>

                        {/* Type / Area Selection */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-gray-900 dark:text-gray-100">
                                    प्रकार / क्षेत्र (Type / Area)
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsCustomType(!isCustomType)}
                                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                                >
                                    {isCustomType ? '← प्रीसेट विकल्प चुनें' : 'कस्टम टाइप दर्ज करें'}
                                </button>
                            </div>

                            {!isCustomType ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCardType('R')}
                                        className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                                            cardType === 'R'
                                                ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                                                : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        <div>
                                            <div className="font-extrabold text-sm">R (Rural / ग्रामीण)</div>
                                            <div className="text-[11px] text-gray-500 dark:text-gray-400">Default Ration Slip</div>
                                        </div>
                                        {cardType === 'R' && (
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setCardType('U')}
                                        className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                                            cardType === 'U'
                                                ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                                                : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        <div>
                                            <div className="font-extrabold text-sm">U (Urban / शहरी)</div>
                                            <div className="text-[11px] text-gray-500 dark:text-gray-400">Urban Ration Slip</div>
                                        </div>
                                        {cardType === 'U' && (
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="text"
                                        value={customType}
                                        onChange={(e) => setCustomType(e.target.value)}
                                        placeholder="Enter type parameter (e.g. R, U)"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-bold uppercase placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                    />
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
                                className="w-full sm:flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition transform active:scale-[0.99]"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        <span>राशन पर्ची खोजी जा रही है...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        <span>Ration Slip Photo प्राप्त करें ({displayCoinCost} Coins)</span>
                                    </>
                                )}
                            </button>

                            {(rationNo || result) && (
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
                        {/* Status Banner */}
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200">
                                        Ration Slip Photo Found Successfully!
                                    </h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-400">
                                        Ration No: <span className="font-mono font-bold">{rationNo}</span> | Type: <span className="font-bold">{result.type || cardType}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => triggerDownload(result, rationNo)}
                                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 transition flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span>Download Slip</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm transition flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    <span>Print</span>
                                </button>
                            </div>
                        </div>

                        {/* Image Preview if Photo is returned */}
                        {imageSrc && (
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Ration Slip Photo Preview (राशन पर्ची फोटो)
                                    </h4>
                                    <span className="text-xs text-gray-400">High Resolution</span>
                                </div>
                                <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-auto">
                                    <img
                                        src={imageSrc}
                                        alt={`Ration Slip for ${rationNo}`}
                                        className="max-w-full h-auto rounded-lg shadow-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {/* PDF Preview if PDF is returned */}
                        {pdfSrc && (
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Ration Slip Document Preview
                                    </h4>
                                    <span className="text-xs text-gray-400">PDF Reader</span>
                                </div>
                                <div className="w-full h-[650px] bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <iframe
                                        src={pdfSrc}
                                        title="Ration Slip PDF Preview"
                                        className="w-full h-full border-0"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Additional JSON Details if returned */}
                        {result?.data && typeof result.data === 'object' && Object.keys(result.data).length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                    राशन कार्ड अतिरिक्त विवरण (Additional Record Details)
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(result.data)
                                        .filter(([k]) => !['pdf', 'pdf_base64', 'base64', 'photo', 'image', 'photo_base64', 'image_base64'].includes(k))
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

                {/* Helpful Guide */}
                <div className="bg-gray-50 dark:bg-gray-800/40 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700/60 space-y-4">
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        आवश्यक दिशा-निर्देश (Instructions & Notes)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-300">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-1.5">
                            <div className="font-bold text-gray-900 dark:text-gray-100">1. सही राशन कार्ड नंबर</div>
                            <p>ग्राहक का पूरा एवं सही राशन कार्ड नंबर दर्ज करें।</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-1.5">
                            <div className="font-bold text-gray-900 dark:text-gray-100">2. क्षेत्र / प्रकार (Type)</div>
                            <p>डिफ़ॉल्ट रूप से <span className="font-mono font-bold">R</span> (Rural / ग्रामीण) चुना रहता है। शहरी कार्ड के लिए <span className="font-mono font-bold">U</span> चुन सकते हैं।</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-1.5">
                            <div className="font-bold text-gray-900 dark:text-gray-100">3. फोटो सहित पर्ची डाउनलोड</div>
                            <p>सर्च सफल होने पर पर्ची फोटो या PDF फॉर्मेट में तुरंत स्क्रीन पर दिखेगी जिसे आप डाउनलोड या सीधे प्रिंट कर सकते हैं।</p>
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
                                    Ration Sleep Photo API Settings
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Good-API-Point Bihar Ration Slip API Endpoint
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
                                    placeholder="https://good-api-point.com/apis_partner/v1/ration_card_api/bihar_ration_slip.php"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
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
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
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
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow disabled:opacity-50"
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
