import React from 'react';
import { Link } from '@inertiajs/react';
import Toast from '../Components/Toast';

export default function FrontendLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col font-body-md text-on-background bg-background selection:bg-primary-container selection:text-on-primary-container">
            <Toast />
            {/* Navbar */}
            <header className="fixed top-0 left-0 w-full z-50 flex justify-center items-center px-6 py-4 bg-surface/80 backdrop-blur-xl border-b border-outline-variant shadow-sm transition-all duration-200">
                <div className="flex w-full max-w-[1280px] justify-between items-center">
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <Link href="/">
                            <img alt="Bharat Digital Trust Logo" className="h-8 w-auto" src="https://lh3.googleusercontent.com/aida/AP1WRLvvVs3kuvCpdrCk_a3wVrd64gad_VXOVHOBnB-iJnlUQ919BeoQnRXr8MH8xs007kbuGKmY8pHEAoWHq6O03VFTFTwuyuNsW5WJIG6w8kjNTZFUO0J6ctZSNulK7z869vXvCWh2Iu0OtCa9UexViotQlER_xZDf14y9BpBLioCgO7Q4QauJwp7-Xh1tKdbokNT78No2ZSTmXvn8JuZ3nK6JiihRdmKl9aJ-E8PKLP5rPN5iEZ_7g22nVfI" />
                        </Link>
                        <Link href="/">
                            <span className="text-body-lg font-headline-lg text-primary tracking-tight">
                                CertifyIndia
                            </span>
                        </Link>
                    </div>
                    <div className="hidden md:flex space-x-6 items-center">
                        <Link href="/#services" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Services</Link>
                        <Link href="/#about" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">About</Link>
                        <Link href="/#contact" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Contact</Link>
                        
                        <Link 
                            href="/register" 
                            className="font-label-md text-label-md text-secondary border border-secondary px-4 py-2 rounded-lg hover:bg-secondary/10 transition-colors"
                        >
                            Sign Up
                        </Link>
                        <Link 
                            href="/login" 
                            className="font-label-md text-label-md text-on-primary bg-primary px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow pt-[72px]">
                {children}
            </main>

            {/* Footer */}
            <footer className="w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-lowest border-t border-outline-variant mt-auto">
                <div className="w-full max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="font-headline-md text-on-surface text-sm">
                        &copy; {new Date().getFullYear()} CertifyIndia Digital Trust. All rights reserved. Secure Government Gateway.
                    </div>
                    <div className="flex gap-4 flex-wrap justify-center">
                        <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all" href="#">Privacy Policy</a>
                        <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all" href="#">Terms of Service</a>
                        <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all" href="#">Compliance</a>
                        <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline transition-all" href="#">Help Desk</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
