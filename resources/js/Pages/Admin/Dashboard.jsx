import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const TONES = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    'dark-blue': 'bg-gradient-to-br from-slate-800 via-blue-900 to-slate-950 border-blue-950 text-white shadow-lg shadow-blue-950/50',
    'dark-green': 'bg-gradient-to-br from-slate-800 via-emerald-900 to-slate-950 border-emerald-950 text-white shadow-lg shadow-emerald-950/50',
    'dark-purple': 'bg-gradient-to-br from-slate-800 via-purple-900 to-slate-950 border-purple-950 text-white shadow-lg shadow-purple-950/50',
    'dark-amber': 'bg-gradient-to-br from-slate-800 via-amber-900 to-slate-950 border-amber-950 text-white shadow-lg shadow-amber-950/50',
};

const DARK_TONES = new Set(['dark-blue', 'dark-green', 'dark-purple', 'dark-amber']);

const ICON_MAP = {
    'Total Services': 'home_repair_service',
    'Manage Users': 'group',
    'User Permissions': 'admin_panel_settings',
    'Pending Requests': 'hourglass_top',
    'Add Service': 'add_circle',
    'Manage Service': 'home_repair_service',
    'Manage Services': 'home_repair_service',
    'Service Requests': 'assignment',
    'Reactivation Requests': 'how_to_reg',
    'My Coin Balance': 'monetization_on',
    'History & My Requests': 'history',
    'Pending': 'pending_actions',
    'Completed': 'check_circle',
    'Portal License Keys': 'vpn_key',
    '6M Portal License': 'vpn_key',
};


function StatCard({ label, value, tone, url, icon }) {
    const isDark = DARK_TONES.has(tone);
    const resolvedIcon = icon || ICON_MAP[label] || 'analytics';
    const isAnchor = url && url.startsWith('#');

    const cardBody = (
        <div
            className={`relative overflow-hidden block p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 group cursor-pointer ${
                isDark ? 'hover:shadow-2xl hover:shadow-black/40' : 'hover:shadow-lg'
            } ${TONES[tone] ?? TONES.blue}`}
        >
            {/* Ambient Background Watermark Icon */}
            <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-6">
                <span className="material-symbols-outlined text-7xl sm:text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {resolvedIcon}
                </span>
            </div>

            <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-semibold truncate ${isDark ? 'text-white/80' : 'opacity-80'}`}>
                        {label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold mt-1.5 tracking-tight truncate">
                        {value}
                    </p>
                </div>

                {/* Prominent Logo / Icon Badge */}
                <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-all duration-300 group-hover:scale-110 ${
                        isDark
                            ? 'bg-white/15 border border-white/20 text-white backdrop-blur-sm shadow-inner'
                            : 'bg-white/80 border border-current/10 text-current shadow-sm'
                    }`}
                >
                    <span
                        className="material-symbols-outlined text-2xl sm:text-3xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        {resolvedIcon}
                    </span>
                </div>
            </div>
        </div>
    );

    if (isAnchor) {
        return (
            <a
                href={url}
                onClick={(e) => {
                    if (url === '#services') {
                        e.preventDefault();
                        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
            >
                {cardBody}
            </a>
        );
    }

    return (
        <Link href={url}>
            {cardBody}
        </Link>
    );
}

function ServiceCard({ service, onUnlockClick, onRequireLicenseClick, hasLicense, isAdmin }) {
    const isLockedPremium = service.is_premium && !service.is_unlocked;
    const isLicenseBlocked = !isAdmin && !hasLicense;

    const cardContent = (
        <div className={`group relative flex flex-col h-56 p-5 bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200 ${
            isLockedPremium 
                ? 'cursor-pointer hover:border-amber-400 hover:shadow-amber-100' 
                : isLicenseBlocked
                ? 'cursor-pointer hover:border-red-400 hover:shadow-red-100'
                : 'hover:shadow-lg hover:border-blue-300 hover:-translate-y-1'
        }`}>
            <div className="flex items-start justify-between gap-3">
                {service.logo_url ? (
                    <img src={service.logo_url} alt="" className="w-11 h-11 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                ) : (
                    <span className="text-3xl leading-none">{service.icon}</span>
                )}

                {isLockedPremium ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                        PREMIUM
                    </span>
                ) : isLicenseBlocked ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">lock</span>
                        LICENSE
                    </span>
                ) : service.is_free ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                        FREE
                    </span>
                ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 whitespace-nowrap">
                        🪙 {service.coin_cost}
                    </span>
                )}
            </div>

            <h3 className="mt-3 font-bold text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-2">
                {service.name}
            </h3>

            {service.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{service.description}</p>
            )}

            <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                    <span className="font-bold text-gray-800 text-base">{service.count}</span> total
                </span>
                {isLockedPremium ? (
                    <span className="text-xs font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Unlock →
                    </span>
                ) : isLicenseBlocked ? (
                    <span className="text-xs font-bold text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        License Required →
                    </span>
                ) : (
                    <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Open →
                    </span>
                )}
            </div>
        </div>
    );

    if (isLicenseBlocked) {
        return <div onClick={() => onRequireLicenseClick(service)}>{cardContent}</div>;
    }

    if (isLockedPremium) {
        return <div onClick={() => onUnlockClick(service)}>{cardContent}</div>;
    }

    const isExternal = service.url && (service.url.startsWith('http://') || service.url.startsWith('https://'));
    if (isExternal) {
        return <a href={service.url} target="_blank" rel="noopener noreferrer">{cardContent}</a>;
    }

    return <Link href={service.url}>{cardContent}</Link>;
}

