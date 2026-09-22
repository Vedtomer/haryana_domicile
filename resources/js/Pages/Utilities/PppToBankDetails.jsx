import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function PppToBankDetails() {
    const [familyId, setFamilyId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedAccountIndex, setCopiedAccountIndex] = useState(null);
    const [copiedIfscIndex, setCopiedIfscIndex] = useState(null);

    const handleCopy = (text, type, index) => {
        if (!text) return;
        navigator.clipboard.writeText(text.replace(/\s+/g, ''));
        if (type === 'account') {
            setCopiedAccountIndex(index);
            setTimeout(() => setCopiedAccountIndex(null), 2000);
        } else {
            setCopiedIfscIndex(index);
            setTimeout(() => setCopiedIfscIndex(null), 2000);
        }
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
            const response = await axios.post('/utilities/ppp-to-bank-details/search', {
                family_id: cleanId
            });

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'No bank records found for this PPP ID.');
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
                        PPP ID to Bank Account &amp; IFSC Code
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Fetch linked Bank Account Numbers and IFSC Codes of all family members without OTP
                    </p>
                </div>
            }
        >
            <Head title="PPP ID to Bank Account & IFSC Code" />

            <div className="max-w-5xl mx-auto mt-6 px-4">
                {/* Search Box */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                    <div className="p-8">
                        <div className="max-w-xl mx-auto text-center">
                            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-600 dark:text-amber-400 rounded-2xl mb-5 mx-auto shadow-inner">
                                <span className="material-symbols-outlined text-3xl">account_balance</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                                Family Bank Account Lookup
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">
                                Enter the Family ID (PPP ID) to fetch Bank Account Numbers, IFSC codes, and DBT linking status for all family members.
                            </p>

                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength="12"
                                        value={familyId}
                                        onChange={(e) => setFamilyId(e.target.value.toUpperCase())}
                                        placeholder="Enter PPP ID (e.g. 1ABC2345)"
                                        className="w-full px-5 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-xl font-black transition-all text-center text-slate-900 tracking-widest uppercase font-mono placeholder:font-sans placeholder:tracking-normal placeholder:text-base placeholder:text-slate-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || familyId.trim().length < 5}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Searching Bank Details...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-xl">search</span>
                                            Fetch Bank &amp; IFSC Details
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
                        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-amber-200">Parivar Pehchan Patra</span>
                                <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-wider mt-0.5">
                                    {result.family_id}
                                </h3>
                                <p className="text-amber-100 text-sm font-medium mt-1">
                                    Total Accounts Listed: <span className="font-extrabold text-white text-base">{result.total_members}</span>
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

                        {/* Accounts Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {result.members?.map((member, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all hover:border-amber-400 dark:hover:border-amber-600 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h4 className="font-black text-lg text-slate-800 dark:text-white leading-snug">
                                                {member.name || member.memberName}
                                            </h4>
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-800 shrink-0">
                                                {member.relation || 'Member'}
                                            </span>
                                        </div>

                                        {/* Bank & Branch Name */}
                                        <div className="mb-3">
                                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                                                {member.bank_name || member.bank || 'Bank Name Not Specified'}
                                            </p>
                                            {member.branch && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    Branch: {member.branch}
                                                </p>
                                            )}
                                        </div>

                                        {member.status && (
                                            <div className="mb-3">
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                                                    <span className="material-symbols-outlined text-[13px]">verified</span>
                                                    {member.status}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Account & IFSC boxes */}
                                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                                Account Number
                                            </p>
                                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <span className="font-mono text-sm sm:text-base font-black text-slate-900 dark:text-white select-all">
                                                    {member.account_number || member.account_no || 'Not Available'}
                                                </span>
                                                {member.account_number && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(member.account_number, 'account', idx)}
                                                        className="p-1 text-slate-500 hover:text-amber-600 dark:text-slate-400 rounded-md transition-colors cursor-pointer"
                                                        title="Copy Account Number"
                                                    >
                                                        <span className="material-symbols-outlined text-base">
                                                            {copiedAccountIndex === idx ? 'check' : 'content_copy'}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                                IFSC Code
                                            </p>
                                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <span className="font-mono text-sm sm:text-base font-black text-amber-700 dark:text-amber-400 tracking-wider select-all">
                                                    {member.ifsc_code || member.ifsc || 'Not Available'}
                                                </span>
                                                {member.ifsc_code && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(member.ifsc_code, 'ifsc', idx)}
                                                        className="p-1 text-slate-500 hover:text-amber-600 dark:text-slate-400 rounded-md transition-colors cursor-pointer"
                                                        title="Copy IFSC Code"
                                                    >
                                                        <span className="material-symbols-outlined text-base">
                                                            {copiedIfscIndex === idx ? 'check' : 'content_copy'}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
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
