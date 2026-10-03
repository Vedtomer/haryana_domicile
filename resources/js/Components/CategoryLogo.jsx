import React from 'react';

export function CategorySvgLogo({ categoryId }) {
    switch (categoryId) {
        case 'aadhar':
            return (
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <circle cx="24" cy="24" r="22" fill="#FFF5ED" />
                    {/* Aadhaar Sunburst rays */}
                    <path
                        d="M24 6L25.8 11.2L31.2 7.8L30.2 13.3L36.3 12.2L32.8 16.7L39 18.5L33.7 22L39.8 25.8L33.7 27.6L38.2 32.2L31.8 32.2L34.5 37.8L28.2 36L29.1 41.5L24 37.8L18.9 41.5L19.8 36L13.5 37.8L16.2 32.2L9.8 32.2L14.3 27.6L8.2 25.8L14.3 22L9 18.5L15.2 16.7L11.7 12.2L17.8 13.3L16.8 7.8L22.2 11.2L24 6Z"
                        fill="#F35B25"
                        opacity="0.25"
                    />
                    {/* Aadhaar Fingerprint Pattern */}
                    <path
                        d="M24 10C16.8 10 11 15.8 11 23c0 3.5 1.4 6.8 3.8 9.2l1.4-1.4C14.2 28.8 13 26 13 23c0-6.1 4.9-11 11-11s11 4.9 11 11c0 3-.9 5.8-2.6 8.1l1.6 1.2c2.1-2.7 3-6 3-9.3 0-7.2-5.8-13-13-13z"
                        fill="#E32D28"
                    />
                    <path
                        d="M24 14c-5 0-9 4-9 9 0 2.5 1 4.8 2.6 6.4l1.4-1.4C17.7 26.7 17 24.9 17 23c0-3.9 3.1-7 7-7s7 3.1 7 7c0 1.9-.7 3.7-2 5l1.4 1.4c1.6-1.6 2.6-3.9 2.6-6.4 0-5-4-9-9-9z"
                        fill="#F35B25"
                    />
                    <path
                        d="M24 18c-2.8 0-5 2.2-5 5 0 1.4.6 2.6 1.5 3.5l1.4-1.4c-.6-.6-.9-1.3-.9-2.1 0-1.7 1.3-3 3-3s3 1.3 3 3c0 .8-.3 1.5-.9 2.1l1.4 1.4c.9-.9 1.5-2.1 1.5-3.5 0-2.8-2.2-5-5-5z"
                        fill="#F7941E"
                    />
                    <circle cx="24" cy="23" r="1.8" fill="#E32D28" />
                </svg>
            );

        case 'voter':
            return (
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <rect x="5" y="8" width="38" height="32" rx="6" fill="#1E3A8A" />
                    {/* Tricolor Header */}
                    <path d="M5 14C5 10.7 7.7 8 11 8H37C40.3 8 43 10.7 43 14V16H5V14Z" fill="#FF9933" />
                    <rect x="5" y="16" width="38" height="2" fill="#FFFFFF" />
                    <rect x="5" y="18" width="38" height="2" fill="#138808" />
                    {/* Photo Box */}
                    <rect x="9" y="23" width="10" height="12" rx="2" fill="#E2E8F0" />
                    <circle cx="14" cy="27" r="2.5" fill="#64748B" />
                    <path d="M10.5 34C10.5 32 12 30.5 14 30.5C16 30.5 17.5 32 17.5 34H10.5Z" fill="#64748B" />
                    {/* EPIC Text Lines */}
                    <rect x="22" y="24" width="16" height="2.5" rx="1" fill="#FFFFFF" />
                    <rect x="22" y="28.5" width="12" height="2" rx="1" fill="#93C5FD" />
                    <rect x="22" y="32.5" width="14" height="2" rx="1" fill="#93C5FD" />
                    {/* Green Tick Badge */}
                    <circle cx="37" cy="33" r="4.5" fill="#22C55E" />
                    <path d="M35 33L36.5 34.5L39.5 31.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );

        case 'pan':
            return (
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <rect x="4" y="9" width="40" height="30" rx="5" fill="#E0F2FE" />
                    {/* Income Tax Header */}
                    <rect x="4" y="9" width="40" height="8" rx="3" fill="#0284C7" />
                    <text x="24" y="15" fill="#FFFFFF" fontSize="3.8" fontWeight="900" textAnchor="middle" letterSpacing="0.4">
                        INCOME TAX
                    </text>
                    {/* Gold Microchip */}
                    <rect x="8" y="20" width="8" height="6" rx="1.5" fill="#F59E0B" stroke="#D97706" strokeWidth="0.6" />
                    <path d="M8 23H16M12 20V26" stroke="#D97706" strokeWidth="0.6" />
                    {/* Photo Box */}
                    <rect x="33" y="19" width="8" height="10" rx="1.5" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="0.5" />
                    <circle cx="37" cy="22.5" r="2" fill="#64748B" />
                    <path d="M34.5 28C34.5 26.5 35.5 25.5 37 25.5C38.5 25.5 39.5 26.5 39.5 28H34.5Z" fill="#64748B" />
                    {/* Lines */}
                    <rect x="8" y="28" width="18" height="2" rx="1" fill="#0F172A" />
                    <rect x="8" y="31.5" width="14" height="1.8" rx="0.9" fill="#334155" />
                    <rect x="8" y="34.8" width="22" height="1.8" rx="0.9" fill="#0284C7" />
                </svg>
            );

        case 'vehicle':
            return (
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <rect x="5" y="8" width="38" height="32" rx="6" fill="#0F172A" />
                    {/* Gold Top Trim */}
                    <rect x="5" y="8" width="38" height="4" rx="2" fill="#F59E0B" />
                    {/* Steering Wheel / Parivahan */}
                    <circle cx="24" cy="24" r="9.5" stroke="#38BDF8" strokeWidth="2.5" />
                    <circle cx="24" cy="24" r="3.5" fill="#38BDF8" />
                    <path
                        d="M24 14.5V20.5M14.5 24H20.5M33.5 24H27.5M17.5 30.5L21.5 26.5M30.5 30.5L26.5 26.5"
                        stroke="#38BDF8"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    {/* RC Tag */}
                    <rect x="17" y="33.5" width="14" height="4.5" rx="2" fill="#22C55E" />
                    <text x="24" y="37" fill="#FFFFFF" fontSize="3.2" fontWeight="900" textAnchor="middle">
                        RC • DL
                    </text>
                </svg>
            );

        case 'rasan':
            return (
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <rect x="5" y="8" width="38" height="32" rx="6" fill="#78350F" />
                    {/* NFSA Header */}
                    <rect x="5" y="8" width="38" height="8" rx="3" fill="#D97706" />
                    <text x="24" y="14" fill="#FFFFFF" fontSize="3.5" fontWeight="900" textAnchor="middle">
                        RATION • NFSA
                    </text>
                    {/* Wheat Stalks */}
                    <path
                        d="M24 18V36M24 20C21.5 19 20 21 20 22C22 22 24 21 24 20ZM24 24C21.5 23 20 25 20 26C22 26 24 25 24 24ZM24 28C21.5 27 20 29 20 30C22 30 24 29 24 28ZM24 20C26.5 19 28 21 28 22C26 22 24 21 24 20ZM24 24C26.5 23 28 25 28 26C26 26 24 25 24 24ZM24 28C26.5 27 28 29 28 30C26 30 24 29 24 28Z"
                        stroke="#F59E0B"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="#FEF3C7"
                    />
                </svg>
            );

        case 'marriage':
            return (
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <rect x="5" y="8" width="38" height="32" rx="6" fill="#831843" />
                    {/* Gold Top Header */}
                    <rect x="5" y="8" width="38" height="7" rx="3" fill="#BE185D" />
                    <text x="24" y="13.2" fill="#FDE047" fontSize="3.3" fontWeight="900" textAnchor="middle" letterSpacing="0.3">
                        MARRIAGE • CERT
                    </text>
                    {/* Interlocking Rings */}
                    <circle cx="20" cy="25" r="6" stroke="#FDE047" strokeWidth="2" fill="none" />
                    <circle cx="28" cy="25" r="6" stroke="#FBBF24" strokeWidth="2" fill="none" />
                    <path d="M20 19L21.5 21L23 19" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="28" cy="19" r="1.5" fill="#FFFFFF" />
                    {/* Certificate Base Trim */}
                    <rect x="12" y="33" width="24" height="2" rx="1" fill="#FBCFE8" />
                </svg>
            );

        case 'ppp':
        case 'rasan':
            return (
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <rect x="5" y="8" width="38" height="32" rx="6" fill="#0F172A" />
                    {/* Header */}
                    <rect x="5" y="8" width="38" height="7.5" rx="3" fill="#D97706" />
                    <text x="24" y="13.5" fill="#FFFFFF" fontSize="3.4" fontWeight="900" textAnchor="middle" letterSpacing="0.4">
                        FAMILY ID • PPP
                    </text>
                    {/* Family Silhouette (Father, Mother, Child) */}
                    <circle cx="19" cy="21" r="2.5" fill="#F59E0B" />
                    <path d="M15 28C15 25 17 24.5 19 24.5C21 24.5 23 25 23 28H15Z" fill="#F59E0B" />
                    <circle cx="29" cy="21" r="2.5" fill="#FBBF24" />
                    <path d="M25 28C25 25 27 24.5 29 24.5C31 24.5 33 25 33 28H25Z" fill="#FBBF24" />
                    <circle cx="24" cy="26" r="1.8" fill="#FFFFFF" />
                    <path d="M21 33C21 30.5 22.5 30 24 30C25.5 30 27 30.5 27 33H21Z" fill="#FFFFFF" />
                    {/* PPP Tag */}
                    <rect x="14" y="34.5" width="20" height="2" rx="1" fill="#D97706" />
                </svg>
            );

        case 'courier':
            return (
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <rect x="5" y="8" width="38" height="32" rx="6" fill="#431407" />
                    {/* Delivery Orange Banner */}
                    <rect x="5" y="8" width="38" height="7.5" rx="3" fill="#EA580C" />
                    <text x="24" y="13.5" fill="#FFFFFF" fontSize="3.3" fontWeight="900" textAnchor="middle" letterSpacing="0.3">
                        COURIER • PARCEL
                    </text>
                    {/* 3D Parcel Box */}
                    <path d="M24 18L33 22V31L24 35L15 31V22L24 18Z" fill="#D97706" stroke="#FDE047" strokeWidth="1" />
                    <path d="M24 18L33 22L24 26L15 22L24 18Z" fill="#F59E0B" />
                    <path d="M24 26V35" stroke="#78350F" strokeWidth="1.2" />
                    {/* Barcode on side of box */}
                    <rect x="26.5" y="27" width="1" height="4" fill="#FFFFFF" />
                    <rect x="28.5" y="27" width="1.5" height="4" fill="#FFFFFF" />
                    <rect x="31" y="27" width="0.8" height="4" fill="#FFFFFF" />
                </svg>
            );

        case 'health':
            return (
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <rect x="5" y="8" width="38" height="32" rx="6" fill="#064E3B" />
                    {/* Header */}
                    <rect x="5" y="8" width="38" height="7.5" rx="3" fill="#059669" />
                    <text x="24" y="13.5" fill="#FFFFFF" fontSize="3.3" fontWeight="900" textAnchor="middle" letterSpacing="0.4">
                        AYUSHMAN • HEALTH
                    </text>
                    {/* Medical Cross in Golden Shield */}
                    <circle cx="24" cy="26" r="9" fill="#10B981" stroke="#FDE047" strokeWidth="1.2" />
                    <rect x="22" y="20.5" width="4" height="11" rx="1" fill="#FFFFFF" />
                    <rect x="18.5" y="24" width="11" height="4" rx="1" fill="#FFFFFF" />
                    {/* Bottom Ribbon */}
                    <rect x="16" y="34.5" width="16" height="2" rx="1" fill="#6EE7B7" />
                </svg>
            );

        case 'bills':
        case 'farmer':
            return (
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <rect x="5" y="8" width="38" height="32" rx="6" fill="#1E1B4B" />
                    {/* Header */}
                    <rect x="5" y="8" width="38" height="7.5" rx="3" fill="#3B82F6" />
                    <text x="24" y="13.5" fill="#FFFFFF" fontSize="3.3" fontWeight="900" textAnchor="middle" letterSpacing="0.3">
                        BIJLI • GOVT BILLS
                    </text>
                    {/* Electric Meter & Lightning */}
                    <circle cx="24" cy="26" r="8" fill="#1E293B" stroke="#60A5FA" strokeWidth="1.5" />
                    <path d="M24 20L21 26H25L23 31L28 25H24L25 20H24Z" fill="#FACC15" />
                    <rect x="15" y="34.5" width="18" height="2" rx="1" fill="#60A5FA" />
                </svg>
            );

        case 'certificates':
            return (
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <circle cx="24" cy="24" r="21" fill="#312E81" />
                    <circle cx="24" cy="24" r="18" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="2 2" />
                    {/* Lion Capital Emblem */}
                    <path
                        d="M24 9C21 9 20 11 20 13C19 13 17 14 17 16C17 18 19 19 20 19C19 21 20 24 21 25L20 28H28L27 25C28 24 29 21 28 19C29 19 31 18 31 16C31 14 29 13 28 13C28 11 27 9 24 9Z"
                        fill="#FDE047"
                    />
                    <circle cx="24" cy="32" r="3" stroke="#FDE047" strokeWidth="1" />
                    <circle cx="24" cy="32" r="0.8" fill="#FDE047" />
                    <path d="M16 37H32M18 39H30" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            );

        case 'utilities':
        default:
            return (
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <rect x="5" y="8" width="38" height="32" rx="8" fill="#0F172A" />
                    {/* Gears & Tools */}
                    <circle cx="24" cy="24" r="8" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="3 2" />
                    <circle cx="24" cy="24" r="3" fill="#38BDF8" />
                    <path d="M14 14L20 20M34 14L28 20M14 34L20 28M34 34L28 28" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            );
    }
}

export default function CategoryLogo({ category, services = [], size = 'w-9 h-9' }) {
    // 1. Look for uploaded logo among the services in this category
    const uploadedLogo = (services || []).find((s) => s.logo_url)?.logo_url;

    return (
        <div className="relative group/logo flex-shrink-0">
            {/* 3D ambient glow pulse */}
            <div
                className={`absolute -inset-0.5 rounded-xl bg-gradient-to-tr ${
                    category?.color || 'from-indigo-500 to-purple-500'
                } blur-xs opacity-50 group-hover:opacity-100 transition-opacity`}
            />

            {/* 3D Live Animated Container */}
            <div
                className={`relative ${size} rounded-xl p-1 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 border border-slate-200/90 dark:border-slate-700/80 shadow-[0_4px_10px_-2px_rgba(0,0,0,0.12),0_2px_4px_-1px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] animate-3d-live-logo group-hover:scale-110 transition-transform flex items-center justify-center overflow-hidden`}
            >
                {/* Continuous 3D gloss shine sweep */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent animate-3d-live-shine pointer-events-none" />

                {uploadedLogo ? (
                    <img
                        src={uploadedLogo}
                        alt={category?.name || ''}
                        className="w-full h-full object-contain rounded-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                    />
                ) : (
                    <CategorySvgLogo categoryId={category?.id} />
                )}
            </div>
        </div>
    );
}
