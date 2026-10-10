import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ServiceApiConfigModal({ isOpen, onClose, service }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [configData, setConfigData] = useState(null);
    const [formData, setFormData] = useState({});
    const [showPasswords, setShowPasswords] = useState({});

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
                    setFormData(res.data.values || {});
                } else {
                    setError(res.data?.message || 'Failed to load configuration.');
                }
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Error fetching API settings.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [isOpen, service?.slug, service?.module_key, service?.id]);

    if (!isOpen || !service) return null;

    const handleInputChange = (key, val) => {
        setFormData((prev) => ({
            ...prev,
            [key]: val,
        }));
    };

    const togglePasswordVisibility = (key) => {
        setShowPasswords((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleResetDefaults = () => {
        if (!configData?.fields) return;
        const defaults = {};
        configData.fields.forEach((f) => {
            if (f.default !== undefined) {
                defaults[f.key] = f.default;
            }
        });
        setFormData((prev) => ({ ...prev, ...defaults }));
        setSuccessMsg('Defaults restored! Click Save to apply.');
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
                settings: formData,
            })
            .then((res) => {
                if (res.data?.success) {
                    setSuccessMsg(res.data.message || 'API settings updated successfully!');
                    setTimeout(() => {
                        // Optionally refresh or keep open with success state
                    }, 1500);
                } else {
                    setError(res.data?.message || 'Could not save settings.');
                }
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Failed to save API settings.');
            })
            .finally(() => {
                setSaving(false);
            });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Dialog */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[22px]">tune</span>
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                                    {configData?.name || service.name}
                                </h3>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase tracking-wider">
                                    Admin API Setup
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
                        title="Close"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                    {/* Help/Notice banner */}
                    {configData?.help && (
                        <div className="p-3 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
                            <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                                info
                            </span>
                            <div className="flex-1 leading-relaxed">
                                {configData.help.includes('http') ? (
                                    <>
                                        {configData.help.split('(')[0]}
                                        <a
                                            href={configData.help.match(/\((https?:\/\/[^\)]+)\)/)?.[1] || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-bold underline text-blue-600 dark:text-blue-400 hover:text-blue-800"
                                        >
                                            {configData.help.match(/\((https?:\/\/[^\)]+)\)/)?.[1] || 'API Dashboard'}
                                        </a>
                                    </>
                                ) : (
                                    configData.help
                                )}
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {successMsg && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            <span className="material-symbols-outlined text-[18px] text-emerald-600">
                                check_circle
                            </span>
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-2xl flex items-center gap-2 text-xs font-bold text-red-800 dark:text-red-300">
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
                            <span className="text-xs font-semibold">API सेटिंग्स लोड हो रही हैं...</span>
                        </div>
                    ) : (
                        <form id="service-api-config-form" onSubmit={handleSave} className="space-y-4">
                            {configData?.fields?.map((field) => {
                                const isPassword = field.type === 'password';
                                const isVisible = !!showPasswords[field.key];
                                const inputType = isPassword ? (isVisible ? 'text' : 'password') : 'text';

                                return (
                                    <div key={field.key} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <label className="font-bold text-slate-700 dark:text-slate-300">
                                                {field.label}
                                            </label>
                                            {field.default !== undefined && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleInputChange(field.key, field.default)}
                                                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                                    title="Set to default"
                                                >
                                                    Default भरें
                                                </button>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <input
                                                type={inputType}
                                                value={formData[field.key] ?? ''}
                                                onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                placeholder={field.placeholder || `Enter ${field.label}`}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all pr-10"
                                            />

                                            {isPassword && (
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility(field.key)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                                    title={isVisible ? 'Hide Key' : 'Show Key'}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        {isVisible ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </form>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        disabled={loading || saving}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                        <span>Reset Defaults</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            form="service-api-config-form"
                            disabled={loading || saving}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    <span>Save API Settings</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
