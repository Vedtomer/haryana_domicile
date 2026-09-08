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

    // Modal popup state for deleted accounts notice (open by default on visit)
    const [showNoticeModal, setShowNoticeModal] = useState(isNoticeActive);
    const [modalAnimating, setModalAnimating] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isNoticeActive) {
            const timer = setTimeout(() => setModalAnimating(true), 50);
            return () => clearTimeout(timer);
        }
    }, [isNoticeActive]);

    const closeNoticeModal = () => {
        setModalAnimating(false);
        setTimeout(() => setShowNoticeModal(false), 250);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <FrontendLayout>
            <Head title="Login - CSP Jaankari" />

            {/* Critical Alert Modal Popup (Active for 10 Days) */}
            {isNoticeActive && showNoticeModal && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    {/* Dark Backdrop with Blur */}
                    <div 
                        className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-out ${
                            modalAnimating ? 'opacity-100' : 'opacity-0'
                        }`}
                        onClick={closeNoticeModal}
                    />

                    {/* Modal Dialog Card */}
                    <div 
                        className={`relative w-full max-w-lg bg-white rounded-3xl shadow-[0_25px_70px_rgba(220,38,38,0.45)] border-4 border-red-600 overflow-hidden transform transition-all duration-300 ease-out z-10 ${
                            modalAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4'
                        }`}
                    >
                        {/* Top Red Header Strip */}
                        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 p-5 sm:p-6 text-white text-center relative shadow-md">
                            {/* Close 'X' Button in Header */}
                            <button
                                onClick={closeNoticeModal}
                                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/25 hover:bg-black/45 text-white flex items-center justify-center transition-colors focus:outline-none"
                                title="बंद करें (Close)"
                                type="button"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>

                            {/* Animated Warning Icon */}
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 shadow-inner mb-2.5">
                                <span className="material-symbols-outlined text-4xl text-white animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    warning
                                </span>
                            </div>

                            <div>
                                <span className="inline-block bg-white text-red-700 text-xs font-black uppercase px-3 py-1 rounded-full shadow tracking-wider mb-1">
                                    🚨 जरूरी सूचना / IMPORTANT NOTICE
                                </span>
                                <p className="text-xs text-red-100 font-semibold">10 दिन तक वैध (Notice Active for 10 Days)</p>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 sm:p-7 text-center">
                            <h2 className="text-xl sm:text-2xl font-black text-red-600 leading-snug mb-3">
                                जिस भी यूज़र की ID में Email नहीं थी, वह डिलीट कर दी गई है!
                            </h2>

                            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-5 text-gray-800 text-sm sm:text-base leading-relaxed text-left">
                                <p className="font-bold text-red-900 mb-1 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-red-600 text-lg">info</span>
                                    खाता क्यों हटाया गया?
                                </p>
                                <p className="text-gray-700 text-sm">
                                    सिक्योरिटी और Email OTP सत्यापन के नए नियम के तहत, जिन खातों में वैध ईमेल आईडी नहीं थी, उन्हें सिस्टम से हमेशा के लिए हटा दिया गया है।
                                </p>
                                <p className="mt-2 text-red-700 font-bold text-sm sm:text-base">
                                    👉 कृपया अपनी वैध व चालू Email ID के साथ नया रजिस्ट्रेशन करें।
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    href="/register"
                                    className="flex-1 py-3.5 px-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-base rounded-xl shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        person_add
                                    </span>
                                    नया रजिस्ट्रेशन करें (Register Now)
                                </Link>

                                <button
                                    type="button"
                                    onClick={closeNoticeModal}
                                    className="py-3.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm sm:text-base rounded-xl transition-all border border-gray-300"
                                >
                                    ठीक है, समझ गया (Close)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
