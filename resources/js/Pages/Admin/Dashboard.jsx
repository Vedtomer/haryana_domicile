import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { SERVICE_CATEGORIES, getServiceCategory, groupServicesByCategory } from '../../Utils/serviceCategories';
import CategoryLogo from '../../Components/CategoryLogo';

const STAT_THEMES = {
    emerald: {
        cardBg: 'bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/10 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30',
        borderColor: 'border-2 border-emerald-400/80 dark:border-emerald-500/70',
        shadow: 'shadow-[0_14px_35px_-8px_rgba(16,185,129,0.35)] hover:shadow-[0_22px_45px_-6px_rgba(16,185,129,0.5)]',
        glowColor: 'bg-emerald-500/25',
        iconBg: 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400',
        iconShadow: 'shadow-lg shadow-emerald-500/40',
        badgeBg: 'bg-emerald-100/90 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-600/60',
        dotPing: 'bg-emerald-400',
        dotSolid: 'bg-emerald-500',
        titleColor: 'text-emerald-700 dark:text-emerald-400',
    },
    blue: {
        cardBg: 'bg-gradient-to-br from-blue-500/10 via-white to-cyan-500/10 dark:from-blue-950/40 dark:via-slate-900 dark:to-cyan-950/30',
        borderColor: 'border-2 border-blue-400/80 dark:border-blue-500/70',
        shadow: 'shadow-[0_14px_35px_-8px_rgba(37,99,235,0.35)] hover:shadow-[0_22px_45px_-6px_rgba(37,99,235,0.5)]',
        glowColor: 'bg-blue-500/25',
        iconBg: 'bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400',
        iconShadow: 'shadow-lg shadow-blue-500/40',
        badgeBg: 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-300/80 dark:border-blue-600/60',
        dotPing: 'bg-blue-400',
        dotSolid: 'bg-blue-500',
        titleColor: 'text-blue-700 dark:text-blue-400',
    },
    purple: {
        cardBg: 'bg-gradient-to-br from-purple-500/10 via-white to-fuchsia-500/10 dark:from-purple-950/40 dark:via-slate-900 dark:to-fuchsia-950/30',
        borderColor: 'border-2 border-purple-400/80 dark:border-purple-500/70',
        shadow: 'shadow-[0_14px_35px_-8px_rgba(168,85,247,0.35)] hover:shadow-[0_22px_45px_-6px_rgba(168,85,247,0.5)]',
        glowColor: 'bg-purple-500/25',
        iconBg: 'bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-400',
        iconShadow: 'shadow-lg shadow-purple-500/40',
        badgeBg: 'bg-purple-100/90 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 border border-purple-300/80 dark:border-purple-600/60',
        dotPing: 'bg-purple-400',
        dotSolid: 'bg-purple-500',
        titleColor: 'text-purple-700 dark:text-purple-400',
    },
    amber: {
        cardBg: 'bg-gradient-to-br from-amber-500/10 via-white to-yellow-500/10 dark:from-amber-950/40 dark:via-slate-900 dark:to-yellow-950/30',
        borderColor: 'border-2 border-amber-400/80 dark:border-amber-500/70',
        shadow: 'shadow-[0_14px_35px_-8px_rgba(245,158,11,0.35)] hover:shadow-[0_22px_45px_-6px_rgba(245,158,11,0.5)]',
        glowColor: 'bg-amber-500/25',
        iconBg: 'bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400',
        iconShadow: 'shadow-lg shadow-amber-500/40',
        badgeBg: 'bg-amber-100/90 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300/80 dark:border-amber-600/60',
        dotPing: 'bg-amber-400',
        dotSolid: 'bg-amber-500',
        titleColor: 'text-amber-700 dark:text-amber-400',
    },
    indigo: {
        cardBg: 'bg-gradient-to-br from-indigo-500/10 via-white to-blue-500/10 dark:from-indigo-950/40 dark:via-slate-900 dark:to-blue-950/30',
        borderColor: 'border-2 border-indigo-400/80 dark:border-indigo-500/70',
        shadow: 'shadow-[0_14px_35px_-8px_rgba(99,102,241,0.35)] hover:shadow-[0_22px_45px_-6px_rgba(99,102,241,0.5)]',
        glowColor: 'bg-indigo-500/25',
        iconBg: 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-400',
        iconShadow: 'shadow-lg shadow-indigo-500/40',
        badgeBg: 'bg-indigo-100/90 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-300/80 dark:border-indigo-600/60',
        dotPing: 'bg-indigo-400',
        dotSolid: 'bg-indigo-500',
        titleColor: 'text-indigo-700 dark:text-indigo-400',
    },
};

