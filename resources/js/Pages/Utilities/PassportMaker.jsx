import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';

export default function PassportMaker({ auth, service }) {
    const iframeRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    useEffect(() => {
        const handleMessage = async (event) => {
            // Make sure the message is coming from our iframe
            if (event.data && event.data.type === 'request_download_permission') {
                if (isProcessing) return; // Prevent double clicks
                
                setIsProcessing(true);
                const { messageId, downloadType, details } = event.data;
                
                try {
                    const response = await axios.post('/utilities/passport-maker/deduct-coins', {
                        downloadType,
                        details
                    });
                    
                    if (response.data.success) {
                        // Approve download
                        event.source.postMessage({
                            type: 'download_permission_response',
                            messageId,
                            approved: true
                        }, '*');
                        
                        // Optionally refresh the page to update user coin balance
                        router.reload({ only: ['auth'] });
                    }
                } catch (error) {
                    const reason = error.response?.data?.message || 'Failed to process transaction';
                    event.source.postMessage({
                        type: 'download_permission_response',
                        messageId,
                        approved: false,
                        reason
                    }, '*');
                } finally {
                    setIsProcessing(false);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [isProcessing]);

    return (
        <>
            <Head title="Passport Photo Maker" />
            
            {/* Floating Back Button */}
            <div className="fixed top-4 left-4 z-50">
                <button 
                    onClick={() => router.get(route('dashboard'))}
                    className="bg-white/80 backdrop-blur-md hover:bg-white text-gray-800 p-2 rounded-full shadow-lg border border-gray-200 transition-all flex items-center justify-center"
                    title="Back to Dashboard"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
                    </svg>
                </button>
            </div>

            <div className="w-screen h-screen overflow-hidden bg-gray-50">
                <iframe 
                    ref={iframeRef}
                    src="/passport_maker/index.html" 
                    className="w-full h-full border-none"
                    title="Passport Photo Maker"
                    allow="fullscreen"
                />
            </div>
        </>
    );
}
