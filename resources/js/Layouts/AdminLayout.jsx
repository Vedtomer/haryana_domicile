import React, { useState, useEffect, useMemo } from 'react';
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

export default function AdminLayout({ header, children }) {
    const { auth, navServices = [], flash, switchAccount } = usePage().props;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [switchAccountModalOpen, setSwitchAccountModalOpen] = useState(false);

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

    const { url } = usePage();
    const isAdmin = auth?.user?.type === 'admin' || auth?.user?.type === 'super_admin';
    const isDashboard = url === '/dashboard' || url.startsWith('/dashboard?');
    const showSpellingWarning = url.includes('/create') || url.includes('/edit') || url.includes('/utilities/');

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

    // Temporary Notepad persistent in localStorage
    const [notepadContent, setNotepadContent] = useState(() => {
        try {
            return localStorage.getItem('retailer_temp_notepad') || '';
        } catch (e) {
            return '';
        }
    });

    const handleNotepadChange = (e) => {
        const val = e.target.value;
        setNotepadContent(val);
        try {
            localStorage.setItem('retailer_temp_notepad', val);
        } catch (e) {}
    };

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

    const handleCategoryClick = (catId) => {
        setActiveCategory(catId);
        setSidebarOpen(false);
        if (window.location.pathname === '/dashboard') {
            const currentUrl = new URL(window.location);
            currentUrl.searchParams.set('category', catId);
            window.history.pushState({}, '', currentUrl);
            window.dispatchEvent(new CustomEvent('categoryChange', { detail: catId }));
            setTimeout(() => {
                const el = document.getElementById('services');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 80);
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
                <div className="flex-1 px-3 py-4 space-y-3 overflow-y-auto custom-scrollbar">
                    {/* Top Action 1: Dashboard Button */}
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

                    {/* Top Action 2: Add Wallet Instant */}
                    <Link
                        href="/admin/coin-requests"
                        onClick={() => setSidebarOpen(false)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm transition-all duration-200 shadow-md group cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-[20px] text-amber-400 group-hover:rotate-12 transition-transform">
                                account_balance_wallet
                            </span>
                            <span>Add Wallet</span>
                        </div>
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs animate-pulse">
                            INSTANT
                        </span>
                    </Link>

                    {/* Section Label: SERVICES */}
                    <div className="flex items-center gap-1.5 px-2 pt-2 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <span className="text-amber-500 text-xs">★</span>
                        <span>SERVICES</span>
                    </div>

                    {/* Categorized Services List (Click opens category services on the main screen) */}
                    <div className="space-y-1.5">
                        {groupedServices.map((g) => {
                            const isActive = activeCategory === g.category.id;

                            return (
                                <button
                                    key={g.category.id}
                                    type="button"
                                    onClick={() => handleCategoryClick(g.category.id)}
                                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group ${
                                        isActive
                                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500 shadow-xs ring-1 ring-indigo-400/30'
                                            : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div
                                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs ${g.category.avatarBg} group-hover:scale-105 transition-transform`}
                                        >
                                            <span className="material-symbols-outlined text-[19px]">
                                                {g.category.icon}
                                            </span>
                                        </div>
                                        <span
                                            className={`text-xs font-bold truncate transition-colors ${
                                                isActive
                                                    ? 'text-indigo-600 dark:text-indigo-400'
                                                    : 'text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                                            }`}
                                        >
                                            {g.category.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <span
                                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                                isActive
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            {g.services.length}
                                        </span>
                                        <span
                                            className={`material-symbols-outlined text-[17px] transition-transform ${
                                                isActive
                                                    ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5'
                                                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5'
                                            }`}
                                        >
                                            arrow_forward
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Admin Section */}
                    {isAdmin && (
                        <div className="pt-2">
                            <div className="flex items-center gap-1.5 px-2 mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                <span className="text-blue-500 text-xs">★</span>
                                <span>ADMINISTRATION</span>
                            </div>
                            <NavItem
                                href="/admin/users"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    </svg>
                                }
                            >
                                Manage Users
                            </NavItem>
                            <NavItem
                                href="/admin/user-permissions"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                }
                            >
                                User Permissions
                            </NavItem>
                            <NavItem
                                href="/admin/services"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                        />
                                    </svg>
                                }
                            >
                                Manage Services
                            </NavItem>
                            <NavItem
                                href="/admin/service-requests"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                        />
                                    </svg>
                                }
                            >
                                Service Requests
                            </NavItem>
                            <NavItem
                                href="/admin/coin-requests"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                }
                            >
                                Coin Requests
                            </NavItem>
                            <NavItem
                                href="/admin/referrals"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                                        />
                                    </svg>
                                }
                            >
                                Refer &amp; Earn
                            </NavItem>
                            <NavItem
                                href="/admin/notices"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                                        />
                                    </svg>
                                }
                            >
                                Broadcast Notices
                            </NavItem>
                        </div>
                    )}
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
                    {/* Left: Mobile hamburger & Temporary Notepad */}
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

                        {/* Temporary Notepad Input with Calendar Icon */}
                        <div className="relative max-w-xs sm:max-w-md w-full">
                            <input
                                type="text"
                                placeholder="Temporary Notepad..."
                                value={notepadContent}
                                onChange={handleNotepadChange}
                                className="w-full pl-3.5 pr-9 py-2 bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                title="Temporary Notepad (stores locally in your browser)"
                            />
                            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                                calendar_today
                            </span>
                        </div>
                    </div>

                    {/* Right: Live Clock, Wallet, Notifications, Profile, Settings */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {/* Real-time Clock */}
                        {currentTime && (
                            <div className="hidden xl:flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                                {currentTime}
                            </div>
                        )}

                        {/* Wallet Balance Pill */}
                        <Link
                            href="/admin/coin-requests"
                            className="flex items-center gap-1.5 bg-[#0f172a] hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                            title="Your wallet / coin balance. Click to recharge"
                        >
                            <span className="material-symbols-outlined text-[17px] text-amber-400">payments</span>
                            <span>₹{auth?.user?.coins ?? 0}</span>
                        </Link>

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
                        <div className="relative z-50">
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
                                    dropdownOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'
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
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">account_circle</span>
                                    <span>My Profile</span>
                                </Link>
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
                                <Link
                                    href="/admin/profile#coin-ledger"
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px] text-amber-500">monetization_on</span>
                                    <span>Coin Ledger</span>
                                </Link>
                                <Link
                                    href="/admin/coin-requests"
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px] text-emerald-500">add_card</span>
                                    <span>Add Wallet / Recharge</span>
                                </Link>
                                {isAdmin && (
                                    <>
                                        <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                                        <Link
                                            href="/admin/payment-settings"
                                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                                            <span>QR Settings</span>
                                        </Link>
                                        <Link
                                            href="/admin/pdf-coordinates"
                                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">straighten</span>
                                            <span>PDF Coordinates</span>
                                        </Link>
                                    </>
                                )}
                                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">logout</span>
                                    <span>Logout</span>
                                </Link>
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
                    </div>
                </header>

                {/* Main Body */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200">
                    <div className="max-w-7xl mx-auto">
                        <BroadcastNoticeBanner />
                    </div>

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

            {/* Click outside listener overlay for profile dropdown */}
            {dropdownOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            )}

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
        </div>
    );
}
