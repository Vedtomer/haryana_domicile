import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

const InfoRow = ({ label, value, icon }) => {
    if (!value || value === 'N/A' || value === '') return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-500 text-[18px]">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white break-words">{value}</p>
            </div>
        </div>
    );
};

export default function PanDetails() {
    const [pan, setPan] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        const clean = pan.replace(/\s/g, '').toUpperCase();
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean)) {
            setError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).');
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await axios.post('/utilities/pan-details-instant/search', { pan: clean });
            if (response.data.success) {
                setResult(response.data.data);
            } else {
                setError(response.data.message || 'PAN details not found.');
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
                        Pan Details Server Instant
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Get complete PAN card details instantly
                    </p>
                </div>
            }
        >
            <Head title="PAN Details Server Instant" />

            <div className="max-w-xl mx-auto mt-8 space-y-6">
                {/* Input Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full mb-6 mx-auto">
                            <span className="material-symbols-outlined text-3xl">fingerprint</span>
                        </div>
                        <h2 className="text-2xl font-black text-center text-slate-800 dark:text-white mb-2 tracking-tight">
                            PAN Card Details
                        </h2>
                        <p className="text-center text-slate-500 mb-8 font-medium">
                            Enter a 10-character PAN number to get complete details instantly.
                        </p>

                        <form onSubmit={handleSearch} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                    PAN Number
                                </label>
                                <input
                                    type="text"
                                    maxLength="10"
                                    value={pan}
                                    onChange={(e) => {
                                        setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10));
                                    }}
                                    placeholder="e.g. ABCDE1234F"
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xl tracking-[0.3em] font-black transition-all text-center dark:text-white uppercase"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || pan.length !== 10}
                                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-lg rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Fetching Details...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold">manage_search</span>
                                        Get PAN Details (29 Coins)
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
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-8">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                            Live instant server lookup
                        </p>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                            <span className="material-symbols-outlined text-[16px]">monetization_on</span>
                            29 Coins
                        </div>
                    </div>
                </div>

                {/* Result Card */}
                {result && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-2xl">badge</span>
                            </div>
                            <div>
                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">PAN Details Found</p>
                                <p className="text-white font-black text-xl tracking-widest">{result.pan_number || result.pan || pan}</p>
                            </div>
                            <span className="ml-auto px-3 py-1 bg-green-400 text-green-900 text-xs font-black rounded-full uppercase">Active</span>
                        </div>
                        <div className="p-6 space-y-1">
                            <InfoRow label="Full Name"           value={result.name || result.full_name}             icon="person" />
                            <InfoRow label="Father's Name"       value={result.father_name || result.fathers_name}  icon="family_restroom" />
                            <InfoRow label="Date of Birth"       value={result.dob || result.date_of_birth}         icon="calendar_today" />
                            <InfoRow label="Gender"              value={result.gender}                               icon="wc" />
                            <InfoRow label="PAN Type"            value={result.pan_type || result.type}              icon="credit_card" />
                            <InfoRow label="Mobile Number"       value={result.mobile || result.phone}               icon="smartphone" />
                            <InfoRow label="Email"               value={result.email}                                icon="email" />
                            <InfoRow label="Address"             value={result.address}                              icon="home" />
                            <InfoRow label="City"                value={result.city}                                 icon="location_city" />
                            <InfoRow label="State"               value={result.state}                                icon="map" />
                            <InfoRow label="Pincode"             value={result.pincode || result.pin}                icon="pin_drop" />
                            <InfoRow label="Aadhaar Linked"      value={result.aadhar_linked || result.aadhaar_linked} icon="link" />
                            <InfoRow label="Status"              value={result.status}                               icon="verified" />
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
