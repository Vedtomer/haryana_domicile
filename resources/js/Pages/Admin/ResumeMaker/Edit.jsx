import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResumeBuilderForm from './Form';

export default function Edit({ resume }) {
    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                            edit_document
                        </span>
                        Edit Resume — {resume.full_name}
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Update details, change template style or colors, and re-print without extra coins.
                    </p>
                </div>
            }
        >
            <Head title={`Edit Resume - ${resume.full_name}`} />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <ResumeBuilderForm resume={resume} isEdit={true} />
            </div>
        </AdminLayout>
    );
}
