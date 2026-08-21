import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import FloatingInput from '../../../Components/FloatingInput';
import ThemeToggle from '../../../Components/ThemeToggle';

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
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-8 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                            <p className="text-gray-500 dark:text-slate-400">{user.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded-full uppercase tracking-wider">
                                {user.type.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-8 space-y-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 border-b dark:border-slate-800 pb-2">Update Profile Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FloatingInput 
                                id="name"
                                label="Full Name (Optional)"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                error={errors.name}
                                required={false}
                            />
                            
                            <FloatingInput 
                                id="email"
                                type="email"
                                label="Email Address (Optional)"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                error={errors.email}
                                required={false}
                            />

                            <FloatingInput 
                                id="phone"
                                type="text"
                                label="Phone Number (Optional)"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                error={errors.phone}
                                required={false}
                            />
                        </div>

                        <div className="pt-6 mt-8 border-t border-gray-100 dark:border-slate-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 border-b dark:border-slate-800 pb-2">Security</h3>
                            
                            <div className="max-w-md">
                                <FloatingInput 
                                    id="password"
                                    label="New Password (Leave blank to keep current)"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    error={errors.password}
                                    isPassword={true}
                                />
                            </div>
                        </div>

                        <div className="pt-8 text-right">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all duration-200"
                            >
                                {processing ? 'Saving...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </form>

                    <div className="px-8 pb-8 pt-6 mt-2 border-t border-gray-100 dark:border-slate-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Appearance</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Choose how the dashboard looks on this device.</p>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Coin Ledger — every credit and deduction, so nothing looks unexplained */}
                <div id="coin-ledger" className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mt-6 scroll-mt-6">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Coin Ledger</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Every coin added to or used from your account is listed here.
                        </p>
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
