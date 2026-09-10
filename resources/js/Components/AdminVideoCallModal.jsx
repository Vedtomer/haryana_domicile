import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
};

export default function AdminVideoCallModal({ user, onClose }) {
    if (!user) return null;

    const [callState, setCallState] = useState('initiating'); // initiating | calling | connected | rejected | ended | failed
    const [statusMessage, setStatusMessage] = useState('Initiating video call...');
    const [session, setSession] = useState(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [snapshot, setSnapshot] = useState(null);

    const pcRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const processedCandidatesRef = useRef(new Set());
    const pollIntervalRef = useRef(null);
    const timerIntervalRef = useRef(null);

    // Stop and cleanup WebRTC and intervals
    const cleanup = () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
    };

    useEffect(() => {
        startCall();
        return () => {
            cleanup();
        };
    }, [user.id]);

    // Duration timer once connected
    useEffect(() => {
        if (callState === 'connected') {
            timerIntervalRef.current = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
    }, [callState]);

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const startCall = async () => {
        try {
            setCallState('calling');
            setStatusMessage(`Calling ${user.name || 'User'}... Waiting for user to accept and allow camera.`);

            // Create WebRTC Peer Connection
            const pc = new RTCPeerConnection(RTC_CONFIG);
            pcRef.current = pc;

            // Add transceivers to receive remote video and audio
            pc.addTransceiver('video', { direction: 'recvonly' });
            pc.addTransceiver('audio', { direction: 'recvonly' });

            // Remote stream handler
            pc.ontrack = (event) => {
                if (remoteVideoRef.current && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setCallState('connected');
                    setStatusMessage('Live Video Connected');
                }
            };

            // ICE Candidate handler
            pc.onicecandidate = (event) => {
                if (event.candidate && session?.id) {
                    axios.post(`/admin/video-call/${session.id}/candidate`, {
                        candidate: event.candidate.toJSON()
                    }).catch(() => {});
                }
            };

            // Generate SDP Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Send offer to backend
            const res = await axios.post(`/admin/video-call/${user.id}/start`, {
                offer: JSON.stringify(offer)
            });

            if (res.data && res.data.session) {
                const newSession = res.data.session;
                setSession(newSession);
                startPolling(newSession.id, pc);
            } else {
                throw new Error('Could not start call session');
            }
        } catch (err) {
            console.error('Failed to initiate call:', err);
            setCallState('failed');
            setStatusMessage('Failed to start call. Please try again.');
        }
    };

    const startPolling = (sessionId, pc) => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

        pollIntervalRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`/admin/video-call/${sessionId}/poll`);
                const s = res.data?.session;
                if (!s) return;

                if (s.status === 'rejected') {
                    setCallState('rejected');
                    setStatusMessage('User declined the video call request.');
                    cleanup();
                    return;
                }

                if (s.status === 'ended') {
                    setCallState('ended');
                    setStatusMessage('Call ended.');
                    cleanup();
                    return;
                }

                if (s.status === 'accepted' && s.answer) {
                    if (pc.signalingState === 'have-local-offer') {
                        const answerDesc = new RTCSessionDescription(JSON.parse(s.answer));
                        await pc.setRemoteDescription(answerDesc);
                        setCallState('connected');
                        setStatusMessage('Live Video Connected');
                    }
                }

                // Add remote ICE candidates
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
                console.error('Poll error in admin video call', err);
            }
        }, 1500);
    };

    const handleEndCall = async () => {
        cleanup();
        setCallState('ended');
        if (session?.id) {
            try {
                await axios.post(`/admin/video-call/${session.id}/end`);
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

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setSnapshot(dataUrl);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="px-5 py-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm ring-2 ring-blue-400">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            {callState === 'connected' && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base flex items-center gap-2">
                                <span>{user.name || 'User'}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                                    ID: #{user.id}
                                </span>
                            </h3>
                            <p className="text-xs text-slate-400">
                                {callState === 'connected' ? (
                                    <span className="text-emerald-400 font-medium">🔴 Live • {formatDuration(callDuration)}</span>
                                ) : (
                                    statusMessage
                                )}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleEndCall}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                        title="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Video Area */}
                <div className="relative flex-1 min-h-[320px] sm:min-h-[420px] bg-black flex items-center justify-center overflow-hidden">
                    {/* Remote Video Stream */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        muted={isMuted}
                        className={`w-full h-full object-contain ${callState === 'connected' ? 'block' : 'hidden'}`}
                    />

                    {/* Calling / Waiting State */}
                    {callState === 'calling' && (
                        <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-blue-600/20 flex items-center justify-center animate-ping absolute inset-0" />
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl relative z-10">
                                    <span className="material-symbols-outlined text-4xl">videocam</span>
                                </div>
                            </div>
                            <div className="space-y-1 max-w-sm">
                                <h4 className="text-lg font-bold text-white">Calling {user.name}...</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Live camera request sent. Waiting for the user to click <span className="text-blue-400 font-semibold">"Accept & Allow Camera"</span> on their screen.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Rejected State */}
                    {callState === 'rejected' && (
                        <div className="text-center p-6 space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-red-950/60 text-red-400 border border-red-800/80 flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-3xl">call_end</span>
                            </div>
                            <h4 className="text-white font-bold text-base">Request Declined</h4>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                The user declined the camera verification request.
                            </p>
                        </div>
                    )}

                    {/* Ended / Failed State */}
                    {(callState === 'ended' || callState === 'failed') && (
                        <div className="text-center p-6 space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-3xl">videocam_off</span>
                            </div>
                            <h4 className="text-white font-bold text-base">{statusMessage}</h4>
                        </div>
                    )}

                    {/* Floating Snapshot Preview if taken */}
                    {snapshot && (
                        <div className="absolute top-4 right-4 z-20 bg-slate-900/90 border border-slate-700 rounded-2xl p-2 shadow-2xl backdrop-blur-md max-w-[180px] animate-in zoom-in-95 duration-150">
                            <div className="relative">
                                <img src={snapshot} alt="Captured Verification" className="w-full rounded-lg object-cover" />
                                <button
                                    onClick={() => setSnapshot(null)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="mt-1.5 flex justify-between items-center text-[10px] text-slate-300">
                                <span>Verified Snapshot</span>
                                <a
                                    href={snapshot}
                                    download={`user_${user.id}_verification.jpg`}
                                    className="text-blue-400 hover:text-blue-300 font-bold underline"
                                >
                                    Save
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="px-5 py-4 bg-slate-800/90 border-t border-slate-700/60 flex items-center justify-center gap-4">
                    {callState === 'connected' && (
                        <>
                            {/* Snapshot Button */}
                            <button
                                type="button"
                                onClick={handleCaptureSnapshot}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer"
                                title="Capture Snapshot of User"
                            >
                                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                                <span>Capture Photo</span>
                            </button>

                            {/* Mute Audio Button */}
                            <button
                                type="button"
                                onClick={() => setIsMuted(!isMuted)}
                                className={`p-3 rounded-2xl font-bold transition-all cursor-pointer ${
                                    isMuted ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                                }`}
                                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {isMuted ? 'volume_off' : 'volume_up'}
                                </span>
                            </button>
                        </>
                    )}

                    {/* Red End Call Button */}
                    <button
                        type="button"
                        onClick={handleEndCall}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-red-600/30 hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">call_end</span>
                        <span>{callState === 'connected' ? 'End Video Call' : 'Cancel Call'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
