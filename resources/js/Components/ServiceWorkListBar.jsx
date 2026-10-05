import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';

export default function ServiceWorkListBar({ service, onOpenDrawer }) {
    const [count, setCount] = useState(null);
    const [fullUrl, setFullUrl] = useState('/admin/service-requests');

    useEffect(() => {
        if (!service) return;
        let isMounted = true;
        axios
            .get('/admin/service-work-history', {
                params: {
                    service_id: service.id || '',
                    service_slug: service.slug || '',
                    service_name: service.name || '',
                    module_key: service.module_key || '',
                    limit: 1,
                },
            })
            .then((res) => {
                if (isMounted && res.data.success) {
                    setCount(res.data.total_count ?? 0);
                    if (res.data.full_url) {
                        setFullUrl(res.data.full_url);
                    }
                }
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, [service?.id, service?.slug, service?.module_key]);

    if (!service) return null;

    return (
        <div className="mb-5 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 dark:from-slate-900/90 dark:via-indigo-950/30 dark:to-slate-900/90 border border-blue-200/70 dark:border-indigo-900/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all">
            {/* Left: Service info & description */}
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white dark:bg-slate-800 border border-blue-200/60 dark:border-slate-700 shadow-xs flex items-center justify-center font-bold text-xl flex-shrink-0 text-blue-600 dark:text-blue-400">
                    📋
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                            {service.name}
                        </h3>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 uppercase tracking-wider">
                            Work Records
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        इस सर्विस में आपके द्वारा किए गए सभी पुराने कामों की लिस्ट और स्टेटस देखें
                    </p>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 self-stretch sm:self-auto">
                <button
                    type="button"
                    onClick={onOpenDrawer}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">list_alt</span>
                    <span>किए गए काम की लिस्ट</span>
                    {count !== null && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/25">
                            {count}
                        </span>
                    )}
                </button>

                <Link
                    href={fullUrl}
                    className="hidden md:inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs"
                    title="सभी ऑर्डर्स / रिक्वेस्ट्स फुल पेज में खोलें"
                >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    <span>फुल पेज</span>
                </Link>
            </div>
        </div>
    );
}
