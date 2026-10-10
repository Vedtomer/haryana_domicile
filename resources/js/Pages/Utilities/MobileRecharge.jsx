import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function MobileRecharge({
    service,
    userCoins = 0,
    operators = {},
    recentRecharges = [],
    isAdmin = false,
    apiBalance = null,
    apiKey = '',
    apiUrl = '',
    currentView = 'my',
}) {
    const { auth } = usePage().props;
    const [currentCoins, setCurrentCoins] = useState(userCoins);

    // Active Service Type Tab: 'prepaid', 'dth', 'postpaid'
    const [activeTab, setActiveTab] = useState('prepaid');

    // Form inputs
    const [mobile, setMobile] = useState('');
    const [selectedOperator, setSelectedOperator] = useState(null);
    const [amount, setAmount] = useState('');

    // UI States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [checkingStatusId, setCheckingStatusId] = useState(null);

    // Admin API Settings Modal
    const [showAdminSettings, setShowAdminSettings] = useState(false);
    const [adminKey, setAdminKey] = useState(apiKey || '');
    const [adminUrl, setAdminUrl] = useState(apiUrl || 'https://apinice.in/api/v1');
    const [vendorBalance, setVendorBalance] = useState(apiBalance);
    const [updatingAdmin, setUpdatingAdmin] = useState(false);
    const [checkingBalance, setCheckingBalance] = useState(false);

    // List of recharges
    const [rechargesList, setRechargesList] = useState(recentRecharges || []);

    // Quick recharge amounts
    const prepaidAmounts = [19, 29, 49, 149, 199, 239, 299, 399, 666, 719, 2999];
    const dthAmounts = [100, 150, 200, 250, 300, 400, 500, 750, 1000];
    const currentAmounts = activeTab === 'dth' ? dthAmounts : prepaidAmounts;

    // Current tab operators
    const currentOperators = operators[activeTab] || [];

    // Switch tab helper
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedOperator(null);
        setError(null);
        setSuccessMessage(null);
    };

    // Quick amount click
    const handleAmountClick = (val) => {
        setAmount(String(val));
        setError(null);
    };

    // Open confirmation dialog
    const handleOpenConfirm = (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const cleanMobile = mobile.trim();
        if (!cleanMobile) {
            setError(activeTab === 'dth' ? 'Please enter Customer / Subscriber ID.' : 'Please enter 10-digit mobile number.');
            return;
        }

        if (activeTab !== 'dth') {
            const digitsOnly = cleanMobile.replace(/\D/g, '');
            if (!/^[6-9][0-9]{9}$/.test(digitsOnly)) {
                setError('Mobile number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9.');
                return;
            }
        } else {
            if (cleanMobile.length < 8) {
                setError('DTH Subscriber ID must be at least 8 characters long.');
                return;
            }
        }

        if (!selectedOperator) {
            setError('Please select an operator.');
            return;
        }

        const numAmount = Number(amount);
        if (!numAmount || numAmount < 10 || numAmount > 10000) {
            setError('Recharge amount must be between ₹10 and ₹10,000.');
            return;
        }

        if (currentCoins < numAmount) {
            setError(`Insufficient coin balance! You need ${numAmount} coins, but your wallet only has ${currentCoins} coins.`);
            return;
        }

        setShowConfirmModal(true);
    };

    // Execute recharge via API
    const handleExecuteRecharge = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post('/utilities/mobile-recharge/do-recharge', {
                operator: selectedOperator.code,
                service_type: activeTab,
                mobile: mobile.trim(),
                amount: Number(amount),
            });

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                if (typeof response.data.user_coins === 'number') {
                    setCurrentCoins(response.data.user_coins);
                    if (auth?.user) auth.user.coins = response.data.user_coins;
                }

                // Add to recent list
                if (response.data.recharge) {
                    setRechargesList((prev) => [response.data.recharge, ...prev]);
                }

                // Set receipt
                setReceiptData({
                    txn_id: response.data.txn_id,
                    mobile: response.data.mobile,
                    operator: response.data.operator,
                    service_type: activeTab,
                    amount: response.data.amount,
                    status: response.data.status,
                    date: new Date().toLocaleString('en-IN'),
                });

                // Clear fields
                setMobile('');
                setAmount('');
            } else {
                setError(response.data.message || 'Recharge failed.');
                if (typeof response.data.user_coins === 'number') {
                    setCurrentCoins(response.data.user_coins);
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'An error occurred during recharge.';
            setError(msg);
            if (typeof err.response?.data?.user_coins === 'number') {
                setCurrentCoins(err.response.data.user_coins);
            }
        } finally {
            setLoading(false);
        }
    };

    // Check transaction status
    const handleCheckStatus = async (item) => {
        setCheckingStatusId(item.id);
        try {
            const response = await axios.post('/utilities/mobile-recharge/status', {
                recharge_id: item.id,
            });

            if (response.data.success) {
                setSuccessMessage(`Status updated: ${response.data.message}`);
            } else {
                setError(response.data.message || 'Status check failed.');
            }

            // Update in list
            if (response.data.recharge) {
                setRechargesList((prev) =>
                    prev.map((r) => (r.id === item.id ? { ...r, ...response.data.recharge } : r))
                );
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to check status.');
        } finally {
            setCheckingStatusId(null);
        }
    };

    // Refresh vendor balance (Admin only)
    const handleRefreshBalance = async () => {
        setCheckingBalance(true);
        try {
            const response = await axios.get('/utilities/mobile-recharge/balance');
            if (response.data.success && response.data.balance) {
                setVendorBalance(response.data.balance);
            }
        } catch (e) {
            console.error('Balance check failed', e);
        } finally {
            setCheckingBalance(false);
        }
    };

    // Save Admin API settings
    const handleSaveAdminSettings = async (e) => {
        e.preventDefault();
        setUpdatingAdmin(true);
        try {
            const response = await axios.post('/utilities/mobile-recharge/update-settings', {
                api_key: adminKey,
                api_url: adminUrl,
            });
            if (response.data.success) {
                setShowAdminSettings(false);
                setSuccessMessage(response.data.message);
                if (response.data.api_balance) {
                    setVendorBalance(response.data.api_balance);
                }
            }
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to update settings.');
        } finally {
            setUpdatingAdmin(false);
        }
    };

    // Print Receipt
    const handlePrintReceipt = () => {
        window.print();
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="text-2xl">📱</span> Mobile &amp; DTH Recharge
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Real-time prepaid/postpaid mobile recharge &amp; DTH top-up with instant confirmation
                        </p>
                    </div>

                    {/* Top action cards: Balance & Admin Tools */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* User Coin Balance */}
                        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/15 border border-amber-300 dark:border-amber-700/50 rounded-2xl px-3.5 py-1.5 shadow-xs">
                            <span className="text-base sm:text-lg">🪙</span>
                            <div className="text-left">
                                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                    Wallet Coins
                                </div>
                                <div className="text-sm sm:text-base font-black text-amber-900 dark:text-amber-200 leading-tight">
                                    {currentCoins} <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">(₹{currentCoins})</span>
                                </div>
                            </div>
                        </div>

                        {/* Admin API Balance & Settings */}
                        {isAdmin && (
                            <>
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-3 py-1.5 shadow-xs">
                                    <span className="text-base">⚡</span>
                                    <div className="text-left">
                                        <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                            API Balance
                                            <button
                                                onClick={handleRefreshBalance}
                                                disabled={checkingBalance}
                                                className="hover:rotate-180 transition-transform duration-300 text-slate-400 hover:text-blue-600"
                                                title="Refresh API balance"
                                            >
                                                <span className="material-symbols-outlined text-xs">sync</span>
                                            </button>
                                        </div>
                                        <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 leading-tight">
                                            ₹{vendorBalance?.balance || '0.00'}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Mobile & DTH Recharge" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 space-y-8">
                {/* Notification Alerts */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800/60 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-shake">
                        <span className="material-symbols-outlined text-red-600 text-xl flex-shrink-0 mt-0.5">
                            error
                        </span>
                        <div className="flex-1 text-sm text-red-800 dark:text-red-300 font-medium">
                            {error}
                        </div>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                            <span className="material-symbols-outlined text-base">close</span>
                        </button>
                    </div>
                )}

                {successMessage && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800/60 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                        <span className="material-symbols-outlined text-emerald-600 text-xl flex-shrink-0 mt-0.5">
                            check_circle
                        </span>
                        <div className="flex-1 text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                            {successMessage}
                        </div>
                        <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-600">
                            <span className="material-symbols-outlined text-base">close</span>
                        </button>
                    </div>
                )}

                {/* Primary Card: Recharge Studio */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                    {/* Service Tabs */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 p-2 sm:p-3 flex items-center gap-2 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => handleTabChange('prepaid')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                                activeTab === 'prepaid'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                        >
                            <span>📱</span>
                            <span>Mobile Prepaid</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTabChange('dth')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                                activeTab === 'dth'
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                        >
                            <span>📡</span>
                            <span>DTH Top-Up</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTabChange('postpaid')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                                activeTab === 'postpaid'
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                        >
                            <span>📄</span>
                            <span>Mobile Postpaid</span>
                        </button>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleOpenConfirm} className="p-5 sm:p-8 space-y-6">
                        {/* Section 1: Mobile / ID Input */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {activeTab === 'dth' ? 'Customer ID / Smart Card / Subscriber Number' : '10-Digit Mobile Number'}
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                                {activeTab !== 'dth' && (
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm font-bold">
                                        🇮🇳 +91
                                    </div>
                                )}
                                <input
                                    type="text"
                                    maxLength={activeTab === 'dth' ? 20 : 10}
                                    value={mobile}
                                    onChange={(e) => {
                                        const val = activeTab === 'dth' ? e.target.value : e.target.value.replace(/\D/g, '');
                                        setMobile(val);
                                        setError(null);
                                    }}
                                    placeholder={
                                        activeTab === 'dth'
                                            ? 'Enter DTH Customer ID / Viewing Card Number'
                                            : 'Enter 10-digit mobile (e.g. 9876543210)'
                                    }
                                    className={`w-full ${activeTab !== 'dth' ? 'pl-20' : 'pl-4'} pr-16 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs`}
                                />
                                {activeTab !== 'dth' && (
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-400">
                                        {mobile.length}/10
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Operator Picker */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Select Operator <span className="text-red-500">*</span>
                            </label>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {currentOperators.map((op) => {
                                    const isSelected = selectedOperator?.code === op.code;
                                    return (
                                        <button
                                            key={op.code}
                                            type="button"
                                            onClick={() => {
                                                setSelectedOperator(op);
                                                setError(null);
                                            }}
                                            className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-200 relative group flex flex-col justify-between ${
                                                isSelected
                                                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-md scale-[1.02]'
                                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-1 mb-2">
                                                <span
                                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-xs"
                                                    style={{ backgroundColor: op.theme || '#3b82f6' }}
                                                >
                                                    {op.code}
                                                </span>
                                                {isSelected && (
                                                    <span className="material-symbols-outlined text-blue-600 text-lg">
                                                        check_circle
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                                                    {op.name}
                                                </div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                                                    {op.fullName}
                                                </div>
                                                <div className="mt-1.5 inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                                                    {op.commission} Cashback
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Section 3: Recharge Amount & Quick Pills */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Recharge Amount (₹) <span className="text-red-500">*</span>
                                </label>
                                <span className="text-xs text-slate-400">Min: ₹10 | Max: ₹10,000</span>
                            </div>

                            <div className="relative mb-3">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-lg font-black">
                                    ₹
                                </div>
                                <input
                                    type="number"
                                    min="10"
                                    max="10000"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="Enter amount (e.g. 199, 239, 299...)"
                                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
                                />
                            </div>

                            {/* Quick Amount Chips */}
                            <div>
                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Popular Denominations:
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {currentAmounts.map((val) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => handleAmountClick(val)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                                                Number(amount) === val
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                                            }`}
                                        >
                                            ₹{val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Live Coin Deduction Summary Card */}
                        {amount && Number(amount) > 0 && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/70 dark:from-slate-800 dark:to-slate-800/60 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 sm:p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                                    <div className="space-y-1">
                                        <div className="text-slate-600 dark:text-slate-400">
                                            Recharge: <strong className="text-slate-900 dark:text-white">₹{amount}</strong> for{' '}
                                            <strong className="text-blue-600 dark:text-blue-400">
                                                {selectedOperator?.name || 'Selected Operator'} ({mobile || 'Pending ID'})
                                            </strong>
                                        </div>
                                        <div className="text-slate-500 text-[11px]">
                                            Wallet Rule: 1 Coin = ₹1 (Exact coin deduction, no extra service fee)
                                        </div>
                                    </div>

                                    <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-blue-200 dark:border-slate-700">
                                        <div className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                                            Coins to Deduct
                                        </div>
                                        <div className="text-lg font-black text-blue-700 dark:text-blue-300">
                                            {Number(amount)} Coins
                                        </div>
                                        {currentCoins < Number(amount) && (
                                            <div className="text-xs font-bold text-red-600 mt-0.5">
                                                ⚠️ Low Coins! Short by {Number(amount) - currentCoins} coins
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || (amount && currentCoins < Number(amount))}
                                className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 transition-all shadow-md ${
                                    amount && currentCoins < Number(amount)
                                        ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-600/30 hover:scale-[1.01]'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-xl">
                                            progress_activity
                                        </span>
                                        <span>Connecting with Operator Gateway...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>⚡</span>
                                        <span>
                                            Proceed Recharge (₹{amount || '0'})
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section: Recent Recharges History Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">history</span>
                                <span>Recent Recharge History</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Live status of your submitted mobile &amp; DTH recharge orders
                            </p>
                        </div>

                        {/* Admin Toggle */}
                        {isAdmin && (
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                <button
                                    onClick={() => router.visit('/utilities/mobile-recharge?view=my')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        currentView === 'my'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    My Recharges
                                </button>
                                <button
                                    onClick={() => router.visit('/utilities/mobile-recharge?view=all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        currentView === 'all'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    All Users
                                </button>
                            </div>
                        )}
                    </div>

                    {rechargesList.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                                        <th className="py-3 px-3">Date &amp; Time</th>
                                        {isAdmin && currentView === 'all' && <th className="py-3 px-3">User</th>}
                                        <th className="py-3 px-3">Mobile / ID</th>
                                        <th className="py-3 px-3">Operator</th>
                                        <th className="py-3 px-3">Amount</th>
                                        <th className="py-3 px-3">TXN ID</th>
                                        <th className="py-3 px-3">Status</th>
                                        <th className="py-3 px-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {rechargesList.map((item) => {
                                        const isSuccess = item.status === 'success';
                                        const isPending = item.status === 'processing' || item.status === 'pending';
                                        const isFailed = item.status === 'failed';

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                                                    {new Date(item.created_at).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                                {isAdmin && currentView === 'all' && (
                                                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                                                        {item.user?.name || item.user?.email || `User #${item.user_id}`}
                                                    </td>
                                                )}
                                                <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                    {item.mobile}
                                                </td>
                                                <td className="py-3.5 px-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                                                        <span>{item.operator_name || item.operator}</span>
                                                        <span className="text-[10px] uppercase text-slate-400">
                                                            ({item.service_type})
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3 font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                                                    ₹{Number(item.amount).toFixed(2)}
                                                </td>
                                                <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                                    {item.txn_id || '—'}
                                                </td>
                                                <td className="py-3.5 px-3 whitespace-nowrap">
                                                    {isSuccess && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                                            Success
                                                        </span>
                                                    )}
                                                    {isPending && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                                                            Processing
                                                        </span>
                                                    )}
                                                    {isFailed && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300" title={item.failure_reason}>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                                            Failed (Refunded)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-3 text-right whitespace-nowrap space-x-1.5">
                                                    {isPending && (
                                                        <button
                                                            onClick={() => handleCheckStatus(item)}
                                                            disabled={checkingStatusId === item.id}
                                                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition-all"
                                                        >
                                                            {checkingStatusId === item.id ? 'Checking...' : 'Check Status'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            setReceiptData({
                                                                txn_id: item.txn_id,
                                                                mobile: item.mobile,
                                                                operator: item.operator_name || item.operator,
                                                                service_type: item.service_type,
                                                                amount: item.amount,
                                                                status: item.provider_status || item.status,
                                                                date: new Date(item.created_at).toLocaleString('en-IN'),
                                                            })
                                                        }
                                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg transition-all"
                                                        title="Print Customer Receipt"
                                                    >
                                                        Receipt
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">
                                receipt_long
                            </span>
                            <div className="font-bold text-sm text-slate-600 dark:text-slate-400">
                                No recharges found yet
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                                Enter mobile or DTH details above to perform your first instant recharge.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal 1: Confirmation Prompt */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
                        <div className="text-center mb-5">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
                                <span className="material-symbols-outlined text-3xl">send_to_mobile</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                Confirm Recharge Details
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Please review before deducting wallet coins
                            </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 space-y-2.5 text-xs sm:text-sm mb-6 border border-slate-200/70 dark:border-slate-800">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Service Type:</span>
                                <span className="font-extrabold text-slate-900 dark:text-white uppercase">
                                    {activeTab}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Mobile / Account:</span>
                                <span className="font-mono font-black text-slate-900 dark:text-white">
                                    {mobile}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Operator:</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {selectedOperator?.name} ({selectedOperator?.code})
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                                <span className="text-slate-500">Recharge Amount:</span>
                                <span className="font-black text-base text-blue-600 dark:text-blue-400">
                                    ₹{amount}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Coins Deducted:</span>
                                <span className="font-black text-amber-600">
                                    {Number(amount)} Coins
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteRecharge}
                                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-600/30 transition-all"
                            >
                                Confirm &amp; Pay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 2: Customer Printable Receipt */}
            {receiptData && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
                        {/* Printable Receipt Body */}
                        <div id="recharge-receipt-print" className="bg-white text-slate-900 p-4 border border-slate-200 rounded-2xl mb-5">
                            <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
                                <div className="text-base font-black uppercase tracking-wider">
                                    CSP JAANKARI RECHARGE RECEIPT
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                    Customer Transaction Copy
                                </div>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Receipt Date:</span>
                                    <span className="font-medium">{receiptData.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Transaction ID:</span>
                                    <span className="font-mono font-bold">{receiptData.txn_id || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Customer Number:</span>
                                    <span className="font-mono font-bold">{receiptData.mobile}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Operator:</span>
                                    <span className="font-bold">{receiptData.operator}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Service Category:</span>
                                    <span className="uppercase font-semibold">{receiptData.service_type}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black">
                                    <span>Amount Paid:</span>
                                    <span>₹{Number(receiptData.amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Order Status:</span>
                                    <span className="font-black text-emerald-600 uppercase">
                                        {receiptData.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-400">
                                Thank you for recharging with us. Save this receipt for future reference.
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setReceiptData(null)}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={handlePrintReceipt}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">print</span>
                                <span>Print Receipt</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 3: Admin API Configuration */}
            {showAdminSettings && isAdmin && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-scale-up">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">settings</span>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                    Recharge API Gateway Configuration
                                </h3>
                            </div>
                            <button onClick={() => setShowAdminSettings(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveAdminSettings} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    API Base URL
                                </label>
                                <input
                                    type="text"
                                    value={adminUrl}
                                    onChange={(e) => setAdminUrl(e.target.value)}
                                    placeholder="https://apinice.in/api/v1"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    API Key (Header: X-API-Key)
                                </label>
                                <input
                                    type="text"
                                    value={adminKey}
                                    onChange={(e) => setAdminKey(e.target.value)}
                                    placeholder="Y3VK89K8V8"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                <div className="font-bold text-slate-800 dark:text-slate-200">
                                    Current Vendor Status:
                                </div>
                                <div>Balance: <strong>₹{vendorBalance?.balance || '0.00'}</strong></div>
                                <div>Merchant Username: <strong>{vendorBalance?.username || 'N/A'}</strong></div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminSettings(false)}
                                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatingAdmin}
                                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30"
                                >
                                    {updatingAdmin ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