function StatMetricCard({
    title,
    value,
    subtitle,
    icon,
    colorTheme = 'blue',
    linkUrl,
    index = 0,
    badgeText,
    isButton = false,
}) {
    const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setTilt({ x: x * 10, y: -y * 10, active: true });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0, active: false });
    };

    const t = STAT_THEMES[colorTheme] || STAT_THEMES.blue;
    const animClass = ['animate-3d-box-1', 'animate-3d-box-2', 'animate-3d-box-3', 'animate-3d-box-4'][index % 4];

    const cardContent = (
        <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-300 group flex flex-col justify-between h-full overflow-hidden cursor-pointer select-none ${animClass} ${t.cardBg} ${t.borderColor} ${t.shadow}`}
            style={{
                transform: tilt.active
                    ? `perspective(850px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale3d(1.03, 1.03, 1.03) translateZ(12px)`
                    : undefined,
                transition: tilt.active ? 'transform 0.12s ease-out' : 'transform 0.5s ease-out, box-shadow 0.3s ease',
                transformStyle: 'preserve-3d',
            }}
        >
            {/* Ambient 3D Glowing Orb */}
            <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full ${t.glowColor} blur-2xl pointer-events-none animate-ambient-glow`} />
            <div className={`absolute -bottom-12 -left-12 w-28 h-28 rounded-full ${t.glowColor} blur-2xl pointer-events-none opacity-60`} />

            {/* Live 3D Shimmer Sweep */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-20">
                <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 dark:via-white/10 to-transparent skew-x-[-22deg] animate-box-shimmer" />
            </div>

            {/* Top Row: Title + Live Badge + 3D Icon */}
            <div className="flex items-start justify-between gap-3 relative z-10" style={{ transform: 'translateZ(25px)' }}>
                <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider ${t.titleColor}`}>
                            {title}
                        </span>
                        {badgeText && (
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${t.badgeBg}`}>
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${t.dotPing} opacity-75`} />
                                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${t.dotSolid}`} />
                                </span>
                                <span>{badgeText}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3D Floating Icon Box */}
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-white ${t.iconBg} ${t.iconShadow} animate-3d-icon-float group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-[21px] sm:text-[23px] drop-shadow-sm">
                        {icon}
                    </span>
                </div>
            </div>

            {/* Middle Row: Dynamic Value */}
            <div className="mt-3 relative z-10" style={{ transform: 'translateZ(20px)' }}>
                {isButton ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-extrabold text-sm sm:text-base shadow-md shadow-blue-500/30 group-hover:shadow-blue-500/60 group-hover:scale-[1.03] transition-all">
                        <span className="material-symbols-outlined text-[18px]">add_card</span>
                        <span>{value}</span>
                        <span className="material-symbols-outlined text-[16px] font-black">arrow_forward</span>
                    </div>
                ) : (
                    <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white truncate drop-shadow-2xs">
                        {value}
                    </div>
                )}

                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1.5 flex items-center gap-1 truncate">
                    <span>{subtitle}</span>
                    {linkUrl && !isButton && (
                        <span className="text-[13px] font-black opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-400 dark:text-slate-300">
                            →
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    if (linkUrl) {
        return (
            <Link href={linkUrl} className="block h-full">
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
    if (nameLower.includes('recharge') || nameLower.includes('mobile')) {
        return ['Jio, Airtel, Vi, BSNL & DTH', 'Instant Recharge Confirmation', 'Auto Wallet Coins Deduction'];
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
            className={`group relative flex flex-col justify-between rounded-[28px] p-5 pb-5 transition-all duration-300 overflow-hidden shadow-sm hover:-translate-y-2 hover:scale-[1.015] hover:shadow-xl cursor-pointer ${theme.borderColor} ${theme.bgGradient} ${theme.hoverShadow} ${
                isInactive ? 'opacity-85 select-none cursor-not-allowed' : ''
            }`}
            style={{ minHeight: '430px' }}
        >
            {/* Live 3D Shimmer Sweep */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[28px] z-20">
                <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 dark:via-white/10 to-transparent skew-x-[-22deg] animate-box-shimmer" />
            </div>

            {/* Center Overlay for Inactive/Hidden Services */}
            {isInactive && (
                <div className="absolute inset-0 z-30 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center pointer-events-none rounded-[28px]">
                    <div className="w-11 h-11 rounded-full bg-slate-800 text-white flex items-center justify-center mb-2 shadow-lg ring-4 ring-rose-500/30">
                        <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>visibility_off</span>
                    </div>
                    <span className="text-xs font-black tracking-widest uppercase text-white bg-rose-600 px-3 py-1 rounded-full shadow-md">
                        HIDDEN
                    </span>
                    <span className="text-[11px] font-bold text-white/90 drop-shadow mt-1">
                        Service is Hidden (छुपी हुई है)
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
                    className={`relative z-10 w-16 h-16 rounded-2xl p-2.5 ${theme.iconBg} ${theme.iconGlow} flex items-center justify-center text-white transform group-hover:scale-115 group-hover:-rotate-3 transition-transform duration-300 animate-3d-icon-float`}
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
    totalUsers = 0,
    pendingCoins = 0,
    pendingRequests = 0,
    totalRequests = 0,
    servicesCount,
    noticesCount = 0,
    referralsCount = 0,
    apiBalance = 487.00,
    userRole = 'RETAILER',
    supportWhatsApp = '380630323112',
    supportTelegram = '@cspjaankari',
    siteName = 'CSP Jaankari',
    siteLogo = '/images/logo.png',
    initialTab = 'overview',
}) {
    const page = usePage();
    const { auth, whatsappNumber } = page.props || {};
    const url = page.url || '';
    const [unlockingService, setUnlockingService] = useState(null);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLetter, setSelectedLetter] = useState('ALL');

    // Tab state: 'overview' vs 'services'
    const [activeTab, setActiveTab] = useState(() => {
        if (url.includes('tab=services') || url === '/all-services' || url.startsWith('/all-services?')) {
            return 'services';
        }
        try {
            const params = new URLSearchParams(window.location.search);
            const p = params.get('tab');
            if (p === 'services' || p === 'overview') return p;
        } catch (e) {}
        return initialTab === 'services' ? 'services' : 'overview';
    });

    useEffect(() => {
        if (url.includes('tab=services') || url === '/all-services' || url.startsWith('/all-services?') || initialTab === 'services') {
            setActiveTab('services');
        } else if (url.includes('tab=overview') || initialTab === 'overview') {
            setActiveTab('overview');
        }
    }, [url, initialTab]);

    const handleTabSwitch = (t) => {
        setActiveTab(t);
        try {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('tab', t);
            window.history.pushState({}, '', currentUrl);
        } catch (e) {}
    };

    // Balance values
    const effectiveBalance = walletBalance ?? auth?.user?.coins ?? 0;
    const effectiveRole = userRole || (isAdmin ? 'ADMINISTRATOR' : 'RETAILER');
    const effectiveWhatsApp = whatsappNumber || supportWhatsApp || '380630323112';

    // 1. Available services according to permissions
    const availableServices = useMemo(() => {
        return (services || []).filter((s) => {
            if (!s) return false;
            if (!s.is_active && !isAdmin) return false;
            return true;
        });
    }, [services, isAdmin]);

    // 2. Sort all available services alphabetically by name
    const sortedServices = useMemo(() => {
        return [...availableServices].sort((a, b) => {
            const nameA = (a?.name || '').trim();
            const nameB = (b?.name || '').trim();
            return nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true });
        });
    }, [availableServices]);

    // 3. Filter by search query
    const filteredServices = useMemo(() => {
        if (!searchQuery.trim()) return sortedServices;
        const q = searchQuery.toLowerCase().trim();
        return sortedServices.filter((s) =>
            (s?.name || '').toLowerCase().includes(q) ||
            (s?.description || '').toLowerCase().includes(q) ||
            (s?.slug || '').toLowerCase().includes(q) ||
            (s?.hindi_name || '').toLowerCase().includes(q)
        );
    }, [sortedServices, searchQuery]);

    // 4. Group alphabetically A to Z
    const alphabetGroups = useMemo(() => {
        const groups = {};
        for (const s of filteredServices) {
            const firstChar = (s?.name || '').trim().charAt(0).toUpperCase();
            const letter = /^[A-Z]$/.test(firstChar) ? firstChar : '#';
            if (!groups[letter]) {
                groups[letter] = [];
            }
            groups[letter].push(s);
        }

        const sortedLetters = Object.keys(groups).sort((a, b) => {
            if (a === '#') return 1;
            if (b === '#') return -1;
            return a.localeCompare(b);
        });

        return sortedLetters.map((letter) => ({
            letter,
            services: groups[letter],
        }));
    }, [filteredServices]);

    // 5. Count of services per letter across all available services
    const letterCounts = useMemo(() => {
        const counts = {};
        for (const s of availableServices) {
            const firstChar = (s?.name || '').trim().charAt(0).toUpperCase();
            const letter = /^[A-Z]$/.test(firstChar) ? firstChar : '#';
            counts[letter] = (counts[letter] || 0) + 1;
        }
        return counts;
    }, [availableServices]);

    // 6. Displayed groups based on selected letter
    const displayedGroups = useMemo(() => {
        if (selectedLetter === 'ALL') {
            return alphabetGroups;
        }
        return alphabetGroups.filter((g) => g.letter === selectedLetter);
    }, [alphabetGroups, selectedLetter]);

    const ALPHABET_LIST = useMemo(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), []);

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

    const clearSearch = () => {
        setSearchQuery('');
    };

    return (
        <AdminLayout
            header={
                <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-tight">
                    Dashboard
                </h1>
            }
        >
            <Head title="Dashboard" />

            {/* Top View Mode Switcher: Dashboard Hub vs All Services */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                <button
                    type="button"
                    onClick={() => handleTabSwitch('overview')}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                        activeTab === 'overview'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25 ring-2 ring-purple-400/30'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <span className="material-symbols-outlined text-[20px]">laptop_mac</span>
                    <span>Dashboard Overview</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleTabSwitch('services')}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                        activeTab === 'services'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-400/30'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <span className="material-symbols-outlined text-[20px]">apps</span>
                    <span>All Services ({availableServices.length})</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        activeTab === 'services'
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    }`}>
                        A-Z
                    </span>
                </button>

                <Link
                    href="/wallet/add"
                    className="ml-auto hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-[18px]">add_card</span>
                    <span>Add Money (₹{Number(effectiveBalance).toLocaleString('en-IN')})</span>
                </Link>
            </div>

            {/* TAB 1: OVERVIEW TAB (Promotions, Add Money Box, Admin Hub, Stats) */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* 1. Small Compact Welcome Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#3730a3] text-white px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                                <span className="material-symbols-outlined text-cyan-300 text-[18px] sm:text-[20px]">waving_hand</span>
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                                        Welcome, {auth?.user?.name || 'Retailer'}
                                    </h2>
                                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-400/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                        {siteName.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-blue-100/75 text-[11px] sm:text-xs font-medium truncate mt-0.5">
                                    Fast services, clear wallet records and instant processing.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. DEDICATED ADD MONEY TO WALLET BOX */}
                    <div className="bg-gradient-to-br from-[#1e1b4b] via-[#1e3a8a] to-[#0f172a] text-white rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden border border-indigo-500/30">
                        <div className="absolute -top-20 -right-20 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-2 max-w-xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/25 text-cyan-300 text-[11px] font-black uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-sm">bolt</span>
                                    <span>Instant Wallet Top-Up • 1 Coin = ₹1</span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                    वॉलेट में पैसे / कॉइन जोड़ें (Add Money)
                                </h3>
                                <p className="text-blue-100/80 text-xs sm:text-sm">
                                    UPI QR कोड स्कैन करें या ऑनलाइन पेमेंट गेटवे से तुरंत कॉइन प्राप्त करें। बैलेंस 1 सेकंड में स्वतः आपके वॉलेट में अपडेट हो जाएगा।
                                </p>
                                <div className="flex items-center gap-3 pt-1 text-[11px] text-cyan-300 font-semibold flex-wrap">
                                    <span className="flex items-center gap-1">✓ ऑटोमैटिक कॉइन क्रेडिट</span>
                                    <span className="flex items-center gap-1">✓ 100% सुरक्षित भुगतान</span>
                                    <span className="flex items-center gap-1">✓ GPay, PhonePe, Paytm, BHIM UPI</span>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 lg:min-w-[400px] justify-between shadow-inner">
                                <div>
                                    <div className="text-[11px] uppercase tracking-wider text-blue-200 font-bold">
                                        Available Wallet Balance
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-black text-amber-300 flex items-center gap-1.5 mt-0.5">
                                        <span>🪙</span>
                                        <span>{Number(effectiveBalance).toLocaleString('en-IN')} Coins</span>
                                    </div>
                                    <div className="text-[11px] text-blue-200/70">
                                        ₹{Number(effectiveBalance).toLocaleString('en-IN')}.00 Live Funds
                                    </div>
                                </div>

                                <div className="w-full sm:w-auto flex flex-col gap-2">
                                    <Link
                                        href="/wallet/add"
                                        className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-center"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">add_card</span>
                                        <span>Add Money Now</span>
                                    </Link>
                                    <div className="flex items-center gap-1.5 justify-center">
                                        {[50, 100, 200, 500].map((quick) => (
                                            <Link
                                                key={quick}
                                                href={`/wallet/add?amount=${quick}`}
                                                className="px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold transition-colors"
                                            >
                                                +₹{quick}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. ADMINISTRATION CONTROL PANEL (FOR ADMIN) */}
                    {isAdmin && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                        <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-slate-800 dark:text-white text-base sm:text-lg">
                                            Administration Control Panel
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Manage users, coin requests, permissions, API settings, payments &amp; notices
                                        </p>
                                    </div>
                                </div>
                                <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                    Admin Hub
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                                <StatMetricCard
                                    index={0}
                                    colorTheme="indigo"
                                    title="MANAGE USERS"
                                    badgeText="USERS"
                                    value={Number(totalUsers || 0).toLocaleString('en-IN')}
                                    subtitle="Registered users • Search & edit"
                                    icon="group"
                                    linkUrl="/admin/users"
                                />
                                <StatMetricCard
                                    index={1}
                                    colorTheme="amber"
                                    title="COIN REQUESTS"
                                    badgeText="BALANCE"
                                    value={`${pendingCoins} Pending`}
                                    subtitle="Review, reset & approve balance"
                                    icon="monetization_on"
                                    linkUrl="/admin/coin-requests"
                                />
                                <StatMetricCard
                                    index={2}
                                    colorTheme="purple"
                                    title="USER PERMISSIONS"
                                    badgeText="ROLES"
                                    value="Permissions"
                                    subtitle="Service access & user roles"
                                    icon="admin_panel_settings"
                                    linkUrl="/admin/user-permissions"
                                />
                                <StatMetricCard
                                    index={3}
                                    colorTheme="blue"
                                    title="MANAGE SERVICES"
                                    badgeText="CATALOG"
                                    value={`${servicesCount || availableServices.length || 0} Services`}
                                    subtitle="Configure services & pricing"
                                    icon="home_repair_service"
                                    linkUrl="/admin/services"
                                />
                                <StatMetricCard
                                    index={4}
                                    colorTheme="emerald"
                                    title="SERVICE REQUESTS"
                                    badgeText="ORDERS"
                                    value={`${pendingRequests} Pending`}
                                    subtitle={`${totalRequests} Total orders submitted`}
                                    icon="assignment"
                                    linkUrl="/admin/service-requests"
                                />
                                <StatMetricCard
                                    index={5}
                                    colorTheme="amber"
                                    title="API SETTINGS"
                                    badgeText="GATEWAYS"
                                    value="API Config"
                                    subtitle="Configure vendor keys & endpoints"
                                    icon="settings_input_composite"
                                    linkUrl="/admin/api-settings"
                                />
                                <StatMetricCard
                                    index={6}
                                    colorTheme="emerald"
                                    title="PAYMENT SETTINGS"
                                    badgeText="UPI / QR"
                                    value="Payments"
                                    subtitle="Manage QR codes & PayCorex gateway"
                                    icon="payments"
                                    linkUrl="/admin/payment-settings"
                                />
                                <StatMetricCard
                                    index={7}
                                    colorTheme="purple"
                                    title="BROADCAST NOTICE"
                                    badgeText="NOTICES"
                                    value={`${noticesCount || 0} Notices`}
                                    subtitle="Publish alerts & marquee notices"
                                    icon="campaign"
                                    linkUrl="/admin/notices"
                                />
                                <StatMetricCard
                                    index={8}
                                    colorTheme="indigo"
                                    title="REFER & EARN"
                                    badgeText="AFFILIATE"
                                    value={`${referralsCount || 0} Referrals`}
                                    subtitle="Referral settings & tracking"
                                    icon="card_giftcard"
                                    linkUrl="/admin/referrals"
                                />
                                <StatMetricCard
                                    index={9}
                                    colorTheme="blue"
                                    title="MOBILE RECHARGE API"
                                    badgeText="RECHARGE"
                                    value="Recharge Hub"
                                    subtitle="apinice.in live balance & keys"
                                    icon="phone_android"
                                    linkUrl="/utilities/mobile-recharge"
                                />
                                <StatMetricCard
                                    index={10}
                                    colorTheme="orange"
                                    title="LICENSE KEYS"
                                    badgeText="LICENSES"
                                    value="Key Manager"
                                    subtitle="Device binding & activation"
                                    icon="key"
                                    linkUrl="/admin/license-keys"
                                />
                            </div>
                        </div>
                    )}

                    {/* 4. RETAILER METRIC CARDS (FOR REGULAR USERS) */}
                    {!isAdmin && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
                            <StatMetricCard
                                index={0}
                                colorTheme="emerald"
                                title="TOTAL BALANCE"
                                badgeText="LIVE"
                                value={`₹${Number(effectiveBalance).toLocaleString('en-IN')}.00`}
                                subtitle="Available wallet coins"
                                icon="account_balance_wallet"
                                linkUrl="/admin/passbook"
                            />
                            <StatMetricCard
                                index={1}
                                colorTheme="blue"
                                title="ADD MONEY"
                                badgeText="INSTANT QR"
                                value="Add Money"
                                subtitle="Instant scan & automatic wallet credit"
                                icon="add_card"
                                linkUrl="/wallet/add"
                                isButton={true}
                            />
                            <StatMetricCard
                                index={2}
                                colorTheme="purple"
                                title="WALLET HISTORY"
                                badgeText="PASSBOOK"
                                value="View Ledger"
                                subtitle={`Today: ₹${Number(todayDebit).toLocaleString('en-IN')}.00 • Tap to view`}
                                icon="history_edu"
                                linkUrl="/admin/passbook"
                            />
                            <StatMetricCard
                                index={3}
                                colorTheme="indigo"
                                title="MY REQUESTS"
                                badgeText="ORDERS"
                                value="Service Orders"
                                subtitle="Track your submitted services & downloads"
                                icon="receipt_long"
                                linkUrl="/admin/service-requests"
                            />
                        </div>
                    )}

                    {/* 5. BIG BANNER TO ACCESS ALL SERVICES */}
                    <div
                        onClick={() => handleTabSwitch('services')}
                        className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform">
                                📱
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                                    <span>{availableServices.length} Services Ready</span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-black">
                                    सभी सेवाएँ देखें (All Services A to Z Directory)
                                </h3>
                                <p className="text-xs sm:text-sm text-blue-100">
                                    Aadhaar, PAN, Voter, Vehicle, Ration, Mobile Recharge, Passbook, Bijli Bill &amp; more
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 font-black text-sm bg-white text-slate-900 px-4 py-2.5 rounded-xl shadow-sm self-start sm:self-auto group-hover:translate-x-1 transition-transform">
                            <span>Open Services Catalog</span>
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: ALL SERVICES DIRECTORY (A to Z) */}
            {activeTab === 'services' && (
                    <div id="services-directory" className="mb-10 space-y-6">
                        {/* Directory Header Card with Live Search */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-black shadow-md shadow-indigo-500/25 shrink-0">
                                        <span className="material-symbols-outlined text-2xl">sort_by_alpha</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                            <span>All Services / सभी सेवाएँ</span>
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            Alphabetical Order (A to Z) &bull; किसी भी सर्विस को तुरंत खोलने के लिए क्लिक करें
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                                        {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'} Available
                                    </span>
                                </div>
                            </div>

                            {/* Search Box */}
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl pointer-events-none">
                                    search
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search services by name (e.g. Aadhaar, PAN, Voter, Vehicle, Ration, Birth, Bill, Courier...)"
                                    className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm sm:text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all shadow-inner"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                        title="Clear search"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Alphabet Quick Filter Bar (Sticky) */}
                        <div className="sticky top-2 z-20 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-2.5 shadow-sm">
                            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
                                {/* 'ALL' Button */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedLetter('ALL')}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                        selectedLetter === 'ALL'
                                            ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <span>ALL</span>
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                        selectedLetter === 'ALL' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                    }`}>
                                        {availableServices.length}
                                    </span>
                                </button>

                                {/* A-Z Alphabet Buttons */}
                                {ALPHABET_LIST.map((letter) => {
                                    const count = letterCounts[letter] || 0;
                                    const isSelected = selectedLetter === letter;
                                    const hasServices = count > 0;

                                    return (
                                        <button
                                            key={letter}
                                            type="button"
                                            onClick={() => hasServices && setSelectedLetter(letter)}
                                            disabled={!hasServices}
                                            title={hasServices ? `${count} services starting with ${letter}` : `No services under ${letter}`}
                                            className={`px-3 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center justify-center min-w-[36px] ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-400/40 scale-105'
                                                    : hasServices
                                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 cursor-pointer'
                                                    : 'bg-slate-100/40 dark:bg-slate-800/30 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
                                            }`}
                                        >
                                            <span>{letter}</span>
                                            {hasServices && (
                                                <span className={`ml-1 text-[9px] font-bold ${
                                                    isSelected ? 'text-white/90' : 'text-slate-400 dark:text-slate-500'
                                                }`}>
                                                    {count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}

                                {/* '#' Symbol for numbers/other */}
                                {(letterCounts['#'] || 0) > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedLetter('#')}
                                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center justify-center min-w-[36px] cursor-pointer ${
                                            selectedLetter === '#'
                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md ring-2 ring-purple-400/40'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-indigo-50'
                                        }`}
                                    >
                                        <span>#</span>
                                        <span className="ml-1 text-[9px] font-bold text-slate-400">
                                            {letterCounts['#']}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Alphabetical Services Content */}
                        {displayedGroups.length > 0 ? (
                            <div className="space-y-10">
                                {displayedGroups.map((group) => (
                                    <div key={group.letter} id={`letter-${group.letter}`} className="space-y-5 scroll-mt-28">
                                        {/* Letter Divider Header */}
                                        <div className="flex items-center gap-3 pb-2 border-b-2 border-indigo-100 dark:border-indigo-950">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                                                {group.letter}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                                    <span>Letter {group.letter}</span>
                                                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                                                        {group.services.length} {group.services.length === 1 ? 'Service' : 'Services'}
                                                    </span>
                                                </h3>
                                            </div>
                                            <div className="flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent ml-2" />
                                        </div>

                                        {/* 3D Card Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4.5 sm:gap-5">
                                            {group.services.map((service, idx) => (
                                                <ServiceCard
                                                    key={service.id}
                                                    service={service}
                                                    index={idx}
                                                    onUnlockClick={setUnlockingService}
                                                    isAdmin={isAdmin}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto">
                                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl">search_off</span>
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-1">
                                    No services found
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                                    {searchQuery ? `No service matches '${searchQuery}'.` : `No services available under letter '${selectedLetter}'.`}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedLetter('ALL');
                                    }}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                                >
                                    Show All Services
                                </button>
                            </div>
                        )}
                    </div>
            )}

            {/* 4. Customer Care Section */}
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
