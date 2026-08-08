import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const TONES = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
};

function StatCard({ label, value, tone, url }) {
    return (
        <Link
            href={url}
            className={`block p-5 rounded-xl border transition hover:shadow-md hover:-translate-y-0.5 ${TONES[tone] ?? TONES.blue}`}
        >
            <p className="text-sm font-semibold opacity-80">{label}</p>
            <p className="text-3xl font-extrabold mt-1">{value}</p>
        </Link>
    );
}

function ServiceCard({ service }) {
    return (
        <Link
            href={service.url}
            className="group relative flex flex-col p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-200"
        >
            <div className="flex items-start justify-between gap-3">
                <span className="text-3xl leading-none">{service.icon}</span>

                {service.is_free ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                        FREE
                    </span>
                ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 whitespace-nowrap">
                        🪙 {service.coin_cost}
                    </span>
                )}
            </div>

            <h3 className="mt-3 font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                {service.name}
            </h3>

            {service.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{service.description}</p>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                    <span className="font-bold text-gray-800 text-base">{service.count}</span> total
                </span>
                <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open →
                </span>
            </div>
        </Link>
    );
}

export default function Dashboard({ services, stats, isAdmin }) {
    const { auth } = usePage().props;

    return (
        <AdminLayout>
            <Head title="Dashboard" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Welcome back, {auth?.user?.name}
                </h1>
                <p className="text-gray-500 mt-1">
                    {isAdmin
                        ? 'Manage services, users and requests from here.'
                        : 'Pick a service below to get started.'}
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Services</h2>
                {isAdmin && (
                    <Link
                        href="/admin/services/create"
                        className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                        + Add Service
                    </Link>
                )}
            </div>

            {services.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
                    No services are active yet.
                    {isAdmin && ' Use "Add Service" to create the first one.'}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {services.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
