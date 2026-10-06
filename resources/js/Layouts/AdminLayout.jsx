import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import Toast from '../Components/Toast';
import NotificationBell from '../Components/NotificationBell';
import WhatsAppButton from '../Components/WhatsAppButton';
import SwitchAccountModal from '../Components/SwitchAccountModal';
import UserChatWidget from '../Components/UserChatWidget';
import UserScreenShareListener from '../Components/UserScreenShareListener';
import TopDisclaimerTicker from '../Components/TopDisclaimerTicker';
import ReferralFloatingButton from '../Components/ReferralFloatingButton';
import ThemeToggle from '../Components/ThemeToggle';
import UserLocationTracker from '../Components/UserLocationTracker';
import BroadcastNoticeBanner from '../Components/BroadcastNoticeBanner';
import DailyBonusModal from '../Components/DailyBonusModal';
import { groupServicesByCategory } from '../Utils/serviceCategories';
import CategoryLogo from '../Components/CategoryLogo';
import ServiceWorkListDrawer from '../Components/ServiceWorkListDrawer';
import ServiceWorkListBar from '../Components/ServiceWorkListBar';

export default function AdminLayout({ header, children }) {
    const { auth, navServices = [], flash, switchAccount } = usePage().props;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [switchAccountModalOpen, setSwitchAccountModalOpen] = useState(false);
    const [workListDrawerOpen, setWorkListDrawerOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [dropdownOpen]);

    // Global Presence Heartbeat
    useEffect(() => {
        if (!auth?.user) return;
        const sendPing = () => {
            axios.post('/chat/heartbeat').catch(() => {});
        };
        sendPing();
        const timer = setInterval(sendPing, 45000);
        return () => clearInterval(timer);
    }, [auth?.user?.id]);

    const { url, props } = usePage();
    const isAllServices = url.includes('tab=services') || url === '/all-services' || url.startsWith('/all-services?');
    const isDashboard = (url === '/dashboard' || url.startsWith('/dashboard?')) && !isAllServices;
    const isAdmin = Boolean(
        auth?.user?.is_admin ||
        auth?.user?.is_staff ||
        auth?.user?.type === 'admin' ||
        auth?.user?.type === 'super_admin'
    );
    const showSpellingWarning = url.includes('/create') || url.includes('/edit') || url.includes('/utilities/');

    // Detect if current page is inside a specific service (utility, manual request, or module form)
    const currentServiceInfo = useMemo(() => {
        const nonServicePrefixes = [
            '/dashboard',
            '/admin/users',
            '/admin/services',
            '/admin/user-permissions',
            '/admin/coin-requests',
            '/admin/profile',
            '/admin/notices',
            '/admin/referrals',
            '/admin/payment-settings',
            '/admin/pdf-coordinates',
            '/admin/api-settings',
            '/admin/notifications',
            '/admin/reactivation-requests',
            '/admin/license-keys',
        ];
        if (nonServicePrefixes.some((p) => url === p || url.startsWith(p + '?') || url.startsWith(p + '/'))) {
            return null;
        }

        // 1. Manual service request create form
        if (url.startsWith('/admin/service-requests/create')) {
            try {
                const params = new URLSearchParams(window.location.search);
                const slug = params.get('service');
                if (slug) {
                    const match = navServices.find((s) => s.slug === slug);
                    if (match) return match;
                    const humanName = slug
                        .split('-')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ');
                    return { name: humanName, slug, id: null };
                }
            } catch (e) {}
            return { name: 'Service Request', slug: 'service-request', id: null };
        }

        // 2. Utility pages (/utilities/...)
        if (url.startsWith('/utilities/')) {
            const cleanPath = url.split('?')[0];
            const match = navServices.find((s) => s.url && s.url.split('?')[0] === cleanPath);
            if (match) return match;
            const slug = cleanPath.replace('/utilities/', '').replace(/\//g, '');
            const bySlug = navServices.find((s) => s.slug === slug);
            if (bySlug) return bySlug;
            const humanName = slug
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
            return { name: humanName, slug, url: cleanPath, id: null };
        }

        // 3. Module services (e.g. /admin/haryana-domicile, /admin/marriage-forms, etc.)
        if (url.startsWith('/admin/')) {
            if (url === '/admin/service-requests' || url.startsWith('/admin/service-requests?')) {
                return null;
            }
            const match = navServices.find(
                (s) => s.module_key && s.url && url.startsWith(s.url.split('?')[0])
            );
            if (match) return match;
        }

        return null;
    }, [url, navServices]);

    // Real-time live clock (format: DD-MM-YYYY - hh:mm:ss AM/PM)
    const [currentTime, setCurrentTime] = useState('');
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const formattedHours = String(hours).padStart(2, '0');
            setCurrentTime(`${day}-${month}-${year} - ${formattedHours}:${minutes}:${seconds} ${ampm}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Group services into categories
    const groupedServices = useMemo(() => {
        return groupServicesByCategory(navServices);
    }, [navServices]);

    // Active category from URL query or categoryChange event
    const [activeCategory, setActiveCategory] = useState(() => {
        try {
            return new URLSearchParams(window.location.search).get('category') || null;
        } catch (e) {
            return null;
        }
    });

    useEffect(() => {
        const handleCat = (e) => setActiveCategory(e.detail);
        window.addEventListener('categoryChange', handleCat);
        return () => window.removeEventListener('categoryChange', handleCat);
    }, []);

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            setActiveCategory(params.get('category') || null);
        } catch (e) {}
    }, [url]);

    const handleDashboardClick = (e) => {
        setSidebarOpen(false);
        setActiveCategory(null);
        if (window.location.pathname === '/dashboard') {
            const currentUrl = new URL(window.location);
            currentUrl.searchParams.delete('category');
            window.history.pushState({}, '', currentUrl);
            window.dispatchEvent(new CustomEvent('categoryChange', { detail: null }));
        }
    };

    const handleCategoryClick = (catId) => {
        setActiveCategory(catId);
        setSidebarOpen(false);
        if (window.location.pathname === '/dashboard') {
            const currentUrl = new URL(window.location);
            currentUrl.searchParams.set('category', catId);
            window.history.pushState({}, '', currentUrl);
            window.dispatchEvent(new CustomEvent('categoryChange', { detail: catId }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            router.visit(`/dashboard?category=${catId}`);
        }
    };

    const NavItem = ({ href, icon, children }) => {
        const isActive = url.startsWith(href);
        return (
            <Link
                href={href}
                className={`flex items-center gap-3 px-3.5 py-2.5 mb-1 rounded-xl transition-all duration-200 font-medium text-xs sm:text-sm ${
                    isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/20 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
            >
                {icon}
                <span className="truncate">{children}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-[#f3f4f8] dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
            <Toast />

            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300 ${
                    sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Left Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-white dark:bg-[#0c1322] text-slate-700 dark:text-slate-300 flex flex-col shadow-xl lg:shadow-xs border-r border-slate-200 dark:border-slate-800/80`}
            >
                {/* Brand Header */}
                <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/70">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <img
                            src="/images/logo.png"
                            className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                            alt="CSP Jaankari"
                        />
                        <div className="flex flex-col justify-center">
                            <h2 className="text-xl font-black tracking-tight leading-none text-slate-800 dark:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                                CSP Jaankari
                            </h2>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mt-1">
                                Smart Portal
                            </span>
                        </div>
                    </Link>
                    <button
                        className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <span className="material-symbols-outlined text-[22px]">close</span>
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {/* 1. Dashboard Button */}
                    <Link
                        href="/dashboard"
                        onClick={() => setSidebarOpen(false)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 shadow-xs ${
                            isDashboard
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25 ring-2 ring-purple-400/30'
                                : 'bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800/80'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">laptop_mac</span>
                        <span>Dashboard</span>
                    </Link>

                    {/* 2. All Services Option (A-Z) */}
                    <Link
                        href="/dashboard?tab=services"
                        onClick={() => setSidebarOpen(false)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 shadow-xs ${
                            isAllServices
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-400/30'
                                : 'bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800/80'
                        }`}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="material-symbols-outlined text-[20px] text-blue-500">apps</span>
                            <span className="truncate">All Services</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            A-Z
                        </span>
                    </Link>

                    {/* 3. Add Money to Wallet */}
                    <Link
                        href="/wallet/add"
                        onClick={() => setSidebarOpen(false)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 shadow-xs ${
                            url.startsWith('/wallet/add')
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/30'
                                : 'bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800/80'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[20px] text-emerald-500">add_card</span>
                        <span>Add Money to Wallet</span>
                    </Link>

                    {/* My Account (Wallet Ledger & Profile) */}
                    <div className="pt-3 space-y-1">
                        <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            <span className="text-indigo-500 text-xs">👤</span>
                            <span>MY ACCOUNT</span>
                        </div>

                        <NavItem href="/admin/profile#coin-ledger" icon={<span className="material-symbols-outlined text-[19px]">history</span>}>
                            Wallet Ledger / Passbook
                        </NavItem>
                        <NavItem href="/admin/profile" icon={<span className="material-symbols-outlined text-[19px]">person</span>}>
                            My Profile &amp; Settings
                        </NavItem>
                    </div>
                </div>
            </aside>

            {/* Main Content Viewport */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopDisclaimerTicker />

                {/* Switch from Admin Banner */}
                {switchAccount?.is_switched_from_admin && (
                    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 px-4 py-2 text-xs flex items-center justify-between shadow-md z-40">
                        <div className="flex items-center gap-2 font-medium">
                            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                            <span>
                                Aap currently <strong>{auth?.user?.name}</strong> ki ID me switch hain (Logged as Admin{' '}
                                {switchAccount?.original_admin_name || 'Admin'})
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.post('/switch-account/back-to-admin')}
                            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                            <span className="material-symbols-outlined text-xs">undo</span>
                            Switch Back to Admin
                        </button>
                    </div>
                )}

                {/* Top Header Matching Screenshot */}
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-2xs h-16 flex items-center justify-between px-3 sm:px-6 z-30 relative transition-colors duration-200 gap-3">
                    {/* Left: Mobile hamburger & Page Header */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                        <button
                            className="lg:hidden p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-300 transition-colors"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open sidebar"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        {header && (
                            <div className="min-w-0 flex-1 truncate">
                                {header}
                            </div>
                        )}
                    </div>

                    {/* Right: Work History button, Live Clock, Wallet, Notifications, Profile, Settings */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {/* Service Work List quick button in header */}
                        {currentServiceInfo && (
                            <button
                                type="button"
                                onClick={() => setWorkListDrawerOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-black shadow-2xs transition-all cursor-pointer"
                                title="इस सर्विस में किए गए काम की लिस्ट देखें"
                            >
                                <span className="material-symbols-outlined text-[17px] text-blue-600 dark:text-blue-400">
                                    format_list_bulleted
                                </span>
                                <span className="hidden sm:inline">काम की लिस्ट</span>
                            </button>
                        )}
                        {/* Real-time Clock */}
                        {currentTime && (
                            <div className="hidden xl:flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                                {currentTime}
                            </div>
                        )}


                        {/* Dark Mode Toggle */}
                        <ThemeToggle variant="icon" />

                        {/* Notification Bell */}
                        <NotificationBell />

                        {/* Chat / Message Icon (opens chat widget) */}
                        <button
                            type="button"
                            onClick={() => {
                                const widgetBtn = document.getElementById('floating-chat-trigger-btn');
                                if (widgetBtn) widgetBtn.click();
                            }}
                            className="relative p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Messages / Support Chat"
                        >
                            <span className="material-symbols-outlined text-[22px]">chat_bubble_outline</span>
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                                0
                            </span>
                        </button>

                        {/* Profile Avatar & Dropdown */}
                        <div ref={dropdownRef} className="relative z-50">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="inline-flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
                                title="Profile Menu"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs border-2 border-white dark:border-slate-800">
                                    {(auth?.user?.name || 'S').charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden sm:inline font-bold tracking-tight text-slate-700 dark:text-slate-200">
                                    {auth?.user?.name || 'User'}
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            <div
                                className={`absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl py-2 border border-slate-100 dark:border-slate-800 z-50 transform origin-top-right transition-all duration-200 ease-out ${
                                    dropdownOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible pointer-events-none'
                                }`}
                            >
                                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                        {auth?.user?.name}
                                    </p>
                                    <p className="text-[11px] text-slate-400 truncate">{auth?.user?.email}</p>
                                </div>
                                <Link
                                    href="/admin/profile"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">account_circle</span>
                                    <span>My Profile</span>
                                </Link>
                                <Link
                                    href="/admin/service-requests"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px] text-emerald-500">
                                            {isAdmin ? 'assignment_turned_in' : 'receipt_long'}
                                        </span>
                                        <span>{isAdmin ? 'All Service Requests' : 'My Requests'}</span>
                                    </div>
                                    {pendingRequestsCount > 0 && (
                                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">
                                            {pendingRequestsCount}
                                        </span>
                                    )}
                                </Link>
                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            setSwitchAccountModalOpen(true);
                                        }}
                                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                                            switch_account
                                        </span>
                                        <span>Switch Account</span>
                                    </button>
                                )}
                                <Link
                                    href="/admin/profile#coin-ledger"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px] text-amber-500">monetization_on</span>
                                    <span>Coin Ledger</span>
                                </Link>
                                {isAdmin && (
                                    <>
                                        <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                                        <Link
                                            href="/admin/payment-settings"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                                            <span>QR Settings</span>
                                        </Link>
                                        <Link
                                            href="/admin/pdf-coordinates"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">straighten</span>
                                            <span>PDF Coordinates</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Blue Quick Settings Gear Button */}
                        <Link
                            href="/admin/profile"
                            className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                            title="Settings & Profile"
                        >
                            <span className="material-symbols-outlined text-[20px]">settings</span>
                        </Link>

                        {/* Quick Logout Button */}
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/30 transition-all cursor-pointer"
                            title="Logout"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                        </Link>
                    </div>
                </header>

                {/* Main Body */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200">
                    <div className="max-w-7xl mx-auto">
                        <BroadcastNoticeBanner />
                    </div>

                    {/* Service Work History Top Option Bar */}
                    {currentServiceInfo && (
                        <div className="max-w-6xl mx-auto">
                            <ServiceWorkListBar
                                service={currentServiceInfo}
                                onOpenDrawer={() => setWorkListDrawerOpen(true)}
                            />
                        </div>
                    )}

                    {showSpellingWarning && (
                        <div className="mb-6 max-w-6xl mx-auto bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl overflow-hidden flex items-center shadow-xs">
                            <div className="px-3 py-2 bg-red-600 text-white font-bold flex items-center gap-2 z-10 shrink-0">
                                <span className="material-symbols-outlined text-sm">warning</span>
                                Alert
                            </div>
                            <div className="flex-1 overflow-hidden relative flex items-center">
                                <div className="animate-marquee-rtl whitespace-nowrap text-red-700 dark:text-red-400 font-bold px-4 py-2 text-lg">
                                    सभी डिटेल्स सही सही भरे With Spelling ✅🙏
                                </div>
                            </div>
                        </div>
                    )}

                    {children}
                </main>
            </div>

            <SwitchAccountModal
                isOpen={switchAccountModalOpen}
                onClose={() => setSwitchAccountModalOpen(false)}
            />

            <DailyBonusModal />
            <WhatsAppButton />
            <ReferralFloatingButton />
            <UserChatWidget user={auth?.user} />
            <UserScreenShareListener user={auth?.user} />
            <UserLocationTracker user={auth?.user} />

            {/* Service Work List Drawer */}
            {currentServiceInfo && (
                <ServiceWorkListDrawer
                    isOpen={workListDrawerOpen}
                    onClose={() => setWorkListDrawerOpen(false)}
                    service={currentServiceInfo}
                />
            )}
        </div>
    );
}
