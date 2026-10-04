import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import axios from 'axios';

const STATUS_CONFIG = {
    pending:  { label: 'Pending',  classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
    approved: { label: 'Approved', classes: 'bg-green-50 text-green-700 border border-green-200' },
    rejected: { label: 'Rejected', classes: 'bg-red-50 text-red-700 border border-red-200' },
};

function PackageCard({ pkg, selected, onSelect }) {
    const hasBonus = pkg.bonus_coins > 0;
    return (
        <button
            type="button"
            onClick={() => onSelect(pkg)}
            className={`relative w-full text-left rounded-xl border-2 p-3.5 transition-all duration-200 cursor-pointer ${
                selected
                    ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
            }`}
        >
            {pkg.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow whitespace-nowrap">
                    ⭐ Most Popular
                </span>
            )}
            <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{pkg.label}</p>
                {hasBonus && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        +{pkg.bonus_pct}%
                    </span>
                )}
            </div>
            <p className="text-xl font-black text-blue-600 mb-2">₹{pkg.amount}</p>
            <div className="space-y-0.5 text-xs">
                <div className="flex justify-between text-slate-500">
                    <span>Base</span>
                    <span className="font-semibold text-slate-700">{pkg.base_coins}</span>
                </div>
                {hasBonus && (
                    <div className="flex justify-between text-green-600">
                        <span>Bonus</span>
                        <span className="font-bold">+{pkg.bonus_coins}</span>
                    </div>
                )}
                <div className={`flex justify-between pt-1 border-t font-bold ${hasBonus ? 'border-green-100 text-green-600' : 'border-slate-100 text-slate-800'}`}>
                    <span>Total</span>
                    <span>{pkg.coins_requested} coins</span>
                </div>
            </div>
        </button>
    );
}

