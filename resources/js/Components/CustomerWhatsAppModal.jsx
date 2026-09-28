import React, { useState, useEffect } from 'react';

export default function CustomerWhatsAppModal({
    isOpen,
    onClose,
    defaultPhone = '',
    defaultCustomerName = '',
    documentTitle = 'Document / Certificate',
    referenceNo = '',
    customNote = '',
}) {
    const [phone, setPhone] = useState(defaultPhone);
    const [customerName, setCustomerName] = useState(defaultCustomerName);
    const [docTitle, setDocTitle] = useState(documentTitle);
    const [refNo, setRefNo] = useState(referenceNo);
    const [note, setNote] = useState(customNote);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (defaultPhone) setPhone(defaultPhone);
        if (defaultCustomerName) setCustomerName(defaultCustomerName);
        if (documentTitle) setDocTitle(documentTitle);
        if (referenceNo) setRefNo(referenceNo);
    }, [defaultPhone, defaultCustomerName, documentTitle, referenceNo]);

    if (!isOpen) return null;

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const validPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const buildMessage = () => {
        const greeting = customerName.trim() ? `नमस्ते *${customerName.trim()}* जी,` : `नमस्ते जी,`;
        const lines = [
            `🙏 ${greeting}`,
            `आपका *${docTitle}* सफलतापूर्वक तैयार कर दिया गया है।`,
        ];

        if (refNo.trim()) {
            lines.push(`📄 *रेफरेंस/टोकन नं:* ${refNo.trim()}`);
        }

        const today = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        lines.push(`📅 *दिनांक:* ${today}`);

        if (note.trim()) {
            lines.push(`\n💬 *सूचना:* ${note.trim()}`);
        }

        lines.push(`\n✅ हमारे साइबर कैफे से सेवा लेने के लिए धन्यवाद! आपका दिन शुभ हो।`);
        return lines.join('\n');
    };

    const messageText = buildMessage();

    const handleSendWhatsApp = (isWeb = false) => {
        if (cleanPhone.length < 10) {
            alert('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें!');
            return;
        }

        const baseUrl = isWeb
            ? `https://web.whatsapp.com/send?phone=${validPhone}&text=${encodeURIComponent(messageText)}`
            : `https://wa.me/${validPhone}?text=${encodeURIComponent(messageText)}`;

        window.open(baseUrl, '_blank');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(messageText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">chat</span>
                        </div>
                        <div>
                            <h3 className="font-extrabold text-base leading-tight">
                                WhatsApp Direct Send
                            </h3>
                            <p className="text-xs text-emerald-100 mt-0.5">
                                बिना नंबर सेव किए ग्राहक को व्हाट्सएप पर डॉक्यूमेंट विवरण भेजें
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Body Form */}
                <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                ग्राहक का मोबाइल नंबर <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    maxLength="10"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="9876543210"
                                    className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                ग्राहक का नाम (वैकल्पिक)
                            </label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="e.g. Ramesh Kumar"
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                डॉक्यूमेंट / सेवा का नाम
                            </label>
                            <input
                                type="text"
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                रेफरेंस / टोकन नं. (वैकल्पिक)
                            </label>
                            <input
                                type="text"
                                value={refNo}
                                onChange={(e) => setRefNo(e.target.value)}
                                placeholder="e.g. HR-DOM-2026-9921"
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            अतिरिक्त नोट (Extra Note)
                        </label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="e.g. कृपया ओरिजिनल कॉपी लेने शाम 5 बजे तक आएं"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white"
                        />
                    </div>

                    {/* Live Preview Box */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                मैसेज प्रिव्यू (Live Preview)
                            </span>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">
                                    {copied ? 'check' : 'content_copy'}
                                </span>
                                {copied ? 'कॉपी हो गया!' : 'टेक्स्ट कॉपी करें'}
                            </button>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200">
                            {messageText}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2.5 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        बंद करें
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSendWhatsApp(true)}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        title="WhatsApp Web पर भेजें"
                    >
                        <span className="material-symbols-outlined text-sm">laptop</span>
                        WhatsApp Web
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSendWhatsApp(false)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-base">send</span>
                        WhatsApp पर भेजें
                    </button>
                </div>
            </div>
        </div>
    );
}
