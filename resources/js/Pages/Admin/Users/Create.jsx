import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import FloatingInput from '../../../Components/FloatingInput';

export default function Create({ user = null }) {
    const isEdit = !!user;
    
    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        password: '',
        type: user?.type || 'user',
        coins: user?.coins || 0,
        is_active: user !== null ? !!user.is_active : true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/users/${user.id}`);
        } else {
            post('/admin/users');
        }
    };

    return (
        <AdminLayout>
            <Head title={isEdit ? "Edit User" : "Create User"} />
            
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {isEdit ? "Edit User Account" : "Create New User"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {isEdit ? "Update the details and permissions for this user." : "Add a new user to the system."}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <form onSubmit={submit} className="divide-y divide-slate-100">
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FloatingInput 
                                    id="name"
                                    label="Full Name (Optional)"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    error={errors.name}
                                />
                                
                                <FloatingInput 
                                    id="email"
                                    type="email"
                                    label="Email Address (Optional)"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    error={errors.email}
                                />
                                
                                <FloatingInput 
                                    id="phone"
                                    label="Phone Number (Optional)"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    error={errors.phone}
                                />
                                
                                <FloatingInput 
                                    id="password"
                                    isPassword={true}
                                    label={isEdit ? "New Password (Leave blank to keep)" : "Password"}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required={!isEdit}
                                    error={errors.password}
                                />
                            </div>
                            
                            {/* Removed type and coins fields */}
                            
                            <div className="pt-4 flex items-center">
                                <label className="relative flex cursor-pointer items-center rounded-full p-3" htmlFor="is_active">
                                    <input 
                                        type="checkbox" 
                                        id="is_active" 
                                        checked={data.is_active} 
                                        onChange={e => setData('is_active', e.target.checked)} 
                                        className="before:content[''] peer relative h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-500 before:opacity-0 before:transition-opacity checked:border-blue-500 checked:bg-blue-500 checked:before:bg-blue-500 hover:before:opacity-10" 
                                    />
                                    <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                </label>
                                <div className="ml-2">
                                    <p className="text-sm font-semibold text-slate-700">Active Account</p>
                                    <p className="text-xs text-slate-500">If unchecked, the user will not be able to log in.</p>
                                </div>
                                {errors.is_active && <p className="text-red-500 text-xs mt-1 ml-4">{errors.is_active}</p>}
                            </div>
                        </div>

                        <div className="bg-slate-50 px-8 py-5 flex items-center justify-end gap-3">
                            <Link href="/admin/users" className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
                                Back
                            </Link>
                            <button 
                                type="submit" 
                                disabled={processing} 
                                className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {processing && (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                )}
                                {isEdit ? 'Save Changes' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
