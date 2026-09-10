import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AdminVideoCallModal from './AdminVideoCallModal';

export default function AdminChatModal({ user, onClose }) {
    if (!user) return null;

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [liveUser, setLiveUser] = useState(user);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async (isInitial = false) => {
        try {
            const res = await axios.get(`/admin/chat/${user.id}`);
            if (res.data) {
                setMessages(res.data.messages || []);
                if (res.data.user) {
                    setLiveUser(res.data.user);
                }
            }
        } catch (err) {
            console.error('Failed to load chat messages', err);
        } finally {
            if (isInitial) {
                setLoading(false);
                setTimeout(scrollToBottom, 100);
            }
        }
    };

    useEffect(() => {
        fetchMessages(true);

        // Auto-poll every 3.5 seconds while modal is open
        const interval = setInterval(() => {
            fetchMessages(false);
        }, 3500);

        return () => clearInterval(interval);
    }, [user.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    const handleSend = async (e) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text || sending) return;

        setSending(true);
        try {
            const res = await axios.post(`/admin/chat/${user.id}/send`, { message: text });
            if (res.data && res.data.message) {
                setMessages((prev) => [...prev, res.data.message]);
                setNewMessage('');
                setTimeout(scrollToBottom, 50);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const quickTemplates = [
        'Aapka document ready hai, check karein ✅',
        'Please wallet me coins recharge karein 🪙',
        'Apna correct mobile number share karein 📞',
        'Kisi help ki zaroorat ho toh batayein 🙏',
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full h-[85vh] max-h-[650px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                            <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-lg text-white shadow-inner">
                                {(liveUser.name || liveUser.email || liveUser.phone || '?')[0].toUpperCase()}
                            </div>
                            <span
                                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-blue-600 ${
                                    liveUser.is_online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                                }`}
                                title={liveUser.is_online ? 'Online now' : `Last seen: ${liveUser.last_seen_human}`}
                            />
                        </div>

                        <div className="min-w-0">
                            <h3 className="text-base font-extrabold truncate leading-tight">
                                {liveUser.name || 'User #' + liveUser.id}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-blue-100 flex items-center gap-1 font-medium">
                                    <span className={`w-2 h-2 rounded-full ${liveUser.is_online ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                                    {liveUser.is_online ? 'Online Now' : `Last seen: ${liveUser.last_seen_human}`}
                                </span>
                                {liveUser.phone && (
                                    <span className="text-[11px] text-blue-200/90 font-mono">
                                        • {liveUser.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                if (!liveUser.is_online) {
                                    if (!confirm(`${liveUser.name || 'User'} is currently OFFLINE.\nDo you still want to send a Live Camera Check request?`)) {
                                        return;
                                    }
                                }
                                setShowVideoModal(true);
                            }}
                            title="Start Live Camera Check / Video Call"
                            className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center gap-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-base">videocam</span>
                            <span className="hidden sm:inline">Camera Check</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer flex-shrink-0"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950 space-y-3 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                            <p className="text-xs mt-2 font-medium">Loading chat history...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 shadow-inner">
                                <span className="material-symbols-outlined text-3xl">chat</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Start Conversation</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                                Aap is user ko direct message bhej sakte hain. User ko portal par notification dikhega.
                            </p>
                        </div>
                    ) : (
                        messages.map((m) => {
                            const isAdmin = m.sender_type === 'admin';
                            return (
                                <div
                                    key={m.id}
                                    className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                                            isAdmin
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap break-words">{m.message}</p>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                                        <span>{m.formatted_time}</span>
                                        {isAdmin && (
                                            <span
                                                className={`material-symbols-outlined text-[14px] ${
                                                    m.is_read ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400'
                                                }`}
                                                title={m.is_read ? 'Seen by User' : 'Delivered'}
                                            >
                                                {m.is_read ? 'done_all' : 'done'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Templates */}
                <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
                    {quickTemplates.map((template, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setNewMessage(template)}
                            className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                            {template}
                        </button>
                    ))}
                </div>

                {/* Send Input */}
                <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Type message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        disabled={sending}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow font-semibold text-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer flex-shrink-0"
                    >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </form>

                {/* Live Video Call Modal */}
                {showVideoModal && (
                    <AdminVideoCallModal
                        user={liveUser}
                        onClose={() => setShowVideoModal(false)}
                    />
                )}
            </div>
        </div>
    );
}
