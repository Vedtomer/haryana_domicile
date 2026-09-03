import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function TwoFactorSetup({ qrCodeSvg, secret }) {
    const { post, processing } = useForm();

    return (
        <AdminLayout
            header={
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                        Two-Factor Authentication (2FA)
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Secure your account with Google Authenticator. This is required to access your dashboard.
                    </p>
                </div>
            }
        >
            <Head title="2FA Setup" />

            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">security</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Setup Authenticator App</h2>
                            <p className="text-sm text-gray-500">Scan the QR code with Google Authenticator or Authy to continue.</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        <div className="w-full md:w-1/2 flex flex-col items-center border border-gray-200 p-4 rounded-xl bg-gray-50">
                            <div 
                                className="w-48 h-48 bg-white p-2 rounded-lg shadow-sm border border-gray-100 mb-4"
                                dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                            />
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Secret Key</p>
                            <code className="bg-gray-200 px-3 py-1.5 rounded text-sm font-mono text-gray-800 break-all text-center">
                                {secret}
                            </code>
                        </div>

                        <div className="w-full md:w-1/2 space-y-4 text-sm text-gray-600">
                            <h3 className="font-bold text-gray-900 text-base">Instructions:</h3>
                            <ol className="list-decimal pl-4 space-y-2">
                                <li>Download <strong>Google Authenticator</strong> from the App Store or Google Play.</li>
                                <li>Open the app and tap the <strong>+</strong> icon.</li>
                                <li>Select <strong>Scan a QR code</strong> and point your camera at the code on the left.</li>
                                <li>If you can't scan the QR code, select <strong>Enter a setup key</strong> and type the secret key shown below the QR code.</li>
                                <li>Once added, the app will generate a new 6-digit code every 30 seconds.</li>
                            </ol>
                            
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <Link
                                    href="/dashboard"
                                    className="block text-center w-full px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-lg transition-colors shadow-sm"
                                >
                                    I have scanned the code, continue to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
