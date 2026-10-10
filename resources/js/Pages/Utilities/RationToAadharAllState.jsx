import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

const INDIAN_STATES = [
    { code: '09', name: 'Uttar Pradesh (उत्तर प्रदेश)' },
    { code: '20', name: 'Jharkhand (झारखंड)' },
    { code: '21', name: 'Odisha (ओडिशा)' },
    { code: '22', name: 'Chhattisgarh (छत्तीसगढ़)' },
    { code: '10', name: 'Bihar (बिहार)' },
    { code: '06', name: 'Haryana (हरियाणा)' },
    { code: '08', name: 'Rajasthan (राजस्थान)' },
    { code: '23', name: 'Madhya Pradesh (मध्य प्रदेश)' },
    { code: '27', name: 'Maharashtra (महाराष्ट्र)' },
    { code: '24', name: 'Gujarat (गुजरात)' },
    { code: '19', name: 'West Bengal (पश्चिम बंगाल)' },
    { code: '07', name: 'Delhi (दिल्ली)' },
    { code: '03', name: 'Punjab (पंजाब)' },
    { code: '05', name: 'Uttarakhand (उत्तराखंड)' },
    { code: '02', name: 'Himachal Pradesh (हिमाचल प्रदेश)' },
    { code: '01', name: 'Jammu & Kashmir (जम्मू एवं कश्मीर)' },
    { code: '36', name: 'Telangana (तेलंगाना)' },
    { code: '28', name: 'Andhra Pradesh (आंध्र प्रदेश)' },
    { code: '29', name: 'Karnataka (कर्नाटक)' },
    { code: '32', name: 'Kerala (केरल)' },
    { code: '33', name: 'Tamil Nadu (तमिलनाडु)' },
    { code: '18', name: 'Assam (असम)' },
    { code: '04', name: 'Chandigarh (चंडीगढ़)' },
    { code: '11', name: 'Sikkim (सिक्किम)' },
    { code: '12', name: 'Arunachal Pradesh (अरुणाचल प्रदेश)' },
    { code: '13', name: 'Nagaland (नागालैंड)' },
    { code: '14', name: 'Manipur (मणिपुर)' },
    { code: '15', name: 'Mizoram (मिजोरम)' },
    { code: '16', name: 'Tripura (त्रिपुरा)' },
    { code: '17', name: 'Meghalaya (मेघालय)' },
    { code: '30', name: 'Goa (गोवा)' },
    { code: '34', name: 'Puducherry (पुडुचेरी)' },
    { code: '35', name: 'Andaman & Nicobar (अंडमान निकोबार)' },
    { code: '37', name: 'Ladakh (लद्दाख)' },
];

