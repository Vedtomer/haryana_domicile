import React from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '../../Layouts/FrontendLayout';

export default function Home() {
    return (
        <FrontendLayout>
            <div className="bg-background min-h-screen">
                <Head>
                    <title>CertifyIndia - Digital Citizen Services</title>
                    <meta name="description" content="Your trusted portal for applying to citizen services, PAN cards, marriage forms, and domicile certificates." />
                </Head>

                {/* Hero Section */}
                <div className="relative pt-12 pb-20 sm:pt-20 sm:pb-24 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary-fixed/30 rounded-full blur-3xl opacity-70"></div>
                        <div className="absolute top-40 -left-20 w-[500px] h-[500px] bg-secondary-fixed/30 rounded-full blur-3xl opacity-60"></div>
                    </div>
                    
                    <div className="relative z-10 max-w-[1280px] mx-auto px-6 text-center mt-10">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-tertiary-fixed-dim/20 border border-tertiary-fixed text-tertiary-container font-label-md text-label-md mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-tertiary mr-2 animate-pulse"></span>
                            100% Secure Government Gateway
                        </div>
                        
                        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-8 leading-tight tracking-tight">
                            Digital Governance, <br className="hidden md:block" />
                            <span className="text-secondary">
                                Simplified & Secured
                            </span>
                        </h1>
                        
                        <p className="mt-4 max-w-2xl font-body-lg text-body-lg text-on-surface-variant mx-auto mb-10 leading-relaxed">
                            Your unified platform for PAN Cards, Marriage Registration, Haryana Domicile, and Birth Records. Get your essential documents with bank-grade security.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link 
                                href="/login" 
                                className="inline-flex items-center justify-center px-8 py-4 font-label-md text-label-md rounded-xl text-on-primary bg-primary hover:bg-primary/90 shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                Access Portal
                                <span className="material-symbols-outlined ml-2" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
                            </Link>
                            <a 
                                href="#services" 
                                className="inline-flex items-center justify-center px-8 py-4 font-label-md text-label-md rounded-xl text-secondary bg-surface border-2 border-outline-variant hover:border-secondary transition-all duration-300"
                            >
                                Explore Services
                            </a>
                        </div>
                    </div>
                </div>

                {/* Features/Services Section */}
                <div id="services" className="py-20 bg-surface-container-lowest relative z-10 border-t border-outline-variant">
                    <div className="max-w-[1280px] mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="font-headline-lg text-headline-lg text-primary">Core Services</h2>
                            <p className="mt-4 font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">We provide a comprehensive suite of digital services to streamline documentation.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                            {/* Service Card 1 */}
                            <div className="bg-surface rounded-2xl p-8 border border-outline-variant hover:shadow-xl hover:border-primary transition-all duration-300 group cursor-pointer">
                                <div className="w-14 h-14 bg-primary-fixed text-on-primary-fixed rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>id_card</span>
                                </div>
                                <h3 className="font-headline-md text-headline-md text-on-surface mb-3">PAN Services</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">Apply for a new PAN card or update details seamlessly with verified security.</p>
                            </div>
                            
                            {/* Service Card 2 */}
                            <div className="bg-surface rounded-2xl p-8 border border-outline-variant hover:shadow-xl hover:border-secondary transition-all duration-300 group cursor-pointer">
                                <div className="w-14 h-14 bg-secondary-fixed text-on-secondary-fixed rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                </div>
                                <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Marriage Reg</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">Streamline your marriage registration process with our easy digital forms.</p>
                            </div>

                            {/* Service Card 3 */}
                            <div className="bg-surface rounded-2xl p-8 border border-outline-variant hover:shadow-xl hover:border-tertiary transition-all duration-300 group cursor-pointer">
                                <div className="w-14 h-14 bg-tertiary-fixed text-on-tertiary-fixed rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_city</span>
                                </div>
                                <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Haryana Domicile</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">Fast-track resident certificates securely directly through our portal.</p>
                            </div>

                            {/* Service Card 4 */}
                            <div className="bg-surface rounded-2xl p-8 border border-outline-variant hover:shadow-xl hover:border-primary transition-all duration-300 group cursor-pointer">
                                <div className="w-14 h-14 bg-error-container text-on-error-container rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>child_care</span>
                                </div>
                                <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Birth Records</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">Register new births and generate official certificates with automated records.</p>
                            </div>
                            
                            {/* Service Card 5 */}
                            <Link href="/utilities/electricity-bill" className="bg-surface rounded-2xl p-8 border border-outline-variant hover:shadow-xl hover:border-amber-500 transition-all duration-300 group cursor-pointer block">
                                <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                                </div>
                                <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Electricity Bill</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">Instantly view and download your Haryana electricity bill securely for free.</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}
