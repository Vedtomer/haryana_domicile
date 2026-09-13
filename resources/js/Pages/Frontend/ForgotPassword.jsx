import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import FrontendLayout from '../../Layouts/FrontendLayout';
import FooterParticles from '../../Components/FooterParticles';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        login: '',
        otp: '',
        password: '',
        password_confirmation: '',
    });

    const [step, setStep] = useState(1); // 1 = Enter login, 2 = Enter OTP & new password
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpMessage, setOtpMessage] = useState('');
    const [otpGeneralError, setOtpGeneralError] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [maskedEmail, setMaskedEmail] = useState('');

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

    // Step 1: Send Password Reset OTP
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();

        clearErrors();
        setOtpGeneralError('');

        if (!data.login.trim()) {
            setError('login', 'Please enter your registered email or mobile number.');
            return;
        }

        setSendingOtp(true);

        try {
            const res = await axios.post('/forgot-password/send-otp', {
                login: data.login.trim(),
            });

            if (res.data.success) {
                setStep(2);
                setMaskedEmail(res.data.masked_email || '');
                setOtpMessage(res.data.message || `OTP sent to your registered email.`);
                setCooldown(res.data.cooldown || 60);
                setData('otp', '');
            }
        } catch (err) {
            if (err.response?.status === 422) {
                const serverErrors = err.response.data.errors || {};
                Object.keys(serverErrors).forEach((key) => {
                    setError(key, serverErrors[key][0]);
                });
                if (err.response.data.message && !serverErrors.login) {
                    setOtpGeneralError(err.response.data.message);
                }
            } else if (err.response?.status === 429) {
                setOtpGeneralError(err.response.data.message || 'Too many attempts. Please wait a moment.');
                if (err.response.data.cooldown) {
                    setCooldown(err.response.data.cooldown);
                }
            } else {
                setOtpGeneralError(err.response?.data?.message || 'Failed to send OTP. Please check your details and try again.');
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
            const res = await axios.post('/forgot-password/send-otp', {
                login: data.login.trim(),
            });

            if (res.data.success) {
                setOtpMessage(res.data.message || 'A fresh OTP has been sent to your email.');
                setCooldown(res.data.cooldown || 60);
            }
        } catch (err) {
            if (err.response?.status === 429) {
                setOtpGeneralError(err.response.data.message || 'Please wait before requesting another OTP.');
                if (err.response.data.cooldown) {
                    setCooldown(err.response.data.cooldown);
                }
            } else {
                setOtpGeneralError(err.response?.data?.message || 'Unable to resend OTP right now. Please try again.');
            }
        } finally {
            setSendingOtp(false);
        }
    };

    // Step 2: Submit Reset Password
    const handleResetPassword = (e) => {
        e.preventDefault();
        clearErrors();

        if (!data.otp || data.otp.trim().length !== 6) {
            setError('otp', 'Please enter the 6-digit OTP code.');
            return;
        }

        if (!data.password || data.password.length < 4) {
            setError('password', 'Password must be at least 4 characters long.');
            return;
        }

        if (data.password !== data.password_confirmation) {
            setError('password_confirmation', 'Passwords do not match.');
            return;
        }

        post('/forgot-password/reset');
    };

    return (
        <FrontendLayout>
            <Head title="Forgot Password - CSP Jaankari" />

            <div className="relative py-10 md:py-16 flex items-center justify-center px-4 md:px-8 font-body-md overflow-hidden" style={{ background: 'linear-gradient(180deg, #050a14 0%, #0d1227 100%)' }}>
                {/* Particles Background Layer */}
                <FooterParticles style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.8 }} />

                <div className="relative z-10 w-full max-w-[1200px] flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    {/* Left: Illustration with Floating Elements */}
                    <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center relative">
                        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute top-1/2 left-10 w-16 h-16 bg-cyan-400/30 rounded-full blur-xl animate-bounce pointer-events-none" style={{ animationDuration: '3s' }}></div>

                        <img
                            alt="Digital India Security Illustration"
                            className="relative z-10 object-contain w-full max-w-[460px] h-auto transform transition-transform duration-700 hover:scale-105"
                            src="/images/bb.webp"
                        />
                    </div>

                    {/* Right: Forgot Password Card */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                        <main className="w-full max-w-[460px] rounded-2xl overflow-hidden shadow-[0px_8px_32px_rgba(0,102,255,0.15)] border-2 border-blue-600 bg-surface">
                            <div className="w-full relative z-10 p-6 sm:p-8">
                                <div className="mb-6 text-center sm:text-left">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mb-3">
                                        <span className="material-symbols-outlined text-2xl">
                                            {step === 1 ? 'lock_reset' : 'key'}
                                        </span>
                                    </div>
                                    <h1 className="text-2xl font-bold text-primary mb-1">
                                        {step === 1 ? 'Forgot Password?' : 'Enter OTP & Reset'}
                                    </h1>
                                    <p className="text-xs text-on-surface-variant">
                                        {step === 1
                                            ? 'Enter your registered email or mobile to receive a reset code.'
                                            : `Verification code sent to ${maskedEmail || 'your email'}.`}
                                    </p>
                                </div>

                                {/* General Error Alert */}
                                {otpGeneralError && (
                                    <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs font-semibold text-red-600 dark:text-red-300 flex items-start gap-2">
                                        <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                                        <span className="leading-snug">{otpGeneralError}</span>
                                    </div>
                                )}

                                {/* STEP 1: Enter Email or Mobile */}
                                {step === 1 && (
                                    <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-label-md text-label-md text-on-surface" htmlFor="login">
                                                Registered Email or Mobile Number
                                            </label>
                                            <div className="relative flex items-center input-field bg-[#F1F5F9] dark:bg-slate-800 rounded-lg border-2 border-transparent focus-within:border-blue-500 transition-colors duration-200">
                                                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-xl pointer-events-none">
                                                    person
                                                </span>
                                                <input
                                                    id="login"
                                                    name="login"
                                                    value={data.login}
                                                    onChange={(e) => setData('login', e.target.value)}
                                                    className="w-full bg-transparent border-none py-3 pl-11 pr-4 text-body-md text-on-surface focus:ring-0 focus:outline-none rounded-lg"
                                                    placeholder="e.g. user@gmail.com or 9876543210"
                                                    type="text"
                                                    autoFocus
                                                    disabled={sendingOtp}
                                                />
                                            </div>
                                            {errors.login && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
                                                    <span className="material-symbols-outlined text-sm">error</span>
                                                    {errors.login}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={sendingOtp || !data.login.trim()}
                                            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                        >
                                            {sendingOtp ? (
                                                <>
                                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                                    <span>Sending OTP...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Send Reset OTP</span>
                                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                                </>
                                            )}
                                        </button>

                                        <div className="pt-2 text-center">
                                            <Link
                                                href="/login"
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                                Back to Sign In
                                            </Link>
                                        </div>
                                    </form>
                                )}

                                {/* STEP 2: Enter OTP & New Password */}
                                {step === 2 && (
                                    <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                                        {/* OTP Success Banner */}
                                        {otpMessage && (
                                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                                                <span className="material-symbols-outlined text-emerald-600 text-base shrink-0 mt-0.5">mark_email_read</span>
                                                <div className="flex-1 leading-snug">
                                                    {otpMessage}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setStep(1);
                                                            clearErrors();
                                                            setOtpGeneralError('');
                                                        }}
                                                        className="block text-blue-600 dark:text-blue-400 font-bold underline mt-1 hover:opacity-80"
                                                    >
                                                        Wrong email/phone? Change
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* 6-Digit OTP */}
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center">
                                                <label className="font-label-md text-label-md text-on-surface" htmlFor="otp">
                                                    6-Digit Verification Code (OTP)
                                                </label>
                                                {cooldown > 0 ? (
                                                    <span className="text-xs text-slate-400 font-mono font-semibold">
                                                        Resend in {cooldown}s
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={handleResendOtp}
                                                        disabled={sendingOtp}
                                                        className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer disabled:opacity-50"
                                                    >
                                                        {sendingOtp ? 'Sending...' : 'Resend OTP'}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="relative flex items-center input-field bg-[#F1F5F9] dark:bg-slate-800 rounded-lg border-2 border-transparent focus-within:border-blue-500 transition-colors duration-200">
                                                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-xl pointer-events-none">
                                                    pin
                                                </span>
                                                <input
                                                    id="otp"
                                                    name="otp"
                                                    value={data.otp}
                                                    onChange={(e) => setData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    className="w-full bg-transparent border-none py-3 pl-11 pr-4 text-center font-mono font-bold tracking-[6px] text-lg text-on-surface focus:ring-0 focus:outline-none rounded-lg"
                                                    placeholder="••••••"
                                                    type="text"
                                                    maxLength={6}
                                                    autoFocus
                                                />
                                            </div>
                                            {errors.otp && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
                                                    <span className="material-symbols-outlined text-sm">error</span>
                                                    {errors.otp}
                                                </p>
                                            )}
                                        </div>

                                        {/* New Password */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                                                New Password
                                            </label>
                                            <div className="relative flex items-center input-field bg-[#F1F5F9] dark:bg-slate-800 rounded-lg border-2 border-transparent focus-within:border-blue-500 transition-colors duration-200">
                                                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-xl pointer-events-none">
                                                    lock
                                                </span>
                                                <input
                                                    id="password"
                                                    name="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="w-full bg-transparent border-none py-3 pl-11 pr-11 text-body-md text-on-surface focus:ring-0 focus:outline-none rounded-lg"
                                                    placeholder="At least 4 characters"
                                                />
                                                <button
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 text-outline hover:text-on-surface transition-colors focus:outline-none cursor-pointer"
                                                    type="button"
                                                >
                                                    <span className="material-symbols-outlined text-slate-400 hover:text-slate-600">
                                                        {showPassword ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
                                                    <span className="material-symbols-outlined text-sm">error</span>
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-label-md text-label-md text-on-surface" htmlFor="password_confirmation">
                                                Confirm New Password
                                            </label>
                                            <div className="relative flex items-center input-field bg-[#F1F5F9] dark:bg-slate-800 rounded-lg border-2 border-transparent focus-within:border-blue-500 transition-colors duration-200">
                                                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-xl pointer-events-none">
                                                    check_circle
                                                </span>
                                                <input
                                                    id="password_confirmation"
                                                    name="password_confirmation"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    className="w-full bg-transparent border-none py-3 pl-11 pr-11 text-body-md text-on-surface focus:ring-0 focus:outline-none rounded-lg"
                                                    placeholder="Re-enter password"
                                                />
                                                <button
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 text-outline hover:text-on-surface transition-colors focus:outline-none cursor-pointer"
                                                    type="button"
                                                >
                                                    <span className="material-symbols-outlined text-slate-400 hover:text-slate-600">
                                                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                            {errors.password_confirmation && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
                                                    <span className="material-symbols-outlined text-sm">error</span>
                                                    {errors.password_confirmation}
                                                </p>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={processing || data.otp.length !== 6 || !data.password}
                                            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                        >
                                            {processing ? (
                                                <>
                                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                                    <span>Resetting Password...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-lg">verified</span>
                                                    <span>Reset Password & Sign In</span>
                                                </>
                                            )}
                                        </button>

                                        <div className="pt-2 text-center">
                                            <Link
                                                href="/login"
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                                Back to Sign In
                                            </Link>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}
