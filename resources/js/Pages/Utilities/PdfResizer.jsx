import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function PdfResizer() {
    const { auth } = usePage().props;

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        PDF Resizer
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Compress and resize your PDF files easily
                    </p>
                </div>
            }
        >
            <Head title="PDF Resizer" />

            <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[85vh]">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                            PDF Resize Tool
                        </h3>
                    </div>
                    <iframe
                        src="https://pdf.pi7.org/resize-pdf"
                        className="w-full flex-grow border-0"
                        title="PDF Resizer"
                        allow="camera; microphone; geolocation"
                    ></iframe>
                </div>
            </div>
        </AdminLayout>
    );
}
