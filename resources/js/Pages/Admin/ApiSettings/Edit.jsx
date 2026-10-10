import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Edit({ settings }) {
    const { data, setData, put, processing, recentlySuccessful } = useForm({
        // Master Good APIs Partner
        goodapi_api_key: settings.goodapi_api_key || 'ebee2f1362ef867dc06dee82f9bbef5d1780d7ba9218fe28f6f3217c386a52e1',
        goodapi_token_id: settings.goodapi_token_id || 'aad64221e95f917989f63acd377c94f9054c3d85378ae3f512e6b74e958a4b22',

        // 1. Aadhar To Farmer All State Pdf & Server 2
        farmer_card_pdf_url: settings.farmer_card_pdf_url || 'https://good-api-point.com/apis_partner/v1/farmer_card_api/farmer_card_pdf.php',
        farmer_pdf_server2_url: settings.farmer_pdf_server2_url || 'https://good-api-point.com/apis_partner/v1/farmer_card_api/farmer_pdf_server2.php',

        // 2. Telecom ID Intelligence
        id_intelligence_api_url: settings.id_intelligence_api_url || 'https://good-api-point.com/apis_partner/v1/telecom_api/id_intelligence.php',

        // 3. Aadhar To Mask PAN
        aadhar_to_mask_pan_api_url: settings.aadhar_to_mask_pan_api_url || 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_mask_pan.php',

        // 4. Aadhar to name
        aadhar_to_name_api_url: settings.aadhar_to_name_api_url || 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhar_to_name.php',

        // 5. Aadhar To Pan Unmasked Instant
        aadhar_to_pan_api_url: settings.aadhar_to_pan_api_url || 'https://good-api-point.com/apis_partner/v1/aadhar_card_api/aadhaar_to_unmasked_pan.php',

        // 6. Aadhar To Ration Find
        aadhar_to_ration_api_url: settings.aadhar_to_ration_api_url || 'https://good-api-point.com/apis_partner/v1/ration_card_api/uid_to_ration_no.php',

        // 7 & 8. Electricity Bills
        uhbvn_bill_url: settings.uhbvn_bill_url || 'https://uhbvn.org.in/Rapdrp/BD?UID=',
        dhbvn_bill_url: settings.dhbvn_bill_url || 'https://dhbvn.org.in/Rapdrp/BD?UID=',

        // 9. Learning Licence Download
        vahan_learning_licence_url: settings.vahan_learning_licence_url || 'https://good-api-point.com/apis_partner/v1/vahan_service_api/learning_license_pdf.php',

        // 10. Mobile To Pan No. Instant
        mobile_to_pan_api_url: settings.mobile_to_pan_api_url || 'https://good-api-point.com/apis_partner/v1/telecom_api/mobile_to_pan.php',

        // 11. PAN To Aadhaar Unmasked Instant
        pan_to_aadhar_api_url: settings.pan_to_aadhar_api_url || 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_aadhar.php',

        // 12. PAN To GST Number Instant
        pan_to_gst_api_url: settings.pan_to_gst_api_url || 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_gst.php',

        // 13. PAN To Mask Aadhar
        pan_to_mask_uid_api_url: settings.pan_to_mask_uid_api_url || 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_mask_uid.php',

        // 14. Pan To Uid Advance Instant
        pan_to_uid_api_url: settings.pan_to_uid_api_url || 'https://good-api-point.com/apis_partner/v1/pan_card_api/pan_to_uid_s1.php',

        // 15. Ration Details & Slips
        ration_advance_details_api_url: settings.ration_advance_details_api_url || 'https://good-api-point.com/apis_partner/v1/ration_card_api/up_ration_details.php',
        ration_sleep_photo_api_url: settings.ration_sleep_photo_api_url || 'https://good-api-point.com/apis_partner/v1/ration_card_api/bihar_ration_slip.php',
        ration_card_pdf_api_url: settings.ration_card_pdf_api_url || 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_card_pdf.php',
        ration_to_aadhar_all_state_api_url: settings.ration_to_aadhar_all_state_api_url || 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_to_uid_all.php',
        ration_to_aadhar_up_api_url: settings.ration_to_aadhar_up_api_url || 'https://good-api-point.com/apis_partner/v1/ration_card_api/ration_to_uid_up.php',

        // 16. Vehicle / Vahan
        vahan_rc_info_api_url: settings.vahan_rc_info_api_url || 'https://good-api-point.com/apis_partner/v1/vahan_service_api/rc_info_api.php',
        vahan_rc_pdf_url: settings.vahan_rc_pdf_url || 'https://good-api-point.com/apis_partner/v1/vahan_service_api/vechil_rc_pdf.php',
        vahan_rc_pdf2_url: settings.vahan_rc_pdf2_url || 'https://good-api-point.com/apis_partner/v1/vahan_service_api/vechil_rc_pdf2.php',
        vahan_challan_api_url: settings.vahan_challan_api_url || 'https://good-api-point.com/apis_partner/v1/vahan_service_api/challan_find.php',
        vehicle_details_api_url: settings.vehicle_details_api_url || 'https://good-api-point.com/apis_partner/v1/vahan_service_api/rc_info_api.php',

        // 17. Saral Portal
        saral_status_url: settings.saral_status_url || 'https://edisha.gov.in/eForms/Status',

        // 18. Voter Services
        voter_advance_api_url: settings.voter_advance_api_url || 'https://good-api-point.com/apis_partner/v1/voter_card_api/voter_advance.php',
        voter_mobile_update_url: settings.voter_mobile_update_url || 'https://good-api-point.com/apis_partner/v1/voter_card_api/voter_mobile_link.php',
        voter_name_find_url: settings.voter_name_find_url || 'https://good-api-point.com/apis_partner/v1/voter_card_api/voter_to_name.php',
    });

    const [activeTab, setActiveTab] = useState('master');

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/admin/api-settings');
    };

    return (
        <AdminLayout>
            <Head title="API Key & Gateway Settings" />

            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 bg-slate-50 min-h-screen text-slate-800">
                {/* Header */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-3xl text-indigo-600">vpn_key</span>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">API Key & Gateway Configuration</h1>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage API endpoints, keys, and partners. All changes take effect immediately across all services.
                        </p>
                    </div>
                    {recentlySuccessful && (
                        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            Settings Saved Successfully!
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
                    {[
                        { id: 'master', label: 'Good API Partner Master', icon: 'key' },
                        { id: 'vahan', label: 'RC & Vehicle APIs', icon: 'directions_car' },
                        { id: 'pan', label: 'PAN Card APIs', icon: 'badge' },
                        { id: 'aadhar', label: 'Aadhaar APIs', icon: 'fingerprint' },
                        { id: 'ration', label: 'Ration Card APIs', icon: 'receipt_long' },
                        { id: 'voter', label: 'Voter APIs', icon: 'how_to_vote' },
                        { id: 'utilities', label: 'Electricity & Saral', icon: 'electric_bolt' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* TAB: Master Good API Partner */}
                    {activeTab === 'master' && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-600">verified_user</span>
                                    Good-API-Point Master Authentication
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Used as the primary API key and Token ID across all connected services.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Good API Key
                                    </label>
                                    <input
                                        type="text"
                                        value={data.goodapi_api_key}
                                        onChange={(e) => setData('goodapi_api_key', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Good API Token ID
                                    </label>
                                    <input
                                        type="text"
                                        value={data.goodapi_token_id}
                                        onChange={(e) => setData('goodapi_token_id', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: RC & Vehicle APIs */}
                    {activeTab === 'vahan' && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-600">directions_car</span>
                                    Vehicle & Vahan API Endpoints
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        RC Card Info API URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.vahan_rc_info_api_url}
                                        onChange={(e) => setData('vahan_rc_info_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        RC PDF Owner Book Print URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.vahan_rc_pdf_url}
                                        onChange={(e) => setData('vahan_rc_pdf_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        RC PDF Server 2 URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.vahan_rc_pdf2_url}
                                        onChange={(e) => setData('vahan_rc_pdf2_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Vehicle Challan Check URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.vahan_challan_api_url}
                                        onChange={(e) => setData('vahan_challan_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Learning Licence Download URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.vahan_learning_licence_url}
                                        onChange={(e) => setData('vahan_learning_licence_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: PAN Card APIs */}
                    {activeTab === 'pan' && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-600">badge</span>
                                    PAN Card API Endpoints
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        PAN To Aadhaar Unmasked Instant URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.pan_to_aadhar_api_url}
                                        onChange={(e) => setData('pan_to_aadhar_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        PAN To GST Number Instant URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.pan_to_gst_api_url}
                                        onChange={(e) => setData('pan_to_gst_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        PAN To Mask Aadhar URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.pan_to_mask_uid_api_url}
                                        onChange={(e) => setData('pan_to_mask_uid_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        PAN To UID Advance Instant URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.pan_to_uid_api_url}
                                        onChange={(e) => setData('pan_to_uid_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Mobile To PAN Instant URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.mobile_to_pan_api_url}
                                        onChange={(e) => setData('mobile_to_pan_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: Aadhaar APIs */}
                    {activeTab === 'aadhar' && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600">fingerprint</span>
                                    Aadhaar & Telecom Verification Endpoints
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Aadhar To Farmer All State PDF URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.farmer_card_pdf_url}
                                        onChange={(e) => setData('farmer_card_pdf_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Farmer PDF Server 2 URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.farmer_pdf_server2_url}
                                        onChange={(e) => setData('farmer_pdf_server2_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Telecom ID Intelligence Verification URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.id_intelligence_api_url}
                                        onChange={(e) => setData('id_intelligence_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Aadhar To Mask PAN URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.aadhar_to_mask_pan_api_url}
                                        onChange={(e) => setData('aadhar_to_mask_pan_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Aadhar To Name URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.aadhar_to_name_api_url}
                                        onChange={(e) => setData('aadhar_to_name_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Aadhar To Pan Unmasked Instant URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.aadhar_to_pan_api_url}
                                        onChange={(e) => setData('aadhar_to_pan_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Aadhar To Ration Find URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.aadhar_to_ration_api_url}
                                        onChange={(e) => setData('aadhar_to_ration_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: Ration Card APIs */}
                    {activeTab === 'ration' && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-600">receipt_long</span>
                                    Ration Card API Endpoints
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Ration Advance Details (UP) URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.ration_advance_details_api_url}
                                        onChange={(e) => setData('ration_advance_details_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Ration Slip Photo (Bihar) URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.ration_sleep_photo_api_url}
                                        onChange={(e) => setData('ration_sleep_photo_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Ration Card PDF Download URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.ration_card_pdf_api_url}
                                        onChange={(e) => setData('ration_card_pdf_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Ration To Aadhaar Find (All State) URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.ration_to_aadhar_all_state_api_url}
                                        onChange={(e) => setData('ration_to_aadhar_all_state_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Ration To Aadhar Find (UP) URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.ration_to_aadhar_up_api_url}
                                        onChange={(e) => setData('ration_to_aadhar_up_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: Voter APIs */}
                    {activeTab === 'voter' && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-rose-600">how_to_vote</span>
                                    Voter Card API Endpoints
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Voter Advance Info URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.voter_advance_api_url}
                                        onChange={(e) => setData('voter_advance_api_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Voter Mobile Update Instant URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.voter_mobile_update_url}
                                        onChange={(e) => setData('voter_mobile_update_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Voter Name Find URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.voter_name_find_url}
                                        onChange={(e) => setData('voter_name_find_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: Electricity & Saral */}
                    {activeTab === 'utilities' && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500">electric_bolt</span>
                                    Utilities & Government Portal Endpoints
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        UHBVN Electricity Bill Base URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.uhbvn_bill_url}
                                        onChange={(e) => setData('uhbvn_bill_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        DHBVN Electricity Bill Base URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.dhbvn_bill_url}
                                        onChange={(e) => setData('dhbvn_bill_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Saral Certificate Status URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.saral_status_url}
                                        onChange={(e) => setData('saral_status_url', e.target.value)}
                                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-lg">save</span>
                            {processing ? 'Saving...' : 'Save API Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
