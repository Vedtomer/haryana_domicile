import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import StatusBadge from '../../../Components/StatusBadge';
import { extractPhoneNumber, formatServiceWhatsAppMessage, buildWhatsAppLink } from '../../../Utils/whatsappHelper';

const renderServiceIcon = (icon) => {
    if (!icon) return '📄';
    if (typeof icon === 'string' && (icon.startsWith('fa') || icon.includes('fa-'))) {
        return '📸';
    }
    return icon;
};

const formatInputKey = (key) => {
    if (!key) return '';
    const clean = String(key)
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim();
    const map = {
        'vehicle registration number': 'Vehicle No',
        'registration number': 'Reg No',
        'aadhar number': 'Aadhaar',
        'aadhaar number': 'Aadhaar',
        'aadhaar': 'Aadhaar',
        'pan number': 'PAN',
        'mask pan': 'Mask PAN',
        'ration number': 'Ration No',
        'ration card number': 'Ration No',
        'voter number': 'Voter No',
        'epic number': 'EPIC No',
        'mobile number': 'Mobile',
        'phone number': 'Phone',
        'account number': 'A/C No',
        'customer id': 'Cust ID',
    };
    const lower = clean.toLowerCase();
    if (map[lower]) return map[lower];
    return clean
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
        .slice(0, 16);
};

