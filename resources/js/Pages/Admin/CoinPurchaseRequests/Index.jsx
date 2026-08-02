import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ requests, isAdmin }) {

    const handleApprove = (id) => {
        if(confirm('Are you sure you want to approve this request?')) {
            router.put(`/admin/coin-requests/${id}`, { action: 'approve' });
        }
    };

    const handleReject = (id) => {
        const notes = prompt('Enter reason for rejection:');
        if (notes !== null) {
            router.put(`/admin/coin-requests/${id}`, { action: 'reject', admin_notes: notes });
        }
    };

    return (
        <AdminLayout>
            <Head title="Coin Purchase Requests" />
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Coin Purchase Requests</h2>
            
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coins</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Screenshot</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.data.map((req) => (
                            <tr key={req.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.user?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{req.coins_requested}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{req.package_amount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                                    <a href={`/storage/${req.payment_screenshot}`} target="_blank" rel="noreferrer">View</a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {req.status.toUpperCase()}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {req.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleApprove(req.id)} className="text-green-600 hover:text-green-900 mr-4 font-bold">Approve</button>
                                                <button onClick={() => handleReject(req.id)} className="text-red-600 hover:text-red-900 font-bold">Reject</button>
                                            </>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination links here... */}
        </AdminLayout>
    );
}
