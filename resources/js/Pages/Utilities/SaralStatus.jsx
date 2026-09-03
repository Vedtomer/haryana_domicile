import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function SaralStatus() {
    const { auth } = usePage().props;
    const [saralId, setSaralId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!saralId.trim()) {
            setError('Please enter a valid Saral Certificate Number.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/utilities/saral-status/search', { saral_id: saralId.trim() });
            if (response.data.success) {
                setResult(response.data.html);
            } else {
                setError(response.data.message || 'Status not found or an error occurred.');
            }
        } catch (err) {
            setError('An error occurred while fetching the status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <Head title="Saral Certificate Status" />

            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Header section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-100 text-blue-700 mb-6 shadow-inner">
                        <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            fact_check
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                        Saral Certificate Status
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">
                        Enter your e-Disha/Saral Certificate Reference Number to instantly check its current status.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-8 sm:p-12">
                        <form onSubmit={handleSearch} className="space-y-6">
                            
                            {error && (
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="saralId" className="block text-sm font-bold text-slate-700 mb-2">
                                    Certificate Number (Saral ID)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400">numbers</span>
                                    </div>
                                    <input
                                        type="text"
                                        id="saralId"
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-lg font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:ring-0 focus:border-blue-500 focus:bg-white transition-colors tracking-wide"
                                        placeholder="e.g. CIDR/2023/12345"
                                        value={saralId}
                                        onChange={(e) => setSaralId(e.target.value.toUpperCase())}
                                        required
                                    />
                                </div>
                                <p className="mt-2 text-sm text-slate-500 font-medium">
                                    Enter the complete EDisha/Saral ID exactly as it appears on your receipt.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !saralId.trim()}
                                className="w-full flex items-center justify-center gap-3 py-4 px-8 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Checking Status...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">search</span>
                                        Check Status (Free)
                                    </>
                                )}
                            </button>
                        </form>

                        {result && (
                            <div className="mt-10 pt-8 border-t border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    Status Results
                                </h3>
                                <div 
                                    className="overflow-x-auto result-table-container bg-slate-50 p-4 rounded-xl border border-slate-200"
                                    dangerouslySetInnerHTML={{ __html: result }}
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-1">
                                <span className="material-symbols-outlined text-[20px]">info</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Live Portal Integration</h4>
                                <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                                    The details are fetched instantly via live Haryana e-Disha Status portal.
                                </p>
                            </div>
                        </div>
                        <div className="flex-shrink-0 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-sm shadow-inner border border-green-200">
                            Service: Free
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                .result-table-container table {
                    width: 100%;
                    text-align: left;
                    border-collapse: collapse;
                }
                .result-table-container th, 
                .result-table-container td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .result-table-container th {
                    background-color: #f1f5f9;
                    font-weight: 700;
                    color: #334155;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                }
                .result-table-container td {
                    color: #475569;
                    font-size: 0.875rem;
                }
                .result-table-container tr:last-child td {
                    border-bottom: none;
                }
            `}</style>
        </AdminLayout>
    );
}
