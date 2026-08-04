import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import FrontendLayout from '../../Layouts/FrontendLayout';
import FooterParticles from '../../Components/FooterParticles';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
    });

    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <FrontendLayout>
            <Head title="Sign Up - CSP Jaankari" />
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

                    {/* Right: Register form — standalone card */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                        <main className="w-full max-w-[460px] rounded-2xl overflow-hidden shadow-[0px_8px_32px_rgba(0,102,255,0.15)] border-2 border-blue-600 bg-surface">
                            <div className="w-full relative z-10 p-8">
                                <div className="mb-8">
                                    <h1 className="text-2xl font-bold text-primary mb-2">Create an account</h1>
                                    <p className="text-body-md font-body-md text-on-surface-variant">Join 10M+ happy citizens for quick 2-minute setup.</p>
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
                                                required
                                            />
                                        </div>
                                        {errors.login && <p className="text-red-500 text-xs mt-1">{errors.login}</p>}
                                    </div>
                                    <div className="flex flex-col gap-base">
                                        <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
                                        <div className="relative flex items-center input-field bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200">
                                            <input 
                                                id="password" 
                                                name="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                type={showPassword ? "text" : "password"}
                                                className="w-full bg-transparent border-none py-3 pl-4 pr-10 text-body-md text-on-surface focus:ring-0 focus:outline-none rounded-lg" 
                                                placeholder="••••••••" 
                                                required
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
                                    
                                    <div className="flex items-start gap-2 pt-2">
                                        <input className="mt-1 rounded border-outline text-primary focus:ring-primary h-4 w-4 bg-[#F1F5F9] border-transparent" id="terms" required type="checkbox" />
                                        <label className="text-body-sm font-body-sm text-on-surface-variant leading-tight" htmlFor="terms">
                                            I agree to the <a className="text-secondary hover:underline" href="#">Terms of Service</a> and <a className="text-secondary hover:underline" href="#">Privacy Policy</a>.
                                        </label>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:bg-primary/90 hover:-translate-y-[2px] transition-all shadow-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                                    >
                                        {processing ? 'Creating Account...' : 'Create Account'}
                                        {!processing && <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>}
                                    </button>
                                    
                                    <div className="text-center mt-2">
                                        <span className="font-body-sm text-body-sm text-on-surface-variant">Already have an account? </span>
                                        <Link className="font-label-md text-label-md text-secondary hover:underline" href="/login">Sign In</Link>
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
