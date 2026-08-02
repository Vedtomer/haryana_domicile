import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ requests, isAdmin }) {
    return (
        <AdminLayout>
            <Head title="PAN Requests" />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">PAN Card Applications</h2>
                {!isAdmin && (
                    <Link href="/admin/pan-requests/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        + Apply for PAN
                    </Link>
                )}
            </div>
            
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aadhar</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UTR Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.data.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.aadhar_number}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.utr_number}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                        req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/admin/pan-requests/${req.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4 font-semibold">
                                        View/Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {requests.data.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No PAN requests found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex gap-2">
                {requests.links.map((link, i) => (
                    <Link
                        key={i}
                        href={link.url}
                        className={`px-4 py-2 border rounded ${link.active ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white hover:bg-gray-50 text-gray-600'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </AdminLayout>
    );
}
