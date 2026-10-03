import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

// Self-contained high-contrast vector SVG Barcode generator
function SvgBarcode({ value, height = 48, className = "" }) {
    const cleanVal = (value || 'CSP2610031234IN').toUpperCase();
    const bars = [];
    let x = 10;
    bars.push({ x, w: 2.5 }); x += 4;
    bars.push({ x, w: 1.5 }); x += 3;
    bars.push({ x, w: 3 }); x += 5;

    for (let i = 0; i < cleanVal.length; i++) {
        const charCode = cleanVal.charCodeAt(i);
        const w1 = (charCode % 3) + 1.5;
        const s1 = ((charCode * 3) % 3) + 1.5;
        const w2 = ((charCode * 7) % 3) + 1.5;
        const s2 = ((charCode * 5) % 3) + 1.5;
        const w3 = ((charCode * 11) % 4) + 1;
        const s3 = ((charCode * 13) % 3) + 1.5;

        bars.push({ x, w: w1 }); x += w1 + s1;
        bars.push({ x, w: w2 }); x += w2 + s2;
        bars.push({ x, w: w3 }); x += w3 + s3;
    }
    bars.push({ x, w: 3 }); x += 5;
    bars.push({ x, w: 1.5 }); x += 3;
    bars.push({ x, w: 2.5 }); x += 4;

    const totalWidth = x + 10;

    return (
        <svg viewBox={`0 0 ${totalWidth} ${height}`} className={className} preserveAspectRatio="none" style={{ width: '100%', height: `${height}px` }}>
            <rect width="100%" height="100%" fill="#ffffff" />
            {bars.map((bar, idx) => (
                <rect key={idx} x={bar.x} y={0} width={bar.w} height={height} fill="#090d16" />
            ))}
        </svg>
    );
}

// 6-digit PIN code boxes component
function PinBoxes({ pin = '' }) {
    const cleanPin = (pin || '').replace(/\D/g, '').padEnd(6, ' ').slice(0, 6);
    return (
        <div className="flex items-center gap-1.5 sm:gap-2">
            {cleanPin.split('').map((char, i) => (
                <div
                    key={i}
                    className="w-7 h-8 sm:w-8 sm:h-9 bg-white border-2 border-slate-900 rounded font-mono font-black text-base sm:text-lg flex items-center justify-center text-slate-900 shadow-sm"
                >
                    {char.trim()}
                </div>
            ))}
        </div>
    );
}

