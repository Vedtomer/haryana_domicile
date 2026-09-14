import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharFullNameChange() {
    const [aadharNo, setAadharNo] = useState('');
    const [oldName, setOldName] = useState('');
    const [newName, setNewName] = useState('');
    const [newNameHi, setNewNameHi] = useState('');
    const [docType, setDocType] = useState('PAN Card');
    const [docFile, setDocFile] = useState(null);

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

        if (cleanAadhar.length !== 12) {
            setError('Please enter a valid 12-digit Aadhaar number.');
            return;
        }

        if (!oldName.trim()) {
            setError('Please enter current name on card.');
            return;
        }

        if (!newName.trim()) {
            setError('Please enter new corrected full name.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/aadhar-full-name-change/update', {
                aadhar_no: cleanAadhar,
                old_name: oldName.trim(),
                new_name: newName.trim(),
                doc_type: docType,
            });

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'Failed to submit name update request.');
            }
        } catch (err) {
            console.error('Error submitting name change:', err);
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
                            <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                                Full Name Correction
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white leading-tight mt-1">
                            Aadhar Card Full Name Change
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Update or correct legal full name on Aadhaar card with valid identity proof and generate URN
                        </p>
                    </div>

                    {result && (
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                        >
                            <span className="material-symbols-outlined text-lg">print</span>
                            Print Receipt Slip
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Aadhar Card Full Name Change" />

            <div className="max-w-4xl mx-auto mt-6 px-4 pb-12">
                {/* Form Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                    <div className="p-6 sm:p-8">
                        <div className="max-w-xl mx-auto text-center">
                            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 text-rose-600 dark:text-rose-400 rounded-2xl mb-4 mx-auto shadow-inner">
                                <span className="material-symbols-outlined text-3xl">badge</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                                Full Name Correction & Modification
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-xs sm:text-sm">
                                Enter 12-digit Aadhaar number, existing name, and new correct name as per valid ID proof.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-mono font-black text-center text-lg tracking-widest uppercase text-rose-700 dark:text-rose-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Current Name on Card (Before Correction) *
                                    </label>
                                    <input
                                        type="text"
                                        value={oldName}
                                        onChange={(e) => setOldName(e.target.value.toUpperCase())}
                                        placeholder="e.g. MOHAN LAL SHARMA"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            New Corrected Full Name (English) *
                                        </label>
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value.toUpperCase())}
                                            placeholder="e.g. MOHAN SHARMA"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                            New Name (Hindi / Regional)
                                        </label>
                                        <input
                                            type="text"
                                            value={newNameHi}
                                            onChange={(e) => setNewNameHi(e.target.value)}
                                            placeholder="e.g. मोहन शर्मा"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                        Identity Proof Document (POI) *
                                    </label>
                                    <select
                                        value={docType}
                                        onChange={(e) => setDocType(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white text-sm"
                                    >
                                        <option value="PAN Card">PAN Card / e-PAN</option>
                                        <option value="Passport">Indian Passport</option>
                                        <option value="Voter ID Card">Voter ID (EPIC Card)</option>
                                        <option value="Driving Licence">Driving Licence</option>
                                        <option value="Gazette Notification">Gazette Notification with Photo</option>
                                        <option value="Govt Service ID Card">Central / State Govt Service ID Card</option>
                                    </select>
                                </div>

                                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-xs mb-1">
                                        Upload Proof of Identity (POI) Document
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,image/*"
                                        onChange={(e) => setDocFile(e.target.files[0])}
                                        className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-base rounded-2xl shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting Name Correction...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-xl">send</span>
                                            Submit Name Correction Request
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
                        <div className="p-6 bg-gradient-to-r from-rose-600 to-pink-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-rose-200">
                                    Name Correction Acknowledgement
                                </span>
                                <h3 className="text-2xl font-black mt-0.5">
                                    Application Registered
                                </h3>
                                <p className="text-rose-100 text-xs mt-1">
                                    Your name correction has been received with URN
                                </p>
                            </div>
                            <span className="px-3.5 py-1.5 bg-white text-rose-800 text-xs font-black rounded-full flex items-center gap-1.5 shadow-md">
                                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                                ACCEPTED
                            </span>
                        </div>

                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                                        Update Request Number (URN)
                                    </span>
                                    <span className="font-mono text-2xl font-black text-rose-700 dark:text-rose-300 tracking-wider">
                                        {result.data.urn}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(result.data.urn)}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-base text-rose-600">
                                        {copied ? 'check' : 'content_copy'}
                                    </span>
                                    {copied ? 'Copied!' : 'Copy URN'}
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">New Corrected Name</span>
                                <span className="font-black text-slate-800 dark:text-white text-base">{result.data.new_name}</span>
                            </div>
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Aadhaar Number</span>
                                <span className="font-mono font-black text-slate-800 dark:text-white text-base">{result.data.aadhar_no}</span>
                            </div>
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Previous Name</span>
                                <span className="font-bold text-slate-600 dark:text-slate-400 text-base">{result.data.old_name}</span>
                            </div>
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Document Verified</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{result.data.doc_type}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
