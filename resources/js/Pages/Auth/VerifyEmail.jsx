import React, { useState, useEffect } from 'react';
import { useForm, Head, Link, router } from '@inertiajs/react';
import FrontendLayout from '../../Layouts/FrontendLayout';
import FooterParticles from '../../Components/FooterParticles';
import axios from 'axios';

export default function VerifyEmail({ user, cooldown: initialCooldown = 0 }) {
    const [cooldown, setCooldown] = useState(initialCooldown);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpSentMessage, setOtpSentMessage] = useState('');
    const [generalError, setGeneralError] = useState('');
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [updatingEmail, setUpdatingEmail] = useState(false);
    const [currentEmail, setCurrentEmail] = useState(user?.email || '');

    const { data, setData, post, processing, errors, clearErrors, setError } = useForm({
        otp: '',
    });

    // Countdown Timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    // Send OTP Handler
    const handleSendOtp = async () => {
        if (cooldown > 0 || sendingOtp) return;
        setGeneralError('');
        setOtpSentMessage('');
        setSendingOtp(true);

        try {
            const res = await axios.post('/email/send-otp');
            if (res.data.success) {
                setOtpSentMessage(res.data.message || `Verification OTP sent to ${currentEmail}`);
                setCooldown(res.data.cooldown || 60);
            }
        } catch (err) {
            if (err.response?.status === 429) {
                setGeneralError(err.response.data.message || 'Please wait before requesting another OTP.');
                if (err.response.data.cooldown) {
                    setCooldown(err.response.data.cooldown);
                }
            } else {
                setGeneralError(err.response?.data?.message || 'Failed to deliver OTP email. Please try again.');
            }
        } finally {
            setSendingOtp(false);
        }
    };

    // Update Email Handler
    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setGeneralError('');
        setOtpSentMessage('');

        if (!newEmail || !newEmail.includes('@')) {
            setGeneralError('Please enter a valid email address.');
            return;
        }

        setUpdatingEmail(true);

        try {
            const res = await axios.post('/email/update', { new_email: newEmail });
            if (res.data.success) {
                setCurrentEmail(newEmail);
                setIsEditingEmail(false);
                setOtpSentMessage(`Email updated to ${newEmail}! Verification OTP has been sent.`);
                setCooldown(res.data.cooldown || 60);
                setData('otp', '');
            }
        } catch (err) {
            if (err.response?.data?.errors?.new_email) {
                setGeneralError(err.response.data.errors.new_email[0]);
            } else {
                setGeneralError(err.response?.data?.message || 'Failed to update email. Please try again.');
            }
        } finally {
            setUpdatingEmail(false);
        }
    };

    // Verify OTP Handler
    const handleVerify = (e) => {
        e.preventDefault();
        clearErrors('otp');
        setGeneralError('');

        if (!data.otp || data.otp.length !== 6) {
            setError('otp', 'Please enter the complete 6-digit OTP code.');
            return;
        }

        post('/email/verify');
    };

    return (
        <FrontendLayout>
            <Head title="Email Verification - CSP Jaankari" />
            <div className="relative py-12 md:py-20 flex items-center justify-center px-4 md:px-8 font-body-md overflow-hidden" style={{ background: 'linear-gradient(180deg, #050a14 0%, #0d1227 100%)' }}>
                <FooterParticles style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.8 }} />

                <div className="relative z-10 w-full max-w-[520px]">
                    <div className="rounded-2xl overflow-hidden shadow-[0px_8px_32px_rgba(0,102,255,0.2)] border-2 border-blue-500/40 bg-white p-6 md:p-8">
                        
                        {/* Header Shield & Badge */}
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center mx-auto mb-3 shadow-inner">
                                <span className="material-symbols-outlined text-blue-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    verified_user
                                </span>
                            </div>
                            <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                                ⚠️ Verification Required
                            </span>
                            <h1 className="text-2xl font-bold text-slate-800">Verify Your Email</h1>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                Namaste <span className="font-semibold text-slate-700">{user?.name}</span>! For account security, please verify your email address before continuing.
                            </p>
                        </div>

                        {/* Error Alert */}
                        {generalError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                                <span className="text-base leading-none">⚠️</span>
                                <span>{generalError}</span>
                            </div>
                        )}

                        {/* Success Message Alert */}
                        {otpSentMessage && (
                            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
                                <span className="text-base leading-none">✅</span>
                                <span>{otpSentMessage}</span>
                            </div>
                        )}

                        {/* Email Information Card */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[11px] text-slate-500 block font-medium">Registered Email Address:</span>
                                    <span className="text-sm font-bold text-slate-800 break-all">{currentEmail}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditingEmail(!isEditingEmail);
                                        setNewEmail(currentEmail);
                                        setGeneralError('');
                                    }}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline ml-2 whitespace-nowrap"
                                >
                                    {isEditingEmail ? 'Cancel' : 'Change Email'}
                                </button>
                            </div>

                            {/* Email Change Form Toggle */}
                            {isEditingEmail && (
                                <form onSubmit={handleUpdateEmail} className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-slate-700">Enter New Email Address:</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            placeholder="e.g. yourname@gmail.com"
                                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={updatingEmail}
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {updatingEmail ? 'Updating...' : 'Save & Send OTP'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Verification Form */}
                        <form onSubmit={handleVerify} className="flex flex-col gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Enter 6-Digit OTP:</label>
                                    {cooldown > 0 ? (
                                        <span className="text-[11px] text-slate-500 font-medium">
                                            Resend code in <strong className="text-blue-600">{cooldown}s</strong>
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={sendingOtp}
                                            className="text-[11px] font-bold text-blue-600 hover:underline disabled:opacity-50"
                                        >
                                            {sendingOtp ? 'Sending...' : 'Send / Resend OTP'}
                                        </button>
                                    )}
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={data.otp}
                                        onChange={(e) => setData('otp', e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter 6-digit code (e.g. 123456)"
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-center tracking-[0.4em] font-mono text-xl font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                        autoComplete="one-time-code"
                                        required
                                    />
                                </div>
                                {errors.otp && (
                                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.otp}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || data.otp.length !== 6}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Verify & Continue to Dashboard</span>
                                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer Options */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>Want to use a different account?</span>
                            <button
                                type="button"
                                onClick={() => router.post('/logout')}
                                className="font-semibold text-rose-600 hover:underline"
                            >
                                Log Out
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}
