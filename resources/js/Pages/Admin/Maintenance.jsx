import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Maintenance({ enabled, message }) {
    const { data, setData, put, processing } = useForm({
        enabled: enabled,
        message: message,
    });

    function save(e) {
        e.preventDefault();
        put('/admin/maintenance');
    }

    function quickToggle() {
        router.post('/admin/maintenance/toggle');
    }

    return (
        <AdminLayout>
            <Head title="Maintenance Mode" />

            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Maintenance Mode</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Enable karne pe sabhi users ko "Site band hai" page dikhai dega. Admin khud normal access kar sakta hai.
                    </p>
                </div>

                {/* Big Toggle Card */}
                <div className={`rounded-2xl border-2 p-6 transition-all duration-300 ${
                    data.enabled
                        ? 'bg-red-50 border-red-200'
                        : 'bg-green-50 border-green-200'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md transition-all ${
                                data.enabled ? 'bg-red-500' : 'bg-green-500'
                            }`}>
                                {data.enabled ? '🔴' : '🟢'}
                            </div>
                            <div>
                                <p className={`text-xl font-black ${data.enabled ? 'text-red-700' : 'text-green-700'}`}>
                                    {data.enabled ? 'Maintenance ON' : 'Maintenance OFF'}
                                </p>
                                <p className={`text-sm font-medium mt-0.5 ${data.enabled ? 'text-red-500' : 'text-green-500'}`}>
                                    {data.enabled
                                        ? 'Users ko "Site band hai" page dikh raha hai'
                                        : 'Site normal chal rahi hai — sab access kar sakte hain'}
                                </p>
                            </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                            onClick={() => setData('enabled', !data.enabled)}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                                data.enabled ? 'bg-red-500' : 'bg-gray-300'
                            }`}
                        >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                data.enabled ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                        </button>
                    </div>

                    {/* Quick Toggle button */}
                    <button
                        onClick={quickToggle}
                        className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm transition ${
                            data.enabled
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                    >
                        {data.enabled ? '✅ Abhi OFF Karein' : '⛔ Abhi ON Karein'}
                    </button>
                </div>

                {/* Settings Form */}
                <form onSubmit={save} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Maintenance Page Settings</h2>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Maintenance Message
                        </label>
                        <textarea
                            value={data.message}
                            onChange={e => setData('message', e.target.value)}
                            rows={3}
                            placeholder="Site par kaam chal raha hai. Thodi der mein wapas aayein."
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">Yeh message users ko maintenance page pe dikhega।</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 text-sm"
                        >
                            {processing ? 'Save Ho Raha Hai...' : '💾 Settings Save Karein'}
                        </button>
                    </div>
                </form>

                {/* Info Box */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <span>⚠️</span> Admin ko kuch affect nahi hoga
                    </h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Admin aur Super Admin ko maintenance page nahi dikhega</li>
                        <li>• Regular users ko site ki jagah maintenance page dikhega</li>
                        <li>• Login page accessible rahega (users login kar sakte hain)</li>
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
}
