import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

// Plain-language labels — the ledger exists so nothing looks unexplained.
const TYPE_LABELS = {
    purchase: 'Coins Purchased',
    admin_credit: 'Added by Admin',
    service_deduction: 'Service Used',
    refund: 'Refunded',
};

const TYPE_STYLES = {
    purchase: 'bg-green-100 text-green-700',
    admin_credit: 'bg-blue-100 text-blue-700',
    service_deduction: 'bg-amber-100 text-amber-700',
    refund: 'bg-purple-100 text-purple-700',
};

export default function Edit({ user, ledger, ledgerSummary }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (window.location.hash === '#coin-ledger') {
            const el = document.getElementById('coin-ledger');
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth' });
                }, 150);
            }
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();
        put('/admin/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setData('password', ''); 
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="My Profile" />
            
            <div className="max-w-3xl mx-auto relative">
                {/* Back to Dashboard bar */}
                <div className="mb-4 flex items-center justify-between">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer group"
                    >
                        <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400 group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span>Back to Dashboard</span>
                    </Link>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/90 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-6 border-b border-slate-200/90 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                            <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">{user.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded-full uppercase tracking-wider">
                                {user.type.replace('_', ' ')}
                            </span>
                        </div>
                        <Link
                            href="/admin/dashboard"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-cyan-300">dashboard</span>
                            <span>Dashboard</span>
                        </Link>
                    </div>

                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-6">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                            Update Profile Details
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="name" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                    Full Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                    Email Address (Optional)
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                    Phone Number (Optional)
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="10-digit phone number"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4">
                                Security
                            </h3>
                            
                            <div className="max-w-md">
                                <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                    New Password (Leave blank to keep current)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[19px]">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>
                        </div>

                        <div className="pt-4 text-right">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Coin Ledger — every credit and deduction, so nothing looks unexplained */}
                <div id="coin-ledger" className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mt-6 scroll-mt-6">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Coin Ledger & Wallet History</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                Every coin added to or used from your account is listed here.
                            </p>
                        </div>
                        <Link
                            href="/admin/dashboard"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
                            <span>Dashboard</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-slate-800 border-b border-gray-100 dark:border-slate-800">
                        <div className="px-6 py-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Balance</p>
                            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">🪙 {ledgerSummary.balance}</p>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Added</p>
                            <p className="text-2xl font-extrabold text-green-600 dark:text-green-400 mt-1">+{ledgerSummary.added}</p>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Used</p>
                            <p className="text-2xl font-extrabold text-red-500 dark:text-red-400 mt-1">−{ledgerSummary.spent}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                                <tr>
                                    <th className="text-left font-bold px-6 py-3 whitespace-nowrap">Date</th>
                                    <th className="text-left font-bold px-6 py-3">Details</th>
                                    <th className="text-right font-bold px-6 py-3 whitespace-nowrap">Coins</th>
                                    <th className="text-right font-bold px-6 py-3 whitespace-nowrap">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ledger.data.map((txn) => (
                                    <tr key={txn.id} className="border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/60">
                                        <td className="px-6 py-3 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                                            {new Date(txn.created_at).toLocaleDateString()}
                                            <span className="block text-xs text-gray-400 dark:text-slate-500">
                                                {new Date(txn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <p className="text-gray-800 dark:text-slate-200">{txn.description}</p>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${TYPE_STYLES[txn.type] ?? 'bg-gray-100 text-gray-700'}`}>
                                                {TYPE_LABELS[txn.type] ?? txn.type}
                                            </span>
                                            {txn.creator && (
                                                <span className="text-xs text-gray-400 dark:text-slate-500 ml-2">by {txn.creator.name}</span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-3 text-right font-bold whitespace-nowrap ${
                                            txn.amount < 0 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                        }`}>
                                            {txn.amount < 0 ? '−' : '+'}{Math.abs(txn.amount)}
                                        </td>
                                        <td className="px-6 py-3 text-right text-gray-700 dark:text-slate-300 whitespace-nowrap">
                                            {txn.balance_after}
                                        </td>
                                    </tr>
                                ))}
                                {ledger.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-400 dark:text-slate-500">
                                            No coin activity yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {ledger.links.length > 3 && (
                        <div className="flex flex-wrap gap-1 px-6 py-4 border-t border-gray-100">
                            {ledger.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveScroll
                                    className={`px-3 py-1.5 rounded-lg text-sm ${
                                        link.active ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
                                    } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
