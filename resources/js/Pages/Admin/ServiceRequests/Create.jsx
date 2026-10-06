import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Create({ service, userCoins }) {
    const { data, setData, post, processing, errors } = useForm({
        service_id: service.id,
        fields: (service.fields ?? []).map((f) => (f.type === 'file' ? null : '')),
        note: '',
    });

    const setField = (index, value) =>
        setData('fields', data.fields.map((v, i) => (i === index ? value : v)));

    const cannotAfford = service.coin_cost > 0 && userCoins < service.coin_cost;

    const formatValueForField = (label, val) => {
        const l = label.toLowerCase();
        if (l.includes('aadha')) {
            return val.replace(/\D/g, '').slice(0, 12);
        }
        if (l.includes('mobile') || l.includes('phone') || l.includes('whatsapp')) {
            return val.replace(/\D/g, '').slice(0, 10);
        }
        if (l.includes('pan')) {
            return val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
        }
        return val;
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">assignment</span>
                    <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-tight">
                        {service.name}
                    </h1>
                </div>
            }
        >
            <Head title={service.name} />

            <div className="max-w-xl mx-auto py-2 sm:py-4">
                {/* 1. TOP SERVICE HEADER CARD (Matches Screenshot) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs mb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            {service.logo_url ? (
                                <img
                                    src={service.logo_url}
                                    alt=""
                                    className="w-10 h-10 rounded-2xl object-cover shadow-2xs border border-slate-200 dark:border-slate-700"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shadow-2xs">
                                    {service.icon || '🪪'}
                                </div>
                            )}
                            <div>
                                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                                    {service.name}
                                </h1>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Instant Request Portal
                                </span>
                            </div>
                        </div>

                        {/* Price Display */}
                        <div className="text-right">
                            <span className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400">
                                ₹{Number(service.coin_cost ?? 0).toFixed(2)}
                            </span>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">
                                {service.coin_cost === 0 ? 'FREE' : `${service.coin_cost} COINS`}
                            </span>
                        </div>
                    </div>

                    {/* Notice Box (Matches Screenshot) */}
                    {service.description && (
                        <div className="p-3.5 bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl flex items-start gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <span className="material-symbols-outlined text-[19px] text-slate-500 dark:text-slate-400 shrink-0 mt-0.5">
                                info
                            </span>
                            <span className="leading-relaxed">
                                {service.description}
                            </span>
                        </div>
                    )}
                </div>

                {/* Balance alert if low */}
                {cannotAfford && (
                    <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-3xl text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-rose-600">error</span>
                            <span>वॉलेट में पर्याप्त बैलेंस नहीं है (उपलब्ध: 🪙 {userCoins})</span>
                        </div>
                        <Link
                            href="/wallet/add"
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs whitespace-nowrap"
                        >
                            Add Money
                        </Link>
                    </div>
                )}

                {/* 2. MAIN APPLICANT DETAILS FORM CARD (Matches Screenshot) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
                    {/* Section Header */}
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm shadow-2xs font-bold">
                            ✨
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                            Applicant Details
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">
                        Sahi jaankari bharein — request submit ke baad change nahi hoti.
                    </p>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            post('/admin/service-requests');
                        }}
                        className="space-y-4 sm:space-y-5"
                    >
                        {(service.fields ?? []).map((field, i) => (
                            <div key={i} className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                    <span>{field.label}</span>
                                    {field.required && <span className="text-red-500 font-black">*</span>}
                                </label>

                                {field.type === 'textarea' ? (
                                    <textarea
                                        rows={3}
                                        value={data.fields[i]}
                                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                        onChange={(e) => setField(i, e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-xs"
                                    />
                                ) : field.type === 'file' ? (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setField(i, e.target.files[0] ?? null)}
                                            className="w-full px-3 py-2.5 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-900 dark:text-white file:mr-3 file:px-3 file:py-1.5 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:font-black cursor-pointer shadow-xs"
                                        />
                                        <p className="text-[11px] text-slate-400 mt-1">PDF, JPG or PNG (Up to 5 MB)</p>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        value={data.fields[i]}
                                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                        onChange={(e) => {
                                            const formatted = formatValueForField(field.label, e.target.value);
                                            setField(i, formatted);
                                        }}
                                        className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-xs"
                                    />
                                )}

                                {errors[`fields.${i}`] && (
                                    <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-[15px]">error</span>
                                        <span>
                                            {field.type === 'file' ? `Please upload ${field.label}.` : `${field.label} is required.`}
                                        </span>
                                    </p>
                                )}
                            </div>
                        ))}

                        {/* Submit Request Button (Matches Screenshot) */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing || cannotAfford}
                                className="w-full py-4 px-6 font-black text-sm sm:text-base text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-2xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                                        <span>Submitting Request...</span>
                                    </>
                                ) : (
                                    <span>Submit Request</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

