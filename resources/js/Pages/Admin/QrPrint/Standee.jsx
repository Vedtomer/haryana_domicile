import React from 'react';
import { Head } from '@inertiajs/react';

export default function Standee({ shop }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 font-sans print:p-0 print:bg-white print:m-0">
            <Head title={`Counter Standee - ${shop.shop_name}`} />

            {/* Print Controls (Hidden on paper) */}
            <div className="mb-6 flex items-center gap-3 print:hidden">
                <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 transition-all cursor-pointer text-sm"
                >
                    <span className="material-symbols-outlined text-lg">print</span>
                    Print Standee Poster (A4 / Photo Paper)
                </button>
                <button
                    onClick={() => window.close()}
                    className="px-4 py-3 rounded-xl bg-white text-slate-700 font-semibold border border-slate-300 hover:bg-slate-50 transition-colors text-sm"
                >
                    Close
                </button>
            </div>

            {/* The Standee Card (A4 Aspect Ratio Optimized) */}
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-blue-600 print:border-4 print:shadow-none print:max-w-none print:w-full print:h-screen print:rounded-none flex flex-col justify-between p-8 sm:p-10 relative">

                {/* Top Header */}
                <div className="text-center space-y-2 border-b-2 border-slate-100 pb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-xs tracking-wider uppercase">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        Direct Mobile Cloud Printing
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        {shop.shop_name}
                    </h1>
                    {shop.phone && (
                        <p className="text-sm font-semibold text-slate-500">
                            Help / Contact: +91 {shop.phone}
                        </p>
                    )}
                </div>

                {/* Main QR Code Section */}
                <div className="my-6 flex flex-col items-center text-center">
                    <div className="relative p-4 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-xl">
                        <div className="bg-white p-4 rounded-2xl shadow-inner">
                            <img
                                src={shop.qr_url}
                                alt="Scan to Print QR Code"
                                className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                            />
                        </div>
                    </div>

                    <div className="mt-4 space-y-1">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide">
                            Scan QR To Print
                        </h2>
                        <p className="text-sm font-bold text-blue-600">
                            Scan with Phone Camera, Paytm, PhonePe, or Google Lens
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                            Shop Code: <strong>{shop.shop_code}</strong>
                        </p>
                    </div>
                </div>

                {/* Rates Badge */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-3 gap-2 text-center my-2">
                    <div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase">Black & White</div>
                        <div className="text-xl font-black text-slate-800">₹{shop.price_bw_page} <span className="text-xs font-normal text-slate-500">/page</span></div>
                    </div>
                    <div className="border-x border-slate-200">
                        <div className="text-[11px] font-bold text-blue-600 uppercase">Color Print</div>
                        <div className="text-xl font-black text-blue-600">₹{shop.price_color_page} <span className="text-xs font-normal text-slate-500">/page</span></div>
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-purple-600 uppercase">Photo Sheet</div>
                        <div className="text-xl font-black text-purple-600">₹{shop.price_photo_sheet} <span className="text-xs font-normal text-slate-500">/sheet</span></div>
                    </div>
                </div>

                {/* 3 Step Instruction Row */}
                <div className="grid grid-cols-3 gap-3 text-center pt-4 border-t-2 border-slate-100">
                    <div className="space-y-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-sm mx-auto flex items-center justify-center">
                            1
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">Scan QR</h4>
                        <p className="text-[11px] text-slate-500 leading-tight">No App Needed</p>
                    </div>
                    <div className="space-y-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-sm mx-auto flex items-center justify-center">
                            2
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">Upload File</h4>
                        <p className="text-[11px] text-slate-500 leading-tight">PDF, Photo, ID Card</p>
                    </div>
                    <div className="space-y-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-sm mx-auto flex items-center justify-center">
                            3
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">Collect Print</h4>
                        <p className="text-[11px] text-slate-500 leading-tight">From Shop Counter</p>
                    </div>
                </div>

                {/* Footer Badges */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>⚡ Instant Auto-Printing</span>
                    <span>🔒 Safe & Virus Free</span>
                    <span>Powered by <strong>CSP Jaankari</strong></span>
                </div>

            </div>
        </div>
    );
}
