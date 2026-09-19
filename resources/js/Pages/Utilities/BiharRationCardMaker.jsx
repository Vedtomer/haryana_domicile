import React, { useState, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function BiharRationCardMaker({ service, coinCost = 99, userCoins: initialCoins = 0, isUnlocked: initialUnlocked = false, portalUrl = 'https://ar.smartpds.nic.in/login' }) {
    const { auth } = usePage().props;
    const [userCoins, setUserCoins] = useState(initialCoins || auth?.user?.coins || 0);
    const [isUnlocked, setIsUnlocked] = useState(initialUnlocked);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [iframeKey, setIframeKey] = useState(Date.now());
    const iframeRef = useRef(null);

    const handleUnlockAndOpen = async () => {
        if (userCoins < coinCost && !auth?.user?.is_admin) {
            setError(`Insufficient coins. You need at least ${coinCost} coins to access this service. Please recharge your wallet.`);
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const res = await axios.post('/utilities/bihar-ration-card-maker/deduct-coins');
            if (res.data.success) {
                setIsUnlocked(true);
                setUserCoins(res.data.remainingCoins);
                setSuccessMessage(res.data.message || 'Access granted successfully!');
                
                // Open portal in new window
                window.open(portalUrl, '_blank', 'noopener,noreferrer');
            } else {
                setError(res.data.message || 'Failed to deduct coins. Please try again.');
            }
        } catch (err) {
            console.error('Error unlocking portal:', err);
            setError(err.response?.data?.message || 'An error occurred while unlocking the portal.');
        } finally {
            setLoading(false);
        }
    };

    const handleDirectOpen = () => {
        window.open(portalUrl, '_blank', 'noopener,noreferrer');
    };

    const handleReloadIframe = () => {
        setIframeKey(Date.now());
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Back to Dashboard"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl sm:text-3xl">local_mall</span>
                                <span>Bihar Ration Card Maker</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5 font-medium">
                                Smart PDS Bihar &bull; RCMS Online Portal &bull; Apply, Search, Print & Download
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700 shadow-xs">
                            <span>🪙</span>
                            <span>{coinCost} Coins Per Access</span>
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Bihar Ration Card Maker - Smart PDS Bihar" />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Main Hero Card */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-indigo-900/40 relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black mb-4 border border-amber-500/30">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            <span>खाद्य एवं उपभोक्ता संरक्षण विभाग &bull; Government of Bihar</span>
                        </div>

                        <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
                            Smart PDS Bihar (RCMS Portal)
                        </h2>
                        
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                            Direct gateway to the official Bihar Public Distribution System (PDS) portal. Apply for new ration cards, search existing ration cards by Aadhaar / RC number, update family members, and print official Bihar Digital Ration Cards.
                        </p>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-400 shrink-0">error</span>
                                <p className="text-red-200 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-emerald-400 shrink-0">check_circle</span>
                                <p className="text-emerald-200 text-sm font-medium">{successMessage}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-4">
                            {!isUnlocked ? (
                                <button
                                    onClick={handleUnlockAndOpen}
                                    disabled={loading}
                                    className="px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Unlocking Portal...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-2xl font-bold">rocket_launch</span>
                                            Access Portal & Make Card ({coinCost} Coins)
                                        </>
                                    )}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleDirectOpen}
                                        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2.5 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-2xl">open_in_new</span>
                                        Open Smart PDS Portal (New Window)
                                    </button>

                                    <button
                                        onClick={handleReloadIframe}
                                        className="px-5 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 border border-white/15 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-lg">refresh</span>
                                        Reload Frame
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Official NIC Link: <strong>{portalUrl}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Features & Modules Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-2xl">post_add</span>
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white text-base mb-1">
                                New RC Application
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Complete online application for rural & urban families in Bihar with family member details.
                            </p>
                        </div>
                        <span className="mt-4 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            RCMS Portal &bull; Form Fill
                        </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-2xl">search</span>
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white text-base mb-1">
                                Search by Aadhaar
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Instant lookup of existing Bihar ration card number, dealer info, and entitlement details.
                            </p>
                        </div>
                        <span className="mt-4 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            Aadhaar Linked Lookup
                        </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-2xl">print</span>
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white text-base mb-1">
                                Digital Card Print
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Download digital ration card PDF copy ready for standard A4 and PVC smart card printing.
                            </p>
                        </div>
                        <span className="mt-4 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            Printable Copy
                        </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-2xl">group_add</span>
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white text-base mb-1">
                                Member Modification
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Add new family member names, update Aadhaar e-KYC, address correction, and dealer changes.
                            </p>
                        </div>
                        <span className="mt-4 text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            e-KYC & Corrections
                        </span>
                    </div>
                </div>

                {/* Embedded Portal Viewer (Visible Once Unlocked) */}
                {isUnlocked && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-white">
                                    Smart PDS Bihar Portal Frame
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDirectOpen}
                                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                    <span>Open Full Window</span>
                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                </button>
                            </div>
                        </div>

                        <div className="relative min-h-[750px] w-full bg-slate-100 dark:bg-slate-950 flex flex-col justify-center">
                            <iframe
                                key={iframeKey}
                                ref={iframeRef}
                                src={portalUrl}
                                className="w-full flex-1 min-h-[750px] border-0"
                                title="Smart PDS Bihar"
                            />
                        </div>

                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-900/40 text-center text-xs text-amber-800 dark:text-amber-300 font-medium">
                            Note: If the portal does not load inside the frame due to NIC security headers, please click <strong>"Open Full Window"</strong> above to proceed directly.
                        </div>
                    </div>
                )}

                {/* Step-by-Step Operator Guide */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-600">help</span>
                        Step-by-Step Guide for Bihar Ration Card
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs sm:text-sm">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center mb-2 text-xs">
                                1
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Operator Login</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                Enter your login credentials / Jan Parichay SSO on the Smart PDS portal.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center mb-2 text-xs">
                                2
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Select Area</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                Choose District, Sub-Division, Block, and Panchayat / Urban Ward.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center mb-2 text-xs">
                                3
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Enter Details</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                Input applicant Aadhaar, bank account, and add family member data with photos.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center mb-2 text-xs">
                                4
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Download & Print</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                Once verified by SDO/BDO, generate the official digital ration card copy for PVC printing.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
