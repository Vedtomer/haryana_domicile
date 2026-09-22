import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function MobileToInfo({ coinCost = 149 }) {
    const { auth } = usePage().props;
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState(null);
    const [error, setError] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [copiedAddressIndex, setCopiedAddressIndex] = useState(null);
    const [copiedAadharIndex, setCopiedAadharIndex] = useState(null);

    const handleCopy = (text, index, type = 'mobile') => {
        if (!text || text === 'N/A') return;
        navigator.clipboard.writeText(text);
        if (type === 'address') {
            setCopiedAddressIndex(index);
            setTimeout(() => setCopiedAddressIndex(null), 2000);
        } else if (type === 'aadhar') {
            setCopiedAadharIndex(index);
            setTimeout(() => setCopiedAadharIndex(null), 2000);
        } else {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }
    };

    const handleMobileChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
        setMobile(raw);
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        const cleanNo = mobile.replace(/\D/g, '');
        if (cleanNo.length !== 10) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        setLoading(true);
        setError(null);
        setRecords(null);

        try {
            const response = await axios.post('/utilities/mobile-to-info/search', {
                mobile: cleanNo
            });

            if (response.data.success) {
                setRecords(response.data.records);
            } else {
                setError(response.data.message || 'Details not found for this Mobile Number.');
            }
        } catch (err) {
            console.error('Error fetching details:', err);
            setError(err.response?.data?.message || 'An error occurred while fetching details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getCircleBadge = (circleStr = '') => {
        const str = circleStr.toUpperCase();
        if (str.includes('JIO')) return 'bg-blue-600 text-white';
        if (str.includes('AIRTEL')) return 'bg-red-600 text-white';
        if (str.includes('VI') || str.includes('VODA')) return 'bg-amber-600 text-white';
        if (str.includes('BSNL')) return 'bg-emerald-600 text-white';
        return 'bg-slate-700 text-white';
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">contact_phone</span>
                            Mobile to Info
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 font-medium">
                            Lookup subscriber name, father name, address, telecom circle &amp; linked details from mobile number
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700 shadow-xs">
                            <span>🪙</span>
                            <span>{coinCost} Coins Per Lookup</span>
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Mobile to Info - Subscriber & Address Lookup" />

            <div className="max-w-5xl mx-auto mt-6 px-4 sm:px-6 lg:px-8 pb-20">
                {/* Search Box Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                    <div className="p-8 sm:p-10">
                        <div className="text-center max-w-2xl mx-auto mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
                                <span className="material-symbols-outlined text-3xl">phone_iphone</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                Instant Mobile Subscriber Lookup
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                Enter any 10-digit Indian mobile number to retrieve verified telecom subscriber name, father name, registered address, circle, and alternate details.
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 text-center">
                                    Enter 10-Digit Mobile Number
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <span className="text-slate-400 font-bold text-lg">+91</span>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength="10"
                                        className="block w-full pl-16 pr-12 py-4 bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold text-2xl placeholder-slate-400 dark:placeholder-slate-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-center tracking-[0.2em] font-mono"
                                        placeholder="9876543210"
                                        value={mobile}
                                        onChange={handleMobileChange}
                                        autoFocus
                                    />
                                    {mobile.length === 10 && (
                                        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-emerald-500">
                                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-400 mt-2 px-1">
                                    <span>Standard 10-digit mobile number</span>
                                    <span className={mobile.length === 10 ? 'text-emerald-600 font-bold' : ''}>
                                        {mobile.length}/10 Digits
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || mobile.length !== 10}
                                className="mt-6 w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Searching Telecom Gateway...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold">search</span>
                                        Find Info &amp; Details ({coinCost} Coins)
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

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 px-6 sm:px-10 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Telecom Verification Gateway
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                            Instant Multi-SIM &amp; KYC Record Extraction
                        </div>
                    </div>
                </div>

                {/* Results View */}
                {records && records.length > 0 && (
                    <div className="space-y-6 transform animate-in fade-in zoom-in-95 duration-300">
                        {/* Summary Header Banner */}
                        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2 border border-emerald-500/30">
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    <span>Records Found: {records.length} {records.length === 1 ? 'Connection' : 'Connections'}</span>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                    {records[0]?.name || 'Subscriber Details'}
                                </h3>
                                <p className="text-blue-200 text-sm mt-1">
                                    Mobile: <span className="font-mono font-bold text-white tracking-wider">+91 {mobile}</span>
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm backdrop-blur-md transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-xl">print</span>
                                    Print Results
                                </button>
                            </div>
                        </div>

                        {/* Record Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {records.map((record, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-md relative space-y-4"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-8 h-8 rounded-full font-black text-xs flex items-center justify-center bg-blue-600 text-white">
                                                #{idx + 1}
                                            </span>
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    Subscriber Name
                                                </div>
                                                <div className="font-black text-slate-900 dark:text-white text-base">
                                                    {record.name}
                                                </div>
                                            </div>
                                        </div>
                                        {record.circle && record.circle !== 'N/A' && (
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${getCircleBadge(record.circle)}`}>
                                                {record.circle}
                                            </span>
                                        )}
                                    </div>

                                    {/* Mobile Number Box */}
                                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Registered Mobile
                                                </span>
                                                <div className="text-xl font-black text-slate-900 dark:text-white tracking-wider font-mono">
                                                    +91 {record.mobile}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {record.mobile && (
                                                    <a
                                                        href={`https://wa.me/91${record.mobile.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition shadow-sm"
                                                        title="Message on WhatsApp"
                                                    >
                                                        <span className="material-symbols-outlined text-base leading-none">chat</span>
                                                    </a>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(record.mobile, idx, 'mobile')}
                                                    className={`p-2 rounded-xl font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                                                        copiedIndex === idx
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                                                    }`}
                                                    title="Copy Mobile"
                                                >
                                                    <span className="material-symbols-outlined text-base leading-none">
                                                        {copiedIndex === idx ? 'done' : 'content_copy'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {record.alternate && (
                                            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                                                <span className="text-slate-500 font-medium">Alternate:</span>
                                                <strong className="text-slate-800 dark:text-slate-200 font-mono">
                                                    {record.alternate}
                                                </strong>
                                            </div>
                                        )}
                                    </div>

                                    {/* Father / Guardian */}
                                    <div className="px-1 text-xs flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Father / Guardian:</span>
                                        <strong className="text-slate-800 dark:text-slate-200">
                                            {record.father_name}
                                        </strong>
                                    </div>

                                    {/* Aadhaar if present */}
                                    {record.aadhar && (
                                        <div className="px-1 text-xs flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">badge</span>
                                                Aadhaar No:
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <strong className="text-emerald-900 dark:text-emerald-200 font-mono">
                                                    {record.aadhar}
                                                </strong>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(record.aadhar, idx, 'aadhar')}
                                                    className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 cursor-pointer"
                                                    title="Copy Aadhaar"
                                                >
                                                    <span className="material-symbols-outlined text-sm leading-none">
                                                        {copiedAadharIndex === idx ? 'done' : 'content_copy'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Email if present */}
                                    {record.email && (
                                        <div className="px-1 text-xs flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">Email:</span>
                                            <strong className="text-slate-800 dark:text-slate-200 font-mono">
                                                {record.email}
                                            </strong>
                                        </div>
                                    )}

                                    {/* Registered Address */}
                                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                                                    <span className="material-symbols-outlined text-xs">location_on</span>
                                                    Registered Address
                                                </span>
                                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                                    {record.address}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(record.address, idx, 'address')}
                                                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
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
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
