import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function UserPermissions({ users = [], services = [] }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceSearch, setServiceSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const initialLoadedRef = useRef(false);

    // Sort services alphabetically by name
    const sortedServices = [...(services || [])].sort((a, b) =>
        (a.name || '').trim().localeCompare((b.name || '').trim(), undefined, { sensitivity: 'base' })
    );

    const { data, setData, post, processing } = useForm({
        service_ids: [],
    });

    const filteredUsers = users.filter((u) => 
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.phone && u.phone.includes(searchTerm))
    );

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setData('service_ids', (user.service_ids || []).map(Number));
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('user', user.id);
            window.history.replaceState({}, '', url.pathname + url.search);
        } catch (e) {}
    };

    // Auto-select user from query parameter ?user={userId} once on mount, or sync when users prop refreshes
    useEffect(() => {
        if (!users || users.length === 0) return;

        if (!initialLoadedRef.current) {
            initialLoadedRef.current = true;
            const params = new URLSearchParams(window.location.search);
            const queryUserId = params.get('user');

            if (queryUserId) {
                const targetUser = users.find(u => String(u.id) === String(queryUserId));
                if (targetUser) {
                    setSelectedUser(targetUser);
                    setData('service_ids', (targetUser.service_ids || []).map(Number));
                    return;
                }
            }

            // Default to first user if none specified
            if (users.length > 0 && !selectedUser) {
                setSelectedUser(users[0]);
                setData('service_ids', (users[0].service_ids || []).map(Number));
            }
            return;
        }

        // When users prop updates after save, keep current selected user's data up to date
        if (selectedUser) {
            const refreshed = users.find(u => u.id === selectedUser.id);
            if (refreshed) {
                setSelectedUser(refreshed);
                setData('service_ids', (refreshed.service_ids || []).map(Number));
            }
        }
    }, [users]);

    const toggleService = (serviceId) => {
        const id = Number(serviceId);
        const currentIds = (data.service_ids || []).map(Number);
        const hasService = currentIds.includes(id);
        setData(
            'service_ids', 
            hasService 
                ? currentIds.filter(item => item !== id)
                : [...currentIds, id]
        );
    };

    const toggleAll = (check) => {
        setData('service_ids', check ? sortedServices.map(s => Number(s.id)) : []);
    };

    const submit = (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        post(`/admin/user-permissions/${selectedUser.id}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const filteredServices = sortedServices.filter((service) => {
        if (!serviceSearch.trim()) return true;
        const q = serviceSearch.toLowerCase().trim();
        return (
            (service.name && service.name.toLowerCase().includes(q)) ||
            (service.slug && service.slug.toLowerCase().includes(q)) ||
            (service.description && service.description.toLowerCase().includes(q))
        );
    });

    const currentAssignedCount = (data.service_ids || []).length;
    const totalServicesCount = sortedServices.length;

    return (
        <AdminLayout header={
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shadow-sm">
                    <span className="material-symbols-outlined text-xl">shield_person</span>
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-800">User Permissions</h1>
                    <p className="text-xs text-gray-500">Enable or disable specific services for each user</p>
                </div>
            </div>
        }>
            <Head title="User Permissions" />

            <div className="flex flex-col lg:flex-row gap-6 mt-4">
                
                {/* Users List Panel */}
                <div className="w-full lg:w-1/3 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm h-[calc(100vh-140px)]">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-slate-800">Select User</h2>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                                {users.length} Users
                            </span>
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 material-symbols-outlined">search</span>
                            <input
                                type="text"
                                placeholder="Search users by name, email, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredUsers.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">No users found.</div>
                        ) : (
                            filteredUsers.map((user) => {
                                const isSelected = selectedUser?.id === user.id;
                                return (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => handleSelectUser(user)}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all ${
                                            isSelected 
                                                ? 'bg-blue-50 border-blue-200 shadow-xs ring-1 ring-blue-500 text-blue-900'
                                                : 'hover:bg-gray-50 border border-transparent text-slate-700'
                                        }`}
                                    >
                                        <div className="flex flex-col min-w-0 pr-2">
                                            <span className="font-semibold text-sm truncate">{user.name}</span>
                                            <span className="text-xs text-gray-500 truncate">{user.email || user.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full" title="Allowed Services Count">
                                                {user.service_ids.length}
                                            </span>
                                            {isSelected && <span className="material-symbols-outlined text-blue-600 text-lg">chevron_right</span>}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Permissions Panel */}
                <div className="w-full lg:w-2/3 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm h-[calc(100vh-140px)]">
                    {!selectedUser ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                            <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">admin_panel_settings</span>
                            <h3 className="text-lg font-bold text-gray-500">No User Selected</h3>
                            <p className="text-sm mt-1 text-center max-w-sm">Select a user from the list on the left to manage their service access permissions.</p>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="flex-1 flex flex-col overflow-hidden">
                            {/* Flash Feedback Alert */}
                            {flash?.success && (
                                <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-xs">
                                    <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                                    <span>{flash.success}</span>
                                </div>
                            )}
                            {flash?.error && (
                                <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-semibold flex items-center gap-2 shadow-xs">
                                    <span className="material-symbols-outlined text-red-600 text-xl">error</span>
                                    <span>{flash.error}</span>
                                </div>
                            )}

                            {/* Header Section */}
                            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-slate-800">
                                            Permissions for <span className="text-blue-600">{selectedUser.name}</span>
                                        </h2>
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                            {currentAssignedCount} / {totalServicesCount} Granted
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{selectedUser.email || selectedUser.phone}</p>
                                </div>
                                
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button 
                                        type="button" 
                                        onClick={() => toggleAll(true)}
                                        className="text-xs font-semibold px-3 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/60"
                                    >
                                        Select All
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => toggleAll(false)}
                                        className="text-xs font-semibold px-3 py-1.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            {/* Service Search Bar */}
                            <div className="px-5 py-2.5 bg-white border-b border-gray-100 flex items-center gap-3">
                                <div className="relative flex-1">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 material-symbols-outlined text-sm">filter_alt</span>
                                    <input
                                        type="text"
                                        placeholder="Filter services by name..."
                                        value={serviceSearch}
                                        onChange={(e) => setServiceSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                {serviceSearch && (
                                    <button 
                                        type="button" 
                                        onClick={() => setServiceSearch('')}
                                        className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                            
                            {/* Services Grid */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                                {filteredServices.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-sm">No matching services found.</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        {filteredServices.map((service) => {
                                            const hasAccess = data.service_ids.includes(Number(service.id));
                                            const isGloballyInactive = !service.is_active;

                                            return (
                                                <div 
                                                    key={service.id}
                                                    onClick={() => toggleService(service.id)}
                                                    className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 select-none ${
                                                        hasAccess 
                                                            ? 'border-blue-500 bg-blue-50/30 shadow-xs' 
                                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                                                    }`}
                                                >
                                                    <div className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl text-xl shadow-xs overflow-hidden ${
                                                        hasAccess ? 'bg-blue-100 border border-blue-200' : 'bg-gray-100 border border-gray-200'
                                                    }`}>
                                                        {service.logo_url ? (
                                                            <img src={service.logo_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{service.icon || '📄'}</span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <h3 className={`font-bold text-sm truncate ${hasAccess ? 'text-blue-900' : 'text-slate-800'}`}>
                                                                {service.name}
                                                            </h3>
                                                        </div>

                                                        {isGloballyInactive && (
                                                            <div className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 text-red-700 bg-red-50 border border-red-200 rounded mt-0.5">
                                                                <span className="material-symbols-outlined text-[11px]">block</span>
                                                                Disabled in Manage Services
                                                            </div>
                                                        )}

                                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                            {service.description || 'Standard service'}
                                                        </p>
                                                        
                                                        {service.coin_cost > 0 && (
                                                            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                                                🪙 {service.coin_cost} Coins
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex-shrink-0 pt-1">
                                                        <div className={`w-10 h-5 rounded-full relative transition-colors ${hasAccess ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${hasAccess ? 'left-5' : 'left-0.5'}`}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            
                            {/* Footer Submit Button */}
                            <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    <strong className="text-slate-700">{currentAssignedCount}</strong> services selected for <strong>{selectedUser.name}</strong>
                                </span>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    {processing ? 'Saving...' : 'Save Permissions'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
