import React, { useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';

const TYPE_STYLES = {
    info: {
        bg: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-blue-500/20',
        badge: 'bg-white/20 text-white',
        icon: 'info',
        border: 'border-blue-400/30',
    },
    warning: {
        bg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/20',
        badge: 'bg-white/20 text-white',
        icon: 'warning',
        border: 'border-amber-400/30',
    },
    success: {
        bg: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-emerald-500/20',
        badge: 'bg-white/20 text-white',
        icon: 'check_circle',
        border: 'border-emerald-400/30',
    },
    danger: {
        bg: 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white shadow-rose-500/20',
        badge: 'bg-white/20 text-white',
        icon: 'error',
        border: 'border-rose-400/30',
    },
    offer: {
        bg: 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white shadow-purple-500/20',
        badge: 'bg-white/20 text-white',
        icon: 'local_offer',
        border: 'border-purple-400/30',
    },
};

export default function BroadcastNoticeBanner() {
    const { activeBroadcastNotices = [] } = usePage().props;
    const [dismissedIds, setDismissedIds] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem('dismissed_notices') || '[]');
        } catch (e) {
            return [];
        }
    });

    if (!activeBroadcastNotices || activeBroadcastNotices.length === 0) {
        return null;
    }

    const visibleNotices = activeBroadcastNotices.filter(n => !dismissedIds.includes(n.id));
    if (visibleNotices.length === 0) return null;

    const handleDismiss = (id) => {
        const next = [...dismissedIds, id];
        setDismissedIds(next);
        try {
            sessionStorage.setItem('dismissed_notices', JSON.stringify(next));
        } catch (e) {}
    };

    return (
        <div className="w-full space-y-2 mb-4">
            {visibleNotices.map((notice) => {
                const style = TYPE_STYLES[notice.type] || TYPE_STYLES.info;

                if (notice.show_as_popup) {
                    return (
                        <div key={notice.id} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                                <div className={`h-2 absolute top-0 left-0 right-0 ${style.bg}`}></div>
                                <div className="flex items-start gap-4 mt-2">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${style.bg}`}>
                                        <span className="material-symbols-outlined text-2xl text-white">{style.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 ${
                                            notice.type === 'offer' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                                            notice.type === 'danger' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                                            notice.type === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                                            notice.type === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                                            'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                        }`}>
                                            {notice.type.toUpperCase()}
                                        </span>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2">
                                            {notice.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed mb-4">
                                            {notice.content}
                                        </p>

                                        <div className="flex items-center gap-3">
                                            {notice.button_text && notice.button_link && (
                                                <a
                                                    href={notice.button_link}
                                                    className={`px-4 py-2 text-xs font-bold rounded-xl shadow-md transition-all hover:opacity-90 ${style.bg}`}
                                                >
                                                    {notice.button_text}
                                                </a>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleDismiss(notice.id)}
                                                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-colors"
                                            >
                                                Got it, Dismiss
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDismiss(notice.id)}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                }

                return (
                    <div
                        key={notice.id}
                        className={`rounded-2xl p-4 shadow-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-300 ${style.bg} ${style.border}`}
                    >
                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0 shadow-inner">
                                <span className="material-symbols-outlined text-xl text-white">{style.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white">
                                        {notice.type}
                                    </span>
                                    <h4 className="font-bold text-sm text-white truncate drop-shadow-xs">
                                        {notice.title}
                                    </h4>
                                </div>
                                <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
                                    {notice.content}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {notice.button_text && notice.button_link && (
                                <a
                                    href={notice.button_link}
                                    className="px-3.5 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-md hover:bg-white/90 transition-all hover:scale-105"
                                >
                                    {notice.button_text}
                                </a>
                            )}
                            <button
                                type="button"
                                onClick={() => handleDismiss(notice.id)}
                                title="Dismiss notice"
                                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
