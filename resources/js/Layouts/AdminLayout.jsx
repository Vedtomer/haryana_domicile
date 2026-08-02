import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-blue-400">Admin Portal</h2>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/dashboard" className="block px-4 py-2 rounded-lg bg-gray-800 text-white">Dashboard</Link>
                    <Link href="/admin/marriage-forms" className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white">Marriage Forms</Link>
                    <Link href="/admin/birth-records" className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white">Birth Records</Link>
                    <Link href="/admin/haryana-domicile" className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white">Haryana Domicile</Link>
                    <Link href="/admin/pan-requests" className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white">PAN Requests</Link>
                    <Link href="/admin/coin-requests" className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white">Coin Purchases</Link>
                    {auth?.user?.type === 'super_admin' && (
                        <Link href="/admin/users" className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white">Manage Users</Link>
                    )}
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <div className="text-sm text-gray-400 mb-2">Logged in as {auth?.user?.name || 'Admin'}</div>
                    <Link href="/logout" method="post" as="button" className="w-full text-left text-sm text-red-400 hover:text-red-300">
                        Sign Out
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm h-16 flex items-center px-8">
                    <h1 className="text-xl font-semibold text-gray-800">CSP Jaankari Admin</h1>
                </header>
                <main className="flex-1 p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
