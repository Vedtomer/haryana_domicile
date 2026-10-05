import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';

export default function ServiceWorkListDrawer({ isOpen, onClose, service }) {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [fullUrl, setFullUrl] = useState('/admin/service-requests');
    const [isModule, setIsModule] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedKey, setCopiedKey] = useState(null);

    // Fetch records when drawer opens or service changes
    const fetchHistory = async () => {
        if (!service) return;
        setLoading(true);
        try {
            const res = await axios.get('/admin/service-work-history', {
                params: {
                    service_id: service.id || '',
                    service_slug: service.slug || '',
                    service_name: service.name || '',
                    module_key: service.module_key || '',
                },
            });
            if (res.data.success) {
                setRecords(res.data.records || []);
                setTotalCount(res.data.total_count ?? (res.data.records || []).length);
                setFullUrl(res.data.full_url || '/admin/service-requests');
                setIsModule(Boolean(res.data.is_module));
            }
        } catch (err) {
            console.error('Failed to fetch service history', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, service?.id, service?.slug]);

    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const handleCopy = (text, key) => {
        if (!text) return;
        navigator.clipboard.writeText(String(text));
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    // Filtered records by search term
    const filteredRecords = useMemo(() => {
        if (!searchTerm.trim()) return records;
        const q = searchTerm.toLowerCase();
        return records.filter((r) => {
            if (String(r.id).includes(q)) return true;
            if (r.service_name && r.service_name.toLowerCase().includes(q)) return true;
            if (r.status_label && r.status_label.toLowerCase().includes(q)) return true;
            if (r.admin_response && r.admin_response.toLowerCase().includes(q)) return true;
            if (r.input_data && typeof r.input_data === 'object') {
                for (const val of Object.values(r.input_data)) {
                    if (val && String(val).toLowerCase().includes(q)) return true;
                }
            }
            return false;
        });
    }, [records, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide-over panel container */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md sm:max-w-xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-all transform ease-out duration-300">
                    
                    {/* Header */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-between shadow-md flex-shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center font-bold text-xl flex-shrink-0">
                                📋
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-extrabold text-base sm:text-lg leading-tight truncate">
                                    {service?.name || 'Service'}
                                </h3>
                                <p className="text-blue-100 text-xs font-medium flex items-center gap-1.5 mt-0.5">
                                    <span>किए गए काम की लिस्ट (Work History)</span>
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-300" />
                                    <span className="font-bold text-cyan-200">{totalCount} काम दर्ज</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                                type="button"
                                onClick={fetchHistory}
                                disabled={loading}
                                title="रिफ्रेश करें (Reload)"
                                className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>
                                    refresh
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                title="बंद करें (Close)"
                                className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[22px]">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Search & Stats Bar */}
                    <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-shrink-0">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                                search
                            </span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="खोजें: आधार, पैन, गाड़ी नं, नाम, आईडी..."
                                className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                            )}
                        </div>
                        <div className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 rounded-xl text-indigo-700 dark:text-indigo-300 text-xs font-bold flex-shrink-0 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                            <span>{filteredRecords.length} / {totalCount}</span>
                        </div>
                    </div>

                    {/* Records List Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loading && records.length === 0 ? (
                            <div className="py-16 text-center space-y-3">
                                <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    रिकॉर्ड्स लोड हो रहे हैं...
                                </p>
                            </div>
                        ) : filteredRecords.length === 0 ? (
                            <div className="py-16 px-4 text-center space-y-3">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-3xl">
                                    📂
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">
                                    {searchTerm ? 'कोई रिकॉर्ड नहीं मिला' : 'अभी तक कोई काम नहीं किया गया'}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                                    {searchTerm
                                        ? `"${searchTerm}" से संबंधित कोई रिकॉर्ड नहीं मिला। कृपया दूसरा शब्द खोजें।`
                                        : 'जब आप इस सर्विस में कोई फॉर्म भरेंगे या डेटा निकालेंगे, तो उसका पूरा रिकॉर्ड यहाँ दिखेगा।'}
                                </p>
                            </div>
                        ) : (
                            filteredRecords.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all space-y-2.5"
                                >
                                    {/* Top Row: ID, Date, Status */}
                                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-black">
                                                #{item.id}
                                            </span>
                                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[13px]">schedule</span>
                                                {item.created_at || item.created_ago}
                                            </span>
                                        </div>

                                        {/* Status badge */}
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                                                item.status === 'completed' || item.status === 'accepted'
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                    : item.status === 'rejected'
                                                    ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                            }`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                            {item.status_label || item.status}
                                        </span>
                                    </div>

                                    {/* Middle: Input Fields */}
                                    <div className="space-y-1.5">
                                        {item.input_data && typeof item.input_data === 'object' && Object.keys(item.input_data).length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                {Object.entries(item.input_data).map(([k, v]) => {
                                                    if (!v || typeof v === 'object') return null;
                                                    const copyKey = `${item.id}-${k}`;
                                                    const isCopied = copiedKey === copyKey;
                                                    return (
                                                        <div
                                                            key={k}
                                                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                                                        >
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                                    {String(k).replace(/_/g, ' ')}
                                                                </p>
                                                                <p className="font-mono font-bold text-slate-800 dark:text-slate-100 truncate text-xs mt-0.5">
                                                                    {String(v)}
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(v, copyKey)}
                                                                title="कॉपी करें"
                                                                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
                                                            >
                                                                <span className="material-symbols-outlined text-[15px]">
                                                                    {isCopied ? 'done' : 'content_copy'}
                                                                </span>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-500 italic">No input details</p>
                                        )}
                                    </div>

                                    {/* Admin Response Note if any */}
                                    {item.admin_response && (
                                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200">
                                            <span className="font-bold">Remarks: </span>
                                            {item.admin_response}
                                        </div>
                                    )}

                                    {/* Bottom: Coins & Quick Action Link */}
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                            {item.coins_charged > 0 ? (
                                                <>
                                                    <span className="text-amber-500 font-black">🪙</span>
                                                    <span>{item.coins_charged} Coins Deducted</span>
                                                </>
                                            ) : (
                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Free Service</span>
                                            )}
                                        </span>

                                        <div className="flex items-center gap-1.5">
                                            {item.print_url && (
                                                <a
                                                    href={item.print_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">print</span>
                                                    Print
                                                </a>
                                            )}
                                            {item.view_url && (
                                                <Link
                                                    href={item.view_url}
                                                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                                    Edit
                                                </Link>
                                            )}
                                            {!isModule && (
                                                <Link
                                                    href={`/admin/service-requests/${item.id}`}
                                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                    Details
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-shrink-0">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            कुल रिकॉर्ड्स: <strong>{totalCount}</strong>
                        </p>
                        <Link
                            href={fullUrl}
                            onClick={onClose}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/20 transition-all"
                        >
                            <span>फुल रिकॉर्ड्स पेज देखें</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
