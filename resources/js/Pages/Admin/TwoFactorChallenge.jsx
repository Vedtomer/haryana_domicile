import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import FrontendLayout from '../../Layouts/FrontendLayout';

export default function TwoFactorChallenge() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/2fa/challenge');
    };

    return (
        <FrontendLayout>
            <Head title="2FA Verification - CSP Jaankari" />
            <div className="relative py-10 md:py-16 flex items-center justify-center px-4 md:px-8 font-body-md overflow-hidden" style={{ background: 'linear-gradient(180deg, #050a14 0%, #0d1227 100%)' }}>
                <div className="relative z-10 w-full max-w-[500px] flex justify-center">
                    <main className="w-full rounded-2xl overflow-hidden shadow-[0px_8px_32px_rgba(0,102,255,0.15)] border-2 border-blue-600 bg-surface">
                        <div className="w-full relative z-10 p-8">
                            <div className="mb-8 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                                    <span className="material-symbols-outlined text-3xl">lock</span>
                                </div>
                                <h1 className="text-2xl font-bold text-primary mb-2">Two-Factor Authentication</h1>
                                <p className="text-on-surface-variant text-sm">Please enter the 6-digit code from your authenticator app.</p>
                            </div>

                            <form onSubmit={submit} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-label-md text-on-surface" htmlFor="code">Authentication Code</label>
                                    <div className="relative flex items-center input-field bg-[#F1F5F9] rounded-lg border-2 border-transparent transition-colors duration-200">
                                        <input 
                                            id="code" 
                                            name="code"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                            className="w-full bg-transparent border-none py-3 px-4 text-center tracking-[0.5em] text-xl font-bold text-on-surface focus:ring-0 focus:outline-none rounded-lg" 
                                            placeholder="••••••" 
                                            maxLength={6}
                                            autoFocus
                                            autoComplete="one-time-code"
                                            type="text"
                                        />
                                    </div>
                                    {errors.code && <p className="text-red-500 text-xs mt-1 text-center">{errors.code}</p>}
                                </div>
                                
                                <button 
                                    type="submit"
                                    disabled={processing || data.code.length < 6}
                                    className="w-full py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:bg-primary/90 hover:-translate-y-[2px] transition-all shadow-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                                >
                                    {processing ? 'Verifying...' : 'Verify & Continue'}
                                </button>
                            </form>
                        </div>
                    </main>
                </div>
            </div>
        </FrontendLayout>
    );
}
