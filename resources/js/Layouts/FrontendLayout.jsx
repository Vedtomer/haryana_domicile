import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import Toast from '../Components/Toast';
import FrontendHeader from '../Components/FrontendHeader';
import FrontendFooter from '../Components/FrontendFooter';
import WhatsAppButton from '../Components/WhatsAppButton';
import UserChatWidget from '../Components/UserChatWidget';
import UserScreenShareListener from '../Components/UserScreenShareListener';

export default function FrontendLayout({ children }) {
    const { auth } = usePage().props;

    useEffect(() => {
        if (!auth?.user) return;
        axios.post('/chat/heartbeat').catch(() => {});
        const interval = setInterval(() => {
            axios.post('/chat/heartbeat').catch(() => {});
        }, 45000);
        return () => clearInterval(interval);
    }, [auth?.user?.id]);

    return (
        <div className="min-h-screen flex flex-col font-body-md text-on-background bg-background selection:bg-primary-container selection:text-on-primary-container">
            <Toast />
            <FrontendHeader />
            <main className="flex-grow pt-[60px]">
                {children}
            </main>
            <FrontendFooter />
            <WhatsAppButton />
            {auth?.user && <UserChatWidget user={auth.user} />}
            {auth?.user && <UserScreenShareListener user={auth.user} />}
        </div>
    );
}
