import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmDialog from '../../../Components/ConfirmDialog';

export default function Index({ services }) {
    const [toDelete, setToDelete] = useState(null);

    return (
        <AdminLayout>
            <Head title="Manage Services" />

            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manage Services</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Set what each service costs in coins. A cost of 0 makes it free.
                    </p>
                </div>
                <Link href="/admin/services/create"
                    className="px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                    + Add Service
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="text-left font-bold px-4 py-3">Service</th>
                            <th className="text-left font-bold px-4 py-3">Type</th>
                            <th className="text-left font-bold px-4 py-3">Coin Cost</th>
                            <th className="text-left font-bold px-4 py-3">Requests</th>
                            <th className="text-left font-bold px-4 py-3">Status</th>
                            <th className="text-right font-bold px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service) => (
                            <tr key={service.id} className="border-t border-gray-100 hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        {service.logo_url ? (
                                            <img src={service.logo_url} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                                        ) : (
                                            <span className="text-xl">{service.icon || '📄'}</span>
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-800">{service.name}</p>
                                            {service.description && (
                                                <p className="text-xs text-gray-500 line-clamp-1">{service.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        service.kind === 'module'
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {service.kind === 'module' ? 'Built-in form' : 'Admin handled'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {service.coin_cost === 0 ? (
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">FREE</span>
                                    ) : (
                                        <span className="font-bold text-amber-700">🪙 {service.coin_cost}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-gray-700">{service.requests_count}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        service.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {service.is_active ? 'Active' : 'Hidden'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                    <Link href={`/admin/services/${service.id}/edit`}
                                        className="px-3 py-1.5 font-semibold text-blue-600 hover:bg-blue-50 rounded-lg">
                                        Edit
                                    </Link>
                                    <button onClick={() => setToDelete(service)}
                                        className="px-3 py-1.5 font-semibold text-red-600 hover:bg-red-50 rounded-lg">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {services.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                                    No services yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmDialog
                open={!!toDelete}
                title="Delete service?"
                message={`"${toDelete?.name}" will no longer be available to users.`}
                onConfirm={() => router.delete(`/admin/services/${toDelete.id}`, { onFinish: () => setToDelete(null) })}
                onCancel={() => setToDelete(null)}
            />
        </AdminLayout>
    );
}
