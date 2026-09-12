import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import FrontendLayout from '../../Layouts/FrontendLayout';

const CATEGORIES = [
    { id: 'all', label: 'All Services', icon: '📋' },
    { id: 'new', label: 'New Services', icon: '🔥' },
    { id: 'pan', label: 'PAN Card', icon: '💳' },
    { id: 'aadhaar', label: 'Aadhaar', icon: '🆔' },
    { id: 'dl', label: 'DL (Licence)', icon: '🚗' },
    { id: 'rc', label: 'RC (Vehicle)', icon: '🚙' },
    { id: 'pvc', label: 'PVC Cards', icon: '🪪' },
    { id: 'certificates', label: 'Certificates & Print', icon: '📜' },
];

const matchesCategory = (service, catId) => {
    if (catId === 'all') return true;
    if (catId === 'new') return Boolean(service.is_new);

    const text = `${service.name || ''} ${service.slug || ''} ${service.description || ''} ${service.kind || ''}`.toLowerCase();

    if (catId === 'pan') {
        return text.includes('pan');
    }
    if (catId === 'aadhaar') {
        return text.includes('aadhar') || text.includes('aadhaar') || text.includes('uid');
    }
    if (catId === 'dl') {
        return text.includes('driving') || text.includes('licence') || text.includes('license') || text.includes(' dl') || text.includes('-dl-') || text.includes('dl ');
    }
    if (catId === 'rc') {
        return text.includes('vehicle') || text.includes('rc ') || text.includes(' rc') || text.includes('(rc)') || text.includes('vahan');
    }
    if (catId === 'pvc') {
        return text.includes('pvc') || text.includes('card maker') || (text.includes('card') && !text.includes('pan-card'));
    }
    if (catId === 'certificates') {
        return text.includes('print') || text.includes('certificate') || text.includes('marriage') || 
               text.includes('birth') || text.includes('domicile') || text.includes('saral') || 
               text.includes('bill') || text.includes('electricity') || text.includes('passport') ||
               text.includes('passbook');
    }
    return true;
};

