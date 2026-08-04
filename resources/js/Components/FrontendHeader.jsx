import React from 'react';
import { Link } from '@inertiajs/react';
import FooterParticles from './FooterParticles';
import WaveCanvas from './WaveCanvas';

const navLinks = [
    { label: 'HOME',       href: '/'           },
    { label: 'ABOUT US',   href: '/#about'     },
    { label: 'SERVICES',   href: '/#services'  },
    { label: 'CONTACT US', href: '/#contact'   },
];

export default function FrontendHeader() {
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

            {/* Top announcement bar (optional — matches reference style) */}
            <div style={{
                position: 'relative',
                background: '#071030',
                borderBottom: '1px solid rgba(147,197,253,0.2)',
                textAlign: 'center',
                padding: '2px 16px',
                fontSize: 11,
                color: '#bfdbfe',
                letterSpacing: '0.01em',
            }}>
                🌐 CSP Jaankari — Trusted Digital Services for Haryana Citizens
            </div>

            {/* Main nav row */}
            <div className="relative flex justify-center items-center px-6 py-1.5">
                <div className="flex w-full max-w-[1280px] justify-between items-center">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
                        <img
                            src="/csp-logo.webp"
                            alt="CSP Jaankari Logo"
                            style={{
                                height: 70,
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

                    {/* Nav Links */}
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
                                    e.currentTarget.style.color      = '#fff';
                                    e.currentTarget.style.background = 'rgba(96,165,250,0.15)';
                                    e.currentTarget.style.transform  = 'translateY(-1px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color      = '#e0eeff';
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform  = 'translateY(0)';
                                }}
                            >
                                {label}
                            </Link>
                        ))}

                        {/* Login link */}
                        <Link
                            href="/login"
                            style={{
                                fontSize: 13, fontWeight: 600, color: '#e0eeff',
                                padding: '8px 14px', borderRadius: 6,
                                letterSpacing: '0.04em',
                                transition: 'all 0.2s',
                                textDecoration: 'none',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color      = '#fff';
                                e.currentTarget.style.background = 'rgba(96,165,250,0.15)';
                                e.currentTarget.style.transform  = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color      = '#e0eeff';
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.transform  = 'translateY(0)';
                            }}
                        >
                            LOGIN
                        </Link>

                        {/* Register CTA button */}
                        <Link
                            href="/register"
                            style={{
                                fontSize: 13, fontWeight: 700, color: '#0a1628',
                                background: 'linear-gradient(135deg, #93c5fd, #60a5fa)',
                                padding: '8px 20px', borderRadius: 50,
                                letterSpacing: '0.03em',
                                transition: 'all 0.2s',
                                textDecoration: 'none',
                                marginLeft: 8,
                                boxShadow: '0 2px 10px rgba(96,165,250,0.4)',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background  = 'linear-gradient(135deg, #60a5fa, #3b82f6)';
                                e.currentTarget.style.color       = '#fff';
                                e.currentTarget.style.transform   = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow   = '0 6px 20px rgba(96,165,250,0.55)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background  = 'linear-gradient(135deg, #93c5fd, #60a5fa)';
                                e.currentTarget.style.color       = '#0a1628';
                                e.currentTarget.style.transform   = 'translateY(0)';
                                e.currentTarget.style.boxShadow   = '0 2px 10px rgba(96,165,250,0.4)';
                            }}
                        >
                            REGISTER NOW ↗
                        </Link>
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
