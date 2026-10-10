import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

const InfoRow = ({ label, value, icon, copyable, onCopy, isCopied }) => {
    if (!value || value === 'N/A' || value === '') return null;
    return (
        <div className="flex items-start justify-between gap-3 py-3 px-3 rounded-xl border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white break-words mt-0.5">{value}</p>
                </div>
            </div>
            {copyable && (
                <button
                    type="button"
                    onClick={() => onCopy(value)}
                    className="shrink-0 p-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-all"
                    title="Copy"
                >
                    <span className="material-symbols-outlined text-[16px]">{isCopied ? 'done' : 'content_copy'}</span>
                </button>
            )}
        </div>
    );
};

export default function PanToUid() {
    const { currentService, service, coinCost = 199, isAdmin = false, apiUrl: propApiUrl = '', apiKey: propApiKey = '', auth } = usePage().props;
    const [pan, setPan] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedField, setCopiedField] = useState(null);

    const displayCoinCost = service?.coin_cost ?? currentService?.coin_cost ?? coinCost ?? 199;

    // Admin Quick Settings
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_uid_s1.php');
    const [adminApiKey, setAdminApiKey] = useState(propApiKey || '');
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingMsg, setSettingMsg] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        const clean = pan.replace(/\s/g, '').toUpperCase();
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean)) {
            setError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).');
            return;
        }

        const isUserAdmin = auth?.user?.is_admin || isAdmin;
        if (!isUserAdmin && (auth?.user?.coins ?? 0) < displayCoinCost) {
            setError(`Insufficient coins. This service requires ${displayCoinCost} Coins. Please recharge your wallet.`);
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await axios.post('/utilities/pan-to-uid-advance/search', { pan: clean });
            if (response.data.success) {
                setResult(response.data.data);
                if (!isUserAdmin && auth?.user) {
                    auth.user.coins -= displayCoinCost;
                }
            } else {
                setError(response.data.message || 'Details not found.');
            }
        } catch (err) {
            setError('An error occurred while fetching the details.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleSaveAdminSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingMsg(null);

        try {
            const res = await axios.post('/utilities/pan-to-uid-advance/update-api', {
                api_url: adminApiUrl,
                api_key: adminApiKey,
            });

            if (res.data.success) {
                setSettingMsg({ type: 'success', text: res.data.message });
                setTimeout(() => setShowAdminModal(false), 1500);
            } else {
                setSettingMsg({ type: 'error', text: res.data.message || 'Failed to save settings.' });
            }
        } catch (err) {
            setSettingMsg({ type: 'error', text: 'Error saving settings.' });
        } finally {
            setSavingSettings(false);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight flex items-center gap-2">
                            <span>Pan To Uid Advance Instant</span>
                            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                                Live Gateway
                            </span>
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Get advanced UID details instantly using PAN &bull; Good-API-Point
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard"
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
                            <span>Back</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Pan To Uid Advance Instant" />

            <div className="max-w-xl mx-auto mt-6 space-y-6">
                {/* Input Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-6 mx-auto border border-indigo-100 dark:border-indigo-900/40">
                            <span className="material-symbols-outlined text-3xl">fingerprint</span>
                        </div>
                        <h2 className="text-2xl font-black text-center text-slate-800 dark:text-white mb-2 tracking-tight">
                            PAN to UID Advance
                        </h2>
                        <p className="text-center text-slate-500 dark:text-slate-400 mb-8 font-medium text-xs sm:text-sm">
                            Enter a 10-character PAN number to get advanced UID details instantly.
                        </p>

                        <form onSubmit={handleSearch} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
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
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xl tracking-[0.3em] font-black transition-all text-center text-slate-900 dark:text-white uppercase"
                                    required
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || pan.length !== 10}
                                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-base uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Fetching Details...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold">manage_search</span>
                                        <span>Get UID Details ({displayCoinCost} Coins)</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">error</span>
                                <p className="text-red-700 dark:text-red-300 font-medium text-xs">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sm:px-8">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                            Live instant server lookup &bull; Good-API-Point
                        </p>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                            <span className="material-symbols-outlined text-[15px]">toll</span>
                            <span>{displayCoinCost} Coins</span>
                        </div>
                    </div>
                </div>

                {/* Result Card */}
                {result && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 flex items-center gap-4 text-white">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-2xl">badge</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">UID Details Found</p>
                                <p className="text-white font-black text-lg sm:text-xl tracking-widest truncate">
                                    {result.uid || result.aadhar_number || result.aadhaar_number || result.aadhar || 'Data Found'}
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-emerald-400 text-emerald-950 text-xs font-black rounded-full uppercase shrink-0">
                                Active
                            </span>
                        </div>
                        <div className="p-6 space-y-1">
                            <InfoRow
                                label="UID / Aadhaar"
                                value={result.uid || result.aadhar_number || result.aadhaar_number || result.aadhar}
                                icon="badge"
                                copyable
                                onCopy={(val) => copyToClipboard(val, 'uid')}
                                isCopied={copiedField === 'uid'}
                            />
                            <InfoRow
                                label="PAN Number"
                                value={result.pan || result.pan_number || pan}
                                icon="credit_card"
                                copyable
                                onCopy={(val) => copyToClipboard(val, 'pan')}
                                isCopied={copiedField === 'pan'}
                            />
                            <InfoRow label="Full Name" value={result.name || result.full_name} icon="person" />
                            <InfoRow label="Father's Name" value={result.father_name || result.fathers_name || result.care_of} icon="family_restroom" />
                            <InfoRow label="Date of Birth" value={result.dob || result.date_of_birth} icon="calendar_today" />
                            <InfoRow label="Gender" value={result.gender} icon="wc" />
                            <InfoRow label="Mobile Number" value={result.mobile || result.phone || result.mobile_no} icon="smartphone" />
                            <InfoRow label="Email" value={result.email} icon="email" />
                            <InfoRow label="Address" value={result.address || result.full_address} icon="home" />
                            <InfoRow label="State" value={result.state} icon="map" />
                            <InfoRow label="Pincode" value={result.pincode || result.pin || result.zip} icon="pin_drop" />
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Quick API Settings Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-500">tune</span>
                                <span>PAN to UID Advance API Settings</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowAdminModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {settingMsg && (
                            <div className={`p-3 rounded-xl text-xs font-bold ${
                                settingMsg.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                                {settingMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleSaveAdminSettings} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    API Endpoint URL
                                </label>
                                <input
                                    type="text"
                                    value={adminApiUrl}
                                    onChange={(e) => setAdminApiUrl(e.target.value)}
                                    placeholder="https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_uid_s1.php"
                                    className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Default: https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_uid_s1.php
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Dedicated API Key (Optional)
                                </label>
                                <input
                                    type="password"
                                    value={adminApiKey}
                                    onChange={(e) => setAdminApiKey(e.target.value)}
                                    placeholder="Khali chhodne par Master Good-API key use hogi"
                                    className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="px-5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all disabled:opacity-50"
                                >
                                    {savingSettings ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
