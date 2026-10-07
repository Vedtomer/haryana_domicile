import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import FrontendLayout from '../../Layouts/FrontendLayout';

const CATEGORIES = [
    { id: 'all', label: 'All Services', icon: '📋' },
    { id: 'new', label: 'New Services', icon: '🔥' },
    { id: 'pan', label: 'PAN Card', icon: '💳' },
    { id: 'aadhaar', label: 'Aadhaar', icon: '🆔' },
    { id: 'dl', label: 'DL (Licence)', icon: '🚗' },
    { id: 'rc', label: 'RC (Vehicle)', icon: '🚙' },
    { id: 'pvc', label: 'PVC Cards', icon: '🪪' },
    { id: 'certificates', label: 'Certificates & Print', icon: '📜' },
];

const matchesCategory = (service, catId) => {
    if (catId === 'all') return true;
    if (catId === 'new') return Boolean(service.is_new);

    const text = `${service.name || ''} ${service.slug || ''} ${service.description || ''} ${service.kind || ''}`.toLowerCase();

    if (catId === 'pan') {
        return text.includes('pan');
    }
    if (catId === 'aadhaar') {
        return text.includes('aadhar') || text.includes('aadhaar') || text.includes('uid');
    }
    if (catId === 'dl') {
        return text.includes('driving') || text.includes('licence') || text.includes('license') || text.includes(' dl') || text.includes('-dl-') || text.includes('dl ');
    }
    if (catId === 'rc') {
        return text.includes('vehicle') || text.includes('rc ') || text.includes(' rc') || text.includes('(rc)') || text.includes('vahan');
    }
    if (catId === 'pvc') {
        return text.includes('pvc') || text.includes('card maker') || (text.includes('card') && !text.includes('pan-card'));
    }
    if (catId === 'certificates') {
        return text.includes('print') || text.includes('certificate') || text.includes('marriage') || 
               text.includes('birth') || text.includes('domicile') || text.includes('saral') || 
               text.includes('bill') || text.includes('electricity') || text.includes('passport') ||
               text.includes('passbook') || text.includes('kundli') || text.includes('affidavit');
    }
    return true;
};

