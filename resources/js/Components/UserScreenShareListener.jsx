import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
};

export default function UserScreenShareListener({ user }) {
    if (!user || user.type === 'admin') {
        return null;
    }

    const [incomingSession, setIncomingSession] = useState(null);
    const [isSharing, setIsSharing] = useState(false);
    const [activeSession, setActiveSession] = useState(null);
    const [duration, setDuration] = useState(0);
    const [errorMsg, setErrorMsg] = useState(null);

    const pcRef = useRef(null);
    const streamRef = useRef(null);
    const processedCandidatesRef = useRef(new Set());
    const pollIncomingRef = useRef(null);
    const pollSessionRef = useRef(null);
    const timerRef = useRef(null);

    const playChime = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) {}
    };

    const cleanup = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (pollSessionRef.current) {
            clearInterval(pollSessionRef.current);
            pollSessionRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsSharing(false);
        setActiveSession(null);
        setDuration(0);
        setErrorMsg(null);
    };

    useEffect(() => {
        if (isSharing) return;

        const checkIncoming = async () => {
            try {
                const res = await axios.get('/screen-share/incoming');
                const sess = res.data?.session;
                if (sess && (!incomingSession || incomingSession.id !== sess.id)) {
                    setIncomingSession(sess);
                    playChime();
                } else if (!sess && incomingSession) {
                    setIncomingSession(null);
                }
            } catch (e) {}
        };

        checkIncoming();
        pollIncomingRef.current = setInterval(checkIncoming, 3500);

        return () => {
            if (pollIncomingRef.current) clearInterval(pollIncomingRef.current);
        };
    }, [isSharing, incomingSession?.id]);

    useEffect(() => {
        if (isSharing) {
            timerRef.current = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [isSharing]);

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleDecline = async () => {
        if (!incomingSession) return;
        try {
            await axios.post(`/screen-share/${incomingSession.id}/reject`);
        } catch (e) {}
        setIncomingSession(null);
    };

    const attachStreamAndConnect = async (stream) => {
        streamRef.current = stream;

        // Handle when user stops sharing via browser's native floating bar
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.onended = () => {
                handleStopSharing();
            };
        }

        const pc = new RTCPeerConnection(RTC_CONFIG);
        pcRef.current = pc;

        // Add stream tracks
        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                axios.post(`/screen-share/${incomingSession.id}/candidate`, {
                    candidate: event.candidate.toJSON(),
                }).catch(() => {});
            }
        };

        if (incomingSession.offer) {
            const offerDesc = new RTCSessionDescription(JSON.parse(incomingSession.offer));
            await pc.setRemoteDescription(offerDesc);
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await axios.post(`/screen-share/${incomingSession.id}/accept`, {
            answer: JSON.stringify(answer),
        });

        setActiveSession(incomingSession);
        setIncomingSession(null);
        setIsSharing(true);

        startSessionPolling(incomingSession.id, pc);
    };

    const handleAccept = async () => {
        if (!incomingSession) return;
        setErrorMsg(null);

        // 1. Check for Secure Context (HTTPS)
        const isSecure = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isSecure) {
            setErrorMsg('https_required');
            return;
        }

        // 2. Check for mobile browser
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const getDisplayMedia = navigator.mediaDevices?.getDisplayMedia?.bind(navigator.mediaDevices)
            || navigator.getDisplayMedia?.bind(navigator);

        if (!getDisplayMedia) {
            if (isMobile) {
                setErrorMsg('mobile_unsupported');
            } else {
                setErrorMsg('browser_unsupported');
            }
            return;
        }

        try {
            // Trigger browser screen selector
            const stream = await getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'monitor',
                },
                audio: false,
            });

            await attachStreamAndConnect(stream);
        } catch (err) {
            console.error('Screen share prompt cancelled or denied:', err);
            if (err.name !== 'NotAllowedError') {
                setErrorMsg(err.message || 'Permission denied');
            }
        }
    };

    // Mobile fallback: allow pointing rear camera at PC screen
    const handleCameraFallback = async () => {
        if (!incomingSession) return;
        setErrorMsg(null);

        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                setErrorMsg('Camera access is not supported on this browser.');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
                audio: false,
            });

            await attachStreamAndConnect(stream);
        } catch (err) {
            console.error('Camera fallback failed:', err);
            setErrorMsg('Camera access denied or unavailable: ' + (err.message || 'Error'));
        }
    };

    const startSessionPolling = (sessionId, pc) => {
        if (pollSessionRef.current) clearInterval(pollSessionRef.current);

        pollSessionRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`/screen-share/${sessionId}/poll`);
                const s = res.data?.session;
                if (!s) return;

                if (s.status === 'ended') {
                    cleanup();
                    return;
                }

                if (Array.isArray(s.admin_candidates)) {
                    s.admin_candidates.forEach((cand) => {
                        const candStr = JSON.stringify(cand);
                        if (!processedCandidatesRef.current.has(candStr)) {
                            processedCandidatesRef.current.add(candStr);
                            pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
                        }
                    });
                }
            } catch (e) {}
        }, 1500);
    };

    const handleStopSharing = async () => {
        const sessId = activeSession?.id;
        cleanup();
        if (sessId) {
            try {
                await axios.post(`/screen-share/${sessId}/end`);
            } catch (e) {}
        }
    };

    return (
        <>
            {/* Incoming Screen Share Prompt */}
            {incomingSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-3xl shadow-2xl p-6 text-center overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative mb-4">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto shadow-inner ring-4 ring-indigo-500/20 animate-pulse">
                                <span className="material-symbols-outlined text-4xl">desktop_windows</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            Support Screen Share Request
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                            Administrator ({incomingSession.admin?.name || 'Support'}) is requesting to view your screen to assist you.
                        </p>

                        <div className="my-4 p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl text-left flex items-start gap-2.5">
                            <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-base mt-0.5 flex-shrink-0">verified_user</span>
                            <p className="text-[11px] text-indigo-950 dark:text-indigo-200 leading-tight">
                                You can choose to share your entire display, an application window, or a tab. You can stop sharing at any moment.
                            </p>
                        </div>

                        {errorMsg === 'https_required' && (
                            <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-2xl text-left">
                                <p className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">lock</span>
                                    HTTPS Secure Connection Required
                                </p>
                                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                                    Google Chrome browser security ke kaaran bina HTTPS (https://) ke Screen Share block karta hai. Kripya neeche button par click karke HTTPS par switch karein:
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        window.location.href = window.location.href.replace(/^http:/i, 'https:');
                                    }}
                                    className="mt-2 w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">refresh</span>
                                    <span>Switch to HTTPS & Reload</span>
                                </button>
                            </div>
                        )}

                        {errorMsg === 'mobile_unsupported' && (
                            <div className="mb-3 p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800 rounded-2xl text-left">
                                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">devices</span>
                                    Mobile Screen Share Not Supported
                                </p>
                                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed">
                                    Mobile browsers screen recording allow nahi karte. Aap apne phone camera se PC screen dikha sakte hain:
                                </p>
                                <button
                                    type="button"
                                    onClick={handleCameraFallback}
                                    className="mt-2 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                                    <span>Show Screen via Camera</span>
                                </button>
                            </div>
                        )}

                        {errorMsg && errorMsg !== 'https_required' && errorMsg !== 'mobile_unsupported' && (
                            <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs text-left">
                                {errorMsg}
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleDecline}
                                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                            >
                                Decline
                            </button>
                            <button
                                type="button"
                                onClick={handleAccept}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-base">screen_share</span>
                                <span>Accept & Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Floating Screen Share Indicator Bar */}
            {isSharing && (
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border-2 border-indigo-500 text-white px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-indigo-400">desktop_windows</span>
                            Sharing Screen with Admin
                        </span>
                        <span className="text-xs font-mono text-indigo-300 ml-1">
                            ({formatDuration(duration)})
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleStopSharing}
                        className="px-3.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow transition-all flex items-center gap-1 cursor-pointer"
                        title="Stop Screen Sharing"
                    >
                        <span className="material-symbols-outlined text-sm">stop_screen_share</span>
                        <span>Stop Sharing</span>
                    </button>
                </div>
            )}
        </>
    );
}
