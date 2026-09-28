import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

const TYPE_CONFIG = {
    info: { label: 'Information', bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
    warning: { label: 'Warning / Alert', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
    success: { label: 'Success / Update', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
    danger: { label: 'Urgent / Danger', bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
    offer: { label: 'Offer / Promo', bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' },
};

export default function Index({ notices }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [form, setForm] = useState({
        title: '',
        content: '',
        type: 'info',
        is_active: true,
        show_as_popup: false,
        button_text: '',
        button_link: '',
        expires_at: '',
    });

    const openCreate = () => {
        setEditingNotice(null);
        setForm({
            title: '',
            content: '',
            type: 'info',
            is_active: true,
            show_as_popup: false,
            button_text: '',
            button_link: '',
            expires_at: '',
        });
        setModalOpen(true);
    };

    const openEdit = (notice) => {
        setEditingNotice(notice);
        setForm({
            title: notice.title || '',
            content: notice.content || '',
            type: notice.type || 'info',
            is_active: Boolean(notice.is_active),
            show_as_popup: Boolean(notice.show_as_popup),
            button_text: notice.button_text || '',
            button_link: notice.button_link || '',
            expires_at: notice.expires_at ? notice.expires_at.slice(0, 16) : '',
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingNotice) {
            router.put(`/admin/notices/${editingNotice.id}`, form, {
                onSuccess: () => setModalOpen(false)
            });
        } else {
            router.post('/admin/notices', form, {
                onSuccess: () => setModalOpen(false)
            });
        }
    };

    const handleToggle = (id) => {
        router.patch(`/admin/notices/${id}/toggle-status`, {}, { preserveScroll: true });
    };

    const handleDelete = (notice) => {
        if (!confirm(`Delete notice "${notice.title}"?`)) return;
        router.delete(`/admin/notices/${notice.id}`, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="Broadcast Notices & Announcements" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Broadcast Notices &amp; Announcements
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Create live notice banners and popups for all users on the portal.
                        </p>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Create New Notice
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Notice</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type & Display</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action Link</th>
                                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {notices.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-slate-400 text-sm">
                                            No notices created yet. Click "Create New Notice" to broadcast your first announcement.
                                        </td>
                                    </tr>
                                ) : (
                                    notices.data.map((notice) => {
                                        const typeCfg = TYPE_CONFIG[notice.type] || TYPE_CONFIG.info;
                                        return (
                                            <tr key={notice.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="px-5 py-4 max-w-sm">
                                                    <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                                                        {notice.title}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 whitespace-pre-line">
                                                        {notice.content}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 mt-1">
                                                        Created {new Date(notice.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${typeCfg.bg}`}>
                                                        {typeCfg.label}
                                                    </span>
                                                    {notice.show_as_popup && (
                                                        <span className="block mt-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                                                            📌 Modal Popup
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                                                    {notice.button_text ? (
                                                        <a
                                                            href={notice.button_link || '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline font-semibold"
                                                        >
                                                            {notice.button_text} ↗
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => handleToggle(notice.id)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${notice.is_active ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                                        title={notice.is_active ? 'Click to Deactivate' : 'Click to Activate'}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${notice.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => openEdit(notice)}
                                                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                                                            title="Edit Notice"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(notice)}
                                                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                                                            title="Delete Notice"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {editingNotice ? 'Edit Broadcast Notice' : 'Create Broadcast Notice'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-1">
                                    Notice Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Important Server Maintenance / New Service Live!"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-1">
                                    Notice Category / Tone *
                                </label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="info">Information (Blue)</option>
                                    <option value="warning">Warning / Alert (Amber/Orange)</option>
                                    <option value="success">Success / New Feature (Emerald)</option>
                                    <option value="danger">Urgent / Important Notice (Red)</option>
                                    <option value="offer">Special Offer / Promotion (Purple)</option>
                                </select>
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-1">
                                    Message Content *
                                </label>
                                <textarea
                                    rows="3"
                                    required
                                    placeholder="Write your announcement details here..."
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500"
                                ></textarea>
                            </div>

                            {/* Button Text & Link */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-1">
                                        Button Text (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Check Now"
                                        value={form.button_text}
                                        onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-1">
                                        Button Link (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. /dashboard or URL"
                                        value={form.button_link}
                                        onChange={(e) => setForm({ ...form, button_link: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="pt-2 flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>Active (Immediately display to all users)</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.show_as_popup}
                                        onChange={(e) => setForm({ ...form, show_as_popup: e.target.checked })}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>Show as Center Popup Modal</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"
                            >
                                {editingNotice ? 'Update Notice' : 'Publish Notice'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
}
