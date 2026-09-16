import React, { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Ayushman3LakhIncomeMake() {
    const [isLoading, setIsLoading] = useState(true);
    const [iframeKey, setIframeKey] = useState(Date.now());
    const iframeRef = useRef(null);

    const handleReload = () => {
        setIsLoading(true);
        setIframeKey(Date.now());
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Back to Dashboard"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight flex items-center gap-2">
                                <span>🏥</span>
                                <span>Ayushman 3Lakh Income Make</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                                Chirayu Ayushman Haryana (1.80L - 3.00L Annual Income Scheme)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleReload}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                            title="Refresh Portal"
                        >
                            <span className="material-symbols-outlined text-[16px]">refresh</span>
                            <span>Refresh</span>
                        </button>
                        <a
                            href="https://chirayuayushmanharyana.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                            <span>Open in New Tab</span>
                            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Ayushman 3Lakh Income Make - Chirayu Haryana" />

            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 space-y-4">
                {/* Guidelines Notice */}
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">ℹ️</span>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">
                                चिरायु आयुष्मान भारत योजना (Chirayu Ayushman 1.80L - 3.00L Scheme)
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                                जिन परिवारों की वार्षिक आय परिवार पहचान पत्र (PPP) में <strong>₹1.80 लाख से ₹3.00 लाख</strong> के बीच है, वे यहाँ से ₹1,500 वार्षिक प्रीमियम जमा करके आयुष्मान कार्ड बना सकते हैं।
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-bold text-xs shadow-xs">
                            ₹5 लाख तक मुफ्त इलाज
                        </span>
                    </div>
                </div>

                {/* Embedded Portal Container */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col relative min-h-[82vh]">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Loading Chirayu Ayushman Portal...
                            </p>
                        </div>
                    )}

                    <iframe
                        key={iframeKey}
                        ref={iframeRef}
                        src="https://chirayuayushmanharyana.in/"
                        className="w-full flex-grow border-0 min-h-[82vh]"
                        title="Chirayu Ayushman Bharat Haryana"
                        onLoad={() => setIsLoading(false)}
                        allow="camera; microphone; geolocation; clipboard-read; clipboard-write"
                    ></iframe>
                </div>
            </div>
        </AdminLayout>
    );
}
