import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Edit({ settings }) {
    const { data, setData, put, processing, errors } = useForm({
        upi_id:   settings.upi_id   || '',
        upi_name: settings.upi_name || '',
    });

    // Live QR preview
    const upiString = `upi://pay?pa=${encodeURIComponent(data.upi_id)}&pn=${encodeURIComponent(data.upi_name)}&cu=INR`;
    const qrUrl     = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/admin/payment-settings');
    };

    return (
        <AdminLayout>
            <Head title="QR & Payment Settings" />

            <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">QR & Payment Settings</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Configure the UPI ID that users will scan to buy coins. Changes reflect immediately on the Buy Coins page.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                                UPI ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.upi_id}
                                onChange={e => setData('upi_id', e.target.value)}
                                placeholder="e.g. yourname@upi"
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                            />
                            {errors.upi_id && <p className="text-xs text-red-500 mt-1">{errors.upi_id}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                                Account Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.upi_name}
                                onChange={e => setData('upi_name', e.target.value)}
                                placeholder="e.g. CSP Jaankari"
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                            />
                            {errors.upi_name && <p className="text-xs text-red-500 mt-1">{errors.upi_name}</p>}
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
                            <strong>Note:</strong> The QR code is generated dynamically from your UPI ID. Users will see the updated QR immediately after saving.
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 px-6 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </form>

                    {/* Live QR Preview */}
                    <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 text-center shadow-sm flex flex-col items-center justify-center gap-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Preview</p>
                        {data.upi_id ? (
                            <>
                                <img
                                    src={qrUrl}
                                    alt="QR Preview"
                                    className="w-44 h-44 rounded-xl border border-slate-200 object-contain"
                                    key={qrUrl}
                                />
                                <div>
                                    <p className="text-xs text-slate-400">UPI ID</p>
                                    <p className="text-sm font-black text-slate-800">{data.upi_id}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{data.upi_name}</p>
                                </div>
                            </>
                        ) : (
                            <div className="text-slate-400 text-sm">Enter UPI ID to see preview</div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
