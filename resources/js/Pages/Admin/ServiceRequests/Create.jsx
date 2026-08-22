import React from 'react';
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

    const input = 'w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';

    const digitCapFor = (label) => {
        const l = label.toLowerCase();
        if (l.includes('aadha')) return 12;
        if (l.includes('ration')) return 12;
        if (l.includes('mobile') || l.includes('phone') || l.includes('whatsapp')) return 10;
        return null;
    };

    return (
        <AdminLayout>
            <Head title={service.name} />

            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-4">
                    {service.logo_url ? (
                        <img src={service.logo_url} alt="" className="w-14 h-14 rounded-full object-cover shadow-sm border border-slate-200 flex-shrink-0" />
                    ) : (
                        <span className="text-5xl">{service.icon || '📄'}</span>
                    )}
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">{service.name}</h1>
                        {service.description && <p className="text-slate-500 mt-1">{service.description}</p>}
                    </div>
                </div>

                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                    <span className="text-sm text-amber-800 font-semibold">
                        {service.coin_cost === 0
                            ? 'This service is free.'
                            : `This request costs 🪙 ${service.coin_cost} coins.`}
                    </span>
                    <span className="text-sm text-amber-700">Your balance: 🪙 {userCoins}</span>
                </div>

                {cannotAfford && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        You don't have enough coins for this service.{' '}
                        <Link href="/admin/coin-requests" className="font-bold underline">Buy coins</Link>
                    </div>
                )}

                <form
                    onSubmit={(e) => { e.preventDefault(); post('/admin/service-requests'); }}
                    className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
                >
                    {(service.fields ?? []).map((field, i) => (
                        <div key={i}>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                {field.label}{field.required && ' *'}
                            </label>
                            {field.type === 'textarea' ? (
                                <textarea className={input} rows={2} value={data.fields[i]}
                                    onChange={(e) => setField(i, e.target.value)} />
                            ) : field.type === 'file' ? (
                                <>
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                                        className={`${input} bg-white file:mr-3 file:px-3 file:py-1 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold`}
                                        onChange={(e) => setField(i, e.target.files[0] ?? null)} />
                                    <p className="text-xs text-gray-500 mt-1">PDF, JPG or PNG, up to 5 MB.</p>
                                </>
                            ) : (
                                <input type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                    className={input} value={data.fields[i]}
                                    maxLength={field.type === 'number' ? undefined : digitCapFor(field.label) ?? undefined}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        const cap = digitCapFor(field.label);
                                        if (cap) {
                                            val = val.replace(/\D/g, '').slice(0, cap);
                                        }
                                        setField(i, val);
                                    }} />
                            )}
                            {errors[`fields.${i}`] && (
                                <p className="text-sm text-red-600 mt-1">
                                    {field.type === 'file' ? `Please upload ${field.label}.` : `${field.label} is required.`}
                                </p>
                            )}
                        </div>
                    ))}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Additional Note
                        </label>
                        <textarea className={input} rows={2} value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            placeholder="Anything else the admin should know?" />
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                        <button type="submit" disabled={processing || cannotAfford}
                            className="px-5 py-2.5 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {processing ? 'Submitting…' : 'Submit Request'}
                        </button>
                        <Link href="/dashboard" className="px-5 py-2.5 font-semibold text-gray-600 hover:text-gray-800">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
