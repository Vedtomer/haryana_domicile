import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AbhaHealthIdMake({ service, coinCost = 20, userCoins = 0 }) {
    const [step, setStep] = useState(1); // 1: Input Form, 2: OTP Verification, 3: Generated Card
    const [aadharNo, setAadharNo] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [consent, setConsent] = useState(true);
    const [otp, setOtp] = useState('');
    const [txnId, setTxnId] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [timer, setTimer] = useState(60);
    const [timerActive, setTimerActive] = useState(false);

    // Format Aadhaar with spaces: XXXX XXXX XXXX
    const formatAadhar = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 12);
        return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    const handleAadharChange = (e) => {
        setAadharNo(formatAadhar(e.target.value));
    };

    const handleMobileChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
        setMobileNo(val);
    };

    // OTP Timer
    useEffect(() => {
        let interval = null;
        if (timerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [timerActive, timer]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const cleanAadhar = aadharNo.replace(/\D/g, '');
        const cleanMobile = mobileNo.replace(/\D/g, '');

        if (cleanAadhar.length !== 12) {
            setError('Please enter a valid 12-digit Aadhaar Number.');
            return;
        }
        if (cleanMobile.length !== 10) {
            setError('Please enter a valid 10-digit Mobile Number.');
            return;
        }
        if (!consent) {
            setError('Please accept the consent terms to proceed.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/utilities/abha-health-id-make/send-otp', {
                aadhar_no: cleanAadhar,
                mobile_no: cleanMobile,
                consent: true,
            });

            if (response.data.success) {
                setTxnId(response.data.txn_id || '');
                setStep(2);
                setTimer(60);
                setTimerActive(true);
            } else {
                setError(response.data.message || 'Failed to send OTP.');
            }
        } catch (err) {
            console.error('Error sending OTP:', err);
            setError(err.response?.data?.message || 'Server communication error while requesting OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const cleanOtp = otp.trim();

        if (cleanOtp.length < 4 || cleanOtp.length > 6) {
            setError('Please enter a valid OTP.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/utilities/abha-health-id-make/verify-otp', {
                aadhar_no: aadharNo.replace(/\D/g, ''),
                mobile_no: mobileNo.replace(/\D/g, ''),
                otp: cleanOtp,
                txn_id: txnId,
            });

            if (response.data.success) {
                setResult(response.data.data);
                setStep(3);
            } else {
                setError(response.data.message || 'Invalid OTP. Please try again.');
            }
        } catch (err) {
            console.error('Error verifying OTP:', err);
            setError(err.response?.data?.message || 'Error occurred during OTP verification.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStep(1);
        setAadharNo('');
        setMobileNo('');
        setOtp('');
        setTxnId('');
        setResult(null);
        setError(null);
    };

    const handlePrintCard = () => {
        window.print();
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-none">
                                ABHA Health ID Make
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Create new Ayushman Bharat Health Account (ABHA) Card online via ABDM v3
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            🪙 {coinCost} Coins / Card
                        </span>
                        <a
                            href="https://abha.abdm.gov.in/abha/v3"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 transition-colors"
                        >
                            <span>ABDM Portal</span>
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="ABHA Health ID Make - CSP Jaankari" />

            <div className="max-w-4xl mx-auto py-4 sm:py-6 px-4">
                {/* Government ABDM Branding Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 text-white p-6 shadow-xl mb-6 border border-emerald-600/30">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
                                🏥
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-[11px] font-bold uppercase tracking-wider text-emerald-100 mb-1">
                                    <span>🇮🇳</span> National Health Authority • ABDM v3
                                </div>
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                                    Ayushman Bharat Health Account (ABHA) Maker
                                </h1>
                                <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
                                    Digital citizen health records portal. Generate unique 14-digit ABHA Number &amp; instant printable health card.
                                </p>
                            </div>
                        </div>

                        {/* Progress Stepper */}
                        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/15 shrink-0 text-xs font-bold">
                            <span className={`px-2.5 py-1 rounded-xl ${step >= 1 ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white/60'}`}>
                                1. Aadhaar
                            </span>
                            <span className="text-white/40">→</span>
                            <span className={`px-2.5 py-1 rounded-xl ${step >= 2 ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white/60'}`}>
                                2. OTP
                            </span>
                            <span className="text-white/40">→</span>
                            <span className={`px-2.5 py-1 rounded-xl ${step === 3 ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white/60'}`}>
                                3. ABHA Card
                            </span>
                        </div>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-3 shadow-xs animate-shake">
                        <span className="material-symbols-outlined text-xl flex-shrink-0 text-red-500">error</span>
                        <div className="flex-1 font-medium">{error}</div>
                        <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                            ✕
                        </button>
                    </div>
                )}

                {/* STEP 1: Enter Aadhaar & Mobile */}
                {step === 1 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                        <div className="max-w-xl mx-auto">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    Step 1: Enter Citizen Identity Details
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    An OTP will be sent to the mobile number linked with this Aadhaar.
                                </p>
                            </div>

                            <form onSubmit={handleSendOtp} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                        12-Digit Aadhaar Card Number *
                                    </label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                            fingerprint
                                        </span>
                                        <input
                                            type="text"
                                            value={aadharNo}
                                            onChange={handleAadharChange}
                                            placeholder="XXXX  XXXX  XXXX"
                                            maxLength={14}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-mono tracking-widest text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            required
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1.5">
                                        Enter all 12 digits. Validated directly with UIDAI / ABDM.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                        Mobile Number for Communication *
                                    </label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                            call
                                        </span>
                                        <input
                                            type="tel"
                                            value={mobileNo}
                                            onChange={handleMobileChange}
                                            placeholder="10-digit mobile number"
                                            maxLength={10}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="consent"
                                        checked={consent}
                                        onChange={(e) => setConsent(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <label htmlFor="consent" className="text-xs text-emerald-900 dark:text-emerald-200 cursor-pointer leading-relaxed">
                                        I hereby declare that I am voluntarily sharing my Aadhaar number and details with National Health Authority (NHA) for the creation of ABHA Health ID under ABDM.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || aadharNo.replace(/\D/g, '').length !== 12 || mobileNo.length !== 10}
                                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                            <span>Sending Aadhaar OTP...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">send_to_mobile</span>
                                            <span>Generate Aadhaar OTP</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* STEP 2: Enter & Verify OTP */}
                {step === 2 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                        <div className="max-w-md mx-auto text-center">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                                <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                Enter 6-Digit OTP
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
                                An OTP was dispatched to the mobile number registered with Aadhaar{' '}
                                <strong className="text-slate-800 dark:text-slate-200">
                                    •••• •••• {aadharNo.replace(/\D/g, '').slice(-4)}
                                </strong>
                            </p>

                            <form onSubmit={handleVerifyOtp} className="space-y-5">
                                <div>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6}
                                        autoFocus
                                        className="w-full text-center py-3.5 px-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-2xl font-mono tracking-[0.5em] text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                                    <span>
                                        {timerActive ? (
                                            <span className="text-amber-600 font-bold">Resend in {timer}s</span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleSendOtp}
                                                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                                            >
                                                Resend OTP
                                            </button>
                                        )}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                                    >
                                        Change Aadhaar
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.length < 4}
                                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                            <span>Verifying &amp; Generating ABHA Card...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">verified</span>
                                            <span>Verify OTP &amp; Create ABHA ID</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* STEP 3: Generated ABHA Health Card */}
                {step === 3 && result && (
                    <div className="space-y-6">
                        {/* Success Banner */}
                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-xs">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-2xl text-emerald-600">check_circle</span>
                                <div>
                                    <h4 className="font-bold text-sm">ABHA Health Card Generated Successfully!</h4>
                                    <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                                        Your unique Ayushman Bharat Health Account number is active and ready to use.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 transition cursor-pointer shrink-0"
                            >
                                + New ABHA Card
                            </button>
                        </div>

                        {/* Printable ABHA Card Container */}
                        <div id="printable-abha-card" className="max-w-xl mx-auto bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-600 relative">
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-[#003366] via-[#005599] to-[#0088cc] text-white p-4 flex items-center justify-between border-b-2 border-amber-400">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
                                        <img src="/images/logo.png" alt="" className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                                        <span className="text-xl">🇮🇳</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black tracking-tight leading-none uppercase">
                                            National Health Authority
                                        </h3>
                                        <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mt-0.5">
                                            Ayushman Bharat Digital Mission (ABDM)
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-white uppercase tracking-wider shadow-xs">
                                        ABHA CARD
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 sm:p-6 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                                    {/* Photo Container */}
                                    <div className="w-28 h-32 rounded-2xl bg-slate-200 border-2 border-slate-300 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-md bg-cover bg-center">
                                        {result.photo ? (
                                            <img src={result.photo} alt={result.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-2">
                                                <span className="material-symbols-outlined text-5xl text-slate-400">person</span>
                                                <span className="text-[9px] block text-slate-400 font-bold">ABHA USER</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Details */}
                                    <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                                        <div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Name / नाम</span>
                                            <h4 className="text-lg font-black text-slate-900 leading-tight truncate">
                                                {result.name}
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Gender / लिंग</span>
                                                <p className="font-bold text-slate-800">{result.gender || 'MALE'}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">DOB / जन्म तिथि</span>
                                                <p className="font-bold text-slate-800">{result.dob || '12/04/1996'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ABHA Address / पता</span>
                                            <p className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 inline-block">
                                                {result.abha_address}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mobile Number</span>
                                            <p className="font-bold text-xs text-slate-700">+91 {result.mobile}</p>
                                        </div>
                                    </div>

                                    {/* QR Code Container */}
                                    <div className="flex flex-col items-center justify-center shrink-0 p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="w-20 h-20 bg-slate-900 rounded-lg p-1.5 flex items-center justify-center">
                                            {/* Vector QR Representation */}
                                            <div className="w-full h-full bg-white p-1 rounded grid grid-cols-4 gap-0.5">
                                                <div className="bg-slate-900"></div>
                                                <div className="bg-slate-900"></div>
                                                <div></div>
                                                <div className="bg-slate-900"></div>
                                                <div className="bg-slate-900"></div>
                                                <div></div>
                                                <div className="bg-slate-900"></div>
                                                <div></div>
                                                <div></div>
                                                <div className="bg-slate-900"></div>
                                                <div></div>
                                                <div className="bg-slate-900"></div>
                                                <div className="bg-slate-900"></div>
                                                <div></div>
                                                <div className="bg-slate-900"></div>
                                                <div className="bg-slate-900"></div>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-500 mt-1">Scan for ABHA</span>
                                    </div>
                                </div>

                                {/* Highlighted ABHA Number Banner */}
                                <div className="mt-5 p-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-center shadow-md">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 block">
                                        14-Digit ABHA Number
                                    </span>
                                    <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-white">
                                        {result.abha_number}
                                    </span>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="bg-slate-100 px-5 py-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                                <span>Health Records on Your Fingertips</span>
                                <span>https://abha.abdm.gov.in</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handlePrintCard}
                                className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">print</span>
                                <span>Print / Save as PDF</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">add_circle</span>
                                <span>Create Another ABHA Card</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
