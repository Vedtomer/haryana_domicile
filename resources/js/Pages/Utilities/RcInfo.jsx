import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

const DetailItem = ({ label, value, highlight = false, badge = null, copyable = false, onCopy = null }) => {
    if (!value || value === 'N/A' || value === '') return null;
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-3 border-b border-slate-100 dark:border-slate-800/80 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 rounded-lg transition-colors gap-1 sm:gap-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
                {label}
            </span>
            <div className="flex items-center gap-2">
                {badge && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${badge}`}>
                        {badge.includes('ACTIVE') || badge.includes('emerald') ? 'ACTIVE' : badge}
                    </span>
                )}
                <span className={`text-xs sm:text-sm font-bold text-right break-words ${highlight ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-slate-800 dark:text-white'}`}>
                    {value}
                </span>
                {copyable && onCopy && (
                    <button
                        type="button"
                        onClick={() => onCopy(value)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                        title="Copy to clipboard"
                    >
                        <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default function RcInfo() {
    const {
        service,
        coinCost = 14,
        isAdmin = false,
        apiUrl: propApiUrl = '',
        apiKey: propApiKey = '',
        currentService,
        auth,
    } = usePage().props;

    const [rc, setRc] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copiedText, setCopiedText] = useState(null);

    const displayCoinCost = service?.coin_cost ?? currentService?.coin_cost ?? coinCost ?? 14;
    const isUserAdmin = auth?.user?.is_admin || auth?.user?.type === 'super_admin' || auth?.user?.type === 'admin' || isAdmin;

    // Admin Quick Config Modal
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminApiUrl, setAdminApiUrl] = useState(propApiUrl || 'https://good-api-point.com/apis_partner/v1/vahan_service_api/rc_info_api.php');
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
            const resp = await axios.post('/utilities/rc-card-info/update-api', {
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
        const cleanRc = rc.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (cleanRc.length < 6) {
            setError('Please enter a valid Vehicle Registration Number (e.g. HR26DK8337).');
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
            const response = await axios.post('/utilities/rc-card-info/search', { rc: cleanRc });

            if (response.data.success && response.data.data) {
                setResult(response.data.data);
                if (!isUserAdmin && auth?.user) {
                    auth.user.coins -= displayCoinCost;
                }
            } else {
                setError(response.data.message || 'Vehicle details not found for this Registration Number.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'API Server se sampark nahi ho saka. Kripya thodi der baad prayas karein.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const cleanInputRc = rc.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const regNo = result?.registration_number || cleanInputRc;
    const owner = result?.owner || {};
    const vehicle = result?.vehicle || {};
    const technical = result?.technical_details || {};
    const authority = result?.registration_authority || {};
    const address = result?.address || {};
    const insurance = result?.insurance || {};
    const validity = result?.validity || {};
    const manufacturing = result?.manufacturing || {};
    const finance = result?.finance || {};

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
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl sm:text-3xl">directions_car</span>
                                <span>RC CARD INFO</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                Instant Vehicle RC Details, Owner Verification &bull; Official PDF Download
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                            <span>🪙</span>
                            <span>{displayCoinCost} Coins / Search</span>
                        </span>

                        {isUserAdmin && (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAdminModal(true);
                                    setSettingMsg(null);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 shadow-xs transition-colors"
                                title="Admin API Settings"
                            >
                                <span className="material-symbols-outlined text-[15px]">settings</span>
                                <span className="hidden sm:inline">API Config</span>
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="RC CARD INFO - Vehicle Details & Smart Card PDF" />

            {/* Custom Print CSS */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #rc-printable-slip, #rc-printable-slip * {
                        visibility: visible !important;
                    }
                    #rc-printable-slip {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 15px !important;
                        background: white !important;
                        color: black !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}} />

            <div className="max-w-4xl mx-auto mt-6 sm:mt-8 space-y-6 pb-16 no-print">
                {/* Search Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-emerald-500/10 to-teal-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-5 mx-auto border border-emerald-100 dark:border-emerald-900/30">
                            <span className="material-symbols-outlined text-3xl">badge</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-center text-slate-800 dark:text-white mb-1.5 tracking-tight">
                            Vehicle RC Card Info & PDF Download
                        </h2>
                        <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm font-medium">
                            Enter any vehicle registration number to fetch complete RC details and download the official Smart Card PDF.
                        </p>

                        <form onSubmit={handleSearch} className="max-w-lg mx-auto space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide text-center">
                                    Vehicle Registration Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">
                                        directions_car
                                    </span>
                                    <input
                                        type="text"
                                        maxLength="15"
                                        value={rc}
                                        onChange={(e) => {
                                            setRc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                                            if (error) setError(null);
                                        }}
                                        placeholder="e.g. HR26DK8337 or DL1CAB1234"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-xl font-black tracking-[0.2em] text-slate-900 dark:text-white transition-all text-center uppercase"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || rc.trim().length < 6}
                                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base sm:text-lg rounded-xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.99]"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Fetching RC Details...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold">search</span>
                                        <span>Get RC Info ({displayCoinCost} Coins)</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 max-w-lg mx-auto p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">error</span>
                                <p className="text-red-700 dark:text-red-300 font-medium text-sm leading-relaxed">{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Result Section */}
                {result && (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                        {/* Vehicle Header Card with Action Buttons */}
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-black uppercase tracking-wider">
                                            {technical.rc_status || 'ACTIVE'}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            {vehicle.vehicle_category || 'Private Vehicle'}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl sm:text-4xl font-black tracking-widest font-mono text-white mb-1">
                                        {regNo}
                                    </h2>
                                    <p className="text-slate-300 text-base sm:text-lg font-bold">
                                        {vehicle.manufacturer ? `${vehicle.manufacturer} ${vehicle.model || ''}` : 'Vehicle Registered'}
                                        {vehicle.variant ? ` &bull; ${vehicle.variant}` : ''}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm">person</span>
                                        <span>Owner: <strong>{owner.owner_name || 'N/A'}</strong></span>
                                        {owner.father_name && <span>(S/O {owner.father_name})</span>}
                                    </p>
                                </div>

                                <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
                                    <a
                                        href={`/utilities/rc-card-info/pdf?rc=${encodeURIComponent(regNo)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full sm:w-auto px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]"
                                    >
                                        <span className="material-symbols-outlined">download</span>
                                        <span>Download Official PDF</span>
                                    </a>

                                    <button
                                        type="button"
                                        onClick={handlePrint}
                                        className="w-full sm:w-auto px-5 py-3.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                    >
                                        <span className="material-symbols-outlined">print</span>
                                        <span>Print Slip</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Card 1: Owner & Registration */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                                <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">person</span>
                                    <span>Owner & Registration Details</span>
                                </h3>
                                <div className="space-y-0.5">
                                    <DetailItem label="Owner Name" value={owner.owner_name} highlight copyable onCopy={handleCopy} />
                                    <DetailItem label="Father / Husband Name" value={owner.father_name} />
                                    <DetailItem label="Owner Serial No." value={owner.owner_serial} />
                                    <DetailItem label="Registration Number" value={regNo} copyable onCopy={handleCopy} />
                                    <DetailItem label="Registration Date" value={result.registration_date} />
                                    <DetailItem label="RC Valid Upto" value={result.registration_valid_upto} highlight />
                                    <DetailItem label="RC Status" value={technical.rc_status || 'ACTIVE'} />
                                    <DetailItem label="Blacklist Status" value={technical.blacklist_status || 'No Blacklist'} />
                                </div>
                            </div>

                            {/* Card 2: Vehicle Specs */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                                <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">directions_car</span>
                                    <span>Vehicle Specifications</span>
                                </h3>
                                <div className="space-y-0.5">
                                    <DetailItem label="Manufacturer" value={vehicle.manufacturer} />
                                    <DetailItem label="Model" value={vehicle.model} />
                                    <DetailItem label="Variant" value={vehicle.variant} />
                                    <DetailItem label="Vehicle Class" value={vehicle.vehicle_class} />
                                    <DetailItem label="Vehicle Category" value={vehicle.vehicle_category} />
                                    <DetailItem label="Body Type" value={vehicle.body_type} />
                                    <DetailItem label="Color" value={vehicle.color} />
                                    <DetailItem label="Month / Year of Mfg." value={manufacturing.month_year || manufacturing.year} />
                                </div>
                            </div>

                            {/* Card 3: Technical & Engine Specs */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                                <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">settings</span>
                                    <span>Technical & Engine Specs</span>
                                </h3>
                                <div className="space-y-0.5">
                                    <DetailItem label="Chassis Number" value={technical.chassis_number} copyable onCopy={handleCopy} />
                                    <DetailItem label="Engine Number" value={technical.engine_number} copyable onCopy={handleCopy} />
                                    <DetailItem label="Fuel Type" value={technical.fuel_type} />
                                    <DetailItem label="Emission Norms" value={technical.emission_norms} />
                                    <DetailItem label="Cubic Capacity (CC)" value={technical.cubic_capacity ? `${technical.cubic_capacity} cc` : null} />
                                    <DetailItem label="Cylinders" value={technical.cylinders} />
                                    <DetailItem label="Seating Capacity" value={technical.seating_capacity} />
                                    <DetailItem label="Unladen Weight" value={technical.unladen_weight ? `${technical.unladen_weight} kg` : null} />
                                    <DetailItem label="Wheelbase" value={technical.wheel_base ? `${technical.wheel_base} mm` : null} />
                                    <DetailItem label="Vehicle Age" value={technical.vehicle_age} />
                                </div>
                            </div>

                            {/* Card 4: Insurance & Validity */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                                <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">verified_user</span>
                                    <span>Insurance & Validity Dates</span>
                                </h3>
                                <div className="space-y-0.5">
                                    <DetailItem label="Insurance Company" value={insurance.company} />
                                    <DetailItem label="Insurance Policy No." value={insurance.policy_number} copyable onCopy={handleCopy} />
                                    <DetailItem label="Insurance Valid Upto" value={insurance.valid_upto} highlight />
                                    <DetailItem label="Fitness Valid Upto" value={validity.fitness_upto} highlight />
                                    <DetailItem label="Tax Valid Upto" value={validity.tax_upto} />
                                    <DetailItem label="PUC Valid Upto" value={validity.puc_upto} />
                                    <DetailItem label="Financier (Hypothecation)" value={finance.financer_name || 'ON CASH / NONE'} />
                                </div>
                            </div>
                        </div>

                        {/* Card 5: RTO & Address Details */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                            <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">pin_drop</span>
                                <span>RTO & Registered Address</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-0.5">
                                    <DetailItem label="RTO Name & City" value={authority.rto} />
                                    <DetailItem label="RTO Code" value={authority.rto_code} />
                                    <DetailItem label="State" value={authority.state} />
                                </div>
                                <div className="space-y-0.5">
                                    <DetailItem label="Present Registered Address" value={address.present_address} />
                                    <DetailItem label="Permanent Address" value={address.permanent_address} />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Action Footer */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                Official computer generated verification record &bull; Parivahan e-RC compatible
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">print</span>
                                    <span>Print Verification Slip</span>
                                </button>
                                <a
                                    href={`/utilities/rc-card-info/pdf?rc=${encodeURIComponent(regNo)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">download</span>
                                    <span>Download Official PDF</span>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* PRINT-ONLY OFFICIAL SLIP */}
            {result && (
                <div id="rc-printable-slip" className="hidden print:block font-sans">
                    <div style={{ textAlign: 'center', borderBottom: '2px solid #047857', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: '900', margin: '0', textTransform: 'uppercase', color: '#065f46' }}>
                            VEHICLE REGISTRATION CERTIFICATE (e-RC SLIP)
                        </h1>
                        <p style={{ fontSize: '11px', margin: '3px 0 0', color: '#475569' }}>
                            Government of India &bull; Ministry of Road Transport and Highways (MoRTH) &bull; Parivahan Sewa
                        </p>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '12px' }}>
                        <tbody>
                            <tr style={{ background: '#f8fafc' }}>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold', width: '25%' }}>Registration Number</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: '900', color: '#047857', fontSize: '15px', width: '25%' }}>{regNo}</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold', width: '25%' }}>RC Status</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold', color: '#16a34a', width: '25%' }}>{technical.rc_status || 'ACTIVE'}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>Owner Name</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{owner.owner_name}</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>Father / Husband Name</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{owner.father_name || 'N/A'}</td>
                            </tr>
                            <tr style={{ background: '#f8fafc' }}>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>Registration Date</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{result.registration_date}</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>RC / Fitness Valid Upto</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold', color: '#047857' }}>{result.registration_valid_upto}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>Vehicle Make & Model</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }} colSpan="3">
                                    {vehicle.manufacturer} {vehicle.model} {vehicle.variant}
                                </td>
                            </tr>
                            <tr style={{ background: '#f8fafc' }}>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>Vehicle Class</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{vehicle.vehicle_class}</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>Fuel Type / Norms</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{technical.fuel_type} ({technical.emission_norms})</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>Chassis Number</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 'bold' }}>{technical.chassis_number}</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>Engine Number</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 'bold' }}>{technical.engine_number}</td>
                            </tr>
                            <tr style={{ background: '#f8fafc' }}>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>Insurance Company</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{insurance.company}</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>Insurance Valid Upto</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{insurance.valid_upto}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>RTO Authority</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{authority.rto} ({authority.rto_code})</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>Financier</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{finance.financer_name || 'ON CASH / NONE'}</td>
                            </tr>
                            <tr style={{ background: '#f8fafc' }}>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>Registered Address</td>
                                <td style={{ padding: '8px', border: '1px solid #cbd5e1' }} colSpan="3">{address.present_address}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ marginTop: '20px', borderTop: '1px solid #cbd5e1', paddingTop: '10px', fontSize: '10px', color: '#64748b', textAlign: 'center' }}>
                        Printed on: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()} &bull; Official Digital Verification Slip &bull; CSP Jaankari Portal
                    </div>
                </div>
            )}

            {/* Admin Quick API Settings Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">settings</span>
                                <h3 className="font-black text-lg text-slate-900 dark:text-white">RC Card Info API Settings</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAdminModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {settingMsg && (
                            <div className={`p-3 rounded-xl text-xs font-bold ${
                                settingMsg.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                    : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                            }`}>
                                {settingMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleSaveAdminSettings} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                    API Endpoint URL
                                </label>
                                <input
                                    type="url"
                                    value={adminApiUrl}
                                    onChange={(e) => setAdminApiUrl(e.target.value)}
                                    placeholder="https://good-api-point.com/apis_partner/v1/vahan_service_api/rc_info_api.php"
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                                    required
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Default: <code className="text-emerald-600 dark:text-emerald-400 font-mono">https://good-api-point.com/apis_partner/v1/vahan_service_api/rc_info_api.php</code>
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                    API Key (Good-API-Point)
                                </label>
                                <input
                                    type="text"
                                    value={adminApiKey}
                                    onChange={(e) => setAdminApiKey(e.target.value)}
                                    placeholder="Enter your partner API key"
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Khali chhodne par Master Good-API-Point key use hogi.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors disabled:opacity-50"
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
