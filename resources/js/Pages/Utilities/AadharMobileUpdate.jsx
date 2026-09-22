import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharMobileUpdate() {
    const [aadharNo, setAadharNo] = useState('');
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [agreeBiometric, setAgreeBiometric] = useState(true);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanAadhar = aadharNo.replace(/\D/g, '');
        const cleanMobile = mobile.trim();

        if (cleanAadhar.length !== 12) {
            setError('Please enter a valid 12-digit Aadhaar number.');
            return;
        }

        if (!/^[0-9]{10}$/.test(cleanMobile)) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        if (!name.trim()) {
            setError('Please enter resident name as per Aadhaar.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/aadhar-mobile-update/update', {
                aadhar_no: cleanAadhar,
                mobile: cleanMobile,
                name: name.trim(),
            });

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'Failed to submit mobile update request.');
            }
        } catch (err) {
            console.error('Error submitting request:', err);
            setError(err.response?.data?.message || 'Error occurred while processing request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                UIDAI Demographic Update
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white leading-tight mt-1">
                            Aadhar Card Mobile Number Update
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Link or update mobile number on Aadhaar card with instant URN acknowledgement receipt
                        </p>
                    </div>

                    {result && (
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                        >
                            <span className="material-symbols-outlined text-lg">print</span>
                            Print Receipt Slip
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Aadhar Card Mobile Number Update" />

            <div className="max-w-4xl mx-auto mt-6 px-4 pb-12">
                {/* Form Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                    <div className="p-6 sm:p-8">
                        <div className="max-w-xl mx-auto text-center">
                            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-4 mx-auto shadow-inner">
                                <span className="material-symbols-outlined text-3xl">phone_android</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                                Mobile Number Update
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-xs sm:text-sm">
                                Enter 12-digit Aadhaar number and new 10-digit mobile number to generate update request.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Resident Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value.toUpperCase())}
                                        placeholder="e.g. SURENDER KUMAR"
                                        required
                                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Aadhaar Number (12 Digits) *
                                    </label>
                                    <input
                                        type="text"
                                        value={aadharNo}
                                        onChange={(e) => setAadharNo(e.target.value)}
                                        placeholder="XXXX XXXX XXXX"
                                        maxLength={14}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-mono font-black text-center text-lg tracking-widest uppercase text-blue-700 dark:text-blue-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        New Mobile Number to Link (10 Digits) *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            placeholder="9876543210"
                                            maxLength={10}
                                            required
                                            className="w-full pl-14 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-mono font-black text-base text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs flex items-start gap-2.5">
                                    <input
                                        type="checkbox"
                                        id="agreeBiometric"
                                        checked={agreeBiometric}
                                        onChange={(e) => setAgreeBiometric(e.target.checked)}
                                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="agreeBiometric" className="text-slate-600 dark:text-slate-300 leading-relaxed cursor-pointer">
                                        I certify that the mobile number provided belongs to the resident and agree to submit update request for Aadhaar authentication.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !agreeBiometric}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting Update Request...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-xl">send</span>
                                            Submit Mobile Update Request
                                        </>
                                    )}
                                </button>
                            </form>

                            {error && (
                                <div className="mt-5 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3 text-left">
                                    <span className="material-symbols-outlined text-red-600 text-lg shrink-0">error</span>
                                    <p className="text-red-700 dark:text-red-300 font-medium text-sm">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Acknowledgement Receipt Slip */}
                {result && result.data && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in-up">
                        {/* Receipt Top Header */}
                        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
                                    Aadhaar Update Acknowledgement
                                </span>
                                <h3 className="text-2xl font-black mt-0.5">
                                    Request Successfully Accepted
                                </h3>
                                <p className="text-blue-100 text-xs mt-1">
                                    Enrolment / Update Request Number has been generated
                                </p>
                            </div>
                            <span className="px-3.5 py-1.5 bg-emerald-500 text-white text-xs font-black rounded-full flex items-center gap-1.5 shadow-md">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                ACCEPTED
                            </span>
                        </div>

                        {/* URN Box */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-950/20">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                                        Update Request Number (URN)
                                    </span>
                                    <span className="font-mono text-2xl font-black text-blue-700 dark:text-blue-300 tracking-wider">
                                        {result.data.urn}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(result.data.urn)}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-base text-blue-600">
                                        {copied ? 'check' : 'content_copy'}
                                    </span>
                                    {copied ? 'Copied!' : 'Copy URN'}
                                </button>
                            </div>
                        </div>

                        {/* Slip Details Grid */}
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Resident Name</span>
                                <span className="font-black text-slate-800 dark:text-white text-base">{result.data.name}</span>
                            </div>
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Aadhaar Number</span>
                                <span className="font-mono font-black text-slate-800 dark:text-white text-base">{result.data.aadhar_no}</span>
                            </div>
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">New Mobile Linked</span>
                                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">+91 {result.data.mobile}</span>
                            </div>
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Date & Time</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{result.data.date}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
