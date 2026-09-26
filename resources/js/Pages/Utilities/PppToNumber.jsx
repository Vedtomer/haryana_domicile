import React, { useState, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function PppToNumber({ service, isAdmin, portalUrl = 'https://ppp-office.haryana.gov.in/', apiUrl: initApiUrl, apiKey: initApiKey }) {
    const { auth, currentService } = usePage().props;

    const [activeTab, setActiveTab]     = useState('search'); // 'search' or 'portal'
    const [familyId, setFamilyId]       = useState('');
    const [loading, setLoading]          = useState(false);
    const [result, setResult]            = useState(null);
    const [error, setError]              = useState('');
    const [copiedIndex, setCopiedIndex]  = useState(null);

    // Official portal iframe state
    const [iframeLoading, setIframeLoading] = useState(true);
    const [iframeKey, setIframeKey]         = useState(Date.now());
    const iframeRef                         = useRef(null);

    // Admin API settings
    const [apiUrl, setApiUrl]            = useState(initApiUrl || '');
    const [apiKey, setApiKey]            = useState(initApiKey || '');
    const [savingApi, setSavingApi]      = useState(false);
    const [apiMsg, setApiMsg]            = useState('');

    const coinCost = currentService?.coin_cost ?? service?.coin_cost ?? 0;
    const userCoins = auth?.user?.coins ?? 0;

    const handleSearch = async (e) => {
        e.preventDefault();
        const id = familyId.trim().toUpperCase();
        if (!id) {
            setError('Please enter a Family ID (PPP ID).');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await axios.post('/utilities/ppp-to-number/search', { family_id: id });
            if (res.data.success) {
                setResult(res.data);
            } else {
                setError(res.data.message || 'No data found for this PPP ID.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong while connecting to the server.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text, idx) => {
        if (!text) return;
        navigator.clipboard.writeText(text.replace(/\s+/g, '')).then(() => {
            setCopiedIndex(idx);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    const handleReloadIframe = () => {
        setIframeLoading(true);
        setIframeKey(Date.now());
    };

    const handleSaveApi = async (e) => {
        e.preventDefault();
        setSavingApi(true);
        setApiMsg('');
        try {
            const res = await axios.post('/utilities/ppp-to-number/update-api', { api_url: apiUrl, api_key: apiKey });
            setApiMsg(res.data.message || 'Saved successfully!');
        } catch {
            setApiMsg('Failed to save API settings.');
        } finally {
            setSavingApi(false);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Back to Dashboard"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight flex items-center gap-2">
                                <span>📱</span>
                                <span>PPP to Number</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                                Search mobile numbers by PPP ID & Haryana PPP Office Portal
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                        >
                            <span>Open PPP Office Portal</span>
                            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                        </a>
                        <a
                            href="https://ppp-office.haryana.gov.in/Family/UpdateMobileNo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                            <span>Update Mobile No.</span>
                            <span className="material-symbols-outlined text-[15px]">edit_square</span>
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="PPP to Number - Haryana Parivar Pehchan Patra" />

            <div className="max-w-6xl mx-auto py-6 px-3 sm:px-6 space-y-6">

                {/* Top Tabs */}
                <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('search')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                activeTab === 'search'
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">search</span>
                            <span>Search Mobile by PPP ID</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('portal')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                activeTab === 'portal'
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">language</span>
                            <span>Official Portal (ppp-office.haryana.gov.in)</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">🪙 {coinCost} Coins</span>
                        <span className="text-slate-300 dark:text-slate-600 text-xs">|</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Balance: <strong className="text-slate-800 dark:text-slate-200">{userCoins}</strong>
                        </span>
                    </div>
                </div>

                {/* TAB 1: Search by PPP ID */}
                {activeTab === 'search' && (
                    <div className="space-y-6">
                        {/* Search Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="p-6 sm:p-8">
                                <div className="max-w-xl mx-auto text-center">
                                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-4 mx-auto shadow-inner">
                                        <span className="material-symbols-outlined text-3xl">phone_android</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                                        PPP ID to Mobile Number Lookup
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-xs sm:text-sm">
                                        Enter Parivar Pehchan Patra (PPP / Family ID) to fetch registered mobile numbers for all family members.
                                    </p>

                                    <form onSubmit={handleSearch} className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                maxLength="12"
                                                value={familyId}
                                                onChange={(e) => setFamilyId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                                placeholder="Enter PPP / Family ID (e.g. 1ABC2345)"
                                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-xl font-black transition-all text-center text-slate-900 dark:text-white tracking-widest uppercase font-mono placeholder:font-sans placeholder:tracking-normal placeholder:text-base placeholder:text-slate-400"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || familyId.trim().length < 4}
                                            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="material-symbols-outlined text-xl animate-spin">autorenew</span>
                                                    <span>Searching Mobile Numbers...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-xl">search</span>
                                                    <span>Fetch Members Mobile ({coinCost} Coins)</span>
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {error && (
                                        <div className="mt-5 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3 text-left">
                                            <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                                            <div className="flex-1 text-xs sm:text-sm text-red-700 dark:text-red-300">
                                                <p className="font-semibold">{error}</p>
                                                <p className="mt-1 text-xs">
                                                    You can also update or verify mobile directly on the&nbsp;
                                                    <a
                                                        href="https://ppp-office.haryana.gov.in/Family/UpdateMobileNo"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-bold underline text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                                                    >
                                                        Official PPP Office Portal &rarr;
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Search Results */}
                        {result && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">Parivar Pehchan Patra (PPP)</span>
                                        <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-wider mt-0.5">
                                            {result.family_id}
                                        </h3>
                                        <p className="text-emerald-100 text-sm font-medium mt-1">
                                            Total Family Members: <span className="font-extrabold text-white text-base">{result.total_members}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => window.print()}
                                            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-xs border border-white/30 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-lg">print</span>
                                            <span>Print Slip</span>
                                        </button>
                                        <a
                                            href="https://ppp-office.haryana.gov.in/Family/UpdateMobileNo"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                            <span>Update in PPP</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Cards Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {result.members?.map((member, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-lg transition-all hover:border-emerald-400 dark:hover:border-emerald-600 flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                    <h4 className="font-black text-base sm:text-lg text-slate-800 dark:text-white leading-snug">
                                                        {member.name}
                                                    </h4>
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 shrink-0">
                                                        {member.relation || 'Member'}
                                                    </span>
                                                </div>

                                                <div className="space-y-2 py-2.5 border-y border-slate-100 dark:border-slate-800 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Gender / Age:</span>
                                                        <span className="font-bold text-slate-800 dark:text-white text-xs">
                                                            {member.gender || 'N/A'} {member.age ? `• ${member.age} Yrs` : ''}
                                                        </span>
                                                    </div>
                                                    {member.status && (
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Status:</span>
                                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{member.status}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Mobile Box */}
                                            <div className="mt-4 pt-2">
                                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                                    Linked Mobile Number
                                                </p>
                                                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <span className="font-mono text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 tracking-wider select-all">
                                                        {member.mobile || 'Not Available'}
                                                    </span>
                                                    {member.mobile && member.mobile !== 'Not Available' && (
                                                        <div className="flex items-center gap-1">
                                                            <a
                                                                href={`https://wa.me/91${member.mobile.replace(/\D/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 text-green-600 hover:text-green-700 dark:text-green-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                                title="WhatsApp Chat"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">chat</span>
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(member.mobile, idx)}
                                                                className="p-1.5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                                                title="Copy Mobile Number"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">
                                                                    {copiedIndex === idx ? 'check' : 'content_copy'}
                                                                </span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: Official Portal (ppp-office.haryana.gov.in) */}
                {activeTab === 'portal' && (
                    <div className="space-y-4">
                        {/* Information & Quick Links Banner */}
                        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <span className="text-3xl mt-0.5">🏛️</span>
                                <div>
                                    <h3 className="font-black text-slate-800 dark:text-white text-base">
                                        Haryana Parivar Pehchan Authority (HPPA) Office Portal
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs sm:text-sm leading-relaxed">
                                        Official Haryana Government Portal: <strong className="text-emerald-700 dark:text-emerald-400">https://ppp-office.haryana.gov.in/</strong>
                                        <br />
                                        Use this portal for Citizen Mobile Number Updates, Exclusion Grievances, and Data Sharing Services.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleReloadIframe}
                                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                                    <span>Reload</span>
                                </button>
                                <a
                                    href={portalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                    <span>Open Main Portal</span>
                                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                </a>
                                <a
                                    href="https://ppp-office.haryana.gov.in/Family/UpdateMobileNo"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                    <span>Direct Mobile Update</span>
                                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                </a>
                            </div>
                        </div>

                        {/* Embedded Portal Container */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col relative min-h-[80vh]">
                            {iframeLoading && (
                                <div className="absolute inset-0 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                                    <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Loading PPP Office Portal (ppp-office.haryana.gov.in)...
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        If government security blocks embedding, click &quot;Open Main Portal&quot; button above.
                                    </p>
                                </div>
                            )}

                            <iframe
                                key={iframeKey}
                                ref={iframeRef}
                                src={portalUrl}
                                className="w-full flex-grow border-0 min-h-[80vh]"
                                title="PPP Office Haryana"
                                onLoad={() => setIframeLoading(false)}
                                allow="camera; microphone; geolocation; clipboard-read; clipboard-write"
                            ></iframe>
                        </div>
                    </div>
                )}

                {/* Admin API Configuration */}
                {isAdmin && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 mt-8">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px]">settings</span>
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-white text-sm">Admin API Configuration (PPP to Number)</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Configure custom API URL for fetching PPP / Family ID mobile numbers if using a third-party gateway.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveApi} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                                    Custom API Endpoint URL
                                </label>
                                <input
                                    type="text"
                                    value={apiUrl}
                                    onChange={(e) => setApiUrl(e.target.value)}
                                    placeholder="https://api-provider.com/get-mobile?family_id={family_id}&key={key}"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-emerald-500 focus:outline-none font-mono text-slate-700 dark:text-slate-300"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Use <code>{'{family_id}'}</code> and <code>{'{key}'}</code> placeholders in the URL.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                                    API Key / Secret Token (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter Bearer Token or API Key"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-emerald-500 focus:outline-none font-mono text-slate-700 dark:text-slate-300"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={savingApi}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {savingApi ? 'Saving...' : 'Save API Settings'}
                                </button>
                                {apiMsg && (
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{apiMsg}</span>
                                )}
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
