import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function IfscVerification({ service, coinCost = 9 }) {
    const { auth } = usePage().props;
    const [ifsc, setIfsc] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const isAdmin = auth?.user?.role === 'admin' || auth?.user?.role === 'super_admin';
    const effectiveCost = isAdmin ? 0 : coinCost;

    const handleVerify = async (e) => {
        e.preventDefault();

        const cleanIfsc = ifsc.trim().toUpperCase();
        if (!cleanIfsc || cleanIfsc.length !== 11) {
            setError('Please enter a valid 11-character IFSC code (e.g. HDFC0002707).');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/verify-ifsc-code/verify', {
                ifsc: cleanIfsc,
            });

            if (response.data.success) {
                setResult(response.data);
                // Update local auth coin count if returned
                if (typeof response.data.user_coins === 'number' && auth?.user) {
                    auth.user.coins = response.data.user_coins;
                }
            } else {
                setError(response.data.message || 'Details not found for this IFSC code.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to verify IFSC code. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight flex items-center gap-2">
                        <span>🏦</span> Verify IFSC Code
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Instant lookup of complete bank branch, address, MICR and supported payment modes
                    </p>
                </div>
            }
        >
            <Head title="Verify IFSC Code" />

            <div className="max-w-3xl mx-auto mt-6 px-4 sm:px-6 lg:px-8 pb-12">
                {/* Main Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl font-bold">
                                search
                            </span>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                Verify IFSC Code
                            </h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Enter IFSC code to get complete bank &amp; branch details.{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {effectiveCost > 0 ? `₹${effectiveCost} will be charged per verification.` : 'Free for Admin.'}
                            </span>
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                className="block w-full px-4 py-3.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-base uppercase tracking-wider placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
                                placeholder="HDFC0002707"
                                value={ifsc}
                                maxLength={11}
                                onChange={(e) => setIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                            />
                            {ifsc && (
                                <button
                                    type="button"
                                    onClick={() => setIfsc('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !ifsc}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-base shadow-sm hover:shadow transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shrink-0"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">search</span>
                                    <span>Verify ({effectiveCost > 0 ? `₹${effectiveCost}` : 'Free'})</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Error Banner */}
                    {error && (
                        <div className="mt-5 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">error</span>
                            <div className="flex-1 text-sm text-red-700 dark:text-red-300 font-medium">
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Verified Result Card */}
                    {result && result.data && (
                        <div className="mt-6 animate-fade-in-up">
                            {/* Green Valid Status Banner */}
                            <div className="bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm sm:text-base">
                                    <span className="material-symbols-outlined text-xl text-emerald-600 dark:text-emerald-400">
                                        check_circle
                                    </span>
                                    <span>Valid IFSC Code</span>
                                </div>
                                <div className="text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
                                    {result.coins_charged > 0 ? `₹${result.coins_charged} charged` : 'Free verification'}
                                </div>
                            </div>

                            {/* Details Table */}
                            <div className="mt-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
                                {/* IFSC Code */}
                                <div className="px-5 py-3.5 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between">
                                    <div className="flex items-center w-full">
                                        <span className="w-32 sm:w-40 text-sm text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                                            IFSC Code
                                        </span>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono tracking-wider text-base select-all">
                                            {result.data.ifsc}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(result.data.ifsc)}
                                        className="text-xs px-2.5 py-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors flex items-center gap-1 shrink-0 ml-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {copied ? 'check' : 'content_copy'}
                                        </span>
                                        <span>{copied ? 'Copied' : 'Copy'}</span>
                                    </button>
                                </div>

                                {/* Bank Name */}
                                <div className="px-5 py-3.5 flex items-center">
                                    <span className="w-32 sm:w-40 text-sm text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                                        Bank Name
                                    </span>
                                    <span className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">
                                        {result.data.bank_name}
                                    </span>
                                </div>

                                {/* Branch */}
                                <div className="px-5 py-3.5 flex items-center">
                                    <span className="w-32 sm:w-40 text-sm text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                                        Branch
                                    </span>
                                    <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm">
                                        {result.data.branch}
                                    </span>
                                </div>

                                {/* Address */}
                                <div className="px-5 py-3.5 flex items-start">
                                    <div className="w-32 sm:w-40 text-sm text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1.5 pt-0.5 font-medium">
                                        <span className="material-symbols-outlined text-base text-slate-400">
                                            location_on
                                        </span>
                                        <span>Address</span>
                                    </div>
                                    <span className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed select-all">
                                        {result.data.address}
                                    </span>
                                </div>

                                {/* State & District (2 cols) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
                                    <div className="px-5 py-3.5 flex items-center">
                                        <span className="w-28 sm:w-32 text-sm text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                                            State
                                        </span>
                                        <span className="text-slate-900 dark:text-white font-semibold text-sm">
                                            {result.data.state}
                                        </span>
                                    </div>
                                    <div className="px-5 py-3.5 flex items-center">
                                        <span className="w-28 sm:w-32 text-sm text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                                            District
                                        </span>
                                        <span className="text-slate-900 dark:text-white font-semibold text-sm">
                                            {result.data.district}
                                        </span>
                                    </div>
                                </div>

                                {/* City & MICR (2 cols) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
                                    <div className="px-5 py-3.5 flex items-center">
                                        <span className="w-28 sm:w-32 text-sm text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                                            City
                                        </span>
                                        <span className="text-slate-900 dark:text-white font-semibold text-sm">
                                            {result.data.city}
                                        </span>
                                    </div>
                                    <div className="px-5 py-3.5 flex items-center">
                                        <span className="w-28 sm:w-32 text-sm text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                                            MICR
                                        </span>
                                        <span className="text-slate-900 dark:text-white font-mono font-semibold text-sm select-all">
                                            {result.data.micr || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="px-5 py-3.5 flex items-center">
                                    <div className="w-32 sm:w-40 text-sm text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1.5 font-medium">
                                        <span className="material-symbols-outlined text-base text-slate-400">
                                            call
                                        </span>
                                        <span>Contact</span>
                                    </div>
                                    <span className="text-slate-900 dark:text-white font-mono font-medium text-sm select-all">
                                        {result.data.contact || 'Not Available'}
                                    </span>
                                </div>

                                {/* Payment Modes Footer */}
                                <div className="bg-slate-50/80 dark:bg-slate-800/50 px-5 py-3.5 flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    {[
                                        { label: 'UPI', active: result.data.upi },
                                        { label: 'IMPS', active: result.data.imps },
                                        { label: 'NEFT', active: result.data.neft },
                                        { label: 'RTGS', active: result.data.rtgs },
                                    ].map((mode) => (
                                        <div key={mode.label} className="flex items-center gap-1.5">
                                            <span className="text-xs sm:text-sm font-semibold">{mode.label}</span>
                                            {mode.active ? (
                                                <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                                    No
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
