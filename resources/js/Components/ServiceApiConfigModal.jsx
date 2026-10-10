import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ServiceApiConfigModal({ isOpen, onClose, service }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [configData, setConfigData] = useState(null);
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isOpen || !service) {
            setError(null);
            setSuccessMsg(null);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        axios
            .get('/admin/service-api-config', {
                params: {
                    service_slug: service.slug || '',
                    module_key: service.module_key || '',
                    service_id: service.id || '',
                    name: service.name || '',
                },
            })
            .then((res) => {
                if (res.data?.success) {
                    setConfigData(res.data);
                    setApiKey(res.data.api_key || '');
                } else {
                    setError(res.data?.message || 'API सेटिंग्स लोड नहीं हो सकीं।');
                }
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'API सेटिंग्स लोड करने में समस्या आई।');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [isOpen, service?.slug, service?.module_key, service?.id]);

    if (!isOpen || !service) return null;

    const handlePaste = async () => {
        try {
            if (navigator?.clipboard?.readText) {
                const text = await navigator.clipboard.readText();
                if (text) {
                    setApiKey(text.trim());
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }
            }
        } catch (e) {
            // Clipboard read permission might not be granted
        }
    };

    const handleSetDefault = () => {
        if (configData?.api_key_default) {
            setApiKey(configData.api_key_default);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMsg(null);

        axios
            .post('/admin/service-api-config', {
                service_slug: service.slug || '',
                module_key: service.module_key || '',
                service_id: service.id || '',
                api_key: apiKey,
            })
            .then((res) => {
                if (res.data?.success) {
                    setSuccessMsg(res.data.message || 'API Key सफलतापूर्वक सेव हो गई! यह सर्विस अब चालू है।');
                    setTimeout(() => {
                        onClose();
                    }, 1400);
                } else {
                    setError(res.data?.message || 'API Key सेव नहीं हो सकी।');
                }
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'API Key सेव करने में समस्या आई।');
            })
            .finally(() => {
                setSaving(false);
            });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Dialog */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-600/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[22px]">key</span>
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                                    {configData?.name || service.name}
                                </h3>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase tracking-wider">
                                    Admin API Key
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                Provider: <span className="font-semibold text-slate-700 dark:text-slate-300">{configData?.provider || 'Service Gateway'}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                        title="बंद करें"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">
                    {/* Notice / Reassurance */}
                    <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                        <span className="material-symbols-outlined text-[19px] text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                            verified
                        </span>
                        <div className="flex-1 leading-relaxed">
                            बस अपनी <strong>API Key</strong> यहाँ डालें और <strong>"सेव करें"</strong> पर क्लिक करें। यह सर्विस तुरंत इस Key के साथ चालू हो जाएगी।
                        </div>
                    </div>

                    {/* Success Banner */}
                    {successMsg && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-in fade-in">
                            <span className="material-symbols-outlined text-[18px] text-emerald-600">
                                check_circle
                            </span>
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Error Banner */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-2xl flex items-center gap-2 text-xs font-bold text-red-800 dark:text-red-300 animate-in fade-in">
                            <span className="material-symbols-outlined text-[18px] text-red-600">
                                error
                            </span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-semibold">API Key लोड हो रही है...</span>
                        </div>
                    ) : (
                        <form id="single-api-key-form" onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <label className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-amber-600">vpn_key</span>
                                        <span>API Key</span>
                                    </label>

                                    <div className="flex items-center gap-2">
                                        {configData?.api_key_default && (
                                            <button
                                                type="button"
                                                onClick={handleSetDefault}
                                                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                                                title="डिफ़ॉल्ट API Key भरें"
                                            >
                                                डिफ़ॉल्ट Key भरें
                                            </button>
                                        )}
                                        {apiKey && (
                                            <button
                                                type="button"
                                                onClick={() => setApiKey('')}
                                                className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                                                title="Clear"
                                            >
                                                साफ़ करें
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showKey ? 'text' : 'password'}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="अपनी API Key यहाँ पेस्ट करें..."
                                        autoFocus
                                        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all pr-24 shadow-xs"
                                    />

                                    {/* Action buttons inside input: Paste & Show/Hide */}
                                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={handlePaste}
                                            className="px-2 py-1 text-[10px] font-black rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                                            title="Clipboard से पेस्ट करें"
                                        >
                                            {copied ? '✓ Pasted' : 'Paste'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowKey(!showKey)}
                                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                            title={showKey ? 'Hide' : 'Show'}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                {showKey ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                    >
                        रद्द करें
                    </button>

                    <button
                        type="submit"
                        form="single-api-key-form"
                        disabled={loading || saving}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                <span>सेव हो रहा है...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                <span>API Key सेव करें</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
