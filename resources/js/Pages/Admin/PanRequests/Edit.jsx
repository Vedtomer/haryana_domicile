import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Edit({ panRequest, isAdmin }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        status: panRequest.status,
        admin_notes: panRequest.admin_notes || '',
        slip_document: null,
        final_pdf: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/admin/pan-requests/${panRequest.id}`);
    };

    const FileLink = ({ url, label }) => {
        if (!url) return <span className="text-gray-400 italic">Not provided</span>;
        return (
            <a href={`/storage/${url}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                View {label}
            </a>
        );
    };

    return (
        <AdminLayout>
            <Head title={`View PAN Request #${panRequest.id}`} />
            <div className="flex items-center mb-6">
                <Link href="/admin/pan-requests" className="text-gray-500 hover:text-gray-700 mr-4">&larr; Back</Link>
                <h2 className="text-2xl font-bold text-gray-800">
                    PAN Request #{panRequest.id} 
                    <span className={`ml-4 px-3 py-1 text-sm font-semibold rounded-full ${
                        panRequest.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        panRequest.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                        {panRequest.status.toUpperCase()}
                    </span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Applicant Details</h3>
                    <div className="space-y-3">
                        <p><strong className="text-gray-700">Name:</strong> {panRequest.name}</p>
                        <p><strong className="text-gray-700">Aadhar:</strong> {panRequest.aadhar_number}</p>
                        <p><strong className="text-gray-700">Mobile:</strong> {panRequest.mobile}</p>
                        <p><strong className="text-gray-700">UTR No:</strong> {panRequest.utr_number}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Uploaded Documents</h3>
                    <div className="space-y-3 flex flex-col">
                        <FileLink url={panRequest.photo} label="Photo" />
                        <FileLink url={panRequest.signature} label="Signature" />
                        <FileLink url={panRequest.aadhar_card_doc} label="Aadhar Document" />
                        <FileLink url={panRequest.additional_document} label="Additional Document" />
                    </div>
                </div>
            </div>

            {isAdmin ? (
                <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 space-y-6">
                    <h3 className="text-lg font-bold text-blue-600 border-b pb-2">Admin Panel (Update Status)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted (Done)</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Reason for Rejection)</label>
                            <textarea
                                value={data.admin_notes}
                                onChange={e => setData('admin_notes', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Acknowledgement Slip (PDF/Image)</label>
                            <input
                                type="file"
                                onChange={e => setData('slip_document', e.target.files[0])}
                                className="w-full"
                            />
                            {panRequest.slip_document && <div className="mt-2 text-sm text-green-600">Current slip: <FileLink url={panRequest.slip_document} label="Slip" /></div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Final PAN Card (PDF)</label>
                            <input
                                type="file"
                                onChange={e => setData('final_pdf', e.target.files[0])}
                                className="w-full"
                            />
                            {panRequest.final_pdf && <div className="mt-2 text-sm text-green-600">Current PAN: <FileLink url={panRequest.final_pdf} label="PAN" /></div>}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 text-right">
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700"
                        >
                            Update Application
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Application Progress</h3>
                    {panRequest.admin_notes && (
                        <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                            <strong>Admin Note:</strong> {panRequest.admin_notes}
                        </div>
                    )}
                    <div className="flex gap-4">
                        {panRequest.slip_document && <a href={`/storage/${panRequest.slip_document}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-100 text-blue-800 font-bold rounded">Download Acknowledgement Slip</a>}
                        {panRequest.final_pdf && <a href={`/storage/${panRequest.final_pdf}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-green-100 text-green-800 font-bold rounded">Download Final PAN Card</a>}
                    </div>
                    {!panRequest.slip_document && !panRequest.final_pdf && <p className="text-gray-500">No documents have been uploaded by the admin yet.</p>}
                </div>
            )}
        </AdminLayout>
    );
}
