import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

const InfoRow = ({ label, value, icon }) => {
    if (!value || value === 'N/A' || value === '') return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-500 text-[18px]">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white break-words">{value}</p>
            </div>
        </div>
    );
};

export default function LearningLicencePdf() {
    const [applNum, setApplNum] = useState('');
    const [dob, setDob] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [directPortal, setDirectPortal] = useState('https://sarathi.parivahan.gov.in/sarathiservice/printlearninglicence.do');

    const handleSearch = async (e) => {
        e.preventDefault();
        const clean = applNum.trim().toUpperCase();
        if (!clean) {
            setError('Please enter a valid Application Number.');
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/learning-licence-pdf/search', {
                applNum: clean,
                dob: dob.trim(),
            });

            if (response.data.success) {
                setResult(response.data.data);
            } else {
                setError(response.data.message || 'Details not found.');
                if (response.data.direct_portal) {
                    setDirectPortal(response.data.direct_portal);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'API server से संपर्क नहीं हो सका। कृपया थोड़ी देर बाद दोबारा प्रयास करें।');
        } finally {
            setLoading(false);
        }
    };

    const downloadPdf = () => {
        if (!result) return;

        const directUrl = result.a4_pdf || result.pdf_url || result.a4 || (result.cards && result.cards[0]?.a4) || result.file_url;
        if (directUrl) {
            window.open(directUrl, '_blank');
            return;
        }

        let pdfData = result.pdf || result.data?.pdf || result.base64;
        if (pdfData) {
            if (pdfData.startsWith('http://') || pdfData.startsWith('https://')) {
                window.open(pdfData, '_blank');
                return;
            }

            if (!pdfData.startsWith('data:application/pdf;base64,')) {
                pdfData = 'data:application/pdf;base64,' + pdfData;
            }

            const link = document.createElement('a');
            link.href = pdfData;
            link.download = `Learning_Licence_${applNum}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('PDF data not found in response.');
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        Learning Licence Download
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Download Learning Licence PDF instantly
                    </p>
                </div>
            }
        >
            <Head title="Learning Licence Download" />

            <div className="max-w-xl mx-auto mt-8 space-y-6">
                {/* Input Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full mb-6 mx-auto">
                            <span className="material-symbols-outlined text-3xl">directions_car</span>
                        </div>
                        <h2 className="text-2xl font-black text-center text-slate-800 dark:text-white mb-2 tracking-tight">
                            Learning Licence Download
                        </h2>
                        <p className="text-center text-slate-500 mb-8 font-medium">
                            Enter Application Number to fetch Learning Licence PDF.
                        </p>

                        <form onSubmit={handleSearch} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                    Application Number *
                                </label>
                                <input
                                    type="text"
                                    value={applNum}
                                    onChange={(e) => {
                                        setApplNum(e.target.value.toUpperCase());
                                        if (error) setError(null);
                                    }}
                                    placeholder="e.g. 12345678"
                                    required
                                    className="w-full px-5 py-4 bg-white border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xl tracking-wider font-black transition-all text-center text-slate-900 uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                    Date of Birth (DOB) <span className="text-xs font-normal text-slate-400 lowercase">(optional / यदि उपलब्ध हो)</span>
                                </label>
                                <input
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-semibold text-center text-slate-900"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !applNum.trim()}
                                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-lg rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Fetching Details...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold">cloud_download</span>
                                        Get LL PDF (19 Coins)
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl space-y-3 animate-fadeIn">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">error</span>
                                    <p className="text-red-700 dark:text-red-300 font-medium text-sm leading-relaxed">{error}</p>
                                </div>
                                <div className="pt-3 border-t border-red-200/60 dark:border-red-800/60 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                        सरकारी Parivahan Sarathi पोर्टल से सीधे प्रिंट करें:
                                    </span>
                                    <a
                                        href={directPortal}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        Parivahan Sarathi Portal &rarr;
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-8">
                        <a
                            href="https://sarathi.parivahan.gov.in/sarathiservice/printlearninglicence.do"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                            Official Parivahan Direct Link
                        </a>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                            <span className="material-symbols-outlined text-[16px]">monetization_on</span>
                            19 Coins
                        </div>
                    </div>
                </div>

                {/* Result Card */}
                {result && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-2xl">verified</span>
                            </div>
                            <div>
                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Success</p>
                                <p className="text-white font-black text-xl tracking-widest">{applNum}</p>
                            </div>
                        </div>
                        
                        {(result.pdf_url || result.a4_pdf || result.a4 || result.pdf || result.data?.pdf || result.base64 || (result.cards && result.cards[0]?.a4)) && (
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
                                <button
                                    onClick={downloadPdf}
                                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all text-base"
                                >
                                    <span className="material-symbols-outlined">download</span>
                                    Download Learning Licence PDF (Print-Ready)
                                </button>
                            </div>
                        )}

                        {result.cards && result.cards.length > 0 && result.cards[0]?.front && (
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4">
                                    Licence Cards (Front & Back)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {result.cards[0].front && (
                                        <div className="space-y-2">
                                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                                <img src={result.cards[0].front} alt="Card Front" className="w-full h-auto object-contain" />
                                            </div>
                                            <a
                                                href={result.cards[0].front}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={`LL_${applNum}_front.png`}
                                                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">download</span>
                                                Download Front
                                            </a>
                                        </div>
                                    )}
                                    {result.cards[0].back && (
                                        <div className="space-y-2">
                                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                                <img src={result.cards[0].back} alt="Card Back" className="w-full h-auto object-contain" />
                                            </div>
                                            <a
                                                href={result.cards[0].back}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={`LL_${applNum}_back.png`}
                                                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">download</span>
                                                Download Back
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="p-6 space-y-1">
                            <InfoRow label="Application / LL Number" value={applNum} icon="tag" />
                            <InfoRow label="Date of Birth" value={dob || result.dob || result.data?.dob} icon="calendar_today" />
                            {result.data?.name && <InfoRow label="Name" value={result.data.name} icon="person" />}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
