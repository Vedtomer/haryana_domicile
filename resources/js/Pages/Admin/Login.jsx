import React, { useEffect, useState } from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import FrontendLayout from '../../Layouts/FrontendLayout';
import FooterParticles from '../../Components/FooterParticles';
import axios from 'axios';

export default function Login({ captchaSvg: initialCaptchaSvg = '' }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        captcha: '',
    });

    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [captchaSvg, setCaptchaSvg] = useState(initialCaptchaSvg);
    const [refreshingCaptcha, setRefreshingCaptcha] = useState(false);

    const isCaptchaComplete = data.captcha?.trim().length === 5;

    const handleRefreshCaptcha = async () => {
        if (refreshingCaptcha) return;
        setRefreshingCaptcha(true);
        try {
            const res = await axios.get('/captcha/refresh');
            if (res.data?.svg) {
                setCaptchaSvg(res.data.svg);
                setData('captcha', '');
            }
        } catch (err) {
            console.error('Failed to refresh captcha', err);
        } finally {
            setRefreshingCaptcha(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        if (!captchaSvg) {
            handleRefreshCaptcha();
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            onError: () => {
                handleRefreshCaptcha();
            },
        });
    };

    return (
        <FrontendLayout>
            <Head title="Login - CSP Jaankari" />

            <div className="relative py-10 md:py-16 flex items-center justify-center px-4 md:px-8 font-body-md overflow-hidden" style={{ background: 'linear-gradient(180deg, #050a14 0%, #0d1227 100%)' }}>
                {/* Particles Background Layer */}
                <FooterParticles style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.8 }} />
                
                <div className="relative z-10 w-full max-w-[1200px] flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

                    {/* Left: Illustration with Floating Elements */}
                    <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center relative">
                        {/* Animated Floating Orbs */}
                        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute top-1/2 left-10 w-16 h-16 bg-cyan-400/30 rounded-full blur-xl animate-bounce pointer-events-none" style={{ animationDuration: '3s' }}></div>
                        
                        <img
                            alt="Digital India Fintech Illustration"
                            className="relative z-10 object-contain w-full max-w-[480px] h-auto transform transition-transform duration-700 hover:scale-105"
                            src="/images/bb.webp"
                        />
                    </div>

                    {/* Right: Login form — standalone card */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                        {/* Embedded Glassmorphism Styles to guarantee cross-browser execution and zero stylesheet caching delay */}
                        <style>{`
                            @keyframes glassShineSweep {
                                0% {
                                    transform: translateX(-160%) skewX(-25deg);
                                }
                                40%, 100% {
                                    transform: translateX(300%) skewX(-25deg);
                                }
                            }
                            @keyframes glassGlowPulse {
                                0%, 100% {
                                    box-shadow: 0 0 16px rgba(59, 130, 246, 0.5), 0 8px 30px rgba(37, 99, 235, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.85);
                                    transform: scale(1);
                                }
                                50% {
                                    box-shadow: 0 0 32px rgba(99, 102, 241, 0.8), 0 12px 38px rgba(14, 165, 233, 0.6), inset 0 2px 3px rgba(255, 255, 255, 1);
                                    transform: scale(1.015);
                                }
                            }
                            @keyframes glassCardAura {
                                0%, 100% {
                                    box-shadow: 0 16px 48px -10px rgba(59, 130, 246, 0.35), 0 0 20px rgba(99, 102, 241, 0.2);
                                    border-color: rgba(96, 165, 250, 0.6);
                                }
                                50% {
                                    box-shadow: 0 20px 60px -10px rgba(59, 130, 246, 0.55), 0 0 35px rgba(147, 197, 253, 0.4);
                                    border-color: rgba(147, 197, 253, 0.9);
                                }
                            }
                            @keyframes glassParticleFloat {
                                0%, 100% {
                                    transform: translateY(0px) rotate(0deg);
                                    opacity: 0.4;
                                }
                                50% {
                                    transform: translateY(-12px) rotate(180deg);
                                    opacity: 0.7;
                                }
                            }
                            .glass-active-card {
                                animation: glassCardAura 3s ease-in-out infinite;
                            }
                            .glass-btn-active {
                                animation: glassGlowPulse 2.2s ease-in-out infinite;
                            }
                            .glass-beam-anim {
                                animation: glassShineSweep 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                            }
                        `}</style>

                        <main className={`w-full max-w-[460px] rounded-2xl overflow-hidden transition-all duration-500 border-2 relative ${
                            isCaptchaComplete
                                ? 'glass-active-card'
                                : 'shadow-[0px_8px_32px_rgba(0,102,255,0.15)] border-blue-600'
                        }`}
                        style={{
                            background: 'rgba(255, 255, 255, 0.96)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: isCaptchaComplete ? undefined : '0 10px 30px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.8)'
                        }}
                        >
                            {/* Glass card ambient glow when captcha is complete */}
                            {isCaptchaComplete && (
                                <div 
                                    className="absolute -top-32 -left-32 w-72 h-72 pointer-events-none rounded-full blur-2xl opacity-40 bg-gradient-to-br from-blue-400 to-cyan-300"
                                    style={{ animation: 'glassParticleFloat 6s ease-in-out infinite' }}
                                />
                            )}
                            
                            {/* Full Frosted Glass Loading Overlay during Processing */}
                            {processing && (
                                <div className="absolute inset-0 z-30 backdrop-blur-md bg-slate-950/60 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                                    <div 
                                        className="p-6 rounded-2xl border border-white/40 shadow-2xl flex flex-col items-center gap-4 text-center max-w-[280px]"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.18)',
                                            backdropFilter: 'blur(20px)',
                                            WebkitBackdropFilter: 'blur(20px)',
                                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.6)'
                                        }}
                                    >
                                        <div className="relative w-14 h-14 flex items-center justify-center">
                                            <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-cyan-400 border-r-blue-400 animate-spin"></div>
                                            <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-indigo-400 border-l-white/70 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
                                            <span className="material-symbols-outlined text-white text-2xl animate-pulse">lock_open</span>
                                        </div>
                                        <div>
                                            <h4 className="text-white text-base font-bold tracking-wide drop-shadow-sm">Verifying & Signing In</h4>
                                            <p className="text-blue-100 text-xs mt-1 drop-shadow-sm">Checking captcha & credentials...</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Right Side: Login Form */}
                            <div className="w-full relative z-10 p-6 sm:p-8">
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-primary mb-1">Welcome back</h1>
                                <p className="text-xs text-on-surface-variant">Sign in to access your CSP services dashboard</p>
                            </div>

                            {/* Flash Success Message */}
                            {flash?.success && (
                                <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-base shrink-0 mt-0.5">check_circle</span>
                                    <span className="leading-snug">{flash.success}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={submit} className="flex flex-col gap-stack-md">
                                <div className="flex flex-col gap-base">
                                    <label className="font-label-md text-label-md text-on-surface" htmlFor="login">Email or Mobile Number</label>
                                    <div className="relative flex items-center input-field bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200">
                                        <input 
                                            id="login" 
                                            name="login"
                                            value={data.login}
                                            onChange={(e) => setData('login', e.target.value)}
                                            className="w-full bg-transparent border-none py-3 px-4 text-body-md text-on-surface focus:ring-0 focus:outline-none rounded-lg" 
                                            placeholder="Enter email or mobile" 
                                            type="text"
                                        />
                                    </div>
                                    {errors.login && <p className="text-red-500 text-xs mt-1">{errors.login}</p>}
                                </div>
                                <div className="flex flex-col gap-base">
                                    <div className="flex justify-between items-center">
                                        <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
                                        <Link className="font-label-sm text-label-sm text-secondary hover:underline" href="/forgot-password">Forgot Password?</Link>
                                    </div>
                                    <div className="relative flex items-center input-field bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200">
                                        <input 
                                            id="password" 
                                            name="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            type={showPassword ? "text" : "password"}
                                            className="w-full bg-transparent border-none py-3 pl-4 pr-10 text-body-md text-on-surface focus:ring-0 focus:outline-none rounded-lg" 
                                            placeholder="••••••••" 
                                        />
                                        <button 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 text-outline hover:text-on-surface transition-colors focus:outline-none" 
                                            type="button"
                                        >
                                            <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                {/* Security Captcha */}
                                <div className="flex flex-col gap-base">
                                    <div className="flex justify-between items-center">
                                        <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5" htmlFor="captcha">
                                            <span>Security Captcha</span>
                                            {isCaptchaComplete && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm shadow-emerald-500/40 animate-in fade-in zoom-in duration-200">
                                                    <span className="material-symbols-outlined text-[12px]">verified</span>
                                                    <span>Verified</span>
                                                </span>
                                            )}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleRefreshCaptcha}
                                            disabled={refreshingCaptcha}
                                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 focus:outline-none disabled:opacity-50"
                                            title="Click to reload captcha"
                                        >
                                            <span className={`material-symbols-outlined text-sm ${refreshingCaptcha ? 'animate-spin' : ''}`}>
                                                sync
                                            </span>
                                            <span>New Code</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Input Box */}
                                        <div className={`relative flex-1 flex items-center input-field rounded-lg border-2 transition-all duration-300 ${
                                            isCaptchaComplete
                                                ? 'bg-emerald-50/70 border-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.3)]'
                                                : 'bg-[#F1F5F9] border-transparent focus-within:border-blue-500 focus-within:bg-white'
                                        }`}
                                        style={
                                            isCaptchaComplete
                                                ? {
                                                    backdropFilter: 'blur(8px)',
                                                    WebkitBackdropFilter: 'blur(8px)',
                                                }
                                                : {}
                                        }
                                        >
                                            <input 
                                                id="captcha" 
                                                name="captcha"
                                                value={data.captcha}
                                                onChange={(e) => setData('captcha', e.target.value.replace(/\D/g, ''))}
                                                className="w-full bg-transparent border-none py-2.5 pl-3 pr-8 text-base font-mono font-bold tracking-widest text-slate-800 focus:ring-0 focus:outline-none rounded-lg" 
                                                placeholder="5-digit code" 
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={5}
                                                autoComplete="off"
                                                required
                                            />
                                            {isCaptchaComplete && (
                                                <div className="absolute right-2.5 flex items-center pointer-events-none text-emerald-600 animate-in zoom-in duration-200">
                                                    <span className="material-symbols-outlined text-xl">check_circle</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Captcha SVG Preview */}
                                        <div 
                                            onClick={handleRefreshCaptcha}
                                            className="cursor-pointer border-2 border-slate-200 hover:border-blue-400 rounded-lg overflow-hidden shrink-0 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] select-none bg-slate-50"
                                            title="Click to reload captcha"
                                            style={{ width: '135px', height: '44px' }}
                                        >
                                            {captchaSvg ? (
                                                <div 
                                                    className="w-full h-full flex items-center justify-center pointer-events-none"
                                                    dangerouslySetInnerHTML={{ __html: captchaSvg }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                                                    Loading...
                                                </div>
                                            )}
                                        </div>

                                        {/* Refresh Button */}
                                        <button
                                            type="button"
                                            onClick={handleRefreshCaptcha}
                                            disabled={refreshingCaptcha}
                                            className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 flex items-center justify-center transition-colors border border-slate-200 shrink-0 disabled:opacity-50"
                                            title="Reload captcha code"
                                        >
                                            <span className={`material-symbols-outlined text-lg ${refreshingCaptcha ? 'animate-spin' : ''}`}>
                                                sync
                                            </span>
                                        </button>
                                    </div>

                                    {errors.captcha && (
                                        <p className="text-red-500 text-xs font-semibold mt-1 flex items-center gap-1">
                                            <span>⚠️</span>
                                            <span>{errors.captcha}</span>
                                        </p>
                                    )}
                                </div>
                                
                                {/* Glassy Animated Login Button */}
                                <button 
                                    type="submit"
                                    disabled={processing}
                                    className={`relative w-full py-3.5 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 mt-4 overflow-hidden disabled:opacity-50 select-none cursor-pointer ${
                                        isCaptchaComplete
                                            ? 'text-white border border-white/70 shadow-2xl glass-btn-active'
                                            : 'bg-primary text-on-primary hover:bg-primary/90 hover:-translate-y-[2px] shadow-md'
                                    }`}
                                    style={
                                        isCaptchaComplete
                                            ? {
                                                background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 48%, #0284c7 100%)',
                                                backdropFilter: 'blur(12px)',
                                                WebkitBackdropFilter: 'blur(12px)',
                                            }
                                            : {}
                                    }
                                >
                                    {/* Glass Specular Top Highlight */}
                                    {isCaptchaComplete && (
                                        <span 
                                            className="absolute top-0 left-0 right-0 h-[45%] pointer-events-none rounded-t-xl"
                                            style={{
                                                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.05) 70%, transparent 100%)',
                                            }}
                                        />
                                    )}

                                    {/* Bright Glass Reflection Beam Sweep */}
                                    {isCaptchaComplete && !processing && (
                                        <span className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-xl">
                                            <span 
                                                className="absolute top-0 bottom-0 pointer-events-none glass-beam-anim"
                                                style={{
                                                    width: '65px',
                                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.3) 75%, transparent 100%)',
                                                }}
                                            />
                                        </span>
                                    )}

                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2 relative z-10">
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Signing In...
                                        </span>
                                    ) : (
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            <span className="tracking-wide">
                                                {isCaptchaComplete ? 'Sign In / Login' : 'Sign In'}
                                            </span>
                                            <span className={`material-symbols-outlined transition-transform duration-300 ${isCaptchaComplete ? 'translate-x-1' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                arrow_forward
                                            </span>
                                        </span>
                                    )}
                                </button>
                                
                                <div className="text-center mt-2">
                                    <span className="font-body-sm text-body-sm text-on-surface-variant">Don't have an account? </span>
                                    <Link className="font-label-md text-label-md text-secondary hover:underline" href="/register">Register</Link>
                                </div>
                            </form>

                            {/* Trust Badges */}
                            <div className="flex flex-row justify-center md:justify-start gap-4 mt-stack-md pt-stack-md border-t border-outline-variant/50">
                                <div className="flex items-center gap-2 bg-[#d1fad7]/30 px-3 py-1.5 rounded-xl border border-[#d1fad7]">
                                    <span className="material-symbols-outlined text-tertiary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
                                    <span className="font-label-sm text-label-sm text-tertiary-container">100% Secure Gateway</span>
                                </div>
                                <div className="flex items-center gap-2 bg-[#d1fad7]/30 px-3 py-1.5 rounded-xl border border-[#d1fad7]">
                                    <span className="material-symbols-outlined text-tertiary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                                    <span className="font-label-sm text-label-sm text-tertiary-container">Trusted by 10M+ citizens</span>
                                </div>
                            </div>
                            

                        </div>
                        </main>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}
