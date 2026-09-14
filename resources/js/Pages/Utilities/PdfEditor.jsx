import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

export default function PdfEditor() {
    const [activeTool, setActiveTool] = useState('compress'); // 'compress', 'merge', 'watermark', 'split'
    const [files, setFiles] = useState([]);
    const [targetSize, setTargetSize] = useState('100'); // KB
    const [watermarkText, setWatermarkText] = useState('');
    const [pageRange, setPageRange] = useState('1-end');

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            setError(null);
            setResult(null);
        }
    };

    const handleProcess = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            setError('Please select at least one PDF file.');
            return;
        }

        if (activeTool === 'merge' && files.length < 2) {
            setError('Please select at least 2 PDF files to merge.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('action', activeTool);
            formData.append('target_size', targetSize);
            formData.append('watermark_text', watermarkText);
            formData.append('page_range', pageRange);

            files.forEach((file, index) => {
                formData.append(`files[${index}]`, file);
            });

            const response = await axios.post('/utilities/pdf-editor/process', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'Failed to process PDF.');
            }
        } catch (err) {
            console.error('PDF error:', err);
            setError(err.response?.data?.message || 'Error occurred while processing PDF.');
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
                            <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                PDF Tools
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white leading-tight mt-1">
                            PDF Editor Tool
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Compress, merge, split, watermark, and optimize PDF documents for all portal uploads
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="PDF Editor Tool" />

            <div className="max-w-5xl mx-auto mt-6 px-4 pb-12">
                {/* Main Tool Container */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                    <div className="p-6 sm:p-8">
                        {/* Tool Selector Tabs */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                            {[
                                { id: 'compress', label: 'Compress & Resize', icon: 'compress', desc: 'Reduce file size for forms' },
                                { id: 'merge', label: 'Merge PDFs', icon: 'call_merge', desc: 'Combine multiple into one' },
                                { id: 'split', label: 'Split PDF', icon: 'call_split', desc: 'Extract specific pages' },
                                { id: 'watermark', label: 'Add Watermark', icon: 'branding_watermark', desc: 'Add text or stamps' },
                            ].map((tool) => (
                                <button
                                    key={tool.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveTool(tool.id);
                                        setError(null);
                                        setResult(null);
                                    }}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                                        activeTool === tool.id
                                            ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300 shadow-md'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="material-symbols-outlined text-2xl text-red-500">
                                            {tool.icon}
                                        </span>
                                        {activeTool === tool.id && (
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm leading-tight">{tool.label}</h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{tool.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* File Upload Area */}
                        <form onSubmit={handleProcess} className="space-y-6">
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    multiple={activeTool === 'merge'}
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                                    <span className="material-symbols-outlined text-3xl">upload_file</span>
                                </div>
                                <h3 className="font-black text-lg text-slate-800 dark:text-white">
                                    {files.length > 0 ? `${files.length} File(s) Selected` : 'Select or Drop PDF File(s)'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {activeTool === 'merge'
                                        ? 'Hold Ctrl to select multiple PDF files to merge into one'
                                        : 'Click or drag PDF document to start editing'}
                                </p>

                                {files.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                        {files.map((f, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1.5 shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-sm text-red-500">picture_as_pdf</span>
                                                <span className="max-w-[150px] truncate">{f.name}</span>
                                                <span className="text-slate-400">({(f.size / 1024).toFixed(0)} KB)</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tool Specific Options */}
                            {activeTool === 'compress' && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                                        Select Target Compressed Size
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { size: '50', label: 'Under 50 KB', desc: 'Strict Govt Forms' },
                                            { size: '100', label: 'Under 100 KB', desc: 'Standard Forms' },
                                            { size: '200', label: 'Under 200 KB', desc: 'CSC / Saral Upload' },
                                            { size: '500', label: 'Under 500 KB', desc: 'Balanced Quality' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.size}
                                                type="button"
                                                onClick={() => setTargetSize(opt.size)}
                                                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                                                    targetSize === opt.size
                                                        ? 'bg-red-600 text-white font-black shadow-md border-red-600'
                                                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                <div className="text-sm">{opt.label}</div>
                                                <div className={`text-[10px] mt-0.5 ${targetSize === opt.size ? 'text-red-100' : 'text-slate-400'}`}>
                                                    {opt.desc}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTool === 'watermark' && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                                        Watermark Text
                                    </label>
                                    <input
                                        type="text"
                                        value={watermarkText}
                                        onChange={(e) => setWatermarkText(e.target.value)}
                                        placeholder="e.g. CONFIDENTIAL, SAMPLE, or YOUR SHOP NAME"
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white text-sm"
                                    />
                                </div>
                            )}

                            {activeTool === 'split' && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                                        Page Range to Extract
                                    </label>
                                    <input
                                        type="text"
                                        value={pageRange}
                                        onChange={(e) => setPageRange(e.target.value)}
                                        placeholder="e.g. 1-2, 5, 8-10"
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white text-sm font-mono"
                                    />
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || files.length === 0}
                                className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-base rounded-2xl shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing PDF Document...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl">build</span>
                                        Process PDF
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

                {/* Result Section */}
                {result && (
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-2xl text-white">check_circle</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black">PDF Ready for Download</h3>
                                <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                                    {result.message || 'Your file has been processed successfully.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href={result.download_url || '#'}
                                download
                                onClick={(e) => {
                                    if (!result.download_url) {
                                        alert('Processing completed in test mode.');
                                    }
                                }}
                                className="px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">download</span>
                                Download Processed PDF
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