export default function RationToAadharAllState() {
    const { service, coinCost = 119, isAdmin = false, apiUrl: propApiUrl = '', apiKey: propApiKey = '' } = usePage().props;
    const { auth } = usePage().props;

    const [rationNo, setRationNo] = useState('');
    const [stateCode, setStateCode] = useState('09'); // Default to UP or first working state
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [copiedAll, setCopiedAll] = useState(false);
    const [showRaw, setShowRaw] = useState(false);

    const displayCoinCost = service?.coin_cost ?? coinCost ?? 119;

    // Admin Settings State
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_to_uid_all.php');
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

        if (!stateCode) {
            setError('Please select a State / State Code.');
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
            const response = await axios.post('/utilities/ration-to-aadhar-all-state/search', {
                ration_no: clean,
                statecode: stateCode,
            });

            if (response.data.success) {
                setResult(response.data);
                if (!auth?.user?.is_admin && !isAdmin && auth?.user) {
                    auth.user.coins -= displayCoinCost;
                }
            } else {
                setError(response.data.message || 'Ration card Aadhaar details not found for this state.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'An error occurred while connecting to the Ration Aadhaar service.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, idx) => {
        if (!text || text === 'N/A') return;
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const copyAllDetails = () => {
        if (!result || !result.members) return;

        let str = `Ration Card: ${result.ration_no}\nState Code: ${result.statecode}\nHead: ${result.head_name}\n\nMEMBERS LIST:\n`;
        result.members.forEach((m, i) => {
            str += `${i + 1}. Name: ${m.name} | UID: ${m.uid} | Relation: ${m.relation} | Gender: ${m.gender}\n`;
        });

        navigator.clipboard.writeText(str);
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
            const res = await axios.post('/utilities/ration-to-aadhar-all-state/update-api', {
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

    const selectedStateObj = INDIAN_STATES.find(s => s.code === stateCode);

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
                                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl sm:text-3xl">badge</span>
                                <span>Ration To Aadhaar Find All State</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                Find All Family Members' Aadhaar Number (UID) from Ration Card &bull; All State Supported
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-xs">
                            <span>🪙</span>
                            <span>{displayCoinCost} Coins / Search</span>
                        </span>

                    </div>
                </div>
            }
        >
            <Head title="Ration to Aadhaar Find All State - All Members UID Lookup" />

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #ration-all-state-print, #ration-all-state-print * {
                        visibility: visible;
                    }
                    #ration-all-state-print {
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
                                <span className="material-symbols-outlined">receipt_long</span>
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                    Ration to Aadhaar Number Search
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Select State and enter Ration Card Number to fetch all members' linked Aadhaar UID
                                </p>
                            </div>
                        </div>
                        <span className="text-xs px-2.5 py-1 font-bold rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                            Ration Card Services
                        </span>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* State Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                    Select State / राज्य चुनें <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={stateCode}
                                        onChange={(e) => setStateCode(e.target.value)}
                                        className="w-full px-4 py-3.5 sm:text-base font-semibold bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 rounded-2xl focus:border-amber-500 dark:focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all cursor-pointer"
                                        disabled={loading}
                                    >
                                        {INDIAN_STATES.map((st) => (
                                            <option key={st.code} value={st.code}>
                                                [{st.code}] {st.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Selected Code: <strong className="text-amber-600 dark:text-amber-400 font-mono">{stateCode}</strong>
                                </p>
                            </div>

                            {/* Ration Card Number */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                    Ration Card Number / राशन कार्ड संख्या <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={rationNo}
                                        onChange={(e) => setRationNo(e.target.value.toUpperCase())}
                                        placeholder="Enter Ration Card No. (e.g. 064000...)"
                                        className="w-full px-4 py-3.5 sm:text-base font-mono tracking-wider bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 rounded-2xl focus:border-amber-500 dark:focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold placeholder:text-slate-400"
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
                                    <span>Coins ({displayCoinCost} Coins) will only be charged when records are found.</span>
                                </p>
                            </div>
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
                            disabled={loading || !rationNo.trim() || !stateCode}
                            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white font-black text-sm tracking-wide shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                    <span>Fetching All Members' Aadhaar from State PDS Database...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">search</span>
                                    <span>Find Aadhaar Numbers ({displayCoinCost} Coins)</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                {result && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-amber-950/20 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 dark:border-amber-700/60 shadow-xl">
                            {/* Header Summary */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200 dark:border-amber-800/60 pb-5">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        <span>Ration Card UID Record Found</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                        Ration Card Number
                                    </p>
                                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-amber-900 dark:text-amber-300 mt-1">
                                        {result.ration_no}
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-semibold">
                                        State: <span className="font-bold text-amber-700 dark:text-amber-400">{selectedStateObj ? selectedStateObj.name : `Code ${result.statecode}`}</span>
                                        {result.head_name && result.head_name !== 'N/A' && (
                                            <> &bull; Head: <span className="font-bold">{result.head_name}</span></>
                                        )}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={copyAllDetails}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs tracking-wide shadow-md transition"
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {copiedAll ? 'check' : 'content_copy'}
                                        </span>
                                        <span>{copiedAll ? 'Copied All!' : 'Copy All Details'}</span>
                                    </button>

                                    <button
                                        onClick={handlePrint}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs tracking-wide shadow-md transition"
                                    >
                                        <span className="material-symbols-outlined text-sm">print</span>
                                        <span>Print Slip</span>
                                    </button>
                                </div>
                            </div>

                            {/* Family Members Table */}
                            {result.members && result.members.length > 0 ? (
                                <div className="mt-6">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-600 text-lg">group</span>
                                            <span>Family Members & Linked Aadhaar ({result.members.length})</span>
                                        </span>
                                        <span className="text-xs font-normal text-slate-500">
                                            Click copy icon to copy Aadhaar
                                        </span>
                                    </h3>

                                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                                <tr>
                                                    <th className="p-3 w-10 text-center">#</th>
                                                    <th className="p-3">Member Name (सदस्य का नाम)</th>
                                                    <th className="p-3">Aadhaar UID (आधार संख्या)</th>
                                                    <th className="p-3">Relationship</th>
                                                    <th className="p-3">Gender</th>
                                                    <th className="p-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {result.members.map((m, idx) => (
                                                    <tr key={idx} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                        <td className="p-3 text-center font-mono font-bold text-slate-400">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="p-3 font-black text-slate-900 dark:text-white">
                                                            {m.name || 'Member ' + (idx + 1)}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                                <span className="font-mono font-bold text-slate-900 dark:text-amber-300 tracking-wider">
                                                                    {m.uid || 'N/A'}
                                                                </span>
                                                                {m.uid && m.uid !== 'N/A' && (
                                                                    <button
                                                                        onClick={() => copyToClipboard(m.uid, idx)}
                                                                        className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
                                                                        title="Copy UID"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">
                                                                            {copiedIndex === idx ? 'check' : 'content_copy'}
                                                                        </span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                                                            {m.relation || 'Family'}
                                                        </td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300">
                                                            {m.gender || 'N/A'}
                                                        </td>
                                                        <td className="p-3">
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                <span>{m.status || 'Active'}</span>
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6 p-4 rounded-2xl bg-amber-100/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs">
                                    No individual member records could be extracted from the response. View raw details below.
                                </div>
                            )}

                            {/* View Raw Technical Payload */}
                            {result.raw_data && (
                                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => setShowRaw(!showRaw)}
                                        className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {showRaw ? 'expand_less' : 'expand_more'}
                                        </span>
                                        <span>{showRaw ? 'Hide' : 'View'} Raw API Technical Payload</span>
                                    </button>
                                    {showRaw && (
                                        <pre className="mt-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs overflow-x-auto border border-slate-200 dark:border-slate-800 font-mono">
                                            {JSON.stringify(result.raw_data, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Hidden Print Slip layout */}
                        <div id="ration-all-state-print" className="hidden print:block p-8 bg-white text-black font-sans">
                            <div className="border-4 border-amber-800 p-6 rounded-lg">
                                <div className="text-center border-b-2 border-amber-800 pb-4 mb-4">
                                    <h1 className="text-2xl font-black text-amber-900 uppercase">National Food Security Portal</h1>
                                    <h2 className="text-base font-bold text-slate-800">राशन कार्ड सदस्य आधार सत्यापन पर्ची</h2>
                                    <p className="text-xs text-slate-600 mt-1">Government of India / State PDS Food & Supplies Department</p>
                                </div>

                                <div className="bg-amber-50 border border-amber-300 p-4 rounded-md mb-4 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs text-amber-800 font-bold uppercase">Ration Card Number / राशन कार्ड संख्या</div>
                                        <div className="text-2xl font-black font-mono tracking-wider text-amber-900">{result.ration_no}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-800">State: {selectedStateObj ? selectedStateObj.name : result.statecode}</div>
                                        <div className="text-xs text-emerald-700 font-bold">Status: VERIFIED</div>
                                    </div>
                                </div>

                                {result.members && result.members.length > 0 && (
                                    <table className="w-full border-collapse border border-slate-300 text-xs mb-4">
                                        <thead>
                                            <tr className="bg-slate-100">
                                                <th className="border border-slate-300 p-2">#</th>
                                                <th className="border border-slate-300 p-2 text-left">Member Name</th>
                                                <th className="border border-slate-300 p-2 text-left">Aadhaar UID</th>
                                                <th className="border border-slate-300 p-2 text-left">Relationship</th>
                                                <th className="border border-slate-300 p-2 text-left">Gender</th>
                                                <th className="border border-slate-300 p-2 text-left">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.members.map((m, i) => (
                                                <tr key={i}>
                                                    <td className="border border-slate-300 p-2 text-center">{i + 1}</td>
                                                    <td className="border border-slate-300 p-2 font-bold">{m.name}</td>
                                                    <td className="border border-slate-300 p-2 font-mono font-bold">{m.uid}</td>
                                                    <td className="border border-slate-300 p-2">{m.relation}</td>
                                                    <td className="border border-slate-300 p-2">{m.gender}</td>
                                                    <td className="border border-slate-300 p-2 text-emerald-700 font-semibold">{m.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                <div className="text-[10px] text-slate-500 border-t border-slate-300 pt-2 flex justify-between items-center">
                                    <div>Generated On: {new Date().toLocaleString()}</div>
                                    <div>Official Electronic Verification Slip &bull; Valid across PDS Counters</div>
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
                                <span>Ration To Aadhaar All State API Config</span>
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
                                    Default: https://good-api-point.com/apis_partner/v1/ration_card_api/ration_to_uid_all.php
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
