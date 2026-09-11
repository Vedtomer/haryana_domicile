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

export default function Edit({ user, ledger, ledgerSummary, referralCode, referralLink, referrer }) {
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const activeCode = referralCode || user.referral_code || '';
    const activeLink = referralLink || user.referral_link || '';

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
                    <div className="px-6 py-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                            <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">{user.email}</p>
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

                {/* Referral Program Details Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mt-6">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-purple-50/60 to-indigo-50/60 dark:from-slate-800 dark:to-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span>🎁</span> My Referral Program
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                                Earn ₹10 (10 Coins) on every friend's first ₹200+ recharge
                            </p>
                        </div>
                        <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            🔒 Single-Use (1 Link = 1 Friend)
                        </span>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Referral Code */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-2">
                                    My Active Referral Code
                                </label>
                                <div className="flex items-center gap-2 bg-purple-50/80 dark:bg-slate-800/80 rounded-xl p-2.5 px-3.5 border border-purple-200/80 dark:border-slate-700">
                                    <span className="font-mono text-xl font-black text-purple-700 dark:text-purple-300 tracking-widest flex-1 select-all">
                                        {activeCode || '—'}
                                    </span>
                                    {activeCode && (
                                        <button
                                            type="button"
                                            onClick={handleCopyCode}
                                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1 cursor-pointer"
                                        >
                                            {copiedCode ? (
                                                <>
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                    <span>Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    <span>Copy Code</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Referred By */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-2">
                                    Referred By
                                </label>
                                <div className="flex items-center bg-gray-50 dark:bg-slate-800/80 rounded-xl p-2.5 px-3.5 border border-gray-200 dark:border-slate-700 min-h-[46px]">
                                    {referrer ? (
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            <span className="text-sm font-bold text-gray-800 dark:text-white">
                                                {referrer.name || referrer.phone}
                                            </span>
                                            <span className="text-xs font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                                                {referrer.referral_code}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Direct Registration (No Referrer)</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Referral Link */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-2">
                                Single-Use Referral Link
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <div className="flex-1 bg-gray-50 dark:bg-slate-800/80 rounded-xl p-2.5 px-3.5 border border-gray-200 dark:border-slate-700 font-mono text-xs text-gray-700 dark:text-slate-300 truncate select-all">
                                    {activeLink}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                    >
                                        {copiedLink ? (
                                            <>
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                <span>Link Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>
                                                <span>Copy Link</span>
                                            </>
                                        )}
                                    </button>
                                    <Link
                                        href="/admin/referrals"
                                        className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1 shadow-sm"
                                    >
                                        <span>View Referrals</span>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </Link>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                                <span className="text-purple-600 dark:text-purple-400 font-bold">ℹ️ Note:</span>
                                Yeh link sirf 1 registration ke liye valid hai. Friend ke join karte hi aapko automatically naya link mil jayega.
                            </p>
                        </div>
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
