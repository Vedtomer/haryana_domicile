import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharToPan() {
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

        if (!auth.user.is_admin && auth.user.coins < 69) {
            setError('Insufficient coins. This service requires 69 coins.');
            return;
        }

        if (!confirm('This action will deduct 69 coins from your wallet. Do you want to proceed?')) {
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/aadhar-to-pan/search', { aadhar });
            if (response.data.success) {
                setResult(response.data.pan_number);
                
                // Update local auth coin state roughly if not admin
                if (!auth.user.is_admin) {
                    auth.user.coins -= 69;
                }
            } else {
                setError(response.data.message || 'PAN number not found for this Aadhar number.');
            }
        } catch (err) {
            setError('An error occurred while fetching the details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <Head title="Aadhar to PAN" />

            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Header section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-100 text-blue-700 mb-6 shadow-inner">
                        <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            credit_card
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                        Find Unmasked PAN
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">
                        Enter a 12-digit Aadhaar number to instantly fetch the associated Unmasked PAN.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-8 sm:p-12">
                        <form onSubmit={handleSearch} className="space-y-6">
                            
                            {error && (
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="aadhar" className="block text-sm font-bold text-slate-700 mb-2">
                                    Aadhaar Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400">badge</span>
                                    </div>
                                    <input
                                        type="text"
                                        id="aadhar"
                                        maxLength="12"
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-lg font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:ring-0 focus:border-blue-500 focus:bg-white transition-colors tracking-widest text-center"
                                        placeholder="e.g. 123456789012"
                                        value={aadhar}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                                            setAadhar(val);
                                        }}
                                        required
                                    />
                                </div>
                                <p className="mt-2 text-sm text-slate-500 font-medium">
                                    Enter the 12-digit number without spaces or dashes.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || aadhar.length !== 12}
                                className="w-full flex items-center justify-center gap-3 py-4 px-8 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">search</span>
                                        Find PAN (Cost: 69 Coins)
                                    </>
                                )}
                            </button>
                        </form>

                        {result && (
                            <div className="mt-10 p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl text-center transform animate-in fade-in zoom-in duration-300 shadow-sm">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-4">
                                    <span className="material-symbols-outlined text-[24px]">check_circle</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Unmasked PAN Number</h3>
                                <div className="text-5xl font-black text-green-700 tracking-tight select-all">
                                    {result}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-1">
                                <span className="material-symbols-outlined text-[20px]">info</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Live API Lookup</h4>
                                <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                                    The details are fetched instantly via live database lookup.
                                </p>
                            </div>
                        </div>
                        <div className="flex-shrink-0 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold text-sm shadow-inner border border-orange-200">
                            Balance: {auth.user.coins} Coins
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
