import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharToMaskPan() {
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
            const response = await axios.post('/utilities/aadhar-to-mask-pan/search', { aadhar });
            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'PAN not found for this Aadhar number.');
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
                        Aadhar To Pan Mask
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Find masked PAN card linked to an Aadhar number
                    </p>
                </div>
            }
        >
            <Head title="Aadhar To Pan Mask" />

            <div className="max-w-xl mx-auto mt-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-orange-50 text-orange-600 rounded-full mb-6 mx-auto">
                            <span className="material-symbols-outlined text-3xl">credit_card</span>
                        </div>
                        <h2 className="text-2xl font-black text-center text-slate-800 dark:text-white mb-2 tracking-tight">
                            Find Masked PAN
                        </h2>
                        <p className="text-center text-slate-500 mb-8 font-medium">
                            Enter a 12-digit Aadhar number to get the linked masked PAN card number.
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
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-lg tracking-widest font-bold transition-all text-center dark:text-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || aadhar.length !== 12}
                                className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-lg rounded-xl shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
                                        Find Masked PAN (19 Coins)
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
                            <div className="mt-8 transform animate-in fade-in zoom-in duration-300">
                                <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-800/50 rounded-2xl text-center">
                                    <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-xs font-black uppercase tracking-widest rounded-full mb-4">
                                        PAN Found
                                    </span>
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <span className="material-symbols-outlined text-orange-500 text-4xl">credit_card</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Masked PAN Number</p>
                                    <div className="text-4xl font-black text-orange-700 dark:text-orange-400 tracking-widest select-all mb-4">
                                        {result.pan}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                                        {result.message}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-200 dark:border-slate-800 text-center flex items-center justify-between px-8">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                            Live instant lookup
                        </p>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                            <span className="material-symbols-outlined text-[16px]">monetization_on</span>
                            19 Coins
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
