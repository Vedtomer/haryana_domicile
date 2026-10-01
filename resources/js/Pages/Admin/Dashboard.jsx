import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { SERVICE_CATEGORIES, getServiceCategory } from '../../Utils/serviceCategories';

function StatMetricCard({ title, value, subtitle, icon, iconBg = 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400', linkUrl }) {
    const cardContent = (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between h-full">
            <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {title}
                </span>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs ${iconBg} group-hover:scale-105 transition-transform`}>
                    <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                        {icon}
                    </span>
                </div>
            </div>

            <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                    {value}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1 truncate">
                    {subtitle}
                </div>
            </div>
        </div>
    );

    if (linkUrl) {
        return (
            <Link href={linkUrl} className="block transition-transform hover:-translate-y-0.5">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}

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

function ServiceCard({ service, index = 0, onUnlockClick, isAdmin }) {
    const isInactive = !service.is_active || service.is_active === '0' || service.is_active === 'false';
    const isLockedPremium = !isInactive && service.is_premium && !service.is_unlocked;
    const isExternal = service.url && (service.url.startsWith('http://') || service.url.startsWith('https://'));

    const theme = COLOR_THEMES[index % COLOR_THEMES.length];
    const titleParts = splitServiceName(service.name);
    const bullets = getServiceBullets(service);
    const charge = service.is_free ? '0.00' : (service.coin_cost ? Number(service.coin_cost).toFixed(2) : '20.00');

    const handleCardNavigate = () => {
        if (isInactive) return;
        if (isLockedPremium) {
            onUnlockClick(service);
            return;
        }
        if (isExternal) {
            window.open(service.url, '_blank', 'noopener,noreferrer');
        } else {
            router.visit(service.url);
        }
    };

    const handleListClick = (e) => {
        e.stopPropagation();
        router.visit(`/admin/profile#coin-ledger`);
    };

    return (
        <div
            onClick={handleCardNavigate}
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
                        handleCardNavigate();
                    }}
                    className={`flex-1 py-2 px-3 rounded-full text-white text-xs font-black tracking-wide bg-gradient-to-r ${theme.btnGrad} ${theme.btnShadow} hover:brightness-110 transition-all flex items-center justify-center gap-1 cursor-pointer`}
                >
                    <span>USE SERVICE</span>
                    <span className="text-sm font-black">›</span>
                </button>
                <button
                    type="button"
                    onClick={handleListClick}
                    className="px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center cursor-pointer"
                >
                    LIST
                </button>
            </div>
        </div>
    );
}