export default function Dashboard({ services, stats, isAdmin }) {
    const { auth, flash } = usePage().props;
    const [unlockingService, setUnlockingService] = useState(null);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // License States
    const [showLicenseModal, setShowLicenseModal] = useState(false);
    const [licensePromptService, setLicensePromptService] = useState(null);
    const [licenseTab, setLicenseTab] = useState('direct'); // 'direct' | 'key' | 'gift'
    const [licenseKeyInput, setLicenseKeyInput] = useState('');
    const [isActivating, setIsActivating] = useState(false);
    const [isRedeemingKey, setIsRedeemingKey] = useState(false);
    const [isBuyingGift, setIsBuyingGift] = useState(false);
    const [showGeneratedKeyModal, setShowGeneratedKeyModal] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);

    const hasLicense = Boolean(auth?.user?.has_active_license);

    useEffect(() => {
        if (flash?.generated_key) {
            setShowGeneratedKeyModal(true);
        }
    }, [flash?.generated_key]);

    const filteredServices = services.filter(service => 
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUnlock = () => {
        if (!unlockingService) return;
        setIsUnlocking(true);
        router.post(`/services/${unlockingService.id}/unlock`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setUnlockingService(null);
                setIsUnlocking(false);
            },
            onError: () => setIsUnlocking(false),
            onFinish: () => setIsUnlocking(false),
        });
    };

    // 1-Click Direct Activate (Deducts 50 Coins)
    const handleDirectActivate = () => {
        setIsActivating(true);
        router.post('/license/buy', { auto_activate: true }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowLicenseModal(false);
                setLicensePromptService(null);
                setIsActivating(false);
            },
            onFinish: () => setIsActivating(false),
        });
    };

    // Enter and Redeem License Key
    const handleRedeemKey = (e) => {
        e.preventDefault();
        if (!licenseKeyInput.trim()) return;
        setIsRedeemingKey(true);
        router.post('/license/activate', { key: licenseKeyInput }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowLicenseModal(false);
                setLicensePromptService(null);
                setLicenseKeyInput('');
                setIsRedeemingKey(false);
            },
            onFinish: () => setIsRedeemingKey(false),
        });
    };

    // Buy Gift Key for Someone Else (Deducts 50 Coins)
    const handleBuyGiftKey = () => {
        setIsBuyingGift(true);
        router.post('/license/buy', { auto_activate: false }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowLicenseModal(false);
                setIsBuyingGift(false);
            },
            onFinish: () => setIsBuyingGift(false),
        });
    };

    const copyGeneratedKey = (keyString) => {
        navigator.clipboard.writeText(keyString);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const handleRequireLicenseClick = (service) => {
        setLicensePromptService(service);
        setLicenseTab('direct');
        setShowLicenseModal(true);
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        Welcome back, {auth?.user?.name}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        {isAdmin
                            ? 'Manage services, users and requests from here.'
                            : 'Pick a service below to get started.'}
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />

            {/* Stats Grid */}
            <div className={`grid grid-cols-2 gap-4 mb-6 ${isAdmin ? 'md:grid-cols-3 lg:grid-cols-4' : 'sm:grid-cols-3 lg:grid-cols-5'}`}>
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>

            {/* Admin License Controls Banner */}
            {isAdmin && (
                <div className="mb-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center flex-shrink-0 text-indigo-300 shadow-inner">
                            <span className="material-symbols-outlined text-2xl">vpn_key</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-black tracking-tight">
                                    Portal License Key System (6 Months - 50 Coins)
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    LIVE
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 font-medium">
                                Regular users require 50 Coins / 6-Month key to use portal services. You can generate, manage, or revoke keys anytime.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link
                            href="/admin/license-keys"
                            className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-[16px]">tune</span>
                            Manage License Keys →
                        </Link>
                    </div>
                </div>
            )}

            {/* License Status Banner for Regular Users */}
            {!isAdmin && (
                <div id="license" className="mb-6 scroll-mt-6">

                    {hasLicense ? (
                        <div className="bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-teal-500/10 border border-emerald-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/20">
                                    <span className="material-symbols-outlined text-2xl">verified_user</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-black text-gray-900">
                                            6-Month Portal License Active
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            ACTIVE
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 font-medium">
                                        Valid until <span className="font-bold text-emerald-800">{auth?.user?.license_expires_at}</span> ({auth?.user?.license_days_left} days remaining). All services unlocked!
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => {
                                        setLicenseTab('direct');
                                        setShowLicenseModal(true);
                                    }}
                                    className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs rounded-xl shadow-sm transition-all"
                                >
                                    Renew (+6M)
                                </button>
                                <button
                                    onClick={() => {
                                        setLicenseTab('gift');
                                        setShowLicenseModal(true);
                                    }}
                                    className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold text-xs rounded-xl shadow-sm transition-all"
                                >
                                    Buy Gift Key
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-orange-500/15 border-2 border-amber-400/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-amber-500/5">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30 animate-pulse">
                                        <span className="material-symbols-outlined text-3xl">lock</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                                                Portal License Inactive (6 Months)
                                            </h3>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600 text-white uppercase tracking-wider shadow-sm">
                                                Required
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 font-medium mt-1 max-w-2xl leading-relaxed">
                                            Portal ki sabhi services use karne ke liye <strong>6-Month License (50 Coins)</strong> active hona zaroori hai. Aap 50 coins se direct activate kar sakte hain ya license key enter kar sakte hain.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto flex-shrink-0">
                                    <button
                                        onClick={handleDirectActivate}
                                        disabled={isActivating}
                                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">bolt</span>
                                        {isActivating ? 'Activating...' : 'Activate Now (50 Coins)'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setLicenseTab('key');
                                            setShowLicenseModal(true);
                                        }}
                                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl border border-slate-300 shadow-sm transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                                        Enter Key
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Services Header */}
            <div id="services" className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 scroll-mt-6">
                <h2 className="text-lg font-bold text-gray-800">Services</h2>
                <div className="w-full sm:w-64 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm outline-none transition-all"
                    />
                </div>
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
                    {searchQuery ? `No services found matching "${searchQuery}"` : 'No services are active yet.'}
                    {!searchQuery && isAdmin && ' Use "Add Service" to create the first one.'}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {filteredServices.map((service) => (
                        <ServiceCard 
                            key={service.id} 
                            service={service} 
                            onUnlockClick={setUnlockingService}
                            onRequireLicenseClick={handleRequireLicenseClick}
                            hasLicense={hasLicense}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}

            {/* Premium Unlock Modal */}
            {unlockingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-6 text-center text-white relative">
                            <button 
                                onClick={() => setUnlockingService(null)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            
                            <div className="flex justify-center mb-3">
                                {unlockingService.logo_url ? (
                                    <img src={unlockingService.logo_url} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-lg bg-white" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-lg">
                                        <span className="text-4xl leading-none">{unlockingService.icon || '📦'}</span>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-black tracking-tight drop-shadow-sm px-4">{unlockingService.name}</h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-amber-600 mt-2 shadow-sm uppercase tracking-wider">
                                <span className="material-symbols-outlined text-[14px]">lock</span>
                                Premium
                            </span>
                        </div>
                        <div className="p-6 text-center">
                            <p className="text-slate-600 font-medium mb-6">
                                Unlock <strong className="text-slate-900">{unlockingService.name}</strong> for lifetime access. You only pay once!
                            </p>
                            
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <span className="text-3xl font-black text-amber-500">{unlockingService.unlock_cost}</span>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Coins</span>
                            </div>

                            {auth.user.coins >= unlockingService.unlock_cost ? (
                                <button
                                    onClick={handleUnlock}
                                    disabled={isUnlocking}
                                    className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {isUnlocking ? 'Unlocking...' : 'Unlock Now'}
                                </button>
                            ) : (
                                <div>
                                    <p className="text-sm text-red-500 font-semibold mb-3 flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">error</span>
                                        Not enough coins (You have {auth.user.coins})
                                    </p>
                                    <Link
                                        href="/admin/coin-requests"
                                        className="w-full inline-block py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors"
                                    >
                                        Buy More Coins
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* License Activation Modal */}
            {showLicenseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white relative">
                            <button 
                                onClick={() => {
                                    setShowLicenseModal(false);
                                    setLicensePromptService(null);
                                }}
                                className="absolute top-4 right-4 text-white/80 hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white">
                                    <span className="material-symbols-outlined text-2xl">vpn_key</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black leading-tight">6-Month Portal License</h3>
                                    <p className="text-xs text-white/80 mt-0.5">50 Coins / 6 Months (180 Days Validity)</p>
                                </div>
                            </div>

                            {licensePromptService && (
                                <div className="mt-4 p-3 bg-black/20 rounded-xl text-xs flex items-center gap-2 border border-white/15">
                                    <span className="material-symbols-outlined text-base">info</span>
                                    <span>
                                        <strong>{licensePromptService.name}</strong> access karne ke liye 6-month license hona zaroori hai.
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1">
                            <button
                                onClick={() => setLicenseTab('direct')}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                                    licenseTab === 'direct' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                ⚡ Direct (50 Coins)
                            </button>
                            <button
                                onClick={() => setLicenseTab('key')}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                                    licenseTab === 'key' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                🔑 Enter Key
                            </button>
                            <button
                                onClick={() => setLicenseTab('gift')}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                                    licenseTab === 'gift' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                🎁 Gift Key
                            </button>
                        </div>

                        {/* Tab Contents */}
                        <div className="p-6">
                            {/* Tab 1: Direct Activate */}
                            {licenseTab === 'direct' && (
                                <div className="text-center space-y-4">
                                    <p className="text-sm text-gray-600 font-medium">
                                        Aapke wallet se <strong>50 Coins</strong> deduct honge aur aapka portal access turant <strong>6 mahine (180 din)</strong> ke liye activate ho jayega.
                                    </p>

                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Balance</p>
                                            <p className="text-xl font-black text-amber-600">🪙 {auth.user.coins} Coins</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cost</p>
                                            <p className="text-xl font-black text-gray-800">50 Coins</p>
                                        </div>
                                    </div>

                                    {auth.user.coins >= 50 ? (
                                        <button
                                            onClick={handleDirectActivate}
                                            disabled={isActivating}
                                            className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">bolt</span>
                                            {isActivating ? 'Activating License...' : 'Activate 6-Month License (50 Coins)'}
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-xs text-red-600 font-bold flex items-center justify-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">error</span>
                                                50 coins required (You need {50 - auth.user.coins} more coins)
                                            </p>
                                            <Link
                                                href="/admin/coin-requests"
                                                className="w-full inline-block py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md text-sm transition-colors"
                                            >
                                                Recharge Coins
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab 2: Enter Key */}
                            {licenseTab === 'key' && (
                                <form onSubmit={handleRedeemKey} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            License Key Code
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. LIC-ABCD-1234-EFGH"
                                            value={licenseKeyInput}
                                            onChange={(e) => setLicenseKeyInput(e.target.value.toUpperCase())}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-center font-mono font-bold tracking-wider text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none uppercase"
                                            required
                                            autoFocus
                                        />
                                        <p className="text-[11px] text-gray-400 mt-1.5 text-center">
                                            Enter the 16-character key provided by Admin or purchased earlier.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isRedeemingKey || !licenseKeyInput.trim()}
                                        className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                        {isRedeemingKey ? 'Verifying Key...' : 'Activate With Key'}
                                    </button>
                                </form>
                            )}

                            {/* Tab 3: Buy Gift Key */}
                            {licenseTab === 'gift' && (
                                <div className="text-center space-y-4">
                                    <p className="text-sm text-gray-600 font-medium">
                                        Aap <strong>50 Coins</strong> dekar ek unused License Key buy kar sakte hain aur kisi bhi user/shopkeeper ko share kar sakte hain.
                                    </p>

                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200/80 flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Balance</p>
                                            <p className="text-xl font-black text-blue-600">🪙 {auth.user.coins} Coins</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cost</p>
                                            <p className="text-xl font-black text-gray-800">50 Coins</p>
                                        </div>
                                    </div>

                                    {auth.user.coins >= 50 ? (
                                        <button
                                            onClick={handleBuyGiftKey}
                                            disabled={isBuyingGift}
                                            className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">card_giftcard</span>
                                            {isBuyingGift ? 'Generating Key...' : 'Buy Gift Key (50 Coins)'}
                                        </button>
                                    ) : (
                                        <Link
                                            href="/admin/coin-requests"
                                            className="w-full inline-block py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md text-sm transition-colors"
                                        >
                                            Recharge Coins
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Generated Key Modal (When User Buys a Gift Key) */}
            {showGeneratedKeyModal && flash?.generated_key && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <span className="material-symbols-outlined text-3xl">key</span>
                        </div>

                        <h3 className="text-xl font-black text-gray-900">License Key Ready!</h3>
                        <p className="text-xs text-gray-500 mt-1 mb-4">
                            Yeh 6-Month Portal License Key hai. Isse kisi bhi account par activate kiya ja sakta hai.
                        </p>

                        <div className="p-3.5 bg-slate-50 border-2 border-dashed border-gray-300 rounded-2xl mb-4">
                            <p className="font-mono text-lg font-black tracking-wider text-slate-900 select-all">
                                {flash.generated_key}
                            </p>
                        </div>

                        <button
                            onClick={() => copyGeneratedKey(flash.generated_key)}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-colors mb-2 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                {copiedKey ? 'done' : 'content_copy'}
                            </span>
                            {copiedKey ? 'Copied to Clipboard!' : 'Copy License Key'}
                        </button>

                        <button
                            onClick={() => setShowGeneratedKeyModal(false)}
                            className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-800 font-semibold"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
