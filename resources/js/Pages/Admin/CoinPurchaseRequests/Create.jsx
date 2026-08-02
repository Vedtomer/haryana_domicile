import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

const STATUS_CONFIG = {
    pending:  { label: 'Pending',  classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
    approved: { label: 'Approved', classes: 'bg-green-50 text-green-700 border border-green-200' },
    rejected: { label: 'Rejected', classes: 'bg-red-50 text-red-700 border border-red-200' },
};

function PackageCard({ pkg, selected, onSelect }) {
    return (
        <button
            type="button"
            onClick={() => onSelect(pkg)}
            className={`relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                selected
                    ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
            }`}
        >
            {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    Most Popular
                </span>
            )}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{pkg.label}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-slate-900">{pkg.coins}</span>
                        <span className="text-sm font-semibold text-slate-500">Coins</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-black text-blue-600">₹{pkg.amount}</p>
                    <p className="text-xs text-slate-400">₹{(pkg.amount / pkg.coins).toFixed(1)}/coin</p>
                </div>
            </div>
            {selected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
            )}
        </button>
    );
}

export default function Create({ packages, myRequests, userCoins }) {
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [preview, setPreview] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        package_amount: '',
        coins_requested: '',
        utr_number: '',
        payment_screenshot: null,
    });

    const handlePackageSelect = (pkg) => {
        setSelectedPackage(pkg);
        setData(d => ({ ...d, package_amount: pkg.amount, coins_requested: pkg.coins }));
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

    return (
        <AdminLayout>
            <Head title="Buy Coins" />

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Buy Coins</h2>
                        <p className="mt-1 text-sm text-slate-500">Select a package, upload your payment proof, and submit.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-sm font-bold text-amber-700">Balance: <span className="text-xl">{userCoins}</span> Coins</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Packages */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Choose a Package</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {packages.map((pkg, i) => (
                                    <PackageCard
                                        key={i}
                                        pkg={pkg}
                                        selected={selectedPackage?.coins === pkg.coins}
                                        onSelect={handlePackageSelect}
                                    />
                                ))}
                            </div>
                            {errors.package_amount && <p className="text-sm text-red-500">{errors.package_amount}</p>}
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-4">
                            {/* UPI QR Info */}
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-5 text-white text-center shadow-lg">
                                <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">Pay via UPI</p>
                                <p className="text-lg font-black">cspjaankari@upi</p>
                                <div className="mt-3 bg-white/20 rounded-xl px-4 py-2">
                                    <p className="text-xs opacity-80">Selected Amount</p>
                                    <p className="text-2xl font-black">
                                        {selectedPackage ? `₹${selectedPackage.amount}` : '—'}
                                    </p>
                                </div>
                            </div>

                            {/* UTR Number */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                                    UTR / Transaction ID
                                    <span className="ml-1 text-slate-400 normal-case font-normal">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.utr_number}
                                    onChange={e => setData('utr_number', e.target.value)}
                                    placeholder="e.g. 423456789012"
                                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Screenshot Upload */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                                    Payment Screenshot <span className="text-red-500">*</span>
                                </label>
                                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors overflow-hidden ${
                                    preview ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50'
                                }`}>
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full max-h-48 object-contain p-2" />
                                    ) : (
                                        <div className="py-8 text-center">
                                            <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <p className="text-xs text-slate-500">Click to upload screenshot</p>
                                            <p className="text-xs text-slate-400 mt-1">JPG, PNG, PDF up to 4MB</p>
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
                                disabled={processing || !selectedPackage}
                                className="w-full py-3 px-6 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {processing ? 'Submitting...' : `Submit Request — ₹${selectedPackage?.amount ?? '—'}`}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Recent Requests */}
                {myRequests.length > 0 && (
                    <div className="mt-10">
                        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">Recent Requests</h3>
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Coins</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Amount</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {myRequests.map(req => {
                                        const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                                        return (
                                            <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-5 py-3">
                                                    <span className="font-bold text-amber-600 text-sm">{req.coins_requested} coins</span>
                                                </td>
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
