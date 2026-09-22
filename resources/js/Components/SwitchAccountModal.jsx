import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';

export default function SwitchAccountModal({ isOpen, onClose }) {
    const { auth, switchAccount = {}, errors } = usePage().props;
    const [loginInput, setLoginInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' or 'admin_search'
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const currentUser = auth?.user;
    const isAdmin = currentUser?.type === 'admin' || currentUser?.type === 'super_admin';
    const isSwitchedFromAdmin = switchAccount?.is_switched_from_admin;
    const originalAdminName = switchAccount?.original_admin_name;
    const authenticatedAccounts = switchAccount?.authenticated_accounts || [];

    // Filter out current active account for the "other accounts" list
    const otherAccounts = authenticatedAccounts.filter(acc => acc.id !== currentUser?.id);

    useEffect(() => {
        if (!isOpen) {
            setLoginInput('');
            setPasswordInput('');
            setShowAddForm(false);
            setSearchQuery('');
            setSearchResults([]);
        }
    }, [isOpen]);

    // Admin user live search
    useEffect(() => {
        if (!isAdmin || activeTab !== 'admin_search' || searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const delayDebounce = setTimeout(() => {
            setIsSearching(true);
            axios.get(`/switch-account/search-users?q=${encodeURIComponent(searchQuery.trim())}`)
                .then(res => {
                    setSearchResults(res.data || []);
                })
                .catch(() => {
                    setSearchResults([]);
                })
                .finally(() => {
                    setIsSearching(false);
                });
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, activeTab, isAdmin]);

    if (!isOpen) return null;

    const handleSwitch = (userId) => {
        setIsSubmitting(true);
        router.post('/switch-account/switch', { user_id: userId }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                onClose();
            },
            onError: () => setIsSubmitting(false),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleLoginAndSwitch = (e) => {
        e.preventDefault();
        if (!loginInput.trim() || !passwordInput) return;

        setIsSubmitting(true);
        router.post('/switch-account/login', {
            login: loginInput.trim(),
            password: passwordInput,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                onClose();
            },
            onError: () => setIsSubmitting(false),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleSwitchBackAdmin = () => {
        setIsSubmitting(true);
        router.post('/switch-account/back-to-admin', {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                onClose();
            },
            onError: () => setIsSubmitting(false),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleRemoveAccount = (userId, e) => {
        e.stopPropagation();
        if (!confirm('Remove this account from the switcher list?')) return;

        router.post('/switch-account/remove', { user_id: userId }, {
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shrink-0 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white shadow-inner">
                            <span className="material-symbols-outlined text-2xl">switch_account</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-black leading-tight">Switch Account</h3>
                            <p className="text-xs text-blue-100 mt-0.5">Manage & switch multiple IDs</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center text-white transition-colors cursor-pointer"
                        title="Close"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Return to Admin Banner (if currently switched) */}
                {isSwitchedFromAdmin && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between px-5">
                        <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                            <span className="material-symbols-outlined text-base text-amber-600">admin_panel_settings</span>
                            <span>Switched from <strong>{originalAdminName || 'Admin'}</strong></span>
                        </div>
                        <button
                            type="button"
                            onClick={handleSwitchBackAdmin}
                            disabled={isSubmitting}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">undo</span>
                            Back to Admin
                        </button>
                    </div>
                )}

                {/* Navigation Tabs (if admin) */}
                {isAdmin && (
                    <div className="flex border-b border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-950/60 p-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('accounts')}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                activeTab === 'accounts'
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-800'
                            }`}
                        >
                            Saved Accounts ({authenticatedAccounts.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('admin_search')}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                activeTab === 'admin_search'
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-800'
                            }`}
                        >
                            🔍 Search All Users
                        </button>
                    </div>
                )}

                {/* Body Content */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                    
                    {errors.switch_login && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
                            <span className="material-symbols-outlined text-base shrink-0">error</span>
                            <span>{errors.switch_login}</span>
                        </div>
                    )}

                    {activeTab === 'accounts' ? (
                        <>
                            {/* Current Active Account */}
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                    Current Active Account
                                </p>
                                <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl flex items-center justify-between shadow-2xs">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                                            {(currentUser?.name || currentUser?.phone || 'U')[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 dark:text-white text-sm truncate">
                                                {currentUser?.name || 'User'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                                                {currentUser?.email || currentUser?.phone || ''}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Active
                                    </span>
                                </div>
                            </div>

                            {/* Other Authenticated Accounts */}
                            {otherAccounts.length > 0 && (
                                <div>
                                    <p className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                        Switch To Other ID
                                    </p>
                                    <div className="space-y-2">
                                        {otherAccounts.map(account => (
                                            <div
                                                key={account.id}
                                                className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 rounded-2xl flex items-center justify-between transition-all group"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {(account.name || account.phone || 'U')[0].toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-800 dark:text-white text-xs truncate">
                                                            {account.name}
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 truncate">
                                                            {account.email || account.phone}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSwitch(account.id)}
                                                        disabled={isSubmitting}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">sync_alt</span>
                                                        Switch
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleRemoveAccount(account.id, e)}
                                                        className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                                        title="Remove from switcher"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add / Login to Another Account */}
                            <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                                {!showAddForm ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(true)}
                                        className="w-full py-2.5 px-4 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-dashed border-gray-300 dark:border-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-base">add_circle</span>
                                        Login & Add Another ID
                                    </button>
                                ) : (
                                    <form onSubmit={handleLoginAndSwitch} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm text-blue-600">login</span>
                                                Add Another Account
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddForm(false)}
                                                className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">
                                                Mobile Number or Email
                                            </label>
                                            <input
                                                type="text"
                                                value={loginInput}
                                                onChange={e => setLoginInput(e.target.value)}
                                                placeholder="Enter mobile or email"
                                                required
                                                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordInput}
                                                onChange={e => setPasswordInput(e.target.value)}
                                                placeholder="Enter password"
                                                required
                                                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !loginInput.trim() || !passwordInput}
                                            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">lock_open</span>
                                            {isSubmitting ? 'Authenticating...' : 'Login & Switch Account'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Admin User Search Tab */
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                                    Search User by Name, Email or Phone
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="e.g. Ramesh, 9812345678, user@example.com..."
                                        className="w-full pl-9 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        autoFocus
                                    />
                                    {isSearching && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">...</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {searchResults.length === 0 ? (
                                    <p className="text-center py-6 text-xs text-gray-400">
                                        {searchQuery.trim().length >= 2 ? 'No matching users found.' : 'Type at least 2 letters to search users.'}
                                    </p>
                                ) : (
                                    searchResults.map(u => (
                                        <div
                                            key={u.id}
                                            className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-between hover:border-blue-300 transition-colors"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs text-slate-800 dark:text-white truncate">
                                                    {u.name}
                                                </p>
                                                <p className="text-[11px] text-gray-400 truncate">
                                                    {u.phone || u.email}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleSwitch(u.id)}
                                                disabled={isSubmitting}
                                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[13px]">person_check</span>
                                                Switch ID
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}
