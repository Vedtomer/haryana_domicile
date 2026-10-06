import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function VehicleToMobile() {
    const {
        auth,
        service,
        currentService,
        coinCost = 20,
        isAdmin = false,
        apiUrl: propApiUrl = '',
        apiKey: propApiKey = '',
    } = usePage().props;

    const [vehicleNo, setVehicleNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const displayCoinCost = service?.coin_cost ?? currentService?.coin_cost ?? coinCost ?? 20;
    const isUserAdmin = auth?.user?.is_admin || auth?.user?.type === 'super_admin' || auth?.user?.type === 'admin' || isAdmin;

    // Admin Quick Settings Modal
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://api.paanel.shop/api/gateway.php');
    const [adminApiKey, setAdminApiKey] = useState(propApiKey || 'SamXverma');
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingMsg, setSettingMsg] = useState(null);

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveAdminSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingMsg(null);
        try {
            const resp = await axios.post('/utilities/vehicle-to-mobile/update-api', {
                api_url: adminApiUrl,
                api_key: adminApiKey,
            });
            if (resp.data.success) {
                setSettingMsg({ type: 'success', text: resp.data.message || 'API settings saved successfully!' });
                setTimeout(() => setShowAdminModal(false), 1500);
            } else {
                setSettingMsg({ type: 'error', text: resp.data.message || 'Failed to save settings.' });
            }
        } catch (err) {
            setSettingMsg({ type: 'error', text: err.response?.data?.message || 'Error updating API settings.' });
        } finally {
            setSavingSettings(false);
        }
    };

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
            setError(err.response?.data?.message || 'Failed to fetch details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                                Vehicle to Mobile Number
                            </h1>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                {displayCoinCost} Coins
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Instant lookup of mobile number associated with a vehicle
                        </p>
                    </div>

                    {isUserAdmin && (
                        <button
                            type="button"
                            onClick={() => setShowAdminModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 shadow-sm transition"
                        >
                            <span className="material-symbols-outlined text-[16px]">tune</span>
                            API Config (Admin)
                        </button>
                    )}
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
                                Find Mobile Number
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
                                    className="block w-full pl-14 pr-4 py-4 md:py-5 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 font-medium text-lg placeholder-slate-400 focus:ring-0 focus:border-blue-500 transition-all shadow-sm uppercase"
                                    placeholder="Enter Vehicle Number (e.g. HR06BB2029)"
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
                                        Finding Mobile Number...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">search</span>
                                        Find Mobile Number ({displayCoinCost} Coins)
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
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        <div className="bg-white/70 dark:bg-slate-900/50 rounded-2xl p-5 border border-green-100 dark:border-green-800/30 shadow-xs">
                                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                                                <span className="material-symbols-outlined text-base">directions_car</span>
                                                <span className="text-xs font-bold uppercase tracking-wider">Vehicle Number</span>
                                            </div>
                                            <div className="text-xl font-black text-slate-800 dark:text-white font-mono bg-green-100/50 dark:bg-green-900/20 px-3 py-2.5 rounded-xl block border border-green-200 dark:border-green-800/30 select-all truncate">
                                                {result.reg_no || vehicleNo}
                                            </div>
                                        </div>

                                        <div className="bg-white/70 dark:bg-slate-900/50 rounded-2xl p-5 border border-green-100 dark:border-green-800/30 shadow-xs">
                                            <div className="flex items-center justify-between gap-2 text-green-700 dark:text-green-400 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-base">phone_iphone</span>
                                                    <span className="text-xs font-bold uppercase tracking-wider">Mobile Number</span>
                                                </div>
                                                {result.mobile && result.mobile !== 'Not Available' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(result.mobile)}
                                                        className="text-xs font-bold px-2 py-0.5 rounded-md bg-green-200 dark:bg-green-800/60 text-green-800 dark:text-green-200 hover:bg-green-300 transition-colors cursor-pointer"
                                                        title="Copy Mobile Number"
                                                    >
                                                        {copied ? 'Copied!' : 'Copy'}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="text-xl font-black text-slate-800 dark:text-white font-mono bg-green-100/50 dark:bg-green-900/20 px-3 py-2.5 rounded-xl block border border-green-200 dark:border-green-800/30 select-all truncate">
                                                {result.mobile}
                                            </div>
                                        </div>

                                        <div className="bg-white/70 dark:bg-slate-900/50 rounded-2xl p-5 border border-green-100 dark:border-green-800/30 shadow-xs">
                                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                                                <span className="material-symbols-outlined text-base">settings</span>
                                                <span className="text-xs font-bold uppercase tracking-wider">Chassis Last 5</span>
                                            </div>
                                            <div className="text-xl font-black text-slate-800 dark:text-white font-mono bg-green-100/50 dark:bg-green-900/20 px-3 py-2.5 rounded-xl block border border-green-200 dark:border-green-800/30 select-all truncate">
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

            {/* Admin Quick API Settings Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">tune</span>
                                Vehicle to Mobile API Settings
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowAdminModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveAdminSettings} className="mt-4 space-y-4">
                            {settingMsg && (
                                <div className={`p-3 rounded-xl text-xs font-bold ${
                                    settingMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                    {settingMsg.text}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                    Gateway Endpoint URL
                                </label>
                                <input
                                    type="url"
                                    value={adminApiUrl}
                                    onChange={(e) => setAdminApiUrl(e.target.value)}
                                    placeholder="https://api.paanel.shop/api/gateway.php"
                                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Default: https://api.paanel.shop/api/gateway.php
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                    API Key
                                </label>
                                <input
                                    type="text"
                                    value={adminApiKey}
                                    onChange={(e) => setAdminApiKey(e.target.value)}
                                    placeholder="SamXverma"
                                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Active Key: SamXverma
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50"
                                >
                                    {savingSettings ? 'Saving...' : 'Save API Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
