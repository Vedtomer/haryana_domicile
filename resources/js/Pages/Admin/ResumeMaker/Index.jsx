import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import CustomerWhatsAppModal from '../../../Components/CustomerWhatsAppModal';

export default function Index({ records, coinCost }) {
    const { flash } = usePage().props;
    const printId = flash?.print_resume_id;
    const [toDelete, setToDelete] = useState(null);
    const [printingId, setPrintingId] = useState(null);
    const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
    const [selectedResumeForWhatsApp, setSelectedResumeForWhatsApp] = useState(null);

    const handleDirectPrint = (id) => {
        setPrintingId(id);

        const oldFrame = document.getElementById('silent-resume-print-frame');
        if (oldFrame) {
            oldFrame.remove();
        }

        const iframe = document.createElement('iframe');
        iframe.id = 'silent-resume-print-frame';
        iframe.src = `/admin/resume-maker/${id}/print?direct=1`;
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.opacity = '0.01';
        iframe.style.border = 'none';
        iframe.style.pointerEvents = 'none';
        document.body.appendChild(iframe);

        iframe.onload = () => {
            setTimeout(() => {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                } catch (err) {
                    console.error('Direct print failed:', err);
                } finally {
                    setPrintingId(null);
                }
            }, 500);
        };
    };

    const handleOpenWhatsApp = (resume) => {
        setSelectedResumeForWhatsApp(resume);
        setWhatsAppModalOpen(true);
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                                description
                            </span>
                            Resume / CV / Bio-Data Maker
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Create professional 1-page modern & classic resumes with photo in seconds.
                        </p>
                    </div>

                    <Link
                        href="/admin/resume-maker/create"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        + Create New Resume
                        {coinCost > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                                🪙 {coinCost}
                            </span>
                        )}
                    </Link>
                </div>
            }
        >
            <Head title="Resume / CV Maker" />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Print Banner from recent save */}
                {printId && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-3xl text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                                check_circle
                            </span>
                            <div>
                                <p className="font-bold text-emerald-900 text-sm">Resume Created Successfully!</p>
                                <p className="text-xs text-emerald-700 mt-0.5">Click the button below to send print command directly to your printer without opening any tab.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            disabled={printingId === printId}
                            onClick={() => handleDirectPrint(printId)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow transition-all disabled:opacity-60"
                        >
                            <span className={`material-symbols-outlined text-lg ${printingId === printId ? 'animate-spin' : ''}`}>
                                {printingId === printId ? 'sync' : 'print'}
                            </span>
                            {printingId === printId ? 'Printing...' : 'Direct Print Now'}
                        </button>
                    </div>
                )}

                {/* Resumes Grid */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-base">folder_open</span>
                            Saved Resumes ({records?.total ?? 0})
                        </h2>
                        <span className="text-xs text-slate-500 font-medium">Standard 1-Page A4 Ready</span>
                    </div>

                    {(!records?.data || records.data.length === 0) ? (
                        <div className="text-center py-16 px-4">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">
                                post_add
                            </span>
                            <h3 className="font-bold text-slate-800 text-base">No Resumes Created Yet</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                                Start making professional, clean resumes for your customers with photos, education, and experience.
                            </p>
                            <Link
                                href="/admin/resume-maker/create"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow"
                            >
                                <span className="material-symbols-outlined text-base">add</span>
                                Create First Resume
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {records.data.map((resume) => (
                                <div
                                    key={resume.id}
                                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                                >
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-400">
                                            {resume.photo_url ? (
                                                <img src={resume.photo_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-2xl">account_circle</span>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-900 text-base truncate">
                                                    {resume.full_name}
                                                </h3>
                                                <span
                                                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                                                    style={{ backgroundColor: resume.accent_color || '#1e3a8a' }}
                                                >
                                                    {resume.template_style || 'modern'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                {resume.title} • {resume.phone} {resume.email ? `• ${resume.email}` : ''}
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                Created on {resume.created_at} {resume.user_name ? `• by ${resume.user_name}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                                        <button
                                            type="button"
                                            disabled={printingId === resume.id}
                                            onClick={() => handleDirectPrint(resume.id)}
                                            className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs inline-flex items-center gap-1.5 border border-emerald-200 transition-colors"
                                            title="Send direct print command to printer"
                                        >
                                            <span className={`material-symbols-outlined text-sm ${printingId === resume.id ? 'animate-spin' : ''}`}>
                                                {printingId === resume.id ? 'sync' : 'print'}
                                            </span>
                                            {printingId === resume.id ? 'Printing...' : 'Direct Print'}
                                        </button>

                                        <Link
                                            href={`/admin/resume-maker/${resume.id}/print`}
                                            target="_blank"
                                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center"
                                            title="Open Preview in Tab"
                                        >
                                            <span className="material-symbols-outlined text-lg">visibility</span>
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => handleOpenWhatsApp(resume)}
                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center"
                                            title="Share with Customer on WhatsApp"
                                        >
                                            <span className="material-symbols-outlined text-lg">chat</span>
                                        </button>

                                        <Link
                                            href={`/admin/resume-maker/${resume.id}/edit`}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                                            title="Edit Resume"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => setToDelete(resume)}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                                            title="Delete Resume"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {records?.links && records.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <div>
                                Showing {records.from} to {records.to} of {records.total} records
                            </div>
                            <div className="flex gap-1">
                                {records.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        disabled={!link.url}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                            link.active
                                                ? 'bg-blue-600 text-white font-bold'
                                                : link.url
                                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={!!toDelete}
                title="Delete Resume?"
                message={`Are you sure you want to permanently delete the resume for "${toDelete?.full_name}"?`}
                onConfirm={() => {
                    router.delete(`/admin/resume-maker/${toDelete.id}`, {
                        onFinish: () => setToDelete(null),
                    });
                }}
                onCancel={() => setToDelete(null)}
                confirmLabel="Yes, Delete"
            />

            {/* WhatsApp Share Modal */}
            {selectedResumeForWhatsApp && (
                <CustomerWhatsAppModal
                    open={whatsAppModalOpen}
                    onClose={() => setWhatsAppModalOpen(false)}
                    customerPhone={selectedResumeForWhatsApp.phone || ''}
                    customerName={selectedResumeForWhatsApp.full_name || ''}
                    documentType="Professional Resume / CV"
                    documentUrl={`${window.location.origin}/admin/resume-maker/${selectedResumeForWhatsApp.id}/print`}
                />
            )}
        </AdminLayout>
    );
}
