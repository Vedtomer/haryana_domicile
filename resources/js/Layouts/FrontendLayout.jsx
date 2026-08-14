import React from 'react';
import Toast from '../Components/Toast';
import FrontendHeader from '../Components/FrontendHeader';
import FrontendFooter from '../Components/FrontendFooter';
import WhatsAppButton from '../Components/WhatsAppButton';

export default function FrontendLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col font-body-md text-on-background bg-background selection:bg-primary-container selection:text-on-primary-container">
            <Toast />
            <FrontendHeader />
            <main className="flex-grow pt-[60px]">
                {children}
            </main>
            <FrontendFooter />
            <WhatsAppButton />
        </div>
    );
}