export default function CourierSlipMaker() {
    const todayStr = new Date().toISOString().split('T')[0];

    // Form State
    const [formData, setFormData] = useState({
        // Consignment info
        courier_type: 'SPEED_POST', // SPEED_POST, INDIA_POST, DTDC, BLUEDART, DELHIVERY, PRIVATE
        tracking_no: 'SP' + Math.floor(10000000 + Math.random() * 90000000) + 'IN',
        dispatch_date: todayStr,
        weight: '500 gm',
        contents: 'Urgent Documents / Certificates',
        payment_mode: 'PREPAID',
        declared_value: '₹ 500',
        priority_stamp: 'SPEED POST - URGENT',

        // TO / Receiver (Consignee) Details
        receiver_name: 'AMIT VERMA',
        receiver_phone: '9876543210',
        receiver_alt_phone: '9416012345',
        receiver_aadhaar: '4567 8901 2345',
        receiver_address: 'H.No. 142, Near Shiv Mandir, Ward No. 4, Old Bus Stand Road',
        receiver_city: 'Sirsa',
        receiver_district: 'Sirsa',
        receiver_state: 'Haryana',
        receiver_pincode: '125055',

        // FROM / Sender (Consignor) Details
        sender_firm: 'CSP JAANKARI / CYBER CAFE',
        sender_name: 'RAMESH CHAND SHARMA',
        sender_phone: '9991122334',
        sender_alt_phone: '',
        sender_aadhaar: '9876 5432 1098',
        sender_address: 'Shop No. 5, Main Market, Near Tehsil Complex',
        sender_city: 'Hisar',
        sender_district: 'Hisar',
        sender_state: 'Haryana',
        sender_pincode: '125001',
    });

    // Paper layout options: 'A3_LARGE', 'A3_DUAL', 'A4_SINGLE', 'A4_DUAL'
    const [paperSize, setPaperSize] = useState('A3_LARGE');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [slipGenerated, setSlipGenerated] = useState(false);
    const [coinsRemaining, setCoinsRemaining] = useState(null);

    // Auto-generate fresh tracking number
    const handleGenerateTracking = () => {
        let prefix = 'SP';
        if (formData.courier_type === 'DTDC') prefix = 'DT';
        else if (formData.courier_type === 'BLUEDART') prefix = 'BD';
        else if (formData.courier_type === 'DELHIVERY') prefix = 'DL';
        else if (formData.courier_type === 'INDIA_POST') prefix = 'RP';

        const randDigits = Math.floor(10000000 + Math.random() * 90000000);
        const newNo = `${prefix}${randDigits}IN`;
        setFormData((prev) => ({ ...prev, tracking_no: newNo }));
    };

    // Quick fill sample data
    const handleFillSample = () => {
        setFormData({
            courier_type: 'SPEED_POST',
            tracking_no: 'SP' + Math.floor(10000000 + Math.random() * 90000000) + 'IN',
            dispatch_date: todayStr,
            weight: '500 gm',
            contents: 'Original Marksheet & Govt Affidavit Documents',
            payment_mode: 'PREPAID',
            declared_value: '₹ 1,000',
            priority_stamp: 'SPEED POST - URGENT',

            receiver_name: 'SANJAY KUMAR S/O SHRI RAMESH KUMAR',
            receiver_phone: '9812345670',
            receiver_alt_phone: '9416554433',
            receiver_aadhaar: '5412 8963 1245',
            receiver_address: 'House No. 34-B, Gali No. 2, Near Hanuman Mandir, Sector 14',
            receiver_city: 'Karnal',
            receiver_district: 'Karnal',
            receiver_state: 'Haryana',
            receiver_pincode: '132001',

            sender_firm: 'CSP JAANKARI DIGITAL SEVA KENDRA',
            sender_name: 'VIKAS VERMA',
            sender_phone: '9998877665',
            sender_alt_phone: '9896011223',
            sender_aadhaar: '8956 2314 7890',
            sender_address: 'Shop No. 12, Tehsil Road, Near Post Office',
            sender_city: 'Rohtak',
            sender_district: 'Rohtak',
            sender_state: 'Haryana',
            sender_pincode: '124001',
        });
        setSuccessMsg('Sample demo data loaded successfully!');
        setTimeout(() => setSuccessMsg(null), 3500);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Generate and charge 5 coins
    const handleGenerateSlip = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const response = await axios.post('/utilities/courier-slip-maker/generate', {
                ...formData,
                paper_size: paperSize,
            });

            if (response.data.success) {
                setSlipGenerated(true);
                if (response.data.remaining_coins !== undefined) {
                    setCoinsRemaining(response.data.remaining_coins);
                }
                setSuccessMsg(`✓ Courier Slip saved & 5 Coins charged successfully! Opening print dialog...`);
                // Auto trigger print after brief delay
                setTimeout(() => {
                    window.print();
                }, 400);
            } else {
                setError(response.data.message || 'Failed to generate courier slip.');
            }
        } catch (err) {
            console.error('Courier Slip Error:', err);
            setError(err.response?.data?.message || 'Error occurred while generating slip. Please check your coin balance.');
        } finally {
            setLoading(false);
        }
    };

    // Trigger Print
    const handleDirectPrint = () => {
        window.print();
    };

    // Dynamic QR Code data string containing all key postal details
    const qrData = `TO: ${formData.receiver_name} | PH: ${formData.receiver_phone} | PIN: ${formData.receiver_pincode} | ADDR: ${formData.receiver_address}, ${formData.receiver_city}, ${formData.receiver_state} | FROM: ${formData.sender_name} (${formData.sender_firm}) | TRACK: ${formData.tracking_no}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=2&data=${encodeURIComponent(qrData)}`;

    // Get courier badge info
    const getCourierBadge = () => {
        switch (formData.courier_type) {
            case 'SPEED_POST':
                return { name: 'INDIA POST - SPEED POST', sub: 'भारतीय डाक - त्वरित डाक सेवा', color: 'bg-red-700 text-white' };
            case 'INDIA_POST':
                return { name: 'INDIA POST - REGISTERED PARCEL', sub: 'भारतीय डाक - पंजीकृत पार्सल', color: 'bg-red-800 text-white' };
            case 'DTDC':
                return { name: 'DTDC EXPRESS COURIER', sub: 'Premier Cargo & Express Logistics', color: 'bg-blue-800 text-white' };
            case 'BLUEDART':
                return { name: 'BLUE DART EXPRESS', sub: 'Domestic & International Logistics', color: 'bg-blue-900 text-white' };
            case 'DELHIVERY':
                return { name: 'DELHIVERY SURFACE & AIR', sub: 'Supply Chain & E-Commerce Logistics', color: 'bg-slate-900 text-white' };
            default:
                return { name: 'EXPRESS COURIER & PARCEL DISPATCH', sub: 'Priority Fast Delivery Service', color: 'bg-slate-900 text-white' };
        }
    };

    const courierBadge = getCourierBadge();

    // Render single courier slip card
    const renderSlip = (isOfficeCopy = false, isCompact = false) => {
        return (
            <div className={`courier-slip-box bg-white text-slate-900 border-4 border-slate-900 shadow-xl overflow-hidden rounded-lg font-sans relative ${isCompact ? 'p-3.5 text-xs' : 'p-5 sm:p-6 text-sm'}`}>
                {/* Diagonal / Corner Watermark or Stamp */}
                {formData.priority_stamp && (
                    <div className="absolute right-4 top-16 sm:top-20 z-10 pointer-events-none opacity-85 rotate-[-8deg]">
                        <div className="border-4 border-red-700 text-red-700 font-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm tracking-wider uppercase shadow-sm bg-white/90">
                            ★ {formData.priority_stamp} ★
                        </div>
                    </div>
                )}

                {/* Top Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-4 border-slate-900 pb-3 gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`${courierBadge.color} px-3 py-2 rounded font-black tracking-wider text-xs sm:text-sm flex flex-col justify-center leading-tight uppercase`}>
                            <span>{courierBadge.name}</span>
                            <span className="text-[10px] font-medium opacity-90">{courierBadge.sub}</span>
                        </div>
                        {isOfficeCopy && (
                            <div className="bg-amber-100 text-amber-900 border-2 border-amber-800 px-2.5 py-1 rounded font-black text-xs uppercase tracking-wider">
                                [ OFFICE / SENDER COPY ]
                            </div>
                        )}
                    </div>

                    <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">Consignment / Article No:</div>
                        <div className="font-mono font-black text-base sm:text-xl tracking-widest text-slate-950">
                            {formData.tracking_no || 'CSP2610031234IN'}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-600">
                            Date: <span className="font-bold text-slate-900">{formData.dispatch_date}</span>
                        </div>
                    </div>
                </div>

                {/* Barcode & Routing Strip */}
                <div className="bg-slate-100/90 border-b-2 border-slate-900 py-2 px-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="w-full sm:w-64 max-w-full">
                        <SvgBarcode value={formData.tracking_no} height={38} />
                        <div className="text-center font-mono font-bold text-[10px] tracking-widest text-slate-700">
                            *{formData.tracking_no || 'CSP2610031234IN'}*
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-bold text-slate-800">
                        <div className="bg-white border border-slate-400 px-2.5 py-1 rounded">
                            <span className="text-slate-500 font-medium">WEIGHT:</span> {formData.weight || '500 gm'}
                        </div>
                        <div className="bg-white border border-slate-400 px-2.5 py-1 rounded">
                            <span className="text-slate-500 font-medium">MODE:</span>{' '}
                            <span className="text-emerald-700 font-extrabold">{formData.payment_mode || 'PREPAID'}</span>
                        </div>
                        {formData.declared_value && (
                            <div className="bg-white border border-slate-400 px-2.5 py-1 rounded">
                                <span className="text-slate-500 font-medium">VALUE:</span> {formData.declared_value}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content: TO (Delivery) & FROM (Sender) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-b-4 border-slate-900">
                    {/* TO / Consignee / Delivery Address - 7 Columns (Prominent!) */}
                    <div className="md:col-span-7 p-4 sm:p-5 bg-amber-50/40 border-b-2 md:border-b-0 md:border-r-4 border-slate-900 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1.5 mb-2.5">
                                <span className="bg-slate-900 text-white font-black px-2.5 py-0.5 rounded text-xs uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                                    TO / सेवा में (DELIVER TO)
                                </span>
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                                    * Urgent Delivery
                                </span>
                            </div>

                            {/* Receiver Name */}
                            <div className="text-lg sm:text-2xl font-black text-slate-950 uppercase tracking-tight leading-tight">
                                {formData.receiver_name || 'RECEIVER FULL NAME'}
                            </div>

                            {/* Phone Numbers */}
                            <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold">
                                <div className="flex items-center gap-1 bg-white border border-slate-800 px-2 py-0.5 rounded text-slate-950">
                                    <span>📞 Mobile:</span>
                                    <span className="font-mono font-black text-emerald-800 text-sm sm:text-base">
                                        {formData.receiver_phone || 'XXXXXXXXXX'}
                                    </span>
                                </div>
                                {formData.receiver_alt_phone && (
                                    <div className="flex items-center gap-1 bg-white border border-slate-400 px-2 py-0.5 rounded text-slate-700 text-xs">
                                        <span>Alt:</span>
                                        <span className="font-mono font-bold">{formData.receiver_alt_phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Aadhaar Number */}
                            {formData.receiver_aadhaar && (
                                <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-300 text-blue-900 px-2.5 py-0.5 rounded font-mono font-bold text-xs">
                                    <span>🆔 Aadhaar No:</span>
                                    <span>{formData.receiver_aadhaar}</span>
                                </div>
                            )}

                            {/* Full Address */}
                            <div className="mt-3 text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                                <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Address:</div>
                                <div className="text-slate-950 font-bold">
                                    {formData.receiver_address || 'Complete Street, Colony, Village & Landmark'}
                                </div>
                                <div className="mt-1 text-slate-900 font-bold">
                                    {[formData.receiver_city, formData.receiver_district, formData.receiver_state].filter(Boolean).join(', ')}
                                </div>
                            </div>
                        </div>

                        {/* PIN CODE Boxes */}
                        <div className="mt-4 pt-3 border-t-2 border-dashed border-slate-400 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <div className="text-[10px] font-black uppercase text-slate-600 tracking-wider">
                                    DELIVERY PIN CODE:
                                </div>
                                <PinBoxes pin={formData.receiver_pincode} />
                            </div>
                            <div className="text-right text-[11px] font-bold text-slate-600">
                                STATE: <span className="text-slate-950 uppercase">{formData.receiver_state || 'HARYANA'}</span>
                            </div>
                        </div>
                    </div>

                    {/* FROM / Consignor / Sender Address - 5 Columns */}
                    <div className="md:col-span-5 p-4 sm:p-5 bg-slate-50 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1.5 mb-2.5">
                                <span className="bg-slate-700 text-white font-black px-2.5 py-0.5 rounded text-xs uppercase tracking-wider flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">home_pin</span>
                                    FROM / प्रेषक (SENDER)
                                </span>
                            </div>

                            {formData.sender_firm && (
                                <div className="text-xs sm:text-sm font-extrabold text-indigo-900 uppercase">
                                    {formData.sender_firm}
                                </div>
                            )}

                            <div className="text-sm sm:text-base font-black text-slate-900 uppercase">
                                {formData.sender_name || 'SENDER FULL NAME'}
                            </div>

                            <div className="mt-1 text-xs font-bold text-slate-800">
                                <span>📞 Mobile: </span>
                                <span className="font-mono font-bold text-slate-900">
                                    {formData.sender_phone || 'XXXXXXXXXX'}
                                </span>
                                {formData.sender_alt_phone && (
                                    <span className="text-slate-600">, {formData.sender_alt_phone}</span>
                                )}
                            </div>

                            {formData.sender_aadhaar && (
                                <div className="mt-1 text-[11px] font-mono font-semibold text-slate-700">
                                    🆔 Aadhaar: {formData.sender_aadhaar}
                                </div>
                            )}

                            <div className="mt-2 text-xs text-slate-700 font-medium leading-normal">
                                <div>{formData.sender_address || 'Sender Shop / House Address'}</div>
                                <div className="font-bold text-slate-900">
                                    {[formData.sender_city, formData.sender_district, formData.sender_state].filter(Boolean).join(', ')}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-2 border-t border-slate-300">
                            <div className="text-[10px] font-bold text-slate-500 uppercase">SENDER PIN CODE:</div>
                            <div className="font-mono font-black text-base text-slate-900">
                                {formData.sender_pincode || '125001'}
                            </div>
                            <div className="text-[9px] text-red-600 font-bold mt-1">
                                ⚠️ If undelivered, please return to sender address.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section: QR Code, Declaration & Signatures */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                        <img
                            src={qrUrl}
                            alt="Courier Routing QR"
                            className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-slate-900 rounded p-0.5 bg-white shadow-sm shrink-0"
                        />
                        <div className="text-[10px] text-slate-600 leading-snug">
                            <div className="font-bold text-slate-800 uppercase">PARCEL CONTENTS:</div>
                            <div className="font-semibold text-slate-900">{formData.contents || 'Documents / Goods'}</div>
                            <div className="mt-1 text-[9px] text-slate-500">
                                Scan QR code with any mobile camera for instant delivery routing & address verification.
                            </div>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end justify-end shrink-0">
                        <div className="w-36 sm:w-44 border-b-2 border-slate-900 mb-1 h-8"></div>
                        <div className="text-[10px] font-black uppercase text-slate-800">
                            Authorized Signatory / Sender Signature
                        </div>
                        <div className="text-[9px] text-slate-500">(हस्ताक्षर प्रेषक / अधिकृत हस्ताक्षर)</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300">
                                📦 Manual Dispatch Service
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Cost: 5 Coins (₹5)
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white leading-tight mt-1">
                            Courier & Parcel Slip Maker (A3 / A4 Print)
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Generate professional courier dispatch labels, speed post slips with Aadhaar, Barcode & QR Code
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleFillSample}
                            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-base">auto_fix_high</span>
                            Demo Data
                        </button>

                        <button
                            type="button"
                            onClick={handleDirectPrint}
                            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-lg">print</span>
                            Print Slip ({paperSize.replace('_', ' ')})
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Courier & Parcel Slip Maker - A3 / A4 Print Label" />

            {/* Custom Print Stylesheet for A3 and A4 */}
            <style>{`
                @media print {
                    @page {
                        size: ${paperSize.startsWith('A3') ? 'A3 portrait' : 'A4 portrait'};
                        margin: 8mm;
                    }
                    body {
                        background: #ffffff !important;
                        color: #000000 !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #courier-print-area, #courier-print-area * {
                        visibility: visible !important;
                    }
                    #courier-print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="max-w-7xl mx-auto mt-6 px-4 pb-16">
                {/* Notification Alerts */}
                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <span>{error}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                        <span>{successMsg}</span>
                        {coinsRemaining !== null && (
                            <span className="ml-auto font-bold text-xs bg-emerald-100 text-emerald-900 px-2 py-1 rounded">
                                Remaining: {coinsRemaining} Coins
                            </span>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Data Entry Form */}
                    <div className="lg:col-span-5 space-y-6 no-print">
                        {/* Paper Size / Print Layout Selector */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base text-amber-500">description</span>
                                    Select Print Paper Size:
                                </label>
                                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                    {paperSize.startsWith('A3') ? '★ A3 Full Sheet Mode' : 'Standard A4 Mode'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaperSize('A3_LARGE')}
                                    className={`px-3 py-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                                        paperSize === 'A3_LARGE'
                                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-300 ring-2 ring-amber-400/30'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="font-extrabold flex items-center gap-1">
                                        <span className="text-amber-600">📄 A3 Large Label</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">Big Box Shipping Poster</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaperSize('A3_DUAL')}
                                    className={`px-3 py-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                                        paperSize === 'A3_DUAL'
                                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-300 ring-2 ring-amber-400/30'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="font-extrabold flex items-center gap-1">
                                        <span className="text-amber-600">📋 A3 Dual Copy</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">Parcel + Office Receipt</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaperSize('A4_SINGLE')}
                                    className={`px-3 py-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                                        paperSize === 'A4_SINGLE'
                                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-300 ring-2 ring-amber-400/30'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="font-extrabold flex items-center gap-1">
                                        <span className="text-blue-600">📄 A4 Standard</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">Single A4 Parcel Slip</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaperSize('A4_DUAL')}
                                    className={`px-3 py-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                                        paperSize === 'A4_DUAL'
                                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-300 ring-2 ring-amber-400/30'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="font-extrabold flex items-center gap-1">
                                        <span className="text-blue-600">📋 A4 Dual Copy</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">2 Slips on 1 A4 Sheet</div>
                                </button>
                            </div>
                        </div>

                        {/* FORM: Details Inputs */}
                        <form onSubmit={handleGenerateSlip} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
                            {/* Courier & Tracking Section */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base">local_shipping</span>
                                    1. Courier & Dispatch Service
                                </h3>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Courier Company / Type:
                                        </label>
                                        <select
                                            name="courier_type"
                                            value={formData.courier_type}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="SPEED_POST">India Post - Speed Post (त्वरित डाक)</option>
                                            <option value="INDIA_POST">India Post - Registered Parcel (पंजीकृत पार्सल)</option>
                                            <option value="DTDC">DTDC Express Courier</option>
                                            <option value="BLUEDART">Blue Dart Express</option>
                                            <option value="DELHIVERY">Delhivery Surface / Air</option>
                                            <option value="PRIVATE">Private Courier / By Hand Transport</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    Tracking / Ref No:
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={handleGenerateTracking}
                                                    className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                                >
                                                    ⚡ New
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                name="tracking_no"
                                                value={formData.tracking_no}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase"
                                                placeholder="SP12345678IN"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Dispatch Date:
                                            </label>
                                            <input
                                                type="date"
                                                name="dispatch_date"
                                                value={formData.dispatch_date}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                                Weight:
                                            </label>
                                            <input
                                                type="text"
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium"
                                                placeholder="500 gm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                                Payment:
                                            </label>
                                            <select
                                                name="payment_mode"
                                                value={formData.payment_mode}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-bold"
                                            >
                                                <option value="PREPAID">PREPAID</option>
                                                <option value="COD">C.O.D.</option>
                                                <option value="TO-PAY">TO-PAY</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                                Priority Stamp:
                                            </label>
                                            <select
                                                name="priority_stamp"
                                                value={formData.priority_stamp}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white font-bold"
                                            >
                                                <option value="SPEED POST - URGENT">SPEED POST</option>
                                                <option value="DOCUMENTS ONLY">DOCUMENTS ONLY</option>
                                                <option value="FRAGILE - HANDLE WITH CARE">FRAGILE</option>
                                                <option value="DO NOT BEND">DO NOT BEND</option>
                                                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Contents Description:
                                        </label>
                                        <input
                                            type="text"
                                            name="contents"
                                            value={formData.contents}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                                            placeholder="Urgent Documents / Certificates / Legal Notice"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: TO / Receiver (Consignee) Details */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base">pin_drop</span>
                                    2. Receiver / Delivery Details (TO - पाने वाला)
                                </h3>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Receiver Full Name (पाने वाले का नाम): *
                                        </label>
                                        <input
                                            type="text"
                                            name="receiver_name"
                                            required
                                            value={formData.receiver_name}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase"
                                            placeholder="NAME OF RECEIVER"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Mobile No (मोबाइल): *
                                            </label>
                                            <input
                                                type="text"
                                                name="receiver_phone"
                                                required
                                                value={formData.receiver_phone}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                                                placeholder="9876543210"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Alternate Mobile (वैकल्पिक):
                                            </label>
                                            <input
                                                type="text"
                                                name="receiver_alt_phone"
                                                value={formData.receiver_alt_phone}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                                                placeholder="9416012345"
                                            />
                                        </div>
                                    </div>

                                    {/* Aadhaar Number field */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Receiver Aadhaar Number (आधार नंबर):
                                        </label>
                                        <input
                                            type="text"
                                            name="receiver_aadhaar"
                                            value={formData.receiver_aadhaar}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                                            placeholder="XXXX XXXX 1234"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Complete Address (मकान नं, गली, लैंडमार्क): *
                                        </label>
                                        <textarea
                                            name="receiver_address"
                                            required
                                            rows={2}
                                            value={formData.receiver_address}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                                            placeholder="House No, Ward, Street/Gali, Near Landmark..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                                City / Tehsil:
                                            </label>
                                            <input
                                                type="text"
                                                name="receiver_city"
                                                value={formData.receiver_city}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-semibold"
                                                placeholder="Sirsa"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                                District / State:
                                            </label>
                                            <input
                                                type="text"
                                                name="receiver_district"
                                                value={formData.receiver_district}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-semibold"
                                                placeholder="Sirsa, HR"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-black text-amber-700 dark:text-amber-400 mb-1">
                                                PIN Code: *
                                            </label>
                                            <input
                                                type="text"
                                                name="receiver_pincode"
                                                required
                                                maxLength={6}
                                                value={formData.receiver_pincode}
                                                onChange={handleChange}
                                                className="w-full bg-amber-50 dark:bg-amber-950/40 border border-amber-400 rounded-xl px-2.5 py-1.5 text-xs font-mono font-black text-slate-900 dark:text-white"
                                                placeholder="125055"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: FROM / Sender (Consignor) Details */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base">storefront</span>
                                    3. Sender Details (FROM - प्रेषक)
                                </h3>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Shop / Firm Name (दुकान/फर्म):
                                            </label>
                                            <input
                                                type="text"
                                                name="sender_firm"
                                                value={formData.sender_firm}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white uppercase"
                                                placeholder="CSP JAANKARI"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Sender Name (भेजने वाला): *
                                            </label>
                                            <input
                                                type="text"
                                                name="sender_name"
                                                required
                                                value={formData.sender_name}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white uppercase"
                                                placeholder="RAMESH CHAND"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Mobile No: *
                                            </label>
                                            <input
                                                type="text"
                                                name="sender_phone"
                                                required
                                                value={formData.sender_phone}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                                                placeholder="9991122334"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Sender Aadhaar:
                                            </label>
                                            <input
                                                type="text"
                                                name="sender_aadhaar"
                                                value={formData.sender_aadhaar}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                                                placeholder="XXXX XXXX 5678"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Sender Return Address: *
                                        </label>
                                        <input
                                            type="text"
                                            name="sender_address"
                                            required
                                            value={formData.sender_address}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                                            placeholder="Shop No. 5, Main Market, Sirsa, Haryana"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                                City / District:
                                            </label>
                                            <input
                                                type="text"
                                                name="sender_city"
                                                value={formData.sender_city}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                                                placeholder="Hisar"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                                PIN Code:
                                            </label>
                                            <input
                                                type="text"
                                                name="sender_pincode"
                                                maxLength={6}
                                                value={formData.sender_pincode}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                                                placeholder="125001"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit & Generate Action Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-black rounded-xl text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">refresh</span>
                                            <span>Processing (5 Coins)...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">receipt_long</span>
                                            <span>Generate & Print Courier Slip (5 Coins)</span>
                                        </>
                                    )}
                                </button>
                                <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                    ⚡ Charges: <b>5 Coins (₹5)</b> will be deducted on generation. (Super Admins Free)
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: Live Print Preview */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-6">
                            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800 no-print">
                                <div>
                                    <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Live Courier Slip Preview
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Exact print layout for <b>{paperSize.replace('_', ' ')}</b>
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDirectPrint}
                                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                                    >
                                        <span className="material-symbols-outlined text-base">print</span>
                                        Print Now
                                    </button>
                                </div>
                            </div>

                            {/* PRINT CONTAINER (Only this block is shown during print) */}
                            <div id="courier-print-area" className="space-y-6">
                                {paperSize === 'A3_LARGE' && (
                                    <div className="a3-large-container">
                                        {renderSlip(false, false)}
                                    </div>
                                )}

                                {paperSize === 'A3_DUAL' && (
                                    <div className="space-y-6">
                                        {/* Parcel Box Copy */}
                                        <div>
                                            <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 text-center no-print">
                                                ✂️ COPY 1: PARCEL BOX PASTE LABEL (A3)
                                            </div>
                                            {renderSlip(false, false)}
                                        </div>

                                        {/* Dotted Cut Line */}
                                        <div className="border-t-2 border-dashed border-slate-400 my-4 relative flex items-center justify-center">
                                            <span className="bg-white px-3 text-[10px] font-mono font-bold text-slate-500 tracking-wider">
                                                ✂️ CUT HERE / कैंची से यहाँ से काटें ✂️
                                            </span>
                                        </div>

                                        {/* Office Copy */}
                                        <div>
                                            <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 text-center no-print">
                                                📋 COPY 2: OFFICE & SENDER BOOKING RECEIPT (A3)
                                            </div>
                                            {renderSlip(true, false)}
                                        </div>
                                    </div>
                                )}

                                {paperSize === 'A4_SINGLE' && (
                                    <div className="a4-single-container">
                                        {renderSlip(false, false)}
                                    </div>
                                )}

                                {paperSize === 'A4_DUAL' && (
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center no-print">
                                                ✂️ SLIP 1: PARCEL PASTE COPY (A4)
                                            </div>
                                            {renderSlip(false, true)}
                                        </div>

                                        <div className="border-t-2 border-dashed border-slate-400 my-2 relative flex items-center justify-center">
                                            <span className="bg-white px-2 text-[9px] font-mono font-bold text-slate-500">
                                                ✂️ CUT HERE ✂️
                                            </span>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center no-print">
                                                📋 SLIP 2: OFFICE RECEIPT (A4)
                                            </div>
                                            {renderSlip(true, true)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Helpful Tips Box */}
                            <div className="mt-6 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-2 no-print">
                                <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base">help</span>
                                    Printing & Pasting Instructions for Cyber Cafes:
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                                    <li>
                                        For <b>A3 Page Print</b>, select <b>A3 Large Label</b> or <b>A3 Dual Copy</b> above, then in print preview choose Paper size <b>A3</b>.
                                    </li>
                                    <li>
                                        For standard desktop printers, choose <b>A4 Standard</b> or <b>A4 Dual Copy</b>.
                                    </li>
                                    <li>
                                        In browser print dialog, set <b>Margins to Minimum / None</b> and enable <b>Background Graphics</b> for sharp borders and badges.
                                    </li>
                                    <li>
                                        The QR code and Barcode are 100% scannable by postmen and courier delivery agents with any mobile camera or barcode scanner.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
