import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
};

export default function AdminScreenViewModal({ user, onClose }) {
    if (!user) return null;

    const [shareState, setShareState] = useState('initiating'); // initiating | requesting | connected | rejected | ended | failed
    const [statusMessage, setStatusMessage] = useState('Connecting...');
    const [session, setSession] = useState(null);
    const [duration, setDuration] = useState(0);
    const [snapshot, setSnapshot] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const pcRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const containerRef = useRef(null);
    const processedCandidatesRef = useRef(new Set());
    const pollIntervalRef = useRef(null);
    const timerIntervalRef = useRef(null);

    const cleanup = () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
    };

    useEffect(() => {
        startScreenShare();
        return () => {
            cleanup();
        };
    }, [user.id]);

    useEffect(() => {
        if (shareState === 'connected') {
            timerIntervalRef.current = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
    }, [shareState]);

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const startScreenShare = async () => {
        try {
            setShareState('requesting');
            setStatusMessage(`Request sent to ${user.name || 'User'}... Waiting for user to accept and share display.`);

            const pc = new RTCPeerConnection(RTC_CONFIG);
            pcRef.current = pc;

            // Transceiver to receive remote screen stream
            pc.addTransceiver('video', { direction: 'recvonly' });

            pc.ontrack = (event) => {
                if (remoteVideoRef.current && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setShareState('connected');
                    setStatusMessage('Live Screen Connected');
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate && session?.id) {
                    axios.post(`/admin/screen-share/${session.id}/candidate`, {
                        candidate: event.candidate.toJSON()
                    }).catch(() => {});
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const res = await axios.post(`/admin/screen-share/${user.id}/start`, {
                offer: JSON.stringify(offer)
            });

            if (res.data && res.data.session) {
                const newSession = res.data.session;
                setSession(newSession);
                startPolling(newSession.id, pc);
            } else {
                throw new Error('Could not initiate screen share session');
            }
        } catch (err) {
            console.error('Failed to initiate screen share:', err);
            setShareState('failed');
            setStatusMessage('Failed to start screen share. Please try again.');
        }
    };

    const startPolling = (sessionId, pc) => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

        pollIntervalRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`/admin/screen-share/${sessionId}/poll`);
                const s = res.data?.session;
                if (!s) return;

                if (s.status === 'rejected') {
                    setShareState('rejected');
                    setStatusMessage('User declined the screen share request.');
                    cleanup();
                    return;
                }

                if (s.status === 'ended') {
                    setShareState('ended');
                    setStatusMessage('Screen share session ended.');
                    cleanup();
                    return;
                }

                if (s.status === 'accepted' && s.answer) {
                    if (pc.signalingState === 'have-local-offer') {
                        const answerDesc = new RTCSessionDescription(JSON.parse(s.answer));
                        await pc.setRemoteDescription(answerDesc);
                        setShareState('connected');
                        setStatusMessage('Live Screen Connected');
                    }
                }

                if (Array.isArray(s.user_candidates)) {
                    s.user_candidates.forEach((cand) => {
                        const candStr = JSON.stringify(cand);
                        if (!processedCandidatesRef.current.has(candStr)) {
                            processedCandidatesRef.current.add(candStr);
                            pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
                        }
                    });
                }
            } catch (err) {
                console.error('Poll error in admin screen view', err);
            }
        }, 1500);
    };

    const handleEndSession = async () => {
        cleanup();
        setShareState('ended');
        if (session?.id) {
            try {
                await axios.post(`/admin/screen-share/${session.id}/end`);
            } catch (e) {}
        }
        onClose();
    };

    const handleCaptureSnapshot = () => {
        if (!remoteVideoRef.current) return;
        const video = remoteVideoRef.current;
        if (video.videoWidth === 0) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');
        setSnapshot(dataUrl);
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div
                ref={containerRef}
                className={`relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
                    isFullscreen ? 'h-screen max-h-screen rounded-none' : 'max-h-[95vh] h-[85vh]'
                }`}
            >
                {/* Header */}
                <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700/60 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-2xl">desktop_windows</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                                <span>{user.name || 'User'}'s Screen</span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                                    ID: #{user.id}
                                </span>
                            </h3>
                            <p className="text-xs text-slate-400">
                                {shareState === 'connected' ? (
                                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Live Display Stream • {formatDuration(duration)}
                                    </span>
                                ) : (
                                    statusMessage
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {shareState === 'connected' && (
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
                                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                            >
                                <span className="material-symbols-outlined text-xl">
                                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                                </span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleEndSession}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
                            title="Close"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Main Screen Stream Area */}
                <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                    {/* Live Remote Screen Video */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className={`w-full h-full object-contain ${shareState === 'connected' ? 'block' : 'hidden'}`}
                    />

                    {/* Waiting / Requesting State */}
                    {shareState === 'requesting' && (
                        <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-indigo-600/20 flex items-center justify-center animate-ping absolute inset-0" />
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xl relative z-10">
                                    <span className="material-symbols-outlined text-4xl">screen_share</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-bold text-white">Connecting with {user.name}...</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Screen share invitation sent. Waiting for the user to click <span className="text-indigo-400 font-semibold">"Accept & Share Screen"</span> and select their window.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Rejected State */}
                    {shareState === 'rejected' && (
                        <div className="text-center p-6 space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-red-950/60 text-red-400 border border-red-800 flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-3xl">cancel_presentation</span>
                            </div>
                            <h4 className="text-white font-bold text-base">Request Declined</h4>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                The user declined the screen share request.
                            </p>
                        </div>
                    )}

                    {/* Ended / Failed State */}
                    {(shareState === 'ended' || shareState === 'failed') && (
                        <div className="text-center p-6 space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-3xl">stop_screen_share</span>
                            </div>
                            <h4 className="text-white font-bold text-base">{statusMessage}</h4>
                        </div>
                    )}

                    {/* Floating Captured Screenshot Preview */}
                    {snapshot && (
                        <div className="absolute top-4 right-4 z-20 bg-slate-900/95 border border-slate-700 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md max-w-[220px] animate-in zoom-in-95 duration-150">
                            <div className="relative">
                                <img src={snapshot} alt="Captured Screen" className="w-full rounded-lg object-cover border border-slate-800" />
                                <button
                                    onClick={() => setSnapshot(null)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="mt-2 flex justify-between items-center text-[11px] text-slate-300">
                                <span>Captured Display</span>
                                <a
                                    href={snapshot}
                                    download={`screen_${user.id}_${Date.now()}.png`}
                                    className="text-indigo-400 hover:text-indigo-300 font-bold underline"
                                >
                                    Download
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="px-5 py-3.5 bg-slate-800/90 border-t border-slate-700/60 flex items-center justify-center gap-4 flex-shrink-0">
                    {shareState === 'connected' && (
                        <button
                            type="button"
                            onClick={handleCaptureSnapshot}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-xs shadow transition-all cursor-pointer"
                            title="Take Screenshot of User Display"
                        >
                            <span className="material-symbols-outlined text-[18px]">camera</span>
                            <span>Take Screenshot</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleEndSession}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">stop_screen_share</span>
                        <span>{shareState === 'connected' ? 'Stop Viewing Screen' : 'Cancel Request'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
