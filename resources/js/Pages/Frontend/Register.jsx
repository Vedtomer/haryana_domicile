import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import FrontendLayout from '../../Layouts/FrontendLayout';
import FooterParticles from '../../Components/FooterParticles';

export default function Register() {
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        otp: '',
    });

    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState(1); // 1 = Details, 2 = OTP Verification
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpMessage, setOtpMessage] = useState('');
    const [otpGeneralError, setOtpGeneralError] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Cooldown countdown timer for resend OTP
    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();

        clearErrors();
        setOtpGeneralError('');

        if (!data.name.trim()) {
            setError('name', 'Please enter your full name.');
            return;
        }
        if (!data.phone.trim()) {
            setError('phone', 'Please enter your mobile number.');
            return;
        }
        if (!data.email.trim()) {
            setError('email', 'Please enter a valid email address.');
            return;
        }
        if (!data.password || data.password.length < 4) {
            setError('password', 'Password must be at least 4 characters.');
            return;
        }
        if (!termsAccepted) {
            setOtpGeneralError('Please agree to the Terms of Service and Privacy Policy.');
            return;
        }

        setSendingOtp(true);

        try {
            const res = await axios.post('/register/send-otp', {
                name: data.name,
                phone: data.phone,
                email: data.email,
                password: data.password,
            });

            if (res.data.success) {
                setStep(2);
                setOtpMessage(res.data.message || `OTP sent to ${data.email}`);
                setCooldown(res.data.cooldown || 60);
                setData('otp', '');
            }
        } catch (err) {
            if (err.response?.status === 422) {
                const serverErrors = err.response.data.errors || {};
                Object.keys(serverErrors).forEach((key) => {
                    setError(key, serverErrors[key][0]);
                });
            } else if (err.response?.status === 429) {
                setOtpGeneralError(err.response.data.message || 'Too many OTP requests. Please wait a moment.');
                if (err.response.data.cooldown) {
                    setCooldown(err.response.data.cooldown);
                }
            } else {
                setOtpGeneralError(err.response?.data?.message || 'Failed to send OTP email. Please try again.');
            }
        } finally {
            setSendingOtp(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (cooldown > 0 || sendingOtp) return;
        setOtpGeneralError('');
        setSendingOtp(true);

        try {
            const res = await axios.post('/register/send-otp', {
                name: data.name,
                phone: data.phone,
                email: data.email,
                password: data.password,
            });

            if (res.data.success) {
                setOtpMessage(res.data.message || `A new OTP has been sent to ${data.email}`);
                setCooldown(res.data.cooldown || 60);
            }
        } catch (err) {
            if (err.response?.status === 429) {
                setOtpGeneralError(err.response.data.message || 'Please wait before requesting another OTP.');
                if (err.response.data.cooldown) {
                    setCooldown(err.response.data.cooldown);
                }
            } else {
                setOtpGeneralError(err.response?.data?.message || 'Unable to resend OTP right now.');
            }
        } finally {
            setSendingOtp(false);
        }
    };

    // Step 2: Verify OTP & Complete Registration
    const handleVerifyAndRegister = (e) => {
        e.preventDefault();
        clearErrors('otp');

        if (!data.otp || data.otp.length !== 6) {
            setError('otp', 'Please enter the complete 6-digit OTP.');
            return;
        }

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
                                
                                {step === 1 ? (
                                    /* ==================== STEP 1: REGISTRATION DETAILS ==================== */
                                    <>
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <h1 className="text-2xl font-bold text-primary">Create an account</h1>
                                                <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                                                    Step 1 of 2
                                                </span>
                                            </div>
                                            <p className="text-body-md font-body-md text-on-surface-variant">Join 10M+ happy citizens for quick 2-minute setup.</p>
                                        </div>

                                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                            <span className="material-symbols-outlined text-red-600 mt-0.5 text-base">warning</span>
                                            <p className="text-xs text-red-700 font-semibold leading-snug">
                                                ध्यान दें: अगर आप रजिस्ट्रेशन के बाद वॉलेट रिचार्ज नहीं करते हैं या 10 दिनों तक कोई काम नहीं करते हैं, तो आपकी आईडी डिलीट कर दी जाएगी।
                                            </p>
                                        </div>

                                        {otpGeneralError && (
                                            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl text-xs text-red-800 font-medium">
                                                ⚠️ {otpGeneralError}
                                            </div>
                                        )}

                                        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                                            {/* Full Name */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-label-md text-xs font-semibold text-on-surface" htmlFor="name">Full Name</label>
                                                <div className="relative flex items-center bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200">
                                                    <input 
                                                        id="name" 
                                                        name="name"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        className="w-full bg-transparent border-none py-2.5 px-4 text-sm text-on-surface focus:ring-0 focus:outline-none rounded-lg" 
                                                        placeholder="Enter your full name" 
                                                        type="text"
                                                        required
                                                    />
                                                </div>
                                                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                            </div>

                                            {/* Mobile Number */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-label-md text-xs font-semibold text-on-surface" htmlFor="phone">Mobile Number</label>
                                                <div className="relative flex items-center bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200">
                                                    <input 
                                                        id="phone" 
                                                        name="phone"
                                                        value={data.phone}
                                                        onChange={(e) => setData('phone', e.target.value)}
                                                        className="w-full bg-transparent border-none py-2.5 px-4 text-sm text-on-surface focus:ring-0 focus:outline-none rounded-lg" 
                                                        placeholder="10-digit mobile number" 
                                                        type="tel"
                                                        required
                                                    />
                                                </div>
                                                {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                                            </div>

                                            {/* Email Address */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-label-md text-xs font-semibold text-on-surface flex items-center justify-between" htmlFor="email">
                                                    <span>Email Address</span>
                                                    <span className="text-[11px] text-blue-600 font-normal">OTP will be sent here</span>
                                                </label>
                                                <div className="relative flex items-center bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200">
                                                    <input 
                                                        id="email" 
                                                        name="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        className="w-full bg-transparent border-none py-2.5 px-4 text-sm text-on-surface focus:ring-0 focus:outline-none rounded-lg" 
                                                        placeholder="e.g. yourname@gmail.com" 
                                                        type="email"
                                                        required
                                                    />
                                                </div>
                                                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                            </div>

                                            {/* Password */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-label-md text-xs font-semibold text-on-surface" htmlFor="password">Password</label>
                                                <div className="relative flex items-center bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200">
                                                    <input 
                                                        id="password" 
                                                        name="password"
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        type={showPassword ? "text" : "password"}
                                                        className="w-full bg-transparent border-none py-2.5 pl-4 pr-10 text-sm text-on-surface focus:ring-0 focus:outline-none rounded-lg" 
                                                        placeholder="••••••••" 
                                                        required
                                                    />
                                                    <button 
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none" 
                                                        type="button"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                                    </button>
                                                </div>
                                                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                                            </div>
                                            
                                            {/* Terms Checkbox */}
                                            <div className="flex items-start gap-2 pt-1">
                                                <input 
                                                    className="mt-1 rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 bg-[#F1F5F9]" 
                                                    id="terms" 
                                                    checked={termsAccepted}
                                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                                    required 
                                                    type="checkbox" 
                                                />
                                                <label className="text-xs text-slate-600 leading-tight" htmlFor="terms">
                                                    I agree to the <a className="text-blue-600 hover:underline" href="#">Terms of Service</a> and <a className="text-blue-600 hover:underline" href="#">Privacy Policy</a>.
                                                </label>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                                <Link 
                                                    href="/login"
                                                    className="w-full sm:w-1/3 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-300 transition-all flex items-center justify-center text-center"
                                                >
                                                    Cancel
                                                </Link>
                                                <button 
                                                    type="submit"
                                                    disabled={sendingOtp}
                                                    className="w-full sm:w-2/3 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 hover:-translate-y-[1px] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {sendingOtp ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                                            </svg>
                                                            <span>Sending OTP...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>Send Email OTP</span>
                                                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            
                                            <div className="text-center mt-1">
                                                <span className="text-xs text-slate-500">Already have an account? </span>
                                                <Link className="text-xs font-bold text-blue-600 hover:underline" href="/login">Sign In</Link>
                                            </div>
                                        </form>
                                    </>
                                ) : (
                                    /* ==================== STEP 2: OTP VERIFICATION ==================== */
                                    <>
                                        <div className="mb-6">
                                            <button 
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-3 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                                <span>Change Details</span>
                                            </button>
                                            <div className="flex items-center justify-between mb-2">
                                                <h1 className="text-2xl font-bold text-primary">Verify Email</h1>
                                                <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                                                    Step 2 of 2
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                We sent a 6-digit verification code to:
                                            </p>
                                            <p className="text-sm font-bold text-slate-800 mt-0.5">
                                                {data.email}
                                            </p>
                                        </div>

                                        {otpMessage && (
                                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                                                <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">mark_email_read</span>
                                                <p className="leading-snug">{otpMessage}</p>
                                            </div>
                                        )}

                                        {otpGeneralError && (
                                            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl text-xs text-red-800 font-medium">
                                                ⚠️ {otpGeneralError}
                                            </div>
                                        )}

                                        <form onSubmit={handleVerifyAndRegister} className="flex flex-col gap-4">
                                            {/* OTP Input */}
                                            <div className="flex flex-col items-center gap-2">
                                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="otp">
                                                    Enter 6-Digit OTP
                                                </label>
                                                <input 
                                                    id="otp" 
                                                    name="otp"
                                                    value={data.otp}
                                                    maxLength={6}
                                                    autoFocus
                                                    onChange={(e) => setData('otp', e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                                    className="w-full text-center tracking-[0.4em] font-mono text-2xl font-black py-3 px-4 bg-[#F1F5F9] rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all" 
                                                    placeholder="••••••" 
                                                    type="text"
                                                    inputMode="numeric"
                                                    required
                                                />
                                                {errors.otp && <p className="text-red-500 text-xs font-semibold mt-1 text-center">{errors.otp}</p>}
                                            </div>

                                            {/* Resend OTP cooldown */}
                                            <div className="text-center py-1">
                                                {cooldown > 0 ? (
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        Resend OTP in <strong className="text-blue-600 font-bold">{cooldown}s</strong>
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={handleResendOtp}
                                                        disabled={sendingOtp}
                                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                    >
                                                        {sendingOtp ? 'Sending code...' : 'Didn\'t receive OTP? Resend Code'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Verify Button */}
                                            <div className="flex flex-col gap-2 mt-2">
                                                <button 
                                                    type="submit"
                                                    disabled={processing || data.otp.length !== 6}
                                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:-translate-y-[1px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                                            </svg>
                                                            <span>Verifying & Registering...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-sm">verified_user</span>
                                                            <span>Verify & Complete Registration</span>
                                                        </>
                                                    )}
                                                </button>

                                                <button 
                                                    type="button"
                                                    onClick={() => setStep(1)}
                                                    className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                                                >
                                                    Back to Details
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}

                                {/* Trust Badges */}
                                <div className="flex flex-row justify-center md:justify-start gap-4 mt-6 pt-6 border-t border-slate-200">
                                    <div className="flex items-center gap-2 bg-[#d1fad7]/40 px-3 py-1.5 rounded-xl border border-[#d1fad7]">
                                        <span className="material-symbols-outlined text-emerald-700 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
                                        <span className="text-[11px] font-bold text-emerald-800">100% Secure Gateway</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-[#d1fad7]/40 px-3 py-1.5 rounded-xl border border-[#d1fad7]">
                                        <span className="material-symbols-outlined text-emerald-700 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        <span className="text-[11px] font-bold text-emerald-800">Email Verified</span>
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
