import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Toast from '../Components/Toast';
import NotificationBell from '../Components/NotificationBell';
import WhatsAppButton from '../Components/WhatsAppButton';
import ThemeToggle from '../Components/ThemeToggle';

export default function AdminLayout({ header, children }) {
    const { auth, navServices = [], flash } = usePage().props;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (flash?.login_voice) {
            const utterance = new SpeechSynthesisUtterance(flash.login_voice);
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            // Slight delay to ensure DOM is ready and audio is not blocked by browser autoplay rules
            setTimeout(() => {
                window.speechSynthesis.speak(utterance);
            }, 500);
        }
    }, [flash?.login_voice]);

    const { url } = usePage();
    const isDashboard = url === '/dashboard' || url.startsWith('/dashboard?');
    const isAdmin = auth?.user?.type === 'admin' || auth?.user?.type === 'super_admin';
    const showSidebar = !isDashboard && isAdmin;
    const showSpellingWarning = url.includes('/create') || url.includes('/edit') || url.includes('/utilities/');


    const NavItem = ({ href, icon, children }) => {
        const isActive = url.startsWith(href);
        return (
            <Link
                href={href}
                className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 font-medium ${
                    isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
            >
                {icon}
                <span>{children}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-slate-800">
            <Toast />
            
            {/* Sidebar — hidden on the dashboard itself, and hidden for regular users */}
            {showSidebar && (
            <>
                {/* Mobile Overlay */}
                <div 
                    className={`fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setSidebarOpen(false)}
                ></div>
                
                <div className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-[#0a1120] text-slate-300 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.15)] border-r border-slate-800/60`}>
                
                {/* Horizontal Logo */}
                <div className="p-6 flex items-center justify-between border-b border-slate-800/60 mb-6 bg-slate-900/30">
                    <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/images/logo.png" className="w-10 h-10 object-contain drop-shadow-sm" alt="CSP Jaankari Logo" />
                        <div className="flex flex-col justify-center">
                            <h2 className="text-2xl font-black tracking-tight leading-none text-white drop-shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                                CSP Jaankari
                            </h2>
                            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.2em] mt-1">Management Portal</span>
                        </div>
                    </Link>
                    <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pt-2">


                    {(auth?.user?.type === 'admin' || auth?.user?.type === 'super_admin') && (
                        <>
                            <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administration</div>
                            <NavItem href="/admin/users" icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            }>
                                Manage Users
                            </NavItem>
                            <NavItem href="/admin/user-permissions" icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            }>
                                User Permissions
                            </NavItem>
                            <NavItem href="/admin/services" icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            }>
                                Manage Services
                            </NavItem>
                            <NavItem href="/admin/service-requests" icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            }>
                                Service Requests
                            </NavItem>
                            <NavItem href="/admin/coin-requests" icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            }>
                                Coin Requests
                            </NavItem>
                        </>
                    )}
                </nav>
            </div>
            </>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white dark:bg-slate-900 dark:border-b dark:border-slate-800 shadow-sm h-16 flex items-center justify-between px-4 lg:px-8 z-10 relative">
                    
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                        {showSidebar && (
                            <button 
                                className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-blue-600 dark:text-slate-300 transition-colors"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                        )}

                        {!showSidebar && (
                            <Link href="/dashboard" className="flex items-center gap-2 mr-2 hover:opacity-80 transition-opacity">
                                <img src="/images/logo.png" className="w-8 h-8 flex-shrink-0 object-contain drop-shadow-sm" alt="CSP Jaankari Logo" />
                                <div className="hidden sm:flex flex-col justify-center">
                                    <h2 className="text-lg font-black tracking-tight leading-none text-slate-800 dark:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        CSP Jaankari
                                    </h2>
                                </div>
                            </Link>
                        )}

                        <div className={`truncate ${!showSidebar ? 'hidden sm:block border-l pl-3 ml-1 border-slate-200 dark:border-slate-700' : ''}`}>
                            {header}
                        </div>
                        {!showSidebar && (
                            <div className="truncate sm:hidden">
                                {header}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                    


                    {/* Coin balance + Buy Coins — only for user type */}
                    {auth?.user?.type === 'user' && (
                        <>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
                                🪙 {auth.user.coins}
                            </span>
                            <Link
                                href="/admin/coin-requests"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Buy Coins
                            </Link>
                        </>
                    )}

                    <NotificationBell />

                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800 shadow-sm hover:scale-105 transition-transform duration-200">
                                <span className="material-symbols-outlined text-2xl">person</span>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        <div className={`absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg py-2 border border-gray-100 dark:border-slate-700 z-50 transform origin-top-right transition-all duration-200 ease-out ${dropdownOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}>
                            <Link
                                href="/admin/profile"
                                className="block px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                My Profile
                            </Link>
                            <Link
                                href="/admin/profile#coin-ledger"
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                <span className="w-4 h-4 flex items-center justify-center">🪙</span>
                                Coin Ledger
                            </Link>
                            {auth?.user?.type === 'admin' && (
                                <Link
                                    href="/admin/payment-settings"
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6.364 1.636l-.707.707M20 12h-1M17.657 17.657l-.707-.707M12 20v-1m-5.657-1.636l.707-.707M4 12H3m2.343-5.657l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                                    QR Settings
                                </Link>
                            )}
                            {auth?.user?.type === 'admin' && (
                                <Link
                                    href="/admin/pdf-coordinates"
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>
                                    PDF Coordinates
                                </Link>
                            )}
                            <div className="border-t border-gray-100 dark:border-slate-700 my-1"></div>
                            <div className="px-4 py-2 flex flex-col gap-2">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appearance</span>
                                <div className="transform scale-90 origin-left">
                                    <ThemeToggle />
                                </div>
                            </div>
                            <div className="border-t border-gray-100 dark:border-slate-700 my-1"></div>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            >
                                Sign Out
                            </Link>
                        </div>
                    </div>
                    </div>
                </header>
                <main className="flex-1 p-8 overflow-y-auto bg-gray-50 dark:bg-slate-950">
                    {showSpellingWarning && (
                        <div className="mb-6 max-w-3xl mx-auto bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl overflow-hidden flex items-center shadow-sm">
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
            
            {/* Click outside listener overlay */}
            {dropdownOpen && (
                <div className="fixed inset-0 z-0" onClick={() => setDropdownOpen(false)}></div>
            )}

            <WhatsAppButton />
        </div>
    );
}
