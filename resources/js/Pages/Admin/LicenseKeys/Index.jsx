import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ keys, filters, stats }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [duration, setDuration] = useState(6);
    const [notes, setNotes] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedKey, setCopiedKey] = useState(null);

    // Modal state for activating an unused key for a user
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [activateTargetKey, setActivateTargetKey] = useState(null);
    const [activateUserQuery, setActivateUserQuery] = useState('');
    const [isActivatingKey, setIsActivatingKey] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/license-keys', { search, status }, { preserveState: true });
    };

    const handleStatusFilter = (newStatus) => {
        setStatus(newStatus);
        router.get('/admin/license-keys', { search, status: newStatus }, { preserveState: true });
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        setIsGenerating(true);
        router.post('/admin/license-keys/generate', {
            quantity,
            duration_months: duration,
            notes,
        }, {
            onSuccess: () => {
                setShowGenerateModal(false);
                setQuantity(1);
                setNotes('');
                setIsGenerating(false);
            },
            onFinish: () => setIsGenerating(false),
        });
    };

    // 1. Activate handler
    const handleActivateClick = (keyItem) => {
        if (keyItem.activator || keyItem.purchaser) {
            const userName = keyItem.activator?.name || keyItem.purchaser?.name || 'user';
            if (!confirm(`Are you sure you want to ACTIVATE key ${keyItem.key} for ${userName}?`)) return;
            router.post(`/admin/license-keys/${keyItem.id}/activate`, {}, {
                preserveScroll: true,
            });
        } else {
            // Unused key with no user: open modal to optionally input user email/phone
            setActivateTargetKey(keyItem);
            setActivateUserQuery('');
            setShowActivateModal(true);
        }
    };

    const confirmActivate = (e) => {
        if (e) e.preventDefault();
        if (!activateTargetKey) return;
        setIsActivatingKey(true);
        router.post(`/admin/license-keys/${activateTargetKey.id}/activate`, {
            user_query: activateUserQuery,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowActivateModal(false);
                setActivateTargetKey(null);
                setActivateUserQuery('');
                setIsActivatingKey(false);
            },
            onError: () => setIsActivatingKey(false),
            onFinish: () => setIsActivatingKey(false),
        });
    };

    // 2. Deactivate handler
    const handleDeactivate = (id, keyString) => {
        if (!confirm(`Are you sure you want to DEACTIVATE license key: ${keyString}?\nThis will also stop the user's portal access.`)) return;
        router.post(`/admin/license-keys/${id}/deactivate`, {}, {
            preserveScroll: true,
        });
    };

    // 3. Delete handler
    const handleDelete = (id, keyString) => {
        if (!confirm(`⚠️ Are you sure you want to permanently DELETE key: ${keyString}?\nThis action CANNOT be undone!`)) return;
        router.delete(`/admin/license-keys/${id}`, {
            preserveScroll: true,
        });
    };

    // 4. Reset Device Lock handler
    const handleResetDevice = (id, keyString, deviceName) => {
        if (!confirm(`Reset Desktop Lock for License: ${keyString}?\nDevice: ${deviceName || 'Registered Desktop'}\n\nUser can then access and lock this license to a new Desktop PC.`)) return;
        router.post(`/admin/license-keys/${id}/reset-device`, {}, {
            preserveScroll: true,
        });
    };

    const copyToClipboard = (keyString) => {
        navigator.clipboard.writeText(keyString);
        setCopiedKey(keyString);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const statusBadge = (s) => {
        switch (s) {
            case 'active':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Active</span>;
            case 'unused':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">Unused</span>;
            case 'revoked':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">Deactivated</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{s}</span>;
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        Portal License Keys
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Manage and generate 6-month portal license keys (50 Coins)
                    </p>
                </div>
            }
        >
            <Head title="License Keys - Admin" />

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Keys</p>
                    <p className="text-2xl font-black text-gray-800 mt-1">{stats?.total || 0}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm bg-emerald-50/30">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active Keys</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">{stats?.active || 0}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm bg-blue-50/30">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Unused Keys</p>
                    <p className="text-2xl font-black text-blue-700 mt-1">{stats?.unused || 0}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-red-100 shadow-sm bg-red-50/30">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Deactivated</p>
                    <p className="text-2xl font-black text-red-700 mt-1">{stats?.revoked || 0}</p>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Search by key, user name, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
                        Search
                    </button>
                </form>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                        {['', 'active', 'unused', 'revoked'].map((s) => (
                            <button
                                key={s}
                                onClick={() => handleStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                                    status === s ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {s === 'revoked' ? 'Deactivated' : (s || 'All')}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowGenerateModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Generate Keys
                    </button>
                </div>
            </div>

            {/* Keys Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-200">
                            <tr>
                                <th className="px-5 py-3.5 font-bold">License Key</th>
                                <th className="px-5 py-3.5 font-bold">Duration</th>
                                <th className="px-5 py-3.5 font-bold">Status</th>
                                <th className="px-5 py-3.5 font-bold">Purchased By</th>
                                <th className="px-5 py-3.5 font-bold">Activated By</th>
                                <th className="px-5 py-3.5 font-bold">Valid Till</th>
                                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {keys.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-5 py-10 text-center text-gray-400 font-medium">
                                        No license keys found. Click "Generate Keys" to create one.
                                    </td>
                                </tr>
                            ) : (
                                keys.data.map((k) => (
                                    <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-gray-800 tracking-wider bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                                                    {k.key}
                                                </span>
                                                <button
                                                    onClick={() => copyToClipboard(k.key)}
                                                    className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors"
                                                    title="Copy key"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">
                                                        {copiedKey === k.key ? 'done' : 'content_copy'}
                                                    </span>
                                                </button>
                                            </div>
                                            {k.notes && <p className="text-[11px] text-gray-400 mt-0.5">{k.notes}</p>}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-gray-700">
                                            {k.duration_months} Months
                                            {k.cost_coins > 0 && (
                                                <span className="block text-[11px] text-amber-600 font-normal">🪙 {k.cost_coins} Coins</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            {statusBadge(k.status)}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">
                                            {k.purchaser ? (
                                                <div>
                                                    <p className="font-semibold text-gray-800">{k.purchaser.name}</p>
                                                    <p className="text-xs text-gray-400">{k.purchaser.phone || k.purchaser.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">System / Admin</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">
                                            {k.activator ? (
                                                <div>
                                                    <p className="font-semibold text-gray-800">{k.activator.name}</p>
                                                    <p className="text-xs text-gray-400">{k.activator.phone || k.activator.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600">
                                            {k.expires_at ? (
                                                <span className="font-semibold text-gray-800">{new Date(k.expires_at).toLocaleDateString('en-GB')}</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Reset PC Button */}
                                                {k.device_id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleResetDevice(k.id, k.key, k.device_name)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs hover:border-indigo-300 transition-all cursor-pointer"
                                                        title="Reset Desktop Hardware Lock so user can bind new PC"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">device_reset</span>
                                                        <span>Reset PC</span>
                                                    </button>
                                                )}

                                                {/* Active Button */}
                                                {k.status !== 'active' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleActivateClick(k)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-2xs hover:border-emerald-300 transition-all cursor-pointer"
                                                        title="Active / Activate this key"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                        <span>Active</span>
                                                    </button>
                                                )}

                                                {/* Deactive Button */}
                                                {k.status !== 'revoked' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeactivate(k.id, k.key)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shadow-2xs hover:border-amber-300 transition-all cursor-pointer"
                                                        title="Deactive / Deactivate this key"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">block</span>
                                                        <span>Deactive</span>
                                                    </button>
                                                )}

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(k.id, k.key)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg shadow-2xs hover:border-red-300 transition-all cursor-pointer"
                                                    title="Delete this key permanently"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {keys.links && keys.links.length > 3 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>Showing {keys.from || 0} to {keys.to || 0} of {keys.total} keys</span>
                        <div className="flex gap-1">
                            {keys.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    preserveScroll
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                                        link.active
                                            ? 'bg-slate-900 text-white font-bold border-slate-900'
                                            : !link.url
                                            ? 'text-gray-300 border-gray-100 cursor-not-allowed'
                                            : 'text-gray-600 border-gray-200 hover:bg-gray-100'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Generate Keys Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined">vpn_key</span>
                                <h3 className="text-lg font-bold">Generate License Keys</h3>
                            </div>
                            <button
                                onClick={() => setShowGenerateModal(false)}
                                className="text-white/80 hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleGenerate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Number of Keys to Generate
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Duration (Months)
                                </label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                >
                                    <option value={1}>1 Month</option>
                                    <option value={3}>3 Months</option>
                                    <option value={6}>6 Months (Default)</option>
                                    <option value={12}>12 Months (1 Year)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Notes / Batch Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Promo batch, Shop name..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowGenerateModal(false)}
                                    className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isGenerating}
                                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-colors disabled:opacity-50 text-sm"
                                >
                                    {isGenerating ? 'Generating...' : `Generate ${quantity} Key(s)`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Activate Unused Key Modal */}
            {showActivateModal && activateTargetKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center overflow-hidden">
                        <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                        </div>
                        <h3 className="text-lg font-black text-gray-900">Activate License Key</h3>
                        <div className="p-2.5 bg-slate-50 border border-gray-200 rounded-xl mt-2">
                            <p className="font-mono font-bold text-sm text-slate-800 tracking-wider">
                                {activateTargetKey.key}
                            </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 text-left">
                            Kis user ke liye activate karna chahte hain? User ki <strong>Email ya Phone</strong> number enter karein:
                        </p>
                        <form onSubmit={confirmActivate} className="mt-2 space-y-3">
                            <input
                                type="text"
                                placeholder="User Email ya Phone (Optional)"
                                value={activateUserQuery}
                                onChange={(e) => setActivateUserQuery(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                autoFocus
                            />
                            <p className="text-[11px] text-gray-400 text-left">
                                *Khali chhodne par key Active/Unused mark ho jayegi.
                            </p>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowActivateModal(false);
                                        setActivateTargetKey(null);
                                    }}
                                    className="flex-1 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isActivatingKey}
                                    className="flex-1 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {isActivatingKey ? 'Activating...' : 'Activate Key'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
