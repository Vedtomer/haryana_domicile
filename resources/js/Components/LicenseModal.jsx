import React, { useState, useEffect } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import { getOrCreateDeviceId, getDeviceName } from '../utils/device';

export default function LicenseModal({ isOpen, onClose, initialTab = 'direct', promptService = null }) {
    const { auth, flash } = usePage().props;
    const [tab, setTab] = useState(initialTab);
    const [licenseKeyInput, setLicenseKeyInput] = useState('');
    const [isActivating, setIsActivating] = useState(false);
    const [isRedeemingKey, setIsRedeemingKey] = useState(false);
    const [isBuyingGift, setIsBuyingGift] = useState(false);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTab(initialTab);
        }
    }, [isOpen, initialTab]);

    useEffect(() => {
        if (flash?.generated_key) {
            setShowKeyModal(true);
        }
    }, [flash?.generated_key]);

    if (!isOpen && !showKeyModal) return null;

    const userCoins = auth?.user?.coins || 0;
    const hasActiveLicense = Boolean(auth?.user?.has_active_license);

    const handleDirectActivate = () => {
        setIsActivating(true);
        router.post('/license/buy', {
            auto_activate: true,
            device_token: getOrCreateDeviceId(),
            device_name: getDeviceName(),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsActivating(false);
                onClose();
            },
            onError: () => setIsActivating(false),
            onFinish: () => setIsActivating(false),
        });
    };

    const handleRedeemKey = (e) => {
        e.preventDefault();
        if (!licenseKeyInput.trim()) return;
        setIsRedeemingKey(true);
        router.post('/license/activate', {
            key: licenseKeyInput,
            device_token: getOrCreateDeviceId(),
            device_name: getDeviceName(),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsRedeemingKey(false);
                setLicenseKeyInput('');
                onClose();
            },
            onError: () => setIsRedeemingKey(false),
            onFinish: () => setIsRedeemingKey(false),
        });
    };

    const handleBuyGiftKey = () => {
        setIsBuyingGift(true);
        router.post('/license/buy', { auto_activate: false }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsBuyingGift(false);
                onClose();
            },
            onError: () => setIsBuyingGift(false),
            onFinish: () => setIsBuyingGift(false),
        });
    };

    const copyKey = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 sm:p-6 text-white relative">
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white shadow-inner">
                                    <span className="material-symbols-outlined text-2xl">vpn_key</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black leading-tight">6-Month Portal License</h3>
                                    <p className="text-xs text-white/90 mt-0.5 font-medium">50 Coins / 6 Months (180 Days Validity)</p>
                                </div>
                            </div>

                            {promptService && (
                                <div className="mt-3.5 p-2.5 bg-black/20 rounded-xl text-xs flex items-center gap-2 border border-white/20">
                                    <span className="material-symbols-outlined text-base">info</span>
                                    <span>
                                        <strong>{promptService.name}</strong> access karne ke liye 6-month license zaroori hai.
                                    </span>
                                </div>
                            )}

                            {hasActiveLicense && !promptService && (
                                <div className="mt-3.5 p-2.5 bg-emerald-900/40 rounded-xl text-xs flex items-center gap-2 border border-emerald-300/30">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span>
                                        Active until <strong>{auth?.user?.license_expires_at}</strong> ({auth?.user?.license_days_left}d left)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex border-b border-gray-100 bg-gray-50/70 p-1">
                            <button
                                type="button"
                                onClick={() => setTab('direct')}
                                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                    tab === 'direct' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {hasActiveLicense ? '🛡️ Status' : '⚡ Direct (50 Coins)'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setTab('key')}
                                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                    tab === 'key' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                🔑 Enter Key
                            </button>
                            <button
                                type="button"
                                onClick={() => setTab('gift')}
                                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                    tab === 'gift' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                🎁 Gift Key
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 sm:p-6">
                            {/* Tab 1: Direct Activate / Status */}
                            {tab === 'direct' && (
                                <div className="text-center space-y-4">
                                    {hasActiveLicense ? (
                                        <>
                                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                                                <span className="material-symbols-outlined text-3xl">verified</span>
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black text-gray-800">License Currently Active</h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Aapka 6-Month Portal License <strong>{auth?.user?.license_expires_at}</strong> tak valid hai.
                                                </p>
                                            </div>

                                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                                                <div className="text-left">
                                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Days Remaining</p>
                                                    <p className="text-xl font-black text-emerald-700">{auth?.user?.license_days_left} Days</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</p>
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-600 text-white">
                                                        ACTIVE
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left flex items-start gap-2">
                                                <span className="material-symbols-outlined text-amber-600 text-base mt-0.5">info</span>
                                                <p className="text-[11px] text-amber-800 leading-snug font-medium">
                                                    <strong>1 User = 1 Active License:</strong> Naya license ya nayi key aap tabhi activate kar sakte hain jab purana license expire ho jaye.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                                Aapke wallet se <strong>50 Coins</strong> deduct honge aur portal services turant <strong>6 mahine (180 din)</strong> ke liye activate ho jayenge.
                                            </p>

                                            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                                                <div className="text-left">
                                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Your Balance</p>
                                                    <p className="text-lg font-black text-amber-600">🪙 {userCoins} Coins</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cost</p>
                                                    <p className="text-lg font-black text-gray-800">50 Coins</p>
                                                </div>
                                            </div>

                                            {userCoins >= 50 ? (
                                                <button
                                                    type="button"
                                                    onClick={handleDirectActivate}
                                                    disabled={isActivating}
                                                    className="w-full py-3 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                                                    {isActivating ? 'Processing...' : 'Activate 6-Month License (50 Coins)'}
                                                </button>
                                            ) : (
                                                <div className="space-y-3">
                                                    <p className="text-xs text-red-600 font-bold flex items-center justify-center gap-1">
                                                        <span className="material-symbols-outlined text-[15px]">error</span>
                                                        50 coins required (Need {50 - userCoins} more coins)
                                                    </p>
                                                    <Link
                                                        href="/admin/coin-requests"
                                                        onClick={onClose}
                                                        className="w-full inline-block py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md text-sm transition-colors"
                                                    >
                                                        Recharge Coins
                                                    </Link>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Tab 2: Enter Key */}
                            {tab === 'key' && (
                                <>
                                    {hasActiveLicense ? (
                                        <div className="text-center space-y-4">
                                            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                                                <span className="material-symbols-outlined text-3xl">lock_clock</span>
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black text-gray-800">Key Activation Locked</h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Aapka portal license pehle se active hai ({auth?.user?.license_days_left} din baaki hain).
                                                </p>
                                            </div>
                                            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-left">
                                                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                                                    ⚠️ Jab tak aapka purana license ({auth?.user?.license_expires_at}) expire nahi hota, tab tak nayi key activate nahi ki ja sakti.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleRedeemKey} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                                    License Key Code
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="LIC-ABCD-1234-EFGH"
                                                    value={licenseKeyInput}
                                                    onChange={(e) => setLicenseKeyInput(e.target.value.toUpperCase())}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-center font-mono font-bold tracking-wider text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none uppercase"
                                                    required
                                                    autoFocus
                                                />
                                                <p className="text-[11px] text-gray-400 mt-1.5 text-center">
                                                    Admin se mili 16-character license key enter karein.
                                                </p>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isRedeemingKey || !licenseKeyInput.trim()}
                                                className="w-full py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                {isRedeemingKey ? 'Verifying Key...' : 'Activate With Key'}
                                            </button>
                                        </form>
                                    )}
                                </>
                            )}

                            {/* Tab 3: Buy Gift Key */}
                            {tab === 'gift' && (
                                <div className="text-center space-y-4">
                                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                        Aap <strong>50 Coins</strong> dekar ek unused License Key buy kar sakte hain aur kisi bhi user ya shopkeeper ko share kar sakte hain.
                                    </p>

                                    <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200/80 flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Your Balance</p>
                                            <p className="text-lg font-black text-blue-600">🪙 {userCoins} Coins</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cost</p>
                                            <p className="text-lg font-black text-gray-800">50 Coins</p>
                                        </div>
                                    </div>

                                    {userCoins >= 50 ? (
                                        <button
                                            type="button"
                                            onClick={handleBuyGiftKey}
                                            disabled={isBuyingGift}
                                            className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">featured_seasonal_and_gifts</span>
                                            {isBuyingGift ? 'Generating Key...' : 'Buy Gift Key (50 Coins)'}
                                        </button>
                                    ) : (
                                        <Link
                                            href="/admin/coin-requests"
                                            onClick={onClose}
                                            className="w-full inline-block py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md text-sm transition-colors"
                                        >
                                            Recharge Coins
                                        </Link>
                                    )}
                                </div>
                            )}

                            {/* Single Desktop Lock Guarantee Info */}
                            <div className="mt-5 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 rounded-2xl flex items-start gap-2.5 text-left">
                                <span className="material-symbols-outlined text-slate-500 text-lg mt-0.5 flex-shrink-0">desktop_windows</span>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                                        Single Desktop / PC Lock Active
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                        Ek License Key strictly ek hi desktop/computer par work karegi. Kisi dusre PC par use nahi ki ja sakegi.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Generated Gift Key Modal */}
            {showKeyModal && flash?.generated_key && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center">
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
                            type="button"
                            onClick={() => copyKey(flash.generated_key)}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-colors mb-2 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                {copied ? 'done' : 'content_copy'}
                            </span>
                            {copied ? 'Copied to Clipboard!' : 'Copy License Key'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowKeyModal(false)}
                            className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
