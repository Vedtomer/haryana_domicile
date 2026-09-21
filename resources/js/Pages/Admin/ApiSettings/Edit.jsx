import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Edit({ settings = {} }) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [showKeys, setShowKeys] = useState({});

    const { data, setData, put, processing } = useForm({
        // IDCard.Store
        idcard_store_api_key: settings.idcard_store_api_key || '',

        // Nexus
        nexus_api_key: settings.nexus_api_key || '',

        // CallMeBot WhatsApp
        callmebot_phone: settings.callmebot_phone || '',
        callmebot_api_key: settings.callmebot_api_key || '',

        // PPP API
        ppp_api_key: settings.ppp_api_key || '',
        ppp_aadhar_to_ppp_url: settings.ppp_aadhar_to_ppp_url || '',
        ppp_to_aadhar_url: settings.ppp_to_aadhar_url || '',
        ppp_to_mobile_url: settings.ppp_to_mobile_url || '',
        ppp_to_bank_url: settings.ppp_to_bank_url || '',

        // Vahan API
        vahan_api_key: settings.vahan_api_key || '',
        vahan_puc_without_otp_url: settings.vahan_puc_without_otp_url || '',
        vahan_puc_send_otp_url: settings.vahan_puc_send_otp_url || '',
        vahan_puc_verify_otp_url: settings.vahan_puc_verify_otp_url || '',

        // Voter API
        voter_api_key: settings.voter_api_key || '',
        voter_sir_voter_list_url: settings.voter_sir_voter_list_url || '',

        // PDF Editor
        pdf_api_key: settings.pdf_api_key || '',
        pdf_editor_api_url: settings.pdf_editor_api_url || '',

        // Card Maker
        card_maker_api_key: settings.card_maker_api_key || '',
        card_maker_voter_card_url: settings.card_maker_voter_card_url || '',
        card_maker_aadhar_card_url: settings.card_maker_aadhar_card_url || '',
        card_maker_voter_address_change_url: settings.card_maker_voter_address_change_url || '',

        // Aadhar Update
        aadhar_update_api_key: settings.aadhar_update_api_key || '',
        aadhar_update_mobile_update_url: settings.aadhar_update_mobile_update_url || '',
        aadhar_update_dob_change_url: settings.aadhar_update_dob_change_url || '',
        aadhar_update_surname_change_url: settings.aadhar_update_surname_change_url || '',
        aadhar_update_full_name_change_url: settings.aadhar_update_full_name_change_url || '',
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
        { id: 'all', label: 'All APIs', icon: 'apps' },
        { id: 'idcard', label: 'IDCard.Store (PVC)', icon: 'badge' },
        { id: 'nexus', label: 'Nexus API (KYC)', icon: 'fingerprint' },
        { id: 'callmebot', label: 'WhatsApp Alerts', icon: 'chat' },
        { id: 'ppp', label: 'PPP Family ID', icon: 'groups' },
        { id: 'vahan', label: 'Vahan & Voter', icon: 'directions_car' },
        { id: 'tools', label: 'Card Maker & Aadhar', icon: 'build' },
    ];

    const isVisible = (cat) => activeCategory === 'all' || activeCategory === cat;

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">key</span>
                    <h1 className="text-lg font-bold text-gray-800 dark:text-white">API Settings & Configuration</h1>
                </div>
            }
        >
            <Head title="API Settings - Admin" />

            <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Top Banner */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
                    <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                        <span className="material-symbols-outlined text-9xl">key</span>
                    </div>
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-3 border border-blue-400/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Live API Management Portal
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">API Key & Service Configuration</h2>
                            <p className="mt-1.5 text-sm text-blue-200/90 max-w-2xl leading-relaxed">
                                Yahan se aap portal me use hone wali sabhi services ki API keys aur endpoints asani se enter aur change kar sakte hain. Ye settings database me save hoti hain aur live update hoti hain.
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

                {/* Filter Navigation Tabs */}
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

                    {/* 1. IDCard.Store API */}
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
                                            Aadhaar PVC, Haryana Family ID PVC, Ayushman Bharat, Voter Card, PAN NSDL, e-Shram, DL Card, Kundli
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

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                        IDCard.Store API Key
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showKeys['idcard_store_api_key'] ? 'text' : 'password'}
                                            value={data.idcard_store_api_key}
                                            onChange={e => setData('idcard_store_api_key', e.target.value)}
                                            placeholder="e.g. 71ebc340-7c80-4c8f-9613-250094ba27c3"
                                            className="w-full font-mono text-sm px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none pr-12 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleShowKey('idcard_store_api_key')}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                {showKeys['idcard_store_api_key'] ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                                        Yeh key direct idcard.store dashboard se milti hai. PVC card generate karne ke liye account me balance hona chahiye.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Nexus API */}
                    {isVisible('nexus') && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl border border-purple-200 dark:border-purple-900/50">
                                        <span className="material-symbols-outlined">fingerprint</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                                                Nexus API
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
                                            Aadhar To Name, Aadhar To Mask PAN, Aadhar To Unmasked PAN, PAN Details (Server 2)
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
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                        Nexus API Key
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showKeys['nexus_api_key'] ? 'text' : 'password'}
                                            value={data.nexus_api_key}
                                            onChange={e => setData('nexus_api_key', e.target.value)}
                                            placeholder="e.g. 38cc07892c07c566e3ce1a3289c589e284954d7c0e593386"
                                            className="w-full font-mono text-sm px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none pr-12 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleShowKey('nexus_api_key')}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                {showKeys['nexus_api_key'] ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                                        Nexus API key se Aadhar verification, name lookup aur PAN details instant fetch hoti hain.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. CallMeBot WhatsApp Alerts */}
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
                                        className="w-full text-sm px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                    />
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Country code ke sath (e.g. +919876543210)</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                        CallMeBot API Key
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showKeys['callmebot_api_key'] ? 'text' : 'password'}
                                            value={data.callmebot_api_key}
                                            onChange={e => setData('callmebot_api_key', e.target.value)}
                                            placeholder="e.g. 4635705"
                                            className="w-full font-mono text-sm px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none pr-12 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleShowKey('callmebot_api_key')}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                {showKeys['callmebot_api_key'] ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">CallMeBot bot se mila 6-7 digit apikey code</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. PPP API (Haryana Parivar Pehchan Patra) */}
                    {isVisible('ppp') && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xl border border-orange-200 dark:border-orange-900/50">
                                        <span className="material-symbols-outlined">groups</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                                                PPP API (Parivar Pehchan Patra)
                                            </h3>
                                            {data.ppp_api_key ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                    ✓ CONFIGURED
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                    OPTIONAL
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Aadhar To Family ID, PPP To Aadhar All Members, PPP To Mobile, PPP To Bank
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        PPP API Key
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showKeys['ppp_api_key'] ? 'text' : 'password'}
                                            value={data.ppp_api_key}
                                            onChange={e => setData('ppp_api_key', e.target.value)}
                                            placeholder="Enter PPP API Key..."
                                            className="w-full font-mono text-sm px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none pr-12 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleShowKey('ppp_api_key')}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                {showKeys['ppp_api_key'] ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            Aadhar → PPP Endpoint URL
                                        </label>
                                        <input
                                            type="text"
                                            value={data.ppp_aadhar_to_ppp_url}
                                            onChange={e => setData('ppp_aadhar_to_ppp_url', e.target.value)}
                                            placeholder="https://... or default fasal portal"
                                            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            PPP → Aadhar All Members URL
                                        </label>
                                        <input
                                            type="text"
                                            value={data.ppp_to_aadhar_url}
                                            onChange={e => setData('ppp_to_aadhar_url', e.target.value)}
                                            placeholder="https://..."
                                            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            PPP → Mobile All Members URL
                                        </label>
                                        <input
                                            type="text"
                                            value={data.ppp_to_mobile_url}
                                            onChange={e => setData('ppp_to_mobile_url', e.target.value)}
                                            placeholder="https://..."
                                            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            PPP → Bank Details URL
                                        </label>
                                        <input
                                            type="text"
                                            value={data.ppp_to_bank_url}
                                            onChange={e => setData('ppp_to_bank_url', e.target.value)}
                                            placeholder="https://..."
                                            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. Vahan & Voter APIs */}
                    {isVisible('vahan') && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                            {/* Vahan PUC */}
                            <div>
                                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                        <span className="material-symbols-outlined">directions_car</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-white">Vahan API (Vehicle PUC)</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">PUC With OTP, PUC Without OTP Services</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Vahan API Key
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showKeys['vahan_api_key'] ? 'text' : 'password'}
                                                value={data.vahan_api_key}
                                                onChange={e => setData('vahan_api_key', e.target.value)}
                                                placeholder="Enter Vahan API Key..."
                                                className="w-full font-mono text-sm px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-blue-500 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleShowKey('vahan_api_key')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">
                                                    {showKeys['vahan_api_key'] ? 'visibility_off' : 'visibility'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Without OTP URL</label>
                                            <input
                                                type="text"
                                                value={data.vahan_puc_without_otp_url}
                                                onChange={e => setData('vahan_puc_without_otp_url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Send OTP URL</label>
                                            <input
                                                type="text"
                                                value={data.vahan_puc_send_otp_url}
                                                onChange={e => setData('vahan_puc_send_otp_url', e.target.value)}
                                                placeholder="https://... or api?mobile={mobile}&otp={otp}"
                                                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Verify OTP URL</label>
                                            <input
                                                type="text"
                                                value={data.vahan_puc_verify_otp_url}
                                                onChange={e => setData('vahan_puc_verify_otp_url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                                        💡 <strong>Tip:</strong> Live SMS bhejne ke liye apne Vahan ya SMS Gateway ka endpoint yahan enter karein. Agar URL me <code className="text-blue-500 font-mono">{"{mobile}"}</code>, <code className="text-blue-500 font-mono">{"{otp}"}</code>, <code className="text-blue-500 font-mono">{"{reg_no}"}</code> placeholders hain to system unhe auto-replace karega. Agar URL khali rahega to service safe Demo Mode (OTP: 1234) me chalegi.
                                    </p>
                                </div>
                            </div>

                            {/* Voter API */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                        <span className="material-symbols-outlined">how_to_vote</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-white">Voter API (SIR Voter List)</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Voter Card search & list endpoints</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Voter API Key
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showKeys['voter_api_key'] ? 'text' : 'password'}
                                                value={data.voter_api_key}
                                                onChange={e => setData('voter_api_key', e.target.value)}
                                                placeholder="Enter Voter API Key..."
                                                className="w-full font-mono text-sm px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-indigo-500 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleShowKey('voter_api_key')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">
                                                    {showKeys['voter_api_key'] ? 'visibility_off' : 'visibility'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">SIR Voter List URL</label>
                                        <input
                                            type="text"
                                            value={data.voter_sir_voter_list_url}
                                            onChange={e => setData('voter_sir_voter_list_url', e.target.value)}
                                            placeholder="https://..."
                                            className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 6. Card Maker & Aadhar Update Tools */}
                    {isVisible('tools') && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                            {/* Card Maker */}
                            <div>
                                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                                        <span className="material-symbols-outlined">style</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-white">Card Maker API</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Voter Card Manual, Aadhaar Manual, Voter Address Change</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Card Maker API Key
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showKeys['card_maker_api_key'] ? 'text' : 'password'}
                                                value={data.card_maker_api_key}
                                                onChange={e => setData('card_maker_api_key', e.target.value)}
                                                placeholder="Enter Card Maker API Key..."
                                                className="w-full font-mono text-sm px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-teal-500 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleShowKey('card_maker_api_key')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">
                                                    {showKeys['card_maker_api_key'] ? 'visibility_off' : 'visibility'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Voter Card URL</label>
                                            <input
                                                type="text"
                                                value={data.card_maker_voter_card_url}
                                                onChange={e => setData('card_maker_voter_card_url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Aadhaar Card Manual URL</label>
                                            <input
                                                type="text"
                                                value={data.card_maker_aadhar_card_url}
                                                onChange={e => setData('card_maker_aadhar_card_url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Voter Address Change URL</label>
                                            <input
                                                type="text"
                                                value={data.card_maker_voter_address_change_url}
                                                onChange={e => setData('card_maker_voter_address_change_url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Aadhar Update API */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                                        <span className="material-symbols-outlined">edit_square</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-white">Aadhar Update API</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Mobile Update, DOB Change, Surname & Full Name Change</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Aadhar Update API Key
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showKeys['aadhar_update_api_key'] ? 'text' : 'password'}
                                                value={data.aadhar_update_api_key}
                                                onChange={e => setData('aadhar_update_api_key', e.target.value)}
                                                placeholder="Enter Aadhar Update API Key..."
                                                className="w-full font-mono text-sm px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-amber-500 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleShowKey('aadhar_update_api_key')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">
                                                    {showKeys['aadhar_update_api_key'] ? 'visibility_off' : 'visibility'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Mobile Update URL</label>
                                            <input
                                                type="text"
                                                value={data.aadhar_update_mobile_update_url}
                                                onChange={e => setData('aadhar_update_mobile_update_url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">DOB Change URL</label>
                                            <input
                                                type="text"
                                                value={data.aadhar_update_dob_change_url}
                                                onChange={e => setData('aadhar_update_dob_change_url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Surname Change URL</label>
                                            <input
                                                type="text"
                                                value={data.aadhar_update_surname_change_url}
                                                onChange={e => setData('aadhar_update_surname_change_url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name Change URL</label>
                                            <input
                                                type="text"
                                                value={data.aadhar_update_full_name_change_url}
                                                onChange={e => setData('aadhar_update_full_name_change_url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PDF Editor API */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                                        <span className="material-symbols-outlined">picture_as_pdf</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-white">PDF Editor API</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">PDF Editor & Resizer endpoints</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            PDF API Key
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showKeys['pdf_api_key'] ? 'text' : 'password'}
                                                value={data.pdf_api_key}
                                                onChange={e => setData('pdf_api_key', e.target.value)}
                                                placeholder="Enter PDF API Key..."
                                                className="w-full font-mono text-sm px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-rose-500 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleShowKey('pdf_api_key')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">
                                                    {showKeys['pdf_api_key'] ? 'visibility_off' : 'visibility'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">PDF Editor API URL</label>
                                        <input
                                            type="text"
                                            value={data.pdf_editor_api_url}
                                            onChange={e => setData('pdf_editor_api_url', e.target.value)}
                                            placeholder="https://..."
                                            className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom Save Action */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-base text-blue-500">info</span>
                            <span>Save karne ke baad changes turant live apply ho jate hain. Kisi restart ki zaroorat nahi hai.</span>
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
