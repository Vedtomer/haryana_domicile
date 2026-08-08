import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

const LEVEL_DOT = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
};

export default function NotificationBell() {
    const { notifications } = usePage().props;
    const [open, setOpen] = useState(false);

    const unread = notifications?.unread ?? 0;
    const recent = notifications?.recent ?? [];

    const openNotification = (item) => {
        setOpen(false);
        if (!item.read) {
            router.post(`/admin/notifications/${item.id}/read`, {}, { preserveScroll: true });
        }
        if (item.url) {
            router.visit(item.url);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Notifications"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1h6z" />
                </svg>
                {unread > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <span className="font-bold text-gray-800">Notifications</span>
                            {unread > 0 && (
                                <button
                                    onClick={() => {
                                        router.post('/admin/notifications/read-all', {}, { preserveScroll: true });
                                        setOpen(false);
                                    }}
                                    className="text-xs font-semibold text-blue-600 hover:underline"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {recent.length === 0 && (
                                <p className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet.</p>
                            )}

                            {recent.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => openNotification(item)}
                                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                        item.read ? '' : 'bg-blue-50/50'
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${LEVEL_DOT[item.level] ?? LEVEL_DOT.info}`} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.body}</p>
                                            <p className="text-[11px] text-gray-400 mt-1">{item.ago}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <Link
                            href="/admin/notifications"
                            onClick={() => setOpen(false)}
                            className="block px-4 py-3 text-center text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            View all
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