const COLOR_THEMES = [
    // 0. Purple / Fuchsia / Violet (Like Card 1: DL TO MOBILE FIND)
    {
        name: 'purple',
        borderColor: 'border-2 border-[#e879f9] dark:border-fuchsia-600',
        bgGradient: 'bg-gradient-to-b from-white via-[#fdf4ff]/50 to-[#fae8ff]/80 dark:from-slate-900 dark:via-slate-900 dark:to-fuchsia-950/30',
        hoverShadow: 'hover:shadow-[0_22px_45px_-12px_rgba(217,70,239,0.38)]',
        ribbonBg: 'bg-gradient-to-r from-[#d946ef] to-[#c026d3]',
        dotColor: 'bg-[#d946ef]/70 dark:bg-fuchsia-400/60',
        iconBg: 'bg-gradient-to-tr from-[#c026d3] via-[#d946ef] to-[#e879f9]',
        iconGlow: 'shadow-[0_10px_25px_-5px_rgba(217,70,239,0.45)]',
        primaryText: 'text-[#c026d3] dark:text-fuchsia-400',
        priceBg: 'bg-[#c026d3]',
        btnGrad: 'from-[#86198f] via-[#701a75] to-[#4a044e] hover:from-[#a21caf] hover:to-[#581c87]',
        btnShadow: 'shadow-md shadow-fuchsia-900/30',
    },
    // 1. Electric Blue (Like Card 2: E-SHRAM MOBILE UPDATE)
    {
        name: 'blue',
        borderColor: 'border-2 border-[#60a5fa] dark:border-blue-600',
        bgGradient: 'bg-gradient-to-b from-white via-[#eff6ff]/50 to-[#dbeafe]/80 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30',
        hoverShadow: 'hover:shadow-[0_22px_45px_-12px_rgba(37,99,235,0.38)]',
        ribbonBg: 'bg-gradient-to-r from-[#3b82f6] to-[#2563eb]',
        dotColor: 'bg-[#3b82f6]/70 dark:bg-blue-400/60',
        iconBg: 'bg-gradient-to-tr from-[#1d4ed8] via-[#2563eb] to-[#60a5fa]',
        iconGlow: 'shadow-[0_10px_25px_-5px_rgba(37,99,235,0.45)]',
        primaryText: 'text-[#1d4ed8] dark:text-blue-400',
        priceBg: 'bg-[#2563eb]',
        btnGrad: 'from-[#1e3a8a] via-[#1d4ed8] to-[#172554] hover:from-[#2563eb] hover:to-[#1e3a8a]',
        btnShadow: 'shadow-md shadow-blue-900/30',
    },
    // 2. Emerald Teal (Like Card 3: E-SHRAM PDF)
    {
        name: 'teal',
        borderColor: 'border-2 border-[#34d399] dark:border-emerald-600',
        bgGradient: 'bg-gradient-to-b from-white via-[#ecfdf5]/50 to-[#d1fae5]/80 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30',
        hoverShadow: 'hover:shadow-[0_22px_45px_-12px_rgba(5,150,105,0.38)]',
        ribbonBg: 'bg-gradient-to-r from-[#10b981] to-[#059669]',
        dotColor: 'bg-[#10b981]/70 dark:bg-emerald-400/60',
        iconBg: 'bg-gradient-to-tr from-[#047857] via-[#059669] to-[#34d399]',
        iconGlow: 'shadow-[0_10px_25px_-5px_rgba(5,150,105,0.45)]',
        primaryText: 'text-[#047857] dark:text-emerald-400',
        priceBg: 'bg-[#059669]',
        btnGrad: 'from-[#064e3b] via-[#047857] to-[#022c22] hover:from-[#059669] hover:to-[#064e3b]',
        btnShadow: 'shadow-md shadow-emerald-900/30',
    },
    // 3. Royal Indigo / Violet (Like Card 4: EID TO AADHAAR NUMBER)
    {
        name: 'violet',
        borderColor: 'border-2 border-[#a78bfa] dark:border-indigo-600',
        bgGradient: 'bg-gradient-to-b from-white via-[#f5f3ff]/50 to-[#ede9fe]/80 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30',
        hoverShadow: 'hover:shadow-[0_22px_45px_-12px_rgba(109,40,217,0.38)]',
        ribbonBg: 'bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]',
        dotColor: 'bg-[#8b5cf6]/70 dark:bg-violet-400/60',
        iconBg: 'bg-gradient-to-tr from-[#5b21b6] via-[#6d28d9] to-[#a78bfa]',
        iconGlow: 'shadow-[0_10px_25px_-5px_rgba(109,40,217,0.45)]',
        primaryText: 'text-[#5b21b6] dark:text-violet-400',
        priceBg: 'bg-[#6d28d9]',
        btnGrad: 'from-[#4c1d95] via-[#5b21b6] to-[#2e1065] hover:from-[#6d28d9] hover:to-[#4c1d95]',
        btnShadow: 'shadow-md shadow-indigo-900/30',
    },
    // 4. Berry Magenta / Pink (Like Card 5: LAND SEEDING YES)
    {
        name: 'pink',
        borderColor: 'border-2 border-[#f472b6] dark:border-pink-600',
        bgGradient: 'bg-gradient-to-b from-white via-[#fdf2f8]/50 to-[#fce7f3]/80 dark:from-slate-900 dark:via-slate-900 dark:to-pink-950/30',
        hoverShadow: 'hover:shadow-[0_22px_45px_-12px_rgba(219,39,119,0.38)]',
        ribbonBg: 'bg-gradient-to-r from-[#ec4899] to-[#db2777]',
        dotColor: 'bg-[#ec4899]/70 dark:bg-pink-400/60',
        iconBg: 'bg-gradient-to-tr from-[#9d174d] via-[#be185d] to-[#f472b6]',
        iconGlow: 'shadow-[0_10px_25px_-5px_rgba(219,39,119,0.45)]',
        primaryText: 'text-[#9d174d] dark:text-pink-400',
        priceBg: 'bg-[#be185d]',
        btnGrad: 'from-[#700c3b] via-[#831843] to-[#500724] hover:from-[#9d174d] hover:to-[#700c3b]',
        btnShadow: 'shadow-md shadow-pink-900/30',
    },
    // 5. Amber Sunset Orange
    {
        name: 'orange',
        borderColor: 'border-2 border-[#fbbf24] dark:border-amber-600',
        bgGradient: 'bg-gradient-to-b from-white via-[#fffbeb]/50 to-[#fef3c7]/80 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30',
        hoverShadow: 'hover:shadow-[0_22px_45px_-12px_rgba(217,119,6,0.38)]',
        ribbonBg: 'bg-gradient-to-r from-[#f59e0b] to-[#d97706]',
        dotColor: 'bg-[#f59e0b]/70 dark:bg-amber-400/60',
        iconBg: 'bg-gradient-to-tr from-[#b45309] via-[#d97706] to-[#fcd34d]',
        iconGlow: 'shadow-[0_10px_25px_-5px_rgba(217,119,6,0.45)]',
        primaryText: 'text-[#b45309] dark:text-amber-400',
        priceBg: 'bg-[#d97706]',
        btnGrad: 'from-[#78350f] via-[#9a3412] to-[#431407] hover:from-[#b45309] hover:to-[#78350f]',
        btnShadow: 'shadow-md shadow-amber-900/30',
    },
];

