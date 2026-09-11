import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ referralCode, referralLink, stats, referrals }) {
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    const handleCopyLink = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
    };

    const handleCopyCode = () => {
        if (!referralCode) return;
        navigator.clipboard.writeText(referralCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2500);
    };

    const whatsappMessage = encodeURIComponent(
        `Namaste! CSP Jaankari portal join karein aur sabhi digital services (PAN, Aadhaar, Birth/Marriage Certificate, PVC Card, RC Print) ek hi jagah paayein.\n\nMere referral link se register karein:\n${referralLink}\n\nReferral Code: ${referralCode}`
    );

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight flex items-center gap-2">
                        <span>🎁</span> Refer &amp; Earn
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Invite friends &amp; cyber cafes. Earn ₹10 (10 Coins) on every friend's first ₹200+ recharge!
                    </p>
                </div>
            }
        >
            <Head title="Refer & Earn - CSP Jaankari" />

            <div className="max-w-6xl mx-auto mt-6 px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
                
                {/* Hero Share Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-blue-800/40">
                    {/* Decorative blurred backdrops */}
                    <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-7 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                                <span>🎉</span> Special Referral Program
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                                Har Referral Par Paayein <span className="text-amber-400">₹10 (10 Coins)</span>!
                            </h2>
                            <p className="text-blue-200/90 text-sm sm:text-base leading-relaxed max-w-xl">
                                Apne doston aur cyber cafe owners ko apna referral link share karein. Jab bhi wo pehli baar apni ID me <span className="text-white font-bold underline decoration-amber-400 underline-offset-4">₹200 ya usse zyada</span> add karenge, aapko turant <span className="text-amber-400 font-bold">10 Coins</span> milenge!
                            </p>

                            {/* Share Buttons */}
                            <div className="pt-2 flex flex-wrap items-center gap-3">
                                <a
                                    href={`https://wa.me/?text=${whatsappMessage}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-lg">chat</span>
                                    <span>Share on WhatsApp</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {copiedLink ? 'check_circle' : 'link'}
                                    </span>
                                    <span>{copiedLink ? 'Link Copied!' : 'Copy Referral Link'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Referral Code Box */}
                        <div className="lg:col-span-5 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-inner">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1.5">
                                    Your Referral Code
                                </label>
                                <div className="flex items-center gap-2 bg-slate-950/60 rounded-xl p-2 px-3 border border-white/10">
                                    <span className="font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-widest flex-1 select-all">
                                        {referralCode}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopyCode}
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shrink-0 flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {copiedCode ? 'check' : 'content_copy'}
                                        </span>
                                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1.5">
                                    Your Referral Link
                                </label>
                                <div className="flex items-center gap-2 bg-slate-950/60 rounded-xl p-2 px-3 border border-white/10 text-xs">
                                    <span className="font-mono text-blue-200/90 truncate flex-1 select-all">
                                        {referralLink}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                                    >
                                        {copiedLink ? '✓ Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <p className="text-[11px] text-blue-300/70 text-center pt-1">
                                Share this link with anyone. The referral code is automatically applied when they open it!
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3-Step "How it Works" Guide */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-black text-lg flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                            1
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                                Share Your Link
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                Send your unique link or referral code to fellow shopkeepers &amp; friends.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-black text-lg flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                            2
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                                Friend Registers
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                Your friend opens the link and signs up for a free CSP Jaankari account.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-black text-lg flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/40">
                            3
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                                Earn ₹10 Bonus
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                When they add ₹200+ in their wallet for the first time, you automatically get 10 Coins!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Referred</p>
                            <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-1">
                                {stats?.totalReferrals || 0}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">Friends joined with your link</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">group</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Qualified Referrals</p>
                            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                {stats?.qualifiedReferrals || 0}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">Recharged ₹200+ in wallet</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">verified</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Coins Earned</p>
                            <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                                🪙 {stats?.totalEarnedCoins || 0}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">₹{stats?.totalEarnedCoins || 0} credited to balance</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">savings</span>
                        </div>
                    </div>
                </div>

                {/* Referred Friends Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                    <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Your Referred Friends
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Track everyone who registered with your link and their recharge status
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Total: {referrals?.data?.length || 0} shown
                        </span>
                    </div>

                    {referrals && referrals.data && referrals.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3.5">Friend Name</th>
                                        <th className="px-6 py-3.5">Mobile</th>
                                        <th className="px-6 py-3.5">Joined Date</th>
                                        <th className="px-6 py-3.5">Wallet Recharges</th>
                                        <th className="px-6 py-3.5 text-right">Referral Reward</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {referrals.data.map((ref) => (
                                        <tr key={ref.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                                {ref.name}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                {ref.phone}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                {ref.joined_at}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                                                ₹{ref.total_recharged_amount}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {ref.referral_reward_paid ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                        <span className="material-symbols-outlined text-xs">check_circle</span>
                                                        <span>+10 Coins Earned</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                                                        <span className="material-symbols-outlined text-xs">hourglass_empty</span>
                                                        <span>Waiting for ₹200 recharge</span>
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-10 text-center space-y-3">
                            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center text-3xl">
                                🎁
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-base">
                                No Referrals Yet
                            </h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Aapne abhi tak kisi ko refer nahi kiya hai. Apne WhatsApp par doston ke saath referral link share karein aur har ₹200 recharge par ₹10 kamayein!
                            </p>
                            <div className="pt-2">
                                <a
                                    href={`https://wa.me/?text=${whatsappMessage}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-sm">chat</span>
                                    <span>Share on WhatsApp Now</span>
                                </a>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
