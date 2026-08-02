import React from 'react';
import { Link } from '@inertiajs/react';

export default function FrontendLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col font-sans selection:bg-blue-500 selection:text-white">
            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <Link href="/">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
                                    CJ
                                </div>
                            </Link>
                            <Link href="/">
                                <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 cursor-pointer">
                                    CSP Jaankari
                                </span>
                            </Link>
                        </div>
                        <div className="hidden md:flex space-x-8 items-center">
                            <Link href="/#services" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Services</Link>
                            <Link href="/#about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About</Link>
                            <Link href="/#contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</Link>
                            <Link 
                                href="/login" 
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                            >
                                Login
                            </Link>
                            <Link 
                                href="/register" 
                                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-full text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow pt-20">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                CJ
                            </div>
                            <span className="font-bold text-xl text-white">CSP Jaankari</span>
                        </div>
                        <p className="text-sm text-slate-400">Delivering digital citizen services with speed, transparency, and trust.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                            <li><Link href="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
                            <li><Link href="/#services" className="hover:text-white transition-colors">Our Services</Link></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Contact</h4>
                        <p className="text-sm text-slate-400 mb-2">support@cspjaankari.com</p>
                        <p className="text-sm text-slate-400">Haryana, India</p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} CSP Jaankari. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
