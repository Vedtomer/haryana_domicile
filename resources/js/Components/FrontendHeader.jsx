import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import FooterParticles from './FooterParticles';
import WaveCanvas from './WaveCanvas';
import TopDisclaimerTicker from './TopDisclaimerTicker';
import ThemeToggle from './ThemeToggle';

const navLinks = [
    { label: 'HOME', href: '/' },
    { label: 'ABOUT US', href: '/#about' },
    { label: 'SERVICES', href: '/#services' },
    { label: 'CONTACT US', href: '/#contact' },
];

export default function FrontendHeader() {
    const { auth } = usePage().props;

    return (
        <header
            className="fixed top-0 left-0 w-full z-50 overflow-hidden"
            style={{
                background: 'linear-gradient(180deg, #0d2461 0%, #0a1a4a 55%, #05091f 100%)',
                borderBottom: '1px solid rgba(30,79,194,0.4)',
                boxShadow: '0 4px 30px rgba(0,0,0,0.6)',
            }}
        >
            {/* Multi-layer particle animation: wires + sparkle stars + rings */}
            <FooterParticles />

            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, rgba(10,22,40,0.4) 0%, transparent 40%, rgb(73,108,190) 100%)',
                pointerEvents: 'none',
            }} />

            {/* Top disclaimer marquee ticker */}
            <TopDisclaimerTicker />

            {/* Main nav row */}
            <div className="relative flex justify-center items-center px-4 sm:px-6 py-1.5">
                <div className="flex w-full max-w-[1280px] justify-between items-center">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
                        <img
                            src="/csp-logo.webp"
                            alt="CSP Jaankari Logo"
                            style={{
                                height: 40,
                                width: 'auto',
                                objectFit: 'contain',
                                transition: 'filter 0.2s, transform 0.2s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.filter = 'drop-shadow(0 0 10px rgba(147,197,253,0.8))';
                                e.currentTarget.style.transform = 'scale(1.07)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.filter = 'none';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        />
                    </Link>

                    {/* Nav Links & Action Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map(({ label, href }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    style={{
                                        fontSize: 13, fontWeight: 600, color: '#e0eeff',
                                        padding: '8px 14px', borderRadius: 6,
                                        letterSpacing: '0.04em',
                                        transition: 'all 0.2s',
                                        textDecoration: 'none',
                                        position: 'relative',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.color = '#fff';
                                        e.currentTarget.style.background = 'rgba(96,165,250,0.15)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.color = '#e0eeff';
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>

                        {/* Dark Mode Toggle */}
                        <ThemeToggle 
                            variant="icon" 
                            className="border-blue-400/40 bg-white/10 dark:bg-slate-800/80 text-white hover:bg-white/20 !w-8 !h-8 sm:!w-9 sm:!h-9" 
                        />

                        {auth?.user ? (
                            <>
                                {/* Dashboard Link */}
                                <Link
                                    href="/dashboard"
                                    style={{
                                        fontSize: 12, fontWeight: 700, color: '#ffffff',
                                        background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                                        padding: '7px 14px', borderRadius: 8,
                                        letterSpacing: '0.03em',
                                        transition: 'all 0.2s',
                                        textDecoration: 'none',
                                        whiteSpace: 'nowrap',
                                        boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
                                    }}
                                    className="flex items-center gap-1 hover:brightness-110"
                                >
                                    <span className="material-symbols-outlined text-[15px]">dashboard</span>
                                    <span>DASHBOARD</span>
                                </Link>

                                {/* Direct Logout Button on Top Header */}
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    style={{
                                        fontSize: 12, fontWeight: 700, color: '#fca5a5',
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        border: '1px solid rgba(239, 68, 68, 0.4)',
                                        padding: '6px 12px', borderRadius: 8,
                                        letterSpacing: '0.03em',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                    }}
                                    className="flex items-center gap-1 hover:bg-red-600 hover:text-white"
                                    title="Logout / Sign Out"
                                >
                                    <span className="material-symbols-outlined text-[15px]">logout</span>
                                    <span className="hidden sm:inline">LOGOUT</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* Login link */}
                                <Link
                                    href="/login"
                                    style={{
                                        fontSize: 13, fontWeight: 600, color: '#e0eeff',
                                        padding: '7px 12px', borderRadius: 6,
                                        letterSpacing: '0.04em',
                                        transition: 'all 0.2s',
                                        textDecoration: 'none',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.color = '#fff';
                                        e.currentTarget.style.background = 'rgba(96,165,250,0.15)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.color = '#e0eeff';
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    LOGIN
                                </Link>

                                {/* Register CTA button */}
                                <Link
                                    href="/register"
                                    style={{
                                        fontSize: 12, fontWeight: 700, color: '#0a1628',
                                        background: 'linear-gradient(135deg, #93c5fd, #60a5fa)',
                                        padding: '7px 16px', borderRadius: 50,
                                        letterSpacing: '0.03em',
                                        transition: 'all 0.2s',
                                        textDecoration: 'none',
                                        boxShadow: '0 2px 10px rgba(96,165,250,0.4)',
                                        whiteSpace: 'nowrap',
                                    }}
                                    className="hidden sm:inline-block"
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #60a5fa, #3b82f6)';
                                        e.currentTarget.style.color = '#fff';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(96,165,250,0.55)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #93c5fd, #60a5fa)';
                                        e.currentTarget.style.color = '#0a1628';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(96,165,250,0.4)';
                                    }}
                                >
                                    REGISTER NOW ↗
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Water wave at bottom edge — reacts to scroll */}
            <WaveCanvas
                color="rgba(96,165,250,0.22)"
                color2="rgba(147,197,253,0.13)"
                height={14}
                style={{ position: 'relative', zIndex: 1 }}
            />
        </header>
    );
}
