import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Toast from '../Components/Toast';

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const { url } = usePage();

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
            
            {/* Sidebar */}
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

                    {auth?.user?.type === 'user' && (
                        <>
                            <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Services</div>
                            <NavItem href="/admin/marriage-forms" icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            }>Marriage Forms</NavItem>
                            <NavItem href="/admin/birth-records" icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            }>Birth Records</NavItem>
                            <NavItem href="/admin/haryana-domicile" icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            }>Haryana Domicile</NavItem>
                            <NavItem href="/admin/pan-requests" icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            }>PAN Requests</NavItem>
                        </>
                    )}

                    {(auth?.user?.type === 'admin' || auth?.user?.type === 'super_admin') && (
                        <>
                            <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administration</div>
                            <NavItem href="/admin/users" icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            }>
                                Manage Users
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm h-16 flex items-center justify-end px-8 z-10 relative gap-4">
                    
                    {/* Buy Coins Button — only for user type */}
                    {auth?.user?.type === 'user' && (
                        <Link
                            href="/admin/coin-requests"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Buy Coins
                        </Link>
                    )}

                    <div className="relative">
                        <button 
                            onClick={() => setDropdownOpen(!dropdownOpen)} 
                            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 focus:outline-none transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shadow-sm hover:scale-105 transition-transform duration-200">
                                {auth?.user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        <div className={`absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-50 transform origin-top-right transition-all duration-200 ease-out ${dropdownOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}>
                            <Link 
                                href="/admin/profile" 
                                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                My Profile
                            </Link>
                            {auth?.user?.type === 'admin' && (
                                <Link
                                    href="/admin/payment-settings"
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6.364 1.636l-.707.707M20 12h-1M17.657 17.657l-.707-.707M12 20v-1m-5.657-1.636l.707-.707M4 12H3m2.343-5.657l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                                    QR Settings
                                </Link>
                            )}
                            {auth?.user?.type === 'admin' && (
                                <Link
                                    href="/admin/pdf-coordinates"
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>
                                    PDF Coordinates
                                </Link>
                            )}
                            <div className="border-t border-gray-100 my-1"></div>
                            <Link 
                                href="/logout" 
                                method="post" 
                                as="button" 
                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                            >
                                Sign Out
                            </Link>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </div>
            
            {/* Click outside listener overlay */}
            {dropdownOpen && (
                <div className="fixed inset-0 z-0" onClick={() => setDropdownOpen(false)}></div>
            )}
        </div>
    );
}
