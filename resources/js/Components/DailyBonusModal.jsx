import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function DailyBonusModal() {
    const { dailyBonusAwarded, auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (dailyBonusAwarded) {
            const todayStr = new Date().toISOString().slice(0, 10);
            const key = `daily_bonus_seen_${auth?.user?.id}_${todayStr}`;
            if (!sessionStorage.getItem(key)) {
                setIsOpen(true);
                sessionStorage.setItem(key, 'true');
            }
        }
    }, [dailyBonusAwarded, auth?.user?.id]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-amber-300 dark:border-amber-700/60 text-center animate-in zoom-in-95 duration-300 relative">
                {/* Header Decoration */}
                <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-8 text-white relative overflow-hidden">
                    {/* Background sparkles */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/50 flex items-center justify-center shadow-xl animate-bounce">
                            <span className="material-symbols-outlined text-5xl text-yellow-100" style={{ fontVariationSettings: "'FILL' 1" }}>
                                monetization_on
                            </span>
                        </div>
                        <h2 className="text-2xl font-black mt-3 tracking-tight drop-shadow-sm">
                            +1 Free Coin!
                        </h2>
                        <span className="inline-block mt-1 px-3 py-1 bg-white/25 rounded-full text-xs font-extrabold uppercase tracking-widest text-amber-950">
                            दैनिक लॉगिन बोनस
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold leading-relaxed">
                        बधाई हो <strong>{auth?.user?.name || 'उपयोगकर्ता'}</strong>! आपको आज पोर्टल पर सक्रिय रहने के लिए <span className="text-amber-500 font-black">+1 फ्री कॉइन</span> मिला है।
                    </p>

                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            आपका कुल कॉइन बैलेंस:
                        </span>
                        <span className="text-lg font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                monetization_on
                            </span>
                            {auth?.user?.coins ?? 0}
                        </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                        रोजाना लॉगिन करें और हर दिन फ्री कॉइन प्राप्त करते रहें!
                    </p>

                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/30 text-sm transition-all transform active:scale-95 cursor-pointer"
                    >
                        धन्यवाद! जारी रखें
                    </button>
                </div>
            </div>
        </div>
    );
}
