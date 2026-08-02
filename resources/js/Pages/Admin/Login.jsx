import React, { useEffect, useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import FrontendLayout from '../../Layouts/FrontendLayout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <FrontendLayout>
            <div className="relative flex-grow flex items-center justify-center p-4 py-24 bg-slate-900 overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
                <Head title="Login - CSP Jaankari" />
                
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes blob {
                        0% { transform: translate(0px, 0px) scale(1); }
                        33% { transform: translate(30px, -50px) scale(1.1); }
                        66% { transform: translate(-20px, 20px) scale(0.9); }
                        100% { transform: translate(0px, 0px) scale(1); }
                    }
                    .animate-blob { animation: blob 7s infinite; }
                    .animation-delay-2000 { animation-delay: 2s; }
                    .animation-delay-4000 { animation-delay: 4s; }
                    
                    @keyframes slideUpFade {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-slide-up { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                    
                    @keyframes shimmer {
                        100% { transform: translateX(100%); }
                    }
                `}} />

                {/* Background Animations */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000"></div>
                </div>
                
                <div className={`relative z-10 w-full max-w-lg transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="backdrop-blur-xl bg-white/10 p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-white/20 relative overflow-hidden">
                        {/* Glass glare effect */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                        
                        <div className="text-center mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/30 transform hover:scale-110 hover:rotate-3 transition-all duration-300">
                                <span className="text-2xl font-extrabold text-white">CJ</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h2>
                            <p className="text-slate-300">Sign in to your CSP Jaankari account.</p>
                        </div>
                        
                        <form onSubmit={submit} className="space-y-6">
                            {/* Email/Phone Field */}
                            <div className="relative group animate-slide-up" style={{ animationDelay: '200ms' }}>
                                <input
                                    id="email"
                                    type="text"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="peer w-full bg-white/5 border border-white/10 rounded-xl px-4 pt-6 pb-2 text-white placeholder-transparent focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 outline-none"
                                    placeholder="Email or Phone Number"
                                    required
                                />
                                <label 
                                    htmlFor="email" 
                                    className="absolute left-4 top-2 text-slate-400 text-xs transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400 cursor-text pointer-events-none"
                                >
                                    Email Address or Phone Number
                                </label>
                                {errors.email && <p className="text-red-400 text-xs mt-2 pl-2 animate-pulse">{errors.email}</p>}
                            </div>

                            {/* Password Field */}
                            <div className="relative group animate-slide-up" style={{ animationDelay: '300ms' }}>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="peer w-full bg-white/5 border border-white/10 rounded-xl px-4 pt-6 pb-2 text-white placeholder-transparent focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 outline-none"
                                    placeholder="Password"
                                    required
                                />
                                <label 
                                    htmlFor="password" 
                                    className="absolute left-4 top-2 text-slate-400 text-xs transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400 cursor-text pointer-events-none"
                                >
                                    Password
                                </label>
                                {errors.password && <p className="text-red-400 text-xs mt-2 pl-2 animate-pulse">{errors.password}</p>}
                            </div>

                            <div className="pt-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="relative w-full group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 disabled:opacity-50 hover:-translate-y-0.5"
                                >
                                    <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></span>
                                    <span className="relative flex items-center justify-center">
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Signing In...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>
                        
                        <div className="mt-8 text-center animate-slide-up" style={{ animationDelay: '500ms' }}>
                            <p className="text-sm text-slate-400">
                                Don't have an account?{' '}
                                <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors hover:underline decoration-2 underline-offset-4">
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}
