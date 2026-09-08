import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

// Notice active for 10 days: Sep 8, 2026 -> Sep 18, 2026 23:59:59 IST
const EXPIRY_TIMESTAMP = new Date('2026-09-18T23:59:59+05:30').getTime();

export default function ImportantNoticeBanner() {
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Auto-disable if 10 days have elapsed
        if (Date.now() > EXPIRY_TIMESTAMP) {
            return;
        }

        // Check if user dismissed it in this session
        const dismissed = sessionStorage.getItem('email_deletion_notice_dismissed');
        if (dismissed) {
            return;
        }

        setMounted(true);
        // Smooth slide-down animation from top after 400ms
        const enterTimer = setTimeout(() => {
            setVisible(true);
        }, 400);

        return () => clearTimeout(enterTimer);
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        sessionStorage.setItem('email_deletion_notice_dismissed', 'true');
        setTimeout(() => setMounted(false), 500);
    };

    if (!mounted || Date.now() > EXPIRY_TIMESTAMP) {
        return null;
    }

    return (
        <div className="fixed inset-x-0 top-0 z-[99999] flex justify-center px-3 sm:px-4 pointer-events-none">
            <div
                className={`w-full max-w-2xl mt-3 sm:mt-5 pointer-events-auto transform transition-all duration-500 ease-out ${
                    visible
                        ? 'translate-y-0 opacity-100 scale-100'
                        : '-translate-y-16 opacity-0 scale-95'
                }`}
            >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#0f172a] border-2 border-amber-500/60 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(245,158,11,0.25)] text-white p-4 sm:p-5">
                    
                    {/* Glowing Accent Bar on Top */}
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 animate-pulse"></div>

                    <div className="flex items-start gap-3 sm:gap-4">
                        {/* Warning Icon Badge */}
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex-shrink-0 flex items-center justify-center text-amber-400 shadow-inner">
                            <span className="material-symbols-outlined text-2xl sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                warning
                            </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="inline-block px-2 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 rounded-full font-sans">
                                    महत्वपूर्ण सूचना / Notice
                                </span>
                            </div>

                            <h3 className="text-sm sm:text-base font-extrabold text-amber-300 leading-snug">
                                जिस भी यूज़र की ID में Email नहीं थी, वह डिलीट कर दी गई है!
                            </h3>

                            <p className="text-xs sm:text-[13px] text-slate-200 mt-1 leading-relaxed">
                                सुरक्षा कारणों से जिन यूज़र्स के अकाउंट में Email Address लिंक नहीं था, उन्हें सिस्टम से हटा दिया गया है। कृपया अपनी वैध Email ID के साथ <strong className="text-white underline">नया रजिस्ट्रेशन</strong> करें।
                            </p>

                            <div className="flex flex-wrap items-center gap-2.5 mt-3">
                                <Link
                                    href="/register"
                                    onClick={handleDismiss}
                                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all shadow-md flex items-center gap-1.5"
                                >
                                    <span>नया रजिस्ट्रेशन करें (Register)</span>
                                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleDismiss}
                                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                                >
                                    ठीक है, समझ गया (Got it)
                                </button>
                            </div>
                        </div>

                        {/* Close 'X' Button */}
                        <button
                            type="button"
                            onClick={handleDismiss}
                            aria-label="Close Notice"
                            className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
