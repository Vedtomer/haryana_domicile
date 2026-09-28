import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminChatModal from '../../../Components/AdminChatModal';
import AdminScreenViewModal from '../../../Components/AdminScreenViewModal';

export default function Index({ users, allUsers = [] }) {
    const [addingCoinsTo, setAddingCoinsTo] = useState(null); // stores full user object
    const [chatUser, setChatUser] = useState(null); // user currently being chatted with
    const [screenUser, setScreenUser] = useState(null); // user currently having screen viewed
    const [amount, setAmount] = useState('');
    const [coinType, setCoinType] = useState('trial'); // 'trial' or 'paid'
    const [copiedCode, setCopiedCode] = useState(null);

    // Clear Work Data states
    const [showClearAllModal, setShowClearAllModal] = useState(false);
    const [clearAllScope, setClearAllScope] = useState('users'); // 'users', 'all', or 'selected'
    const [clearAllResetCoins, setClearAllResetCoins] = useState(false);
    const [clearAllTransactions, setClearAllTransactions] = useState(false);
    const [isClearingAll, setIsClearingAll] = useState(false);

    // Selective user clearing states
    const [selectedTableUserIds, setSelectedTableUserIds] = useState([]);
    const [modalSelectedUserIds, setModalSelectedUserIds] = useState([]);
    const [userSearchQuery, setUserSearchQuery] = useState('');

    const availableUsersList = (allUsers && allUsers.length > 0) ? allUsers : (users?.data || []);

    const handleClearAllSubmit = (e) => {
        e.preventDefault();
        if (clearAllScope === 'selected' && modalSelectedUserIds.length === 0) {
            alert('Please select at least one user to clear.');
            return;
        }
        setIsClearingAll(true);
        router.post('/admin/users/clear-all-work-data', {
            target: clearAllScope,
            user_ids: modalSelectedUserIds,
            reset_coins: clearAllResetCoins,
            clear_transactions: clearAllTransactions,
        }, {
            preserveScroll: true,
            onFinish: () => setIsClearingAll(false),
            onSuccess: () => {
                setShowClearAllModal(false);
                setClearAllScope('users');
                setModalSelectedUserIds([]);
                setSelectedTableUserIds([]);
                setUserSearchQuery('');
                setClearAllResetCoins(false);
                setClearAllTransactions(false);
            }
        });
    };

    const handleCopyCode = (code) => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Periodically refresh presence and unread counts without full page reload
    useEffect(() => {
        const timer = setInterval(() => {
            router.reload({ only: ['users'], preserveScroll: true });
        }, 15000);
        return () => clearInterval(timer);
    }, []);

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

    const handleClearCoins = (user) => {
        if (!confirm(`Are you sure you want to reset ${user.name || 'this user'}'s coins to 0?`)) return;
        router.post(`/admin/users/${user.id}/clear-coins`, {}, { preserveScroll: true });
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
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowClearAllModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear All Work Data
                        </button>
                        <Link href="/admin/users/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Create User
                        </Link>
                    </div>
                </div>

                {selectedTableUserIds.length > 0 && (
                    <div className="bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-rose-600 text-white text-sm font-black flex items-center justify-center shadow-xs">
                                {selectedTableUserIds.length}
                            </span>
                            <div>
                                <span className="text-sm font-bold text-rose-950 dark:text-rose-100 block">
                                    {selectedTableUserIds.length} User{selectedTableUserIds.length > 1 ? 's' : ''} Selected
                                </span>
                                <span className="text-xs text-rose-700 dark:text-rose-400">
                                    Choose Clear Work Data to wipe all work history for these specific accounts.
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setModalSelectedUserIds([...selectedTableUserIds]);
                                    setClearAllScope('selected');
                                    setShowClearAllModal(true);
                                }}
                                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Clear Work Data for Selected ({selectedTableUserIds.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedTableUserIds([])}
                                className="px-3.5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                            >
                                Deselect All
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                    <th className="w-10 px-4 py-3.5 text-center">
                                        <input
                                            type="checkbox"
                                            title="Select all users on this page"
                                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                            checked={users.data.length > 0 && users.data.every(u => selectedTableUserIds.includes(u.id))}
                                            onChange={(e) => {
                                                const pageIds = users.data.map(u => u.id);
                                                if (e.target.checked) {
                                                    setSelectedTableUserIds(prev => Array.from(new Set([...prev, ...pageIds])));
                                                } else {
                                                    setSelectedTableUserIds(prev => prev.filter(id => !pageIds.includes(id)));
                                                }
                                            }}
                                        />
                                    </th>
                                    <th className="px-4 sm:px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-4 sm:px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Referral & Coins</th>
                                    <th className="px-4 sm:px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered</th>
                                    <th className="px-4 sm:px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 sm:px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {users.data.map((user) => (
                                    <tr key={user.id} className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors ${selectedTableUserIds.includes(user.id) ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''}`}>
                                        <td className="w-10 px-4 py-3.5 text-center whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                                checked={selectedTableUserIds.includes(user.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedTableUserIds(prev => [...prev, user.id]);
                                                    } else {
                                                        setSelectedTableUserIds(prev => prev.filter(id => id !== user.id));
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-slate-800 dark:text-white mb-0.5">
                                            {user.name || <span className="text-slate-400 italic font-normal">No Name</span>}
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-300">{user.email || '—'}</div>
                                        <div className="text-xs text-slate-400 mb-1">{user.phone || ''}</div>
                                        {user.raw_password && (
                                            <div className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-800 rounded px-2 py-0.5 inline-flex items-center gap-1 border border-slate-300/50 dark:border-slate-700" title="User Password">
                                                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-4l5.618-5.618A6 6 0 0115 7h.01" /></svg>
                                                {user.raw_password}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                    {user.referral_code || '—'}
                                                </span>
                                                {user.referral_code && (
                                                    <button
                                                        onClick={() => handleCopyCode(user.referral_code)}
                                                        type="button"
                                                        className="text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        title="Copy Referral Code"
                                                    >
                                                        {copiedCode === user.referral_code ? (
                                                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                        ) : (
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                {user.referrer ? (
                                                    <span>
                                                        By: <span className="font-semibold text-slate-700 dark:text-slate-300">{user.referrer.name || user.referrer.phone}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Direct</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {user.referrals_count > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        {user.referrals_count} {user.referrals_count === 1 ? 'referral' : 'referrals'}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800" title="User Coins">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {user.coins ?? 0}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                                        <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </div>
                                    </td>

                                    <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleToggleStatus(user.id)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${user.is_active ? 'bg-green-500' : 'bg-slate-300'}`}
                                            title={user.is_active ? 'Click to Deactivate' : 'Click to Activate'}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${user.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                    <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* Chat with User Button */}
                                            <button
                                                type="button"
                                                onClick={() => setChatUser(user)}
                                                title={`Message ${user.name || 'User'}`}
                                                className="relative p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                {user.unread_messages_count > 0 && (
                                                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-red-500 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-bounce shadow-sm">
                                                        {user.unread_messages_count}
                                                    </span>
                                                )}
                                            </button>

                                            {/* Live Screen Share / View Display Button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!user.is_online) {
                                                        if (!confirm(`${user.name || 'User'} is currently OFFLINE.\nDo you still want to send a Screen Share request?`)) {
                                                            return;
                                                        }
                                                    }
                                                    setScreenUser(user);
                                                }}
                                                title={`View ${user.name || 'User'}'s Screen (Live Display)`}
                                                className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </button>

                                            {/* Add Coins */}
                                            <button
                                                onClick={() => setAddingCoinsTo(user)}
                                                title="Add Coins"
                                                className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 transition-colors cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </button>

                                            {/* Clear Coins to 0 */}
                                            <button
                                                onClick={() => handleClearCoins(user)}
                                                title="Clear Coins to 0"
                                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                            </button>

                                            {/* Delete User */}
                                            <button
                                                onClick={() => handleDelete(user)}
                                                title="Delete User"
                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 hover:text-red-600 transition-colors cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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

            {/* Direct Admin-User Chat Modal */}
            <AdminChatModal
                user={chatUser}
                onClose={() => {
                    setChatUser(null);
                    router.reload({ only: ['users'], preserveScroll: true });
                }}
            />

            {/* Admin Live Screen View Modal */}
            <AdminScreenViewModal
                user={screenUser}
                onClose={() => {
                    setScreenUser(null);
                    router.reload({ only: ['users'], preserveScroll: true });
                }}
            />

            {/* Clear All Work Data Modal */}
            {showClearAllModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <form onSubmit={handleClearAllSubmit} className={`bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl w-full ${clearAllScope === 'selected' ? 'max-w-xl' : 'max-w-md'} border border-slate-200 dark:border-slate-800 transition-all`}>
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Clear Users' Work Data</h3>
                                <p className="text-xs text-slate-500">Delete created forms, certificates, & history</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-4 text-xs text-amber-800 dark:text-amber-300">
                            <strong>Warning:</strong> This permanently deletes work records across all services (Aadhaar updates, agreements, certificates, passbooks, PAN records, domicile forms, print jobs, and uploaded files).
                        </div>

                        {/* Target Selection */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide">Target Users</label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="target"
                                        value="users"
                                        checked={clearAllScope === 'users'}
                                        onChange={() => setClearAllScope('users')}
                                        className="text-rose-600 focus:ring-rose-500 cursor-pointer"
                                    />
                                    <span>Regular Users only (Preserves admin/staff accounts)</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="target"
                                        value="all"
                                        checked={clearAllScope === 'all'}
                                        onChange={() => setClearAllScope('all')}
                                        className="text-rose-600 focus:ring-rose-500 cursor-pointer"
                                    />
                                    <span>All Users (Includes sub-admins / all roles)</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="target"
                                        value="selected"
                                        checked={clearAllScope === 'selected'}
                                        onChange={() => setClearAllScope('selected')}
                                        className="text-rose-600 focus:ring-rose-500 cursor-pointer"
                                    />
                                    <span className="font-bold text-rose-600 dark:text-rose-400">
                                        Select Specific Users ({modalSelectedUserIds.length} selected)
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* User Selection Box if selected scope */}
                        {clearAllScope === 'selected' && (
                            <div className="mb-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                                        Select Users ({modalSelectedUserIds.length} chosen)
                                    </label>
                                    <div className="flex items-center gap-2 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const q = userSearchQuery.toLowerCase();
                                                const filteredIds = availableUsersList
                                                    .filter(u => {
                                                        return !q ||
                                                            (u.name && u.name.toLowerCase().includes(q)) ||
                                                            (u.phone && u.phone.includes(q)) ||
                                                            (u.email && u.email.toLowerCase().includes(q));
                                                    })
                                                    .map(u => u.id);
                                                setModalSelectedUserIds(prev => Array.from(new Set([...prev, ...filteredIds])));
                                            }}
                                            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-slate-300">|</span>
                                        <button
                                            type="button"
                                            onClick={() => setModalSelectedUserIds([])}
                                            className="text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className="relative mb-2">
                                    <input
                                        type="text"
                                        placeholder="Search by name, phone, or email..."
                                        value={userSearchQuery}
                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                        className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
                                    />
                                    <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Scrollable User List */}
                                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                    {availableUsersList
                                        .filter(u => {
                                            const q = userSearchQuery.toLowerCase();
                                            return !q ||
                                                (u.name && u.name.toLowerCase().includes(q)) ||
                                                (u.phone && u.phone.includes(q)) ||
                                                (u.email && u.email.toLowerCase().includes(q));
                                        })
                                        .map(u => {
                                            const isChecked = modalSelectedUserIds.includes(u.id);
                                            return (
                                                <label
                                                    key={u.id}
                                                    className={`flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${isChecked ? 'bg-rose-50/60 dark:bg-rose-950/20' : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setModalSelectedUserIds(prev => [...prev, u.id]);
                                                            } else {
                                                                setModalSelectedUserIds(prev => prev.filter(id => id !== u.id));
                                                            }
                                                        }}
                                                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                                                            {u.name || 'No Name'}
                                                            {u.type !== 'user' && (
                                                                <span className="ml-1.5 px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 rounded">
                                                                    {u.type}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                            {u.phone || u.email || 'No contact'}
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                </div>
                                {modalSelectedUserIds.length === 0 && (
                                    <p className="mt-2 text-xs text-rose-500 font-medium">
                                        * Please check at least one user from the list above.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Optional checkboxes */}
                        <div className="space-y-2 mb-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={clearAllResetCoins}
                                    onChange={(e) => setClearAllResetCoins(e.target.checked)}
                                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                />
                                <span>Also reset coins to 0 for these users</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={clearAllTransactions}
                                    onChange={(e) => setClearAllTransactions(e.target.checked)}
                                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                />
                                <span>Also clear coin transaction history logs</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                disabled={isClearingAll}
                                onClick={() => setShowClearAllModal(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isClearingAll || (clearAllScope === 'selected' && modalSelectedUserIds.length === 0)}
                                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {isClearingAll ? 'Clearing...' : (
                                    clearAllScope === 'selected'
                                        ? `Delete Work Data (${modalSelectedUserIds.length} Users)`
                                        : 'Yes, Delete Work Data'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </AdminLayout>
    );
}
