import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ records }) {
    return (
        <AdminLayout>
            <Head title="Manual PAN Cards" />
            
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manual PAN Cards</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Your previously generated PAN cards.
                        </p>
                    </div>
                    
                    <Link
                        href="/admin/manual-pan-cards/create"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm shadow-blue-500/20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        Generate New PAN
                    </Link>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Applicant</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">PAN Number</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {records.data.map(record => (
                                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">#{record.id}</td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">{record.name}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">S/o {record.father_name}</div>
                                        </td>
                                        <td className="p-4 text-sm font-mono text-slate-600 dark:text-slate-300">
                                            {record.pan_number}
                                        </td>
                                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(record.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right space-x-3">
                                            <a 
                                                href={`/admin/manual-pan-cards/${record.id}/print`}
                                                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                                                Print
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                                {records.data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400">
                                            No PAN Cards generated yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
