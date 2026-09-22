import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Edit({ settings = {} }) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [showKeys, setShowKeys] = useState({});

    const { data, setData, put, processing } = useForm({
        // IDCard.Store (PVC & Astrology)
        idcard_store_api_key: settings.idcard_store_api_key || '',
        idcard_store_base_url: settings.idcard_store_base_url || '',

        // Nexus API & KYC Services
        nexus_api_key: settings.nexus_api_key || '',
        nexus_aadhar_to_name_url: settings.nexus_aadhar_to_name_url || '',
        nexus_aadhar_to_mask_pan_url: settings.nexus_aadhar_to_mask_pan_url || '',
        nexus_aadhar_to_pan_url: settings.nexus_aadhar_to_pan_url || '',
        nexus_mobile_to_pan_url: settings.nexus_mobile_to_pan_url || '',
        nexus_mobile_to_pan_key: settings.nexus_mobile_to_pan_key || '',
        nexus_pan_details_url: settings.nexus_pan_details_url || '',
        nexus_pan_full_details_url: settings.nexus_pan_full_details_url || '',
        nexus_pan_to_aadhar_url: settings.nexus_pan_to_aadhar_url || '',
        nexus_pan_to_uid_url: settings.nexus_pan_to_uid_url || '',

        // Vahan & Transport
        vahan_api_key: settings.vahan_api_key || '',
        vahan_puc_without_otp_url: settings.vahan_puc_without_otp_url || '',
        vahan_puc_send_otp_url: settings.vahan_puc_send_otp_url || '',
        vahan_puc_verify_otp_url: settings.vahan_puc_verify_otp_url || '',
        vahan_rc_pdf_url: settings.vahan_rc_pdf_url || '',
        vahan_rc_pdf_key: settings.vahan_rc_pdf_key || '',
        vahan_learning_licence_url: settings.vahan_learning_licence_url || '',
        vahan_learning_licence_key: settings.vahan_learning_licence_key || '',
        vehicle_to_mobile_api_url: settings.vehicle_to_mobile_api_url || '',
        vehicle_to_mobile_api_key: settings.vehicle_to_mobile_api_key || '',
        vehicle_details_api_url: settings.vehicle_details_api_url || '',
        vehicle_details_api_key: settings.vehicle_details_api_key || '',

        // Mobile to Info API
        mobile_to_info_api_url: settings.mobile_to_info_api_url || '',
        mobile_to_info_api_key: settings.mobile_to_info_api_key || '',

        // Aadhaar Info & Updates
        aadhar_to_info_api_url: settings.aadhar_to_info_api_url || '',
        aadhar_to_info_api_key: settings.aadhar_to_info_api_key || '',
        aadhar_update_api_key: settings.aadhar_update_api_key || '',
        aadhar_update_mobile_update_url: settings.aadhar_update_mobile_update_url || '',
        aadhar_update_dob_change_url: settings.aadhar_update_dob_change_url || '',
        aadhar_update_surname_change_url: settings.aadhar_update_surname_change_url || '',
        aadhar_update_full_name_change_url: settings.aadhar_update_full_name_change_url || '',

        // PPP API (Parivar Pehchan Patra)
        ppp_api_key: settings.ppp_api_key || '',
        ppp_aadhar_to_ppp_url: settings.ppp_aadhar_to_ppp_url || '',
        ppp_to_aadhar_url: settings.ppp_to_aadhar_url || '',
        ppp_to_mobile_url: settings.ppp_to_mobile_url || '',
        ppp_to_bank_url: settings.ppp_to_bank_url || '',

        // Voter Services
        voter_api_key: settings.voter_api_key || '',
        voter_sir_voter_list_url: settings.voter_sir_voter_list_url || '',
        voter_mobile_update_url: settings.voter_mobile_update_url || '',
        voter_mobile_update_key: settings.voter_mobile_update_key || '',

        // Card Maker Tools & PDF Editor
        card_maker_api_key: settings.card_maker_api_key || '',
        card_maker_voter_card_url: settings.card_maker_voter_card_url || '',
        card_maker_aadhar_card_url: settings.card_maker_aadhar_card_url || '',
        card_maker_voter_address_change_url: settings.card_maker_voter_address_change_url || '',
        pdf_api_key: settings.pdf_api_key || '',
        pdf_editor_api_url: settings.pdf_editor_api_url || '',

        // ABHA Health ID (ABDM)
        abha_api_url: settings.abha_api_url || '',
        abha_api_key: settings.abha_api_key || '',
        abha_client_id: settings.abha_client_id || '',
        abha_client_secret: settings.abha_client_secret || '',

        // Utilities & Government Portals
        dhbvn_bill_url: settings.dhbvn_bill_url || '',
        uhbvn_bill_url: settings.uhbvn_bill_url || '',
        saral_status_url: settings.saral_status_url || '',
        kundli_city_autocomplete_url: settings.kundli_city_autocomplete_url || '',
        ifsc_api_url: settings.ifsc_api_url || '',
        pincode_api_url: settings.pincode_api_url || '',

        // CallMeBot WhatsApp Alerts
        callmebot_phone: settings.callmebot_phone || '',
        callmebot_api_key: settings.callmebot_api_key || '',
    });

    const toggleShowKey = (field) => {
        setShowKeys(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/admin/api-settings', {
            preserveScroll: true,
        });
    };

    const categories = [
        { id: 'all', label: 'All Services', icon: 'apps' },
        { id: 'nexus', label: 'Nexus KYC & PAN', icon: 'fingerprint' },
        { id: 'vahan', label: 'Vahan, RC & DL', icon: 'directions_car' },
        { id: 'aadhaar', label: 'Aadhaar & Info', icon: 'contact_mail' },
        { id: 'idcard', label: 'IDCard.Store (PVC)', icon: 'badge' },
        { id: 'ppp', label: 'PPP Family ID', icon: 'groups' },
        { id: 'voter', label: 'Voter Services', icon: 'how_to_vote' },
        { id: 'tools', label: 'Card Maker & PDF', icon: 'build' },
        { id: 'abha', label: 'ABHA Health ID', icon: 'medical_services' },
        { id: 'utilities', label: 'Govt & Utility APIs', icon: 'account_balance' },
        { id: 'callmebot', label: 'WhatsApp Alerts', icon: 'chat' },
    ];

    const isVisible = (cat) => activeCategory === 'all' || activeCategory === cat;

    // Helper for rendering masked key inputs
    const renderKeyInput = (field, label, placeholder, helperText = null) => (
        <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            <div className="relative">
                <input
                    type={showKeys[field] ? 'text' : 'password'}
                    value={data[field]}
                    onChange={e => setData(field, e.target.value)}
                    placeholder={placeholder}
                    className="w-full font-mono text-sm px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 pr-10 transition-all"
                />
                <button
                    type="button"
                    onClick={() => toggleShowKey(field)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">
                        {showKeys[field] ? 'visibility_off' : 'visibility'}
                    </span>
                </button>
            </div>
            {helperText && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{helperText}</p>
            )}
        </div>
    );

    // Helper for rendering URL inputs
    const renderUrlInput = (field, label, placeholder, helperText = null) => (
        <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {label}
            </label>
            <input
                type="text"
                value={data[field]}
                onChange={e => setData(field, e.target.value)}
                placeholder={placeholder}
                className="w-full font-mono text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {helperText && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{helperText}</p>
            )}
        </div>
    );

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">tune</span>
                    <h1 className="text-lg font-bold text-gray-800 dark:text-white">API Settings & Gateway Configuration</h1>
                </div>
            }
        >
            <Head title="API Settings - Admin" />

            <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Top Banner */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
                    <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                        <span className="material-symbols-outlined text-9xl">tune</span>
                    </div>
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-3 border border-blue-400/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Live Master API Control
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Portal Ki Sabhi APIs Configure Karein</h2>
                            <p className="mt-1.5 text-sm text-blue-200/90 max-w-2xl leading-relaxed">
                                Portal me chalne wali har ek service ki API key aur endpoint URL ko yahan se badla ja sakta hai. Agar koi field khali chhodte hain toh system safe default working endpoint use karega.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={processing}
                                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {processing ? 'hourglass_top' : 'save'}
                                </span>
                                <span>{processing ? 'Saving...' : 'Save All Changes'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Category Navigation Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                                activeCategory === cat.id
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* 1. NEXUS KYC & PAN SERVICES */}
                    {isVisible('nexus') && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl border border-purple-200 dark:border-purple-900/50">
                                        <span className="material-symbols-outlined">fingerprint</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                                                Nexus KYC & PAN Services API
                                            </h3>
                                            {data.nexus_api_key ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                    ✓ ACTIVE
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                                                    ✕ NOT SET
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Aadhaar se Name, Mask PAN, Unmasked PAN, Mobile to PAN, PAN Details Instant, Full Details, PAN to Aadhaar, PAN to UID Advance
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href="https://nexus-dashboard.space"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                                >
                                    <span>nexus-dashboard.space</span>
                                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                </a>
                            </div>

                            <div className="space-y-4">
                                {renderKeyInput(
                                    'nexus_api_key',
                                    'Master Nexus API Key (Default for All Nexus Services)',
                                    'e.g. 38cc07892c07c566e3ce1a3289c589e284954d7c0e593386',
                                    'Yeh key niche diye gaye sabhi Nexus endpoints ke liye master key ke roop me use hoti hai.'
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    {renderUrlInput('nexus_aadhar_to_name_url', '1. Aadhar To Name Endpoint URL', 'https://nexus-dashboard.space/api/v1/aadhar_card_api/aadhar_to_name.php')}
                                    {renderUrlInput('nexus_aadhar_to_mask_pan_url', '2. Aadhar To Mask PAN Endpoint URL', 'https://nexus-dashboard.space/api/v1/aadhar_card_api/aadhar_to_mask_pan.php')}
                                    {renderUrlInput('nexus_aadhar_to_pan_url', '3. Aadhar To Unmasked PAN Endpoint URL', 'https://nexus-dashboard.space/api/v1/aadhar_card_api/aadhaar_to_unmasked_pan.php')}
                                    {renderUrlInput('nexus_pan_details_url', '4. PAN Details Instant (Server 2) URL', 'https://nexus-dashboard.space/api/v1/pan_card_api/pan_server2.php')}
                                    {renderUrlInput('nexus_pan_full_details_url', '5. PAN Full Details Instant URL', 'https://nexus-dashboard.space/api/v1/pan_card_api/pan_full_details.php')}
                                    {renderUrlInput('nexus_pan_to_aadhar_url', '6. PAN To Aadhaar Unmasked URL', 'https://nexus-dashboard.space/api/v1/pan_card_api/pan_to_aadhar.php')}
                                    {renderUrlInput('nexus_pan_to_uid_url', '7. PAN To UID Advance URL', 'https://nexus-dashboard.space/api/v1/pan_card_api/pan_to_uid_s1.php')}
                                    {renderUrlInput('nexus_mobile_to_pan_url', '8. Mobile To PAN Endpoint URL', 'https://nexus-dashboard.space/api/v1/telecom_api/mobile_to_pan.php')}
                                </div>

                                <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                                    <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider mb-2">
                                        Optional Override Keys (Agar alag vendor/key use karni ho)
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {renderKeyInput('nexus_mobile_to_pan_key', 'Mobile To PAN Dedicated Key', 'Khali chhodne par Master Nexus Key use hogi')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. VAHAN & TRANSPORT (VEHICLE, RC & DL) */}
                    {isVisible('vahan') && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl border border-blue-200 dark:border-blue-900/50">
                                        <span className="material-symbols-outlined">directions_car</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                                            Vahan, RC & Driving Licence APIs
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Vehicle PUC (Direct & OTP), RC PDF Download, Learning Licence Download, Vehicle To Mobile, Vehicle Full Details
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* PUC Services */}
                                <div>
                                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                                        1. Vehicle PUC Certificate Endpoints
                                    </h4>
                                    <div className="space-y-3">
                                        {renderKeyInput('vahan_api_key', 'Vahan Master API Key', 'Enter Vahan / SMS Gateway Key...')}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {renderUrlInput('vahan_puc_without_otp_url', 'PUC Without OTP (Direct Fetch) URL', 'https://...')}
                                            {renderUrlInput('vahan_puc_send_otp_url', 'PUC Send OTP URL', 'https://... or api?mobile={mobile}&otp={otp}')}
                                            {renderUrlInput('vahan_puc_verify_otp_url', 'PUC Verify OTP URL', 'https://...')}
                                        </div>
                                    </div>
                                </div>

                                {/* RC & DL Services */}
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                                        2. Vehicle RC & Learning Licence PDF Download
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            {renderUrlInput('vahan_rc_pdf_url', 'Vehicle RC PDF Download URL', 'https://nexus-dashboard.space/api/v1/vahan_service_api/vechil_rc_pdf.php')}
                                            {renderKeyInput('vahan_rc_pdf_key', 'RC PDF API Key (Optional override)', 'Khali chhodne par Master Nexus Key use hogi')}
                                        </div>
                                        <div className="space-y-3">
                                            {renderUrlInput('vahan_learning_licence_url', 'Learning Licence PDF Download URL', 'https://nexus-dashboard.space/api/v1/vahan_service_api/learning_license_pdf.php')}
                                            {renderKeyInput('vahan_learning_licence_key', 'Learning Licence API Key (Optional override)', 'Khali chhodne par Master Nexus Key use hogi')}
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle Lookup (Paanel.shop / Custom) */}
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                                        3. Vehicle Mobile Number & Registration Details Lookups
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Vehicle To Mobile Number</span>
                                            {renderUrlInput('vehicle_to_mobile_api_url', 'Gateway Endpoint URL', 'https://api.paanel.shop/api/gateway.php')}
                                            {renderKeyInput('vehicle_to_mobile_api_key', 'API Key', 'e.g. DuXxZxX')}
                                        </div>
                                        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Vehicle Full Details (RC Search)</span>
                                            {renderUrlInput('vehicle_details_api_url', 'Gateway Endpoint URL', 'https://api.paanel.shop/api/gateway.php')}
                                            {renderKeyInput('vehicle_details_api_key', 'API Key', 'e.g. SamXverma')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. AADHAAR INFO & UPDATE SERVICES */}
                    {isVisible('aadhaar') && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-200 dark:border-amber-900/50">
                                        <span className="material-symbols-outlined">contact_mail</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                                            Aadhaar Info & Update Services API
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Aadhaar Number To Full Details/Address, Mobile Update, DOB Change, Surname Change, Full Name Change
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Mobile To Info */}
                                <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                                            Mobile To Info (10-Digit Mobile to Name, Address & Aadhaar)
                                        </h4>
                                        <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">Gateway: Custom Cloudflare Worker</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {renderUrlInput('mobile_to_info_api_url', 'Mobile To Info API URL', 'https://maikyaladledarlinggggg.watchwere19.workers.dev/?key=48hrs&q=9876543210', 'Full URL with query or template {key} and {mobile}')}
                                        {renderKeyInput('mobile_to_info_api_key', 'Mobile To Info API Key', '48hrs', 'Default key: 48hrs')}
                                    </div>
                                </div>

                                {/* Aadhaar To Info */}
                                <div className="p-4 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                                            Aadhaar No. To Info (Full Name, Father Name, Mobile & Address Search)
                                        </h4>
                                        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">Gateway: Paanel.shop / Custom</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {renderUrlInput('aadhar_to_info_api_url', 'Aadhaar To Info Gateway URL', 'https://api.paanel.shop/api/gateway.php')}
                                        {renderKeyInput('aadhar_to_info_api_key', 'Aadhaar To Info API Key', 'e.g. SamXverma')}
                                    </div>
                                </div>

                                {/* Aadhaar Card Updates */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Aadhaar Demographic Update Endpoints
                                    </h4>
                                    {renderKeyInput('aadhar_update_api_key', 'Aadhar Update API Key (Master)', 'Enter Aadhar Update API Key...')}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                                        {renderUrlInput('aadhar_update_mobile_update_url', 'Mobile Update URL', 'https://...')}
                                        {renderUrlInput('aadhar_update_dob_change_url', 'DOB Change URL', 'https://...')}
                                        {renderUrlInput('aadhar_update_surname_change_url', 'Surname Change URL', 'https://...')}
                                        {renderUrlInput('aadhar_update_full_name_change_url', 'Full Name Change URL', 'https://...')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. IDCARD.STORE (PVC & ASTROLOGY) */}
                    {isVisible('idcard') && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl border border-blue-200 dark:border-blue-900/50">
                                        <span className="material-symbols-outlined">badge</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                                                IDCard.Store API
                                            </h3>
                                            {data.idcard_store_api_key ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                    ✓ ACTIVE
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                                                    ✕ NOT SET
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Aadhaar PVC, Haryana Family ID PVC, Ayushman Bharat, Voter Card, PAN NSDL, e-Shram, DL Card, Kundli Generator
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href="https://idcard.store"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                                >
                                    <span>idcard.store</span>
                                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                </a>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {renderKeyInput(
                                    'idcard_store_api_key',
                                    'IDCard.Store API Key',
                                    'e.g. 71ebc340-7c80-4c8f-9613-250094ba27c3',
                                    'PVC card generate karne ke liye IDCard.Store account me balance hona chahiye.'
                                )}
                                {renderUrlInput(
                                    'idcard_store_base_url',
                                    'IDCard.Store Base API URL',
                                    'https://api.idcard.store',
                                    'Default: https://api.idcard.store (Badalna ho tabhi change karein)'
                                )}
                            </div>
                        </div>
                    )}

                    {/* 5. PPP API (HARYANA PARIVAR PEHCHAN PATRA) */}
                    {isVisible('ppp') && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xl border border-orange-200 dark:border-orange-900/50">
                                        <span className="material-symbols-outlined">groups</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                                            PPP API (Haryana Parivar Pehchan Patra)
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Aadhar To Family ID, PPP To Aadhar All Members, PPP To Mobile, PPP To Bank
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {renderKeyInput('ppp_api_key', 'PPP API Key (Bearer / Custom)', 'Enter PPP API Key...')}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                    {renderUrlInput('ppp_aadhar_to_ppp_url', 'Aadhar → PPP Family ID Endpoint URL', 'https://fasal.haryana.gov.in/Home/GetFDbyAadhar')}
                                    {renderUrlInput('ppp_to_aadhar_url', 'PPP → Aadhar All Members Endpoint URL', 'https://...')}
                                    {renderUrlInput('ppp_to_mobile_url', 'PPP → Mobile All Members Endpoint URL', 'https://...')}
                                    {renderUrlInput('ppp_to_bank_url', 'PPP → Bank Details & IFSC Endpoint URL', 'https://...')}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 6. VOTER SERVICES */}
                    {isVisible('voter') && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl border border-indigo-200 dark:border-indigo-900/50">
                                        <span className="material-symbols-outlined">how_to_vote</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                                            Voter Services API
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            S.I.R Voter Card List Search, Voter Mobile Update Instant
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">1. S.I.R Voter Card List API</span>
                                    {renderKeyInput('voter_api_key', 'Voter API Key', 'Enter Voter API Key...')}
                                    {renderUrlInput('voter_sir_voter_list_url', 'SIR Voter List URL', 'https://...')}
                                </div>
                                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">2. Voter Mobile Link / Update Instant</span>
                                    {renderUrlInput('voter_mobile_update_url', 'Voter Mobile Update URL', 'https://nexus-dashboard.space/api/v1/voter_card_api/voter_mobile_link.php')}
                                    {renderKeyInput('voter_mobile_update_key', 'Dedicated Key (Optional override)', 'Khali chhodne par Master Nexus Key use hogi')}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 7. CARD MAKER & PDF TOOLS */}
                    {isVisible('tools') && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xl border border-teal-200 dark:border-teal-900/50">
                                        <span className="material-symbols-outlined">style</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                                            Card Maker Tools & PDF Editor APIs
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Voter Card Manual, Aadhaar Manual, Voter Address Change, PDF Editor & Resizer
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Card Maker */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                                        1. Manual Card Maker Endpoints
                                    </h4>
                                    {renderKeyInput('card_maker_api_key', 'Card Maker API Key', 'Enter Card Maker API Key...')}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {renderUrlInput('card_maker_voter_card_url', 'Voter Card URL', 'https://...')}
                                        {renderUrlInput('card_maker_aadhar_card_url', 'Aadhaar Manual URL', 'https://...')}
                                        {renderUrlInput('card_maker_voter_address_change_url', 'Voter Address Change URL', 'https://...')}
                                    </div>
                                </div>

                                {/* PDF Editor */}
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                    <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                                        2. PDF Editor & Resizer Tool API
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {renderKeyInput('pdf_api_key', 'PDF Tool API Key', 'Enter PDF API Key...')}
                                        {renderUrlInput('pdf_editor_api_url', 'PDF Editor API URL', 'https://...')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 8. ABHA HEALTH ID (ABDM) */}
                    {isVisible('abha') && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-200 dark:border-emerald-900/50">
                                        <span className="material-symbols-outlined">medical_services</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                                            ABHA Health ID (Ayushman Bharat Digital Mission - ABDM v3)
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Aadhaar OTP ke zariye instant ABHA Number & Health Card generate karein
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href="https://abha.abdm.gov.in"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                                >
                                    <span>abha.abdm.gov.in</span>
                                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                </a>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {renderUrlInput('abha_api_url', 'ABDM Gateway URL', 'https://abha.abdm.gov.in/abha/v3')}
                                    {renderKeyInput('abha_api_key', 'ABHA API Key / Bearer Token', 'Enter ABHA Gateway Token...')}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                    {renderKeyInput('abha_client_id', 'ABDM Client ID (Optional)', 'Enter Client ID...')}
                                    {renderKeyInput('abha_client_secret', 'ABDM Client Secret (Optional)', 'Enter Client Secret...')}
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                    💡 Agar official ABDM credentials khali chhodte hain toh service safe interactive preview mode me generate karti hai.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 9. UTILITIES & GOVERNMENT PORTALS */}
                    {isVisible('utilities') && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xl border border-cyan-200 dark:border-cyan-900/50">
                                        <span className="material-symbols-outlined">account_balance</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                                            Government Portals & Utility Endpoints
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            DHBVN & UHBVN Electricity Bills, Saral Haryana Status, Kundli City Autocomplete, IFSC & Pincode Lookups
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {renderUrlInput('dhbvn_bill_url', 'DHBVN Electricity Bill URL', 'https://dhbvn.org.in/Rapdrp/BD?UID=', 'Account number append hota hai')}
                                {renderUrlInput('uhbvn_bill_url', 'UHBVN Electricity Bill URL', 'https://uhbvn.org.in/Rapdrp/BD?UID=', 'Account number append hota hai')}
                                {renderUrlInput('saral_status_url', 'Saral Haryana Status URL', 'https://edisha.gov.in/eForms/Status', 'Default: https://edisha.gov.in/eForms/Status')}
                                {renderUrlInput('kundli_city_autocomplete_url', 'Kundli City Autocomplete URL', 'https://kundli.amd64.workers.dev/AstroChat/cities/allcountries/autocomplete')}
                                {renderUrlInput('ifsc_api_url', 'Razorpay IFSC Verification API URL', 'https://ifsc.razorpay.com', 'Default: https://ifsc.razorpay.com')}
                                {renderUrlInput('pincode_api_url', 'India Post Pincode Lookup API URL', 'https://api.postalpincode.in/pincode', 'Default: https://api.postalpincode.in/pincode')}
                            </div>
                        </div>
                    )}

                    {/* 10. CALLMEBOT WHATSAPP NOTIFICATIONS */}
                    {isVisible('callmebot') && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-200 dark:border-emerald-900/50">
                                        <span className="material-symbols-outlined">chat</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                                                CallMeBot WhatsApp Notifications
                                            </h3>
                                            {data.callmebot_phone && data.callmebot_api_key ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                    ✓ ACTIVE
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                                                    ⚠ INCOMPLETE
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            User jab coin buy request kare ya nayi service request dale, to Admin ko direct WhatsApp alert milega.
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href="https://www.callmebot.com/blog/free-api-whatsapp-messages/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                                >
                                    <span>callmebot.com</span>
                                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                </a>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                        Admin WhatsApp Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={data.callmebot_phone}
                                        onChange={e => setData('callmebot_phone', e.target.value)}
                                        placeholder="e.g. +91XXXXXXXXXX or +380630323112"
                                        className="w-full text-sm px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                    />
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Country code ke sath (e.g. +919876543210)</p>
                                </div>

                                <div>
                                    {renderKeyInput('callmebot_api_key', 'CallMeBot API Key', 'e.g. 4635705', 'CallMeBot bot se mila 6-7 digit apikey code')}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom Sticky-like Save Action */}
                    <div className="sticky bottom-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-base text-blue-500">check_circle</span>
                            <span>Save karne ke baad portal ki sabhi services me nayi API keys aur URLs turant live apply ho jate hain.</span>
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-lg">
                                {processing ? 'hourglass_top' : 'save'}
                            </span>
                            <span>{processing ? 'Saving Settings...' : 'Save All API Settings'}</span>
                        </button>
                    </div>

                </form>

            </div>
        </AdminLayout>
    );
}
