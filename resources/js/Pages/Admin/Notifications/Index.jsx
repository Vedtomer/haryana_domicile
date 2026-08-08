import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

const LEVEL_DOT = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
};

export default function Index({ notifications }) {
    return (
        <AdminLayout>
            <Head title="Notifications" />

            <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                <button
                    onClick={() => router.post('/admin/notifications/read-all', {}, { preserveScroll: true })}
                    className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                    Mark all read
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                {notifications.data.map((item) => (
                    <div key={item.id} className={`p-4 ${item.read_at ? '' : 'bg-blue-50/40'}`}>
                        <div className="flex items-start gap-3">
                            <span className={`mt-2 w-2 h-2 rounded-full shrink-0 ${LEVEL_DOT[item.data.level] ?? LEVEL_DOT.info}`} />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800">{item.data.title}</p>
                                <p className="text-sm text-gray-600 mt-0.5">{item.data.body}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(item.created_at).toLocaleString()}
                                </p>
                            </div>
                            {item.data.url && (
                                <Link href={item.data.url}
                                    className="px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg whitespace-nowrap">
                                    Open
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
                {notifications.data.length === 0 && (
                    <p className="p-10 text-center text-gray-400">No notifications yet.</p>
                )}
            </div>

            <div className="flex flex-wrap gap-1 mt-4">
                {notifications.links.map((link, i) => (
                    <Link key={i} href={link.url ?? '#'}
                        className={`px-3 py-1.5 rounded-lg text-sm ${
                            link.active ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
                        } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                        dangerouslySetInnerHTML={{ __html: link.label }} />
                ))}
            </div>
        </AdminLayout>
    );
}
