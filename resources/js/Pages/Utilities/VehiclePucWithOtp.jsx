import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function VehiclePucWithOtp() {
    const [step, setStep] = useState(1); // 1: Input, 2: OTP, 3: Result
    const [vehicleNo, setVehicleNo] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [otp, setOtp] = useState('');
    const [sessionId, setSessionId] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [timer, setTimer] = useState(60);
    const [timerActive, setTimerActive] = useState(false);

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
        const cleanNo = vehicleNo.replace(/[\s-]/g, '').toUpperCase();
        const cleanMobile = mobileNo.replace(/\D/g, '');

        if (cleanNo.length < 5) {
            setError('Please enter a valid Vehicle Registration Number.');
            return;
        }
        if (cleanMobile.length !== 10) {
            setError('Please enter a valid 10-digit Mobile Number.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/utilities/vehicle-puc-with-otp/send-otp', {
                vehicle_number: cleanNo,
                mobile_number: cleanMobile,
            });

            if (response.data.success) {
                setSessionId(response.data.session_id || '');
                setStep(2);
                setTimer(60);
                setTimerActive(true);
            } else {
                setError(response.data.message || 'Failed to send OTP.');
            }
        } catch (err) {
            console.error('Error sending OTP:', err);
            setError(err.response?.data?.message || 'Error occurred while sending OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 4) {
            setError('Please enter the OTP received.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/utilities/vehicle-puc-with-otp/verify-otp', {
                vehicle_number: vehicleNo.replace(/[\s-]/g, '').toUpperCase(),
                mobile_number: mobileNo.replace(/\D/g, ''),
                otp: otp.trim(),
                session_id: sessionId,
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
        setOtp('');
        setError(null);
        setResult(null);
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        Vehicle PUC (With OTP)
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Download official Vehicle PUC Certificate with mobile OTP authentication
                    </p>
                </div>
            }
        >
            <Head title="Vehicle PUC (With OTP)" />

            <div className="max-w-4xl mx-auto mt-6 px-4">
                {/* Steps Indicator */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                            step >= 1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                            <span>1</span>
                            <span>Vehicle &amp; Mobile</span>
                        </div>
                        <span className="text-slate-400">→</span>
                        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                            step >= 2 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                            <span>2</span>
                            <span>Verify OTP</span>
                        </div>
                        <span className="text-slate-400">→</span>
                        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                            step >= 3 ? 'bg-green-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                            <span>3</span>
                            <span>PUC Certificate</span>
                        </div>
                    </div>
                </div>

                {/* Step 1: Input Details */}
                {step === 1 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 max-w-xl mx-auto">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl">directions_car</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                                Enter Vehicle &amp; Mobile
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                An OTP will be sent to the entered mobile number to verify and fetch the PUC certificate.
                            </p>
                        </div>

                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                                    Vehicle Registration Number
                                </label>
                                <input
                                    type="text"
                                    maxLength="15"
                                    value={vehicleNo}
                                    onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                                    placeholder="e.g. HR26DK8337"
                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black font-mono tracking-wider uppercase text-center dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                                    10-Digit Mobile Number
                                </label>
                                <input
                                    type="text"
                                    maxLength="10"
                                    value={mobileNo}
                                    onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, ''))}
                                    placeholder="e.g. 9876543210"
                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black font-mono tracking-wider text-center dark:text-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || vehicleNo.trim().length < 5 || mobileNo.trim().length !== 10}
                                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-base rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP & Proceed'}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-5 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                                <span className="material-symbols-outlined text-red-600 text-lg">error</span>
                                <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 max-w-md mx-auto">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                                Verify OTP
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                Enter the OTP sent to <strong className="text-slate-800 dark:text-white">+91 {mobileNo}</strong>
                            </p>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter OTP"
                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-2xl font-black font-mono tracking-widest text-center dark:text-white"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length < 4}
                                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? 'Verifying OTP...' : 'Verify OTP & Fetch PUC'}
                            </button>
                        </form>

                        <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-slate-600 dark:text-slate-400 hover:underline cursor-pointer"
                            >
                                Change Mobile / Vehicle
                            </button>

                            {timerActive ? (
                                <span>Resend in {timer}s</span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="mt-5 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                                <span className="material-symbols-outlined text-red-600 text-lg">error</span>
                                <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Certificate Result */}
                {step === 3 && result && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-green-300 dark:border-green-800/60 p-6 md:p-8 shadow-xl mb-12 animate-fade-in-up">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                            <div>
                                <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 mb-1">
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    OTP VERIFIED • {result.status || 'ACTIVE & VALID'}
                                </span>
                                <h3 className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                                    {result.reg_no || vehicleNo}
                                </h3>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-lg">print</span>
                                    Print Certificate
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                >
                                    Search Another
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 my-6">
                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">PUC Certificate No</p>
                                <p className="text-base font-black font-mono text-green-700 dark:text-green-400 select-all">{result.puc_no || 'N/A'}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Valid Upto</p>
                                <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">{result.valid_upto || 'N/A'}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Emission Norms</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{result.emission_norms || 'BS-VI'}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Fuel Type</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{result.fuel_type || 'PETROL'}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Vehicle Class</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{result.vehicle_class || 'LMV (Light Motor Vehicle)'}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Test Date &amp; Time</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{result.test_date || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Authorized Testing Centre:</span>
                            <p className="font-bold text-slate-800 dark:text-white">{result.puc_center_name || 'GOVT CERTIFIED POLLUTION TESTING CENTER'}</p>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
