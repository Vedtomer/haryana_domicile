import React, { useState } from 'react';
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

function StatCard({ label, value, tone, url }) {
    const isDark = DARK_TONES.has(tone);
    return (
        <Link
            href={url}
            className={`block p-5 rounded-xl border transition-all duration-200 hover:-translate-y-1 ${
                isDark ? 'hover:shadow-2xl' : 'hover:shadow-md hover:-translate-y-0.5'
            } ${TONES[tone] ?? TONES.blue}`}
        >
            <p className={`text-sm font-semibold ${isDark ? 'opacity-90' : 'opacity-80'}`}>{label}</p>
            <p className="text-3xl font-extrabold mt-1">{value}</p>
        </Link>
    );
}

function ServiceCard({ service, onUnlockClick }) {
    const isLockedPremium = service.is_premium && !service.is_unlocked;

    const cardContent = (
        <div className={`group relative flex flex-col h-56 p-5 bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200 ${isLockedPremium ? 'cursor-pointer hover:border-amber-400 hover:shadow-amber-100' : 'hover:shadow-lg hover:border-blue-300 hover:-translate-y-1'}`}>
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
                ) : (
                    <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Open →
                    </span>
                )}
            </div>
        </div>
    );

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
    const { auth } = usePage().props;
    const [unlockingService, setUnlockingService] = useState(null);
    const [isUnlocking, setIsUnlocking] = useState(false);

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

            <div className={`grid grid-cols-2 gap-4 mb-8 ${isAdmin ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-4'}`}>
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Services</h2>
                <div className="flex gap-2">
                    {isAdmin && (
                        <>
                            <Link
                                href="/admin/user-permissions"
                                className="px-4 py-2 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">shield_person</span>
                                User Permissions
                            </Link>
                        </>
                    )}
                    {!isAdmin && (
                        <Link
                            href="/admin/service-requests"
                            className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">history</span>
                            View History
                        </Link>
                    )}
                </div>
            </div>

            {services.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
                    No services are active yet.
                    {isAdmin && ' Use "Add Service" to create the first one.'}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {!isAdmin && (
                        <Link href="/admin/service-requests" className="group relative flex flex-col h-56 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1">
                            <div className="flex items-start justify-between gap-3">
                                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                    <span className="material-symbols-outlined text-[24px]">history</span>
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">
                                    LOGS
                                </span>
                            </div>
                            <h3 className="mt-4 font-bold text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-2">
                                History & My Requests
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                View status of your manual requests and history of all instant services.
                            </p>
                            <div className="mt-auto pt-3 border-t border-indigo-200/50 flex items-center justify-end">
                                <span className="text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    Open <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </span>
                            </div>
                        </Link>
                    )}

                    {isAdmin && (
                        <Link href="/admin/user-permissions" className="group relative flex flex-col h-56 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1">
                            <div className="flex items-start justify-between gap-3">
                                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                    <span className="material-symbols-outlined text-[24px]">shield_person</span>
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                                    ADMIN
                                </span>
                            </div>
                            <h3 className="mt-4 font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                                User Permissions
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                Control which services are visible to which users. Assign or revoke access instantly.
                            </p>
                            <div className="mt-auto pt-3 border-t border-blue-200/50 flex items-center justify-end">
                                <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    Open <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </span>
                            </div>
                        </Link>
                    )}
                    
                    {services.map((service) => (
                        <ServiceCard 
                            key={service.id} 
                            service={service} 
                            onUnlockClick={setUnlockingService} 
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
                            
                            {/* Service Logo/Icon */}
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
                                        href="/admin/coin-requests/create"
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
