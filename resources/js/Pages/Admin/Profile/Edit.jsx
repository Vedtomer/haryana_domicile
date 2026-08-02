import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import FloatingInput from '../../../Components/FloatingInput';

export default function Edit({ user }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put('/admin/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setData('password', ''); 
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="My Profile" />
            
            <div className="max-w-3xl mx-auto relative">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-gray-500">{user.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase tracking-wider">
                                {user.type.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-8 space-y-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Update Profile Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FloatingInput 
                                id="name"
                                label="Full Name (Optional)"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                error={errors.name}
                                required={false}
                            />
                            
                            <FloatingInput 
                                id="email"
                                type="email"
                                label="Email Address (Optional)"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                error={errors.email}
                                required={false}
                            />

                            <FloatingInput 
                                id="phone"
                                type="text"
                                label="Phone Number (Optional)"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                error={errors.phone}
                                required={false}
                            />
                        </div>

                        <div className="pt-6 mt-8 border-t border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Security</h3>
                            
                            <div className="max-w-md">
                                <FloatingInput 
                                    id="password"
                                    label="New Password (Leave blank to keep current)"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    error={errors.password}
                                    isPassword={true}
                                />
                            </div>
                        </div>

                        <div className="pt-8 text-right">
                            <button 
                                type="submit" 
                                disabled={processing} 
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all duration-200"
                            >
                                {processing ? 'Saving...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
