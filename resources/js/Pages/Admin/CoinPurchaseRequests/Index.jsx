import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

// Status config
const STATUS_CONFIG = {
    pending:  { label: 'Pending',  color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-400'  },
    approved: { label: 'Approved', color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500'  },
    rejected: { label: 'Rejected', color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500'    },
};

const TABS = [
    { key: 'pending',  label: 'Pending',  icon: '⏳' },
    { key: 'approved', label: 'Approved', icon: '✅' },
    { key: 'rejected', label: 'Rejected', icon: '❌' },
];

// Reject Modal
function RejectModal({ request, onConfirm, onCancel }) {
    const [notes, setNotes] = useState('');
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {(request.user?.name || request.user?.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{request.user?.name || <span className="italic text-slate-400">No Name</span>}</p>
                        <p className="text-xs text-slate-500">{request.user?.email || request.user?.phone || ''}</p>
                    </div>
                </div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Reason for Rejection</label>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Enter rejection reason..."
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-red-400 focus:outline-none transition-colors resize-none mb-4"
                />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="button" onClick={() => onConfirm(notes)} className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow hover:shadow-md transition-all">Reject</button>
                </div>
            </div>
        </div>
    );
}

// Image Preview Modal
function ImageModal({ url, onClose }) {
    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    Close
                </button>
                <img
                    src={url}
                    alt="Payment Screenshot"
                    className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                />
            </div>
        </div>
    );
}

// Approve Confirmation Modal
function ApproveModal({ request, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-white">
                    <h3 className="text-base font-black">Confirm Approval</h3>
                    <p className="text-xs opacity-80 mt-0.5">Review details before approving this request</p>
                </div>

                <div className="p-5 space-y-4">
                    {/* User info */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                            {(request.user?.name || request.user?.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{request.user?.name || <span className="italic text-slate-400">No Name</span>}</p>
                            <p className="text-xs text-slate-500">{request.user?.email || '—'}</p>
                            {request.user?.phone && <p className="text-xs text-slate-400">{request.user.phone}</p>}
                        </div>
                    </div>

                    {/* Coin & Amount details */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                            <p className="text-xs text-amber-600 font-semibold">Coins</p>
                            <p className="text-lg font-black text-amber-700">{request.coins_requested}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                            <p className="text-xs text-blue-600 font-semibold">Amount</p>
                            <p className="text-lg font-black text-blue-700">₹{request.package_amount}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                            <p className="text-xs text-green-600 font-semibold">Coin Type</p>
                            <p className="text-sm font-black text-green-700">PAID</p>
                        </div>
                    </div>

                    {/* Screenshot */}
                    {request.payment_screenshot && (
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Payment Screenshot</p>
                            <img
                                src={`/storage/${request.payment_screenshot}`}
                                alt="Payment"
                                className="w-full max-h-40 object-contain rounded-xl border border-slate-200 bg-slate-50"
                            />
                        </div>
                    )}

                    {/* Revenue notice */}
                    <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-xs text-green-700 font-medium">
                            Approving this will mark <strong>₹{request.package_amount}</strong> as platform revenue and credit <strong>{request.coins_requested} paid coins</strong> to the user.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-1">
                        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="button" onClick={onConfirm} className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow hover:shadow-md transition-all">
                            ✅ Approve & Credit Coins
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Empty state
function EmptyState({ tab }) {
    return (
        <tr>
            <td colSpan={6} className="px-6 py-16 text-center">
                <div className="text-4xl mb-3">{TABS.find(t => t.key === tab)?.icon}</div>
                <p className="text-slate-500 font-medium">No {tab} requests</p>
                <p className="text-slate-400 text-sm mt-1">All {tab} coin requests will appear here.</p>
            </td>
        </tr>
    );
}

export default function Index({ requests, isAdmin, canAction }) {
    const [activeTab, setActiveTab] = useState('pending');
    const [rejectingRequest, setRejectingRequest] = useState(null);
    const [approvingRequest, setApprovingRequest] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const filtered = requests.data.filter(r => r.status === activeTab);

    const counts = {
        pending:  requests.data.filter(r => r.status === 'pending').length,
        approved: requests.data.filter(r => r.status === 'approved').length,
        rejected: requests.data.filter(r => r.status === 'rejected').length,
    };

    const handleApprove = (request) => {
        setApprovingRequest(request);
    };

    const confirmApprove = () => {
        router.put(`/admin/coin-requests/${approvingRequest.id}`, { action: 'approve' }, {
            preserveScroll: true,
            onSuccess: () => setApprovingRequest(null),
        });
    };

    const handleReject = (id, notes) => {
        router.put(`/admin/coin-requests/${id}`, { action: 'reject', admin_notes: notes }, {
            preserveScroll: true,
            onSuccess: () => setRejectingRequest(null),
        });
    };

    return (
        <AdminLayout>
            <Head title="Coin Requests" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Coin Requests</h2>
                    <p className="mt-1 text-sm text-slate-500">Review and manage user coin purchase requests.</p>
                </div>

                {/* Tab Group */}
                <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl w-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                activeTab === tab.key
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                            {counts[tab.key] > 0 && (
                                <span className={`ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                                    tab.key === 'pending'  ? 'bg-amber-100 text-amber-700' :
                                    tab.key === 'approved' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {counts[tab.key]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Package</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Coins</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Screenshot</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                {isAdmin && activeTab === 'pending' && canAction && (
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                )}
                                {isAdmin && activeTab === 'rejected' && (
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <EmptyState tab={activeTab} />
                            ) : (
                                filtered.map((req) => {
                                    const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                                    return (
                                        <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* User */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                        {(req.user?.name || req.user?.email || req.user?.phone || '?')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{req.user?.name || <span className="italic text-slate-400">No Name</span>}</p>
                                                        <p className="text-xs text-slate-400">{req.user?.email || req.user?.phone || ''}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Package */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold text-slate-700">₹{req.package_amount}</span>
                                            </td>

                                            {/* Coins */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {req.coins_requested}
                                                </span>
                                            </td>

                                            {/* Screenshot */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {req.payment_screenshot ? (
                                                    <button
                                                        onClick={() => setPreviewUrl(`/storage/${req.payment_screenshot}`)}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        View
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No file</span>
                                                )}
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                                                {new Date(req.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>

                                            {/* Pending Actions */}
                                            {isAdmin && activeTab === 'pending' && canAction && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleApprove(req)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-sm hover:shadow transition-all"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectingRequest(req)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg shadow-sm hover:shadow transition-all"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Rejected Reason */}
                                            {isAdmin && activeTab === 'rejected' && (
                                                <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                                                    {req.admin_notes || <span className="italic text-slate-300">—</span>}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {requests.links && (
                    <div className="flex gap-2 mt-4">
                        {requests.links.map((link, i) => (
                            link.url ? (
                                <a
                                    key={i}
                                    href={link.url}
                                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${link.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-4 py-2 text-sm rounded-lg border opacity-40 cursor-not-allowed bg-white text-slate-500 border-slate-200"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>

            {/* Approve Modal */}
            {approvingRequest && (
                <ApproveModal
                    request={approvingRequest}
                    onConfirm={confirmApprove}
                    onCancel={() => setApprovingRequest(null)}
                />
            )}

            {/* Reject Modal */}
            {rejectingRequest && (
                <RejectModal
                    request={rejectingRequest}
                    onConfirm={(notes) => handleReject(rejectingRequest.id, notes)}
                    onCancel={() => setRejectingRequest(null)}
                />
            )}

            {/* Image Preview Modal */}
            {previewUrl && (
                <ImageModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
            )}
        </AdminLayout>
    );
}
