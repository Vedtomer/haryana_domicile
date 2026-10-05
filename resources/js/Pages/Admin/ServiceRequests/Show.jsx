import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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

export default function Show({ request, isAdmin, statuses }) {
    const { data, setData, patch, processing } = useForm({
        status: request.status,
        admin_response: request.admin_response ?? '',
        estimated_time: request.estimated_time ?? '',
    });

    const [recipientPhone, setRecipientPhone] = useState(() => extractPhoneNumber(request, request.user));
    const [whatsAppMsg, setWhatsAppMsg] = useState(() => formatServiceWhatsAppMessage(request, request.user, request.admin_response));
    const [copied, setCopied] = useState(false);

    // Update WhatsApp message dynamically when status or admin response in form changes
    useEffect(() => {
        const previewReq = { ...request, status: data.status, admin_response: data.admin_response };
        setWhatsAppMsg(formatServiceWhatsAppMessage(previewReq, request.user, data.admin_response));
    }, [data.status, data.admin_response]);

    const handleCopy = () => {
        navigator.clipboard.writeText(whatsAppMsg);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const waLink = buildWhatsAppLink(recipientPhone, whatsAppMsg);

    const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';

    return (
        <AdminLayout>
            <Head title={`Request #${request.id}`} />

            <Link href="/admin/service-requests" className="text-sm font-semibold text-blue-600 hover:underline">
                ← Back to requests
            </Link>

            <div className="flex flex-wrap items-center gap-3 mt-2 mb-5">
                <h1 className="text-2xl font-bold text-gray-800">
                    {renderServiceIcon(request.service?.icon)} {request.service_name} <span className="text-gray-400">#{request.id}</span>
                </h1>
                <StatusBadge status={request.status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="font-bold text-gray-800 mb-3">Submitted Details</h2>
                        <dl className="divide-y divide-gray-100">
                            {Object.entries(request.input_data ?? {}).map(([key, value]) => (
                                <div key={key} className="py-2 flex flex-wrap gap-2 justify-between items-center">
                                    <dt className="text-sm font-semibold text-gray-600">{key}</dt>
                                    <dd className="text-sm text-gray-800">
                                        {value && typeof value === 'object' && value.type === 'file' ? (
                                            <a href={`/storage/${value.path}`} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100">
                                                📎 {value.name}
                                            </a>
                                        ) : (
                                            value || '—'
                                        )}
                                    </dd>
                                </div>
                            ))}
                            {Object.keys(request.input_data ?? {}).length === 0 && (
                                <p className="py-2 text-sm text-gray-400">No details submitted.</p>
                            )}
                        </dl>
                    </div>

                    {(request.admin_response || request.estimated_time) && (
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h2 className="font-bold text-gray-800 mb-3">Admin Response</h2>
                            {request.estimated_time && (
                                <p className="text-sm text-gray-600 mb-2">
                                    <span className="font-semibold">Estimated time:</span> {request.estimated_time}
                                </p>
                            )}
                            {request.admin_response && (
                                <p className="text-sm text-gray-700 whitespace-pre-line">{request.admin_response}</p>
                            )}
                        </div>
                    )}

                    {isAdmin && (
                        <form
                            onSubmit={(e) => { e.preventDefault(); patch(`/admin/service-requests/${request.id}`); }}
                            className="bg-white rounded-xl border border-gray-200 p-5 space-y-4"
                        >
                            <h2 className="font-bold text-gray-800">Update Status</h2>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                <select className={input} value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                    {Object.entries(statuses).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                                {data.status === 'rejected' && request.coins_charged > 0 && !request.refunded_at && (
                                    <p className="text-sm text-amber-700 mt-1">
                                        Rejecting will refund 🪙 {request.coins_charged} coins to the user.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Estimated Time</label>
                                <input className={input} value={data.estimated_time}
                                    onChange={(e) => setData('estimated_time', e.target.value)}
                                    placeholder="e.g. 2 working days" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Message to User</label>
                                <textarea className={input} rows={3} value={data.admin_response}
                                    onChange={(e) => setData('admin_response', e.target.value)}
                                    placeholder="This message is sent to the user as a notification." />
                            </div>

                            <button type="submit" disabled={processing}
                                className="px-5 py-2.5 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {processing ? 'Saving…' : 'Update & Notify User'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="space-y-5">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 text-sm">
                        <h2 className="font-bold text-gray-800">Summary</h2>
                        {isAdmin && (
                            <div>
                                <p className="text-gray-500">User</p>
                                <p className="font-semibold text-gray-800">{request.user?.name}</p>
                                <p className="text-gray-500 text-xs">{request.user?.phone ?? request.user?.email}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-gray-500">Coins Charged</p>
                            <p className="font-semibold text-gray-800">
                                {request.coins_charged > 0 ? `🪙 ${request.coins_charged}` : 'Free'}
                                {request.refunded_at && <span className="text-green-600 font-normal"> (refunded)</span>}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Submitted</p>
                            <p className="font-semibold text-gray-800">{new Date(request.created_at).toLocaleString()}</p>
                        </div>
                        {request.completed_at && (
                            <div>
                                <p className="text-gray-500">Closed</p>
                                <p className="font-semibold text-gray-800">{new Date(request.completed_at).toLocaleString()}</p>
                                {request.completed_by && (
                                    <p className="text-gray-500 text-xs">by {request.completed_by.name}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* WhatsApp Notification & Share Card */}
                    <div className="bg-white rounded-xl border border-emerald-200 p-5 space-y-3.5 shadow-xs">
                        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
                                    💬
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">WhatsApp सूचना भेजें</h3>
                                    <p className="text-[11px] text-gray-500">कस्टमर / यूज़र को 1-क्लिक शेयर</p>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                WA DIRECT
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                मोबाइल नंबर (Recipient Mobile)
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-500">
                                    +91
                                </span>
                                <input
                                    type="text"
                                    value={recipientPhone ? recipientPhone.replace(/^91/, '') : ''}
                                    onChange={(e) => {
                                        const clean = e.target.value.replace(/\D/g, '');
                                        setRecipientPhone(clean ? (clean.startsWith('91') ? clean : `91${clean}`) : '');
                                    }}
                                    placeholder="10 digit mobile number"
                                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center justify-between">
                                <span>मैसेज प्रिव्यू (Live Preview)</span>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                                >
                                    <span>{copied ? '✓ कॉपी हो गया' : '📋 कॉपी करें'}</span>
                                </button>
                            </label>
                            <textarea
                                rows={6}
                                value={whatsAppMsg}
                                onChange={(e) => setWhatsAppMsg(e.target.value)}
                                className="w-full text-xs font-mono p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700 leading-relaxed resize-y"
                            />
                        </div>

                        <div className="space-y-2 pt-1">
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all text-center"
                            >
                                <span>🟢</span>
                                <span>WhatsApp पर भेजें (Send Now)</span>
                            </a>

                            <p className="text-[11px] text-gray-500 text-center leading-normal">
                                💡 स्टेटस <strong>Completed</strong> करने पर बैकग्राउंड में ऑटो-गेटवे द्वारा भी अलर्ट चला जाता है।
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
