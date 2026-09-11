import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ shop, jobs }) {
    const [copied, setCopied] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Auto-refresh queue every 8 seconds if there are queued/printing jobs
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['jobs', 'shop'], preserveScroll: true });
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const { data, setData, post, processing, errors } = useForm({
        shop_name: shop.shop_name || '',
        phone: shop.phone || '',
        upi_id: shop.upi_id || '',
        printer_name: shop.printer_name || '',
        color_printer_name: shop.color_printer_name || '',
        price_bw_page: shop.price_bw_page || 3.00,
        price_color_page: shop.price_color_page || 10.00,
        price_photo_sheet: shop.price_photo_sheet || 30.00,
        is_auto_print: shop.is_auto_print ?? true,
        is_cash_allowed: shop.is_cash_allowed ?? true,
        is_online_allowed: shop.is_online_allowed ?? true,
    });

    const handleSaveSettings = (e) => {
        e.preventDefault();
        post('/admin/qr-to-print/settings', {
            onSuccess: () => setShowSettings(false),
        });
    };

    const copyCustomerLink = () => {
        navigator.clipboard.writeText(shop.customer_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleReprint = (id) => {
        if (confirm('Re-send this job to the printer?')) {
            router.post(`/admin/qr-to-print/jobs/${id}/reprint`, {}, { preserveScroll: true });
        }
    };

    const handleCancel = (id) => {
        if (confirm('Cancel this print job?')) {
            router.post(`/admin/qr-to-print/jobs/${id}/cancel`, {}, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                            <span className="material-symbols-outlined text-2xl">print</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight flex items-center gap-2">
                                QR to Print
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                    Counter Cloud Printing
                                </span>
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Direct mobile scan to your shop's Windows printer
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs"
                        >
                            <span className="material-symbols-outlined text-base">tune</span>
                            Rates & Printers
                        </button>
                        <Link
                            href="/admin/qr-to-print/standee"
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all"
                        >
                            <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                            Print Counter Standee
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="QR to Print - Counter Cloud Printing" />

            <div className="space-y-6 max-w-7xl mx-auto pb-12">

                {/* Top Status & Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* Agent & Printer Status Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Windows Print Agent
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                    shop.is_online
                                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                        : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${shop.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    {shop.is_online ? 'AGENT ONLINE' : 'AGENT OFFLINE'}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">print</span>
                                    <span>Printer:</span>
                                    <strong className="text-blue-600 dark:text-blue-400 font-bold truncate">
                                        {shop.printer_name || 'Not Selected (Will use Default)'}
                                    </strong>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Last heartbeat: {shop.agent_last_seen}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                            <a
                                href="/admin/qr-to-print/download-agent"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                <span className="material-symbols-outlined text-sm">download</span>
                                Download 1-Click Agent (.zip)
                            </a>
                            <span className="text-[11px] text-slate-400">Run on Shop PC</span>
                        </div>
                    </div>

                    {/* Shop QR & Link Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
                        <div className="w-24 h-24 bg-white p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex-shrink-0 flex items-center justify-center">
                            <img src={shop.qr_url} alt="Shop Counter QR" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Shop Counter QR
                            </span>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base truncate mt-0.5">
                                {shop.shop_name}
                            </h3>
                            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate mb-2">
                                Code: <span className="text-blue-600 dark:text-blue-400 font-bold">{shop.shop_code}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={copyCustomerLink}
                                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </button>
                                <a
                                    href={shop.customer_url}
                                    target="_blank"
                                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    Open
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Rates & Mode Summary */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Active Rates & Settings
                            </span>
                            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <div className="text-[10px] uppercase font-bold text-slate-500">B&W</div>
                                    <div className="text-base font-extrabold text-slate-800 dark:text-white">₹{shop.price_bw_page}</div>
                                </div>
                                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                                    <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Color</div>
                                    <div className="text-base font-extrabold text-blue-700 dark:text-blue-300">₹{shop.price_color_page}</div>
                                </div>
                                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
                                    <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Photo</div>
                                    <div className="text-base font-extrabold text-amber-700 dark:text-amber-300">₹{shop.price_photo_sheet}</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>Auto-Print: <strong className={shop.is_auto_print ? 'text-emerald-600' : 'text-amber-600'}>{shop.is_auto_print ? 'ON (Instant)' : 'OFF (Manual)'}</strong></span>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                            >
                                Change Rates
                            </button>
                        </div>
                    </div>
                </div>

                {/* Settings Drawer / Box */}
                {showSettings && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/60 shadow-lg animate-in fade-in duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600 text-2xl">settings</span>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Shop Printing & Pricing Settings</h2>
                            </div>
                            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveSettings} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Shop Name</label>
                                    <input
                                        type="text"
                                        value={data.shop_name}
                                        onChange={(e) => setData('shop_name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Shop UPI ID (for Customer Online Pay)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. yourname@upi"
                                        value={data.upi_id}
                                        onChange={(e) => setData('upi_id', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Printers */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Primary / B&W Windows Printer
                                    </label>
                                    {shop.available_printers && shop.available_printers.length > 0 ? (
                                        <select
                                            value={data.printer_name}
                                            onChange={(e) => setData('printer_name', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white"
                                        >
                                            <option value="">Default Windows Printer</option>
                                            {shop.available_printers.map((p, idx) => (
                                                <option key={idx} value={p.name}>
                                                    {p.name} {p.default ? '(Default)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="e.g. EPSON L3150 Series or leave blank for default"
                                            value={data.printer_name}
                                            onChange={(e) => setData('printer_name', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white"
                                        />
                                    )}
                                    <p className="text-[11px] text-slate-400 mt-1">Leave blank to always use the default Windows printer.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Separate Color Printer (Optional)
                                    </label>
                                    {shop.available_printers && shop.available_printers.length > 0 ? (
                                        <select
                                            value={data.color_printer_name}
                                            onChange={(e) => setData('color_printer_name', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white"
                                        >
                                            <option value="">Same as Primary Printer</option>
                                            {shop.available_printers.map((p, idx) => (
                                                <option key={idx} value={p.name}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="Optional: Printer name for Color jobs"
                                            value={data.color_printer_name}
                                            onChange={(e) => setData('color_printer_name', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white"
                                        />
                                    )}
                                    <p className="text-[11px] text-slate-400 mt-1">If you have a dedicated color ink-tank printer.</p>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Black & White Rate (₹ / page)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={data.price_bw_page}
                                        onChange={(e) => setData('price_bw_page', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Color Print Rate (₹ / page)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={data.price_color_page}
                                        onChange={(e) => setData('price_color_page', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Photo Sheet Rate (₹ / A4 sheet)
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={data.price_photo_sheet}
                                        onChange={(e) => setData('price_photo_sheet', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_auto_print}
                                        onChange={(e) => setData('is_auto_print', e.target.checked)}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Instant Auto-Print (Recommended)
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_cash_allowed}
                                        onChange={(e) => setData('is_cash_allowed', e.target.checked)}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Allow Counter Cash Payment
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_online_allowed}
                                        onChange={(e) => setData('is_online_allowed', e.target.checked)}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Allow Online UPI Payment
                                    </span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowSettings(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Quick Setup 3-Step Guide Banner */}
                {!shop.is_online && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 rounded-2xl p-5 border border-blue-200 dark:border-blue-900/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">info</span>
                                How to start Auto-Printing in 1 Minute:
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                1. Download the 1-click agent ZIP → 2. Extract on your Shop PC & run <strong>Start-Agent.bat</strong> → 3. Print your Counter QR Standee!
                            </p>
                        </div>
                        <a
                            href="/admin/qr-to-print/download-agent"
                            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
                        >
                            <span className="material-symbols-outlined text-base">download</span>
                            Download Agent (.zip)
                        </a>
                    </div>
                )}

                {/* Live Print Queue & Recent Orders Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">table_rows</span>
                                Incoming Print Queue & Recent Jobs
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Jobs submitted by customers via mobile QR scan (auto-refreshes every 8s)
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.reload({ only: ['jobs', 'shop'] })}
                                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200 dark:border-slate-700"
                                title="Refresh Queue"
                            >
                                <span className="material-symbols-outlined text-base">refresh</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">Job Code</th>
                                    <th className="py-3 px-4">Customer</th>
                                    <th className="py-3 px-4">Document</th>
                                    <th className="py-3 px-4">Settings</th>
                                    <th className="py-3 px-4">Amount</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {jobs && jobs.length > 0 ? (
                                    jobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                                {job.job_code}
                                                <div className="text-[10px] text-slate-400 font-sans font-normal">{job.created_at}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-semibold">{job.customer_name}</div>
                                                {job.customer_phone && (
                                                    <div className="text-[11px] text-slate-400">{job.customer_phone}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-medium truncate max-w-xs" title={job.file_name}>
                                                    {job.file_name}
                                                </div>
                                                <div className="text-[10px] text-slate-400 uppercase">
                                                    {job.service_type.replace('_', ' ')} • {job.total_pages} {job.total_pages > 1 ? 'pages' : 'page'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        job.color_mode === 'color' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                    }`}>
                                                        {job.color_mode.toUpperCase()}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                        {job.copies} {job.copies > 1 ? 'copies' : 'copy'}
                                                    </span>
                                                    {job.duplex !== 'simplex' && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                                                            2-Sided
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-slate-900 dark:text-white">₹{job.calculated_cost}</div>
                                                <span className={`text-[10px] font-semibold ${
                                                    job.payment_status === 'paid_online' ? 'text-emerald-600' : 'text-amber-600'
                                                }`}>
                                                    {job.payment_status === 'paid_online' ? 'Paid Online' : 'Cash at Counter'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {job.job_status === 'printed' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                        Printed
                                                    </span>
                                                )}
                                                {job.job_status === 'printing' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 animate-pulse">
                                                        <span className="material-symbols-outlined text-sm">print</span>
                                                        Printing...
                                                    </span>
                                                )}
                                                {job.job_status === 'downloading' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 animate-pulse">
                                                        <span className="material-symbols-outlined text-sm">cloud_download</span>
                                                        Sending...
                                                    </span>
                                                )}
                                                {job.job_status === 'queued' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                                                        <span className="material-symbols-outlined text-sm">hourglass_top</span>
                                                        Queued
                                                    </span>
                                                )}
                                                {job.job_status === 'failed' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300" title={job.error_message}>
                                                        <span className="material-symbols-outlined text-sm">error</span>
                                                        Failed
                                                    </span>
                                                )}
                                                {job.job_status === 'cancelled' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                        Cancelled
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                                                <a
                                                    href={job.download_url}
                                                    target="_blank"
                                                    className="p-1.5 text-slate-500 hover:text-blue-600 inline-block"
                                                    title="View / Download Document"
                                                >
                                                    <span className="material-symbols-outlined text-base">visibility</span>
                                                </a>
                                                <button
                                                    onClick={() => handleReprint(job.id)}
                                                    className="p-1.5 text-slate-500 hover:text-emerald-600 inline-block"
                                                    title="Reprint Job"
                                                >
                                                    <span className="material-symbols-outlined text-base">print</span>
                                                </button>
                                                {job.job_status === 'queued' && (
                                                    <button
                                                        onClick={() => handleCancel(job.id)}
                                                        className="p-1.5 text-slate-500 hover:text-red-600 inline-block"
                                                        title="Cancel Job"
                                                    >
                                                        <span className="material-symbols-outlined text-base">cancel</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400">
                                            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600">print_disabled</span>
                                            <p className="font-semibold text-slate-600 dark:text-slate-400">No print jobs received yet.</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Scan your shop QR code from your phone to send your first test print!
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
