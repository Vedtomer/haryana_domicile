import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function VehicleDetails() {
    const [regNo, setRegNo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDownload = (e) => {
        e.preventDefault();
        
        if (!regNo.trim()) {
            setError('Please enter a valid vehicle registration number.');
            return;
        }

        setError(null);
        setIsLoading(true);

        const url = `/utilities/vehicle-details/download?reg_no=${encodeURIComponent(regNo.trim())}`;
        
        // Use an iframe to trigger the download so it doesn't navigate away
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        
        // Handle iframe load event to remove it and stop loading state
        iframe.onload = () => {
            setIsLoading(false);
            // If the iframe loads, it means the server returned a page (like an error back()->with('error'))
            // If it was a PDF attachment, the browser handles the download and onload might not fire reliably 
            // depending on the browser, so we also set a timeout.
            
            // To properly handle errors from the backend, we can check if the iframe content contains an error,
            // but due to cross-origin or same-origin policies on attachments, the best approach is to clear loading after a delay.
        };

        document.body.appendChild(iframe);

        // Fallback to stop loading spinner after 5 seconds assuming download started
        setTimeout(() => {
            setIsLoading(false);
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 5000);
    };

    return (
        <AdminLayout>
            <Head title="Vehicle Details" />

            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Header section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-100 text-blue-700 mb-6 shadow-inner">
                        <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            directions_car
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                        Vehicle Details (RC)
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">
                        Enter your vehicle registration number to instantly generate and download full RC details in PDF format.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-8 sm:p-12">
                        <form onSubmit={handleDownload} className="space-y-6">
                            
                            {error && (
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="regNo" className="block text-sm font-bold text-slate-700 mb-2">
                                    Vehicle Registration Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400">pin</span>
                                    </div>
                                    <input
                                        type="text"
                                        id="regNo"
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-lg font-bold text-slate-900 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 focus:ring-0 focus:border-blue-500 focus:bg-white transition-colors"
                                        placeholder="e.g. HR06BJ8412"
                                        value={regNo}
                                        onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                                        required
                                    />
                                </div>
                                <p className="mt-2 text-sm text-slate-500 font-medium">
                                    Enter the number without spaces or special characters.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !regNo.trim()}
                                className="w-full flex items-center justify-center gap-3 py-4 px-8 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">download</span>
                                        Download RC Details
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                    
                    <div className="bg-slate-50 px-8 py-6 border-t border-slate-100">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-1">
                                <span className="material-symbols-outlined text-[20px]">info</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Instant Access</h4>
                                <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                                    The RC details PDF will be generated instantly and downloaded to your device. It contains full owner, vehicle, and insurance information sourced from official public records.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
