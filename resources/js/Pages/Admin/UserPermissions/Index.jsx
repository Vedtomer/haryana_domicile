import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function UserPermissions({ users, services }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

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
        setData('service_ids', user.service_ids || []);
    };

    const toggleService = (serviceId) => {
        const hasService = data.service_ids.includes(serviceId);
        setData(
            'service_ids', 
            hasService 
                ? data.service_ids.filter(id => id !== serviceId)
                : [...data.service_ids, serviceId]
        );
    };

    const toggleAll = (check) => {
        setData('service_ids', check ? services.map(s => s.id) : []);
    };

    const submit = (e) => {
        e.preventDefault();
        post(`/admin/user-permissions/${selectedUser.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                // The backend redirects back with fresh users data.
                // We update our selected user's local state.
            }
        });
    };

    return (
        <AdminLayout header={
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shadow-sm">
                    <span className="material-symbols-outlined text-xl">shield_person</span>
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-800">User Permissions</h1>
            </div>
        }>
            <Head title="User Permissions" />

            <div className="flex flex-col lg:flex-row gap-6 mt-4">
                
                {/* Users List Panel */}
                <div className="w-full lg:w-1/3 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm h-[calc(100vh-140px)]">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-3">Select User</h2>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 material-symbols-outlined">search</span>
                            <input
                                type="text"
                                placeholder="Search users by name, email or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm">No users found.</div>
                        ) : (
                            filteredUsers.map((user) => {
                                const isSelected = selectedUser?.id === user.id;
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => handleSelectUser(user)}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all ${
                                            isSelected 
                                                ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-500 text-blue-900'
                                                : 'hover:bg-gray-50 border border-transparent text-slate-700'
                                        }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{user.name}</span>
                                            <span className="text-xs text-gray-500">{user.email || user.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
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
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">
                                        Managing access for <span className="text-blue-600">{selectedUser.name}</span>
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Toggle the switches below to grant or revoke service access.</p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => toggleAll(true)}
                                        className="text-xs font-semibold px-3 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                        Select All
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => toggleAll(false)}
                                        className="text-xs font-semibold px-3 py-1.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {services.map((service) => {
                                        const hasAccess = data.service_ids.includes(service.id);
                                        return (
                                            <div 
                                                key={service.id}
                                                onClick={() => toggleService(service.id)}
                                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                                                    hasAccess 
                                                        ? 'border-blue-500 bg-blue-50/30' 
                                                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-2xl shadow-sm overflow-hidden ${
                                                    hasAccess ? 'bg-blue-100 border border-blue-200' : 'bg-gray-100 border border-gray-200'
                                                }`}>
                                                    {service.logo_url ? (
                                                        <img src={service.logo_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{service.icon || '📄'}</span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`font-bold truncate ${hasAccess ? 'text-blue-900' : 'text-slate-800'}`}>
                                                        {service.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {service.description || 'No description provided.'}
                                                    </p>
                                                    
                                                    {service.coin_cost > 0 && (
                                                        <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                                            🪙 {service.coin_cost} Coins
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex-shrink-0 pt-1">
                                                    <div className={`w-11 h-6 rounded-full relative transition-colors ${hasAccess ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${hasAccess ? 'left-6' : 'left-1'}`}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-all"
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
