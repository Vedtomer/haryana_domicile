import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function QrPrintIndex({ shop, jobs = [], stats = {} }) {
    const [copied, setCopied] = useState(false);
    const [editingSettings, setEditingSettings] = useState(false);

    // Form for Shop Settings
    const { data, setData, post, processing, errors } = useForm({
        shop_name: shop.shop_name || '',
        upi_id: shop.upi_id || '',
        bw_rate: shop.bw_rate || 2.00,
        color_rate: shop.color_rate || 10.00,
    });

    // Auto-refresh printer queue and status every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['jobs', 'shop', 'stats'] });
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const handleCopyLink = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shop.upload_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        post('/admin/qr-to-print/settings', {
            preserveScroll: true,
            onSuccess: () => setEditingSettings(false),
        });
    };

    const handleReprint = (jobId) => {
        if (confirm('Do you want to re-send this document to printer queue?')) {
            router.post(`/admin/qr-to-print/reprint/${jobId}`, {}, { preserveScroll: true });
        }
    };

    const handleDelete = (jobId) => {
        if (confirm('Are you sure you want to delete this print job?')) {
            router.delete(`/admin/qr-to-print/job/${jobId}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-2">
                    <span className="text-xl">🖨️</span>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                        QR to Print (Smart Counter)
                    </h1>
                </div>
            }
        >
            <Head title="QR to Print - Smart Counter" />

            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                {/* 1. Header & Live Status Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                {shop.shop_name}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                #{shop.shop_code}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Direct QR Scan & Auto-Print for Customers • No WhatsApp or Bluetooth needed
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Badge */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm ${
                            shop.is_online 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        }`}>
                            <span className={`w-3 h-3 rounded-full ${shop.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                            <span>{shop.is_online ? 'Printer Service: Online (Connected)' : 'Printer Service: Offline'}</span>
                        </div>

                        {/* Standee Button */}
                        <Link
                            href="/admin/qr-to-print/standee"
                            target="_blank"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm rounded-xl shadow-md transition-all hover:scale-[1.02]"
                        >
                            <span>🖨️</span>
                            <span>Print Counter Standee (A4)</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Download Silent Agent Banner */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-700/40">
                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                                <span>⚡</span> 1-CLICK SILENT WINDOWS BACKGROUND SERVICE
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                Ek Baar Install Karein — Chupke Se Background Me Chalta Rahega!
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Ab koi CMD ya black window khuli rakhne ki jarurat nahi hai. 
                                Niche diye button se ZIP download karke <strong className="text-yellow-300">Install-Print-Service.bat</strong> chalayein. 
                                Service 100% background me install ho jayegi aur computer restart hone par bhi automatic start hogi.
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                                <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 0% Screen Window</span>
                                <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Auto-Starts on PC Boot</span>
                                <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> High-Speed Silent Printing</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                            <a
                                href="/admin/qr-to-print/download-agent"
                                className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all text-center"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span>Download Print Service (.zip)</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Steps Guide */}
                    <div className="mt-6 pt-6 border-t border-slate-700/60 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                        <div className="flex items-start gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                            <span className="w-6 h-6 rounded-full bg-blue-500/30 text-blue-300 font-bold flex items-center justify-center shrink-0">1</span>
                            <div>
                                <strong className="text-white block">Download & Extract</strong>
                                ZIP file ko right-click karke "Extract All" karein.
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                            <span className="w-6 h-6 rounded-full bg-blue-500/30 text-blue-300 font-bold flex items-center justify-center shrink-0">2</span>
                            <div>
                                <strong className="text-white block">Run Installer Once</strong>
                                Folder me <code className="text-yellow-300">Install-Print-Service.bat</code> par double-click karein.
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                            <span className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center shrink-0">3</span>
                            <div>
                                <strong className="text-white block">Done! Window Band Karein</strong>
                                Service background me chalu ho jayegi. Koi window khuli rakhne ki jarurat nahi.
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Stats & Quick Links Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Today's Jobs</span>
                            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-lg">📄</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                            {stats.total_jobs_today || 0}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Total prints received today</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Completed</span>
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-lg">✅</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                            {stats.completed_today || 0}
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Successfully dispatched</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Today's Earnings</span>
                            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 text-lg">💰</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                            ₹{(stats.revenue_today || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">From printed jobs today</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Queue Status</span>
                            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 text-lg">⏳</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                            {stats.pending_count || 0}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Jobs waiting in queue</p>
                    </div>
                </div>

                {/* 4. Rates & Customer Upload Link Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-base">
                                Customer Upload Link & Rates
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Share this link or place the QR standee on your cyber cafe counter.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                <span>{copied ? 'Copied!' : 'Copy Customer Link'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingSettings(!editingSettings)}
                                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 font-semibold text-xs rounded-xl transition-all"
                            >
                                <span>⚙️</span>
                                <span>{editingSettings ? 'Close Settings' : 'Edit Rates & Settings'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Settings Form Accordion */}
                    {editingSettings ? (
                        <form onSubmit={handleSaveSettings} className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    Shop Name
                                </label>
                                <input
                                    type="text"
                                    value={data.shop_name}
                                    onChange={(e) => setData('shop_name', e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                                    required
                                />
                                {errors.shop_name && <p className="text-xs text-red-500 mt-1">{errors.shop_name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    Counter UPI ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={data.upi_id}
                                    placeholder="e.g. 9876543210@paytm"
                                    onChange={(e) => setData('upi_id', e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                                />
                                {errors.upi_id && <p className="text-xs text-red-500 mt-1">{errors.upi_id}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    B&W Print Rate (per page)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={data.bw_rate}
                                        onChange={(e) => setData('bw_rate', e.target.value)}
                                        className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                                {errors.bw_rate && <p className="text-xs text-red-500 mt-1">{errors.bw_rate}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    Color Print Rate (per page)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                                    <input
                                        type="number"
                                        step="1"
                                        value={data.color_rate}
                                        onChange={(e) => setData('color_rate', e.target.value)}
                                        className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                                {errors.color_rate && <p className="text-xs text-red-500 mt-1">{errors.color_rate}</p>}
                            </div>

                            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingSettings(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                                >
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
                            <div>
                                <span className="text-slate-400 text-xs block">Public Upload URL</span>
                                <a href={shop.upload_url} target="_blank" className="font-mono font-medium text-blue-600 dark:text-blue-400 underline">
                                    {shop.upload_url}
                                </a>
                            </div>
                            <div>
                                <span className="text-slate-400 text-xs block">B&W Rate</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{shop.bw_rate}/page</span>
                            </div>
                            <div>
                                <span className="text-slate-400 text-xs block">Color Rate</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{shop.color_rate}/page</span>
                            </div>
                            {shop.upi_id && (
                                <div>
                                    <span className="text-slate-400 text-xs block">UPI ID</span>
                                    <span className="font-bold text-slate-800 dark:text-white">{shop.upi_id}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 5. Live Print Queue Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📋</span>
                            <h3 className="font-bold text-slate-800 dark:text-white text-base">
                                Live Print Queue & Recent Orders
                            </h3>
                        </div>
                        <span className="text-xs text-slate-400 font-medium animate-pulse">
                            Auto-refreshing every 8s
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">Job Code</th>
                                    <th className="px-5 py-3">Customer</th>
                                    <th className="px-5 py-3">Document</th>
                                    <th className="px-5 py-3">Pages / Copies</th>
                                    <th className="px-5 py-3">Mode</th>
                                    <th className="px-5 py-3">Amount</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {jobs.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-5 py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <span className="text-4xl">📭</span>
                                                <p className="text-base font-semibold text-slate-600 dark:text-slate-300">No print jobs yet</p>
                                                <p className="text-xs text-slate-400 max-w-sm">
                                                    Ask customers to scan your counter QR code or open your upload link to print their documents instantly.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    jobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                                    #{job.job_code}
                                                </span>
                                                <span className="block text-[11px] text-slate-400 font-normal">
                                                    {new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-slate-800 dark:text-slate-200">
                                                    {job.customer_name || 'Customer'}
                                                </div>
                                                {job.customer_phone && (
                                                    <span className="text-xs text-slate-400 block font-mono">
                                                        {job.customer_phone}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 max-w-xs truncate" title={job.original_filename}>
                                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate">
                                                    <span>📄</span>
                                                    <span className="truncate">{job.original_filename}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                                                    {job.total_pages} {job.total_pages === 1 ? 'page' : 'pages'}
                                                </span>
                                                <span className="text-xs text-slate-400 block">
                                                    × {job.copies} {job.copies === 1 ? 'copy' : 'copies'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {job.color_type === 'color' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
                                                        Color
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                        B&W
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-800 dark:text-white">
                                                    ₹{parseFloat(job.total_amount).toFixed(2)}
                                                </div>
                                                <span className="text-[11px] text-slate-400 uppercase font-semibold">
                                                    {job.payment_method}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {job.status === 'completed' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                                        <span>✓</span> Printed
                                                    </span>
                                                )}
                                                {job.status === 'printing' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 animate-pulse">
                                                        <span>🖨️</span> Printing...
                                                    </span>
                                                )}
                                                {job.status === 'pending' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                                        <span>⏳</span> In Queue
                                                    </span>
                                                )}
                                                {job.status === 'failed' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300" title={job.error_message}>
                                                        <span>✕</span> Failed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReprint(job.id)}
                                                        title="Send to printer again"
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(job.id)}
                                                        title="Delete record"
                                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
