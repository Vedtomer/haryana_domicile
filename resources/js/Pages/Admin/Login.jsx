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
            <div className="bg-slate-50 min-h-screen flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900 font-sans">
                <main className="flex-grow flex flex-col justify-center px-4 sm:px-6 pb-8 max-w-md mx-auto w-full mt-10">
                    {/* Hero Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
                        <p className="text-base text-slate-600">Secure access to your certificates.</p>
                    </div>
                    {/* Login Form Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-4">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Input Group: Identifier */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2" htmlFor="login">Email or Phone Number</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">person</span>
                                    <input
                                        id="login"
                                        name="login"
                                        type="text"
                                        value={data.login}
                                        onChange={(e) => setData('login', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                                        placeholder="Enter your registered ID"
                                        required
                                    />
                                </div>
                                {errors.login && <p className="text-red-500 text-xs mt-1">{errors.login}</p>}
                            </div>
                            {/* Input Group: Password */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-slate-600" htmlFor="password">Password</label>
                                    <a className="text-sm font-medium text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded" href="#">Forgot Password?</a>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">lock</span>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                                        placeholder="Enter your password"
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
                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3 px-6 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
                            >
                                {processing ? 'Signing In...' : 'Sign In'}
                                {!processing && <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>}
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                Don't have an account? <Link className="text-blue-600 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded" href="/register">Register here</Link>
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
