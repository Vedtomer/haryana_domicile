import React, { useEffect, useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import FrontendLayout from '../../Layouts/FrontendLayout';
import FooterParticles from '../../Components/FooterParticles';
import axios from 'axios';

export default function Login({ captchaSvg: initialCaptchaSvg = '' }) {
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        captcha: '',
    });

    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [captchaSvg, setCaptchaSvg] = useState(initialCaptchaSvg);
    const [refreshingCaptcha, setRefreshingCaptcha] = useState(false);

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
                        <main className="w-full max-w-[460px] rounded-2xl overflow-hidden shadow-[0px_8px_32px_rgba(0,102,255,0.15)] border-2 border-blue-600 bg-surface">
                            {/* Right Side: Login Form */}
                            <div className="w-full relative z-10 p-6 sm:p-8">
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-primary mb-1">Welcome back</h1>
                                <p className="text-xs text-on-surface-variant">Sign in to access your CSP services dashboard</p>
                            </div>

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
                                        <a className="font-label-sm text-label-sm text-secondary hover:underline" href="#">Forgot Password?</a>
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
                                        <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="captcha">
                                            Security Captcha
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
                                        <div className="relative flex-1 flex items-center input-field bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200 focus-within:border-blue-500 focus-within:bg-white">
                                            <input 
                                                id="captcha" 
                                                name="captcha"
                                                value={data.captcha}
                                                onChange={(e) => setData('captcha', e.target.value.replace(/\D/g, ''))}
                                                className="w-full bg-transparent border-none py-2.5 px-3 text-base font-mono font-bold tracking-widest text-slate-800 focus:ring-0 focus:outline-none rounded-lg" 
                                                placeholder="5-digit code" 
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={5}
                                                autoComplete="off"
                                                required
                                            />
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
                                
                                <button 
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:bg-primary/90 hover:-translate-y-[2px] transition-all shadow-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                                >
                                    {processing ? 'Signing In...' : 'Sign In'}
                                    {!processing && <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>}
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
