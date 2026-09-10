import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
};

export default function UserVideoCallListener({ user }) {
    // Only listen for regular users
    if (!user || user.type === 'admin') {
        return null;
    }

    const [incomingSession, setIncomingSession] = useState(null);
    const [inCall, setInCall] = useState(false);
    const [activeSession, setActiveSession] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [errorMsg, setErrorMsg] = useState(null);

    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const localVideoRef = useRef(null);
    const processedCandidatesRef = useRef(new Set());
    const pollIncomingRef = useRef(null);
    const pollCallRef = useRef(null);
    const timerRef = useRef(null);

    // Audio chime for incoming call using Web Audio API
    const playRingChime = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) {}
    };

    // Cleanup tracks and connections
    const cleanupCall = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                track.stop();
            });
            localStreamRef.current = null;
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (pollCallRef.current) {
            clearInterval(pollCallRef.current);
            pollCallRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setInCall(false);
        setActiveSession(null);
        setCallDuration(0);
        setErrorMsg(null);
    };

    // Check for incoming calls every 4s while not in an active call
    useEffect(() => {
        if (inCall) return;

        const checkIncoming = async () => {
            try {
                const res = await axios.get('/video-call/incoming');
                const sess = res.data?.session;
                if (sess && (!incomingSession || incomingSession.id !== sess.id)) {
                    setIncomingSession(sess);
                    playRingChime();
                } else if (!sess && incomingSession) {
                    setIncomingSession(null);
                }
            } catch (err) {
                // Ignore silent network errors
            }
        };

        checkIncoming();
        pollIncomingRef.current = setInterval(checkIncoming, 3500);

        return () => {
            if (pollIncomingRef.current) clearInterval(pollIncomingRef.current);
        };
    }, [inCall, incomingSession?.id]);

    // Timer when in call
    useEffect(() => {
        if (inCall) {
            timerRef.current = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [inCall]);

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Decline call
    const handleDecline = async () => {
        if (!incomingSession) return;
        try {
            await axios.post(`/video-call/${incomingSession.id}/reject`);
        } catch (e) {}
        setIncomingSession(null);
    };

    // Accept call & start camera
    const handleAccept = async () => {
        if (!incomingSession) return;
        setErrorMsg(null);

        try {
            // Request user's camera & audio
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                audio: true,
            });

            localStreamRef.current = stream;

            // Initialize WebRTC
            const pc = new RTCPeerConnection(RTC_CONFIG);
            pcRef.current = pc;

            // Add local tracks to send to admin
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // ICE Candidate handler
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    axios.post(`/video-call/${incomingSession.id}/candidate`, {
                        candidate: event.candidate.toJSON(),
                    }).catch(() => {});
                }
            };

            // Set Admin's SDP Offer
            if (incomingSession.offer) {
                const offerDesc = new RTCSessionDescription(JSON.parse(incomingSession.offer));
                await pc.setRemoteDescription(offerDesc);
            }

            // Generate SDP Answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // Send answer to server
            await axios.post(`/video-call/${incomingSession.id}/accept`, {
                answer: JSON.stringify(answer),
            });

            setActiveSession(incomingSession);
            setIncomingSession(null);
            setInCall(true);

            // Attach stream to video tag after state update
            setTimeout(() => {
                if (localVideoRef.current && stream) {
                    localVideoRef.current.srcObject = stream;
                }
            }, 100);

            // Start polling call status
            startCallPolling(incomingSession.id, pc);
        } catch (err) {
            console.error('Camera access or WebRTC error:', err);
            setErrorMsg('Camera permission was not granted by your browser. Please allow camera access in browser settings.');
        }
    };

    const startCallPolling = (sessionId, pc) => {
        if (pollCallRef.current) clearInterval(pollCallRef.current);

        pollCallRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`/video-call/${sessionId}/poll`);
                const s = res.data?.session;
                if (!s) return;

                if (s.status === 'ended') {
                    cleanupCall();
                    return;
                }

                // Add admin ICE candidates
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

    // End call manually
    const handleEndCall = async () => {
        const sessId = activeSession?.id;
        cleanupCall();
        if (sessId) {
            try {
                await axios.post(`/video-call/${sessId}/end`);
            } catch (e) {}
        }
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    return (
        <>
            {/* 1. Incoming Call Prompt Modal */}
            {incomingSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-3xl shadow-2xl p-6 text-center overflow-hidden">
                        {/* Glowing backdrop effect */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative mb-4">
                            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner ring-4 ring-blue-500/30 animate-pulse">
                                <span className="material-symbols-outlined text-4xl">videocam</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            Incoming Live Camera Check
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Administrator ({incomingSession.admin?.name || 'Support'}) is requesting a live video verification.
                        </p>

                        <div className="my-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-left flex items-start gap-2">
                            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-sm mt-0.5">lock</span>
                            <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-tight font-medium">
                                Your camera will <strong>only</strong> turn on after you click Accept and allow browser permission.
                            </p>
                        </div>

                        {errorMsg && (
                            <div className="mb-3 p-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs">
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
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-base">check_circle</span>
                                <span>Accept & Allow</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Active In-Call Floating Window */}
            {inCall && (
                <div className="fixed bottom-5 right-5 z-50 w-72 sm:w-80 bg-slate-900 border-2 border-emerald-500 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
                    {/* Header */}
                    <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-xs font-bold text-white">Live Camera Active</span>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 font-semibold">
                            {formatDuration(callDuration)}
                        </span>
                    </div>

                    {/* Camera View */}
                    <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover mirror ${isVideoOff ? 'hidden' : 'block'}`}
                            style={{ transform: 'scaleX(-1)' }}
                        />
                        {isVideoOff && (
                            <div className="text-slate-500 flex flex-col items-center">
                                <span className="material-symbols-outlined text-3xl">videocam_off</span>
                                <span className="text-[11px] mt-1">Camera Paused</span>
                            </div>
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs rounded-lg text-[10px] text-white flex items-center gap-1">
                            <span>Connected to Admin</span>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-3 bg-slate-800/90 flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={toggleMute}
                            className={`p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                isMuted ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                            }`}
                            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                        >
                            <span className="material-symbols-outlined text-sm">
                                {isMuted ? 'mic_off' : 'mic'}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={toggleVideo}
                            className={`p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                isVideoOff ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                            }`}
                            title={isVideoOff ? 'Turn Video On' : 'Pause Video'}
                        >
                            <span className="material-symbols-outlined text-sm">
                                {isVideoOff ? 'videocam_off' : 'videocam'}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleEndCall}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                            title="End Call & Stop Camera"
                        >
                            <span className="material-symbols-outlined text-sm">call_end</span>
                            <span>End Call</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
