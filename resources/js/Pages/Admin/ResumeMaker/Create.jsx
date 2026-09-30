import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResumeBuilderForm from './Form';

export default function Create({ coinCost }) {
    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                            post_add
                        </span>
                        Create Professional Resume / Bio-Data
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Fill in candidate details, select your preferred theme & colors, and print directly.
                    </p>
                </div>
            }
        >
            <Head title="Create Resume" />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <ResumeBuilderForm coinCost={coinCost} isEdit={false} />
            </div>
        </AdminLayout>
    );
}
