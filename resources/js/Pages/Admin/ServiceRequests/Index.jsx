import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import StatusBadge from '../../../Components/StatusBadge';

export default function Index({ requests, isAdmin, statuses, filters }) {
    const filterBy = (status) =>
        router.get('/admin/service-requests', status ? { status } : {}, { preserveState: true });

    return (
        <AdminLayout>
            <Head title={isAdmin ? 'Service Requests' : 'My Requests'} />

            <div className="mb-5">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isAdmin ? 'Service Requests' : 'My Requests'}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    {isAdmin
                        ? 'Requests from all users. Update the status to notify the user.'
                        : 'Track the services you have requested.'}
                </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => filterBy(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                        !filters.status ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
                    }`}>
                    All
                </button>
                {Object.entries(statuses).map(([key, label]) => (
                    <button key={key} onClick={() => filterBy(key)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                            filters.status === key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
                        }`}>
                        {label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="text-left font-bold px-4 py-3">#</th>
                            <th className="text-left font-bold px-4 py-3">Service</th>
                            {isAdmin && <th className="text-left font-bold px-4 py-3">User</th>}
                            <th className="text-left font-bold px-4 py-3">Coins</th>
                            <th className="text-left font-bold px-4 py-3">Status</th>
                            <th className="text-left font-bold px-4 py-3">Submitted</th>
                            <th className="text-right font-bold px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.data.map((item) => (
                            <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-500">{item.id}</td>
                                <td className="px-4 py-3 font-semibold text-gray-800">
                                    {item.service?.icon} {item.service_name}
                                </td>
                                {isAdmin && (
                                    <td className="px-4 py-3">
                                        <p className="text-gray-800">{item.user?.name}</p>
                                        <p className="text-xs text-gray-500">{item.user?.phone ?? item.user?.email}</p>
                                    </td>
                                )}
                                <td className="px-4 py-3">
                                    {item.coins_charged > 0 ? (
                                        <span className={item.refunded_at ? 'text-gray-400 line-through' : 'text-amber-700 font-semibold'}>
                                            🪙 {item.coins_charged}
                                        </span>
                                    ) : (
                                        <span className="text-green-600 font-semibold">Free</span>
                                    )}
                                </td>
                                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/admin/service-requests/${item.id}`}
                                        className="px-3 py-1.5 font-semibold text-blue-600 hover:bg-blue-50 rounded-lg">
                                        {isAdmin ? 'Review' : 'View'}
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {requests.data.length === 0 && (
                            <tr>
                                <td colSpan={isAdmin ? 7 : 6} className="px-4 py-10 text-center text-gray-400">
                                    No requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap gap-1 mt-4">
                {requests.links.map((link, i) => (
                    <Link key={i} href={link.url ?? '#'}
                        className={`px-3 py-1.5 rounded-lg text-sm ${
                            link.active ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
                        } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                        dangerouslySetInnerHTML={{ __html: link.label }} />
                ))}
            </div>
        </AdminLayout>
    );
}
