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
            <div className="bg-surface-container-lowest min-h-screen flex items-center justify-center p-4 md:p-8 font-body-md text-on-background">
                <main className="w-full max-w-[1200px] h-auto lg:h-[800px] flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-[0px_4px_20px_rgba(0,51,102,0.05)] border border-surface-variant bg-surface">
                    {/* Left Side: Illustration */}
                    <section className="hidden lg:flex w-full lg:w-1/2 relative bg-surface-container-low items-center justify-center p-12">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-secondary-fixed/20 z-0"></div>
                        <div className="relative z-10 w-full h-full max-w-[500px] flex flex-col items-center justify-center">
                            <img alt="Digital India Fintech Illustration" className="object-contain w-full h-auto drop-shadow-xl" src="https://lh3.googleusercontent.com/aida/AP1WRLupiMlzu2jHhBj8MrTNRXQlMf5crT1xb2RLG5yLbMEBZnusgCvRRt_62SmnaDTenNIrxWZ4bfSx1A-hKLY5I4MrRtqHGE5IoxvcbwoKAzNdtpOJLeCcMAk0CGYiDK4yUq9Si12d5ZG5zFGu3EjMX0-ojUTzv8Ynhm6kOBJVSTsTEH0il-wutMd-puDyrGJ6BmW5LCoiJg05T778uUybKXXjOShZouhOqftgb0VXTj85-fjvx7FcbgsnCSM" />
                            <div className="mt-12 text-center">
                                <h2 className="text-headline-lg font-headline-lg text-primary mb-4">Empowering Digital Citizens</h2>
                                <p className="text-body-lg font-body-lg text-on-surface-variant">Streamlining your essential documentation with secure, private assistance.</p>
                            </div>
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

                    {/* Right Side: Registration Form */}
                    <section className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-surface-container-lowest relative">
                        <div className="max-w-[400px] w-full mx-auto relative z-10">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-primary text-[32px]">task</span>
                                    <h1 className="text-headline-md font-headline-md font-bold text-primary">CertifyIndia</h1>
                                </div>
                                <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-on-surface mb-2">Create an account</h2>
                                <p className="text-body-md font-body-md text-on-surface-variant">Join 10M+ happy citizens for quick 2-minute setup.</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={submit} className="space-y-5">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-label-sm font-label-sm text-on-surface mb-1" htmlFor="name">Full Name</label>
                                    <div className="relative flex items-center input-field bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200">
                                        <span className="material-symbols-outlined text-outline absolute left-3">person</span>
                                        <input
                                            id="name"
                                            name="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full bg-transparent border-none py-3 pl-10 pr-4 text-body-md text-on-surface focus:ring-0 focus:outline-none rounded-lg"
                                            placeholder="Rahul Sharma"
                                            type="text"
                                        />
                                    </div>
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-label-sm font-label-sm text-on-surface mb-1" htmlFor="phone">Phone Number</label>
                                    <div className="relative flex items-center input-field bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200">
                                        <span className="material-symbols-outlined text-outline absolute left-3">phone_iphone</span>
                                        <input
                                            id="phone"
                                            name="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="w-full bg-transparent border-none py-3 pl-10 pr-4 text-body-md text-on-surface focus:ring-0 focus:outline-none rounded-lg"
                                            placeholder="+91 98765 43210"
                                            type="tel"
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>

                                {/* Email Address */}
                                <div>
                                    <label className="block text-label-sm font-label-sm text-on-surface mb-1" htmlFor="email">Email Address</label>
                                    <div className="relative flex items-center input-field bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200">
                                        <span className="material-symbols-outlined text-outline absolute left-3">mail</span>
                                        <input
                                            id="email"
                                            name="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full bg-transparent border-none py-3 pl-10 pr-4 text-body-md text-on-surface focus:ring-0 focus:outline-none rounded-lg"
                                            placeholder="rahul@example.com"
                                            type="email"
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-label-sm font-label-sm text-on-surface mb-1" htmlFor="password">Password</label>
                                    <div className="relative flex items-center input-field bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200">
                                        <span className="material-symbols-outlined text-outline absolute left-3">lock</span>
                                        <input
                                            id="password"
                                            name="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            type={showPassword ? "text" : "password"}
                                            className="w-full bg-transparent border-none py-3 pl-10 pr-10 text-body-md text-on-surface focus:ring-0 focus:outline-none rounded-lg"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 text-outline hover:text-primary transition-colors focus:outline-none"
                                            type="button"
                                        >
                                            <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>
                                
                                {/* Password Confirmation Field */}
                                <div>
                                    <label className="block text-label-sm font-label-sm text-on-surface mb-1" htmlFor="password_confirmation">Confirm Password</label>
                                    <div className="relative flex items-center input-field bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200">
                                        <span className="material-symbols-outlined text-outline absolute left-3">lock</span>
                                        <input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            type={showPasswordConfirmation ? "text" : "password"}
                                            className="w-full bg-transparent border-none py-3 pl-10 pr-10 text-body-md text-on-surface focus:ring-0 focus:outline-none rounded-lg"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                            className="absolute right-3 text-outline hover:text-primary transition-colors focus:outline-none"
                                            type="button"
                                        >
                                            <span className="material-symbols-outlined">{showPasswordConfirmation ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="flex items-start gap-2 pt-2">
                                    <input className="mt-1 rounded border-outline text-primary focus:ring-primary h-4 w-4 bg-[#F1F5F9] border-transparent" id="terms" required="" type="checkbox" />
                                    <label className="text-body-sm font-body-sm text-on-surface-variant leading-tight" htmlFor="terms">
                                        I agree to the <a className="text-secondary hover:underline" href="#">Terms of Service</a> and <a className="text-secondary hover:underline" href="#">Privacy Policy</a>.
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button 
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-primary hover:bg-primary/90 text-on-primary py-3 rounded-lg text-label-md font-label-md font-semibold transition-all duration-200 active:scale-[0.98] mt-6 shadow-sm disabled:opacity-50"
                                >
                                    {processing ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>

                            {/* Footer / Login Link */}
                            <div className="mt-8 text-center">
                                <p className="text-body-sm font-body-sm text-on-surface-variant">
                                    Already have an account? <Link className="text-secondary font-semibold hover:underline" href="/login">Sign In</Link>
                                </p>
                            </div>

                            {/* Disclaimer */}
                            <div className="mt-12 pt-6 border-t border-outline-variant/30 text-center">
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
