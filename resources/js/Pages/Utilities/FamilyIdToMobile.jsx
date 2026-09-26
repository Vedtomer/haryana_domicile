import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function FamilyIdToMobile({ service, isAdmin, apiUrl: initApiUrl, apiKey: initApiKey }) {
    const { auth } = usePage().props;

    const [familyId, setFamilyId]     = useState('');
    const [loading, setLoading]        = useState(false);
    const [result, setResult]          = useState(null);
    const [error, setError]            = useState('');
    const [copiedIndex, setCopiedIndex]= useState(null);

    // Admin API settings
    const [apiUrl, setApiUrl]          = useState(initApiUrl || '');
    const [apiKey, setApiKey]          = useState(initApiKey || '');
    const [savingApi, setSavingApi]    = useState(false);
    const [apiMsg, setApiMsg]          = useState('');

    const coinCost = service?.coin_cost ?? 9;
    const userCoins = auth?.user?.coins ?? 0;

    const handleSearch = async (e) => {
        e.preventDefault();
        const id = familyId.trim().toUpperCase();
        if (!id) { setError('Please enter a Family ID.'); return; }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await axios.post('/utilities/family-id-to-mobile/search', { family_id: id });
            if (res.data.success) {
                setResult(res.data);
            } else {
                setError(res.data.message || 'No data found.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(idx);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    const handleSaveApi = async (e) => {
        e.preventDefault();
        setSavingApi(true);
        setApiMsg('');
        try {
            const res = await axios.post('/utilities/family-id-to-mobile/update-api', { api_url: apiUrl, api_key: apiKey });
            setApiMsg(res.data.message || 'Saved!');
        } catch {
            setApiMsg('Failed to save. Check your input.');
        } finally {
            setSavingApi(false);
        }
    };

    return (
        <AdminLayout>
            <Head title="Family ID to Mobile Number" />

            <div className="max-w-4xl mx-auto px-2 sm:px-0">

                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
                        <span className="text-3xl">🏠</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
                        Family ID → Mobile Number
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                        Mera Parivar (Haryana) portal se Family ID ke sabhi members ke mobile numbers nikalo
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-full">
                        <span className="text-amber-500 font-bold text-sm">🪙 {coinCost} Coins</span>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Your Balance: <strong className="text-slate-700 dark:text-slate-200">{userCoins}</strong>
                        </span>
                    </div>
                </div>

                {/* Search Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                Family ID (PPP ID)
                            </label>
                            <input
                                type="text"
                                value={familyId}
                                onChange={e => setFamilyId(e.target.value.toUpperCase())}
                                placeholder="e.g. 4FD5G8H2..."
                                maxLength={15}
                                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-teal-500 focus:outline-none text-lg font-bold font-mono tracking-widest text-teal-700 dark:text-teal-300 text-center placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:text-base transition-all"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading || !familyId.trim()}
                                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-black rounded-xl shadow-lg shadow-teal-500/30 transition-all transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined text-lg animate-spin">autorenew</span>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">search</span>
                                        Search
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                            <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                            <p className="text-red-700 dark:text-red-300 font-medium text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Results */}
                {result && (
                    <div className="space-y-5 mb-10">
                        {/* Summary Banner */}
                        <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-2xl p-5 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-teal-200">Family ID (PPP ID)</span>
                                <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-wider mt-1">
                                    {result.family_id}
                                </h3>
                                <p className="text-teal-100 text-sm font-medium mt-1">
                                    Total Members:&nbsp;
                                    <span className="font-extrabold text-white text-base">{result.total_members}</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">print</span>
                                Print
                            </button>
                        </div>

                        {/* Member Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {result.members?.map((member, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg hover:border-teal-400 dark:hover:border-teal-600 transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Name + Relation */}
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <h4 className="font-black text-base text-slate-800 dark:text-white leading-snug">
                                                {member.name}
                                            </h4>
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800 shrink-0">
                                                {member.relation}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-1.5 py-2.5 border-y border-slate-100 dark:border-slate-800 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Gender / Age</span>
                                                <span className="font-bold text-slate-800 dark:text-white text-xs">
                                                    {member.gender || 'N/A'}{member.age ? ` • ${member.age} yrs` : ''}
                                                </span>
                                            </div>
                                            {member.status && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Status</span>
                                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{member.status}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mobile Number */}
                                    <div className="mt-4">
                                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                                            Mobile Number
                                        </p>
                                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <span className={`font-mono text-lg font-black tracking-wider select-all ${member.mobile ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500 text-sm'}`}>
                                                {member.mobile || 'Not Linked'}
                                            </span>
                                            {member.mobile && (
                                                <div className="flex items-center gap-1">
                                                    <a
                                                        href={`https://wa.me/91${member.mobile.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-green-600 hover:text-green-700 dark:text-green-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                        title="WhatsApp"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">chat</span>
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(member.mobile, idx)}
                                                        className="p-1.5 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                                        title="Copy"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">
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

                {/* Admin API Settings */}
                {isAdmin && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">settings</span>
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-white text-sm">API Configuration</h3>
                                <p className="text-xs text-slate-500">Only admins can see this. Leave empty to use meraparivar.haryana.gov.in portal.</p>
                            </div>
                        </div>
                        <form onSubmit={handleSaveApi} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">API URL</label>
                                <input
                                    type="text"
                                    value={apiUrl}
                                    onChange={e => setApiUrl(e.target.value)}
                                    placeholder="https://yourapi.com/family-mobile?family_id={family_id}"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-blue-500 focus:outline-none font-mono text-slate-700 dark:text-slate-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">API Key (optional)</label>
                                <input
                                    type="text"
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                    placeholder="Bearer token or API key"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-blue-500 focus:outline-none font-mono text-slate-700 dark:text-slate-300"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={savingApi}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {savingApi ? 'Saving...' : 'Save Settings'}
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
