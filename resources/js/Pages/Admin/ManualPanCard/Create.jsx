import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';


export default function Create({ blocker, cost }) {
    const { data, setData, post, processing, errors } = useForm({
        pan_number: '',
        name: '',
        father_name: '',
        dob: '',
        photo: null,
        signature: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/manual-pan-cards');
    };

    if (blocker) {
        return (
            <AdminLayout>
                <Head title="Manual PAN Card - Blocked" />
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                        <p className="text-red-600 dark:text-red-400 font-medium">{blocker}</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Head title="Create Manual PAN Card" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/manual-pan-cards"
                        className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Generate PAN Card</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Fill in the details to instantly generate a printable PAN card. Cost: <strong className="text-amber-500">{cost} coins</strong>.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 sm:p-8 space-y-6">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PAN Number *</label>
                                <input
                                    type="text"
                                    value={data.pan_number}
                                    onChange={e => setData('pan_number', e.target.value.toUpperCase())}
                                    required
                                    placeholder="ABCDE1234F"
                                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.pan_number && <div className="text-red-500 text-sm mt-1">{errors.pan_number}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value.toUpperCase())}
                                    required
                                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Father's Name *</label>
                                <input
                                    type="text"
                                    value={data.father_name}
                                    onChange={e => setData('father_name', e.target.value.toUpperCase())}
                                    required
                                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.father_name && <div className="text-red-500 text-sm mt-1">{errors.father_name}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth *</label>
                                <input
                                    type="text"
                                    value={data.dob}
                                    onChange={e => setData('dob', e.target.value)}
                                    placeholder="DD/MM/YYYY"
                                    required
                                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.dob && <div className="text-red-500 text-sm mt-1">{errors.dob}</div>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Applicant Photo (JPG/PNG) *</label>
                                <input
                                    type="file"
                                    onChange={e => setData('photo', e.target.files[0])}
                                    accept="image/*"
                                    required
                                    className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-blue-400"
                                />
                                {errors.photo && <div className="text-red-500 text-sm mt-1">{errors.photo}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Applicant Signature (JPG/PNG) *</label>
                                <input
                                    type="file"
                                    onChange={e => setData('signature', e.target.files[0])}
                                    accept="image/*"
                                    required
                                    className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-blue-400"
                                />
                                {errors.signature && <div className="text-red-500 text-sm mt-1">{errors.signature}</div>}
                            </div>
                        </div>

                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                        <Link
                            href="/admin/manual-pan-cards"
                            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm shadow-blue-500/20"
                        >
                            {processing ? 'Processing...' : 'Generate & Print'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
