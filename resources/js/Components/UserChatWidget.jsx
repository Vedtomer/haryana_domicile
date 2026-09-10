import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function UserChatWidget({ user }) {
    if (!user || user.type !== 'user') return null;

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Heartbeat & Unread check every 45 seconds
    useEffect(() => {
        const sendHeartbeat = async () => {
            try {
                const res = await axios.post('/chat/heartbeat');
                if (res.data && typeof res.data.unread_chat_count === 'number') {
                    setUnreadCount(res.data.unread_chat_count);
                }
            } catch (e) {
                // ignore
            }
        };

        sendHeartbeat();
        const interval = setInterval(sendHeartbeat, 45000);
        return () => clearInterval(interval);
    }, []);

    // Fetch messages when opened
    const fetchMessages = async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const res = await axios.get('/chat/messages');
            if (res.data) {
                setMessages(res.data.messages || []);
                setUnreadCount(0);
            }
        } catch (err) {
            console.error('Failed to load chat', err);
        } finally {
            if (isInitial) {
                setLoading(false);
                setTimeout(scrollToBottom, 100);
            }
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        fetchMessages(true);
        // Poll every 3.5 seconds while open
        const interval = setInterval(() => {
            fetchMessages(false);
        }, 3500);

        return () => clearInterval(interval);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages.length, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text || sending) return;

        setSending(true);
        try {
            const res = await axios.post('/chat/send', { message: text });
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

    return (
        <>
            {/* Floating Chat Trigger Button (Fixed at Bottom-Right, above WhatsApp or alongside) */}
            <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end">
                {/* Unread Alert Bubble */}
                {unreadCount > 0 && !isOpen && (
                    <div
                        onClick={() => setIsOpen(true)}
                        className="mb-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 cursor-pointer animate-bounce border border-white/20"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Admin Message Received!</span>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer border-2 border-white/40 group"
                    title="Live Admin Support Chat"
                >
                    <span className="material-symbols-outlined text-2xl transition-transform duration-200 group-hover:rotate-12">
                        {isOpen ? 'close' : 'forum'}
                    </span>

                    {/* Unread Count Badge */}
                    {unreadCount > 0 && !isOpen && (
                        <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-500 text-white font-extrabold text-[11px] rounded-full flex items-center justify-center shadow-md animate-pulse border-2 border-white dark:border-slate-900">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Chat Box Dialog */}
            {isOpen && (
                <div className="fixed bottom-38 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 h-[500px] max-h-[75vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                    
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold shadow-inner">
                                    <span className="material-symbols-outlined text-2xl">support_agent</span>
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-blue-600 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold leading-tight">Admin & Support</h3>
                                <p className="text-[11px] text-blue-100 flex items-center gap-1 font-medium mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    Always Active • Online
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>

                    {/* Messages Feed */}
                    <div className="flex-1 p-3.5 overflow-y-auto bg-slate-50 dark:bg-slate-950 space-y-2.5 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
                                <p className="text-xs mt-2">Loading messages...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 shadow-inner">
                                    <span className="material-symbols-outlined text-2xl">chat</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Admin Live Support</h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                    Aapka koi sawal ya help chahiye toh yahan message type karke bhej sakte hain.
                                </p>
                            </div>
                        ) : (
                            messages.map((m) => {
                                const isFromAdmin = m.sender_type === 'admin';
                                return (
                                    <div
                                        key={m.id}
                                        className={`flex flex-col ${isFromAdmin ? 'items-start' : 'items-end'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                                isFromAdmin
                                                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                                            }`}
                                        >
                                            {isFromAdmin && (
                                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                                                    🛡️ Admin
                                                </p>
                                            )}
                                            <p className="whitespace-pre-wrap break-words">{m.message}</p>
                                        </div>
                                        <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-mono">
                                            {m.formatted_time}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Bar */}
                    <form onSubmit={handleSend} className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            disabled={sending}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer flex-shrink-0"
                        >
                            <span className="material-symbols-outlined text-base">send</span>
                        </button>
                    </form>

                </div>
            )}
        </>
    );
}
