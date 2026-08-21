import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Toast from '../Components/Toast';
import NotificationBell from '../Components/NotificationBell';
import WhatsAppButton from '../Components/WhatsAppButton';
import ThemeToggle from '../Components/ThemeToggle';

export default function AdminLayout({ header, children }) {
    const { auth, navServices = [] } = usePage().props;
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const { url } = usePage();
    const isDashboard = url === '/dashboard' || url.startsWith('/dashboard?');

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
            
            {/* Sidebar — hidden on the dashboard itself, shown once you navigate elsewhere */}
            {!isDashboard && (
            <div className="w-72 bg-[#0a1120] text-slate-300 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.15)] z-20 border-r border-slate-800/60">
                
                {/* Horizontal Logo */}
                <div className="p-6 flex items-center justify-center border-b border-slate-800/60 mb-6 bg-slate-900/30">
                    <div className="flex items-center gap-3">
                        {/* Custom Generated Logo */}
                        <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100" height="100" rx="20" fill="url(#paint0_linear)"/>
                            <path d="M70 30L30 70M30 30L70 70" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="50" cy="50" r="15" fill="#0f172a"/>
                            <circle cx="50" cy="50" r="10" fill="url(#paint1_linear)"/>
                            <defs>
                                <linearGradient id="paint0_linear" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#3B82F6" />
                                    <stop offset="1" stopColor="#6366F1" />
                                </linearGradient>
                                <linearGradient id="paint1_linear" x1="40" y1="40" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#60A5FA" />
                                    <stop offset="1" stopColor="#818CF8" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="flex flex-col justify-center">
                            <h2 className="text-2xl font-black tracking-tight leading-none text-white drop-shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                                CSP Jaankari
                            </h2>
                            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.2em] mt-1">Management Portal</span>
                        </div>
                    </div>
                </div>
                
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Menu</div>
                    
                    <NavItem href="/dashboard" icon={
                        <svg className={`w-5 h-5 ${url.startsWith('/dashboard') ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    }>
                        Dashboard
                    </NavItem>

                    <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Services & Apps</div>
                    {navServices.map((service) => (
                        <NavItem key={service.id} href={service.url} icon={
                            service.logo_url ? (
                                <img src={service.logo_url} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                            ) : (
                                <span className="w-5 h-5 flex items-center justify-center text-base">{service.icon}</span>
                            )
                        }>{service.name}</NavItem>
                    ))}
                    {auth?.user?.type === 'user' && (
                        <NavItem href="/admin/service-requests" icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        }>My Requests</NavItem>
                    )}

                    {(auth?.user?.type === 'admin' || auth?.user?.type === 'super_admin') && (
                        <>
                            <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administration</div>
                            <NavItem href="/admin/users" icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            }>
                                Manage Users
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
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white dark:bg-slate-900 dark:border-b dark:border-slate-800 shadow-sm h-16 flex items-center justify-between px-8 z-10 relative">
                    
                    <div className="flex-1 truncate">
                        {header}
                    </div>

                    <div className="flex items-center gap-3">
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
                                {auth?.user?.name?.charAt(0).toUpperCase()}
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
