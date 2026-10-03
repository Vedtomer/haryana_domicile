import React, { useEffect, useState, useRef } from 'react';
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
    const [autoSubmitting, setAutoSubmitting] = useState(false);
    const autoSubmitTimerRef = useRef(null);

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
        if (e && e.preventDefault) e.preventDefault();
        if (autoSubmitTimerRef.current) {
            clearTimeout(autoSubmitTimerRef.current);
            autoSubmitTimerRef.current = null;
        }
        if (processing) return;
        setAutoSubmitting(true);
        post('/login', {
            onError: () => {
                setAutoSubmitting(false);
                handleRefreshCaptcha();
            },
            onFinish: () => {
                setAutoSubmitting(false);
            },
        });
    };

    // Auto-login automatically when 5-digit captcha is typed and credentials are filled
    useEffect(() => {
        const cleanCaptcha = data.captcha?.trim() || '';
        if (
            cleanCaptcha.length === 5 &&
            data.login?.trim() &&
            data.password &&
            !processing &&
            !autoSubmitting
        ) {
            setAutoSubmitting(true);
            if (autoSubmitTimerRef.current) {
                clearTimeout(autoSubmitTimerRef.current);
            }
            autoSubmitTimerRef.current = setTimeout(() => {
                post('/login', {
                    onError: () => {
                        setAutoSubmitting(false);
                        handleRefreshCaptcha();
                    },
                    onFinish: () => {
                        setAutoSubmitting(false);
                    },
                });
            }, 300);
        }

        return () => {
            if (autoSubmitTimerRef.current) {
                clearTimeout(autoSubmitTimerRef.current);
            }
        };
    }, [data.captcha]);

    return (
        <FrontendLayout>
            <Head title="Login - CSP Jaankari" />

            <div className="relative min-h-[calc(100vh-140px)] py-10 md:py-16 flex items-center justify-center px-4 font-sans overflow-hidden" style={{ background: 'linear-gradient(180deg, #050a14 0%, #0d1227 100%)' }}>
                {/* Particles Background Layer */}
                <FooterParticles style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.8 }} />
                
                <div className="relative z-10 w-full max-w-[460px] mx-auto flex items-center justify-center">
                    {/* Embedded Styles for animations and high-contrast inputs */}
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

                        #login-card input:-webkit-autofill,
                        #login-card input:-webkit-autofill:hover,
                        #login-card input:-webkit-autofill:focus,
                        #login-card input:-webkit-autofill:active {
                            -webkit-text-fill-color: #0f172a !important;
                            -webkit-box-shadow: 0 0 0px 1000px #f8fafc inset !important;
                            box-shadow: 0 0 0px 1000px #f8fafc inset !important;
                            color: #0f172a !important;
                            transition: background-color 5000s ease-in-out 0s;
                        }
                        #login-card input {
                            color: #0f172a !important;
                            -webkit-text-fill-color: #0f172a !important;
                        }
                        #login-card label {
                            color: #0f172a !important;
                        }
                    `}</style>

                    <main 
                        id="login-card"
                        className={`login-card-container w-full rounded-3xl overflow-hidden transition-all duration-500 border-2 relative ${
                            isCaptchaComplete
                                ? 'glass-active-card'
                                : 'shadow-[0px_16px_48px_rgba(0,102,255,0.25)] border-blue-600'
                        }`}
                        style={{
                            background: '#ffffff',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: isCaptchaComplete ? undefined : '0 20px 50px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.9)'
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
                        {(processing || autoSubmitting) && (
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
                                        <h4 className="text-white text-base font-bold tracking-wide drop-shadow-sm">
                                            {autoSubmitting ? 'Auto Signing In' : 'Verifying & Signing In'}
                                        </h4>
                                        <p className="text-blue-100 text-xs mt-1 drop-shadow-sm">
                                            {autoSubmitting ? 'Captcha verified! Auto-logging in...' : 'Checking captcha & credentials...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Login Form Body */}
                        <div className="w-full relative z-10 p-6 sm:p-8">
                            <div className="text-center mb-6">
                                <h1 className="text-2xl sm:text-3xl font-black text-blue-600 mb-1 tracking-tight">Welcome back</h1>
                                <p className="text-xs sm:text-sm font-semibold text-slate-600" style={{ color: '#475569' }}>Sign in to access your CSP services dashboard</p>
                            </div>

                            {/* Flash Success Message */}
                            {flash?.success && (
                                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-start gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-base shrink-0 mt-0.5">check_circle</span>
                                    <span className="leading-snug">{flash.success}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={submit} className="flex flex-col gap-4">
                                {/* Email / Mobile Field */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs sm:text-sm font-bold text-slate-900" style={{ color: '#0f172a' }} htmlFor="login">
                                        Email or Mobile Number
                                    </label>
                                    <div className="relative flex items-center bg-slate-100 hover:bg-slate-50 focus-within:bg-white rounded-xl border-2 border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner">
                                        <span className="material-symbols-outlined absolute left-3.5 text-slate-500 pointer-events-none text-xl">
                                            person
                                        </span>
                                        <input 
                                            id="login" 
                                            name="login"
                                            value={data.login}
                                            onChange={(e) => setData('login', e.target.value)}
                                            className="w-full bg-transparent border-none py-3 pl-11 pr-4 text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none rounded-xl" 
                                            placeholder="Enter email or mobile" 
                                            type="text"
                                            style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }}
                                        />
                                    </div>
                                    {errors.login && <p className="text-red-500 text-xs font-semibold mt-1">{errors.login}</p>}
                                </div>

                                {/* Password Field */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs sm:text-sm font-bold text-slate-900" style={{ color: '#0f172a' }} htmlFor="password">
                                            Password
                                        </label>
                                        <Link className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline" href="/forgot-password">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <div className="relative flex items-center bg-slate-100 hover:bg-slate-50 focus-within:bg-white rounded-xl border-2 border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner">
                                        <span className="material-symbols-outlined absolute left-3.5 text-slate-500 pointer-events-none text-xl">
                                            lock
                                        </span>
                                        <input 
                                            id="password" 
                                            name="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            type={showPassword ? "text" : "password"}
                                            className="w-full bg-transparent border-none py-3 pl-11 pr-11 text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none rounded-xl" 
                                            placeholder="••••••••" 
                                            style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }}
                                        />
                                        <button 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 text-slate-500 hover:text-slate-900 transition-colors focus:outline-none p-1 rounded-lg hover:bg-slate-200" 
                                            type="button"
                                            title={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs font-semibold mt-1">{errors.password}</p>}
                                </div>

                                {/* Security Captcha */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5" style={{ color: '#0f172a' }} htmlFor="captcha">
                                            <span>Security Captcha</span>
                                            {isCaptchaComplete && (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    autoSubmitting
                                                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/40 animate-pulse'
                                                        : 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/40 animate-in fade-in zoom-in duration-200'
                                                }`}>
                                                    <span className="material-symbols-outlined text-[12px]">{autoSubmitting ? 'sync' : 'verified'}</span>
                                                    <span>{autoSubmitting ? 'Auto Logging In...' : 'Verified'}</span>
                                                </span>
                                            )}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleRefreshCaptcha}
                                            disabled={refreshingCaptcha}
                                            className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 focus:outline-none disabled:opacity-50"
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
                                        <div className={`relative flex-1 flex items-center rounded-xl border-2 transition-all duration-300 shadow-inner ${
                                            isCaptchaComplete
                                                ? 'bg-emerald-50/70 border-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.3)]'
                                                : 'bg-slate-100 hover:bg-slate-50 focus-within:bg-white border-slate-300 focus-within:border-blue-600'
                                        }`}>
                                            <input 
                                                id="captcha" 
                                                name="captcha"
                                                value={data.captcha}
                                                onChange={(e) => setData('captcha', e.target.value.replace(/\D/g, ''))}
                                                className="w-full bg-transparent border-none py-2.5 px-3 text-base font-mono font-black tracking-widest text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none rounded-xl" 
                                                placeholder="5-digit code" 
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={5}
                                                autoComplete="off"
                                                required
                                                style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }}
                                            />
                                            {autoSubmitting ? (
                                                <div className="absolute right-2.5 flex items-center pointer-events-none text-blue-600">
                                                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                </div>
                                            ) : isCaptchaComplete ? (
                                                <div className="absolute right-2.5 flex items-center pointer-events-none text-emerald-600 animate-in zoom-in duration-200">
                                                    <span className="material-symbols-outlined text-xl">check_circle</span>
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Captcha SVG Preview */}
                                        <div 
                                            onClick={handleRefreshCaptcha}
                                            className="cursor-pointer border-2 border-slate-300 hover:border-blue-500 rounded-xl overflow-hidden shrink-0 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] select-none bg-white"
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
                                            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 flex items-center justify-center transition-colors border-2 border-slate-300 shrink-0 disabled:opacity-50"
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
                                    disabled={processing || autoSubmitting}
                                    className={`relative w-full py-3.5 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 mt-2 overflow-hidden disabled:opacity-50 select-none cursor-pointer ${
                                        isCaptchaComplete
                                            ? 'text-white border border-white/70 shadow-2xl glass-btn-active'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-[2px] shadow-md shadow-blue-500/30'
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
                                    {isCaptchaComplete && !processing && !autoSubmitting && (
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

                                    {processing || autoSubmitting ? (
                                        <span className="flex items-center justify-center gap-2 relative z-10 text-white">
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {autoSubmitting ? 'Auto Signing In...' : 'Signing In...'}
                                        </span>
                                    ) : (
                                        <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                                            <span className="tracking-wide font-black">
                                                {isCaptchaComplete ? 'Sign In / Login' : 'Sign In'}
                                            </span>
                                            <span className={`material-symbols-outlined transition-transform duration-300 ${isCaptchaComplete ? 'translate-x-1' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                arrow_forward
                                            </span>
                                        </span>
                                    )}
                                </button>
                                
                                <div className="text-center mt-2">
                                    <span className="text-xs sm:text-sm font-semibold text-slate-600" style={{ color: '#475569' }}>Don't have an account? </span>
                                    <Link className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline" href="/register">Register</Link>
                                </div>
                            </form>

                            {/* Trust Badges */}
                            <div className="flex flex-row justify-center items-center gap-3 mt-5 pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800">
                                    <span className="material-symbols-outlined text-emerald-600 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
                                    <span className="text-[11px] font-bold">100% Secure Gateway</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800">
                                    <span className="material-symbols-outlined text-emerald-600 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                                    <span className="text-[11px] font-bold">Trusted by 10M+ citizens</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </FrontendLayout>
    );
}
