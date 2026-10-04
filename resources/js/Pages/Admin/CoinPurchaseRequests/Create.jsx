import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import axios from 'axios';

const STATUS_CONFIG = {
    pending:    { label: 'Pending',    classes: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
    processing: { label: 'Processing', classes: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
    approved:   { label: 'Success',    classes: 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800' },
    success:    { label: 'Success',    classes: 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800' },
    rejected:   { label: 'Failed',     classes: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' },
    failed:     { label: 'Failed',     classes: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' },
};

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export default function Create({ packages = [], myRequests = [], userCoins = 0, upiId = '', upiName = '', whatsappNumber = '' }) {
    const { auth, flash, whatsappNumber: sharedWhatsapp } = usePage().props;
    const targetWhatsapp = (whatsappNumber || sharedWhatsapp || '380630323112').replace(/[^0-9]/g, '');

    const [amount, setAmount] = useState('100');
    const [pnrNumber, setPnrNumber] = useState('');
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [onlineOrder, setOnlineOrder] = useState(null);

    // Verification & Polling states
    const [verifyUtr, setVerifyUtr] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyNotice, setVerifyNotice] = useState(null);
    const [pollingActive, setPollingActive] = useState(false);

    // Result modals
    const [successData, setSuccessData] = useState(null);
    const [failedData, setFailedData] = useState(null);

    const pollingIntervalRef = useRef(null);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    // Automatic real-time status polling when an order is open
    useEffect(() => {
        if (!onlineOrder || !onlineOrder.order_id) {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
            setPollingActive(false);
            return;
        }

        setPollingActive(true);
        pollingIntervalRef.current = setInterval(async () => {
            try {
                // Check server-side verification endpoint
                const res = await axios.post('/wallet/verify-payment', {
                    order_id: onlineOrder.order_id,
                });

                if (res.data && res.data.status === 'SUCCESS' && res.data.verified) {
                    clearInterval(pollingIntervalRef.current);
                    setPollingActive(false);
                    setSuccessData({
                        amount: res.data.verified_amount || onlineOrder.amount,
                        order_id: onlineOrder.order_id,
                        detail: res.data.detail || `₹${res.data.verified_amount || onlineOrder.amount} has been added to your wallet.`,
                        wallet_balance: res.data.wallet_balance,
                    });
                    setOnlineOrder(null);
                } else if (res.data && res.data.status === 'FAILED') {
                    clearInterval(pollingIntervalRef.current);
                    setPollingActive(false);
                    setFailedData({
                        message: res.data.message || 'Payment Failed',
                        detail: res.data.detail || 'No money has been added to your wallet.',
                    });
                    setOnlineOrder(null);
                }
            } catch (e) {
                // Ignore transient polling network errors
            }
        }, 3000);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [onlineOrder]);

    // Step 3 & 4: User submits amount -> Create unique Order ID on backend
    const handleProceedToPayment = async (e) => {
        if (e) e.preventDefault();
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount < 1) {
            setOrderError('कृपया कम से कम ₹1 की राशि दर्ज करें।');
            return;
        }

        setOrderLoading(true);
        setOrderError(null);
        setOnlineOrder(null);
        setVerifyNotice(null);
        setVerifyUtr(pnrNumber.trim());

        try {
            const res = await axios.post('/wallet/create-order', {
                amount: numAmount,
                pnr_number: pnrNumber.trim(),
                utr_number: pnrNumber.trim(),
            });

            if (res.data && res.data.success) {
                setOnlineOrder(res.data);
            } else {
                setOrderError(res.data?.message || 'भुगतान आर्डर जनरेट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
            }
        } catch (err) {
            setOrderError(err.response?.data?.message || err.message || 'गेटवे कनेक्ट नहीं हो पाया। कृपया पुनः प्रयास करें।');
        } finally {
            setOrderLoading(false);
        }
    };

    // Step 6: Instant 12-Digit UTR Verification
    const handleVerifyUtr = async () => {
        if (!onlineOrder?.order_id) return;
        const clean = verifyUtr.trim().replace(/[^0-9]/g, '');
        if (!clean || clean.length < 10) {
            setVerifyNotice({ type: 'error', text: 'कृपया सही 12-अंकों का UPI Ref / UTR नंबर दर्ज करें।' });
            return;
        }

        setIsVerifying(true);
        setVerifyNotice(null);

        try {
            const res = await axios.post('/wallet/verify-payment', {
                order_id: onlineOrder.order_id,
                transaction_id: clean,
                utr: clean,
                pnr: clean,
                pnr_number: clean,
            });

            if (res.data && res.data.status === 'SUCCESS' && res.data.verified) {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                setSuccessData({
                    amount: res.data.verified_amount || onlineOrder.amount,
                    order_id: onlineOrder.order_id,
                    utr: clean,
                    detail: res.data.detail || `₹${res.data.verified_amount || onlineOrder.amount} has been added to your wallet.`,
                    wallet_balance: res.data.wallet_balance,
                });
                setOnlineOrder(null);
            } else if (res.data && res.data.status === 'FAILED') {
                setVerifyNotice({
                    type: 'error',
                    text: res.data.detail || res.data.message || 'Payment Failed: No money has been added to your wallet.',
                });
            } else {
                setVerifyNotice({
                    type: 'pending',
                    text: res.data?.message || 'Payment verification is pending. Please wait.',
                });
            }
        } catch (err) {
            setVerifyNotice({
                type: 'error',
                text: err.response?.data?.message || 'वेरिफिकेशन में त्रुटि आई। कृपया 1 मिनट बाद पुनः प्रयास करें।',
            });
        } finally {
            setIsVerifying(false);
        }
    };

    // Online QR Image source
    const ONLINE_QR_SRC = onlineOrder?.qr_base64
        ? (onlineOrder.qr_base64.startsWith('data:') ? onlineOrder.qr_base64 : `data:image/png;base64,${onlineOrder.qr_base64}`)
        : (onlineOrder?.qr_url || (onlineOrder?.upi_id
            ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(`upi://pay?pa=${onlineOrder.upi_id}&pn=${encodeURIComponent(onlineOrder.merchant_name || upiName || 'Store')}&am=${onlineOrder.amount}&cu=INR&tn=${onlineOrder.order_id || 'WalletRecharge'}`)}`
            : null));

    return (
        <AdminLayout>
            <Head title="Add Money to Wallet" />

            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Back to Dashboard Button (Fixed working navigation) */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer group"
                    >
                        <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span>Back to Dashboard</span>
                    </Link>

                    {/* Live Balance Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-extrabold shadow-2xs">
                        <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                        <span>Balance: ₹{Number(userCoins || 0).toLocaleString('en-IN')}.00</span>
                    </div>
                </div>

                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Add Money to Wallet / वॉलेट में पैसे जोड़ें
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500">
                        100% सुरक्षित और तुरंत ऑटोमैटिक वॉलेट रिचार्ज (1 Coin = ₹1).
                    </p>
                </div>

                {/* STEP 1: ENTER AMOUNT FORM (When no order is active) */}
                {!onlineOrder && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="max-w-lg mx-auto space-y-5">
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                                    Enter Amount (राशि दर्ज करें) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            setOrderError(null);
                                        }}
                                        placeholder="e.g. 100"
                                        className="w-full pl-10 pr-4 py-3.5 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                                    Minimum recharge amount is ₹1. Instant credit to your wallet.
                                </p>
                            </div>

                            {/* PNR / UTR Number Line */}
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center justify-between">
                                    <span>PNR Number / UTR No. (पीएनआर / यूटीआर नंबर)</span>
                                    <span className="text-[10px] text-slate-400 font-semibold lowercase">(optional if paying now via QR)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
                                        tag
                                    </span>
                                    <input
                                        type="text"
                                        maxLength="30"
                                        value={pnrNumber}
                                        onChange={(e) => {
                                            setPnrNumber(e.target.value.trim());
                                            setOrderError(null);
                                        }}
                                        placeholder="Enter PNR / 12-Digit UTR Number (e.g. 428901849204)"
                                        className="w-full pl-11 pr-4 py-3 text-sm font-mono font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                                    UPI ऐप (GPay, PhonePe, Paytm) से भुगतान के बाद प्राप्त 12-अंकों का PNR / UTR नंबर यहाँ दर्ज करें। यह नंबर सीधे एडमिन को दिखाई देगा।
                                </p>
                            </div>

                            {/* Error notice if any */}
                            {orderError && (
                                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base text-red-500">error</span>
                                    <span>{orderError}</span>
                                </div>
                            )}

                            {/* Proceed to Payment Button (Step 3) */}
                            <button
                                type="button"
                                onClick={handleProceedToPayment}
                                disabled={orderLoading || !amount || parseFloat(amount) < 1}
                                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 disabled:opacity-50 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                            >
                                {orderLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Creating Secure Order...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px]">lock</span>
                                        <span>Proceed to Payment — ₹{amount || 0}</span>
                                        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5: PAYMENT GATEWAY CARD WITH DYNAMIC QR & 1-CLICK PAY */}
                {onlineOrder && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

                        {/* Top bar with Order details & Cancel button */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Order ID:</span>
                                <p className="font-mono font-black text-sm text-slate-800 dark:text-white">{onlineOrder.order_id}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400 font-semibold">Amount to Pay:</span>
                                <span className="text-2xl font-black text-blue-600">₹{onlineOrder.amount}</span>
                                <button
                                    type="button"
                                    onClick={() => setOnlineOrder(null)}
                                    className="ml-2 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Left Side: Dynamic QR & Mobile 1-Click Pay */}
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>Real-time Dynamic UPI QR</span>
                                </div>

                                <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 inline-block shadow-md">
                                    {ONLINE_QR_SRC ? (
                                        <img
                                            src={ONLINE_QR_SRC}
                                            alt="UPI Payment QR"
                                            className="w-56 h-56 mx-auto object-contain rounded-xl"
                                        />
                                    ) : (
                                        <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                                            Generating QR...
                                        </div>
                                    )}
                                    <p className="text-[11px] text-slate-400 font-bold mt-2">
                                        Scan with PhonePe · GPay · Paytm · BHIM
                                    </p>
                                </div>

                                {/* Direct Mobile UPI Intent Button */}
                                {onlineOrder.payment_url && (
                                    <a
                                        href={onlineOrder.payment_url}
                                        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-base">payments</span>
                                        <span>Pay via UPI App (PhonePe / GPay / Paytm)</span>
                                    </a>
                                )}
                            </div>

                            {/* Right Side: Real-Time Auto-Polling & 12-Digit UTR Verify */}
                            <div className="space-y-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                                <div>
                                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600 text-lg">verified</span>
                                        <span>Instant Auto Verification</span>
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        QR कोड स्कैन करके भुगतान करें। पेमेंट कन्फर्म होते ही वॉलेट में पैसे अपने आप जुड़ जाएंगे।
                                    </p>
                                </div>

                                {/* Polling Live Indicator */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Checking bank status automatically...
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-mono text-slate-400 font-bold">
                                        Auto 3s
                                    </span>
                                </div>

                                {/* UTR Fast Track Verification Input */}
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                        Paid? Verify With 12-Digit PNR / UTR Number:
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            maxLength="30"
                                            value={verifyUtr}
                                            onChange={(e) => setVerifyUtr(e.target.value.trim())}
                                            placeholder="e.g. 428901849204"
                                            className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVerifyUtr}
                                            disabled={isVerifying || !verifyUtr}
                                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                                        >
                                            {isVerifying ? 'Checking...' : 'Verify Now'}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        Google Pay, PhonePe या Paytm हिस्ट्री से 12 डिजिट का PNR / UTR नंबर दर्ज करें।
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
                            </div>
                        </div>
                    </div>
                )}

                {/* RECENT WALLET TRANSACTIONS */}
                {myRequests.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                            Recent Wallet Transactions
                        </h3>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Amount</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Order ID / PNR</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                    {myRequests.map((req) => {
                                        const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                                        return (
                                            <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                                <td className="px-5 py-3.5 font-black text-sm text-slate-900 dark:text-white">
                                                    ₹{req.package_amount}
                                                </td>
                                                <td className="px-5 py-3.5 font-mono text-slate-500">
                                                    {req.utr_number || req.order_id || `#${req.id}`}
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-400">
                                                    {new Date(req.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${cfg.classes}`}>
                                                        {cfg.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* PAYMENT SUCCESS MODAL (Exact requested user response) */}
                {successData && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500"></div>

                            <button
                                type="button"
                                onClick={() => {
                                    setSuccessData(null);
                                    router.reload();
                                }}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>

                            <div className="w-20 h-20 mx-auto mb-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-full flex items-center justify-center border-4 border-emerald-100 dark:border-emerald-800 text-emerald-500 shadow-sm">
                                <span className="material-symbols-outlined text-4xl">check_circle</span>
                            </div>

                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full mb-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Verified & Credited
                            </span>

                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                                Payment Successful
                            </h3>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-5">
                                ₹{successData.amount} has been added to your wallet.
                            </p>

                            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-5 text-left space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-medium">Added Amount:</span>
                                    <span className="text-slate-900 dark:text-white font-black text-sm">₹{successData.amount}</span>
                                </div>
                                {successData.order_id && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-medium">Order ID:</span>
                                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{successData.order_id}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/dashboard"
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
                                    className="w-full py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
                                >
                                    Done / Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PAYMENT FAILED MODAL */}
                {failedData && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-rose-600"></div>

                            <div className="w-20 h-20 mx-auto mb-4 bg-red-50 dark:bg-red-950/60 rounded-full flex items-center justify-center border-4 border-red-100 dark:border-red-800 text-red-500 shadow-sm">
                                <span className="material-symbols-outlined text-4xl">error</span>
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                                Payment Failed
                            </h3>
                            <p className="text-sm font-semibold text-slate-500 mb-5">
                                No money has been added to your wallet.
                            </p>

                            <button
                                type="button"
                                onClick={() => setFailedData(null)}
                                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl cursor-pointer"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
