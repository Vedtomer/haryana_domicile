import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ users }) {
    const [addingCoinsTo, setAddingCoinsTo] = useState(null); // stores full user object
    const [amount, setAmount] = useState('');
    const [coinType, setCoinType] = useState('trial'); // 'trial' or 'paid'

    const handleAddCoins = (e) => {
        e.preventDefault();
        router.post(`/admin/users/${addingCoinsTo.id}/add-coins`, {
            amount,
            description: coinType === 'trial' ? 'Trial Coins' : 'Paid Coins',
            coin_type: coinType,
        }, {
            onSuccess: () => {
                setAddingCoinsTo(null);
                setAmount('');
                setCoinType('trial');
            }
        });
    };

    const handleToggleStatus = (userId) => {
        router.patch(`/admin/users/${userId}/toggle-status`, {}, { preserveScroll: true });
    };

    const handleDelete = (user) => {
        if (!confirm(`Delete ${user.name || user.email || user.phone || 'this user'}? This cannot be undone.`)) {
            return;
        }
        router.delete(`/admin/users/${user.id}`, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="User Management" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Users</h2>
                        <p className="mt-1 text-sm text-slate-500">Manage all registered user accounts.</p>
                    </div>
                    <Link href="/admin/users/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Create User
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Coins</th>
                                <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {(user.name || user.email || user.phone || '?')[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800">
                                                {user.name || <span className="text-slate-400 italic">No Name</span>}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-700">{user.email || '—'}</div>
                                        <div className="text-xs text-slate-400">{user.phone || ''}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {user.coins ?? 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleToggleStatus(user.id)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${user.is_active ? 'bg-green-500' : 'bg-slate-300'}`}
                                            title={user.is_active ? 'Click to Deactivate' : 'Click to Activate'}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${user.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => setAddingCoinsTo(user)}
                                                title="Add Coins"
                                                className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </button>
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                                title="Edit User"
                                                className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                title="Delete User"
                                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex gap-2">
                    {users.links.map((link, i) => (
                        link.url ? (
                            <Link
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
            </div>

            {/* Add Coins Modal */}
            {addingCoinsTo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <form onSubmit={handleAddCoins} className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm">
                        
                        {/* User Info Header */}
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {(addingCoinsTo.name || addingCoinsTo.email || addingCoinsTo.phone || '?')[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{addingCoinsTo.name || <span className="italic text-slate-400">No Name</span>}</p>
                                {addingCoinsTo.email && <p className="text-xs text-slate-500">{addingCoinsTo.email}</p>}
                                {addingCoinsTo.phone && <p className="text-xs text-slate-400">{addingCoinsTo.phone}</p>}
                            </div>
                        </div>

                        {/* Trial / Paid Toggle */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Coin Type</label>
                            <div className="flex items-center bg-slate-100 rounded-xl p-1">
                                <button
                                    type="button"
                                    onClick={() => setCoinType('trial')}
                                    className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        coinType === 'trial'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    🎁 Trial
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCoinType('paid')}
                                    className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        coinType === 'paid'
                                            ? 'bg-white text-green-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    💳 Paid
                                </button>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-400">
                                {coinType === 'trial' ? 'Complimentary trial coins.' : 'Purchased / manually credited coins.'}
                            </p>
                        </div>

                        {/* Amount */}
                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Amount</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="Enter coin amount"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => { setAddingCoinsTo(null); setAmount(''); setCoinType('trial'); }} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                            <button type="submit" className={`px-4 py-2 text-sm font-bold text-white rounded-xl shadow hover:shadow-md transition-all ${
                                coinType === 'trial' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
                            }`}>
                                Add {coinType === 'trial' ? 'Trial' : 'Paid'} Coins
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
}
