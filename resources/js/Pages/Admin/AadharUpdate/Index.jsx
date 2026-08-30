import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';

export default function Index({ auth, records }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this record?')) {
            destroy(route('admin.aadhar-update.destroy', id));
        }
    };

    const handlePrint = (id) => {
        window.open(route('admin.aadhar-update.print', id), '_blank');
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Aadhar Update Records</h2>}
        >
            <Head title="Aadhar Update Records" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-4 flex justify-between items-center">
                        <Link
                            href={route('admin.aadhar-update.create')}
                            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                        >
                            Create New Request
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border-b p-2">ID</th>
                                        <th className="border-b p-2">Aadhar Number</th>
                                        <th className="border-b p-2">Name</th>
                                        <th className="border-b p-2">Date</th>
                                        <th className="border-b p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.data.map(record => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="border-b p-2">#{record.id}</td>
                                            <td className="border-b p-2">{record.aadhar_number}</td>
                                            <td className="border-b p-2">{record.name}</td>
                                            <td className="border-b p-2">{new Date(record.created_at).toLocaleDateString()}</td>
                                            <td className="border-b p-2 flex gap-2">
                                                <button
                                                    onClick={() => handlePrint(record.id)}
                                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                                >
                                                    Print
                                                </button>
                                                <Link
                                                    href={route('admin.aadhar-update.edit', record.id)}
                                                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(record.id)}
                                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {records.data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-4 text-center text-gray-500">
                                                No records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Pagination links={records.links} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
