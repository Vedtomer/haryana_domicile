import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import FrontendLayout from '../../Layouts/FrontendLayout';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

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
            <div className="bg-slate-50 min-h-screen flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900 font-sans">
                <main className="flex-grow flex flex-col justify-center px-4 sm:px-6 pb-8 max-w-md mx-auto w-full mt-10">
                    {/* Hero Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create an account</h1>
                        <p className="text-base text-slate-600">Join 10M+ citizens for quick certificate setup.</p>
                    </div>
                    {/* Register Form Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-4">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="name">Full Name</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">badge</span>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                                        placeholder="John Doe"
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Phone Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="phone">Phone Number</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">phone_iphone</span>
                                    <input
                                        id="phone"
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                                        placeholder="10-digit mobile number"
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="email">Email Address</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">mail</span>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                                        placeholder="example@email.com"
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="password">Password</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">lock</span>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                                        placeholder="Create password"
                                        required
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                        type="button"
                                        aria-label="Toggle password visibility"
                                    >
                                        <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            {/* Password Confirmation Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="password_confirmation">Confirm Password</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">lock</span>
                                    <input
                                        id="password_confirmation"
                                        type={showPasswordConfirmation ? "text" : "password"}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                                        placeholder="Confirm password"
                                        required
                                    />
                                    <button
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                        type="button"
                                        aria-label="Toggle confirm password visibility"
                                    >
                                        <span className="material-symbols-outlined">{showPasswordConfirmation ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Sign Up Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3 px-6 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
                            >
                                {processing ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                Already have an account? <Link className="text-blue-600 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded" href="/login">Sign in</Link>
                            </p>
                        </div>
                    </div>
                    {/* Trust Badges */}
                    <div className="flex flex-col gap-2 mt-4 w-full">
                        <div className="bg-white rounded-lg p-3 flex items-center justify-center gap-3 border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-green-700" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                            </div>
                            <span className="text-sm font-medium text-slate-900 text-center">100% Secure Service Gateway</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 flex items-center justify-center gap-3 border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                            </div>
                            <span className="text-sm font-medium text-slate-900 text-center">Trusted by 10M+ citizens</span>
                        </div>
                    </div>
                </main>
            </div>
        </FrontendLayout>
    );
}