export default function Create({ packages, myRequests, userCoins, upiId, upiName, whatsappNumber, paycorexEnabled = true, manualPaymentEnabled = true }) {
    const { auth, flash, whatsappNumber: sharedWhatsapp } = usePage().props;
    const targetWhatsapp = (whatsappNumber || sharedWhatsapp || '380630323112').replace(/[^0-9]/g, '');

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isCustom, setIsCustom] = useState(false);
    const [customAmount, setCustomAmount] = useState('');
    const [preview, setPreview] = useState(null);
    const [successData, setSuccessData] = useState(null);

    // Gateway states
    const defaultMode = paycorexEnabled ? 'online' : (manualPaymentEnabled ? 'manual' : 'online');
    const [paymentMode, setPaymentMode] = useState(defaultMode);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [onlineOrder, setOnlineOrder] = useState(null);
    const [verifyUtr, setVerifyUtr] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyNotice, setVerifyNotice] = useState(null);
    const [pollingActive, setPollingActive] = useState(false);

    const pollingIntervalRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        package_amount: '',
        coins_requested: '',
        utr_number: '',
        payment_screenshot: null,
    });

    useEffect(() => {
        if (flash?.submitted_request) {
            setSuccessData(flash.submitted_request);
            setSelectedPackage(null);
            setOnlineOrder(null);
            setPreview(null);
            reset();
        }
    }, [flash?.submitted_request]);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    // Automatic polling when onlineOrder is active
    useEffect(() => {
        if (!onlineOrder || !onlineOrder.order_id || paymentMode !== 'online') {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
            return;
        }

        setPollingActive(true);
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const res = await axios.post('/payment/paycorex/check-status', {
                    order_id: onlineOrder.order_id,
                });

                if (res.data && res.data.is_approved) {
                    clearInterval(pollingIntervalRef.current);
                    setPollingActive(false);
                    setSuccessData({
                        package_amount: onlineOrder.amount,
                        coins_requested: onlineOrder.coins_requested,
                        order_id: onlineOrder.order_id,
                        is_online: true,
                    });
                    setOnlineOrder(null);
                    setSelectedPackage(null);
                }
            } catch (e) {
                // Ignore transient polling network errors
            }
        }, 3500);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [onlineOrder, paymentMode]);

    // Handle package selection
    const handlePackageSelect = (pkg) => {
        setIsCustom(false);
        setSelectedPackage(pkg);
        setOrderError(null);
        setVerifyNotice(null);
        setOnlineOrder(null);
        setData(d => ({ ...d, package_amount: pkg.amount, coins_requested: pkg.coins_requested }));

        if (paycorexEnabled && paymentMode === 'online') {
            createPaycorexOrder(pkg.amount, pkg.coins_requested);
        }
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        const amt = parseInt(customAmount);
        if (amt > 0) {
            const pkg = { amount: amt, coins_requested: amt, label: 'Custom', base_coins: amt, bonus_coins: 0, bonus_pct: 0 };
            setSelectedPackage(pkg);
            setOrderError(null);
            setVerifyNotice(null);
            setOnlineOrder(null);
            setData(d => ({ ...d, package_amount: amt, coins_requested: amt }));

            if (paycorexEnabled && paymentMode === 'online') {
                createPaycorexOrder(amt, amt);
            }
        }
    };

    // Create PayCoreX order via API
    const createPaycorexOrder = async (amount, coins) => {
        setOrderLoading(true);
        setOrderError(null);
        setOnlineOrder(null);

        try {
            const res = await axios.post('/payment/paycorex/create-order', {
                package_amount: amount,
                coins_requested: coins,
            });

            if (res.data && res.data.success) {
                setOnlineOrder(res.data);
            } else {
                const msg = res.data?.message || 'Gateway error';
                setOrderError(msg);
                if (res.data?.fallback_manual) {
                    // Smoothly switch to manual mode so user is not blocked
                    setPaymentMode('manual');
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setOrderError(msg);
            setPaymentMode('manual');
        } finally {
            setOrderLoading(false);
        }
    };

    // Manual Verify UTR button click
    const handleVerifyUtr = async () => {
        if (!onlineOrder?.order_id) return;
        if (!verifyUtr || verifyUtr.trim().length < 6) {
            setVerifyNotice({ type: 'error', text: 'कृपया सही 12 अंकों का UTR नंबर दर्ज करें।' });
            return;
        }

        setIsVerifying(true);
        setVerifyNotice(null);

        try {
            const res = await axios.post('/payment/paycorex/check-status', {
                order_id: onlineOrder.order_id,
                utr: verifyUtr.trim(),
            });

            if (res.data && res.data.is_approved) {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                setSuccessData({
                    package_amount: onlineOrder.amount,
                    coins_requested: onlineOrder.coins_requested,
                    order_id: onlineOrder.order_id,
                    utr: verifyUtr.trim(),
                    is_online: true,
                });
                setOnlineOrder(null);
                setSelectedPackage(null);
            } else {
                setVerifyNotice({
                    type: 'pending',
                    text: res.data?.message || 'बैंक से पेमेंट अभी तक कन्फर्म नहीं हुई है। 1-2 मिनट बाद पुनः प्रयास करें।',
                });
            }
        } catch (err) {
            setVerifyNotice({
                type: 'error',
                text: err.response?.data?.message || 'वेरिफिकेशन में त्रुटि आई। कृपया पुनः प्रयास करें।',
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('payment_screenshot', file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmitManual = (e) => {
        e.preventDefault();
        post('/admin/coin-requests', {
            forceFormData: true,
            onSuccess: (page) => {
                if (page.props.flash?.submitted_request) {
                    setSuccessData(page.props.flash.submitted_request);
                } else {
                    setSuccessData({
                        package_amount: data.package_amount,
                        coins_requested: data.coins_requested,
                    });
                }
                setSelectedPackage(null);
                setPreview(null);
                reset();
            },
        });
    };

    const getWhatsAppUrl = (reqData) => {
        const user = auth?.user || {};
        let msg = `*Coin Purchase - Payment Screenshot*\n`;
        msg += `------------------------------------\n`;
        if (user.name)  msg += `👤 *Name:* ${user.name}\n`;
        if (user.phone) msg += `📱 *Phone:* ${user.phone}\n`;
        if (user.email) msg += `📧 *Email:* ${user.email}\n`;
        msg += `💰 *Amount Paid:* ₹${reqData.package_amount}\n`;
        msg += `🪙 *Coins Requested:* ${reqData.coins_requested}\n`;
        if (reqData.order_id) msg += `🆔 *Order ID:* ${reqData.order_id}\n`;
        else if (reqData.id) msg += `🆔 *Request ID:* #${reqData.id}\n`;
        if (reqData.utr) msg += `🔢 *UTR:* ${reqData.utr}\n`;
        if (reqData.payment_screenshot) {
            msg += `🔗 *Receipt:* ${reqData.payment_screenshot}\n`;
        }
        msg += `------------------------------------\n`;
        msg += `I have made the payment. Please verify and credit coins.`;

        return `https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(msg)}`;
    };

    // Manual fallback QR image
    const MANUAL_QR_IMAGE = selectedPackage
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${selectedPackage.amount}&cu=INR&tn=CoinPurchase`)}`
        : null;

    // Online QR Image source (supports PayCoreX base64, dynamic qr_url, or fallback)
    const ONLINE_QR_SRC = onlineOrder?.qr_base64
        ? (onlineOrder.qr_base64.startsWith('data:') ? onlineOrder.qr_base64 : `data:image/png;base64,${onlineOrder.qr_base64}`)
        : (onlineOrder?.qr_url || (onlineOrder?.upi_id
            ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${onlineOrder.upi_id}&pn=${encodeURIComponent(onlineOrder.merchant_name || upiName)}&am=${onlineOrder.amount}&cu=INR&tn=${onlineOrder.order_id || 'CoinRecharge'}`)}`
            : MANUAL_QR_IMAGE));

    return (
        <AdminLayout>
            <Head title="Buy Coins" />

            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Back to Dashboard bar */}
                <div className="mb-4 flex items-center justify-between">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer group"
                    >
                        <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                        <span>Back to Dashboard</span>
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-6 flex flex-wrap items-baseline gap-3">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Buy Coins / Add Balance</h2>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full px-3 py-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {userCoins} coins
                    </span>
                    <p className="text-sm text-slate-400">1 coin = ₹1 &nbsp;·&nbsp; Automatic instant recharge available!</p>
                </div>

                {/* STEP 1: Package Selection */}
                {!selectedPackage && (
                    <div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Choose a Package</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {packages.map((pkg, i) => (
                                <PackageCard
                                    key={i}
                                    pkg={pkg}
                                    selected={false}
                                    onSelect={handlePackageSelect}
                                />
                            ))}
                            
                            {/* Custom Amount Card */}
                            <button
                                type="button"
                                onClick={() => { setIsCustom(true); setSelectedPackage(null); }}
                                className={`relative w-full text-left rounded-xl border-2 p-3.5 transition-all duration-200 cursor-pointer ${
                                    isCustom ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custom</p>
                                </div>
                                <p className="text-xl font-black text-blue-600 mb-2">₹ Any</p>
                                <p className="text-xs text-slate-500 font-semibold">Enter custom amount</p>
                            </button>
                        </div>
                        
                        {isCustom && !selectedPackage && (
                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-800 max-w-sm">
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">Enter Amount (₹)</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-slate-900 bg-white" 
                                        placeholder="E.g. 50"
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleCustomSubmit}
                                        disabled={!customAmount || parseInt(customAmount) < 1}
                                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                                    >
                                        Next
                                    </button>
                                </div>
                                {customAmount > 0 && <p className="text-xs text-green-600 mt-2 font-semibold">You will get {customAmount} coins</p>}
                            </div>
                        )}

                        {errors.package_amount && <p className="text-sm text-red-500 mt-2">{errors.package_amount}</p>}
                    </div>
                )}

                {/* STEP 2: Payment Section */}
                {selectedPackage && (
                    <div className="space-y-6">

                        {/* Top bar with Package Info and Mode Toggle */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-black text-xl shadow-inner">
                                    🪙
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-extrabold text-slate-900 dark:text-white">{selectedPackage.label} Pack</span>
                                        <span className="text-base font-black text-blue-600">₹{selectedPackage.amount}</span>
                                    </div>
                                    <span className="text-xs text-emerald-600 font-bold">
                                        +{selectedPackage.coins_requested} Coins Credit
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Mode Selector Tabs */}
                                {paycorexEnabled && manualPaymentEnabled && (
                                    <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentMode('online');
                                                if (!onlineOrder) {
                                                    createPaycorexOrder(selectedPackage.amount, selectedPackage.coins_requested);
                                                }
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                                paymentMode === 'online'
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                                            }`}
                                        >
                                            <span>⚡</span>
                                            <span>Instant Auto Pay</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMode('manual')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                                paymentMode === 'manual'
                                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                                            }`}
                                        >
                                            <span>📝</span>
                                            <span>Manual QR / Upload</span>
                                        </button>
                                    </div>
                                )}
                                {paycorexEnabled && !manualPaymentEnabled && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 text-xs font-bold">
                                        <span>⚡</span>
                                        <span>Instant Auto Pay</span>
                                    </div>
                                )}
                                {!paycorexEnabled && manualPaymentEnabled && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 text-xs font-bold">
                                        <span>📝</span>
                                        <span>Manual QR / Upload</span>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedPackage(null);
                                        setOnlineOrder(null);
                                        setOrderError(null);
                                    }}
                                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
                                >
                                    Change Pack
                                </button>
                            </div>
                        </div>

                        {/* Notice Banner if Gateway returned an error or fallback */}
                        {orderError && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs leading-relaxed">
                                <span className="material-symbols-outlined text-amber-500 shrink-0 text-lg">warning</span>
                                <div>
                                    <p className="font-bold">Gateway Notice (गेटवे सूचना):</p>
                                    <p className="mt-0.5">{orderError}</p>
                                    {manualPaymentEnabled ? (
                                        <p className="mt-1 font-medium text-amber-700 dark:text-amber-400">
                                            आप Direct UPI QR कोड से पेमेंट करके स्क्रीनशॉट अपलोड कर सकते हैं, आपके कॉइन तुरंत प्रोसेस कर दिए जाएंगे।
                                        </p>
                                    ) : (
                                        <p className="mt-1 font-medium text-amber-700 dark:text-amber-400">
                                            कृपया पुनः प्रयास करें या सहायता के लिए WhatsApp पर संपर्क करें।
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* MODE 1: ONLINE PAYCOREX INSTANT PAY */}
                        {paymentMode === 'online' && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                                {orderLoading ? (
                                    <div className="py-16 text-center space-y-3">
                                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Generating Secure Payment QR...</p>
                                        <p className="text-xs text-slate-400">PayCoreX सर्वर से डायनामिक QR कोड तैयार किया जा रहा है...</p>
                                    </div>
                                ) : onlineOrder ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                        {/* Left Side: Dynamic QR & Pay Button */}
                                        <div className="text-center space-y-4">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                <span>Real-time Dynamic UPI QR</span>
                                            </div>

                                            <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 inline-block shadow-md">
                                                <img
                                                    src={ONLINE_QR_SRC}
                                                    alt="PayCoreX QR Code"
                                                    className="w-56 h-56 mx-auto object-contain rounded-xl"
                                                />
                                                <p className="text-[11px] text-slate-400 font-bold mt-2">
                                                    GPay · PhonePe · Paytm · BHIM
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-400">Amount to Pay</p>
                                                <p className="text-3xl font-black text-slate-900 dark:text-white">₹{onlineOrder.amount}</p>
                                                {onlineOrder.upi_id && (
                                                    <p className="text-xs font-mono font-bold text-slate-500 mt-1">UPI: {onlineOrder.upi_id}</p>
                                                )}
                                            </div>

                                            {/* Mobile Direct Pay Button */}
                                            {onlineOrder.payment_url && (
                                                <a
                                                    href={onlineOrder.payment_url}
                                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-base">payments</span>
                                                    <span>Pay via UPI App (PhonePe / GPay / Paytm)</span>
                                                </a>
                                            )}
                                        </div>

                                        {/* Right Side: Verification, Polling, & UTR Entry */}
                                        <div className="space-y-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                                            <div>
                                                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-blue-600 text-lg">verified</span>
                                                    <span>Instant Auto Verification</span>
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    QR कोड स्कैन करके पेमेंट करें। पेमेंट होने पर यह अपने आप 3 सेकंड में कन्फर्म हो जाएगा।
                                                </p>
                                            </div>

                                            {/* Auto-Polling Status Badge */}
                                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        Checking bank status...
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-mono text-slate-400 font-bold">
                                                    Auto-checking 3s
                                                </span>
                                            </div>

                                            {/* UTR Fast Track Verification */}
                                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                                    Paid? Verify With 12-Digit UTR:
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        maxLength="22"
                                                        value={verifyUtr}
                                                        onChange={e => setVerifyUtr(e.target.value.trim())}
                                                        placeholder="e.g. 428901849204"
                                                        className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleVerifyUtr}
                                                        disabled={isVerifying || !verifyUtr}
                                                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                                                    >
                                                        {isVerifying ? 'Checking...' : 'Instant Verify'}
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-slate-400">
                                                    Google Pay, PhonePe या Paytm हिस्ट्री से 12 डिजिट का UPI Ref / UTR दर्ज करें।
                                                </p>

                                                {verifyNotice && (
                                                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                                        verifyNotice.type === 'error'
                                                            ? 'bg-red-50 text-red-700 border border-red-200'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}>
                                                        <span className="material-symbols-outlined text-sm">info</span>
                                                        <span>{verifyNotice.text}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Details & Reference */}
                                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-400 space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Order Reference:</span>
                                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{onlineOrder.order_id}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Coins to Credit:</span>
                                                    <span className="font-bold text-emerald-600">{onlineOrder.coins_requested} Coins</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <button
                                            type="button"
                                            onClick={() => createPaycorexOrder(selectedPackage.amount, selectedPackage.coins_requested)}
                                            className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-blue-700 cursor-pointer"
                                        >
                                            Try Again (पुनः प्रयास करें)
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MODE 2: MANUAL UPI & SCREENSHOT UPLOAD */}
                        {paymentMode === 'manual' && (
                            <form onSubmit={handleSubmitManual} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left: Manual QR Code */}
                                    <div className="text-center space-y-3">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Direct UPI QR Code</p>
                                        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 inline-block shadow-sm">
                                            <img
                                                src={MANUAL_QR_IMAGE}
                                                alt="UPI QR Code"
                                                className="w-48 h-48 mx-auto rounded-xl object-contain"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-400">UPI ID</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <p className="text-sm font-black text-slate-800 dark:text-white tracking-wide">{upiId}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(upiId);
                                                        alert('UPI ID Copied: ' + upiId);
                                                    }}
                                                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold cursor-pointer"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                            <div className="mt-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl px-4 py-2">
                                                <p className="text-xs text-blue-500">Amount to Pay</p>
                                                <p className="text-2xl font-black text-blue-700 dark:text-blue-300">₹{selectedPackage.amount}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Upload Screenshot and UTR */}
                                    <div className="space-y-4">
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">पेमेंट के बाद स्क्रीनशॉट अपलोड करें:</p>

                                        {/* Screenshot upload */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                                                Payment Screenshot <span className="text-red-500">*</span>
                                            </label>
                                            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors overflow-hidden ${
                                                preview ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50'
                                            }`}>
                                                {preview ? (
                                                    <img src={preview} alt="Preview" className="w-full max-h-52 object-contain p-2" />
                                                ) : (
                                                    <div className="py-8 text-center">
                                                        <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        <p className="text-xs text-slate-500 font-bold">Click to upload screenshot</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, PDF · max 4MB</p>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
                                            </label>
                                            {errors.payment_screenshot && <p className="text-xs text-red-500 mt-1">{errors.payment_screenshot}</p>}
                                            {preview && (
                                                <button type="button" onClick={() => { setPreview(null); setData('payment_screenshot', null); }} className="mt-1 text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                                                    ✕ Remove
                                                </button>
                                            )}
                                        </div>

                                        {/* UTR / Transaction ID */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                                                <span>UPI Ref / UTR Number (12 अंकों का UTR)</span>
                                                <span className="text-[10px] text-blue-600 font-bold lowercase">recommended</span>
                                            </label>
                                            <input
                                                type="text"
                                                maxLength="22"
                                                value={data.utr_number}
                                                onChange={(e) => setData('utr_number', e.target.value.trim())}
                                                placeholder="e.g. 428901849204"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white font-mono text-xs font-bold focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* Submit button */}
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full py-3 px-6 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {processing ? 'Submitting...' : `Submit Request — ₹${selectedPackage.amount} (${selectedPackage.coins_requested} Coins)`}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Recent Requests */}
                {myRequests.length > 0 && (
                    <div className="mt-10">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Recent Requests</h3>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Coins</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Paid</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Method</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {myRequests.map(req => {
                                        const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                                        return (
                                            <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="px-5 py-3"><span className="font-bold text-amber-600 text-sm">{req.coins_requested} coins</span></td>
                                                <td className="px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">₹{req.package_amount}</td>
                                                <td className="px-5 py-3 text-xs font-bold text-slate-500">
                                                    {req.gateway === 'paycorex' ? '⚡ PayCoreX' : '📝 Manual UPI'}
                                                </td>
                                                <td className="px-5 py-3 text-xs text-slate-400">
                                                    {new Date(req.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${cfg.classes}`}>
                                                        {cfg.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    {req.status === 'pending' ? (
                                                        <a
                                                            href={getWhatsAppUrl({
                                                                id: req.id,
                                                                order_id: req.order_id,
                                                                package_amount: req.package_amount,
                                                                coins_requested: req.coins_requested,
                                                                utr: req.utr_number,
                                                                payment_screenshot: req.payment_screenshot ? `/storage/${req.payment_screenshot}` : null,
                                                            })}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Send Screenshot on WhatsApp"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-lg shadow-sm transition-all hover:scale-105"
                                                        >
                                                            <span>WhatsApp</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-emerald-600 font-bold">✓ Done</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* PAYMENT SUCCESS MODAL */}
                {successData && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500"></div>

                            <button
                                type="button"
                                onClick={() => {
                                    setSuccessData(null);
                                    router.reload();
                                }}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div className="w-20 h-20 mx-auto mb-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-full flex items-center justify-center border-4 border-emerald-100 dark:border-emerald-800 text-emerald-500 shadow-sm">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full mb-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                {successData.is_online ? 'Payment Verified & Credited!' : 'Payment Request Submitted'}
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                                {successData.is_online ? 'Recharge Successful!' : 'Payment Successful!'}
                            </h3>
                            <p className="text-xs text-slate-500 mb-5">
                                {successData.is_online 
                                    ? 'आपके वॉलेट में कॉइन्स तुरंत क्रेडिट कर दिए गए हैं।' 
                                    : 'आपकी कॉइन रिक्वेस्ट दर्ज कर ली गई है।'}
                            </p>

                            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-5 text-left space-y-2.5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Amount:</span>
                                    <span className="text-slate-900 dark:text-white font-black text-base">₹{successData.package_amount}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Coins Credited:</span>
                                    <span className="text-emerald-600 font-black text-base">🪙 {successData.coins_requested} Coins</span>
                                </div>
                                {successData.order_id && (
                                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                                        <span className="text-slate-400 font-medium">Order ID:</span>
                                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{successData.order_id}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/admin/dashboard"
                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>Go to Dashboard</span>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSuccessData(null);
                                        router.reload();
                                    }}
                                    className="w-full py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    Done / Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
