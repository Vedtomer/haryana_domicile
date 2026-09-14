import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharToPppId() {
    const [aadhar, setAadhar] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const cleanAadhar = aadhar.replace(/\D/g, '');
        if (cleanAadhar.length !== 12) {
            setError('Please enter a valid 12-digit Aadhaar Number.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/aadhar-to-ppp-id/search', {
                aadhar: cleanAadhar
            });

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'Family ID (PPP ID) not found for this Aadhaar Number.');
            }
        } catch (err) {
            console.error('Error fetching details:', err);
            setError(err.response?.data?.message || 'An error occurred while fetching the details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        Aadhar Card Number To PPP ID
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Instantly find Haryana Family ID (Parivar Pehchan Patra) using Aadhaar Number
                    </p>
                </div>
            }
        >
            <Head title="Aadhar Card to PPP ID Instant" />

            <div className="max-w-xl mx-auto mt-6 px-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-6 mx-auto shadow-inner">
                            <span className="material-symbols-outlined text-3xl">badge</span>
                        </div>
                        <h2 className="text-2xl font-black text-center text-slate-800 dark:text-white mb-2 tracking-tight">
                            Find PPP ID (Family ID)
                        </h2>
                        <p className="text-center text-slate-500 dark:text-slate-400 mb-8 font-medium text-sm">
                            Enter the 12-digit Aadhaar number to fetch the associated Family ID instantly without OTP.
                        </p>

                        <form onSubmit={handleSearch} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                    Aadhaar Card Number
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength="14"
                                        value={aadhar}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                                            // Format with spaces: 1234 5678 9012
                                            const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
                                            setAadhar(formatted);
                                        }}
                                        placeholder="1234 5678 9012"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xl tracking-widest font-black transition-all text-center dark:text-white placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || aadhar.replace(/\D/g, '').length !== 12}
                                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Searching PPP ID...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold text-xl">search</span>
                                        Find Family ID
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">error</span>
                                <p className="text-red-700 dark:text-red-300 font-medium text-sm">{error}</p>
                            </div>
                        )}

                        {result && (
                            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800/50 rounded-3xl text-center transform animate-in fade-in zoom-in duration-300">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-black uppercase tracking-widest rounded-full mb-3">
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    PPP ID Found
                                </div>

                                {result.member_name && (
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                                        Member: <span className="text-slate-900 dark:text-white font-extrabold">{result.member_name}</span>
                                    </p>
                                )}

                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Family ID (PPP ID)</p>
                                
                                <div className="text-3xl sm:text-4xl font-black text-green-700 dark:text-green-400 tracking-wider select-all font-mono py-2">
                                    {result.family_id}
                                </div>

                                <div className="mt-4 flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(result.family_id)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-base">
                                            {copied ? 'check' : 'content_copy'}
                                        </span>
                                        {copied ? 'Copied!' : 'Copy PPP ID'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-t border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                            Live instant lookup without OTP verification
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
