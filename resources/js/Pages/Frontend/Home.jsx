import React from 'react';
import { Head } from '@inertiajs/react';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
            <Head>
                <title>Welcome to CSP Jaankari</title>
                <meta name="description" content="Your trusted portal for applying to citizen services, PAN cards, marriage forms, and domicile certificates." />
            </Head>

            <main className="max-w-4xl bg-white p-10 rounded-2xl shadow-xl">
                <h1 className="text-4xl font-extrabold text-blue-600 mb-4">
                    Welcome to CSP Jaankari
                </h1>
                <p className="text-gray-600 text-lg mb-8">
                    The simplest way to manage and apply for citizen services securely and fast.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a href="/admin" className="p-6 border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition group">
                        <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-500 mb-2">Login to Admin Portal &rarr;</h2>
                        <p className="text-gray-500">Access your dashboard, manage services, print forms, and check status.</p>
                    </a>
                    
                    <a href="/services" className="p-6 border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition group">
                        <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-500 mb-2">View Public Services &rarr;</h2>
                        <p className="text-gray-500">Explore the list of services we provide including PAN and Domicile.</p>
                    </a>
                </div>
            </main>

            <footer className="mt-12 text-gray-400">
                &copy; {new Date().getFullYear()} CSP Jaankari. All rights reserved.
            </footer>
        </div>
    );
}
