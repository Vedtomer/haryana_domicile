import React from 'react';
import { Link } from '@inertiajs/react';
import FooterParticles from './FooterParticles';
import WaveCanvas from './WaveCanvas';

const quickLinks = [
    { label: 'Login',          href: '/login'     },
    { label: 'Sign Up',        href: '/register'  },
    { label: 'Our Services',   href: '/#services' },
    { label: 'Privacy Policy', href: '#'          },
];

export default function FrontendFooter() {
    return (
        <footer
            className="relative overflow-hidden mt-auto"
            style={{
                background: 'linear-gradient(180deg, #050a14 0%, #0a0f1e 60%, #0d1227 100%)',
                borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            {/* Multi-layer particle animation: wires + sparkle stars + rings */}
            <FooterParticles />

            {/* Water wave at top edge — reacts to scroll (flipped) */}
            <WaveCanvas
                color="rgba(96,165,250,0.2)"
                color2="rgba(147,197,253,0.12)"
                height={40}
                flip={true}
                style={{ position: 'relative', zIndex: 1 }}
            />

            {/* Glow blob bottom-left */}
            <div style={{
                position: 'absolute', bottom: '-40px', left: '-40px',
                width: '200px', height: '200px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div className="relative max-w-[1280px] mx-auto px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <img
                                src="/csp-logo.webp"
                                alt="CSP Jaankari Logo"
                                style={{
                                    height: 52,
                                    width: 'auto',
                                    objectFit: 'contain',
                                }}
                            />
                        </div>
                        <p style={{ fontSize: 12, color: '#93c5fd', lineHeight: 1.6 }}>
                            Delivering digital citizen services with speed, transparency, and trust.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: '#93c5fd', marginBottom: 8 }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {quickLinks.map(({ label, href }) => (
                                <li key={label}>
                                    <Link
                                        href={href}
                                        style={{
                                            fontSize: 12, color: '#bfdbfe',
                                            textDecoration: 'none', transition: 'all 0.2s',
                                            display: 'inline-block',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.color = '#fff';
                                            e.currentTarget.style.transform = 'translateX(5px)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.color = '#bfdbfe';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        → {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: '#93c5fd', marginBottom: 8 }}>Contact</h4>
                        <p
                            style={{ fontSize: 12, color: '#bfdbfe', marginBottom: 4, cursor: 'default', transition: 'color 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#bfdbfe'; }}
                        >
                            support@cspjaankari.com
                        </p>
                        <p style={{ fontSize: 12, color: '#bfdbfe' }}>Haryana, India</p>
                    </div>
                </div>

                <div style={{
                    marginTop: 14, paddingTop: 12,
                    borderTop: '1px solid rgba(147,197,253,0.2)',
                    textAlign: 'center', fontSize: 11, color: '#60a5fa',
                }}>
                    © {new Date().getFullYear()} CSP Jaankari. All rights reserved. Secure Government Gateway.
                </div>
            </div>
        </footer>
    );
}
