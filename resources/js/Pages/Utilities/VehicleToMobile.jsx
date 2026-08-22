import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function VehicleToMobile() {
    const { auth } = usePage().props;
    const [vehicleNo, setVehicleNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!vehicleNo || vehicleNo.length < 4) {
            setError('Please enter a valid Vehicle Number');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/vehicle-to-mobile/search', {
                vehicle_number: vehicleNo
            });

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'Details not found');
            }
        } catch (err) {
            console.error('Error fetching details:', err);
            setError('Failed to fetch details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        Vehicle to Mobile Number
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Instant lookup of mobile number associated with a vehicle
                    </p>
                </div>
            }
        >
            <Head title="Vehicle to Mobile Number" />

            <div className="max-w-4xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                    <div className="p-8 md:p-10">
                        <div className="text-center max-w-2xl mx-auto mb-10">
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 text-indigo-600 dark:text-indigo-400 rounded-full mb-6 mx-auto shadow-inner">
                                <span className="material-symbols-outlined text-4xl">directions_car</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
                                Find Vehicle Details
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
                                Enter the vehicle registration number below to instantly fetch the associated mobile number and chassis details.
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors text-xl">
                                        pin
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-14 pr-4 py-4 md:py-5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-medium text-lg placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-blue-500 dark:focus:border-blue-500 transition-all shadow-sm"
                                    placeholder="Enter Vehicle Number (e.g. HR06AV0611)"
                                    value={vehicleNo}
                                    onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-6 w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Fetching Details...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">search</span>
                                        Search Details
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 max-w-xl mx-auto bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">error</span>
                                <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Results Section */}
                        {result && (
                            <div className="mt-10 animate-fade-in-up">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800/30 rounded-3xl p-6 md:p-8">
                                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-green-200/50 dark:border-green-800/50">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                                                Details Found!
                                            </h3>
                                            <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                                                Information retrieved successfully
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white/60 dark:bg-slate-900/40 rounded-2xl p-5 border border-green-100 dark:border-green-800/20">
                                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                                                <span className="material-symbols-outlined text-sm">phone_iphone</span>
                                                <span className="text-sm font-bold uppercase tracking-wider">Mobile Number</span>
                                            </div>
                                            <div className="text-2xl font-black text-slate-800 dark:text-white font-mono bg-green-100/50 dark:bg-green-900/20 p-3 rounded-xl inline-block border border-green-200 dark:border-green-800/30 select-all">
                                                {result.mobile}
                                            </div>
                                        </div>
                                        <div className="bg-white/60 dark:bg-slate-900/40 rounded-2xl p-5 border border-green-100 dark:border-green-800/20">
                                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                                                <span className="material-symbols-outlined text-sm">settings</span>
                                                <span className="text-sm font-bold uppercase tracking-wider">Chassis Last 5</span>
                                            </div>
                                            <div className="text-2xl font-black text-slate-800 dark:text-white font-mono bg-green-100/50 dark:bg-green-900/20 p-3 rounded-xl inline-block border border-green-200 dark:border-green-800/30 select-all">
                                                {result.chassis}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
