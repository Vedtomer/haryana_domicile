import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

const StatusBadge = ({ status }) => {
    const map = {
        pending:  'bg-yellow-100 text-yellow-700',
        approved: 'bg-green-100  text-green-700',
        rejected: 'bg-red-100   text-red-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[status] || ''}`}>
            {status}
        </span>
    );
};

export default function Index({ requests }) {
    const [rejectId,   setRejectId]   = useState(null);
    const [adminNote,  setAdminNote]  = useState('');

    function approve(id) {
        if (!confirm('Is user ki ID activate kar dein?')) return;
        router.post(`/admin/reactivation-requests/${id}/approve`);
    }

    function submitReject() {
        router.post(`/admin/reactivation-requests/${rejectId}/reject`, { admin_note: adminNote }, {
            onSuccess: () => { setRejectId(null); setAdminNote(''); },
        });
    }

    const { data, links, total } = requests;

    return (
        <AdminLayout>
            <Head title="Reactivation Requests" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reactivation Requests</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Users jo inactive ho gaye — ₹99 pay karke ID activate karna chahte hain
                    </p>
                </div>
                <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-xl font-bold text-sm">
                    {total} Total
                </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                        <tr>
                            <th className="text-left px-5 py-3 font-semibold">User</th>
                            <th className="text-left px-5 py-3 font-semibold">UTR Number</th>
                            <th className="text-left px-5 py-3 font-semibold">Amount</th>
                            <th className="text-left px-5 py-3 font-semibold">Screenshot</th>
                            <th className="text-left px-5 py-3 font-semibold">Status</th>
                            <th className="text-left px-5 py-3 font-semibold">Date</th>
                            <th className="text-right px-5 py-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-gray-400">
                                    <div className="text-4xl mb-2">✅</div>
                                    Koi pending reactivation request nahi hai.
                                </td>
                            </tr>
                        )}
                        {data.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-4">
                                    <p className="font-semibold text-gray-800">{req.user?.name || '—'}</p>
                                    <p className="text-xs text-gray-400">{req.user?.phone || req.user?.email}</p>
                                </td>
                                <td className="px-5 py-4">
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg">
                                        {req.utr_number || '—'}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    <span className="font-bold text-green-700">₹{req.amount}</span>
                                </td>
                                <td className="px-5 py-4">
                                    {req.payment_screenshot ? (
                                        <a
                                            href={`/storage/${req.payment_screenshot}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition"
                                        >
                                            📷 View
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 text-xs">—</span>
                                    )}
                                </td>
                                <td className="px-5 py-4">
                                    <StatusBadge status={req.status} />
                                    {req.admin_note && (
                                        <p className="text-xs text-gray-400 mt-1">{req.admin_note}</p>
                                    )}
                                </td>
                                <td className="px-5 py-4 text-gray-400 text-xs">
                                    {new Date(req.created_at).toLocaleDateString('en-IN')}
                                </td>
                                <td className="px-5 py-4 text-right whitespace-nowrap">
                                    {req.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => approve(req.id)}
                                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition mr-2"
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                onClick={() => { setRejectId(req.id); setAdminNote(''); }}
                                                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition"
                                            >
                                                ✗ Reject
                                            </button>
                                        </>
                                    )}
                                    {req.status !== 'pending' && (
                                        <span className="text-xs text-gray-400">
                                            {req.approved_by ? `By Admin` : ''}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {links && links.length > 3 && (
                <div className="flex justify-center gap-1 mt-6">
                    {links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                                link.active
                                    ? 'bg-blue-600 text-white'
                                    : link.url
                                        ? 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        : 'text-gray-300 cursor-not-allowed'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Request Reject Karein</h3>
                        <textarea
                            value={adminNote}
                            onChange={e => setAdminNote(e.target.value)}
                            placeholder="Rejection reason (optional)..."
                            rows={3}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={submitReject}
                                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition text-sm"
                            >
                                Reject Karein
                            </button>
                            <button
                                onClick={() => setRejectId(null)}
                                className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
