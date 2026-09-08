import React, { useEffect, useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import FrontendLayout from '../../Layouts/FrontendLayout';
import FooterParticles from '../../Components/FooterParticles';

// Notice active for 10 days: Sep 8, 2026 -> Sep 18, 2026 23:59:59 IST
const EXPIRY_TIMESTAMP = new Date('2026-09-18T23:59:59+05:30').getTime();

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
    });

    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isNoticeActive = Date.now() <= EXPIRY_TIMESTAMP;

    useEffect(() => {
        setMounted(true);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post('/login');
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
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-primary mb-1">Welcome back</h1>
                                <p className="text-xs text-on-surface-variant">Sign in to access your CSP services dashboard</p>
                            </div>

                            {/* Prominent Red Alert: Deleted Accounts Notice (Active for 10 Days) */}
                            {isNoticeActive && (
                                <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-600 via-red-600 to-rose-700 border-2 border-red-400 text-white shadow-xl shadow-red-600/30">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 border border-white/30 flex-shrink-0 flex items-center justify-center text-white shadow-inner">
                                            <span className="material-symbols-outlined text-2xl sm:text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                warning
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="bg-white text-red-700 text-xs font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm">
                                                    जरूरी सूचना
                                                </span>
                                                <span className="text-xs text-red-100 font-semibold tracking-wide">
                                                    Notice
                                                </span>
                                            </div>
                                            
                                            <p className="text-base sm:text-lg font-black leading-snug text-white drop-shadow-sm">
                                                जिस भी यूज़र की ID में Email नहीं थी, वह डिलीट कर दी गई है!
                                            </p>
                                            
                                            <p className="text-sm font-medium text-red-100 mt-1.5 leading-relaxed">
                                                कृपया अपनी वैध Email ID के साथ नया रजिस्ट्रेशन करें।
                                            </p>

                                            <div className="mt-3.5">
                                                <Link
                                                    href="/register"
                                                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white text-red-700 hover:bg-red-50 active:scale-[0.98] font-bold text-sm sm:text-base rounded-xl shadow-md transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                        person_add
                                                    </span>
                                                    नया रजिस्ट्रेशन करें (New Registration)
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
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