function splitServiceName(name = '') {
    const clean = name.trim();
    if (!clean) return { main: 'PORTAL', highlight: 'SERVICE' };
    const parts = clean.split(/\s+/);
    if (parts.length <= 1) {
        return { main: clean, highlight: 'SERVICE' };
    }
    const lastWord = parts[parts.length - 1].toUpperCase();
    const actionWords = ['FIND', 'UPDATE', 'PDF', 'NUMBER', 'YES', 'INSTANT', 'DOWNLOAD', 'CHECK', 'APPLY', 'SEARCH', 'PRINT', 'VERIFY', 'S1', 'S2', 'S3', 'S4'];
    if (actionWords.includes(lastWord) || parts.length >= 3) {
        const highlight = parts.pop();
        return { main: parts.join(' '), highlight };
    }
    return { main: parts[0], highlight: parts.slice(1).join(' ') };
}

function getServiceBullets(service) {
    if (service.bullets && Array.isArray(service.bullets) && service.bullets.length > 0) {
        return service.bullets.slice(0, 3);
    }
    const nameLower = (service.name || '').toLowerCase();
    if (nameLower.includes('pan')) {
        return ['Instant Result Online', 'Aadhaar / UID Based', '24x7 Fast Processing'];
    }
    if (nameLower.includes('voter')) {
        return ['Original Voter PDF', 'EPIC Number Based', 'Direct Instant Download'];
    }
    if (nameLower.includes('vehicle') || nameLower.includes('rc') || nameLower.includes('dl')) {
        return ['Vehicle / DL Info', 'Real-time Vahan Sync', 'Instant Verification'];
    }
    if (nameLower.includes('shram')) {
        return ['e-Shram Record', 'Instant Download / Edit', 'UID & Mobile Linked'];
    }
    if (nameLower.includes('aadhar')) {
        return ['Aadhaar Services', 'Official Fast Portal', 'Safe & Encrypted'];
    }
    if (nameLower.includes('land') || nameLower.includes('seeding')) {
        return ['Land seeding request', 'Simple online form', 'Track in Reports'];
    }
    return ['Quick, secure & instant', 'Online Verification', '24x7 Available'];
}

