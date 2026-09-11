import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("QrPrint Component Crash Error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="max-w-2xl mx-auto my-12 p-6 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-2xl shadow-sm text-center">
                    <span className="text-4xl mb-3 block">⚠️</span>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Display Issue Detected</h3>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-mono break-all">
                        {String(this.state.error?.message || this.state.error || 'Unknown rendering error')}
                    </p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

function QrPrintDashboard({ shop = {}, jobs = [], stats = {} }) {
    const [copied, setCopied] = useState(false);
    const [editingSettings, setEditingSettings] = useState(false);

    // Form for Shop Pricing & Name Settings
    const { 
        data: shopData, 
        setData: setShopData, 
        post: postShopSettings, 
        processing: savingShop, 
        errors: shopErrors 
    } = useForm({
        shop_name: shop?.shop_name || '',
        upi_id: shop?.upi_id || '',
        bw_rate: shop?.bw_rate ?? 2.00,
        color_rate: shop?.color_rate ?? 10.00,
    });

    // Form for Printer Routing Settings
    const { 
        data: printerData, 
        setData: setPrinterData, 
        post: postPrinterSettings, 
        processing: savingPrinters 
    } = useForm({
        printer_mode: shop?.printer_mode || 'single',
        bw_printer: shop?.bw_printer || '',
        color_printer: shop?.color_printer || '',
    });

    // Auto-refresh printer queue and status every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['jobs', 'shop', 'stats'] });
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const handleCopyLink = () => {
        if (navigator?.clipboard && shop?.upload_url) {
            navigator.clipboard.writeText(shop.upload_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const handleSaveShopSettings = (e) => {
        e.preventDefault();
        postShopSettings('/admin/qr-to-print/settings', {
            preserveScroll: true,
            onSuccess: () => setEditingSettings(false),
        });
    };

    const handleSavePrinterSettings = (e) => {
        e.preventDefault();
        postPrinterSettings('/admin/qr-to-print/printer-settings', {
            preserveScroll: true,
        });
    };

    const handleDeletePrinter = (printerName) => {
        if (confirm(`Kya aap printer "${printerName}" ko list se delete karna chahte hain? Ye printer customer portal aur dashboard se hat jayega.`)) {
            router.post('/admin/qr-to-print/delete-printer', {
                printer_name: printerName
            }, {
                preserveScroll: true
            });
        }
    };

    const handleRestorePrinter = (printerName) => {
        router.post('/admin/qr-to-print/restore-printer', {
            printer_name: printerName
        }, {
            preserveScroll: true
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

    // Safely parse detected_printers into an array
    const parsePrinters = (raw) => {
        if (!raw) return [];
        let val = raw;
        if (typeof val === 'string') {
            try {
                val = JSON.parse(val);
            } catch (e) {
                return [];
            }
        }
        if (Array.isArray(val)) {
            return val.filter(Boolean);
        }
        if (typeof val === 'object' && val !== null) {
            return Object.values(val).filter(Boolean);
        }
        return [];
    };

    const detectedPrinters = parsePrinters(shop?.detected_printers);

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
                                {shop?.shop_name || 'My Shop Print Point'}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                #{shop?.shop_code || '------'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Direct QR Scan & Auto-Print for Customers • No WhatsApp or Bluetooth needed
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Badge */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm ${
                            shop?.is_online 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        }`}>
                            <span className={`w-3 h-3 rounded-full ${shop?.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                            <span>{shop?.is_online ? 'Printer Service: Online (Connected)' : 'Printer Service: Offline'}</span>
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

                {/* 3. NEW: Printer Settings & Smart Routing Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl">⚙️</span>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    Printer Settings & Smart Routing (प्रिंटर सेटिंग्स व चयन)
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Aapke computer ke active/offline printers yahan detect honge. Black & White aur Color print ke liye alag alag printer set karein.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {detectedPrinters.length} Printer{detectedPrinters.length === 1 ? '' : 's'} Detected
                            </span>
                        </div>
                    </div>

                    {/* Detected Printers Cards */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                            <span>📡</span>
                            <span>Computer se jude printers (Live Status):</span>
                        </h4>

                        {detectedPrinters.length === 0 ? (
                            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-3">
                                <span className="text-xl">ℹ️</span>
                                <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                                    <p className="font-bold">Abhi koi printer detect nahi hua hai.</p>
                                    <p className="text-amber-700 dark:text-amber-300">
                                        Jaise hi aap Windows background service (<code className="font-bold">Install-Print-Service.bat</code>) ko apne PC par chalu karenge, aapke PC se jude saare printers (HP, Epson, Canon, Brother) yahan apne aap live status ke sath dikhne lagenge.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {detectedPrinters.map((pr, idx) => {
                                    if (!pr) return null;
                                    const pName = typeof pr === 'string' ? pr : (pr?.name || `Printer ${idx + 1}`);
                                    const isDefault = typeof pr === 'object' && pr !== null ? Boolean(pr.is_default) : false;
                                    const isOffline = typeof pr === 'object' && pr !== null ? Boolean(pr.is_offline) : false;
                                    const status = typeof pr === 'object' && pr !== null ? (pr.status || (isOffline ? 'Offline' : 'Ready')) : 'Ready';
                                    const isAssignedBw = (shop?.bw_printer && shop.bw_printer === pName) || (!shop?.bw_printer && isDefault);
                                    const isAssignedColor = (shop?.color_printer && shop.color_printer === pName) || (!shop?.color_printer && isDefault);

                                    return (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-xl border transition-all ${
                                                isOffline 
                                                ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-75' 
                                                : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-2xs hover:border-blue-400'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-lg">🖨️</span>
                                                    <h5 className="font-bold text-sm text-slate-800 dark:text-white truncate" title={pName}>
                                                        {pName}
                                                    </h5>
                                                </div>
                                                <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    isOffline 
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300' 
                                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                                                    <span>{status}</span>
                                                </span>
                                            </div>

                                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                                    {isDefault && (
                                                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
                                                            ⭐ Default
                                                        </span>
                                                    )}
                                                    {isAssignedBw && (
                                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold">
                                                            🖤 B&W
                                                        </span>
                                                    )}
                                                    {isAssignedColor && (
                                                        <span className="px-2 py-0.5 rounded-md bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 font-semibold">
                                                            🌈 Color
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletePrinter(pName)}
                                                    title="Printer ko list se delete karein"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-800/60"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Hidden / Deleted Printers Section */}
                        {shop?.deleted_printers && shop.deleted_printers.length > 0 && (
                            <div className="mt-3.5 p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <span>🗑️ Deleted / Hidden Printers:</span>
                                        <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                            {shop.deleted_printers.length}
                                        </span>
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                    Ye printers dashboard aur customer upload page se hata diye gaye hain. Wapis laane ke liye Restore par click karein.
                                </p>
                                <div className="mt-2.5 flex flex-wrap gap-2">
                                    {shop.deleted_printers.map((delName, i) => (
                                        <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 shadow-2xs">
                                            <span className="line-through text-slate-400">{delName}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRestorePrinter(delName)}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold cursor-pointer text-[11px] hover:underline"
                                            >
                                                <span>↺ Restore</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Printer Routing Form */}
                    <form onSubmit={handleSavePrinterSettings} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                                    Smart Printer Routing Mode
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    B&W aur Color print ke liye alag alag printer choose karein ya ek hi printer use karein.
                                </p>
                            </div>

                            {/* Mode Switch */}
                            <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setPrinterData('printer_mode', 'single')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        printerData.printer_mode === 'single'
                                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-300'
                                    }`}
                                >
                                    Single Printer (All-in-One)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPrinterData('printer_mode', 'dual')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        printerData.printer_mode === 'dual'
                                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-300'
                                    }`}
                                >
                                    Dual Printer (B&W + Color)
                                </button>
                            </div>
                        </div>

                        {/* Dropdowns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    🖤 Black & White Prints Printer:
                                </label>
                                <select
                                    value={printerData.bw_printer || ''}
                                    onChange={(e) => setPrinterData('bw_printer', e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                                >
                                    <option value="">Auto (Use Windows Default Printer)</option>
                                    {detectedPrinters.map((pr, i) => {
                                        if (!pr) return null;
                                        const name = typeof pr === 'string' ? pr : (pr?.name || `Printer ${i + 1}`);
                                        const isOffline = typeof pr === 'object' && pr !== null ? Boolean(pr.is_offline) : false;
                                        return (
                                            <option key={i} value={name}>
                                                {name} {isOffline ? '(Offline)' : '(Ready)'}
                                            </option>
                                        );
                                    })}
                                </select>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    B&W prints directly iss printer par aayenge (Rate: ₹{parseFloat(shop?.bw_rate || 2).toFixed(0)}/page)
                                </span>
                            </div>

                            {printerData.printer_mode === 'dual' ? (
                                <div>
                                    <label className="block text-xs font-bold text-pink-600 dark:text-pink-400 mb-1">
                                        🌈 Color Prints Printer:
                                    </label>
                                    <select
                                        value={printerData.color_printer || ''}
                                        onChange={(e) => setPrinterData('color_printer', e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                                    >
                                        <option value="">Auto (Use Windows Default Printer)</option>
                                        {detectedPrinters.map((pr, i) => {
                                            if (!pr) return null;
                                            const name = typeof pr === 'string' ? pr : (pr?.name || `Printer ${i + 1}`);
                                            const isOffline = typeof pr === 'object' && pr !== null ? Boolean(pr.is_offline) : false;
                                            return (
                                                <option key={i} value={name}>
                                                    {name} {isOffline ? '(Offline)' : '(Ready)'}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <span className="text-[11px] text-slate-400 mt-1 block">
                                        Color prints directly iss printer par aayenge (Rate: ₹{parseFloat(shop?.color_rate || 10).toFixed(0)}/page)
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col justify-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">Single Mode Active:</p>
                                    <p className="text-[11px] mt-0.5">B&W aur Color dono prints upar chune hue printer par hi niklenge.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={savingPrinters}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                            >
                                {savingPrinters ? 'Saving Configuration...' : 'Save Printer Settings'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* 4. Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Today's Jobs</span>
                            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-lg">📄</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                            {stats?.total_jobs_today ?? 0}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Total prints received today</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Completed</span>
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-lg">✅</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                            {stats?.completed_today ?? 0}
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Successfully dispatched</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Today's Earnings</span>
                            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 text-lg">💰</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                            ₹{parseFloat(stats?.revenue_today || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">From printed jobs today</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Queue Status</span>
                            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 text-lg">⏳</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
                            {stats?.pending_count ?? 0}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Jobs waiting in queue</p>
                    </div>
                </div>

                {/* 5. Rates & Customer Upload Link Bar */}
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
                                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                <span>{copied ? 'Copied!' : 'Copy Customer Link'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingSettings(!editingSettings)}
                                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                            >
                                <span>⚙️</span>
                                <span>{editingSettings ? 'Close Settings' : 'Edit Rates & UPI'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Settings Form Accordion */}
                    {editingSettings ? (
                        <form onSubmit={handleSaveShopSettings} className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    Shop Name
                                </label>
                                <input
                                    type="text"
                                    value={shopData.shop_name}
                                    onChange={(e) => setShopData('shop_name', e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                                    required
                                />
                                {shopErrors.shop_name && <p className="text-xs text-red-500 mt-1">{shopErrors.shop_name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    Counter UPI ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={shopData.upi_id}
                                    placeholder="e.g. 9876543210@paytm"
                                    onChange={(e) => setShopData('upi_id', e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                                />
                                {shopErrors.upi_id && <p className="text-xs text-red-500 mt-1">{shopErrors.upi_id}</p>}
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
                                        value={shopData.bw_rate}
                                        onChange={(e) => setShopData('bw_rate', e.target.value)}
                                        className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                                {shopErrors.bw_rate && <p className="text-xs text-red-500 mt-1">{shopErrors.bw_rate}</p>}
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
                                        value={shopData.color_rate}
                                        onChange={(e) => setShopData('color_rate', e.target.value)}
                                        className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                                {shopErrors.color_rate && <p className="text-xs text-red-500 mt-1">{shopErrors.color_rate}</p>}
                            </div>

                            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingSettings(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingShop}
                                    className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm cursor-pointer"
                                >
                                    {savingShop ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
                            <div>
                                <span className="text-slate-400 text-xs block">Public Upload URL</span>
                                <a href={shop?.upload_url || '#'} target="_blank" className="font-mono font-medium text-blue-600 dark:text-blue-400 underline">
                                    {shop?.upload_url || 'N/A'}
                                </a>
                            </div>
                            <div>
                                <span className="text-slate-400 text-xs block">B&W Rate</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{parseFloat(shop?.bw_rate || 2).toFixed(0)}/page</span>
                            </div>
                            <div>
                                <span className="text-slate-400 text-xs block">Color Rate</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{parseFloat(shop?.color_rate || 10).toFixed(0)}/page</span>
                            </div>
                            {shop?.upi_id && (
                                <div>
                                    <span className="text-slate-400 text-xs block">UPI ID</span>
                                    <span className="font-bold text-slate-800 dark:text-white">{shop.upi_id}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 6. Live Print Queue Table */}
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
                                {!jobs || jobs.length === 0 ? (
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
                                    jobs.map((job) => {
                                        if (!job) return null;
                                        return (
                                            <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-5 py-4">
                                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                                        #{job.job_code || job.id}
                                                    </span>
                                                    <span className="block text-[11px] text-slate-400 font-normal">
                                                        {job.created_at ? new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
                                                <td className="px-5 py-4 max-w-xs truncate" title={job.original_filename || ''}>
                                                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate">
                                                        <span>📄</span>
                                                        <span className="truncate">{job.original_filename || 'Document'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="text-slate-800 dark:text-slate-200 font-semibold">
                                                        {job.total_pages || 1} {(job.total_pages || 1) === 1 ? 'page' : 'pages'}
                                                    </span>
                                                    <span className="text-xs text-slate-400 block">
                                                        × {job.copies || 1} {(job.copies || 1) === 1 ? 'copy' : 'copies'}
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
                                                        ₹{parseFloat(job.total_amount || 0).toFixed(2)}
                                                    </div>
                                                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                                                        {job.payment_method || 'cash'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {job.status === 'completed' && (
                                                        <div>
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                                                <span>✓</span> Printed
                                                            </span>
                                                            <div className="mt-1.5">
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border truncate max-w-[170px] ${
                                                                    job.color_type === 'color'
                                                                        ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-900/50'
                                                                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                                }`} title={job.printer_name || (job.color_type === 'color' ? (shop?.color_printer || 'Epson Color') : (shop?.bw_printer || 'Canon B&W'))}>
                                                                    <span>🖨️</span>
                                                                    <span className="truncate">
                                                                        {job.printer_name || (job.color_type === 'color' ? (shop?.color_printer || 'Epson Color') : (shop?.bw_printer || 'Canon B&W'))}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {job.status === 'printing' && (
                                                        <div>
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 animate-pulse">
                                                                <span>🖨️</span> Printing...
                                                            </span>
                                                            <div className="mt-1.5">
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border truncate max-w-[170px] ${
                                                                    job.color_type === 'color'
                                                                        ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-900/50'
                                                                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                                }`} title={job.printer_name || (job.color_type === 'color' ? (shop?.color_printer || 'Epson Color') : (shop?.bw_printer || 'Canon B&W'))}>
                                                                    <span>🖨️</span>
                                                                    <span className="truncate">
                                                                        {job.printer_name || (job.color_type === 'color' ? (shop?.color_printer || 'Epson Color') : (shop?.bw_printer || 'Canon B&W'))}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {job.status === 'pending' && (
                                                        <div>
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                                                <span>⏳</span> In Queue
                                                            </span>
                                                            <div className="mt-1.5">
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border truncate max-w-[170px] ${
                                                                    job.color_type === 'color'
                                                                        ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-900/50'
                                                                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                                }`} title={`Target: ${job.color_type === 'color' ? (shop?.color_printer || 'Epson Color') : (shop?.bw_printer || 'Canon B&W')}`}>
                                                                    <span>🖨️</span>
                                                                    <span className="truncate">
                                                                        {job.color_type === 'color' ? (shop?.color_printer || 'Epson Color') : (shop?.bw_printer || 'Canon B&W')}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {job.status === 'failed' && (
                                                        <div>
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300" title={job.error_message || ''}>
                                                                <span>✕</span> Failed
                                                            </span>
                                                            <div className="mt-1.5">
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 truncate max-w-[170px]" title={job.printer_name || (job.color_type === 'color' ? (shop?.color_printer || 'Epson Color') : (shop?.bw_printer || 'Canon B&W'))}>
                                                                    <span>🖨️</span>
                                                                    <span className="truncate">
                                                                        {job.printer_name || (job.color_type === 'color' ? (shop?.color_printer || 'Epson Color') : (shop?.bw_printer || 'Canon B&W'))}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            {job.error_message && (
                                                                <span className="text-[10px] text-red-500 block truncate max-w-[170px] mt-0.5" title={job.error_message}>
                                                                    {job.error_message}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReprint(job.id)}
                                                        title="Send to printer again"
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(job.id)}
                                                        title="Delete record"
                                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                             </td>
                                        </tr>
                                    );
                                })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default function QrPrintIndex(props) {
    return (
        <ErrorBoundary>
            <QrPrintDashboard {...props} />
        </ErrorBoundary>
    );
}
