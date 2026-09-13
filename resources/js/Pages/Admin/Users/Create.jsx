import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
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
        allowed_devices: user !== null && user?.allowed_devices !== undefined ? user.allowed_devices : 1,
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

                {!isEdit && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-600">warning</span>
                        <p className="text-sm text-red-700 font-semibold leading-relaxed">
                            ध्यान दें: अगर यूज़र रजिस्ट्रेशन के बाद वॉलेट रिचार्ज नहीं करता है या 10 दिनों तक कोई काम नहीं करता है, तो उसकी आईडी डिलीट कर दी जाएगी।
                        </p>
                    </div>
                )}

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
                                    onChange={e => setData('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
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
                            
                            {/* Desktop / PC Limit Setting */}
                            <div className="pt-2">
                                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                                    Desktop / PC Access Limit (कंप्यूटर लिमिट)
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setData('allowed_devices', 1)}
                                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                            Number(data.allowed_devices) === 1
                                                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 ring-2 ring-blue-500'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-sm text-slate-800 dark:text-slate-100">1 PC (Default)</span>
                                            <span className="text-blue-600 text-xs font-semibold">Standard</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Sirf 1 desktop computer par access rahega.</p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setData('allowed_devices', 2)}
                                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                            Number(data.allowed_devices) === 2
                                                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 ring-2 ring-blue-500'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-sm text-slate-800 dark:text-slate-100">2 PCs (Dual Access)</span>
                                            <span className="text-emerald-600 text-xs font-semibold">2 PC Access</span>
                                        </div>
                                        <p className="text-xs text-slate-500">2 alag-alag PCs/laptops par use kar sakte hain.</p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setData('allowed_devices', 0)}
                                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                            Number(data.allowed_devices) === 0
                                                ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 dark:border-purple-500 ring-2 ring-purple-500'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-sm text-slate-800 dark:text-slate-100">No Lock (Unlimited)</span>
                                            <span className="text-purple-600 text-xs font-semibold">Open</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Koi PC lock nahi hoga, kisi bhi computer par login hoga.</p>
                                    </button>
                                </div>
                                {errors.allowed_devices && <p className="text-red-500 text-xs mt-1">{errors.allowed_devices}</p>}
                            </div>

                            {/* If Edit mode and user has bound devices */}
                            {isEdit && (user.license_device_id || user.license_device_id_2) && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Currently Bound PCs</div>
                                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex flex-wrap items-center gap-3">
                                            {user.license_device_name && (
                                                <span className="inline-flex items-center gap-1">
                                                    💻 PC 1: <span className="font-normal text-slate-600 dark:text-slate-400">{user.license_device_name}</span>
                                                </span>
                                            )}
                                            {user.license_device_name_2 && (
                                                <span className="inline-flex items-center gap-1">
                                                    💻 PC 2: <span className="font-normal text-slate-600 dark:text-slate-400">{user.license_device_name_2}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm(`Reset PC hardware lock for ${user.name || 'this user'}? Bound PCs will be unlinked.`)) {
                                                router.post(`/admin/users/${user.id}/reset-device-lock`);
                                            }
                                        }}
                                        className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
                                    >
                                        Reset Device Bindings
                                    </button>
                                </div>
                            )}

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
