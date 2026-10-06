import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

const TYPE_CONFIG = {
    service_deduction: {
        label: 'Service Used',
        badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
        icon: 'build',
    },
    purchase: {
        label: 'Coin Purchase',
        badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
        icon: 'add_card',
    },
    admin_credit: {
        label: 'Admin Credit',
        badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
        icon: 'admin_panel_settings',
    },
    refund: {
        label: 'Refund',
        badge: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
        icon: 'replay',
    },
    referral_bonus: {
        label: 'Referral Bonus',
        badge: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
        icon: 'share',
    },
};

export default function Index({ transactions, summary, isAdmin, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'all');
    const [date, setDate] = useState(filters.date || 'all');
    const [scope, setScope] = useState(filters.scope || (isAdmin ? 'all' : 'my'));

    const applyFilter = (newOverrides = {}) => {
        const params = {
            search,
            type,
            date,
            scope,
            ...newOverrides,
        };
        // Remove empty keys
        Object.keys(params).forEach((k) => {
            if (!params[k] || params[k] === 'all') delete params[k];
        });
        router.get('/admin/passbook', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilter({ search });
    };

    const handleScopeChange = (newScope) => {
        setScope(newScope);
        applyFilter({ scope: newScope });
    };

    const handleTypeChange = (e) => {
        const val = e.target.value;
        setType(val);
        applyFilter({ type: val });
    };

    const handleDateChange = (e) => {
        const val = e.target.value;
        setDate(val);
        applyFilter({ date: val });
    };

    const handleReset = () => {
        setSearch('');
        setType('all');
        setDate('all');
        const defaultScope = isAdmin ? 'all' : 'my';
        setScope(defaultScope);
        router.get('/admin/passbook', { scope: defaultScope });
    };

    const isAllUsersView = isAdmin && scope === 'all';

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl shadow-xs border border-indigo-100 dark:border-indigo-900">
                            📖
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                                {isAllUsersView ? 'Admin Passbook (All Users)' : 'My Wallet Passbook'}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isAllUsersView
                                    ? 'Track which user used which service, mobile numbers, and live coin deductions'
                                    : 'Detailed record of your wallet coin credits and service deductions'}
                            </p>
                        </div>
                    </div>

                    {/* Scope Switcher for Admin */}
                    {isAdmin && (
                        <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => handleScopeChange('all')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                                    scope === 'all'
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">groups</span>
                                <span>All Users Passbook</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleScopeChange('my')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                                    scope === 'my'
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">person</span>
                                <span>My Account Only</span>
                            </button>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Passbook & Coin History" />

            <div className="space-y-5 pb-8">
                {/* 1. TOP SUMMARY METRIC CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {isAllUsersView ? (
                        <>
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Total System Coins
                                </span>
                                <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                                    🪙 {Number(summary.total_system_coins || 0).toLocaleString('en-IN')}
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-1">Across all users</span>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Today's Service Uses
                                </span>
                                <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400">
                                    −{Number(summary.today_spent || 0).toLocaleString('en-IN')}
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-1">
                                    {summary.today_services_count || 0} services used today
                                </span>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Today Added Coins
                                </span>
                                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                    +{Number(summary.today_added || 0).toLocaleString('en-IN')}
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-1">Wallet recharges today</span>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Total Records
                                </span>
                                <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-200">
                                    {Number(summary.total_transactions || 0).toLocaleString('en-IN')}
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-1">Total transactions logged</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Wallet Balance
                                </span>
                                <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                                    🪙 {Number(summary.balance || 0).toLocaleString('en-IN')}
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-1">Current available coins</span>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Today Used
                                </span>
                                <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400">
                                    −{Number(summary.today_spent || 0).toLocaleString('en-IN')}
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-1">Coins used today</span>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Total Added
                                </span>
                                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                    +{Number(summary.added || 0).toLocaleString('en-IN')}
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-1">Lifetime recharges</span>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Total Spent
                                </span>
                                <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-200">
                                    −{Number(summary.spent || 0).toLocaleString('en-IN')}
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-1">Lifetime service cost</span>
                            </div>
                        </>
                    )}
                </div>

                {/* 2. SEARCH & FILTERS BAR */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                search
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={
                                    isAllUsersView
                                        ? 'Search User Name, Mobile, Service Name, Doc No...'
                                        : 'Search Service Name, Document No, Description...'
                                }
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="sm:w-44">
                            <select
                                value={type}
                                onChange={handleTypeChange}
                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Types</option>
                                <option value="service_deduction">Service Used (Deductions)</option>
                                <option value="purchase">Coins Purchased</option>
                                <option value="admin_credit">Admin Added</option>
                                <option value="refund">Refunded</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="sm:w-36">
                            <select
                                value={date}
                                onChange={handleDateChange}
                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Dates</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="this_week">This Week</option>
                                <option value="this_month">This Month</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-sm">filter_alt</span>
                                <span>Filter</span>
                            </button>
                            {(search || type !== 'all' || date !== 'all') && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* 3. TRANSACTIONS TABLE */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5 whitespace-nowrap">Date & Time</th>
                                    {isAllUsersView && (
                                        <th className="px-5 py-3.5 whitespace-nowrap">User Details</th>
                                    )}
                                    <th className="px-5 py-3.5 min-w-[240px]">Service Used / Details</th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">Type</th>
                                    <th className="px-5 py-3.5 text-right whitespace-nowrap">Coins</th>
                                    <th className="px-5 py-3.5 text-right whitespace-nowrap">Balance After</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                {transactions.data.map((txn) => {
                                    const cfg = TYPE_CONFIG[txn.type] || {
                                        label: txn.type,
                                        badge: 'bg-slate-100 text-slate-700 border-slate-200',
                                        icon: 'history',
                                    };
                                    const isDebit = txn.amount < 0;
                                    const user = txn.user;

                                    return (
                                        <tr
                                            key={txn.id}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            {/* Date & Time */}
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {new Date(txn.created_at).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                                <div className="text-[11px] font-medium text-slate-400">
                                                    {new Date(txn.created_at).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    })}
                                                </div>
                                            </td>

                                            {/* User Details (For Admin View) */}
                                            {isAllUsersView && (
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    {user ? (
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                                                                {(user.name || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                                                    <span>{user.name}</span>
                                                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                                        #{user.id}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-medium">
                                                                    {user.phone && (
                                                                        <span className="flex items-center gap-0.5 text-slate-600 dark:text-slate-400 font-mono">
                                                                            📞 {user.phone}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic">User #{txn.user_id}</span>
                                                    )}
                                                </td>
                                            )}

                                            {/* Service Used / Description */}
                                            <td className="px-5 py-3.5">
                                                <div className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                                                    {txn.description || 'Service Transaction'}
                                                </div>
                                                {txn.creator && (
                                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                                        Processed by: {txn.creator.name}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Type Badge */}
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.badge}`}
                                                >
                                                    <span className="material-symbols-outlined text-[13px]">
                                                        {cfg.icon}
                                                    </span>
                                                    <span>{cfg.label}</span>
                                                </span>
                                            </td>

                                            {/* Coins */}
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <span
                                                    className={`font-black text-sm ${
                                                        isDebit
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : 'text-emerald-600 dark:text-emerald-400'
                                                    }`}
                                                >
                                                    {isDebit ? '−' : '+'}
                                                    {Math.abs(txn.amount)} Coins
                                                </span>
                                                <span className="block text-[10px] font-semibold text-slate-400">
                                                    ₹{Math.abs(txn.amount)}.00
                                                </span>
                                            </td>

                                            {/* Balance After */}
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <span className="font-black text-slate-900 dark:text-white font-mono text-xs">
                                                    🪙 {txn.balance_after}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={isAllUsersView ? 6 : 5}
                                            className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
                                                    receipt_long
                                                </span>
                                                <p className="font-bold text-sm">Koi passbook record nahi mila.</p>
                                                <p className="text-xs text-slate-400">
                                                    Search ya filter reset karke dubara check karein.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.links && transactions.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                            <div className="text-xs text-slate-500">
                                Showing {transactions.from || 0} to {transactions.to || 0} of{' '}
                                {transactions.total} records
                            </div>
                            <div className="flex items-center gap-1">
                                {transactions.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                            link.active
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : link.url
                                                ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                                                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
