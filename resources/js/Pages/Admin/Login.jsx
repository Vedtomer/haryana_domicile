import React from 'react';
import { useForm, Head } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Head title="Login - CSP Jaankari" />
            
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-8 text-center text-white">
                    <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
                    <p className="mt-2 text-blue-100">Sign in to your CSP Jaankari account.</p>
                </div>
                
                <div className="p-8">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field with Material floating label style */}
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="peer w-full border-b-2 border-gray-300 bg-transparent pt-4 pb-1 text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-0 transition-colors"
                                placeholder=" "
                                required
                            />
                            <label 
                                htmlFor="email" 
                                className="absolute left-0 top-1 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-600"
                            >
                                Email Address
                            </label>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="peer w-full border-b-2 border-gray-300 bg-transparent pt-4 pb-1 text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-0 transition-colors"
                                placeholder=" "
                                required
                            />
                            <label 
                                htmlFor="password" 
                                className="absolute left-0 top-1 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-600"
                            >
                                Password
                            </label>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all uppercase tracking-wider text-sm disabled:opacity-50"
                            >
                                {processing ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <a href="/register" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">
                                Sign up here
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="absolute top-4 left-4">
                <a href="/" className="flex items-center text-gray-500 hover:text-blue-600">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Home
                </a>
            </div>
        </div>
    );
}
