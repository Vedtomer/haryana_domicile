import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharToInfo({ coinCost = 99 }) {
    const { auth } = usePage().props;
    const [aadhar, setAadhar] = useState('');
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState(null);
    const [error, setError] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [copiedAddressIndex, setCopiedAddressIndex] = useState(null);

    const handleCopy = (text, index, isAddress = false) => {
        if (!text || text === 'N/A') return;
        navigator.clipboard.writeText(text);
        if (isAddress) {
            setCopiedAddressIndex(index);
            setTimeout(() => setCopiedAddressIndex(null), 2000);
        } else {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        const cleanNo = aadhar.replace(/\D/g, '');
        if (cleanNo.length !== 12) {
            setError('Please enter a valid 12-digit Aadhaar Number.');
            return;
        }

        setLoading(true);
        setError(null);
        setRecords(null);

        try {
            const response = await axios.post('/utilities/aadhar-to-info/search', {
                aadhar: cleanNo
            });

            if (response.data.success) {
                setRecords(response.data.records);
            } else {
                setError(response.data.message || 'Details not found for this Aadhaar Number.');
            }
        } catch (err) {
            console.error('Error fetching details:', err);
            setError(err.response?.data?.message || 'An error occurred while fetching details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Format raw input with spaces: 1234 5678 9012
    const formatAadharInput = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 12);
        return digits;
    };

    const getOperatorColor = (circle = '') => {
        const c = circle.toUpperCase();
        if (c.includes('JIO')) return 'bg-blue-600 text-white';
        if (c.includes('AIRTEL')) return 'bg-red-600 text-white';
        if (c.includes('VI') || c.includes('VODA')) return 'bg-amber-600 text-white';
        if (c.includes('BSNL')) return 'bg-emerald-600 text-white';
        return 'bg-slate-700 text-white';
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        Aadhaar No. To Info
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Instant lookup of registered mobile numbers, telecom circle, father name & address
                    </p>
                </div>
            }
        >
            <Head title="Aadhaar No. To Info" />

            <div className="max-w-5xl mx-auto mt-6 px-4 sm:px-6 lg:px-8 pb-16">
                
                {/* Search Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                    <div className="p-8 md:p-10">
                        <div className="text-center max-w-2xl mx-auto mb-8">
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 text-indigo-600 dark:text-indigo-400 rounded-full mb-6 mx-auto shadow-inner">
                                <span className="material-symbols-outlined text-4xl">contact_phone</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
                                Find Info by Aadhaar Number
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-base leading-relaxed">
                                Enter the 12-digit Aadhaar number below to instantly retrieve all linked mobile numbers, telecom circles, father's name, and registered addresses.
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                                    Aadhaar Number
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors text-2xl">
                                            badge
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength="12"
                                        className="block w-full pl-14 pr-4 py-4 md:py-4.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold text-xl placeholder-slate-400 dark:placeholder-slate-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-center tracking-[0.25em]"
                                        placeholder="123456789012"
                                        value={aadhar}
                                        onChange={(e) => setAadhar(formatAadharInput(e.target.value))}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || aadhar.length !== 12}
                                className="mt-6 w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Fetching Aadhaar Info...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold">search</span>
                                        Find Info ({coinCost} Coins)
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 max-w-xl mx-auto bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">error</span>
                                <p className="text-red-700 dark:text-red-300 font-medium text-sm">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sm:px-10">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                            Live Telecom & UID Gateway
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                            <span>🪙</span>
                            <span>{coinCost} Coins Per Lookup</span>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {records && records.length > 0 && (
                    <div className="space-y-6 transform animate-in fade-in zoom-in duration-300">
                        
                        {/* Summary Top Card */}
                        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-800/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-blue-700/50">
                                <div>
                                    <span className="text-xs uppercase tracking-widest text-blue-300 font-bold">
                                        Primary Cardholder
                                    </span>
                                    <h3 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
                                        {records[0]?.name || 'N/A'}
                                    </h3>
                                    <p className="text-blue-200 text-sm mt-1 flex items-center gap-2">
                                        <span>Father / Guardian:</span>
                                        <strong className="text-white">{records[0]?.fname || 'N/A'}</strong>
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                                        <div className="text-[11px] text-blue-200 uppercase font-semibold">Aadhaar No.</div>
                                        <div className="text-lg font-mono font-bold tracking-wider">{records[0]?.aadhar || aadhar}</div>
                                    </div>
                                    <div className="bg-emerald-500/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-400/30 text-emerald-300 flex items-center gap-2 font-bold">
                                        <span className="material-symbols-outlined text-xl">sim_card</span>
                                        <span>{records.length} {records.length === 1 ? 'Record' : 'Records'} Found</span>
                                    </div>
                                </div>
                            </div>

                            {/* Print / Save button row */}
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-sm"
                                >
                                    <span className="material-symbols-outlined text-sm">print</span>
                                    Print / Save Record
                                </button>
                            </div>
                        </div>

                        {/* Record Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {records.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between relative group"
                                >
                                    <div>
                                        {/* Card Header */}
                                        <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-black text-sm flex items-center justify-center">
                                                    #{idx + 1}
                                                </span>
                                                <div>
                                                    <div className="text-xs text-slate-400 font-semibold uppercase">Subscriber</div>
                                                    <div className="font-bold text-slate-800 dark:text-white text-base">
                                                        {item.name}
                                                    </div>
                                                </div>
                                            </div>
                                            {item.circle && item.circle !== 'N/A' && (
                                                <span className={`text-[11px] font-bold px-3 py-1 rounded-full shadow-xs uppercase tracking-wide ${getOperatorColor(item.circle)}`}>
                                                    {item.circle}
                                                </span>
                                            )}
                                        </div>

                                        {/* Mobile Number Box */}
                                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 mb-4 border border-slate-100 dark:border-slate-700/50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                        Primary Mobile Number
                                                    </span>
                                                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-wider mt-0.5 font-mono">
                                                        {item.num}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {item.num && item.num !== 'N/A' && (
                                                        <a
                                                            href={`https://wa.me/91${item.num.replace(/\D/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white transition shadow-sm"
                                                            title="WhatsApp"
                                                        >
                                                            <span className="material-symbols-outlined text-lg leading-none">chat</span>
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleCopy(item.num, idx, false)}
                                                        className={`p-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                                                            copiedIndex === idx
                                                                ? 'bg-green-600 text-white'
                                                                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                                                        }`}
                                                        title="Copy Mobile Number"
                                                    >
                                                        <span className="material-symbols-outlined text-lg leading-none">
                                                            {copiedIndex === idx ? 'done' : 'content_copy'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Alternate Number if available */}
                                            {item.alt && (
                                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                                                    <span className="text-slate-500 font-medium">Alternate Mobile:</span>
                                                    <strong className="text-slate-800 dark:text-slate-200 font-mono text-sm">{item.alt}</strong>
                                                </div>
                                            )}

                                            {/* Email if available */}
                                            {item.email && (
                                                <div className="mt-2 text-xs flex items-center justify-between">
                                                    <span className="text-slate-500 font-medium">Email:</span>
                                                    <strong className="text-blue-600 dark:text-blue-400 font-mono truncate max-w-[200px]">{item.email}</strong>
                                                </div>
                                            )}
                                        </div>

                                        {/* Father Name */}
                                        <div className="mb-3 px-1 text-sm flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">Father / Guardian:</span>
                                            <strong className="text-slate-800 dark:text-slate-200">{item.fname}</strong>
                                        </div>

                                        {/* Registered Address */}
                                        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                                                        <span className="material-symbols-outlined text-[13px]">location_on</span>
                                                        Registered Address
                                                    </span>
                                                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                                        {item.address}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(item.address, idx, true)}
                                                    className={`p-1.5 rounded-lg text-xs transition ${
                                                        copiedAddressIndex === idx
                                                            ? 'text-green-600 bg-green-50'
                                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                                                    }`}
                                                    title="Copy Address"
                                                >
                                                    <span className="material-symbols-outlined text-base">
                                                        {copiedAddressIndex === idx ? 'done' : 'content_copy'}
                                                    </span>
                                                </button>
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
