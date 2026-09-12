import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmDialog from '../../../Components/ConfirmDialog';

export default function Index({ services }) {
    const [toDelete, setToDelete] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'hidden'

    const filteredServices = services.filter((service) => {
        const matchesSearch =
            service.name.toLowerCase().includes(search.toLowerCase()) ||
            (service.description && service.description.toLowerCase().includes(search.toLowerCase()));

        if (!matchesSearch) return false;

        if (filterStatus === 'active') return service.is_active;
        if (filterStatus === 'hidden') return !service.is_active;

        return true;
    });

    const handleToggleStatus = (service) => {
        router.patch(`/admin/services/${service.id}/toggle-active`, {}, { preserveScroll: true });
    };

    const renderServiceIcon = (service) => {
        if (service.logo_url) {
            return (
                <img
                    src={service.logo_url}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-gray-200 shadow-sm flex-shrink-0"
                />
            );
        }

        const icon = service.icon || 'miscellaneous_services';

        // Check if it's an emoji (contains non-ascii or emoji character)
        const isEmoji = /\p{Extended_Pictographic}/u.test(icon);

        if (isEmoji) {
            return (
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-2xl shadow-inner">
                    {icon}
                </div>
            );
        }

        // Clean icon string if font-awesome or prefix was entered
        const cleanIcon = icon.replace('fas fa-', '').replace('fa-', '');

        return (
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {cleanIcon}
                </span>
            </div>
        );
    };

    const activeCount = services.filter((s) => s.is_active).length;
    const freeCount = services.filter((s) => s.coin_cost === 0).length;

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        Manage Services
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        Configure pricing, visibility, and form settings for all portal services
                    </p>
                </div>
            }
        >
            <Head title="Manage Services" />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header Actions & Overview */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-3xl text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                                home_repair_service
                            </span>
                            Manage Services
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                            Set coin pricing, active status, and custom form fields for each service.
                        </p>
                    </div>
                    <Link
                        href="/admin/services/create"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        + Add Service
                    </Link>
                </div>

                {/* Quick Summary Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Total Services</p>
                            <p className="text-2xl font-black text-slate-900 mt-0.5">{services.length}</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 text-3xl">category</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-600 uppercase">Active</p>
                            <p className="text-2xl font-black text-emerald-700 mt-0.5">{activeCount}</p>
                        </div>
                        <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-rose-500 uppercase">Hidden</p>
                            <p className="text-2xl font-black text-rose-600 mt-0.5">{services.length - activeCount}</p>
                        </div>
                        <span className="material-symbols-outlined text-rose-400 text-3xl">visibility_off</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-amber-600 uppercase">Free Services</p>
                            <p className="text-2xl font-black text-amber-700 mt-0.5">{freeCount}</p>
                        </div>
                        <span className="material-symbols-outlined text-amber-500 text-3xl">toll</span>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search service name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                filterStatus === 'all'
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            All ({services.length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('active')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                filterStatus === 'active'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                        >
                            Active ({activeCount})
                        </button>
                        <button
                            onClick={() => setFilterStatus('hidden')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                filterStatus === 'hidden'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                        >
                            Hidden ({services.length - activeCount})
                        </button>
                    </div>
                </div>

                {/* Services Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-black tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3.5">Service Details</th>
                                    <th className="px-5 py-3.5">Sort Order</th>
                                    <th className="px-5 py-3.5">Type</th>
                                    <th className="px-5 py-3.5">Coin Cost</th>
                                    <th className="px-5 py-3.5">Total Requests</th>
                                    <th className="px-5 py-3.5">Status (Click to Toggle)</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredServices.map((service) => (
                                    <tr key={service.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3.5">
                                                {renderServiceIcon(service)}
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 text-sm sm:text-base">
                                                        {service.name}
                                                    </p>
                                                    {service.description ? (
                                                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                                            {service.description}
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-slate-400 italic mt-0.5">No description</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-blue-50 text-blue-700 border border-blue-200" title="Sort Order sequence on Dashboard and Home">
                                                #{service.sort_order ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    service.kind === 'module'
                                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                                }`}
                                            >
                                                {service.kind === 'module' ? 'Built-in Form' : 'Admin Handled'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            {service.coin_cost === 0 ? (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    FREE
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                                                    🪙 {service.coin_cost} Coins
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className="font-bold text-slate-800 text-sm">
                                                {service.requests_count ?? 0}
                                            </span>
                                            <span className="text-xs text-slate-400 ml-1">requests</span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(service)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${
                                                    service.is_active
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                                        : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                                                }`}
                                                title="Click to toggle status"
                                            >
                                                <span
                                                    className="material-symbols-outlined text-sm"
                                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                                >
                                                    {service.is_active ? 'check_circle' : 'cancel'}
                                                </span>
                                                {service.is_active ? 'Active' : 'Hidden'}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-right">
                                            <div className="inline-flex items-center gap-1.5">
                                                <Link
                                                    href={`/admin/services/${service.id}/edit`}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                                                    title="Edit Service"
                                                >
                                                    <span className="material-symbols-outlined text-base">edit</span>
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setToDelete(service)}
                                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                                                    title="Delete Service"
                                                >
                                                    <span className="material-symbols-outlined text-base">delete</span>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredServices.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                                            <span className="material-symbols-outlined text-4xl mb-1 text-slate-300">
                                                search_off
                                            </span>
                                            <p className="text-sm font-semibold">No services found matching your criteria.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Custom Tailwind Confirm Dialog */}
            <ConfirmDialog
                open={!!toDelete}
                title="Delete Service?"
                message={`Are you sure you want to delete "${toDelete?.name}"? Users will no longer be able to see or request this service.`}
                onConfirm={() =>
                    router.delete(`/admin/services/${toDelete.id}`, {
                        onFinish: () => setToDelete(null),
                    })
                }
                onCancel={() => setToDelete(null)}
                confirmLabel="Yes, Delete Service"
            />
        </AdminLayout>
    );
}
