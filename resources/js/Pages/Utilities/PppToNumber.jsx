import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function PppToNumber({ service, isAdmin, apiUrl: initApiUrl, apiKey: initApiKey }) {
    const { auth, currentService } = usePage().props;

    const [familyId, setFamilyId]       = useState('');
    const [loading, setLoading]          = useState(false);
    const [result, setResult]            = useState(null);
    const [error, setError]              = useState('');
    const [copiedIndex, setCopiedIndex]  = useState(null);

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
                                Search mobile numbers by Parivar Pehchan Patra (PPP ID)
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="PPP to Number - Haryana Parivar Pehchan Patra" />

            <div className="max-w-6xl mx-auto py-6 px-3 sm:px-6 space-y-6">

                {/* Top Bar with Coin Cost & Balance */}
                <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-[20px]">badge</span>
                        <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                            Search Mobile by PPP ID
                        </span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">🪙 {coinCost} Coins</span>
                        <span className="text-slate-300 dark:text-slate-600 text-xs">|</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Balance: <strong className="text-slate-800 dark:text-slate-200">{userCoins}</strong>
                        </span>
                    </div>
                </div>

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
                                            value={familyId}
                                            onChange={(e) => setFamilyId(e.target.value.toUpperCase())}
                                            placeholder="Enter Family ID (e.g. 5ABC1234)"
                                            maxLength={12}
                                            className="w-full px-5 py-3.5 text-center text-lg sm:text-xl font-mono font-bold tracking-widest bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:text-sm placeholder:tracking-normal"
                                            disabled={loading}
                                            autoFocus
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !familyId.trim()}
                                        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Searching Family Details...</span>
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

            </div>
        </AdminLayout>
    );
}
