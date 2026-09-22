import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function VehiclePucWithoutOtp() {
    const [vehicleNo, setVehicleNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPdf = async (pucData) => {
        if (!pucData) return;
        if (pucData.pdf_url) {
            window.open(pucData.pdf_url, '_blank');
            return;
        }

        setDownloadingPdf(true);
        try {
            const res = await axios.post('/utilities/vehicle-puc/download-pdf', {
                puc: pucData,
                reg_no: pucData.reg_no || vehicleNo,
            }, {
                responseType: 'blob'
            });

            const blob = new Blob([res.data], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `PUC_Certificate_${(pucData.reg_no || vehicleNo).replace(/\s+/g, '')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error('PUC PDF Download Error:', err);
            alert('Failed to generate/download PDF. Please try again.');
        } finally {
            setDownloadingPdf(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const cleanNo = vehicleNo.replace(/[\s-]/g, '').toUpperCase();
        if (cleanNo.length < 5) {
            setError('Please enter a valid Vehicle Registration Number.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/vehicle-puc-without-otp/search', {
                vehicle_number: cleanNo
            });

            if (response.data.success) {
                setResult(response.data.data);
            } else {
                setError(response.data.message || 'PUC details not found for this vehicle.');
            }
        } catch (err) {
            console.error('Error fetching details:', err);
            setError(err.response?.data?.message || 'An error occurred while fetching PUC details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        Vehicle PUC (Without OTP)
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Download Pollution Under Control (PUC) certificate details instantly without OTP
                    </p>
                </div>
            }
        >
            <Head title="Vehicle PUC (Without OTP)" />

            <div className="max-w-4xl mx-auto mt-6 px-4">
                {/* Input Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                    <div className="p-8">
                        <div className="max-w-xl mx-auto text-center">
                            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400 rounded-2xl mb-5 mx-auto shadow-inner">
                                <span className="material-symbols-outlined text-3xl">verified</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                                Vehicle PUC Instant Search
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">
                                Enter the Vehicle Registration Number to fetch valid PUC Certificate details without OTP.
                            </p>

                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength="15"
                                        value={vehicleNo}
                                        onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                                        placeholder="e.g. HR26DK8337 or DL10CC1234"
                                        className="w-full px-5 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none text-xl font-black transition-all text-center text-slate-900 tracking-widest uppercase font-mono placeholder:font-sans placeholder:tracking-normal placeholder:text-base placeholder:text-slate-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || vehicleNo.trim().length < 5}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black text-base rounded-2xl shadow-lg shadow-green-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Searching PUC Certificate...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-xl">search</span>
                                            Fetch PUC Certificate
                                        </>
                                    )}
                                </button>
                            </form>

                            {error && (
                                <div className="mt-5 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3 text-left">
                                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">error</span>
                                    <p className="text-red-700 dark:text-red-300 font-medium text-sm">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Certificate Display */}
                {result && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-green-300 dark:border-green-800/60 p-6 md:p-8 shadow-xl mb-12 animate-fade-in-up">
                        {/* Certificate Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        {result.status || 'VALID'}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                        Pollution Under Control Certificate
                                    </span>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                                    {result.reg_no || vehicleNo}
                                </h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleDownloadPdf(result)}
                                    disabled={downloadingPdf}
                                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-green-600/30 hover:shadow-green-600/50 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {downloadingPdf ? 'hourglass_top' : 'download'}
                                    </span>
                                    <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                                >
                                    <span className="material-symbols-outlined text-lg">print</span>
                                    Print
                                </button>
                            </div>
                        </div>

                        {/* Certificate Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 my-6">
                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    PUC Certificate No
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-base font-black font-mono text-green-700 dark:text-green-400 select-all">
                                        {result.puc_no || result.certificate_no || 'N/A'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(result.puc_no || result.certificate_no)}
                                        className="p-1 text-slate-400 hover:text-green-600 rounded transition-colors"
                                        title="Copy Certificate No"
                                    >
                                        <span className="material-symbols-outlined text-base">
                                            {copied ? 'check' : 'content_copy'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Valid Upto
                                </p>
                                <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                                    {result.valid_upto || 'N/A'}
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Emission Norms
                                </p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                    {result.emission_norms || 'BS-VI'}
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Fuel Type
                                </p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                    {result.fuel_type || 'PETROL'}
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Vehicle Class
                                </p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                    {result.vehicle_class || 'LMV (Light Motor Vehicle)'}
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Test Date &amp; Time
                                </p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                    {result.test_date || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Test Center Info */}
                        <div className="bg-emerald-50/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-emerald-100 dark:border-slate-700 text-sm">
                            <div className="flex flex-col sm:flex-row justify-between gap-2">
                                <div>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">PUC Testing Centre:</span>
                                    <p className="font-bold text-slate-800 dark:text-white">{result.puc_center_name || 'GOVT AUTHORIZED POLLUTION TESTING STATION'}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Centre Code:</span>
                                    <p className="font-bold font-mono text-slate-800 dark:text-white">{result.puc_center_code || 'PUCC-AUTHORISED'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
