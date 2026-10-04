import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

const InfoRow = ({ label, value, icon, copyable = false, onCopy = null }) => {
    if (!value || value === 'N/A' || value === '') return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="flex-shrink-0 w-8 h-8 bg-sky-50 dark:bg-sky-900/30 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-sky-600 dark:text-sky-400 text-[18px]">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800 dark:text-white break-words">{value}</p>
                    {copyable && onCopy && (
                        <button
                            type="button"
                            onClick={() => onCopy(value)}
                            className="text-slate-400 hover:text-sky-600 transition-colors"
                            title="Copy to clipboard"
                        >
                            <span className="material-symbols-outlined text-[15px]">content_copy</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function VoterNameFind() {
    const {
        service,
        coinCost = 9,
        isAdmin = false,
        apiUrl: propApiUrl = '',
        apiKey: propApiKey = '',
        currentService,
        auth,
    } = usePage().props;

    const [epic, setEpic] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedText, setCopiedText] = useState(null);

    const displayCoinCost = service?.coin_cost ?? currentService?.coin_cost ?? coinCost ?? 9;
    const isUserAdmin = auth?.user?.is_admin || auth?.user?.type === 'super_admin' || auth?.user?.type === 'admin' || isAdmin;

    // Admin Quick Settings Modal
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/voter_card_api/voter_to_name.php');
    const [adminApiKey, setAdminApiKey] = useState(propApiKey || '');
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingMsg, setSettingMsg] = useState(null);

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const handleSaveAdminSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingMsg(null);
        try {
            const resp = await axios.post('/utilities/voter-name-find/update-api', {
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
            setSettingMsg({ type: 'error', text: err.response?.data?.message || 'Error saving API settings.' });
        } finally {
            setSavingSettings(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const clean = epic.trim().toUpperCase().replace(/[^A-Za-z0-9]/g, '');
        if (!clean || clean.length < 5) {
            setError('Please enter a valid EPIC / Voter ID (at least 5 characters).');
            return;
        }

        if (!isUserAdmin && (auth?.user?.coins ?? 0) < displayCoinCost) {
            setError(`Insufficient coins. This service requires ${displayCoinCost} Coins. (Your balance: ${auth?.user?.coins ?? 0} coins)`);
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/voter-name-find/search', {
                epic: clean,
            });

            if (response.data.success) {
                const fetchedData = {
                    ...(response.data.data?.data || {}),
                    ...(response.data.data || {}),
                    epic: response.data.epic || clean,
                    name: response.data.name || response.data.data?.name || response.data.data?.voter_name,
                    message: response.data.message,
                };

                setResult(fetchedData);

                if (!isUserAdmin && auth?.user) {
                    auth.user.coins -= displayCoinCost;
                }
            } else {
                setError(response.data.message || 'Voter record not found or provider server error.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'API server connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Extract voter details with various potential key mappings
    const voterName = result?.name || result?.voter_name || result?.elector_name || result?.applicant_name || result?.name_v1 || result?.fullName;
    const fatherName = result?.rln_name || result?.relative_name || result?.father_name || result?.husband_name || result?.rln_name_v1 || result?.fatherName;
    const relationType = result?.rln_type || result?.relation_type || result?.relationship;
    const gender = result?.gender || result?.sex;
    const age = result?.age || result?.dob;
    const stateName = result?.state || result?.state_name || result?.st_code;
    const districtName = result?.district || result?.district_name;
    const acName = result?.ac_name || result?.assembly_constituency || (result?.ac_no ? `AC No: ${result.ac_no}` : null);
    const pcName = result?.pc_name || result?.parliamentary_constituency || (result?.pc_no ? `PC No: ${result.pc_no}` : null);
    const partNo = result?.part_no || result?.part_number;
    const partName = result?.part_name;
    const serialNo = result?.serial_no || result?.slno_inpart || result?.serial_number;
    const pollingStation = result?.ps_name || result?.polling_station || result?.polling_station_name;
    const voterId = result?.epic || result?.epic_no || result?.voter_id || epic.toUpperCase();

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
                            <span className="material-symbols-outlined text-2xl">person_search</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                                    Voter Name Find
                                </h1>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300">
                                    {displayCoinCost} Coins
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Retrieve Voter Name & Electoral details instantly by Voter ID / EPIC number
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isUserAdmin && (
                            <button
                                type="button"
                                onClick={() => setShowAdminModal(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                            >
                                <span className="material-symbols-outlined text-[16px]">tune</span>
                                API Settings
                            </button>
                        )}
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Dashboard
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Voter Name Find" />

            <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
                {/* Search Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
                            <span className="material-symbols-outlined text-2xl">badge</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Voter Name Search
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Enter Voter ID / EPIC Number to find Voter Name and electoral roll details
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                                Voter ID / EPIC Number (मतदाता पहचान पत्र संख्या) *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                                    pin
                                </span>
                                <input
                                    type="text"
                                    value={epic}
                                    onChange={(e) => setEpic(e.target.value.toUpperCase())}
                                    placeholder="Enter EPIC number (e.g. ABC1234567)"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-base font-bold text-slate-800 dark:text-white placeholder:text-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all tracking-wider"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !epic.trim()}
                                className="w-full py-4 px-6 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white font-black text-base rounded-2xl shadow-lg shadow-sky-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Searching Voter Name...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl">search</span>
                                        <span>Find Voter Name ({displayCoinCost} Coins)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Election Commission Gateway
                        </span>
                        <span className="font-semibold text-sky-600 dark:text-sky-400">
                            Charges: {displayCoinCost} Coins / Search
                        </span>
                    </div>

                    {error && (
                        <div className="mt-5 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-start gap-3 text-red-700 dark:text-red-400">
                            <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">error</span>
                            <div className="text-sm font-medium leading-relaxed">{error}</div>
                        </div>
                    )}
                </div>

                {/* Result Card */}
                {result && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all animate-in fade-in zoom-in-95 duration-200">
                        {/* Header Banner with Voter Name */}
                        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-6 text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-3xl text-white">account_circle</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                                        Voter Found
                                    </span>
                                    <h3 className="text-xl font-black truncate mt-1">
                                        {voterName || 'Voter Record Available'}
                                    </h3>
                                    <p className="text-xs font-mono font-bold text-sky-100 tracking-wider mt-0.5">
                                        EPIC: {voterId}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Details List */}
                        <div className="p-6 space-y-1">
                            {voterName && (
                                <InfoRow
                                    label="Voter Name (मतदाता का नाम)"
                                    value={voterName}
                                    icon="person"
                                    copyable={true}
                                    onCopy={handleCopy}
                                />
                            )}
                            <InfoRow
                                label="EPIC / Voter ID Number"
                                value={voterId}
                                icon="badge"
                                copyable={true}
                                onCopy={handleCopy}
                            />
                            {fatherName && (
                                <InfoRow
                                    label={relationType ? `Relative Name (${relationType})` : "Father / Relative Name (पिता / रिश्तेदार का नाम)"}
                                    value={fatherName}
                                    icon="family_restroom"
                                    copyable={true}
                                    onCopy={handleCopy}
                                />
                            )}
                            {gender && (
                                <InfoRow
                                    label="Gender (लिंग)"
                                    value={gender}
                                    icon="transgender"
                                />
                            )}
                            {age && (
                                <InfoRow
                                    label="Age / Date of Birth (आयु)"
                                    value={String(age)}
                                    icon="cake"
                                />
                            )}
                            {stateName && (
                                <InfoRow
                                    label="State (राज्य)"
                                    value={stateName}
                                    icon="map"
                                />
                            )}
                            {districtName && (
                                <InfoRow
                                    label="District (जिला)"
                                    value={districtName}
                                    icon="location_city"
                                />
                            )}
                            {acName && (
                                <InfoRow
                                    label="Assembly Constituency (विधानसभा क्षेत्र)"
                                    value={acName}
                                    icon="how_to_vote"
                                    copyable={true}
                                    onCopy={handleCopy}
                                />
                            )}
                            {pcName && (
                                <InfoRow
                                    label="Parliamentary Constituency (संसदीय क्षेत्र)"
                                    value={pcName}
                                    icon="account_balance"
                                />
                            )}
                            {partNo && (
                                <InfoRow
                                    label="Part Number (भाग संख्या)"
                                    value={partName ? `${partNo} - ${partName}` : String(partNo)}
                                    icon="pin"
                                />
                            )}
                            {serialNo && (
                                <InfoRow
                                    label="Serial Number in Part (क्रम संख्या)"
                                    value={String(serialNo)}
                                    icon="format_list_numbered"
                                />
                            )}
                            {pollingStation && (
                                <InfoRow
                                    label="Polling Station (मतदान केंद्र)"
                                    value={pollingStation}
                                    icon="store"
                                    copyable={true}
                                    onCopy={handleCopy}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Quick API Settings Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-sky-600 dark:text-sky-400">tune</span>
                                <h3 className="font-bold text-base text-slate-800 dark:text-white">
                                    Voter Name Find API Settings
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAdminModal(false)}
                                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveAdminSettings} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    API Endpoint URL
                                </label>
                                <input
                                    type="text"
                                    value={adminApiUrl}
                                    onChange={(e) => setAdminApiUrl(e.target.value)}
                                    placeholder="https://good-api-point.com/apis_partner/v1/voter_card_api/voter_to_name.php"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Parameter query format: ?apiKey=...&epic=...
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    API Key (Good-API-Point)
                                </label>
                                <input
                                    type="text"
                                    value={adminApiKey}
                                    onChange={(e) => setAdminApiKey(e.target.value)}
                                    placeholder="Enter your API Key"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>

                            {settingMsg && (
                                <div
                                    className={`p-3 rounded-xl text-xs font-bold ${
                                        settingMsg.type === 'success'
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    }`}
                                >
                                    {settingMsg.text}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow transition disabled:opacity-50"
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
