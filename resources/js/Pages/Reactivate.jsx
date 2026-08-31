import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Reactivate({ user, hasPending, amount, upiId, upiName }) {
    const { flash } = usePage().props;
    const [step, setStep] = useState(hasPending ? 'pending' : 'info'); // info → payment → pending

    const { data, setData, post, processing, errors } = useForm({
        user_id: user.id,
        utr_number: '',
        payment_screenshot: null,
    });

    function submit(e) {
        e.preventDefault();
        post('/reactivate', {
            forceFormData: true,
            onSuccess: () => setStep('pending'),
        });
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
            <Head title="Account Reactivation" />

            <div className="w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 text-white text-3xl mb-4 shadow-lg shadow-orange-200">
                        🔓
                    </div>
                    <h1 className="text-2xl font-black text-gray-800">Account Reactivation</h1>
                    <p className="text-gray-500 text-sm mt-1">CSP Jaankari Portal</p>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                        ✅ {flash.success}
                    </div>
                )}
                {flash?.info && (
                    <div className="mb-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium">
                        ℹ️ {flash.info}
                    </div>
                )}

                {/* Already Pending State */}
                {step === 'pending' && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center">
                        <div className="text-5xl mb-4">⏳</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Request Pending</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Aapka reactivation request submit ho gaya hai.<br />
                            <strong>Admin approval ke baad</strong> aapki ID activate ho jayegi.<br />
                            Thodi der mein dubara login karein.
                        </p>
                        <a href="/login"
                            className="mt-6 inline-block px-6 py-2.5 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition">
                            Login Page Par Jaayein
                        </a>
                    </div>
                )}

                {/* Info Step */}
                {step === 'info' && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <h2 className="font-black text-lg">ID Deactivate Ho Gayi</h2>
                                    <p className="text-orange-100 text-sm">7 din tak koi activity nahi mili</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* User Info */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <p className="text-xs text-gray-500 font-medium mb-1">Account</p>
                                <p className="font-semibold text-gray-800">
                                    {user.name || user.phone || user.email}
                                </p>
                                {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                            </div>

                            {/* Fee Info */}
                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Reactivation Fee</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Ek baar ki payment</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-orange-600">₹{amount}</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 text-center">
                                ₹{amount} pay karein aur payment proof submit karein.<br />
                                Admin approve karte hi aapki ID activate ho jayegi.
                            </p>

                            <button
                                onClick={() => setStep('payment')}
                                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-base hover:from-orange-600 hover:to-red-600 transition shadow-lg shadow-orange-200">
                                ₹{amount} Pay Karein & Activate Karein →
                            </button>

                            <a href="/login" className="block text-center text-sm text-gray-400 hover:text-gray-600 transition">
                                ← Login page par jaayein
                            </a>
                        </div>
                    </div>
                )}

                {/* Payment Step */}
                {step === 'payment' && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-5 text-white">
                            <h2 className="font-black text-lg">Payment Details</h2>
                            <p className="text-green-100 text-sm">₹{amount} UPI se pay karein</p>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* UPI Details */}
                            <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                                <p className="text-xs text-gray-500 font-medium mb-1">UPI ID</p>
                                <p className="text-lg font-black text-green-700 tracking-wide">{upiId}</p>
                                <p className="text-sm text-gray-500 mt-1">{upiName}</p>
                                <div className="mt-3 inline-block bg-green-700 text-white text-lg font-black px-6 py-2 rounded-xl">
                                    ₹{amount}
                                </div>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        UTR / Transaction Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.utr_number}
                                        onChange={e => setData('utr_number', e.target.value)}
                                        placeholder="e.g. 421234567890"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                                    />
                                    {errors.utr_number && <p className="text-red-500 text-xs mt-1">{errors.utr_number}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Payment Screenshot <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={e => setData('payment_screenshot', e.target.files[0])}
                                        className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-700 file:font-semibold hover:file:bg-orange-100"
                                    />
                                    {errors.payment_screenshot && <p className="text-red-500 text-xs mt-1">{errors.payment_screenshot}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-base hover:from-orange-600 hover:to-red-600 transition disabled:opacity-60 shadow-lg shadow-orange-200">
                                    {processing ? 'Submit Ho Raha Hai...' : '✅ Request Submit Karein'}
                                </button>
                            </form>

                            <button onClick={() => setStep('info')} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition">
                                ← Wapas
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
