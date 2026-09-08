import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
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

export default function Create({ packages, myRequests, userCoins, upiId, upiName, whatsappNumber }) {
    const { auth, flash, whatsappNumber: sharedWhatsapp } = usePage().props;
    const targetWhatsapp = (whatsappNumber || sharedWhatsapp || '380630323112').replace(/[^0-9]/g, '');

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isCustom, setIsCustom] = useState(false);
    const [customAmount, setCustomAmount] = useState('');
    const [preview, setPreview] = useState(null);
    const [successData, setSuccessData] = useState(null);

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
            setPreview(null);
            reset();
        }
    }, [flash?.submitted_request]);

    const handlePackageSelect = (pkg) => {
        setIsCustom(false);
        setSelectedPackage(pkg);
        setData(d => ({ ...d, package_amount: pkg.amount, coins_requested: pkg.coins_requested }));
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        const amt = parseInt(customAmount);
        if (amt > 0) {
            const pkg = { amount: amt, coins_requested: amt, label: 'Custom', base_coins: amt, bonus_coins: 0, bonus_pct: 0 };
            setSelectedPackage(pkg);
            setData(d => ({ ...d, package_amount: amt, coins_requested: amt }));
        }
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('payment_screenshot', file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e) => {
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
        if (reqData.id) msg += `🆔 *Request ID:* #${reqData.id}\n`;
        if (reqData.payment_screenshot) {
            msg += `🔗 *Receipt:* ${reqData.payment_screenshot}\n`;
        }
        msg += `------------------------------------\n`;
        msg += `I have made the payment. Please verify and credit coins. Payment screenshot attached.`;

        return `https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(msg)}`;
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
                                
                                {/* Custom Amount Card */}
                                <button
                                    type="button"
                                    onClick={() => { setIsCustom(true); setSelectedPackage(null); }}
                                    className={`relative w-full text-left rounded-xl border-2 p-3.5 transition-all duration-200 ${
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
                                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 max-w-sm">
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Enter Amount (₹)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                                            placeholder="E.g. 50"
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleCustomSubmit}
                                            disabled={!customAmount || parseInt(customAmount) < 1}
                                            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
                                        <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
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
                                                <td className="px-5 py-3 text-right">
                                                    {req.status === 'pending' ? (
                                                        <a
                                                            href={getWhatsAppUrl({
                                                                id: req.id,
                                                                package_amount: req.package_amount,
                                                                coins_requested: req.coins_requested,
                                                                payment_screenshot: req.payment_screenshot ? `/storage/${req.payment_screenshot}` : null,
                                                            })}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Send Screenshot on WhatsApp"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-lg shadow-sm transition-all hover:scale-105"
                                                        >
                                                            <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 fill-white flex-shrink-0">
                                                                <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.34.653 4.527 1.787 6.393L4 29l7.79-1.75A11.94 11.94 0 0016.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm0 21.9c-1.98 0-3.833-.55-5.417-1.505l-.389-.23-4.62 1.038 1.06-4.502-.253-.402A9.86 9.86 0 016.1 15c0-5.467 4.443-9.9 9.904-9.9 5.462 0 9.904 4.433 9.904 9.9s-4.442 9.9-9.904 9.9zm5.44-7.41c-.298-.15-1.763-.87-2.037-.97-.273-.1-.472-.15-.67.15-.198.298-.767.97-.94 1.17-.174.198-.348.223-.646.075-.298-.15-1.258-.464-2.396-1.48-.886-.79-1.484-1.767-1.658-2.065-.174-.298-.019-.46.131-.61.135-.134.298-.348.447-.522.15-.174.199-.298.298-.497.1-.198.05-.372-.025-.522-.075-.15-.67-1.615-.917-2.212-.242-.582-.487-.503-.67-.512l-.57-.01c-.198 0-.522.075-.795.373-.273.298-1.04 1.017-1.04 2.48 0 1.464 1.065 2.878 1.213 3.076.15.199 2.096 3.2 5.078 4.488.71.306 1.263.489 1.694.626.712.227 1.36.195 1.873.118.571-.085 1.763-.72 2.012-1.416.248-.696.248-1.293.174-1.417-.075-.124-.273-.198-.571-.348z"/>
                                                            </svg>
                                                            <span>WhatsApp</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 font-medium">—</span>
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
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center border border-slate-100 relative overflow-hidden">
                            {/* Top decorative gradient bar */}
                            <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500"></div>

                            {/* Close button */}
                            <button
                                type="button"
                                onClick={() => setSuccessData(null)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            {/* Success Icon */}
                            <div className="w-20 h-20 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100 text-emerald-500 shadow-sm">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            {/* Badge & Title */}
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full mb-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Payment Request Submitted
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Payment Successful!</h3>
                            <p className="text-xs text-slate-500 mb-5">
                                आपकी कॉइन रिक्वेस्ट सफलतापूर्वक दर्ज कर ली गई है।
                            </p>

                            {/* Receipt Summary Card */}
                            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-5 text-left space-y-2.5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Amount Paid:</span>
                                    <span className="text-slate-900 font-black text-base">₹{successData.package_amount}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Coins to Credit:</span>
                                    <span className="text-emerald-600 font-black text-base">🪙 {successData.coins_requested} Coins</span>
                                </div>
                                {successData.id && (
                                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                                        <span className="text-slate-400 font-medium">Request Reference:</span>
                                        <span className="font-mono font-bold text-slate-700">#{successData.id}</span>
                                    </div>
                                )}
                            </div>

                            {/* WhatsApp Call to Action */}
                            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4 mb-4 text-center">
                                <p className="text-xs font-bold text-emerald-900 mb-2.5 flex items-center justify-center gap-1">
                                    <span>⚡</span> तुरंत अप्रूवल के लिए स्क्रीनशॉट व्हाट्सएप पर भेजें:
                                </p>
                                <a
                                    href={getWhatsAppUrl(successData)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white flex-shrink-0">
                                        <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.34.653 4.527 1.787 6.393L4 29l7.79-1.75A11.94 11.94 0 0016.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm0 21.9c-1.98 0-3.833-.55-5.417-1.505l-.389-.23-4.62 1.038 1.06-4.502-.253-.402A9.86 9.86 0 016.1 15c0-5.467 4.443-9.9 9.904-9.9 5.462 0 9.904 4.433 9.904 9.9s-4.442 9.9-9.904 9.9zm5.44-7.41c-.298-.15-1.763-.87-2.037-.97-.273-.1-.472-.15-.67.15-.198.298-.767.97-.94 1.17-.174.198-.348.223-.646.075-.298-.15-1.258-.464-2.396-1.48-.886-.79-1.484-1.767-1.658-2.065-.174-.298-.019-.46.131-.61.135-.134.298-.348.447-.522.15-.174.199-.298.298-.497.1-.198.05-.372-.025-.522-.075-.15-.67-1.615-.917-2.212-.242-.582-.487-.503-.67-.512l-.57-.01c-.198 0-.522.075-.795.373-.273.298-1.04 1.017-1.04 2.48 0 1.464 1.065 2.878 1.213 3.076.15.199 2.096 3.2 5.078 4.488.71.306 1.263.489 1.694.626.712.227 1.36.195 1.873.118.571-.085 1.763-.72 2.012-1.416.248-.696.248-1.293.174-1.417-.075-.124-.273-.198-.571-.348z"/>
                                    </svg>
                                    <span>Send Screenshot on WhatsApp</span>
                                </a>
                            </div>

                            {/* Dismiss Button */}
                            <button
                                type="button"
                                onClick={() => setSuccessData(null)}
                                className="w-full py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                Done / Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
