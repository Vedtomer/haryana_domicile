import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex flex-col shadow-xl z-20">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-blue-400">CSP Jaankari</h2>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/dashboard" className="block px-4 py-2 rounded-lg bg-gray-800 text-white">Dashboard</Link>
                    {auth?.user?.type !== 'super_admin' && (
                        <>
                            <Link href="/admin/marriage-forms" className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">Marriage Forms</Link>
                            <Link href="/admin/birth-records" className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">Birth Records</Link>
                            <Link href="/admin/haryana-domicile" className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">Haryana Domicile</Link>
                            <Link href="/admin/pan-requests" className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">PAN Requests</Link>
                            <Link href="/admin/coin-requests" className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">Coin Purchases</Link>
                        </>
                    )}
                    {auth?.user?.type === 'super_admin' && (
                        <Link href="/admin/users" className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">Manage Users</Link>
                    )}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm h-16 flex items-center justify-end px-8 z-10 relative">
                    
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
