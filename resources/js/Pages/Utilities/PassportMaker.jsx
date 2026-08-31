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
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Passport Photo Maker</h2>}
        >
            <Head title="Passport Photo Maker" />
            
            {/* Hide the spelling warning that AdminLayout injects automatically to prevent layout shifting */}
            <style>{`
                main > div.bg-red-100 { display: none !important; }
                main > div.dark\\:bg-red-900\\/30 { display: none !important; }
            `}</style>

            {/* Negative margin counteracts the p-8 padding of AdminLayout main tag */}
            <div className="-m-8 h-[calc(100vh-64px)] w-[calc(100%+4rem)] overflow-hidden">
                <iframe 
                    ref={iframeRef}
                    src="/passport_maker/index.html" 
                    className="w-full h-full border-none"
                    title="Passport Photo Maker"
                    allow="fullscreen"
                />
            </div>
        </AdminLayout>
    );
}