export default function Home({ services = [] }) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('all');
    const [selectedServiceForModal, setSelectedServiceForModal] = useState(null);

    const isLoggedIn = Boolean(auth?.user);

    // Sort services alphabetically by name, excluding Haryana Domicile from public view
    const sortedServices = [...services]
        .filter((s) => s.slug !== 'haryana-domicile' && !s.name?.toLowerCase().includes('haryana domicile'))
        .sort((a, b) =>
            (a.name || '').trim().localeCompare((b.name || '').trim(), undefined, { sensitivity: 'base' })
        );

    // Filter services by active category tab
    const filteredServices = sortedServices.filter((service) => matchesCategory(service, activeTab));

    const handleServiceClick = (service) => {
        const isInactive = !service.is_active || service.is_active === '0' || service.is_active === 'false';
        if (isInactive) {
            return;
        }

        if (!isLoggedIn) {
            setSelectedServiceForModal(service);
            return;
        }

        // If logged in, navigate to target url
        if (service.url) {
            window.location.href = service.url;
        } else {
            window.location.href = '/dashboard#services';
        }
    };

    return (
        <FrontendLayout>
            <div className="bg-background min-h-screen">
                <Head>
                    <title>CertifyIndia - Digital Citizen Services Portal</title>
                    <meta name="description" content="All-in-one portal for digital citizen services: PAN Card, Aadhaar, Driving Licence, RC, Certificates & Print." />
                    <meta name="google-site-verification" content="Zxs-a1knaNGxKY1LKqvpNlvG_Xgk9kAYMuP0zGStEdU" />
                </Head>

                {/* Hero Section */}
                <div className="relative pt-12 pb-16 sm:pt-20 sm:pb-20 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary-fixed/30 rounded-full blur-3xl opacity-70"></div>
                        <div className="absolute top-40 -left-20 w-[500px] h-[500px] bg-secondary-fixed/30 rounded-full blur-3xl opacity-60"></div>
                    </div>
                    
                    <div className="relative z-10 max-w-[1280px] mx-auto px-6 text-center mt-6">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-xs sm:text-sm mb-6 shadow-sm">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                            ⚡ Verified Government & Citizen Services Portal
                        </div>
                        
                        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6 leading-tight tracking-tight">
                            Digital Citizen & Government Services, <br className="hidden md:block" />
                            <span className="text-secondary bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Fast, Direct & Secured
                            </span>
                        </h1>
                        
                        <p className="mt-3 max-w-2xl font-body-lg text-body-lg text-on-surface-variant mx-auto mb-8 leading-relaxed">
                            Unified portal for PAN Cards, PVC Cards, Driving Licence, Vehicle RC, Marriage Registration, and utility services.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            {isLoggedIn ? (
                                <Link 
                                    href="/dashboard" 
                                    className="inline-flex items-center justify-center px-8 py-3.5 font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    Open My Dashboard
                                    <span className="material-symbols-outlined ml-2" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                                </Link>
                            ) : (
                                <>
                                    <Link 
                                        href="/login" 
                                        className="inline-flex items-center justify-center px-8 py-3.5 font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        Portal Login
                                        <span className="material-symbols-outlined ml-2" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
                                    </Link>
                                    <Link 
                                        href="/register" 
                                        className="inline-flex items-center justify-center px-8 py-3.5 font-bold rounded-xl text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-500 shadow-md hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        Register New Account
                                        <span className="material-symbols-outlined ml-2">person_add</span>
                                    </Link>
                                </>
                            )}
                            <a 
                                href="#services" 
                                className="inline-flex items-center justify-center px-7 py-3.5 font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300"
                            >
                                Browse All Services
                                <span className="material-symbols-outlined ml-2">expand_more</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 3D Services Showcase Section */}
                <div id="services" className="py-16 bg-surface-container-lowest relative z-10 border-t border-slate-200 dark:border-slate-800">
                    <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
                        
                        {/* Section Header */}
                        <div className="text-center max-w-3xl mx-auto mb-10">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                                <span>🌐</span> Portal Services Directory
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Explore All Available Services
                            </h2>
                            <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
                                Browse all active portal services. You can view full service details freely below; to run or submit any service, simply login with your account.
                            </p>
                        </div>

                        {/* Category Filter Pills (No search bar, no counts) */}
                        <div className="flex items-center justify-center flex-wrap gap-2.5 mb-10">
                            {CATEGORIES.map((cat) => {
                                const isActive = activeTab === cat.id;

                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setActiveTab(cat.id)}
                                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer select-none border ${
                                            isActive
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25 -translate-y-0.5'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm'
                                        }`}
                                    >
                                        <span>{cat.icon}</span>
                                        <span>{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* 3D Services Grid (Matching Reference Design with Vibrant Colors) */}
                        {filteredServices.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                                {filteredServices.map((service, index) => {
                                    const isInactive = !service.is_active || service.is_active === '0' || service.is_active === 'false';
                                    const theme = COLOR_THEMES[index % COLOR_THEMES.length];
                                    const titleParts = splitServiceName(service.name);
                                    const bullets = getServiceBullets(service);
                                    const charge = service.is_free ? '0.00' : (service.coin_cost ? Number(service.coin_cost).toFixed(2) : '20.00');

                                    return (
                                        <div
                                            key={service.id}
                                            onClick={() => !isInactive && handleServiceClick(service)}
                                            className={`group relative flex flex-col justify-between rounded-[28px] p-5 pb-5 transition-all duration-300 overflow-hidden shadow-sm hover:-translate-y-2 cursor-pointer ${theme.borderColor} ${theme.bgGradient} ${theme.hoverShadow} ${
                                                isInactive ? 'opacity-85 select-none cursor-not-allowed' : ''
                                            }`}
                                            style={{ minHeight: '430px' }}
                                        >
                                            {/* Center Overlay for Inactive Services */}
                                            {isInactive && (
                                                <div className="absolute inset-0 z-30 bg-slate-950/50 dark:bg-slate-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center pointer-events-none rounded-[28px]">
                                                    <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center mb-2 shadow-lg ring-4 ring-red-500/30">
                                                        <span className="material-symbols-outlined text-2xl font-bold">block</span>
                                                    </div>
                                                    <span className="text-xs font-black tracking-widest uppercase text-white bg-red-600 px-3 py-1 rounded-full shadow-md">
                                                        UNAVAILABLE
                                                    </span>
                                                    <span className="text-[11px] font-bold text-white/90 drop-shadow mt-1">
                                                        Currently Inactive
                                                    </span>
                                                </div>
                                            )}

                                            {/* Top-Left Ribbon Badge */}
                                            <div className="absolute top-0 left-0 z-10">
                                                <div className={`px-3.5 py-1 rounded-br-2xl text-[10px] font-black tracking-wider text-white shadow-sm uppercase ${theme.ribbonBg}`}>
                                                    {service.is_new ? 'NEW' : 'INSTANT'}
                                                </div>
                                            </div>

                                            {/* Top-Right Decorative 6-Dots Grid */}
                                            <div className="absolute top-3.5 right-4 grid grid-cols-3 gap-1 pointer-events-none opacity-70">
                                                <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
                                                <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
                                                <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
                                                <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
                                                <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
                                                <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
                                            </div>

                                            {/* Top Center: 3D Stacked Cards Layer Effect & Main Icon */}
                                            <div className="relative flex items-center justify-center pt-3 pb-2 my-2 select-none">
                                                {/* Left tilted card */}
                                                <div className="absolute w-24 h-16 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 shadow-xs -rotate-8 transform pointer-events-none flex flex-col justify-center px-2 space-y-1">
                                                    <div className="w-8 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                                                    <div className="w-12 h-1 rounded-full bg-slate-100 dark:bg-slate-700/60" />
                                                </div>

                                                {/* Right tilted card */}
                                                <div className="absolute w-24 h-16 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 shadow-xs rotate-8 transform pointer-events-none flex flex-col justify-center px-2 space-y-1 items-end">
                                                    <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                                                    <div className="w-6 h-1 rounded-full bg-slate-100 dark:bg-slate-700/60" />
                                                </div>

                                                {/* Center straight card */}
                                                <div className="absolute w-24 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-sm pointer-events-none" />

                                                {/* Ambient theme glow */}
                                                <div className={`absolute w-16 h-16 rounded-2xl ${theme.iconGlow} blur-lg opacity-75`} />

                                                {/* Front 3D Icon Squircle */}
                                                <div
                                                    className={`relative z-10 w-16 h-16 rounded-2xl p-2.5 ${theme.iconBg} ${theme.iconGlow} flex items-center justify-center text-white transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}
                                                >
                                                    {service.logo_url ? (
                                                        <img
                                                            src={service.logo_url}
                                                            alt={service.name}
                                                            className="w-full h-full object-contain drop-shadow-md rounded-xl"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl drop-shadow-md">{service.icon || '⚡'}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Title (2 Lines: Main Name + Bold Color Highlight) */}
                                            <div className="text-center mt-2 mb-1">
                                                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1 leading-snug">
                                                    {titleParts.main}
                                                </h3>
                                                <div className={`text-xs sm:text-sm font-black uppercase tracking-wider ${theme.primaryText} leading-tight`}>
                                                    {titleParts.highlight}
                                                </div>
                                            </div>

                                            {/* Short Description */}
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center line-clamp-2 px-1 mb-2 min-h-[30px] leading-relaxed">
                                                {service.description || 'Quick, secure and hassle-free — tap to open.'}
                                            </p>

                                            {/* Service Charge Price Box */}
                                            <div className="bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/70 rounded-2xl p-2.5 px-3.5 flex items-center gap-3 my-2 shadow-xs">
                                                <div className={`w-8 h-8 rounded-full ${theme.priceBg} text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0`}>
                                                    ₹
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block leading-tight">
                                                        Service Charge
                                                    </span>
                                                    <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight block">
                                                        ₹ {charge}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 3 Bullet Features with Theme Checkmark */}
                                            <div className="space-y-1.5 my-2 px-1">
                                                {bullets.map((b, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                        <span className={`material-symbols-outlined text-[15px] ${theme.primaryText} shrink-0`}>
                                                            check_circle
                                                        </span>
                                                        <span className="truncate">{b}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Bottom Dual Action Buttons */}
                                            <div className="flex items-center gap-2 mt-auto pt-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        !isInactive && handleServiceClick(service);
                                                    }}
                                                    className={`flex-1 py-2 px-3 rounded-full text-white text-xs font-black tracking-wide bg-gradient-to-r ${theme.btnGrad} ${theme.btnShadow} hover:brightness-110 transition-all flex items-center justify-center gap-1 cursor-pointer`}
                                                >
                                                    <span>USE SERVICE</span>
                                                    <span className="text-sm font-black">›</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        !isInactive && handleServiceClick(service);
                                                    }}
                                                    className="px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center cursor-pointer"
                                                >
                                                    LIST
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                                <span className="text-5xl mb-4 block">📋</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    No services found in this category
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                                    Switch to "All Services" to view all available services in the portal.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('all')}
                                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md hover:bg-blue-700 transition cursor-pointer"
                                >
                                    View All Services
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3D Login Required Modal */}
                {selectedServiceForModal && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
                        onClick={() => setSelectedServiceForModal(null)}
                    >
                        <div 
                            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-b-[6px] border-b-blue-600 shadow-2xl p-6 sm:p-7 text-center transform transition-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                type="button"
                                onClick={() => setSelectedServiceForModal(null)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                                ✕
                            </button>

                            {/* Service Icon 3D Box */}
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-indigo-950/50 border border-blue-200 dark:border-indigo-900/60 shadow-lg flex items-center justify-center">
                                {selectedServiceForModal.logo_url ? (
                                    <img
                                        src={selectedServiceForModal.logo_url}
                                        alt=""
                                        className="w-11 h-11 rounded-xl object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl">
                                        {selectedServiceForModal.icon || '📄'}
                                    </span>
                                )}
                            </div>

                            {/* Modal Heading */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold mb-3">
                                <span>🔒</span> Login Required
                            </div>

                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                                {selectedServiceForModal.name}
                            </h3>

                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                                Yeh service use karne ke liye aapko portal me login karna hoga. Agar aapka account nahi hai to turant naya account banayein.
                            </p>

                            {/* 3D Action Buttons */}
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/login"
                                    className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/30 border-b-[3px] border-blue-800 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">login</span>
                                    <span>Login to Access Service</span>
                                </Link>

                                <Link
                                    href="/register"
                                    className="w-full py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-sm border border-slate-300 dark:border-slate-700 border-b-[3px] border-b-slate-400 dark:border-b-slate-600 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">person_add</span>
                                    <span>Register New Account</span>
                                </Link>
                            </div>

                            <div className="mt-4 text-[11px] text-slate-400">
                                100% Safe & Instant Activation • Bank Grade Security
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </FrontendLayout>
    );
}
