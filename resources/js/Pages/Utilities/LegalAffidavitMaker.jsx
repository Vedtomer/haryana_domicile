import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import CustomerWhatsAppModal from '../../Components/CustomerWhatsAppModal';

function numberToWordsINR(amount) {
    const num = parseInt(String(amount).replace(/[^0-9]/g, ''), 10);
    if (isNaN(num) || num === 0) return '';

    const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n) {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
        if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
        return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
    }

    return `Rupees ${inWords(num)} Only`;
}

export default function LegalAffidavitMaker() {
    const [activeTab, setActiveTab] = useState('vehicle'); // 'vehicle' | 'lost_doc' | 'character'
    const [stampMargin, setStampMargin] = useState(0); // 0 = plain paper, 4 = 4 inch, 5 = 5 inch
    const [showWatermark, setShowWatermark] = useState(false);
    const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);

    const todayDate = () => {
        const d = new Date();
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    // 1. Vehicle Agreement State
    const [vehicleData, setVehicleData] = useState({
        seller_name: '',
        seller_father: '',
        seller_address: '',
        seller_aadhar: '',
        seller_phone: '',
        buyer_name: '',
        buyer_father: '',
        buyer_address: '',
        buyer_aadhar: '',
        buyer_phone: '',
        reg_no: '',
        model: '',
        chassis_no: '',
        engine_no: '',
        sale_amount: '',
        sale_date: todayDate(),
        sale_time: '12:00 PM',
        place: '',
    });

    // 2. Lost Document State
    const [lostData, setLostData] = useState({
        name: '',
        father_name: '',
        address: '',
        age: '25',
        aadhar_no: '',
        phone: '',
        doc_type: 'Aadhaar Card (आधार कार्ड)',
        doc_number: '',
        loss_date: todayDate(),
        loss_place: '',
        place: '',
        date: todayDate(),
    });

    // 3. Character Certificate State
    const [charData, setCharData] = useState({
        name: '',
        father_name: '',
        address: '',
        police_station: '',
        district: '',
        aadhar_no: '',
        phone: '',
        purpose: 'सरकारी नौकरी / कॉलेज प्रवेश (Government Job / Admission)',
        place: '',
        date: todayDate(),
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600 text-2xl">gavel</span>
                            <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                                High-Demand Government Affidavits & Legal Forms
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                Ready to Print
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            वाहन बिक्री इकरारनामा, दस्तावेज गुमशुदगी शपथ पत्र, चरित्र प्रमाण पत्र हलफनामा (A4 & e-Stamp Paper)
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setWhatsAppModalOpen(true)}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-base">chat</span>
                            WhatsApp पर भेजें
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-base">print</span>
                            प्रिंट / Save PDF
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Government Affidavits & Agreements" />

            {/* Custom print CSS */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #affidavit-print-area, #affidavit-print-area * {
                        visibility: visible !important;
                    }
                    #affidavit-print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 20px !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    nav, header, aside, .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Form Tabs */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-2 print:hidden">
                    <button
                        type="button"
                        onClick={() => setActiveTab('vehicle')}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                            activeTab === 'vehicle'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">two_wheeler</span>
                        वाहन क्रय-विक्रय इकरारनामा (Vehicle Agreement)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('lost_doc')}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                            activeTab === 'lost_doc'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">find_in_page</span>
                        दस्तावेज गुमशुदगी शपथ पत्र (Lost Document)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('character')}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                            activeTab === 'character'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">verified_user</span>
                        चरित्र प्रमाण पत्र हलफनामा (Character Affidavit)
                    </button>
                </div>

                {/* Print Options Bar */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs print:hidden">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-blue-600 text-base">format_line_spacing</span>
                            स्टाम्प पेपर हेडर स्पेस (Top Margin for e-Stamp):
                        </span>
                        <div className="flex gap-2">
                            {[
                                { label: 'सादा A4 पेपर (0 Inch)', val: 0 },
                                { label: 'छोटा स्टाम्प (3 Inch)', val: 3 },
                                { label: 'मानक ई-स्टाम्प (5 Inch)', val: 5 },
                            ].map((opt) => (
                                <button
                                    key={opt.val}
                                    type="button"
                                    onClick={() => setStampMargin(opt.val)}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                        stampMargin === opt.val
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={showWatermark}
                            onChange={(e) => setShowWatermark(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Affidavit Watermark</span>
                    </label>
                </div>

                {/* Main Split View: Left Input Form + Right Live A4 Sheet */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Inputs */}
                    <div className="lg:col-span-5 space-y-4 print:hidden">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm max-h-[800px] overflow-y-auto">
                            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">edit_note</span>
                                विवरण भरें (Fill Details)
                            </h3>

                            {/* 1. Vehicle Agreement Inputs */}
                            {activeTab === 'vehicle' && (
                                <div className="space-y-4 text-xs">
                                    <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl space-y-2 border border-blue-100 dark:border-blue-900/50">
                                        <h4 className="font-extrabold text-blue-900 dark:text-blue-300">विक्रेता (Seller / 1st Party)</h4>
                                        <input
                                            type="text"
                                            placeholder="विक्रेता का नाम (Seller Name)"
                                            value={vehicleData.seller_name}
                                            onChange={(e) => setVehicleData({ ...vehicleData, seller_name: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                                        />
                                        <input
                                            type="text"
                                            placeholder="पिता का नाम (Father Name)"
                                            value={vehicleData.seller_father}
                                            onChange={(e) => setVehicleData({ ...vehicleData, seller_father: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        />
                                        <input
                                            type="text"
                                            placeholder="पूर्ण पता (Full Address)"
                                            value={vehicleData.seller_address}
                                            onChange={(e) => setVehicleData({ ...vehicleData, seller_address: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="आधार नं."
                                                value={vehicleData.seller_aadhar}
                                                onChange={(e) => setVehicleData({ ...vehicleData, seller_aadhar: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                            />
                                            <input
                                                type="text"
                                                placeholder="मोबाइल नं."
                                                value={vehicleData.seller_phone}
                                                onChange={(e) => setVehicleData({ ...vehicleData, seller_phone: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl space-y-2 border border-emerald-100 dark:border-emerald-900/50">
                                        <h4 className="font-extrabold text-emerald-900 dark:text-emerald-300">क्रेता (Buyer / 2nd Party)</h4>
                                        <input
                                            type="text"
                                            placeholder="क्रेता का नाम (Buyer Name)"
                                            value={vehicleData.buyer_name}
                                            onChange={(e) => setVehicleData({ ...vehicleData, buyer_name: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                                        />
                                        <input
                                            type="text"
                                            placeholder="पिता का नाम (Father Name)"
                                            value={vehicleData.buyer_father}
                                            onChange={(e) => setVehicleData({ ...vehicleData, buyer_father: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        />
                                        <input
                                            type="text"
                                            placeholder="पूर्ण पता (Full Address)"
                                            value={vehicleData.buyer_address}
                                            onChange={(e) => setVehicleData({ ...vehicleData, buyer_address: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="आधार नं."
                                                value={vehicleData.buyer_aadhar}
                                                onChange={(e) => setVehicleData({ ...vehicleData, buyer_aadhar: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                            />
                                            <input
                                                type="text"
                                                placeholder="मोबाइल नं."
                                                value={vehicleData.buyer_phone}
                                                onChange={(e) => setVehicleData({ ...vehicleData, buyer_phone: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl space-y-2 border border-amber-100 dark:border-amber-900/50">
                                        <h4 className="font-extrabold text-amber-900 dark:text-amber-300">वाहन एवं विक्रय विवरण</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="गाड़ी नंबर (e.g. HR26AB1234)"
                                                value={vehicleData.reg_no}
                                                onChange={(e) => setVehicleData({ ...vehicleData, reg_no: e.target.value.toUpperCase() })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold uppercase"
                                            />
                                            <input
                                                type="text"
                                                placeholder="मेक व मॉडल (e.g. Splendor Plus)"
                                                value={vehicleData.model}
                                                onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="चेसिस नंबर (Chassis No.)"
                                                value={vehicleData.chassis_no}
                                                onChange={(e) => setVehicleData({ ...vehicleData, chassis_no: e.target.value.toUpperCase() })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px]"
                                            />
                                            <input
                                                type="text"
                                                placeholder="इंजन नंबर (Engine No.)"
                                                value={vehicleData.engine_no}
                                                onChange={(e) => setVehicleData({ ...vehicleData, engine_no: e.target.value.toUpperCase() })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px]"
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <input
                                                type="number"
                                                placeholder="बिक्री मूल्य ₹"
                                                value={vehicleData.sale_amount}
                                                onChange={(e) => setVehicleData({ ...vehicleData, sale_amount: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                                            />
                                            <input
                                                type="text"
                                                placeholder="डिलीवरी समय"
                                                value={vehicleData.sale_time}
                                                onChange={(e) => setVehicleData({ ...vehicleData, sale_time: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                            />
                                            <input
                                                type="text"
                                                placeholder="स्थान (Place)"
                                                value={vehicleData.place}
                                                onChange={(e) => setVehicleData({ ...vehicleData, place: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. Lost Document Inputs */}
                            {activeTab === 'lost_doc' && (
                                <div className="space-y-3 text-xs">
                                    <input
                                        type="text"
                                        placeholder="शपथकर्ता का नाम (Name)"
                                        value={lostData.name}
                                        onChange={(e) => setLostData({ ...lostData, name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="पिता / पति का नाम"
                                            value={lostData.father_name}
                                            onChange={(e) => setLostData({ ...lostData, father_name: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        />
                                        <input
                                            type="number"
                                            placeholder="उम्र (Age in Years)"
                                            value={lostData.age}
                                            onChange={(e) => setLostData({ ...lostData, age: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="पूर्ण पता (Address)"
                                        value={lostData.address}
                                        onChange={(e) => setLostData({ ...lostData, address: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="आधार नंबर"
                                            value={lostData.aadhar_no}
                                            onChange={(e) => setLostData({ ...lostData, aadhar_no: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        />
                                        <input
                                            type="text"
                                            placeholder="मोबाइल नंबर"
                                            value={lostData.phone}
                                            onChange={(e) => setLostData({ ...lostData, phone: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            गुम हुआ दस्तावेज (Lost Document Type)
                                        </label>
                                        <select
                                            value={lostData.doc_type}
                                            onChange={(e) => setLostData({ ...lostData, doc_type: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                                        >
                                            <option value="Aadhaar Card (मूल आधार कार्ड)">मूल आधार कार्ड (Aadhaar Card)</option>
                                            <option value="PAN Card (मूल पैन कार्ड)">मूल पैन कार्ड (PAN Card)</option>
                                            <option value="10th Class Marksheet & Certificate (10वीं की अंकतालिका)">10वीं की अंकतालिका (10th Marksheet)</option>
                                            <option value="12th Class Marksheet & Certificate (12वीं की अंकतालिका)">12वीं की अंकतालिका (12th Marksheet)</option>
                                            <option value="Driving Licence (ड्राइविंग लाइसेंस)">ड्राइविंग लाइसेंस (Driving Licence)</option>
                                            <option value="Vehicle RC (गाड़ी की आर.सी.)">गाड़ी की आर.सी. (Vehicle RC)</option>
                                            <option value="Ration Card (राशन कार्ड)">राशन कार्ड (Ration Card)</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="दस्तावेज क्रमांक (Document No.)"
                                            value={lostData.doc_number}
                                            onChange={(e) => setLostData({ ...lostData, doc_number: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                                        />
                                        <input
                                            type="text"
                                            placeholder="गुम होने का स्थान (Place of Loss)"
                                            value={lostData.loss_place}
                                            onChange={(e) => setLostData({ ...lostData, loss_place: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* 3. Character Certificate Inputs */}
                            {activeTab === 'character' && (
                                <div className="space-y-3 text-xs">
                                    <input
                                        type="text"
                                        placeholder="शपथकर्ता का नाम (Name)"
                                        value={charData.name}
                                        onChange={(e) => setCharData({ ...charData, name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                                    />
                                    <input
                                        type="text"
                                        placeholder="पिता / पति का नाम"
                                        value={charData.father_name}
                                        onChange={(e) => setCharData({ ...charData, father_name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                    <input
                                        type="text"
                                        placeholder="पूर्ण पता (Address)"
                                        value={charData.address}
                                        onChange={(e) => setCharData({ ...charData, address: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="थाना (Police Station)"
                                            value={charData.police_station}
                                            onChange={(e) => setCharData({ ...charData, police_station: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                                        />
                                        <input
                                            type="text"
                                            placeholder="जिला (District)"
                                            value={charData.district}
                                            onChange={(e) => setCharData({ ...charData, district: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="आधार नंबर"
                                            value={charData.aadhar_no}
                                            onChange={(e) => setCharData({ ...charData, aadhar_no: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        />
                                        <input
                                            type="text"
                                            placeholder="मोबाइल नंबर"
                                            value={charData.phone}
                                            onChange={(e) => setCharData({ ...charData, phone: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            उद्देश्य / प्रयोजन (Purpose)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="प्रयोजन (Purpose)"
                                            value={charData.purpose}
                                            onChange={(e) => setCharData({ ...charData, purpose: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right A4 Printable Sheet */}
                    <div className="lg:col-span-7">
                        <div
                            id="affidavit-print-area"
                            className="bg-white text-black shadow-2xl rounded-2xl p-8 sm:p-12 mx-auto relative border border-slate-200"
                            style={{
                                width: '100%',
                                minHeight: '840px',
                                fontFamily: "'Tiro Devanagari Hindi', 'Nirmala UI', sans-serif",
                            }}
                        >
                            {/* Watermark */}
                            {showWatermark && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none rotate-[-35deg] text-6xl font-black">
                                    AFFIDAVIT
                                </div>
                            )}

                            {/* e-Stamp space */}
                            {stampMargin > 0 && (
                                <div
                                    style={{ height: `${stampMargin * 96}px` }}
                                    className="border-b-2 border-dashed border-slate-300 flex items-center justify-center mb-6 print:border-none"
                                >
                                    <span className="text-xs text-slate-400 print:hidden font-mono">
                                        [ {stampMargin} Inch Space Reserved for Non-Judicial / e-Stamp Paper ]
                                    </span>
                                </div>
                            )}

                            {/* 1. Vehicle Agreement Content */}
                            {activeTab === 'vehicle' && (
                                <div className="space-y-4 text-sm leading-relaxed text-slate-900">
                                    <div className="text-center pb-2 border-b-2 border-slate-800">
                                        <h2 className="text-xl font-black tracking-wide">वाहन क्रय-विक्रय इकरारनामा / शपथ पत्र</h2>
                                        <p className="text-xs font-semibold mt-1">समक्ष: श्रीमान कार्यपालक दंडाधिकारी / नोटरी पब्लिक महोदय</p>
                                    </div>

                                    <div className="text-justify space-y-3 pt-2">
                                        <p>
                                            मैं कि <strong>{vehicleData.seller_name || '_______________'}</strong>, सुपुत्र/सुपुत्री श्री <strong>{vehicleData.seller_father || '_______________'}</strong>, निवासी <strong>{vehicleData.seller_address || '_______________'}</strong>, आधार नं. <strong>{vehicleData.seller_aadhar || '____________'}</strong> (प्रथम पक्ष / विक्रेता)।
                                        </p>
                                        <p className="text-center font-bold text-xs uppercase tracking-widest my-1">
                                            --- बनाम (VS) ---
                                        </p>
                                        <p>
                                            श्री <strong>{vehicleData.buyer_name || '_______________'}</strong>, सुपुत्र/सुपुत्री श्री <strong>{vehicleData.buyer_father || '_______________'}</strong>, निवासी <strong>{vehicleData.buyer_address || '_______________'}</strong>, आधार नं. <strong>{vehicleData.buyer_aadhar || '____________'}</strong> (द्वितीय पक्ष / क्रेता)।
                                        </p>
                                        <p>
                                            यह कि प्रथम पक्ष अपने निजी वाहन का पूर्ण स्वामी व काबिज है, जिसका विवरण निम्न प्रकार है:
                                        </p>

                                        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 my-2 grid grid-cols-2 gap-2 text-xs">
                                            <div><strong>वाहन पंजीकरण सं. (Reg No.):</strong> {vehicleData.reg_no || '____________'}</div>
                                            <div><strong>मेक व मॉडल (Make/Model):</strong> {vehicleData.model || '____________'}</div>
                                            <div><strong>चेसिस नं. (Chassis No.):</strong> {vehicleData.chassis_no || '____________'}</div>
                                            <div><strong>इंजन नं. (Engine No.):</strong> {vehicleData.engine_no || '____________'}</div>
                                        </div>

                                        <ol className="list-decimal list-inside space-y-2 text-xs leading-normal">
                                            <li>
                                                यह कि प्रथम पक्ष ने अपने उक्त वाहन का समस्त स्वत्व द्वितीय पक्ष को कुल <strong>₹{vehicleData.sale_amount ? Number(vehicleData.sale_amount).toLocaleString('en-IN') : '________'}</strong> ({numberToWordsINR(vehicleData.sale_amount) || '________________'}) में पूर्ण रूप से बेच दिया है तथा संपूर्ण विक्रय राशि प्राप्त कर ली है।
                                            </li>
                                            <li>
                                                यह कि आज दिनांक <strong>{vehicleData.sale_date}</strong> समय <strong>{vehicleData.sale_time}</strong> को उक्त वाहन का वास्तविक भौतिक कब्जा व समस्त दस्तावेज द्वितीय पक्ष को सुपुर्द कर दिए गए हैं।
                                            </li>
                                            <li>
                                                यह कि आज दिनांक व समय के उपरांत उक्त वाहन से होने वाले किसी भी प्रकार के <strong>दुर्घटना (Accident), चालान, पुलिस केस, टैक्स या अन्य किसी भी कानूनी व वित्तीय दायित्व</strong> की पूर्ण जिम्मेदारी केवल द्वितीय पक्ष (क्रेता) की होगी।
                                            </li>
                                            <li>
                                                यह कि वाहन पर आज की तिथि से पूर्व का कोई भी बैंक ऋण, चालान अथवा देयता नहीं है। यदि कोई पूर्व का विवाद सामने आता है तो प्रथम पक्ष जिम्मेदार होगा।
                                            </li>
                                            <li>
                                                यह कि द्वितीय पक्ष उक्त वाहन को अपने नाम आरटीओ (RTO) कार्यालय से अविलंब ट्रांसफर करवाने हेतु अधिकृत व बाध्य होगा।
                                            </li>
                                        </ol>
                                    </div>

                                    {/* Signatures */}
                                    <div className="pt-10 grid grid-cols-2 gap-6 text-center text-xs">
                                        <div>
                                            <div className="border-t border-slate-600 pt-2 font-bold">
                                                हस्ताक्षर विक्रेता (1st Party)
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">{vehicleData.seller_name}</p>
                                        </div>
                                        <div>
                                            <div className="border-t border-slate-600 pt-2 font-bold">
                                                हस्ताक्षर क्रेता (2nd Party)
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">{vehicleData.buyer_name}</p>
                                        </div>
                                    </div>

                                    <div className="pt-6 grid grid-cols-2 gap-6 text-xs text-slate-600">
                                        <div>गवाह 1: _____________________</div>
                                        <div>गवाह 2: _____________________</div>
                                    </div>
                                </div>
                            )}

                            {/* 2. Lost Document Content */}
                            {activeTab === 'lost_doc' && (
                                <div className="space-y-4 text-sm leading-relaxed text-slate-900">
                                    <div className="text-center pb-2 border-b-2 border-slate-800">
                                        <h2 className="text-xl font-black tracking-wide">शपथ पत्र (दस्तावेज गुमशुदगी बाबत)</h2>
                                        <p className="text-xs font-semibold mt-1">समक्ष: श्रीमान कार्यपालक दंडाधिकारी / नोटरी पब्लिक महोदय</p>
                                    </div>

                                    <div className="text-justify space-y-3 pt-2 text-xs leading-normal">
                                        <p>
                                            मैं कि <strong>{lostData.name || '_______________'}</strong>, सुपुत्र/पत्नी श्री <strong>{lostData.father_name || '_______________'}</strong>, उम्र लगभग <strong>{lostData.age}</strong> वर्ष, निवासी <strong>{lostData.address || '_______________'}</strong>, आधार सं. <strong>{lostData.aadhar_no || '____________'}</strong>, निम्नलिखित कथन शपथपूर्वक बयान करता/करती हूँ:
                                        </p>

                                        <ol className="list-decimal list-inside space-y-2.5">
                                            <li>
                                                यह कि मैं उपरोक्त पते का/की मूल व स्थायी निवासी हूँ।
                                            </li>
                                            <li>
                                                यह कि मेरा मूल <strong>{lostData.doc_type}</strong> (क्रमांक: <strong>{lostData.doc_number || 'N/A'}</strong>) दिनांक <strong>{lostData.loss_date}</strong> को <strong>{lostData.loss_place || 'बाजार/यात्रा के दौरान'}</strong> अचानक कहीं गिरकर गुम हो गया है।
                                            </li>
                                            <li>
                                                यह कि मैंने उक्त दस्तावेज को अपने स्तर पर हरसंभव स्थान पर काफी तलाश किया परंतु वह कहीं प्राप्त नहीं हो सका है।
                                            </li>
                                            <li>
                                                यह कि उक्त दस्तावेज का किसी भी गैर-कानूनी गतिविधि, फर्जीवाड़े अथवा किसी बैंक/संस्था में बंधक (Pledge/Loan) के रूप में दुरुपयोग नहीं किया गया है।
                                            </li>
                                            <li>
                                                यह कि यदि भविष्य में मेरा उक्त मूल दस्तावेज मुझे पुनः प्राप्त होता है तो मैं उसे तुरंत संबंधित विभाग को समर्पित (Surrender) कर दूंगा/दूंगी।
                                            </li>
                                            <li>
                                                यह कि मुझे संबंधित विभाग से <strong>डुप्लीकेट दस्तावेज (Duplicate Copy)</strong> जारी करवाने हेतु इस शपथ पत्र की आवश्यकता है।
                                            </li>
                                        </ol>

                                        <div className="pt-4 pb-2 border-t border-slate-300">
                                            <p className="font-bold text-center underline text-xs">सत्यापन (Verification)</p>
                                            <p className="mt-2">
                                                मैं शपथकर्ता तस्दीक करता/करती हूँ कि उपरोक्त पैरा नं. 1 से 6 तक के सभी तथ्य मेरे निजी ज्ञान व विश्वास के अनुसार पूर्णतः सत्य व सही हैं, इसमें कोई भी तथ्य छुपाया नहीं गया है।
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-10 flex justify-between items-end text-xs">
                                        <div>
                                            <p>स्थान: <strong>{lostData.place || '_________________'}</strong></p>
                                            <p className="mt-1">दिनांक: <strong>{lostData.date}</strong></p>
                                        </div>
                                        <div className="text-center">
                                            <div className="border-t border-slate-600 pt-2 font-bold px-6">
                                                हस्ताक्षर शपथकर्ता
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">{lostData.name}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. Character Certificate Content */}
                            {activeTab === 'character' && (
                                <div className="space-y-4 text-sm leading-relaxed text-slate-900">
                                    <div className="text-center pb-2 border-b-2 border-slate-800">
                                        <h2 className="text-xl font-black tracking-wide">शपथ पत्र (चरित्र व आचरण सत्यापन बाबत)</h2>
                                        <p className="text-xs font-semibold mt-1">समक्ष: सक्षम प्राधिकारी / नोटरी पब्लिक महोदय</p>
                                    </div>

                                    <div className="text-justify space-y-3 pt-2 text-xs leading-normal">
                                        <p>
                                            मैं कि <strong>{charData.name || '_______________'}</strong>, सुपुत्र/सुपुत्री श्री <strong>{charData.father_name || '_______________'}</strong>, निवासी <strong>{charData.address || '_______________'}</strong>, थाना <strong>{charData.police_station || '_______________'}</strong>, जिला <strong>{charData.district || '_______________'}</strong>, आधार सं. <strong>{charData.aadhar_no || '____________'}</strong>, निम्नलिखित कथन शपथपूर्वक घोषित करता/करती हूँ:
                                        </p>

                                        <ol className="list-decimal list-inside space-y-2.5">
                                            <li>
                                                यह कि मैं भारत का सम्मानित नागरिक हूँ तथा उपरोक्त वर्णित पते पर विगत कई वर्षों से शांतिपूर्वक निवास कर रहा/रही हूँ।
                                            </li>
                                            <li>
                                                यह कि मेरा सामान्य आचरण व चरित्र सर्वथा उत्तम, निष्कलंक एवं विधि-सम्मत है।
                                            </li>
                                            <li>
                                                यह कि मेरे विरुद्ध भारत के किसी भी न्यायालय अथवा पुलिस थाने में कोई भी आपराधिक, अनैतिक अथवा शांतिभंग का मुकदमा दर्ज या विचाराधीन नहीं है।
                                            </li>
                                            <li>
                                                यह कि मुझे किसी भी सक्षम न्यायालय द्वारा किसी भी संज्ञेय अपराध में कभी भी दोषी या दंडित (Convicted) नहीं ठहराया गया है।
                                            </li>
                                            <li>
                                                यह कि मैं किसी भी राष्ट्रविरोधी, असंवैधानिक अथवा प्रतिबंधित संगठन का सदस्य नहीं हूँ और न ही ऐसी गतिविधियों में संलिप्त रहा हूँ।
                                            </li>
                                            <li>
                                                यह कि यह शपथ पत्र मैं अपने <strong>{charData.purpose}</strong> के प्रयोजनार्थ प्रस्तुत कर रहा/रही हूँ।
                                            </li>
                                        </ol>

                                        <div className="pt-4 pb-2 border-t border-slate-300">
                                            <p className="font-bold text-center underline text-xs">सत्यापन (Verification)</p>
                                            <p className="mt-2">
                                                मैं शपथकर्ता सत्यनिष्ठा से तस्दीक करता/करती हूँ कि उपरोक्त पैरा 1 से 6 तक के समस्त विवरण मेरे ज्ञान एवं विश्वास के अनुसार सत्य हैं।
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-10 flex justify-between items-end text-xs">
                                        <div>
                                            <p>स्थान: <strong>{charData.place || '_________________'}</strong></p>
                                            <p className="mt-1">दिनांक: <strong>{charData.date}</strong></p>
                                        </div>
                                        <div className="text-center">
                                            <div className="border-t border-slate-600 pt-2 font-bold px-6">
                                                हस्ताक्षर शपथकर्ता
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">{charData.name}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer WhatsApp Share Modal */}
            <CustomerWhatsAppModal
                isOpen={whatsAppModalOpen}
                onClose={() => setWhatsAppModalOpen(false)}
                defaultPhone={
                    activeTab === 'vehicle'
                        ? vehicleData.buyer_phone || vehicleData.seller_phone
                        : activeTab === 'lost_doc'
                        ? lostData.phone
                        : charData.phone
                }
                defaultCustomerName={
                    activeTab === 'vehicle'
                        ? vehicleData.buyer_name || vehicleData.seller_name
                        : activeTab === 'lost_doc'
                        ? lostData.name
                        : charData.name
                }
                documentTitle={
                    activeTab === 'vehicle'
                        ? `Vehicle Agreement (${vehicleData.reg_no || 'वाहन इकरारनामा'})`
                        : activeTab === 'lost_doc'
                        ? `Lost Document Affidavit (${lostData.doc_type})`
                        : 'Character Certificate Affidavit'
                }
                referenceNo={activeTab === 'vehicle' ? vehicleData.reg_no : ''}
            />
        </AdminLayout>
    );
}
