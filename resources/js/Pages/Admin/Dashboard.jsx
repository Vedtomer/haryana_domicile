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

function ServiceCard({ service, onUnlockClick, isAdmin }) {
    const isInactive = !service.is_active || service.is_active === '0' || service.is_active === 'false';
    const isLockedPremium = !isInactive && service.is_premium && !service.is_unlocked;

    const cardContent = (
        <div
            className={`group relative flex flex-col h-56 p-5 bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                isInactive
                    ? 'border-gray-200 dark:border-slate-800 opacity-80 select-none cursor-not-allowed'
                    : service.is_new
                    ? 'border-amber-300 dark:border-amber-500/60 shadow-amber-500/5 ring-1 ring-amber-400/30'
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1'
            } ${isLockedPremium ? 'cursor-pointer' : ''}`}
        >
            {/* Center Overlay for Inactive Services */}
            {isInactive && (
                <div className="absolute inset-0 z-20 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-2xs flex flex-col items-center justify-center p-3 text-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center mb-2 shadow-lg">
                        <span className="material-symbols-outlined text-2xl font-bold">block</span>
                    </div>
                    <span className="text-xs font-bold text-white bg-red-600 px-3 py-1 rounded-full shadow-md">
                        Unavailable
                    </span>
                </div>
            )}

            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    {service.logo_url ? (
                        <img
                            src={service.logo_url}
                            alt=""
                            className="w-10 h-10 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0 shadow-2xs"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl flex-shrink-0 shadow-2xs">
                            {service.icon || '📄'}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    {service.is_new && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-xs flex items-center gap-1 animate-pulse">
                            <span>🔥</span>
                            <span>NEW</span>
                        </span>
                    )}

                    {isLockedPremium ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">lock</span>
                            PREMIUM
                        </span>
                    ) : service.is_free ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 uppercase tracking-wider">
                            FREE
                        </span>
                    ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 whitespace-nowrap">
                            🪙 {service.coin_cost}
                        </span>
                    )}
                </div>
            </div>

            <h3
                className={`mt-3 font-bold text-slate-800 dark:text-white line-clamp-2 text-sm leading-snug ${
                    !isInactive ? 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors' : ''
                }`}
            >
                {service.name}
            </h3>

            {service.description && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {service.description}
                </p>
            )}

            <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 dark:text-slate-500">
                    <strong className="text-slate-700 dark:text-slate-200 font-bold">{service.count ?? 0}</strong> total
                </span>
                {isInactive ? (
                    <span className="text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">block</span>
                        Unavailable
                    </span>
                ) : isLockedPremium ? (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        Unlock →
                    </span>
                ) : (
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        Open →
                    </span>
                )}
            </div>
        </div>
    );

    if (isInactive) {
        return (
            <div
                className="cursor-not-allowed select-none"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                {cardContent}
            </div>
        );
    }

    if (isLockedPremium) {
        return <div onClick={() => onUnlockClick(service)}>{cardContent}</div>;
    }

    const isExternal = service.url && (service.url.startsWith('http://') || service.url.startsWith('https://'));
    if (isExternal) {
        return (
            <a href={service.url} target="_blank" rel="noopener noreferrer">
                {cardContent}
            </a>
        );
    }

    return <Link href={service.url}>{cardContent}</Link>;
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
        };
        window.addEventListener('categoryChange', handleCategoryEvent);
        return () => window.removeEventListener('categoryChange', handleCategoryEvent);
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
        } catch (e) {}
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-tight">
                        Dashboard
                    </h1>
                </div>
            }
        >
            <Head title="Dashboard" />

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

            {/* 4. Categorized Services Display */}
            {/* Case A: User selected a category OR searched */}
            {selectedCategory || searchQuery.trim() ? (
                <div id="services" className="mb-8 scroll-mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
                        <div className="flex items-center gap-3">
                            {activeCategoryObj && (
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs ${activeCategoryObj.avatarBg}`}>
                                    <span className="material-symbols-outlined text-[24px]">
                                        {activeCategoryObj.icon}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                    <span>
                                        {searchQuery.trim()
                                            ? `Search results for "${searchQuery}"`
                                            : activeCategoryObj?.name || 'Selected Services'}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                                        {filteredServices.length}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                    Click any service card below to open the service.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                            {/* Search inside category */}
                            <div className="relative w-full sm:w-64">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search in services..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
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

                            {/* Back to all categories button */}
                            <button
                                type="button"
                                onClick={clearSelectedCategory}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
                            >
                                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                <span>All Categories</span>
                            </button>
                        </div>
                    </div>

                    {/* Filtered Services Grid */}
                    {filteredServices.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center text-slate-500 dark:text-slate-400 space-y-4 shadow-2xs">
                            <div className="text-3xl">🔍</div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                                Koi service nahi mili.
                            </p>
                            <button
                                type="button"
                                onClick={clearSelectedCategory}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                View All Categories
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                            {filteredServices.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    onUnlockClick={setUnlockingService}
                                    isAdmin={isAdmin}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : null}

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
