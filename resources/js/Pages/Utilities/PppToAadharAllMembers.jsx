import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function PppToAadharAllMembers() {
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
            const response = await axios.post('/utilities/ppp-to-aadhar-all-members/search', {
                family_id: cleanId
            });

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'No family members found for this PPP ID.');
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
                        PPP ID to Aadhar Card (All Members)
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Fetch complete unmasked Aadhaar numbers of all family members without OTP
                    </p>
                </div>
            }
        >
            <Head title="PPP ID to Aadhaar All Members (Without OTP)" />

            <div className="max-w-5xl mx-auto mt-6 px-4">
                {/* Search Box */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                    <div className="p-8">
                        <div className="max-w-xl mx-auto text-center">
                            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-5 mx-auto shadow-inner">
                                <span className="material-symbols-outlined text-3xl">groups</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                                Family Members Aadhaar Lookup
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">
                                Enter the Family ID (PPP ID) to get full Aadhaar card numbers for all registered family members.
                            </p>

                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength="12"
                                        value={familyId}
                                        onChange={(e) => setFamilyId(e.target.value.toUpperCase())}
                                        placeholder="Enter PPP ID (e.g. 1ABC2345)"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xl font-black transition-all text-center dark:text-white tracking-widest uppercase font-mono placeholder:font-sans placeholder:tracking-normal placeholder:text-base placeholder:text-slate-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || familyId.trim().length < 5}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-base rounded-2xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Fetching All Members...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-xl">search</span>
                                            Fetch All Members Aadhaar
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
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Parivar Pehchan Patra</span>
                                <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-wider mt-0.5">
                                    {result.family_id}
                                </h3>
                                <p className="text-indigo-100 text-sm font-medium mt-1">
                                    Total Family Members: <span className="font-extrabold text-white text-base">{result.total_members}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-lg">print</span>
                                    Print Slip
                                </button>
                            </div>
                        </div>

                        {/* Members Grid / Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {result.members?.map((member, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all hover:border-indigo-400 dark:hover:border-indigo-600 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <div>
                                                <h4 className="font-black text-lg text-slate-800 dark:text-white leading-snug">
                                                    {member.name || member.memberName}
                                                </h4>
                                                {member.father_name && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                        S/O: {member.father_name}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                                                (member.relation || '').toLowerCase().includes('head')
                                                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                                    : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800'
                                            }`}>
                                                {member.relation || 'Member'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Gender / Age:</span>
                                                <span className="font-bold text-slate-800 dark:text-white">
                                                    {member.gender || 'N/A'} {member.age ? `• ${member.age} Yrs` : ''}
                                                </span>
                                            </div>
                                            {member.dob && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">DOB:</span>
                                                    <span className="font-bold text-slate-800 dark:text-white font-mono">{member.dob}</span>
                                                </div>
                                            )}
                                            {member.mobile && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Mobile:</span>
                                                    <span className="font-bold text-slate-800 dark:text-white font-mono">{member.mobile}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Aadhaar Box */}
                                    <div className="mt-4 pt-2">
                                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                            Aadhaar Card Number
                                        </p>
                                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <span className="font-mono text-base font-black text-indigo-700 dark:text-indigo-300 tracking-wider select-all">
                                                {member.aadhar_number || member.aadhaar || member.uid || 'Not Available'}
                                            </span>
                                            {(member.aadhar_number || member.aadhaar || member.uid) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(member.aadhar_number || member.aadhaar || member.uid, idx)}
                                                    className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                                    title="Copy Aadhaar"
                                                >
                                                    <span className="material-symbols-outlined text-lg">
                                                        {copiedIndex === idx ? 'check' : 'content_copy'}
                                                    </span>
                                                </button>
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
