import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function VehicleChallan() {
    const { service, coinCost = 14, isAdmin = false, apiUrl: propApiUrl = '', apiKey: propApiKey = '', currentService, auth } = usePage().props;

    const [vehicleNumber, setVehicleNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedField, setCopiedField] = useState(null);
    const [copiedAll, setCopiedAll] = useState(false);

    const displayCoinCost = service?.coin_cost ?? currentService?.coin_cost ?? coinCost ?? 14;

    // Admin API Settings State
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/vahan_service_api/challan_find.php');
    const [adminApiKey, setAdminApiKey] = useState(propApiKey || '');
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingMsg, setSettingMsg] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        const cleanNo = vehicleNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (cleanNo.length < 6) {
            setError('Please enter a valid vehicle registration number (e.g. HR26DK8337 or DL1CAB1234).');
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
            const response = await axios.post('/utilities/vehicle-challan-check/search', {
                vehicle_number: cleanNo,
            });

            if (response.data.success) {
                setResult(response.data);
                if (!isUserAdmin && auth?.user) {
                    auth.user.coins -= displayCoinCost;
                }
            } else {
                setError(response.data.message || 'No challan records found for this vehicle number.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'An error occurred while communicating with the Challan server.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, fieldName) => {
        if (!text || text === 'N/A') return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const copyAllDetails = () => {
        if (!result) return;
        let text = `--- VEHICLE E-CHALLAN REPORT ---
Vehicle Number: ${result.vehicle_number}
Total Challans: ${result.total_challans}
Pending Amount: ₹${result.pending_amount}
Paid Amount: ₹${result.paid_amount}
Checked At: ${result.checked_at}
Portal: cspjaankari.in\n`;

        if (result.challans && result.challans.length > 0) {
            result.challans.forEach((c, idx) => {
                text += `\n[Challan #${idx + 1}]
Challan No: ${c.challan_number}
Date: ${c.date}
Amount: ₹${c.amount}
Status: ${c.status}
Violation: ${c.violation || 'Traffic Offense'}\n`;
            });
        }

        navigator.clipboard.writeText(text);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSaveAdminSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        setSettingMsg(null);

        try {
            const res = await axios.post('/utilities/vehicle-challan-check/update-api', {
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
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <span className="material-symbols-outlined text-2xl">receipt_long</span>
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                <span>Vehicle Challan Check</span>
                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                                    Vahan Live
                                </span>
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Check traffic e-challans, pending fine amounts, and violation status &bull; Good-API-Point
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard"
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all flex items-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
                            <span>Back</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Vehicle Challan Check" />

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #challan-printable-slip, #challan-printable-slip * {
                        visibility: visible;
                    }
                    #challan-printable-slip {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        padding: 30px;
                        font-family: Arial, sans-serif;
                    }
                }
            `}</style>

            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                {/* Search Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/20">
                                    <span className="material-symbols-outlined text-2xl">directions_car</span>
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                        Enter Vehicle Registration Number
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Car, Bike, Truck or Bus (e.g. HR26DK8337, DL1CAB1234, UP16AB1234)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-black shadow-xs">
                                <span className="material-symbols-outlined text-sm">toll</span>
                                <span>{displayCoinCost} Coins / Search</span>
                            </div>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                    Vehicle Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength="14"
                                        value={vehicleNumber}
                                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                        placeholder="HR26DK8337"
                                        className="w-full pl-12 pr-4 py-4 text-xl sm:text-2xl font-mono font-bold tracking-widest text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-amber-500 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-inner uppercase text-center sm:text-left"
                                        required
                                        autoFocus
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <span className="material-symbols-outlined text-2xl">pin</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm text-amber-500">info</span>
                                    Live e-challan database search across all RTOs in India. No OTP required.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || vehicleNumber.trim().length < 6}
                                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Checking Traffic Challans...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl">search</span>
                                        <span>Check Challans ({displayCoinCost} Coins)</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0 text-xl">warning</span>
                                <div>
                                    <h4 className="text-xs font-bold text-red-900 dark:text-red-200 uppercase tracking-wide">Lookup Failed</h4>
                                    <p className="text-xs text-red-700 dark:text-red-300 font-medium mt-0.5">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Result Card */}
                {result && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in duration-300">
                        {/* Header Banner */}
                        <div className={`p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            result.total_challans > 0 
                                ? 'bg-gradient-to-r from-amber-600 to-orange-600' 
                                : 'bg-gradient-to-r from-emerald-600 to-teal-600'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                                    <span className="material-symbols-outlined text-white text-2xl">
                                        {result.total_challans > 0 ? 'warning' : 'verified'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-base font-black">
                                        {result.total_challans > 0 
                                            ? `Found ${result.total_challans} Challan(s) for ${result.vehicle_number}` 
                                            : `Clean Record! No Active Challans Found`}
                                    </h3>
                                    <p className="text-xs text-white/90">
                                        Vehicle: <span className="font-mono font-bold">{result.vehicle_number}</span> &bull; Checked At: {result.checked_at}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="px-3.5 py-1.5 bg-white text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">print</span>
                                    <span>Print Report</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={copyAllDetails}
                                    className="px-3.5 py-1.5 bg-black/20 hover:bg-black/30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">{copiedAll ? 'done' : 'content_copy'}</span>
                                    <span>{copiedAll ? 'Copied' : 'Copy All'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 space-y-6">
                            {/* Summary Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Challans</p>
                                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                                        {result.total_challans}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center">
                                    <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pending Fine</p>
                                    <p className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300 mt-1">
                                        ₹{result.pending_amount}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
                                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Paid / Disposed</p>
                                    <p className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                                        ₹{result.paid_amount}
                                    </p>
                                </div>
                            </div>

                            {/* Clean record state */}
                            {result.total_challans === 0 && (
                                <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border-2 border-dashed border-emerald-300 dark:border-emerald-800 text-center">
                                    <span className="material-symbols-outlined text-5xl text-emerald-500 mb-2">check_circle</span>
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                                        Vehicle has NO Pending Challans!
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                                        Vehicle <strong className="font-mono">{result.vehicle_number}</strong> has no unpaid or active traffic violations recorded in the central e-challan repository.
                                    </p>
                                </div>
                            )}

                            {/* Challan List */}
                            {result.challans && result.challans.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-amber-500 text-lg">list_alt</span>
                                        <span>Challan Records Breakdown ({result.challans.length})</span>
                                    </h3>

                                    <div className="space-y-3">
                                        {result.challans.map((item, idx) => {
                                            const isPaid = (item.status || '').toLowerCase() === 'paid' || (item.status || '').toLowerCase() === 'disposed';
                                            return (
                                                <div
                                                    key={idx}
                                                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all shadow-xs"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-700/60 gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black text-xs flex items-center justify-center">
                                                                #{idx + 1}
                                                            </span>
                                                            <div>
                                                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Challan No:</span>
                                                                <span className="ml-2 font-mono font-black text-slate-900 dark:text-white text-sm sm:text-base">
                                                                    {item.challan_number}
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => copyToClipboard(item.challan_number, `c_${idx}`)}
                                                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                                                title="Copy Challan No"
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">
                                                                    {copiedField === `c_${idx}` ? 'done' : 'content_copy'}
                                                                </span>
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                                                ₹{item.amount}
                                                            </span>
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                                                isPaid 
                                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                                            }`}>
                                                                {item.status || 'Pending'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                                                        <div>
                                                            <p className="text-slate-400 font-semibold">Violation / Offense:</p>
                                                            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                                                {item.violation || 'Traffic Rule Violation'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-400 font-semibold">Date & Time:</p>
                                                            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                                                {item.date || 'N/A'}
                                                            </p>
                                                        </div>
                                                        {item.violator_name && (
                                                            <div>
                                                                <p className="text-slate-400 font-semibold">Accused / Owner Name:</p>
                                                                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                                                    {item.violator_name}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {item.state && (
                                                            <div>
                                                                <p className="text-slate-400 font-semibold">State / RTO:</p>
                                                                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                                                    {item.state}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {item.court_name && (
                                                            <div>
                                                                <p className="text-slate-400 font-semibold">Court / Police Station:</p>
                                                                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                                                    {item.court_name}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {item.receipt_url && (
                                                            <div>
                                                                <p className="text-slate-400 font-semibold">Receipt / Pay Link:</p>
                                                                <a
                                                                    href={item.receipt_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 mt-0.5"
                                                                >
                                                                    <span>View / Download Slip</span>
                                                                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Actions Footer */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setResult(null);
                                        setVehicleNumber('');
                                    }}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-base">refresh</span>
                                    <span>Search Another Vehicle</span>
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handlePrint}
                                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-base">print</span>
                                        <span>Print Official Slip</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Printable Slip */}
            <div id="challan-printable-slip" style={{ display: 'none' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto', border: '2px solid #d97706', padding: '24px', borderRadius: '12px', background: '#fff' }}>
                    <div style={{ textAlign: 'center', borderBottom: '2px solid #d97706', paddingBottom: '16px', marginBottom: '20px' }}>
                        <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 'bold', color: '#d97706' }}>cspjaankari.in Portal</h2>
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#334155' }}>Traffic e-Challan Verification Report</h4>
                        <p style={{ margin: '0', fontSize: '12px', color: '#64748b' }}>Date & Time: {result?.checked_at || new Date().toLocaleString()}</p>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#475569', width: '35%' }}>Vehicle Registration No:</td>
                                <td style={{ padding: '8px 4px', fontWeight: '900', color: '#0f172a', fontSize: '16px' }}>{result?.vehicle_number}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#475569' }}>Total Challans Found:</td>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#0f172a' }}>{result?.total_challans}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#475569' }}>Total Pending Fine:</td>
                                <td style={{ padding: '8px 4px', fontWeight: '900', color: '#dc2626', fontSize: '15px' }}>₹{result?.pending_amount}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#475569' }}>Total Paid Fine:</td>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#16a34a' }}>₹{result?.paid_amount}</td>
                            </tr>
                        </tbody>
                    </table>

                    {result?.challans && result.challans.length > 0 ? (
                        <div>
                            <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
                                Challan Details
                            </h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                                        <th style={{ padding: '6px' }}>#</th>
                                        <th style={{ padding: '6px' }}>Challan No</th>
                                        <th style={{ padding: '6px' }}>Date</th>
                                        <th style={{ padding: '6px' }}>Violation</th>
                                        <th style={{ padding: '6px' }}>Amount</th>
                                        <th style={{ padding: '6px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.challans.map((ch, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '6px' }}>{i + 1}</td>
                                            <td style={{ padding: '6px', fontWeight: 'bold', fontFamily: 'monospace' }}>{ch.challan_number}</td>
                                            <td style={{ padding: '6px' }}>{ch.date}</td>
                                            <td style={{ padding: '6px' }}>{ch.violation}</td>
                                            <td style={{ padding: '6px', fontWeight: 'bold' }}>₹{ch.amount}</td>
                                            <td style={{ padding: '6px', fontWeight: 'bold', color: ch.status === 'Paid' ? '#16a34a' : '#d97706' }}>
                                                {ch.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ background: '#f0fdf4', border: '1px dashed #22c55e', padding: '16px', textAlign: 'center', borderRadius: '8px', marginBottom: '20px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#166534' }}>✓ NO PENDING CHALLANS RECORDED</div>
                            <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>This vehicle has a clean record.</div>
                        </div>
                    )}

                    <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                        This is an official verification report generated from cspjaankari.in. Valid across all states in India.
                    </div>
                </div>
            </div>

            {/* Admin Quick API Settings Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">tune</span>
                                <span>Vehicle Challan Check API Settings</span>
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
                                    placeholder="https://good-api-point.com/apis_partner/v1/vahan_service_api/challan_find.php"
                                    className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Default: https://good-api-point.com/apis_partner/v1/vahan_service_api/challan_find.php
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
                                    className="px-5 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all disabled:opacity-50"
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
