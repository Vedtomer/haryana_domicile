import React from 'react';

export default function TopDisclaimerTicker() {
    const disclaimerText = "Cafe Services is an independently operated private service provider and is not a Government website or Government affiliated organization. We do not represent any Government department, agency, or authority including UIDAI, Income Tax Department, Samagra Samajik Suraksha Mission, or any other Government body. Our platform only provides assistance, facilitation, and guidance services to users for applying and accessing various Government related services such as PAN Card, Aadhaar, Samagra ID, Ayushman Card, Voter ID, Driving License, Ration Card, Registration Certificate, etc. All official rights, logos, and trademarks belong to their respective Government departments. Users are strongly advised to visit the respective official Government websites for direct application and verification purposes. We charge a nominal service fee for providing guidance and support.";

    return (
        <div className="w-full bg-slate-900 text-slate-200 border-b border-amber-500/30 text-[11px] sm:text-xs py-1 px-2 overflow-hidden select-none z-50 relative shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center gap-2">
                <span className="shrink-0 inline-flex items-center gap-1 font-bold text-amber-400 uppercase tracking-wider text-[10px] sm:text-[11px] bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.5 rounded">
                    <span>⚠️</span> Disclaimer
                </span>
                <div className="flex-1 overflow-hidden">
                    <marquee
                        behavior="scroll"
                        direction="left"
                        scrollamount="5"
                        onMouseEnter={(e) => e.target.stop()}
                        onMouseLeave={(e) => e.target.start()}
                        className="font-medium text-slate-300 tracking-wide cursor-default block"
                    >
                        {disclaimerText}
                    </marquee>
                </div>
            </div>
        </div>
    );
}
