import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function PppToMobileAllMembers() {
    const [familyId, setFamilyId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleCopy = (text, index) => {
        if (!text) return;
        navigator.clipboard.writeText(text.replace(/\s+/g, ''));
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const cleanId = familyId.trim().toUpperCase();
        if (cleanId.length < 5) {
            setError('Please enter a valid PPP ID / Family ID.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/ppp-to-mobile-all-members/search', {
                family_id: cleanId
            });

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'No members found for this PPP ID.');
            }
        } catch (err) {
            console.error('Error fetching details:', err);
            setError(err.response?.data?.message || 'An error occurred while fetching details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        PPP ID to Mobile Number (All Members)
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Fetch registered mobile numbers of all family members without OTP
                    </p>
                </div>
            }
        >
            <Head title="PPP ID to Mobile Number All Members" />

            <div className="max-w-5xl mx-auto mt-6 px-4">
                {/* Search Box */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                    <div className="p-8">
                        <div className="max-w-xl mx-auto text-center">
                            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-5 mx-auto shadow-inner">
                                <span className="material-symbols-outlined text-3xl">phone_android</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                                Family Mobile Numbers Lookup
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">
                                Enter the Family ID (PPP ID) to fetch active registered mobile numbers for all family members instantly.
                            </p>

                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength="12"
                                        value={familyId}
                                        onChange={(e) => setFamilyId(e.target.value.toUpperCase())}
                                        placeholder="Enter PPP ID (e.g. 1ABC2345)"
                                        className="w-full px-5 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-xl font-black transition-all text-center text-slate-900 tracking-widest uppercase font-mono placeholder:font-sans placeholder:tracking-normal placeholder:text-base placeholder:text-slate-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || familyId.trim().length < 5}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Searching Mobile Numbers...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-xl">search</span>
                                            Fetch All Members Mobile
                                        </>
                                    )}
                                </button>
                            </form>

                            {error && (
                                <div className="mt-5 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3 text-left">
                                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">error</span>
                                    <p className="text-red-700 dark:text-red-300 font-medium text-sm">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {result && (
                    <div className="space-y-6 mb-12 animate-fade-in-up">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">Parivar Pehchan Patra</span>
                                <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-wider mt-0.5">
                                    {result.family_id}
                                </h3>
                                <p className="text-emerald-100 text-sm font-medium mt-1">
                                    Total Family Members: <span className="font-extrabold text-white text-base">{result.total_members}</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">print</span>
                                Print Slip
                            </button>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {result.members?.map((member, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all hover:border-emerald-400 dark:hover:border-emerald-600 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <h4 className="font-black text-lg text-slate-800 dark:text-white leading-snug">
                                                {member.name || member.memberName}
                                            </h4>
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 shrink-0">
                                                {member.relation || 'Member'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 py-2.5 border-y border-slate-100 dark:border-slate-800 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Gender / Age:</span>
                                                <span className="font-bold text-slate-800 dark:text-white">
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
                                            <span className="font-mono text-lg font-black text-emerald-700 dark:text-emerald-400 tracking-wider select-all">
                                                {member.mobile || 'Not Available'}
                                            </span>
                                            {member.mobile && member.mobile !== 'Not Available' && (
                                                <div className="flex items-center gap-1">
                                                    <a
                                                        href={`https://wa.me/91${member.mobile.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-green-600 hover:text-green-700 dark:text-green-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                        title="WhatsApp"
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
        </AdminLayout>
    );
}
