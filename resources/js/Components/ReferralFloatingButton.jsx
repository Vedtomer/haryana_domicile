import React, { useState, useEffect, useRef } from 'react';
import { usePage, Link } from '@inertiajs/react';

export default function ReferralFloatingButton() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [isOpen, setIsOpen] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const modalRef = useRef(null);

    const referralCode = user?.referral_code || '';
    const referralLink = user?.referral_link || (referralCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${referralCode}` : '');

    const handleCopyCode = () => {
        if (!referralCode) return;
        navigator.clipboard.writeText(referralCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleCopyLink = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target) && !e.target.closest('#referral-3d-button')) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const shareMessage = encodeURIComponent(
        `Namaste! CSP Jaankari portal join karein aur sabhi digital services (PAN Card, Aadhaar PVC, Driving Licence, Birth/Marriage Certificate, Passport Apply) ek hi jagah paayein.\n\nMere referral link se register karein:\n${referralLink}\n\nReferral Code: ${referralCode}`
    );

    return (
        <>
            {/* 3D Floating Gift Button — Fixed directly ABOVE the WhatsApp button */}
            <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end">
                <button
                    id="referral-3d-button"
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    title="Refer & Earn ₹10 per friend"
                    className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 text-amber-950 shadow-xl shadow-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/60 border-2 border-white/80 dark:border-amber-300/80 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group"
                    style={{
                        boxShadow: '0 10px 25px -3px rgba(245, 158, 11, 0.45), 0 4px 6px -2px rgba(245, 158, 11, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -2px 4px rgba(180, 83, 9, 0.4)'
                    }}
                >
                    {/* 3D Gift Box SVG Icon */}
                    <div className="relative transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
                        <svg 
                            viewBox="0 0 48 48" 
                            className="w-8 h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Gift Box Base */}
                            <rect x="8" y="20" width="32" height="22" rx="3" fill="#DC2626" />
                            {/* Box Shadow overlay */}
                            <rect x="8" y="20" width="16" height="22" rx="3" fill="#B91C1C" fillOpacity="0.4" />
                            
                            {/* Vertical Ribbon */}
                            <rect x="21" y="20" width="6" height="22" fill="#FDE047" />
                            <rect x="23" y="20" width="2" height="22" fill="#FEF08A" />

                            {/* Gift Box Lid */}
                            <rect x="6" y="14" width="36" height="8" rx="2" fill="#EF4444" />
                            <rect x="6" y="14" width="18" height="8" rx="2" fill="#DC2626" fillOpacity="0.4" />
                            {/* Lid Ribbon */}
                            <rect x="21" y="14" width="6" height="8" fill="#FDE047" />
                            <rect x="23" y="14" width="2" height="8" fill="#FEF08A" />

                            {/* Ribbon Bow */}
                            <path 
                                d="M24 14C21 8 13 8 15 13C16.5 16.5 22 14 24 14Z" 
                                fill="#FACC15" 
                                stroke="#CA8A04" 
                                strokeWidth="1.2" 
                            />
                            <path 
                                d="M24 14C27 8 35 8 33 13C31.5 16.5 26 14 24 14Z" 
                                fill="#FDE047" 
                                stroke="#CA8A04" 
                                strokeWidth="1.2" 
                            />
                            {/* Bow Center Knot */}
                            <circle cx="24" cy="14" r="2.5" fill="#EAB308" stroke="#A16207" strokeWidth="1" />
                        </svg>
                    </div>

                    {/* ₹10 3D Badge on Top-Left */}
                    <span className="absolute -top-1.5 -left-2 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-md border-2 border-white dark:border-slate-900 animate-pulse tracking-tight">
                        ₹10
                    </span>

                    {/* Subtle Ping Animation Ring */}
                    <span className="absolute inset-0 rounded-full bg-amber-400 opacity-20 animate-ping pointer-events-none" style={{ animationDuration: '3s' }}></span>
                </button>
            </div>

            {/* 3D Referral Card Popup Modal */}
            {isOpen && (
                <div 
                    ref={modalRef}
                    className="fixed bottom-42 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] max-w-full bg-white dark:bg-slate-900 border-2 border-amber-400/60 dark:border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                    style={{
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(245, 158, 11, 0.2)'
                    }}
                >
                    {/* Header with vibrant 3D gold gradient */}
                    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2.5">
                            <span className="text-2xl drop-shadow">🎁</span>
                            <div>
                                <h3 className="text-sm font-black tracking-tight leading-none text-white">
                                    Refer &amp; Earn ₹10
                                </h3>
                                <p className="text-[11px] text-amber-100 font-semibold mt-0.5">
                                    Har ₹200+ Recharge par 10 Coins
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4">
                        {user ? (
                            <>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Apne doston aur cyber cafe owners ko apna referral link share karein. Jab bhi wo pehli baar apni ID me <strong className="text-amber-600 dark:text-amber-400">₹200 ya usse zyada</strong> add karenge, aapko turant <strong className="text-emerald-600 dark:text-emerald-400">10 Coins (₹10)</strong> milenge!
                                </p>

                                {/* Referral Code Box */}
                                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60">
                                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                                        Aapka Referral Code
                                    </span>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono text-xl font-black text-slate-900 dark:text-white tracking-widest select-all">
                                            {referralCode || '—'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyCode}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer ${
                                                copiedCode 
                                                    ? 'bg-emerald-600 text-white' 
                                                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                                            }`}
                                        >
                                            {copiedCode ? '✓ Copied!' : 'Copy Code'}
                                        </button>
                                    </div>
                                </div>

                                {/* Single-use Link Box */}
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                                        Single-Use Invite Link
                                    </span>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate max-w-[200px] select-all">
                                            {referralLink || 'Generating...'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyLink}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                                                copiedLink 
                                                    ? 'bg-emerald-600 text-white' 
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                        >
                                            {copiedLink ? '✓ Copied!' : 'Copy Link'}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                                        🔒 Yeh link sirf 1 registration ke liye valid hai. Friend ke join hone par naya link automatically update ho jata hai.
                                    </p>
                                </div>

                                {/* Direct Share on WhatsApp Button */}
                                <a
                                    href={`https://wa.me/?text=${shareMessage}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                >
                                    <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white shrink-0">
                                        <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.34.653 4.527 1.787 6.393L4 29l7.79-1.75A11.94 11.94 0 0016.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm0 21.9c-1.98 0-3.833-.55-5.417-1.505l-.389-.23-4.62 1.038 1.06-4.502-.253-.402A9.86 9.86 0 016.1 15c0-5.467 4.443-9.9 9.904-9.9 5.462 0 9.904 4.433 9.904 9.9s-4.442 9.9-9.904 9.9zm5.44-7.41c-.298-.15-1.763-.87-2.037-.97-.273-.1-.472-.15-.67.15-.198.298-.767.97-.94 1.17-.174.198-.348.223-.646.075-.298-.15-1.258-.464-2.396-1.48-.886-.79-1.484-1.767-1.658-2.065-.174-.298-.019-.46.131-.61.135-.134.298-.348.447-.522.15-.174.199-.298.298-.497.1-.198.05-.372-.025-.522-.075-.15-.67-1.615-.917-2.212-.242-.582-.487-.503-.67-.512l-.57-.01c-.198 0-.522.075-.795.373-.273.298-1.04 1.017-1.04 2.48 0 1.464 1.065 2.878 1.213 3.076.15.199 2.096 3.2 5.078 4.488.71.306 1.263.489 1.694.626.712.227 1.36.195 1.873.118.571-.085 1.763-.72 2.012-1.416.248-.696.248-1.293.174-1.417-.075-.124-.273-.198-.571-.348z"/>
                                    </svg>
                                    <span>WhatsApp Par Share Karein</span>
                                </a>

                                {/* View Full Referral Dashboard Link */}
                                <div className="text-center pt-1 border-t border-slate-100 dark:border-slate-800">
                                    <Link
                                        href="/admin/referrals"
                                        onClick={() => setIsOpen(false)}
                                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                                    >
                                        <span>Total Earnings &amp; Referral History Dekhein</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    CSP Jaankari Refer &amp; Earn Program me hissa lein! Apne referral link se doston ko jodein aur har ₹200+ recharge par <strong>₹10 (10 Coins)</strong> instant reward paayein.
                                </p>
                                <div className="flex flex-col gap-2 pt-2">
                                    <Link
                                        href="/login"
                                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center shadow-sm"
                                    >
                                        Login to Get Referral Link
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs text-center hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        Register New Account
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