export default function Home({ services = [] }) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('all');
    const [selectedServiceForModal, setSelectedServiceForModal] = useState(null);

    const isLoggedIn = Boolean(auth?.user);

    // Filter services by active category tab
    const filteredServices = services.filter((service) => matchesCategory(service, activeTab));

    const handleServiceClick = (service) => {
        if (!isLoggedIn) {
            setSelectedServiceForModal(service);
            return;
        }

        // If logged in, navigate to target url
        if (service.url) {
            window.location.href = service.url;
        } else {
            window.location.href = '/dashboard#services';
        }
    };

    return (
        <FrontendLayout>
            <div className="bg-background min-h-screen">
                <Head>
                    <title>CertifyIndia - Digital Citizen Services Portal</title>
                    <meta name="description" content="All-in-one portal for digital citizen services: PAN Card, Aadhaar, Driving Licence, RC, Domicile & Certificates." />
                </Head>

                {/* Hero Section */}
                <div className="relative pt-12 pb-16 sm:pt-20 sm:pb-20 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary-fixed/30 rounded-full blur-3xl opacity-70"></div>
                        <div className="absolute top-40 -left-20 w-[500px] h-[500px] bg-secondary-fixed/30 rounded-full blur-3xl opacity-60"></div>
                    </div>
                    
                    <div className="relative z-10 max-w-[1280px] mx-auto px-6 text-center mt-6">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-xs sm:text-sm mb-6 shadow-sm">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                            ⚡ Verified Government & Citizen Services Portal
                        </div>
                        
                        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6 leading-tight tracking-tight">
                            Digital Citizen & Government Services, <br className="hidden md:block" />
                            <span className="text-secondary bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Fast, Direct & Secured
                            </span>
                        </h1>
                        
                        <p className="mt-3 max-w-2xl font-body-lg text-body-lg text-on-surface-variant mx-auto mb-8 leading-relaxed">
                            Unified portal for PAN Cards, PVC Cards, Driving Licence, Vehicle RC, Domicile Certificate, Marriage Registration, and utility services.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            {isLoggedIn ? (
                                <Link 
                                    href="/dashboard" 
                                    className="inline-flex items-center justify-center px-8 py-3.5 font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    Open My Dashboard
                                    <span className="material-symbols-outlined ml-2" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                                </Link>
                            ) : (
                                <>
                                    <Link 
                                        href="/login" 
                                        className="inline-flex items-center justify-center px-8 py-3.5 font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        Portal Login
                                        <span className="material-symbols-outlined ml-2" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
                                    </Link>
                                    <Link 
                                        href="/register" 
                                        className="inline-flex items-center justify-center px-8 py-3.5 font-bold rounded-xl text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-500 shadow-md hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        Register New Account
                                        <span className="material-symbols-outlined ml-2">person_add</span>
                                    </Link>
                                </>
                            )}
                            <a 
                                href="#services" 
                                className="inline-flex items-center justify-center px-7 py-3.5 font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300"
                            >
                                Browse All Services
                                <span className="material-symbols-outlined ml-2">expand_more</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 3D Services Showcase Section */}
                <div id="services" className="py-16 bg-surface-container-lowest relative z-10 border-t border-slate-200 dark:border-slate-800">
                    <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
                        
                        {/* Section Header */}
                        <div className="text-center max-w-3xl mx-auto mb-10">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                                <span>🌐</span> Portal Services Directory
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Explore All Available Services
                            </h2>
                            <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
                                Browse all active portal services. You can view full service details freely below; to run or submit any service, simply login with your account.
                            </p>
                        </div>

                        {/* Category Filter Pills (No search bar, no counts) */}
                        <div className="flex items-center justify-center flex-wrap gap-2.5 mb-10">
                            {CATEGORIES.map((cat) => {
                                const isActive = activeTab === cat.id;

                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setActiveTab(cat.id)}
                                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer select-none border ${
                                            isActive
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25 -translate-y-0.5'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm'
                                        }`}
                                    >
                                        <span>{cat.icon}</span>
                                        <span>{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* 3D Services Grid (Only Service Names & Icons) */}
                        {filteredServices.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                                {filteredServices.map((service) => (
                                    <div
                                        key={service.id}
                                        onClick={() => handleServiceClick(service)}
                                        className="relative bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 border-b-[5px] border-b-slate-300 dark:border-b-slate-700 hover:border-b-blue-600 dark:hover:border-b-blue-500 shadow-md hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group cursor-pointer flex flex-col items-center justify-between text-center min-h-[170px] sm:min-h-[190px]"
                                    >
                                        {/* Top Corner NEW Badge */}
                                        {service.is_new && (
                                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-xs animate-pulse">
                                                NEW
                                            </span>
                                        )}

                                        {/* 3D Embossed Logo/Icon Container */}
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-2.5 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-800 dark:to-slate-750 border border-slate-200/80 dark:border-slate-700 shadow-inner flex items-center justify-center group-hover:scale-110 group-hover:rotate-1 transition-transform duration-300 flex-shrink-0 mt-2">
                                            {service.logo_url ? (
                                                <img
                                                    src={service.logo_url}
                                                    alt={service.name}
                                                    className="w-10 h-10 sm:w-11 sm:h-11 object-cover rounded-xl"
                                                />
                                            ) : (
                                                <span className="text-3xl sm:text-4xl leading-none select-none">
                                                    {service.icon || '📄'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Only Service Name */}
                                        <div className="my-auto px-1">
                                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                                                {service.name}
                                            </h3>
                                        </div>

                                        {/* Subtle Status Indicator */}
                                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {isLoggedIn ? (
                                                <>
                                                    <span>Open</span>
                                                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-[13px]">lock</span>
                                                    <span>Login to Use</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                                <span className="text-5xl mb-4 block">📋</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    No services found in this category
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                                    Switch to "All Services" to view all available services in the portal.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('all')}
                                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md hover:bg-blue-700 transition cursor-pointer"
                                >
                                    View All Services
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3D Login Required Modal */}
                {selectedServiceForModal && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
                        onClick={() => setSelectedServiceForModal(null)}
                    >
                        <div 
                            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-b-[6px] border-b-blue-600 shadow-2xl p-6 sm:p-7 text-center transform transition-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                type="button"
                                onClick={() => setSelectedServiceForModal(null)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                                ✕
                            </button>

                            {/* Service Icon 3D Box */}
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-indigo-950/50 border border-blue-200 dark:border-indigo-900/60 shadow-lg flex items-center justify-center">
                                {selectedServiceForModal.logo_url ? (
                                    <img
                                        src={selectedServiceForModal.logo_url}
                                        alt=""
                                        className="w-11 h-11 rounded-xl object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl">
                                        {selectedServiceForModal.icon || '📄'}
                                    </span>
                                )}
                            </div>

                            {/* Modal Heading */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold mb-3">
                                <span>🔒</span> Login Required
                            </div>

                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                                {selectedServiceForModal.name}
                            </h3>

                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                                Yeh service use karne ke liye aapko portal me login karna hoga. Agar aapka account nahi hai to turant naya account banayein.
                            </p>

                            {/* 3D Action Buttons */}
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/login"
                                    className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/30 border-b-[3px] border-blue-800 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">login</span>
                                    <span>Login to Access Service</span>
                                </Link>

                                <Link
                                    href="/register"
                                    className="w-full py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-sm border border-slate-300 dark:border-slate-700 border-b-[3px] border-b-slate-400 dark:border-b-slate-600 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">person_add</span>
                                    <span>Register New Account</span>
                                </Link>
                            </div>

                            <div className="mt-4 text-[11px] text-slate-400">
                                100% Safe & Instant Activation • Bank Grade Security
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </FrontendLayout>
    );
}
