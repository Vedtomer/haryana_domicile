import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500 selection:text-white">
            <Head>
                <title>CSP Jaankari - Citizen Services Portal</title>
                <meta name="description" content="Your trusted portal for applying to citizen services, PAN cards, marriage forms, and domicile certificates." />
            </Head>

            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                CJ
                            </div>
                            <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                                CSP Jaankari
                            </span>
                        </div>
                        <div className="hidden md:flex space-x-8 items-center">
                            <a href="#services" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Services</a>
                            <a href="#about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About</a>
                            <a href="#contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</a>
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

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-100/50 rounded-full blur-3xl opacity-70"></div>
                    <div className="absolute top-40 -left-20 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl opacity-60"></div>
                </div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                        Trusted by 10,000+ Citizens
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
                        Citizen Services, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Simplified & Secured
                        </span>
                    </h1>
                    
                    <p className="mt-4 max-w-2xl text-lg md:text-xl text-slate-600 mx-auto mb-10 leading-relaxed">
                        Your one-stop digital portal for PAN Card applications, Marriage Certificates, Haryana Domicile, and Birth Records. Experience fast and hassle-free processing.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link 
                            href="/login" 
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300"
                        >
                            Access Portal
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </Link>
                        <a 
                            href="#services" 
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
                        >
                            Explore Services
                        </a>
                    </div>
                </div>
            </div>

            {/* Features/Services Section */}
            <div id="services" className="py-20 bg-white relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Our Core Services</h2>
                        <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">We provide a comprehensive suite of e-governance services to make your life easier.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Service Card 1 */}
                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">PAN Card Services</h3>
                            <p className="text-slate-600">Apply for a new PAN card or update existing details seamlessly with our trusted platform.</p>
                        </div>
                        
                        {/* Service Card 2 */}
                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Marriage Registration</h3>
                            <p className="text-slate-600">Streamline your marriage registration process with our easy-to-use digital forms.</p>
                        </div>

                        {/* Service Card 3 */}
                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Haryana Domicile</h3>
                            <p className="text-slate-600">Fast-track your Haryana resident certificates securely directly through our verified portal.</p>
                        </div>

                        {/* Service Card 4 */}
                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Birth Certificates</h3>
                            <p className="text-slate-600">Register new births and generate official certificates with automated record keeping.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
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
                            <li><a href="#services" className="hover:text-white transition-colors">Our Services</a></li>
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