export default function Index({ requests, isAdmin, statuses, stats, servicesList, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = (text, id) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const applyFilter = (newFilters) => {
        const query = {
            ...filters,
            ...newFilters,
        };
        // Clean empty values
        Object.keys(query).forEach((key) => {
            if (query[key] === '' || query[key] === null || query[key] === undefined) {
                delete query[key];
            }
        });

        router.get('/admin/service-requests', query, { preserveState: true, preserveScroll: true });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilter({ search: searchTerm });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        router.get('/admin/service-requests', {}, { preserveState: true });
    };

    const activeStatus = filters?.status || '';

    return (
        <AdminLayout>
            <Head title={isAdmin ? 'All User Service Requests' : 'My Service Requests'} />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200/60 dark:border-emerald-800/40">
                            <span className="material-symbols-outlined text-[15px]">assignment_turned_in</span>
                            <span>{isAdmin ? 'ADMIN CONTROL PANEL • ALL USERS' : 'MY ORDERS & REQUESTS'}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {isAdmin ? 'All User Service Requests' : 'My Service Requests'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            {isAdmin
                                ? 'पोर्टल पर सभी यूज़र्स द्वारा सबमिट किए गए सभी सर्विस ऑर्डर्स और रिक्वेस्ट्स की पूरी लिस्ट।'
                                : 'आपके द्वारा सबमिट की गई सभी सेवाओं और ऑर्डर्स की स्थिति ट्रैक करें।'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {isAdmin && (
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-right">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</div>
                                <div className="text-xl font-black text-slate-800 dark:text-white">{stats?.all ?? requests?.total ?? 0}</div>
                            </div>
                        )}
                        <Link
                            href="/dashboard"
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            <span>New Service</span>
                        </Link>
                    </div>
                </div>

                {/* Stat Counters for Admin & User */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        <button
                            type="button"
                            onClick={() => applyFilter({ status: '' })}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                                !activeStatus
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md ring-2 ring-slate-900/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-white hover:border-slate-300'
                            }`}
                        >
                            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">Total Requests</div>
                            <div className="text-2xl font-black mt-1">{stats.all || 0}</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => applyFilter({ status: 'pending' })}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                                activeStatus === 'pending'
                                    ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-500/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-white hover:border-amber-300'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 text-amber-600 dark:text-amber-400">Pending</span>
                                {stats.pending > 0 && (
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                )}
                            </div>
                            <div className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">{stats.pending || 0}</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => applyFilter({ status: 'in_progress' })}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                                activeStatus === 'in_progress'
                                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-white hover:border-blue-300'
                            }`}
                        >
                            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 text-blue-600 dark:text-blue-400">In Progress</div>
                            <div className="text-2xl font-black mt-1 text-blue-600 dark:text-blue-400">{stats.in_progress || 0}</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => applyFilter({ status: 'completed' })}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                                activeStatus === 'completed'
                                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-white hover:border-emerald-300'
                            }`}
                        >
                            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 text-emerald-600 dark:text-emerald-400">Completed</div>
                            <div className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{stats.completed || 0}</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => applyFilter({ status: 'rejected' })}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                                activeStatus === 'rejected'
                                    ? 'bg-red-600 text-white shadow-md ring-2 ring-red-600/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-white hover:border-red-300'
                            }`}
                        >
                            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 text-red-600 dark:text-red-400">Rejected</div>
                            <div className="text-2xl font-black mt-1 text-red-600 dark:text-red-400">{stats.rejected || 0}</div>
                        </button>
                    </div>
                )}

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <span className="material-symbols-outlined absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-[20px]">
                                search
                            </span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="खोजें: User Name, Phone, Service, UID / RC / Ration Number, Request ID..."
                                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        applyFilter({ search: '' });
                                    }}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            )}
                        </div>

                        {servicesList && servicesList.length > 0 && (
                            <select
                                value={filters?.service_id || ''}
                                onChange={(e) => applyFilter({ service_id: e.target.value })}
                                className="w-full sm:w-56 px-3.5 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="" className="text-slate-900 bg-white">All Services (सभी सेवाएं)</option>
                                {servicesList.map((s) => (
                                    <option key={s.id} value={s.id} className="text-slate-900 bg-white">
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                type="submit"
                                className="flex-1 sm:flex-none px-5 py-3 bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[18px]">filter_alt</span>
                                <span>Filter</span>
                            </button>

                            {(filters?.status || filters?.search || filters?.service_id) && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs transition"
                                    title="Reset All Filters"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Service Requests Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto custom-table-scrollbar">
                        <table className="w-full text-left text-sm min-w-[860px] xl:min-w-full">
                            <thead className="bg-slate-50/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs uppercase font-extrabold tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-3.5 py-3.5 whitespace-nowrap"># ID</th>
                                    <th className="px-3.5 py-3.5 whitespace-nowrap">Service</th>
                                    {isAdmin && <th className="px-3.5 py-3.5 whitespace-nowrap">Customer / User</th>}
                                    <th className="px-3.5 py-3.5 whitespace-nowrap">Submitted Data</th>
                                    <th className="px-3 py-3.5 whitespace-nowrap text-center">Coins</th>
                                    <th className="px-3 py-3.5 whitespace-nowrap text-center">Status</th>
                                    <th className="px-3.5 py-3.5 whitespace-nowrap">Date & Time</th>
                                    <th className="px-3.5 py-3.5 whitespace-nowrap text-right sticky right-0 bg-slate-50/95 dark:bg-slate-800/95 z-20 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.08)] dark:shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.4)]">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                                {requests.data.map((item, index) => {
                                    const totalCount = requests.total ?? requests.data.length;
                                    const offset = requests.from ? (requests.from - 1 + index) : index;
                                    const rowNumber = totalCount - offset;

                                    return (
                                        <tr key={item.id} className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                                            {/* Row / ID */}
                                            <td className="px-3.5 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">#{item.id}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(String(item.id), item.id)}
                                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                                                        title="Copy Request ID"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">
                                                            {copiedId === item.id ? 'check' : 'content_copy'}
                                                        </span>
                                                    </button>
                                                </div>
                                                <span className="text-[10px] text-slate-400 block font-medium">Order #{rowNumber}</span>
                                            </td>

                                            {/* Service Name & Icon */}
                                            <td className="px-3.5 py-3">
                                                <div className="flex items-center gap-2 max-w-[210px]">
                                                    <span className="text-lg flex-shrink-0">{renderServiceIcon(item.service?.icon)}</span>
                                                    <div className="min-w-0">
                                                        <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm truncate" title={item.service_name}>
                                                            {item.service_name}
                                                        </div>
                                                        {item.service?.slug && (
                                                            <div className="text-[10px] text-slate-400 font-mono truncate" title={item.service.slug}>
                                                                {item.service.slug}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* User Details (For Admin) */}
                                            {isAdmin && (
                                                <td className="px-3.5 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                                                            {(item.user?.name || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-slate-800 dark:text-white text-xs truncate max-w-[130px]" title={item.user?.name}>
                                                                {item.user?.name || 'Unknown User'}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                                                                <span className="truncate max-w-[120px]">{item.user?.phone || item.user?.email || '—'}</span>
                                                                {item.user?.phone && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCopy(item.user.phone, `u-${item.id}`)}
                                                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                                        title="Copy Phone"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[13px]">
                                                                            {copiedId === `u-${item.id}` ? 'check' : 'content_copy'}
                                                                        </span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Input Data Preview */}
                                            <td className="px-3.5 py-3 max-w-[210px] xl:max-w-[260px]">
                                                {item.input_data && Object.keys(item.input_data).length > 0 ? (
                                                    <div className="space-y-0.5">
                                                        {Object.entries(item.input_data).slice(0, 3).map(([k, v]) => (
                                                            <div key={k} className="text-xs truncate flex items-center gap-1">
                                                                <span className="text-slate-400 font-medium text-[11px] flex-shrink-0">{formatInputKey(k)}:</span>
                                                                {v && typeof v === 'object' && v.type === 'file' ? (
                                                                    <a
                                                                        href={`/storage/${v.path}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-0.5 text-blue-500 font-bold hover:underline truncate text-xs"
                                                                    >
                                                                        <span>📎 {v.name || 'File'}</span>
                                                                    </a>
                                                                ) : (
                                                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs truncate" title={String(v)}>
                                                                        {String(v)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {Object.keys(item.input_data).length > 3 && (
                                                            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                                                                +{Object.keys(item.input_data).length - 3} more...
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Auto Request</span>
                                                )}
                                            </td>

                                            {/* Coins Charged */}
                                            <td className="px-3 py-3 whitespace-nowrap text-center">
                                                {item.coins_charged > 0 ? (
                                                    <span className={`inline-flex items-center gap-1 font-bold text-xs ${
                                                        item.refunded_at
                                                            ? 'text-slate-400 line-through'
                                                            : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-800/50'
                                                    }`}>
                                                        <span>🪙</span>
                                                        <span>{item.coins_charged}</span>
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                                                        Free
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-3 py-3 whitespace-nowrap text-center">
                                                <StatusBadge status={item.status} />
                                            </td>

                                            {/* Submitted Date & Time */}
                                            <td className="px-3.5 py-3 whitespace-nowrap text-xs">
                                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono">
                                                    {new Date(item.created_at).toLocaleTimeString('en-IN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    })}
                                                </div>
                                            </td>

                                            {/* Actions (Sticky Right Column) */}
                                            <td className="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/90 z-10 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.08)] dark:shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.4)] transition-colors">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <a
                                                        href={buildWhatsAppLink(
                                                            extractPhoneNumber(item, item.user),
                                                            formatServiceWhatsAppMessage(item, item.user)
                                                        )}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="WhatsApp पर भेजें"
                                                        className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 shadow-xs hover:shadow transition"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px] block">chat</span>
                                                    </a>

                                                    <Link
                                                        href={`/admin/service-requests/${item.id}`}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow transition"
                                                    >
                                                        <span>{isAdmin ? 'Review' : 'View'}</span>
                                                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {requests.data.length === 0 && (
                                    <tr>
                                        <td colSpan={isAdmin ? 8 : 7} className="px-5 py-16 text-center">
                                            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[32px]">assignment_late</span>
                                            </div>
                                            <h3 className="text-base font-bold text-slate-800 dark:text-white">
                                                No Service Requests Found
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                {filters?.status || filters?.search
                                                    ? 'आपके फिल्टर के अनुसार कोई सर्विस रिक्वेस्ट नहीं मिली। कृपया फिल्टर बदलें।'
                                                    : 'अभी तक कोई सर्विस रिक्वेस्ट सबमिट नहीं की गई है।'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {requests.links && requests.links.length > 3 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
                            <span className="text-slate-500 font-semibold">
                                Showing {requests.from || 0} to {requests.to || 0} of {requests.total || 0} requests
                            </span>

                            <div className="flex flex-wrap items-center gap-1">
                                {requests.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        preserveScroll
                                        className={`px-3 py-1.5 rounded-xl font-bold transition ${
                                            link.active
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                        } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
