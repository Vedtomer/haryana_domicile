import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ records }) {
    return (
        <AdminLayout>
            <Head title="Haryana Domicile" />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Haryana Domicile Records</h2>
                <Link href="/admin/haryana-domicile/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    + Create Form
                </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Father/Husband Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {records.data.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.father_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.mobile}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.district}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <a href={`/haryana-domicile/print/${record.id}`} target="_blank" className="text-green-600 hover:text-green-900 mr-4 font-semibold">
                                        Print PDF
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {records.data.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex gap-2">
                {records.links.map((link, i) => (
                    link.url ? (
                        <Link
                            key={i}
                            href={link.url}
                            className={`px-4 py-2 border rounded ${link.active ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white hover:bg-gray-50 text-gray-600'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            key={i}
                            className="px-4 py-2 border rounded opacity-50 cursor-not-allowed bg-gray-50 text-gray-500"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )
                ))}
            </div>
        </AdminLayout>
    );
}
