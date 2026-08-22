import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharToFamilyId() {
    const { auth } = usePage().props;
    const [aadhar, setAadhar] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (aadhar.length !== 12) {
            setError('Please enter a valid 12-digit Aadhar Number.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/aadhar-to-family-id/search', { aadhar });
            if (response.data.success) {
                setResult(response.data.family_id);
            } else {
                setError(response.data.message || 'Family ID not found for this Aadhar number.');
            }
        } catch (err) {
            setError('An error occurred while fetching the details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        Aadhar to Family ID Search
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Instantly retrieve Family ID using Aadhar Number
                    </p>
                </div>
            }
        >
            <Head title="Aadhar to Family ID" />

            <div className="max-w-xl mx-auto mt-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-6 mx-auto">
                            <span className="material-symbols-outlined text-3xl">badge</span>
                        </div>
                        <h2 className="text-2xl font-black text-center text-slate-800 dark:text-white mb-2 tracking-tight">
                            Find Family ID
                        </h2>
                        <p className="text-center text-slate-500 mb-8 font-medium">
                            Enter a 12-digit Aadhar number to fetch the associated Family ID instantly.
                        </p>

                        <form onSubmit={handleSearch} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                    Aadhar Number
                                </label>
                                <input
                                    type="text"
                                    maxLength="12"
                                    value={aadhar}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                                        setAadhar(val);
                                    }}
                                    placeholder="e.g. 123456789012"
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-lg tracking-widest font-bold transition-all text-center dark:text-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || aadhar.length !== 12}
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
                                        Find Family ID
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
                            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800/50 rounded-2xl text-center transform animate-in fade-in zoom-in duration-300">
                                <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-black uppercase tracking-widest rounded-full mb-3">
                                    Result Found
                                </span>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Family ID (PPP ID)</p>
                                <div className="text-4xl font-black text-green-700 dark:text-green-400 tracking-tight select-all">
                                    {result}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                            Live instant lookup via official portal
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
