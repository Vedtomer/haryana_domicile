import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const TEMPLATES = [
    {
        id: 'doc_ready',
        title: 'डॉक्यूमेंट तैयार है (Document Ready)',
        icon: 'task_alt',
        subject: 'डॉक्यूमेंट तैयार है',
        body: 'नमस्ते {name} जी,\n\nआपका आवेदन / दस्तावेज सफलतापूर्वक तैयार कर दिया गया है। आप दुकान पर आकर अपनी प्रिंटेड कॉपी ले सकते हैं।\n\nदिनांक: {date}\nधन्यवाद! 🙏',
    },
    {
        id: 'slip_receipt',
        title: 'रसीद / पावती (Application Receipt)',
        icon: 'receipt_long',
        subject: 'ऑनलाइन फॉर्म रसीद',
        body: 'नमस्ते {name} जी,\n\nआपका ऑनलाइन फॉर्म सफलतापूर्वक सबमिट हो गया है।\n• आवेदन क्रमांक: {ref}\n• दिनांक: {date}\n\nभविष्य के संदर्भ के लिए यह पावती अपने पास सुरक्षित रखें। धन्यवाद! 🙏',
    },
    {
        id: 'udhaar_reminder',
        title: 'बकाया / उधारी याद दिलाना (Payment Reminder)',
        icon: 'payments',
        subject: 'भुगतान रिमाइंडर',
        body: 'नमस्ते {name} जी,\n\nसाइबर कैफे से आपके काम का बकाया भुगतान ₹{amount} शेष है। कृपया सुविधानुसार UPI या नकद द्वारा भुगतान करने का कष्ट करें।\n\nधन्यवाद! 🙏',
    },
    {
        id: 'urgent_call',
        title: 'दुकान पर तुरंत संपर्क करें (Visit Store Notice)',
        icon: 'storefront',
        subject: 'दस्तावेज सत्यापन',
        body: 'नमस्ते {name} जी,\n\nआपके आवेदन के सत्यापन / हस्ताक्षर के लिए आपकी उपस्थिति आवश्यक है। कृपया जल्द से जल्द साइबर कैफे पर पधारें।\n\nधन्यवाद! 🙏',
    },
];

export default function CustomerWhatsAppSender() {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [refNo, setRefNo] = useState('');
    const [amount, setAmount] = useState('');
    const [customMessage, setCustomMessage] = useState(TEMPLATES[0].body);
    const [selectedTemplate, setSelectedTemplate] = useState('doc_ready');
    const [copied, setCopied] = useState(false);

    const applyTemplate = (tpl) => {
        setSelectedTemplate(tpl.id);
        setCustomMessage(tpl.body);
    };

    const getFormattedMessage = () => {
        const today = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

        return customMessage
            .replace(/\{name\}/g, name.trim() || 'ग्राहक')
            .replace(/\{ref\}/g, refNo.trim() || 'N/A')
            .replace(/\{date\}/g, today)
            .replace(/\{amount\}/g, amount.trim() || '0');
    };

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const validPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const finalMessage = getFormattedMessage();

    const handleSend = (isWeb = false) => {
        if (cleanPhone.length < 10) {
            alert('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें!');
            return;
        }

        const url = isWeb
            ? `https://web.whatsapp.com/send?phone=${validPhone}&text=${encodeURIComponent(finalMessage)}`
            : `https://wa.me/${validPhone}?text=${encodeURIComponent(finalMessage)}`;

        window.open(url, '_blank');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(finalMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-600 text-2xl">chat</span>
                            <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                                WhatsApp Direct Customer Sender
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                No Contact Save Needed
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            बिना मोबाइल में नंबर सेव किए ग्राहक को WhatsApp पर सीधा मैसेज, रसीद या डॉक्यूमेंट विवरण भेजें
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="WhatsApp Direct Customer Sender" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Template Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TEMPLATES.map((tpl) => (
                        <button
                            key={tpl.id}
                            type="button"
                            onClick={() => applyTemplate(tpl)}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                selectedTemplate === tpl.id
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 dark:text-emerald-100 shadow-sm'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            }`}
                        >
                            <span className="material-symbols-outlined text-emerald-600 text-2xl mb-1">
                                {tpl.icon}
                            </span>
                            <span className="text-xs font-bold leading-snug">{tpl.title}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Form inputs */}
                    <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                        <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-600">contact_phone</span>
                            ग्राहक विवरण भरें
                        </h3>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                ग्राहक का मोबाइल नंबर <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    maxLength="10"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="9876543210"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    ग्राहक का नाम
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. सोहन लाल"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    रेफरेंस / टोकन नं.
                                </label>
                                <input
                                    type="text"
                                    value={refNo}
                                    onChange={(e) => setRefNo(e.target.value)}
                                    placeholder="e.g. APP-849204"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {selectedTemplate === 'udhaar_reminder' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    बकाया राशि (Amount ₹)
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="e.g. 150"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-rose-600"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                मैसेज सामग्री (Message Content)
                            </label>
                            <textarea
                                rows={6}
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                                💡 <em>{'{name}'}, {'{ref}'}, {'{date}'}, {'{amount}'} अपने आप बदल जाएंगे।</em>
                            </p>
                        </div>
                    </div>

                    {/* Right: Message Preview & Action Buttons */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600">visibility</span>
                                    लाइव WhatsApp मैसेज प्रिव्यू
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {copied ? 'check' : 'content_copy'}
                                    </span>
                                    {copied ? 'कॉपी हो गया!' : 'कॉपी करें'}
                                </button>
                            </div>

                            {/* WhatsApp bubble mockup */}
                            <div className="bg-[#EFEAE2] dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[220px] flex items-end">
                                <div className="max-w-[85%] bg-white dark:bg-emerald-950/60 rounded-2xl rounded-bl-none p-4 shadow-sm text-slate-800 dark:text-slate-100 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed border border-emerald-100 dark:border-emerald-800">
                                    {finalMessage}
                                    <div className="text-[10px] text-slate-400 text-right mt-2 flex items-center justify-end gap-1">
                                        <span>Just now</span>
                                        <span className="material-symbols-outlined text-[13px] text-blue-500">done_all</span>
                                    </div>
                                </div>
                            </div>

                            {/* Send CTA */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => handleSend(false)}
                                    className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/30 text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-xl">send</span>
                                    WhatsApp App पर भेजें
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSend(true)}
                                    className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">laptop</span>
                                    WhatsApp Web
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
