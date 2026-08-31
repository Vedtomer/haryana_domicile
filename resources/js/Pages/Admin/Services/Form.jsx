import React, { useEffect, useRef, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';

const FIELD_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'file', label: 'Document Upload' },
];

/**
 * Checkbox-in-a-dropdown multi-select for picking which users a private
 * service is visible to.
 */
function UserMultiSelect({ users, selected, onToggle }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const selectedUsers = users.filter((u) => selected.includes(u.id));

    return (
        <div className="relative mt-1" ref={ref}>
            <button type="button" onClick={() => setOpen((o) => !o)}
                className="w-full min-h-[42px] flex flex-wrap items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                {selectedUsers.length === 0 && <span className="text-sm text-gray-400">Select users…</span>}
                {selectedUsers.map((u) => (
                    <span key={u.id} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                        {u.name || u.email || u.phone}
                        <span role="button" tabIndex={0}
                            onClick={(e) => { e.stopPropagation(); onToggle(u.id); }}
                            className="hover:text-blue-900">×</span>
                    </span>
                ))}
                <svg className="w-4 h-4 ml-auto text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg divide-y divide-gray-100">
                    {users.length === 0 && (
                        <p className="text-sm text-gray-400 p-3">No regular users found yet.</p>
                    )}
                    {users.map((u) => (
                        <label key={u.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" className="rounded text-blue-600"
                                checked={selected.includes(u.id)} onChange={() => onToggle(u.id)} />
                            <span className="text-sm text-gray-700">{u.name || u.email || u.phone}</span>
                            {u.email && <span className="text-xs text-gray-400">{u.email}</span>}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Shared create/edit form for the service catalog.
 * Built-in module services keep their wiring, so their custom-field builder is hidden.
 */
export default function ServiceForm({ service, users = [], submitUrl, method, submitLabel }) {
    const isModule = service?.kind === 'module';
    const logoInputRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(service?.logo_url ?? null);

    const { data, setData, post, put, processing, errors } = useForm({
        name: service?.name ?? '',
        description: service?.description ?? '',
        icon: service?.icon ?? '📄',
        logo: null,
        remove_logo: false,
        coin_cost: service?.coin_cost ?? 0,
        is_active: service?.is_active ?? true,
        visibility: service?.visibility ?? 'private',
        user_ids: service?.user_ids ?? [],
        sort_order: service?.sort_order ?? 0,
        fields: service?.fields ?? [],
    });

    const toggleUser = (id) =>
        setData('user_ids', data.user_ids.includes(id)
            ? data.user_ids.filter((u) => u !== id)
            : [...data.user_ids, id]);

    const pickLogo = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData((prev) => ({ ...prev, logo: file, remove_logo: false }));
        setLogoPreview(URL.createObjectURL(file));
    };

    const removeLogo = () => {
        setData((prev) => ({ ...prev, logo: null, remove_logo: true }));
        setLogoPreview(null);
        if (logoInputRef.current) logoInputRef.current.value = '';
    };

    const submit = (e) => {
        e.preventDefault();
        (method === 'put' ? put : post)(submitUrl, { forceFormData: true });
    };

    const addField = () =>
        setData('fields', [...data.fields, { label: '', type: 'text', required: true }]);

    const updateField = (index, key, value) =>
        setData('fields', data.fields.map((f, i) => (i === index ? { ...f, [key]: value } : f)));

    const removeField = (index) =>
        setData('fields', data.fields.filter((_, i) => i !== index));

    const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
    const label = 'block text-sm font-semibold text-gray-700 mb-1';

    return (
        <form onSubmit={submit} className="max-w-3xl bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            {isModule && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    This is a built-in service with its own form. You can change its price, name and
                    visibility, but not its fields.
                </div>
            )}

            <div>
                <label className={label}>Service Name *</label>
                <input className={input} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
                <label className={label}>Logo</label>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {logoPreview
                            ? <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                            : <span className="text-2xl">{data.icon || '📄'}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={pickLogo} />
                        <div className="flex gap-2">
                            <button type="button" onClick={() => logoInputRef.current?.click()}
                                className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                                {logoPreview ? 'Change logo' : 'Upload logo'}
                            </button>
                            {logoPreview && (
                                <button type="button" onClick={removeLogo}
                                    className="px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg">
                                    Remove
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">PNG or JPG, shown as a circle to users. Max 2 MB.</p>
                        {errors.logo && <p className="text-sm text-red-600">{errors.logo}</p>}
                    </div>
                </div>
            </div>

            <div>
                <label className={label}>Description</label>
                <textarea className={input} rows={2} value={data.description ?? ''}
                    onChange={(e) => setData('description', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className={label}>Coin Cost *</label>
                    <input type="number" min="0" className={input} value={data.coin_cost}
                        onChange={(e) => setData('coin_cost', e.target.value)} />
                    <p className="text-xs text-gray-500 mt-1">Set 0 to make this service free.</p>
                    {errors.coin_cost && <p className="text-sm text-red-600 mt-1">{errors.coin_cost}</p>}
                </div>
                <div>
                    <label className={label}>Sort Order</label>
                    <input type="number" min="0" className={input} value={data.sort_order}
                        onChange={(e) => setData('sort_order', e.target.value)} />
                </div>
                <div>
                    <label className={label}>Status</label>
                    <label className="flex items-center gap-2 mt-2">
                        <input type="checkbox" className="w-5 h-5 rounded text-blue-600"
                            checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                        <span className="text-sm text-gray-700">Visible to users</span>
                    </label>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <label className={label}>Audience</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                        <input type="radio" name="visibility" className="text-blue-600" checked={data.visibility === 'public'}
                            onChange={() => setData('visibility', 'public')} />
                        <span className="text-sm text-gray-700">Public — visible to all users</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="radio" name="visibility" className="text-blue-600" checked={data.visibility === 'private'}
                            onChange={() => setData('visibility', 'private')} />
                        <span className="text-sm text-gray-700">Private — only selected users</span>
                    </label>
                </div>
                {errors.visibility && <p className="text-sm text-red-600 mt-1">{errors.visibility}</p>}

                {data.visibility === 'private' && (
                    <UserMultiSelect users={users} selected={data.user_ids} onToggle={toggleUser} />
                )}
            </div>

            {!isModule && (
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="font-bold text-gray-800">Form Fields</h3>
                            <p className="text-xs text-gray-500">What should the user fill in when requesting this service?</p>
                        </div>
                        <button type="button" onClick={addField}
                            className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                            + Add Field
                        </button>
                    </div>

                    {data.fields.length === 0 && (
                        <p className="text-sm text-gray-400 py-3">
                            No fields yet — the user will only be able to leave a note.
                        </p>
                    )}

                    {data.fields.some((f) => f.type === 'file') && (
                        <p className="text-xs text-gray-500 mb-2">
                            Document Upload fields accept PDF, JPG or PNG files up to 5 MB.
                        </p>
                    )}

                    <div className="space-y-2">
                        {data.fields.map((field, i) => (
                            <div key={i} className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <input className={`${input} flex-1 min-w-[160px] bg-white`} placeholder="Field label (e.g. Aadhaar Number)"
                                    value={field.label} onChange={(e) => updateField(i, 'label', e.target.value)} />
                                <select className={`${input} w-40 bg-white`} value={field.type}
                                    onChange={(e) => updateField(i, 'type', e.target.value)}>
                                    {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                <label className="flex items-center gap-1.5 text-sm text-gray-600 px-1">
                                    <input type="checkbox" className="rounded text-blue-600" checked={!!field.required}
                                        onChange={(e) => updateField(i, 'required', e.target.checked)} />
                                    Required
                                </label>
                                <button type="button" onClick={() => removeField(i)}
                                    className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button type="submit" disabled={processing}
                    className="px-5 py-2.5 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {processing ? 'Saving…' : submitLabel}
                </button>
                <Link href="/admin/services" className="px-5 py-2.5 font-semibold text-gray-600 hover:text-gray-800">
                    Cancel
                </Link>
                {service?.id && !isModule && (
                    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-service-delete-dialog', { detail: service }))}
                        className="ml-auto px-5 py-2.5 font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                        Delete Service
                    </button>
                )}
            </div>
        </form>
    );
}
