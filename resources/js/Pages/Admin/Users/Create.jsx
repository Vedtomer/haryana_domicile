import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Create({ roles, user = null }) {
    const isEdit = !!user;
    
    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        roles: user?.roles?.map(r => r.id) || [],
        coins: user?.coins || 0,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/users/${user.id}`);
        } else {
            post('/admin/users');
        }
    };

    const handleRoleChange = (e) => {
        const options = [...e.target.selectedOptions];
        const values = options.map(option => parseInt(option.value));
        setData('roles', values);
    };

    return (
        <AdminLayout>
            <Head title={isEdit ? "Edit User" : "Create User"} />
            <div className="flex items-center mb-6">
                <Link href="/admin/users" className="text-gray-500 hover:text-gray-700 mr-4">&larr; Back</Link>
                <h2 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit User" : "Create User"}</h2>
            </div>

            <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 space-y-6 max-w-2xl">
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className="w-full border-gray-300 rounded" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required className="w-full border-gray-300 rounded" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">{isEdit ? "New Password (Leave blank to keep)" : "Password"}</label>
                    <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} required={!isEdit} className="w-full border-gray-300 rounded" />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Roles (Hold Ctrl/Cmd to select multiple)</label>
                    <select multiple value={data.roles} onChange={handleRoleChange} className="w-full border-gray-300 rounded h-32" required>
                        {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    {errors.roles && <p className="text-red-500 text-xs mt-1">{errors.roles}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Coins Wallet</label>
                    <input type="number" value={data.coins} onChange={e => setData('coins', e.target.value)} required className="w-full border-gray-300 rounded" />
                    {errors.coins && <p className="text-red-500 text-xs mt-1">{errors.coins}</p>}
                </div>

                <div className="pt-4 text-right border-t">
                    <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white font-bold rounded">
                        {isEdit ? 'Update User' : 'Create User'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
