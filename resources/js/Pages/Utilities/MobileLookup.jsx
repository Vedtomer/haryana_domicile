import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function MobileLookup() {
    const { auth } = usePage().props;
    const [number, setNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (number.length < 10) {
            setError('Please enter a valid mobile number.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/mobile-to-details/search', { number });
            if (response.data.success) {
                setResult(response.data.details);
            } else {
                setError(response.data.message || 'Details not found for this number.');
            }
        } catch (err) {
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
                        Mobile Number to Details
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Instantly retrieve owner details from mobile number
                    </p>
                </div>
            }
        >
            <Head title="Mobile to Details" />

            <div className="max-w-xl mx-auto mt-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-6 mx-auto">
                            <span className="material-symbols-outlined text-3xl">contact_phone</span>
                        </div>
                        <h2 className="text-2xl font-black text-center text-slate-800 dark:text-white mb-2 tracking-tight">
                            Find Number Details
                        </h2>
                        <p className="text-center text-slate-500 mb-8 font-medium">
                            Enter a 10-digit mobile number to fetch the associated details instantly.
                        </p>

                        <form onSubmit={handleSearch} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                    Mobile Number
                                </label>
                                <input
                                    type="text"
                                    maxLength="15"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value.replace(/[^0-9+]/g, ''))}
                                    placeholder="e.g. 9876543210"
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-lg tracking-widest font-bold transition-all text-center dark:text-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || number.length < 10}
                                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold">search</span>
                                        Find Details
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">error</span>
                                <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                            </div>
                        )}

                        {result && (
                            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl transform animate-in fade-in duration-300">
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">Result</h3>
                                <pre className="whitespace-pre-wrap text-sm font-medium text-slate-800 dark:text-slate-200 font-mono">
                                    {result}
                                </pre>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-200 dark:border-slate-800 text-center flex items-center justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            Live lookup via Telegram Bot
                        </p>
                        <p className="text-sm font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                            🪙 10 Coins
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
