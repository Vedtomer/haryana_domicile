import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function AadharToInfo({ coinCost = 99 }) {
    const { auth } = usePage().props;
    const [aadhar, setAadhar] = useState('');
    const [loading, setLoading] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [records, setRecords] = useState(null);
    const [activeRecordIndex, setActiveRecordIndex] = useState(0);
    const [cardSide, setCardSide] = useState('front'); // 'front' or 'back'
    const [error, setError] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [copiedAddressIndex, setCopiedAddressIndex] = useState(null);

    const handleCopy = (text, index, isAddress = false) => {
        if (!text || text === 'N/A') return;
        navigator.clipboard.writeText(text);
        if (isAddress) {
            setCopiedAddressIndex(index);
            setTimeout(() => setCopiedAddressIndex(null), 2000);
        } else {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }
    };

    // Auto format 12 digit aadhaar with spaces: 1234 5678 9012
    const handleAadharChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
        setAadhar(raw);
    };

    const formatDisplayAadhar = (val) => {
        if (!val) return '';
        const parts = val.match(/.{1,4}/g);
        return parts ? parts.join(' ') : val;
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        const cleanNo = aadhar.replace(/\D/g, '');
        if (cleanNo.length !== 12) {
            setError('Please enter a valid 12-digit Aadhaar Number.');
            return;
        }

        setLoading(true);
        setError(null);
        setRecords(null);
        setActiveRecordIndex(0);

        try {
            const response = await axios.post('/utilities/aadhar-to-info/search', {
                aadhar: cleanNo
            });

            if (response.data.success) {
                setRecords(response.data.records);
            } else {
                setError(response.data.message || 'Details not found for this Aadhaar Number.');
            }
        } catch (err) {
            console.error('Error fetching details:', err);
            setError(err.response?.data?.message || 'An error occurred while fetching details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async (recordIdx = 0) => {
        const cleanNo = aadhar.replace(/\D/g, '');
        if (cleanNo.length !== 12) {
            setError('Please search for a valid 12-digit Aadhaar number first.');
            return;
        }

        setDownloadingPdf(true);
        try {
            const response = await axios.post('/utilities/aadhar-to-info/download-pdf', {
                aadhar: cleanNo,
                record_index: recordIdx,
                records: records || []
            }, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `Aadhaar_Verification_Card_${cleanNo}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 3000);
        } catch (err) {
            console.error('Error downloading PDF:', err);
            setError('Failed to generate PDF card. Please try again.');
        } finally {
            setDownloadingPdf(false);
        }
    };

    const getOperatorBadge = (circle = '') => {
        const c = circle.toUpperCase();
        if (c.includes('JIO')) return 'bg-blue-600 text-white';
        if (c.includes('AIRTEL')) return 'bg-red-600 text-white';
        if (c.includes('VI') || c.includes('VODA')) return 'bg-amber-600 text-white';
        if (c.includes('BSNL')) return 'bg-emerald-600 text-white';
        return 'bg-slate-700 text-white';
    };

    const currentPrimary = records && records[activeRecordIndex] ? records[activeRecordIndex] : records?.[0];

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">badge</span>
                            Aadhaar No. To Info & Card Download
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 font-medium">
                            Lookup linked mobile numbers, telecom circle, address & generate printable CR80 PVC Smart Card
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700 shadow-xs">
                            <span>🪙</span>
                            <span>{coinCost} Coins Per Lookup</span>
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Aadhaar No. To Info & PVC Card Download" />

            <div className="max-w-5xl mx-auto mt-6 px-4 sm:px-6 lg:px-8 pb-20">
                
                {/* Search Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                    <div className="p-8 sm:p-10">
                        <div className="text-center max-w-2xl mx-auto mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
                                <span className="material-symbols-outlined text-3xl">search_check</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                Find Info & Download PVC Verification Card
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                Enter the 12-digit Aadhaar number to retrieve all linked telecom records, SIM numbers, circle, and download the print-ready CR80 smart card PDF.
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 text-center">
                                    Enter 12-Digit Aadhaar Number
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors text-2xl">
                                            fingerprint
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength="14" // accounts for spaces
                                        className="block w-full pl-14 pr-12 py-4 bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold text-2xl placeholder-slate-400 dark:placeholder-slate-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-center tracking-[0.2em] font-mono"
                                        placeholder="1234 5678 9012"
                                        value={formatDisplayAadhar(aadhar)}
                                        onChange={handleAadharChange}
                                    />
                                    {aadhar.length === 12 && (
                                        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-emerald-500">
                                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-400 mt-2 px-1">
                                    <span>Format: 12 numerical digits</span>
                                    <span className={aadhar.length === 12 ? 'text-emerald-600 font-bold' : ''}>
                                        {aadhar.length}/12 Digits
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || aadhar.length !== 12}
                                className="mt-6 w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Connecting to Gateway...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-bold">search</span>
                                        Find Info & Details ({coinCost} Coins)
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 max-w-xl mx-auto bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 shrink-0">error</span>
                                <p className="text-red-700 dark:text-red-300 font-medium text-sm">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 px-6 sm:px-10 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Telecom & UID Gateway Verification
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                            Standard CR80 PVC Print &bull; Official Digital Verification Format
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {records && records.length > 0 && (
                    <div className="space-y-8 transform animate-in fade-in zoom-in-95 duration-300">
                        
                        {/* Download & Action Header Banner */}
                        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2 border border-emerald-500/30">
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    <span>Verification Successful &bull; {records.length} {records.length === 1 ? 'Record' : 'Records'} Found</span>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                    {records[0]?.name || 'Cardholder'}
                                </h3>
                                <p className="text-blue-200 text-sm mt-1">
                                    Aadhaar: <span className="font-mono font-bold text-white tracking-widest">{formatDisplayAadhar(aadhar)}</span>
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <button
                                    onClick={() => handleDownloadPdf(activeRecordIndex)}
                                    disabled={downloadingPdf}
                                    className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {downloadingPdf ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating PDF Card...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-xl">download</span>
                                            Download PVC Card (PDF)
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => window.print()}
                                    className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm backdrop-blur-md transition-all flex items-center gap-2 border border-white/20"
                                >
                                    <span className="material-symbols-outlined text-xl">print</span>
                                    Print
                                </button>
                            </div>
                        </div>

                        {/* Interactive Digital Smart Card Mockup */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">credit_card</span>
                                        PVC Smart Card Preview
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        CR80 Format (85.60 mm &times; 53.98 mm) &bull; Standard PVC Printing Size
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                    <button
                                        onClick={() => setCardSide('front')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            cardSide === 'front'
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                        }`}
                                    >
                                        Front Side
                                    </button>
                                    <button
                                        onClick={() => setCardSide('back')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            cardSide === 'back'
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                        }`}
                                    >
                                        Back Side
                                    </button>
                                </div>
                            </div>

                            {/* Center Preview Card */}
                            <div className="flex justify-center my-4">
                                <div className="w-full max-w-[440px] aspect-[85.6/54] rounded-2xl overflow-hidden border-2 border-slate-800 dark:border-slate-700 shadow-2xl bg-white relative flex flex-col justify-between text-slate-900 select-none">
                                    
                                    {cardSide === 'front' ? (
                                        <>
                                            {/* Front Header Bar */}
                                            <div>
                                                <div className="bg-[#0c2b5e] text-white px-4 py-2.5 flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 bg-white rounded-md p-0.5 flex items-center justify-center shrink-0">
                                                            <img src="/images/emblem.svg" alt="Emblem" className="h-6" onError={(e) => { e.target.style.display = 'none'; }} />
                                                        </div>
                                                        <div>
                                                            <div className="text-[9px] font-black text-amber-300 tracking-wider uppercase leading-none">
                                                                GOVERNMENT OF INDIA
                                                            </div>
                                                            <div className="text-[10px] font-black tracking-tight uppercase leading-none mt-0.5">
                                                                AADHAAR INFO & TELECOM CARD
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase rounded tracking-wide">
                                                        VERIFIED
                                                    </span>
                                                </div>
                                                {/* Tricolor line */}
                                                <div className="h-1 flex">
                                                    <div className="w-1/3 bg-orange-500"></div>
                                                    <div className="w-1/3 bg-white"></div>
                                                    <div className="w-1/3 bg-emerald-600"></div>
                                                </div>
                                            </div>

                                            {/* Front Body */}
                                            <div className="px-4 py-3 flex-1 flex items-start justify-between gap-3">
                                                <div className="flex-1 space-y-2">
                                                    {/* Chip & Name */}
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-9 h-7 bg-amber-400 border border-amber-600 rounded-md shadow-inner flex flex-col justify-center relative shrink-0">
                                                            <div className="h-[1px] bg-amber-700 my-0.5 w-full"></div>
                                                            <div className="h-[1px] bg-amber-700 my-0.5 w-full"></div>
                                                            <div className="w-[1px] bg-amber-700 h-full absolute left-1/2 -translate-x-1/2"></div>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-[9px] font-bold text-slate-400 uppercase leading-none">Subscriber</div>
                                                            <div className="text-sm font-black text-slate-900 uppercase truncate leading-tight">
                                                                {currentPrimary?.name || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Father Name */}
                                                    <div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase leading-none">Father / Guardian</div>
                                                        <div className="text-xs font-bold text-slate-800 leading-tight">
                                                            {currentPrimary?.fname || 'N/A'}
                                                        </div>
                                                    </div>

                                                    {/* Aadhaar Number */}
                                                    <div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase leading-none">Aadhaar Number</div>
                                                        <div className="text-sm font-mono font-black text-slate-900 tracking-wider">
                                                            {formatDisplayAadhar(aadhar)}
                                                        </div>
                                                    </div>

                                                    {/* Mobile & Circle */}
                                                    <div className="flex items-center gap-2 pt-0.5">
                                                        <div>
                                                            <div className="text-[9px] font-bold text-slate-400 uppercase leading-none">Mobile</div>
                                                            <div className="text-xs font-mono font-black text-emerald-700">
                                                                +91 {currentPrimary?.num || 'N/A'}
                                                            </div>
                                                        </div>
                                                        {currentPrimary?.circle && currentPrimary.circle !== 'N/A' && (
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shadow-xs ${getOperatorBadge(currentPrimary.circle)}`}>
                                                                {currentPrimary.circle}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* QR Code */}
                                                <div className="w-20 shrink-0 text-center flex flex-col items-center justify-center">
                                                    <div className="w-18 h-18 bg-slate-50 border border-slate-200 rounded-lg p-1 shadow-xs flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-4xl text-slate-800">qr_code_2</span>
                                                    </div>
                                                    <span className="text-[8px] font-black text-emerald-700 uppercase tracking-wide mt-1">
                                                        SECURE QR
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Front Footer */}
                                            <div className="bg-slate-100 px-4 py-1 text-[8px] font-bold text-slate-600 text-center border-t border-slate-200 tracking-wide">
                                                Unique Identification &bull; Telecom KYC Verification Record &bull; Govt of India
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Back Header Bar */}
                                            <div>
                                                <div className="bg-[#0c2b5e] text-white px-4 py-2 flex items-center justify-between">
                                                    <div>
                                                        <div className="text-[8px] font-bold text-amber-300 uppercase leading-none">
                                                            DEPARTMENT OF TELECOMMUNICATIONS &bull; GOI
                                                        </div>
                                                        <div className="text-[9px] font-black uppercase mt-0.5 leading-none">
                                                            REGISTERED ADDRESS & KYC DETAILS
                                                        </div>
                                                    </div>
                                                    <span className="text-[8px] font-mono text-slate-300">CR80-PVC</span>
                                                </div>
                                                <div className="h-1 flex">
                                                    <div className="w-1/3 bg-orange-500"></div>
                                                    <div className="w-1/3 bg-white"></div>
                                                    <div className="w-1/3 bg-emerald-600"></div>
                                                </div>
                                            </div>

                                            {/* Back Body */}
                                            <div className="px-4 py-3 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase">Registered Address:</div>
                                                    <p className="text-[11px] font-semibold text-slate-800 leading-snug mt-0.5">
                                                        {currentPrimary?.address || 'N/A'}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 py-1 border-t border-b border-slate-100">
                                                    <div>
                                                        <div className="text-[8px] text-slate-400 font-bold uppercase">Circle</div>
                                                        <div className="text-[10px] font-black text-blue-900">{currentPrimary?.circle || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] text-slate-400 font-bold uppercase">Total SIMs</div>
                                                        <div className="text-[10px] font-black text-emerald-700">{records.length} Numbers</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] text-slate-400 font-bold uppercase">Date</div>
                                                        <div className="text-[10px] font-mono font-bold text-slate-700">{new Date().toLocaleDateString('en-GB')}</div>
                                                    </div>
                                                </div>

                                                {/* Barcode simulation */}
                                                <div className="text-center">
                                                    <div className="font-mono text-xs tracking-widest text-slate-800 font-bold">||| | |||| | || |||| | | |||| |</div>
                                                    <div className="text-[8px] font-mono text-slate-400">UID-VER-{aadhar.slice(-4)}</div>
                                                </div>
                                            </div>

                                            {/* Back Footer */}
                                            <div className="bg-slate-100 px-4 py-1 text-[8px] font-bold text-slate-600 text-center border-t border-slate-200">
                                                Help: UIDAI 1947 &bull; DoT: 1963 &bull; portal.uidai.gov.in
                                            </div>
                                        </>
                                    )}

                                </div>
                            </div>

                            <div className="text-center mt-3">
                                <button
                                    onClick={() => handleDownloadPdf(activeRecordIndex)}
                                    disabled={downloadingPdf}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-base">download</span>
                                    Download This Card as PDF
                                </button>
                            </div>
                        </div>

                        {/* All Linked Numbers Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600">sim_card</span>
                                    All Linked SIM Records ({records.length})
                                </h3>
                                <span className="text-xs text-slate-500 font-medium">
                                    Click any connection to preview card
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {records.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setActiveRecordIndex(idx)}
                                        className={`rounded-3xl p-6 transition-all cursor-pointer border-2 relative ${
                                            activeRecordIndex === idx
                                                ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 dark:border-blue-500 shadow-xl shadow-blue-500/10'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-md'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2.5">
                                                <span className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center ${
                                                    activeRecordIndex === idx
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                }`}>
                                                    #{idx + 1}
                                                </span>
                                                <div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase">Subscriber Name</div>
                                                    <div className="font-black text-slate-900 dark:text-white text-base">
                                                        {item.name}
                                                    </div>
                                                </div>
                                            </div>
                                            {item.circle && item.circle !== 'N/A' && (
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${getOperatorBadge(item.circle)}`}>
                                                    {item.circle}
                                                </span>
                                            )}
                                        </div>

                                        {/* Mobile Number Box */}
                                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 mb-4 border border-slate-100 dark:border-slate-700/50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        Registered Mobile
                                                    </span>
                                                    <div className="text-xl font-black text-slate-900 dark:text-white tracking-wider font-mono">
                                                        +91 {item.num}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {item.num && item.num !== 'N/A' && (
                                                        <a
                                                            href={`https://wa.me/91${item.num.replace(/\D/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition shadow-sm"
                                                            title="WhatsApp"
                                                        >
                                                            <span className="material-symbols-outlined text-base leading-none">chat</span>
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopy(item.num, idx, false);
                                                        }}
                                                        className={`p-2 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                                                            copiedIndex === idx
                                                                ? 'bg-green-600 text-white'
                                                                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                                                        }`}
                                                        title="Copy Mobile"
                                                    >
                                                        <span className="material-symbols-outlined text-base leading-none">
                                                            {copiedIndex === idx ? 'done' : 'content_copy'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            {item.alt && (
                                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                                                    <span className="text-slate-500 font-medium">Alternate:</span>
                                                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{item.alt}</strong>
                                                </div>
                                            )}
                                        </div>

                                        {/* Father Name */}
                                        <div className="mb-3 px-1 text-xs flex items-center justify-between">
                                            <span className="text-slate-500 font-medium">Father / Guardian:</span>
                                            <strong className="text-slate-800 dark:text-slate-200">{item.fname}</strong>
                                        </div>

                                        {/* Address */}
                                        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                                                        <span className="material-symbols-outlined text-xs">location_on</span>
                                                        Registered Address
                                                    </span>
                                                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium line-clamp-2">
                                                        {item.address}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopy(item.address, idx, true);
                                                    }}
                                                    className={`p-1.5 rounded-lg text-xs transition ${
                                                        copiedAddressIndex === idx
                                                            ? 'text-green-600 bg-green-50'
                                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                                                    }`}
                                                    title="Copy Address"
                                                >
                                                    <span className="material-symbols-outlined text-base">
                                                        {copiedAddressIndex === idx ? 'done' : 'content_copy'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Individual Card Download */}
                                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <span className="text-[11px] text-slate-400 font-medium">
                                                {activeRecordIndex === idx ? 'Currently Selected' : 'Click to select'}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownloadPdf(idx);
                                                }}
                                                disabled={downloadingPdf}
                                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs transition flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">download</span>
                                                Download Card
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
