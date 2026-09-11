import React from 'react';
import { Head } from '@inertiajs/react';

export default function Standee({ shop }) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(shop.upload_url)}&margin=10`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start p-4 sm:p-8 print:p-0 print:bg-white">
            <Head title={`Counter Standee - ${shop.shop_name}`} />

            {/* Print Action Bar (Hidden on print) */}
            <div className="w-full max-w-xl mb-6 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm print:hidden">
                <div>
                    <h2 className="font-bold text-slate-800 text-sm">Shop Counter Standee (A4)</h2>
                    <p className="text-xs text-slate-500">Print on A4 paper or photo paper & place on counter</p>
                </div>
                <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    <span>Print Standee</span>
                </button>
            </div>

            {/* A4 Poster Container */}
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-indigo-600 overflow-hidden print:shadow-none print:border-4 print:rounded-none print:w-full print:max-w-none print:m-0">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-widest mb-3 shadow-md">
                        <span>⚡ INSTANT SELF-SERVICE</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase leading-tight">
                        SCAN & PRINT HERE
                    </h1>
                    <p className="text-blue-100 text-sm font-medium mt-1">
                        No WhatsApp • No Bluetooth • Direct Print from Mobile
                    </p>
                    <div className="mt-4 pt-3 border-t border-white/20">
                        <span className="text-xl sm:text-2xl font-bold tracking-wide text-yellow-300">
                            {shop.shop_name}
                        </span>
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="p-8 text-center flex flex-col items-center justify-center bg-white">
                    <div className="p-4 bg-white border-4 border-slate-900 rounded-3xl shadow-lg inline-block">
                        <img
                            src={qrUrl}
                            alt="Scan to Print QR Code"
                            className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                        />
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-300">
                            Shop Code: #{shop.shop_code}
                        </span>
                    </div>
                </div>

                {/* 3 Steps Guide */}
                <div className="px-8 pb-6 grid grid-cols-3 gap-3 text-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
                        <span className="text-2xl block mb-1">📱</span>
                        <strong className="text-xs font-black text-blue-950 block">1. SCAN QR</strong>
                        <span className="text-[11px] text-blue-700 leading-tight block">Open Phone Camera or Scanner</span>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3">
                        <span className="text-2xl block mb-1">📤</span>
                        <strong className="text-xs font-black text-indigo-950 block">2. UPLOAD</strong>
                        <span className="text-[11px] text-indigo-700 leading-tight block">Select PDF or Photo</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                        <span className="text-2xl block mb-1">🖨️</span>
                        <strong className="text-xs font-black text-emerald-950 block">3. GET PRINT</strong>
                        <span className="text-[11px] text-emerald-700 leading-tight block">Print ready at counter instantly!</span>
                    </div>
                </div>

                {/* Rates Footer Banner */}
                <div className="bg-slate-900 text-white p-6 flex items-center justify-around border-t-2 border-slate-800">
                    <div className="text-center">
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
                            Black & White
                        </span>
                        <span className="text-2xl font-black text-white">
                            ₹{parseFloat(shop.bw_rate).toFixed(0)} <span className="text-xs font-normal text-slate-400">/page</span>
                        </span>
                    </div>
                    <div className="h-10 w-px bg-slate-700"></div>
                    <div className="text-center">
                        <span className="text-xs text-pink-400 uppercase font-bold tracking-wider block">
                            Color Print
                        </span>
                        <span className="text-2xl font-black text-pink-400">
                            ₹{parseFloat(shop.color_rate).toFixed(0)} <span className="text-xs font-normal text-slate-400">/page</span>
                        </span>
                    </div>
                </div>

                {/* Counter Notice */}
                <div className="bg-yellow-400 text-slate-950 text-center py-2 px-4 text-xs font-bold tracking-wide">
                    Powered by CSP Jaankari Smart Counter
                </div>
            </div>

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
