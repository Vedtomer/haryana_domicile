import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Edit({ settings }) {
    const { data, setData, put, processing, errors } = useForm({
        upi_id:                  settings.upi_id                  || '',
        upi_name:                settings.upi_name                || '',
        whatsapp_number:         settings.whatsapp_number         || '',
        phonepe_enabled:         !!settings.phonepe_enabled,
        phonepe_mode:            settings.phonepe_mode            || 'sandbox',
        phonepe_version:         settings.phonepe_version         || 'v2',
        phonepe_client_id:       settings.phonepe_client_id       || '',
        phonepe_client_secret:   settings.phonepe_client_secret   || '',
        phonepe_client_version:  settings.phonepe_client_version  || '1',
        phonepe_merchant_id:     settings.phonepe_merchant_id     || '',
        phonepe_salt_key:        settings.phonepe_salt_key        || '',
        phonepe_salt_index:      settings.phonepe_salt_index      || '1',
    });

    const [copiedWebhook, setCopiedWebhook] = useState(false);

    // Live QR preview
    const upiString = `upi://pay?pa=${encodeURIComponent(data.upi_id)}&pn=${encodeURIComponent(data.upi_name)}&cu=INR`;
    const qrUrl     = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/admin/payment-settings');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedWebhook(true);
        setTimeout(() => setCopiedWebhook(false), 2000);
    };

    return (
        <AdminLayout>
            <Head title="Payment & Auto Coin Settings" />

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Payment & Auto Coin Settings</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Configure Manual UPI QR code as well as <strong>PhonePe Automatic Payment Gateway</strong> for instant coin addition.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* SECTION 1: PhonePe Auto Payment Gateway */}
                    <div className="bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-purple-500/20">
                                    पे
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        PhonePe Auto Payment Gateway
                                        {data.phonepe_enabled ? (
                                            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                Active & Auto Coin Enabled
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                                Disabled (Manual QR Only)
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        100% Free UPI Gateway. Users pay via PhonePe/GPay/Paytm and coins get added automatically in 1 second!
                                    </p>
                                </div>
                            </div>

                            {/* Enable Toggle Switch */}
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={data.phonepe_enabled}
                                    onChange={e => setData('phonepe_enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                <span className="ml-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {data.phonepe_enabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </label>
                        </div>

                        {/* Gateway Settings Body */}
                        <div className="mt-6 space-y-5">
                            {/* Environment & Version selectors */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                                        Gateway Environment Mode
                                    </label>
                                    <select
                                        value={data.phonepe_mode}
                                        onChange={e => setData('phonepe_mode', e.target.value)}
                                        className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3.5 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="sandbox">Sandbox (Testing / UAT Mode)</option>
                                        <option value="production">Production (Real / Live Money)</option>
                                    </select>
                                    <p className="text-[11px] text-slate-400 mt-1">Live money lene ke liye "Production" chunein.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                                        API Version / Auth Type
                                    </label>
                                    <select
                                        value={data.phonepe_version}
                                        onChange={e => setData('phonepe_version', e.target.value)}
                                        className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3.5 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="v2">Standard Checkout v2 (Client ID & Client Secret) - Recommended</option>
                                        <option value="v1">Standard Pay v1 (Merchant ID & Salt Key)</option>
                                    </select>
                                    <p className="text-[11px] text-slate-400 mt-1">developer.phonepe.com ke standard credentials ke liye v2 chunein.</p>
                                </div>
                            </div>

                            {/* v2 Credentials */}
                            {data.phonepe_version === 'v2' ? (
                                <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 rounded-xl space-y-4">
                                    <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold text-xs uppercase tracking-wide">
                                        <span>🔑 PhonePe v2 Credentials (from developer.phonepe.com)</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                            Client ID
                                        </label>
                                        <input
                                            type="text"
                                            value={data.phonepe_client_id}
                                            onChange={e => setData('phonepe_client_id', e.target.value)}
                                            placeholder="e.g. M230616048... or CLIENT_ID"
                                            className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3.5 py-2 text-sm focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                Client Secret
                                            </label>
                                            <input
                                                type="password"
                                                value={data.phonepe_client_secret}
                                                onChange={e => setData('phonepe_client_secret', e.target.value)}
                                                placeholder="Enter Client Secret"
                                                className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3.5 py-2 text-sm focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                Client Version
                                            </label>
                                            <input
                                                type="text"
                                                value={data.phonepe_client_version}
                                                onChange={e => setData('phonepe_client_version', e.target.value)}
                                                placeholder="1"
                                                className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3.5 py-2 text-sm focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* v1 Credentials */
                                <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 rounded-xl space-y-4">
                                    <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold text-xs uppercase tracking-wide">
                                        <span>🔑 PhonePe v1 Credentials (Merchant ID & Salt Key)</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                            Merchant ID
                                        </label>
                                        <input
                                            type="text"
                                            value={data.phonepe_merchant_id}
                                            onChange={e => setData('phonepe_merchant_id', e.target.value)}
                                            placeholder="e.g. PGTESTPAYUAT or LIVE_MID"
                                            className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3.5 py-2 text-sm focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                Salt Key
                                            </label>
                                            <input
                                                type="password"
                                                value={data.phonepe_salt_key}
                                                onChange={e => setData('phonepe_salt_key', e.target.value)}
                                                placeholder="Enter Salt Key"
                                                className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3.5 py-2 text-sm focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                Salt Index
                                            </label>
                                            <input
                                                type="text"
                                                value={data.phonepe_salt_index}
                                                onChange={e => setData('phonepe_salt_index', e.target.value)}
                                                placeholder="1"
                                                className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3.5 py-2 text-sm focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Webhook & Callback details */}
                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                                        Webhook URL (PhonePe Dashboard me configure karne ke liye):
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400 font-mono text-[11px]">
                                            {settings.webhook_url}
                                        </code>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(settings.webhook_url)}
                                            className="px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded font-bold transition-colors cursor-pointer"
                                        >
                                            {copiedWebhook ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Manual UPI QR Settings (Existing Fallback) */}
                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                            Manual UPI QR & Support Settings
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                            Agar Auto Payment disable rahega ya user QR scan karke manually pay karna chahe, toh ye UPI ID aur QR dikhega.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                        UPI ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.upi_id}
                                        onChange={e => setData('upi_id', e.target.value)}
                                        placeholder="e.g. yourname@upi"
                                        className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                    />
                                    {errors.upi_id && <p className="text-xs text-red-500 mt-1">{errors.upi_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                        Account Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.upi_name}
                                        onChange={e => setData('upi_name', e.target.value)}
                                        placeholder="e.g. CSP Jaankari"
                                        className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                    />
                                    {errors.upi_name && <p className="text-xs text-red-500 mt-1">{errors.upi_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                        WhatsApp Support Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.whatsapp_number}
                                        onChange={e => setData('whatsapp_number', e.target.value)}
                                        placeholder="e.g. 919876543210"
                                        className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">Country code included without '+' or spaces (e.g. 919876543210)</p>
                                    {errors.whatsapp_number && <p className="text-xs text-red-500 mt-1">{errors.whatsapp_number}</p>}
                                </div>
                            </div>

                            {/* Live QR Preview */}
                            <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-center shadow-xs flex flex-col items-center justify-center gap-3">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manual QR Preview</p>
                                {data.upi_id ? (
                                    <>
                                        <img
                                            src={qrUrl}
                                            alt="QR Preview"
                                            className="w-36 h-36 rounded-xl border border-slate-200 object-contain bg-white p-2 shadow-xs"
                                            key={qrUrl}
                                        />
                                        <div>
                                            <p className="text-xs text-slate-400">UPI ID</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-white">{data.upi_id}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{data.upi_name}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-slate-400 text-sm">Enter UPI ID to see preview</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto min-w-[200px] py-3.5 px-8 text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {processing ? 'Saving Settings...' : 'Save All Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
