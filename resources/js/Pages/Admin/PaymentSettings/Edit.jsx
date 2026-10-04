import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import axios from 'axios';

export default function Edit({ settings }) {
    const { data, setData, put, processing, errors } = useForm({
        upi_id:                 settings.upi_id                 || '',
        upi_name:               settings.upi_name               || '',
        whatsapp_number:        settings.whatsapp_number        || '',
        manual_payment_enabled: settings.manual_payment_enabled === '1' || settings.manual_payment_enabled === true || settings.manual_payment_enabled === 1,
        paycorex_enabled:       settings.paycorex_enabled === '1' || settings.paycorex_enabled === true || settings.paycorex_enabled === 1,
        paycorex_username:      settings.paycorex_username      || '7494945476',
        paycorex_api_key:       settings.paycorex_api_key       || '2d7bcd6c2467d343d9f1110ebd59da51',
        paycorex_base_url:      settings.paycorex_base_url      || 'https://paycorex.in/api/v1',
    });

    const [testLoading, setTestLoading] = useState(false);
    const [testResult, setTestResult] = useState(null);

    // Live QR preview for manual fallback
    const upiString = `upi://pay?pa=${encodeURIComponent(data.upi_id)}&pn=${encodeURIComponent(data.upi_name)}&cu=INR`;
    const qrUrl     = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/admin/payment-settings');
    };

    const handleTestPaycorex = async () => {
        setTestLoading(true);
        setTestResult(null);
        try {
            const res = await axios.post('/admin/payment-settings/test-paycorex', {
                username: data.paycorex_username,
                api_key:  data.paycorex_api_key,
                base_url: data.paycorex_base_url,
            });
            setTestResult(res.data);
        } catch (err) {
            setTestResult({
                success: false,
                message: err.response?.data?.message || err.message,
            });
        } finally {
            setTestLoading(false);
        }
    };

    return (
        <AdminLayout>
            <Head title="Payment & Gateway Settings" />

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Header */}
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Payment & Gateway Settings</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Configure PayCoreX online UPI gateway credentials and fallback manual UPI QR details.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Section 1: PayCoreX Payment Gateway */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md">
                                    ⚡
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">PayCoreX Payment Gateway (Auto UPI & QR)</h3>
                                    <p className="text-xs text-slate-500">Real-time payment link, dynamic UPI QR and automatic status verification</p>
                                </div>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.paycorex_enabled}
                                    onChange={e => setData('paycorex_enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {data.paycorex_enabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    PayCoreX Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.paycorex_username}
                                    onChange={e => setData('paycorex_username', e.target.value)}
                                    placeholder="e.g. 7494945476"
                                    className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                />
                                {errors.paycorex_username && <p className="text-xs text-red-500 mt-1">{errors.paycorex_username}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    API Key (Secret) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.paycorex_api_key}
                                    onChange={e => setData('paycorex_api_key', e.target.value)}
                                    placeholder="e.g. 2d7bcd6c2467d343d9f1110ebd59da51"
                                    className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 text-sm font-mono focus:border-blue-500 focus:outline-none transition-colors"
                                />
                                {errors.paycorex_api_key && <p className="text-xs text-red-500 mt-1">{errors.paycorex_api_key}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                                    Base API URL
                                </label>
                                <input
                                    type="text"
                                    value={data.paycorex_base_url}
                                    onChange={e => setData('paycorex_base_url', e.target.value)}
                                    placeholder="https://paycorex.in/api/v1"
                                    className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                />
                                {errors.paycorex_base_url && <p className="text-xs text-red-500 mt-1">{errors.paycorex_base_url}</p>}
                            </div>
                        </div>

                        {/* Test Connection Button & Result */}
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleTestPaycorex}
                                disabled={testLoading}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[16px]">sync</span>
                                {testLoading ? 'Testing API...' : 'Test PayCoreX Connection (कनैक्शन टेस्ट करें)'}
                            </button>

                            {testResult && (
                                <div className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                                    testResult.success
                                        ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                                        : 'bg-red-50 text-red-800 border-red-200'
                                }`}>
                                    <span className="font-bold">
                                        {testResult.success ? '✓ API Connected' : '✕ Error'}:
                                    </span>
                                    <span>
                                        {testResult.subscription_note || testResult.check_response?.message || testResult.message}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Manual UPI & WhatsApp Fallback */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-md">
                                    📝
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Manual UPI Payment & Screenshot (मैन्युअल पेमेंट विकल्प)</h3>
                                    <p className="text-xs text-slate-500">Enable/disable manual UPI QR code and payment screenshot upload option for users</p>
                                </div>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.manual_payment_enabled}
                                    onChange={e => setData('manual_payment_enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {data.manual_payment_enabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                                        placeholder="e.g. 919876543210 or 380630323112"
                                        className="w-full border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">Country code included without '+' or spaces</p>
                                    {errors.whatsapp_number && <p className="text-xs text-red-500 mt-1">{errors.whatsapp_number}</p>}
                                </div>
                            </div>

                            {/* Live Manual QR Preview */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center flex flex-col items-center justify-center">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fallback QR Preview</p>
                                {data.upi_id ? (
                                    <>
                                        <img
                                            src={qrUrl}
                                            alt="QR Preview"
                                            className="w-36 h-36 rounded-xl border border-slate-200 bg-white object-contain"
                                            key={qrUrl}
                                        />
                                        <div className="mt-2">
                                            <p className="text-xs text-slate-400">UPI ID</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-white">{data.upi_id}</p>
                                            <p className="text-xs text-slate-500">{data.upi_name}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-slate-400 text-xs">Enter UPI ID to see preview</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 px-6 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {processing ? 'Saving Settings...' : 'Save All Settings (सेटिंग्स सेव करें)'}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
}
