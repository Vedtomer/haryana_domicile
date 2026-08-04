import React, { useEffect, useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import FrontendLayout from '../../Layouts/FrontendLayout';

export default function Login() {
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
        post('/login');
    };

    return (
        <FrontendLayout>
            <Head title="Login - CSP Jaankari" />
            <div className="bg-surface-container-lowest min-h-screen flex items-center justify-center p-4 md:p-8 font-body-md text-on-background">
                <main className="w-full max-w-[1200px] h-auto lg:h-[800px] flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-[0px_4px_20px_rgba(0,51,102,0.05)] border border-surface-variant bg-surface">
                    {/* Left Side: Illustration */}
                    <section className="hidden lg:flex w-full lg:w-1/2 relative bg-gradient-to-br from-surface to-primary-fixed/20 p-12 items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0,101,141,0.2) 0%, transparent 70%)' }}></div>
                        <div className="relative z-10 w-full h-full max-w-[500px] flex flex-col items-center justify-center">
                            <img alt="Digital India Fintech Illustration" className="object-contain w-full h-auto drop-shadow-2xl transform transition-transform duration-700 hover:scale-105" src="https://lh3.googleusercontent.com/aida/AP1WRLupiMlzu2jHhBj8MrTNRXQlMf5crT1xb2RLG5yLbMEBZnusgCvRRt_62SmnaDTenNIrxWZ4bfSx1A-hKLY5I4MrRtqHGE5IoxvcbwoKAzNdtpOJLeCcMAk0CGYiDK4yUq9Si12d5ZG5zFGu3EjMX0-ojUTzv8Ynhm6kOBJVSTsTEH0il-wutMd-puDyrGJ6BmW5LCoiJg05T778uUybKXXjOShZouhOqftgb0VXTj85-fjvx7FcbgsnCSM" />
                        </div>
                        {/* Trust Badge Overlay */}
                        <div className="absolute bottom-8 left-8 glass-panel px-6 py-4 rounded-xl flex items-center gap-4 z-20">
                            <div className="w-12 h-12 rounded-full bg-tertiary-fixed/20 flex items-center justify-center text-on-tertiary-container">
                                <span className="material-symbols-outlined text-[24px]">verified_user</span>
                            </div>
                            <div>
                                <p className="text-label-md font-label-md text-on-surface">Secure Platform</p>
                                <p className="text-label-sm font-label-sm text-on-surface-variant">Bank-grade encryption</p>
                            </div>
                        </div>
                    </section>

                    {/* Right Side: Login Form */}
                    <section className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-surface-container-lowest relative">
                        <div className="max-w-[400px] w-full mx-auto relative z-10">
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2">Welcome back</h1>
                                <p className="font-body-md text-body-md text-on-surface-variant">Secure access to your certificate assistance dashboard.</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={submit} className="flex flex-col gap-stack-md">
                                <div className="flex flex-col gap-base">
                                    <label className="font-label-md text-label-md text-on-surface" htmlFor="login">Email or Mobile Number</label>
                                    <div className="relative flex items-center input-field bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200">
                                        <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none">contact_phone</span>
                                        <input 
                                            id="login" 
                                            name="login"
                                            value={data.login}
                                            onChange={(e) => setData('login', e.target.value)}
                                            className="w-full bg-transparent border-none py-3 pl-10 pr-4 text-body-md text-on-surface focus:ring-0 focus:outline-none rounded-lg" 
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
                                        <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none">lock</span>
                                        <input 
                                            id="password" 
                                            name="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            type={showPassword ? "text" : "password"}
                                            className="w-full bg-transparent border-none py-3 pl-10 pr-10 text-body-md text-on-surface focus:ring-0 focus:outline-none rounded-lg" 
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
                            
                            {/* Disclaimer */}
                            <div className="mt-8 pt-6 text-center">
                                <p className="text-label-sm font-label-sm text-outline flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">info</span>
                                    Private agency assistance portal. Not a government entity.
                                </p>
                            </div>
                        </div>
                        {/* Subtle decorative background element for right side */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/30 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    </section>
                </main>
            </div>
        </FrontendLayout>
    );
}