export default function Dashboard({
    services = [],
    stats = [],
    isAdmin = false,
    walletBalance,
    todayDebit = 0,
    apiBalance = 487.00,
    userRole = 'RETAILER',
    supportWhatsApp = '380630323112',
    supportTelegram = '@cspjaankari',
    siteName = 'CSP Jaankari',
    siteLogo = '/images/logo.png',
}) {
    const { auth, whatsappNumber } = usePage().props;
    const [unlockingService, setUnlockingService] = useState(null);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Selected category state (null = show Category Overview cards)
    const [selectedCategory, setSelectedCategory] = useState(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('category') || null;
        } catch (e) {
            return null;
        }
    });

    // Listen for category selection from sidebar
    useEffect(() => {
        const handleCategoryEvent = (e) => {
            setSelectedCategory(e.detail);
            if (e.detail) {
                setTimeout(() => {
                    const el = document.getElementById('services');
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        };
        window.addEventListener('categoryChange', handleCategoryEvent);
        return () => window.removeEventListener('categoryChange', handleCategoryEvent);
    }, []);

    // Initial scroll if category is in URL
    useEffect(() => {
        if (selectedCategory) {
            setTimeout(() => {
                const el = document.getElementById('services');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 250);
        }
    }, []);

    // Balance values
    const effectiveBalance = walletBalance ?? auth?.user?.coins ?? 0;
    const effectiveRole = userRole || (isAdmin ? 'ADMINISTRATOR' : 'RETAILER');
    const effectiveWhatsApp = whatsappNumber || supportWhatsApp || '380630323112';

    // Group services into categories for the overview
    const groupedCategories = useMemo(() => {
        const groups = {};
        SERVICE_CATEGORIES.forEach((cat) => {
            groups[cat.id] = {
                category: cat,
                services: [],
            };
        });

        (services || []).forEach((service) => {
            const cat = getServiceCategory(service);
            if (groups[cat.id]) {
                groups[cat.id].services.push(service);
            } else {
                groups['utilities'].services.push(service);
            }
        });

        return SERVICE_CATEGORIES.map((cat) => groups[cat.id]).filter((g) => g.services.length > 0);
    }, [services]);

    // Currently active category object if selected
    const activeCategoryObj = useMemo(() => {
        if (!selectedCategory) return null;
        return SERVICE_CATEGORIES.find((c) => c.id === selectedCategory) || null;
    }, [selectedCategory]);

    // Filter services according to selectedCategory and searchQuery
    const filteredServices = useMemo(() => {
        return (services || []).filter((service) => {
            const query = searchQuery.trim().toLowerCase();
            const matchesQuery =
                !query ||
                (service.name && service.name.toLowerCase().includes(query)) ||
                (service.description && service.description.toLowerCase().includes(query)) ||
                (service.slug && service.slug.toLowerCase().includes(query));

            if (!matchesQuery) return false;

            // If user searched across all, don't restrict to category unless category is explicitly chosen
            if (searchQuery.trim() && !selectedCategory) return true;

            if (!selectedCategory) return false; // In overview mode, individual service cards are not rendered
            const cat = getServiceCategory(service);
            return cat.id === selectedCategory;
        });
    }, [services, searchQuery, selectedCategory]);

    const handleUnlock = () => {
        if (!unlockingService) return;
        setIsUnlocking(true);
        router.post(
            `/services/${unlockingService.id}/unlock`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setUnlockingService(null);
                    setIsUnlocking(false);
                },
                onError: () => setIsUnlocking(false),
                onFinish: () => setIsUnlocking(false),
            }
        );
    };

    const clearSelectedCategory = () => {
        setSelectedCategory(null);
        setSearchQuery('');
        try {
            const url = new URL(window.location);
            url.searchParams.delete('category');
            window.history.pushState({}, '', url);
            window.dispatchEvent(new CustomEvent('categoryChange', { detail: null }));
        } catch (e) {}
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-2">
                    {selectedCategory && activeCategoryObj ? (
                        <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-800 dark:text-white">
                            <button
                                type="button"
                                onClick={clearSelectedCategory}
                                className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <span>Dashboard</span>
                            </button>
                            <span className="text-slate-300 dark:text-slate-600">/</span>
                            <span className="text-indigo-600 dark:text-indigo-400">
                                {activeCategoryObj.name}
                            </span>
                        </div>
                    ) : (
                        <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-tight">
                            Dashboard
                        </h1>
                    )}
                </div>
            }
        >
            <Head title={selectedCategory && activeCategoryObj ? activeCategoryObj.name : 'Dashboard'} />

            {/* When NO category is selected & NO search: SHOW FULL DASHBOARD */}
            {!selectedCategory && !searchQuery.trim() ? (
                <>
                    {/* 1. Hero Welcome Banner (Gradient Blue-Purple Banner with CSP Jaankari Data) */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#4338ca] text-white p-6 sm:p-8 mb-6 shadow-xl shadow-indigo-950/20">
                        {/* Decorative background glow circles */}
                        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute right-1/3 -bottom-16 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-cyan-300 text-[11px] font-black tracking-widest uppercase mb-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                    <span>{siteName.toUpperCase()} • SMART DASHBOARD</span>
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight drop-shadow-sm">
                                    Welcome, {auth?.user?.name || 'Retailer'}
                                </h2>
                                <p className="text-blue-100/85 text-xs sm:text-sm mt-2 font-medium leading-relaxed">
                                    Fast services, clear wallet records and a cleaner retailer experience.
                                </p>
                            </div>

                            {/* Banner Action Buttons */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <Link
                                    href="/admin/profile#coin-ledger"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all duration-200 shadow-sm cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">history</span>
                                    <span>Wallet History</span>
                                </Link>
                                <Link
                                    href="/admin/coin-requests"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all duration-200 shadow-sm cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add_card</span>
                                    <span>Add Balance</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 2. 4 Stat Metric Cards in a row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
                        <StatMetricCard
                            title="WALLET BALANCE"
                            value={`₹${Number(effectiveBalance).toLocaleString('en-IN')}.00`}
                            subtitle="Live retailer balance"
                            icon="account_balance_wallet"
                            iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                            linkUrl="/admin/coin-requests"
                        />
                        <StatMetricCard
                            title="TODAY'S DEBIT"
                            value={`₹${Number(todayDebit).toLocaleString('en-IN')}.00`}
                            subtitle="Service usage today"
                            icon="add_circle"
                            iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                            linkUrl="/admin/profile#coin-ledger"
                        />
                        <StatMetricCard
                            title="API BALANCE"
                            value={`₹${Number(apiBalance).toFixed(2)}`}
                            subtitle="Live portal sync"
                            icon="description"
                            iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                        />
                        <StatMetricCard
                            title="ACCOUNT TYPE"
                            value={effectiveRole}
                            subtitle="Your portal role"
                            icon="person"
                            iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                            linkUrl="/admin/profile"
                        />
                    </div>

                    {/* 3. Customer Care Section (With actual site support data) */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 mb-8 shadow-2xs">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-[22px]">
                                    support_agent
                                </span>
                                <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                                    Customer Care
                                </h3>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                                Support
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                            {/* Help Note Card */}
                            <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col justify-center">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                                    Need help with a service?
                                </h4>
                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                    Use one request at a time. Keep the transaction/service detail ready before contacting support.
                                </p>
                            </div>

                            {/* WhatsApp Card */}
                            <a
                                href={`https://wa.me/${(effectiveWhatsApp || '').replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5 hover:border-emerald-400 hover:shadow-sm transition-all duration-200 group cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[22px]">chat</span>
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                                        WhatsApp
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate block mt-0.5">
                                        {effectiveWhatsApp}
                                    </span>
                                </div>
                            </a>

                            {/* Telegram Card */}
                            <a
                                href={`https://t.me/${(supportTelegram || '').replace(/^@+/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5 hover:border-sky-400 hover:shadow-sm transition-all duration-200 group cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[22px]">send</span>
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                                        Telegram
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate block mt-0.5">
                                        {supportTelegram}
                                    </span>
                                </div>
                            </a>

                            {/* Member Group Card */}
                            <a
                                href={`https://t.me/${(supportTelegram || '').replace(/^@+/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5 hover:border-indigo-400 hover:shadow-sm transition-all duration-200 group cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[22px]">groups</span>
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                                        Member Group
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate block mt-0.5">
                                        {siteName} Updates
                                    </span>
                                </div>
                            </a>
                        </div>
                    </div>
                </>
            ) : (
                /* When a Category or Search is selected: DASHBOARD HIDES, ONLY SERVICES SHOW */
                <div id="services" className="mb-8">
                    {/* Clean Minimal Top Row (Bulky card and Quick Switch removed as requested) */}
                    <div className="flex items-center justify-between gap-3 mb-6">
                        <button
                            type="button"
                            onClick={clearSelectedCategory}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/25 transition-all cursor-pointer whitespace-nowrap group"
                        >
                            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
                                arrow_back
                            </span>
                            <span>Back to Dashboard</span>
                        </button>

                        <div className="relative w-48 sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Search service..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[15px]">close</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filtered Services Grid */}
                    {filteredServices.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 space-y-4 shadow-2xs">
                            <div className="text-4xl">🔍</div>
                            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                                Koi service nahi mili
                            </h4>
                            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                                Aapke search query ya is category me koi service match nahi hui.
                            </p>
                            <button
                                type="button"
                                onClick={clearSelectedCategory}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                <span>Back to Dashboard</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                            {filteredServices.map((service, index) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    index={index}
                                    onUnlockClick={setUnlockingService}
                                    isAdmin={isAdmin}
                                />
                            ))}
                        </div>
                    )}

                    {/* Bottom Back Button */}
                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={clearSelectedCategory}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                        >
                            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
                                arrow_back
                            </span>
                            <span>Back to Dashboard</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Premium Unlock Modal */}
            {unlockingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-6 text-center text-white relative">
                            <button
                                onClick={() => setUnlockingService(null)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>

                            <div className="flex justify-center mb-3">
                                {unlockingService.logo_url ? (
                                    <img
                                        src={unlockingService.logo_url}
                                        alt=""
                                        className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-lg bg-white"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-lg">
                                        <span className="text-4xl leading-none">{unlockingService.icon || '📦'}</span>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-black tracking-tight drop-shadow-sm px-4">
                                {unlockingService.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-amber-600 mt-2 shadow-xs uppercase tracking-wider">
                                <span className="material-symbols-outlined text-[13px]">lock</span>
                                Premium
                            </span>
                        </div>
                        <div className="p-6 text-center">
                            <p className="text-slate-600 dark:text-slate-300 font-medium mb-6 text-xs sm:text-sm">
                                Unlock <strong className="text-slate-900 dark:text-white">{unlockingService.name}</strong> for lifetime access.
                            </p>

                            <div className="flex items-center justify-center gap-3 mb-6">
                                <span className="text-3xl font-black text-amber-500">{unlockingService.unlock_cost}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Coins</span>
                            </div>

                            {auth?.user?.coins >= unlockingService.unlock_cost ? (
                                <button
                                    onClick={handleUnlock}
                                    disabled={isUnlocking}
                                    className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 text-white font-bold rounded-2xl shadow-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
                                >
                                    {isUnlocking ? 'Unlocking...' : 'Unlock Now'}
                                </button>
                            ) : (
                                <div>
                                    <p className="text-xs text-red-500 font-semibold mb-3 flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-[17px]">error</span>
                                        Not enough coins (You have {auth?.user?.coins ?? 0})
                                    </p>
                                    <Link
                                        href="/admin/coin-requests"
                                        className="w-full inline-block py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-colors"
                                    >
                                        Buy More Coins
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
