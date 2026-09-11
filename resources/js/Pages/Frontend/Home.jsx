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
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedServiceForModal, setSelectedServiceForModal] = useState(null);

    const isLoggedIn = Boolean(auth?.user);

    // Filter services
    const filteredServices = services.filter((service) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch = query === '' ||
            (service.name && service.name.toLowerCase().includes(query)) ||
            (service.description && service.description.toLowerCase().includes(query)) ||
            (service.slug && service.slug.toLowerCase().includes(query));

        return matchesSearch && matchesCategory(service, activeTab);
    });

    const getCategoryCount = (catId) => {
        return services.filter(service => matchesCategory(service, catId)).length;
    };

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
                            ⚡ {services.length}+ Live Services Ready in Portal
                        </div>
                        
                        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6 leading-tight tracking-tight">
                            Digital Citizen & Government Services, <br className="hidden md:block" />
                            <span className="text-secondary bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Fast, Direct & Secured
                            </span>
                        </h1>
                        
                        <p className="mt-3 max-w-2xl font-body-lg text-body-lg text-on-surface-variant mx-auto mb-8 leading-relaxed">
                            Unified portal for PAN Cards, Aadhaar PVC, Driving Licence, Vehicle RC, Haryana Domicile, Marriage Registration, and 20+ utility services.
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
                                Browse All Services ({services.length})
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

                        {/* Search & Category Tabs */}
                        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none mb-10">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                {/* Search input */}
                                <div className="relative w-full md:w-80">
                                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
                                        search
                                    </span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search any service..."
                                        className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* Quick count status */}
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
                                    Showing <span className="font-bold text-slate-900 dark:text-white">{filteredServices.length}</span> of {services.length} services
                                </div>
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-4 scrollbar-none">
                                {CATEGORIES.map((cat) => {
                                    const count = getCategoryCount(cat.id);
                                    const isActive = activeTab === cat.id;

                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setActiveTab(cat.id)}
                                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer select-none ${
                                                isActive
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 -translate-y-0.5 scale-[1.02]'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            <span>{cat.icon}</span>
                                            <span>{cat.label}</span>
                                            <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                                                isActive
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                            }`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3D Services Grid */}
                        {filteredServices.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredServices.map((service) => (
                                    <div
                                        key={service.id}
                                        onClick={() => handleServiceClick(service)}
                                        className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 border-b-[5px] border-b-slate-300 dark:border-b-slate-700 hover:border-b-blue-600 dark:hover:border-b-blue-500 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.07)] hover:shadow-[0_22px_40px_-10px_rgba(37,99,235,0.25)] hover:-translate-y-2 hover:scale-[1.01] transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                                        style={{ perspective: '1000px' }}
                                    >
                                        {/* Top row: Logo/Icon & Badges */}
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                {/* 3D Embossed Logo Box */}
                                                <div className="w-13 h-13 rounded-2xl p-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-inner flex items-center justify-center group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300 flex-shrink-0">
                                                    {service.logo_url ? (
                                                        <img
                                                            src={service.logo_url}
                                                            alt={service.name}
                                                            className="w-9 h-9 object-cover rounded-xl"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl leading-none select-none">
                                                            {service.icon || '📄'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Badges Container */}
                                                <div className="flex flex-col items-end gap-1.5">
                                                    {service.is_new && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-xs flex items-center gap-1 animate-pulse">
                                                            <span>🔥</span>
                                                            <span>NEW</span>
                                                        </span>
                                                    )}
                                                    {service.is_free ? (
                                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                            FREE
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                                            <span>🪙</span>
                                                            <span>{service.coin_cost} Coins</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Service Title */}
                                            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-1.5">
                                                {service.name}
                                            </h3>

                                            {/* Service Description */}
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                                                {service.description || 'Verified citizen & digital government documentation service.'}
                                            </p>
                                        </div>

                                        {/* Bottom Action Area (3D Button Look) */}
                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                            {isLoggedIn ? (
                                                <div className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold border-b-2 border-blue-800 shadow-sm transition-all group-hover:shadow-md">
                                                    <span>Open Service</span>
                                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                </div>
                                            ) : (
                                                <div className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-xs font-semibold border border-slate-200 dark:border-slate-700 group-hover:border-blue-300 transition-all">
                                                    <span className="material-symbols-outlined text-sm">lock</span>
                                                    <span>Login to Use</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                                <span className="text-5xl mb-4 block">🔍</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    No services found matching "{searchQuery}"
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                                    Try clearing your search or switching to another category tab to view other available services.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setActiveTab('all');
                                    }}
                                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md hover:bg-blue-700 transition"
                                >
                                    Reset Filters & View All
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
