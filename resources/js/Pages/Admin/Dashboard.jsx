import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const TONES = {
    blue: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/60 text-blue-700 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-950/40 border-green-100 dark:border-green-900/60 text-green-700 dark:text-green-300',
    purple: 'bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/60 text-purple-700 dark:text-purple-300',
    amber: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/60 text-amber-700 dark:text-amber-300',
    'dark-blue': 'bg-gradient-to-br from-slate-800 via-blue-900 to-slate-950 border-blue-950 text-white shadow-lg shadow-blue-950/50',
    'dark-green': 'bg-gradient-to-br from-slate-800 via-emerald-900 to-slate-950 border-emerald-950 text-white shadow-lg shadow-emerald-950/50',
    'dark-purple': 'bg-gradient-to-br from-slate-800 via-purple-900 to-slate-950 border-purple-950 text-white shadow-lg shadow-purple-950/50',
    'dark-amber': 'bg-gradient-to-br from-slate-800 via-amber-900 to-slate-950 border-amber-950 text-white shadow-lg shadow-amber-950/50',
    'dark-indigo': 'bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-950 border-indigo-950 text-white shadow-lg shadow-indigo-950/50',
};

const DARK_TONES = new Set(['dark-blue', 'dark-green', 'dark-purple', 'dark-amber', 'dark-indigo']);

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
    'Coin Requests': 'monetization_on',
    'History & My Requests': 'history',
    'Pending': 'pending_actions',
    'Completed': 'check_circle',
    'Portal License Keys': 'vpn_key',
    'Manage License Keys': 'vpn_key',
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
                            : 'bg-white/80 dark:bg-slate-800/80 border border-current/10 text-current shadow-sm'
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
        <div className={`group relative flex flex-col h-56 p-5 bg-white dark:bg-slate-900 rounded-xl border transition-all duration-200 ${
            service.is_new
                ? 'border-amber-400 dark:border-amber-500/70 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/40'
                : 'border-gray-200 dark:border-slate-800 shadow-sm'
        } ${
            isLockedPremium 
                ? 'cursor-pointer hover:border-amber-400 hover:shadow-amber-100 dark:hover:shadow-amber-950/30' 
                : isLicenseBlocked
                ? 'cursor-pointer hover:border-red-400 hover:shadow-red-100 dark:hover:shadow-red-950/30'
                : 'hover:shadow-lg hover:border-blue-300 dark:hover:border-indigo-500 hover:-translate-y-1'
        }`}>
            <div className="flex items-start justify-between gap-3">
                {service.logo_url ? (
                    <img src={service.logo_url} alt="" className="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-slate-700 flex-shrink-0" />
                ) : (
                    <span className="text-3xl leading-none">{service.icon}</span>
                )}

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    {service.is_new && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-xs flex items-center gap-1 animate-pulse">
                            <span>🔥</span>
                            <span>NEW</span>
                        </span>
                    )}

                    {isLockedPremium ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            PREMIUM
                        </span>
                    ) : isLicenseBlocked ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">lock</span>
                            LICENSE
                        </span>
                    ) : service.is_free ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 dark:bg-emerald-950/50 text-green-700 dark:text-emerald-300 border border-green-200 dark:border-emerald-800">
                            FREE
                        </span>
                    ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                            🪙 {service.coin_cost}
                        </span>
                    )}
                </div>
            </div>

            <h3 className="mt-3 font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {service.name}
            </h3>

            {service.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 line-clamp-2">{service.description}</p>
            )}

            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-slate-400">
                    <span className="font-bold text-gray-800 dark:text-white text-base">{service.count}</span> total
                </span>
                {isLockedPremium ? (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Unlock →
                    </span>
                ) : isLicenseBlocked ? (
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        License Required →
                    </span>
                ) : (
                    <span className="text-xs font-semibold text-blue-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
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

const CATEGORIES = [
    { id: 'all', label: 'All Services', icon: '📋', activeClass: 'bg-blue-600 text-white shadow-blue-500/25' },
    { id: 'new', label: 'New Services', icon: '🔥', activeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-orange-500/25' },
    { id: 'pan', label: 'PAN Card', icon: '💳', activeClass: 'bg-blue-600 text-white shadow-blue-500/25' },
    { id: 'aadhaar', label: 'Aadhaar', icon: '🆔', activeClass: 'bg-emerald-600 text-white shadow-emerald-500/25' },
    { id: 'dl', label: 'DL (Licence)', icon: '🚗', activeClass: 'bg-indigo-600 text-white shadow-indigo-500/25' },
    { id: 'rc', label: 'RC (Vehicle)', icon: '🚙', activeClass: 'bg-violet-600 text-white shadow-violet-500/25' },
    { id: 'pvc', label: 'PVC Cards', icon: '🪪', activeClass: 'bg-purple-600 text-white shadow-purple-500/25' },
    { id: 'certificates', label: 'Certificates & Print', icon: '📜', activeClass: 'bg-teal-600 text-white shadow-teal-500/25' },
];

const matchesCategory = (service, catId) => {
    if (catId === 'all') return true;
    if (catId === 'new') return Boolean(service.is_new);

    const text = `${service.name || ''} ${service.slug || ''} ${service.description || ''} ${service.module_key || ''}`.toLowerCase();

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
               text.includes('passbook');
    }
    return true;
};

export default function Dashboard({ services, stats, isAdmin, referralCode, referralLink }) {
    const { auth, flash } = usePage().props;
    const activeCode = referralCode || auth?.user?.referral_code || '';
    const activeLink = referralLink || auth?.user?.referral_link || '';
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const handleCopyCode = () => {
        if (!activeCode) return;
        navigator.clipboard.writeText(activeCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleCopyLink = () => {
        if (!activeLink) return;
        navigator.clipboard.writeText(activeLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const [unlockingService, setUnlockingService] = useState(null);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // License status
    const hasLicense = Boolean(auth?.user?.has_active_license);

    // Count of new services
    const newServicesCount = services.filter(s => Boolean(s.is_new)).length;

    const getCategoryCount = (catId) => {
        return services.filter(service => matchesCategory(service, catId)).length;
    };

    const filteredServices = services.filter(service => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch = query === '' ||
            (service.name && service.name.toLowerCase().includes(query)) ||
            (service.description && service.description.toLowerCase().includes(query)) ||
            (service.slug && service.slug.toLowerCase().includes(query));

        return matchesSearch && matchesCategory(service, activeTab);
    });

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

    const handleRequireLicenseClick = (service) => {
        window.dispatchEvent(new CustomEvent('open-license-modal', { detail: { service, tab: 'direct' } }));
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
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

                    {/* New Service Highlight Badge in Upper Header */}
                    {newServicesCount > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('new');
                                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            title="Nayi services dekhne ke liye click karein"
                            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer group shrink-0"
                        >
                            <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-200"></span>
                            </span>
                            <span className="text-sm">🔥</span>
                            <span>{newServicesCount} New Service{newServicesCount > 1 ? 's' : ''} Live!</span>
                            <span className="bg-white/20 group-hover:bg-white/30 px-2 py-0.5 rounded-full text-[11px] font-bold">
                                {activeTab === 'new' ? 'Showing New ✓' : 'Click to View →'}
                            </span>
                        </button>
                    )}
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

            {/* License Status Banner for Regular Users (Only when license is INACTIVE) */}
            {!isAdmin && !hasLicense && (
                <div id="license" className="mb-6 scroll-mt-6">
                    <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-orange-500/15 border-2 border-amber-400/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-amber-500/5">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
                            <div className="flex items-start gap-4">
                                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30 animate-pulse">
                                    <span className="material-symbols-outlined text-3xl">lock</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                         <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                             Portal License Inactive (6 Months)
                                         </h3>
                                         <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600 text-white uppercase tracking-wider shadow-sm">
                                             Required
                                         </span>
                                     </div>
                                     <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mt-1 max-w-2xl leading-relaxed">
                                         Portal ki sabhi services use karne ke liye <strong>6-Month License (50 Coins)</strong> active hona zaroori hai. Aap 50 coins se direct activate kar sakte hain ya license key enter kar sakte hain.
                                     </p>
                                 </div>
                             </div>
                             <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto flex-shrink-0">
                                 <button
                                     type="button"
                                     onClick={() => {
                                         window.dispatchEvent(new CustomEvent('open-license-modal', { detail: { tab: 'direct' } }));
                                     }}
                                     className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
                                 >
                                     <span className="material-symbols-outlined text-[18px]">bolt</span>
                                     Activate Now (50 Coins)
                                 </button>
                                 <button
                                     type="button"
                                     onClick={() => {
                                         window.dispatchEvent(new CustomEvent('open-license-modal', { detail: { tab: 'key' } }));
                                     }}
                                     className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
                                 >
                                     <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                                     Enter Key
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
             )}

            {/* Refer & Earn Promo Banner */}
            <div className="mb-6">
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-blue-500/30">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-inner">
                                🎁
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                                        Refer a Friend &amp; Earn ₹10!
                                    </h3>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-slate-950 uppercase tracking-wide">
                                        Earn 10 Coins
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-blue-100 border border-white/20">
                                        🔒 1 Link = 1 User
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1 leading-relaxed max-w-2xl">
                                    Jab bhi aapka refer kiya dost pehli baar apni ID me ₹200+ add karega, aapko turant <strong>10 Coins (₹10)</strong> milenge!
                                </p>
                            </div>
                        </div>

                        {/* Referral Code & Quick Action Box */}
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
                            {activeCode && (
                                <div className="flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15 shadow-inner">
                                    <span className="text-[11px] text-blue-200 font-bold uppercase tracking-wider">Code:</span>
                                    <span className="font-mono font-black text-amber-400 text-base sm:text-lg tracking-wider select-all">
                                        {activeCode}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopyCode}
                                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center"
                                        title="Copy Referral Code"
                                    >
                                        {copiedCode ? (
                                            <span className="material-symbols-outlined text-sm text-emerald-400">check</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-sm">content_copy</span>
                                        )}
                                    </button>
                                </div>
                            )}

                            {activeLink && (
                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-all cursor-pointer"
                                    title="Copy Referral Link"
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {copiedLink ? 'check_circle' : 'link'}
                                    </span>
                                    <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                                </button>
                            )}

                            <Link
                                href="/admin/referrals"
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 font-black text-xs sm:text-sm rounded-xl shadow-md hover:-translate-y-0.5 transition-all"
                            >
                                <span>Dashboard</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

             {/* Services Section Header & Categories */}
            <div id="services" className="space-y-3.5 mb-6 scroll-mt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-lg sm:text-xl font-black text-gray-800 dark:text-white tracking-tight">Services</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80">
                            {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'}
                        </span>
                    </div>

                    <div className="w-full sm:w-72 relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-[20px]">search</span>
                        <input
                            type="text"
                            placeholder={
                                activeTab === 'all'
                                    ? 'Search all services...'
                                    : `Search ${CATEGORIES.find(c => c.id === activeTab)?.label || 'services'}...`
                            }
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-9 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                                title="Clear search"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Filter Pills (Horizontal scroll on mobile, wrap on tablet/desktop) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
                    {CATEGORIES.map((cat) => {
                        const count = getCategoryCount(cat.id);
                        const isActive = activeTab === cat.id;

                        // Only show tabs that have services or are 'all' / 'new'
                        if (count === 0 && cat.id !== 'all' && cat.id !== 'new') {
                            return null;
                        }

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveTab(cat.id)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 active:scale-95 ${
                                    isActive
                                        ? `${cat.activeClass} shadow-md`
                                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-2xs'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                                    isActive
                                        ? 'bg-white/25 text-white'
                                        : cat.id === 'new'
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-10 text-center text-gray-500 dark:text-slate-400 space-y-3 shadow-xs">
                    <div className="text-3xl">🔍</div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                        {searchQuery
                            ? `"${searchQuery}" ke sath koi service nahi mili.`
                            : `Is category (${CATEGORIES.find(c => c.id === activeTab)?.label || 'Selected'}) me abhi koi service nahi hai.`}
                    </p>
                    {(activeTab !== 'all' || searchQuery) && (
                        <button
                            type="button"
                            onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 cursor-pointer transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                            Show All Services ({services.length})
                        </button>
                    )}
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
                     <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-transparent dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
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
                             <p className="text-slate-600 dark:text-slate-300 font-medium mb-6">
                                 Unlock <strong className="text-slate-900 dark:text-white">{unlockingService.name}</strong> for lifetime access. You only pay once!
                             </p>
                             
                             <div className="flex items-center justify-center gap-3 mb-6">
                                 <span className="text-3xl font-black text-amber-500">{unlockingService.unlock_cost}</span>
                                 <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Coins</span>
                             </div>

                             {auth.user.coins >= unlockingService.unlock_cost ? (
                                 <button
                                     onClick={handleUnlock}
                                     disabled={isUnlocking}
                                     className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 text-white font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
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
        </AdminLayout>
    );
}
