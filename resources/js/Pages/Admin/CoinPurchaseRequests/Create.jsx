import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

const STATUS_CONFIG = {
    pending:  { label: 'Pending',  classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
    approved: { label: 'Approved', classes: 'bg-green-50 text-green-700 border border-green-200' },
    rejected: { label: 'Rejected', classes: 'bg-red-50 text-red-700 border border-red-200' },
};

// UPI constants removed — values come from backend settings

function PackageCard({ pkg, selected, onSelect }) {
    const hasBonus = pkg.bonus_coins > 0;
    return (
        <button
            type="button"
            onClick={() => onSelect(pkg)}
            className={`relative w-full text-left rounded-xl border-2 p-3.5 transition-all duration-200 ${
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

export default function Create({ packages, myRequests, userCoins, upiId, upiName }) {
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [preview, setPreview] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        package_amount: '',
        coins_requested: '',
        utr_number: '',
        payment_screenshot: null,
    });

    const handlePackageSelect = (pkg) => {
        setSelectedPackage(pkg);
        setData(d => ({ ...d, package_amount: pkg.amount, coins_requested: pkg.coins_requested }));
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('payment_screenshot', file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/coin-requests', { forceFormData: true });
    };

    // Dynamic QR built from admin-configured UPI settings
    const QR_IMAGE = selectedPackage
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${selectedPackage.amount}&cu=INR&tn=CoinPurchase`)}`
        : null;

    return (
        <AdminLayout>
            <Head title="Buy Coins" />

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-6 flex flex-wrap items-baseline gap-3">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Buy Coins</h2>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {userCoins} coins
                    </span>
                    <p className="text-sm text-slate-400">1 coin = ₹1 &nbsp;·&nbsp; Bigger packs give bonus coins free!</p>
                </div>

                <form onSubmit={handleSubmit}>

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
                            </div>
                            {errors.package_amount && <p className="text-sm text-red-500 mt-2">{errors.package_amount}</p>}
                        </div>
                    )}

                    {/* STEP 2: Order + Payment */}
                    {selectedPackage && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Left — QR + Order Summary */}
                            <div className="space-y-4">

                                {/* Selected package chip + change */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-700">{selectedPackage.label} Pack</span>
                                        <span className="text-sm text-blue-600 font-black">₹{selectedPackage.amount}</span>
                                        <span className="text-xs text-green-600 font-bold">{selectedPackage.coins_requested} coins</span>
                                    </div>
                                    <button type="button" onClick={() => setSelectedPackage(null)} className="text-xs text-blue-500 hover:text-blue-700 font-semibold underline">
                                        ← Change
                                    </button>
                                </div>

                                {/* QR Code */}
                                <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 text-center shadow-sm">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Scan to Pay</p>
                                    <img
                                        src={QR_IMAGE}
                                        alt="UPI QR Code"
                                        className="w-44 h-44 mx-auto rounded-xl border border-slate-200 object-contain"
                                    />
                                    <div className="mt-3 space-y-0.5">
                                        <p className="text-xs text-slate-400">UPI ID</p>
                                        <p className="text-sm font-black text-slate-800 tracking-wide">{upiId}</p>
                                        <div className="mt-2 bg-blue-50 rounded-xl px-4 py-2">
                                            <p className="text-xs text-blue-500">Amount to Pay</p>
                                            <p className="text-2xl font-black text-blue-700">₹{selectedPackage.amount}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right — Upload + Submit */}
                            <div className="space-y-4">
                                <p className="text-sm font-semibold text-slate-700">After payment, upload your screenshot below:</p>

                                {/* Screenshot upload */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                                        Payment Screenshot <span className="text-red-500">*</span>
                                    </label>
                                    <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors overflow-hidden ${
                                        preview ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50'
                                    }`}>
                                        {preview ? (
                                            <img src={preview} alt="Preview" className="w-full max-h-52 object-contain p-2" />
                                        ) : (
                                            <div className="py-10 text-center">
                                                <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                <p className="text-xs text-slate-500">Click to upload screenshot</p>
                                                <p className="text-xs text-slate-400 mt-1">JPG, PNG, PDF · max 4MB</p>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
                                    </label>
                                    {errors.payment_screenshot && <p className="text-xs text-red-500 mt-1">{errors.payment_screenshot}</p>}
                                    {preview && (
                                        <button type="button" onClick={() => { setPreview(null); setData('payment_screenshot', null); }} className="mt-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
                                            ✕ Remove
                                        </button>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 px-6 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {processing ? 'Submitting...' : `Submit — Get ${selectedPackage.coins_requested} Coins for ₹${selectedPackage.amount}`}
                                </button>

                                <p className="text-xs text-slate-400 text-center">
                                    Your request will be reviewed and coins will be added within a few hours.
                                </p>
                            </div>
                        </div>
                    )}
                </form>

                {/* Recent Requests */}
                {myRequests.length > 0 && (
                    <div className="mt-10">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Recent Requests</h3>
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Coins</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Paid</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {myRequests.map(req => {
                                        const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                                        return (
                                            <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-5 py-3"><span className="font-bold text-amber-600 text-sm">{req.coins_requested} coins</span></td>
                                                <td className="px-5 py-3 text-sm font-semibold text-slate-700">₹{req.package_amount}</td>
                                                <td className="px-5 py-3 text-xs text-slate-400">
                                                    {new Date(req.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-5 py-3">
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
            </div>
        </AdminLayout>
    );
}
