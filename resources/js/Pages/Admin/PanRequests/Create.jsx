import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        aadhar_number: '',
        mobile: '',
        utr_number: '',
        photo: null,
        signature: null,
        aadhar_card_doc: null,
        additional_document: null,
    });

    const submit = (e) => {
        e.preventDefault();
        // Since we have files, inertia post uses FormData automatically if a file is present.
        post('/admin/pan-requests');
    };

    const InputGroup = ({ label, name, type = "text", placeholder="", maxLength }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                value={type === 'file' ? undefined : data[name]}
                onChange={e => {
                    if (type === 'file') return setData(name, e.target.files[0]);
                    let val = e.target.value;
                    if (maxLength && val.length > maxLength) val = val.slice(0, maxLength);
                    setData(name, val);
                }}
                placeholder={placeholder}
                maxLength={type === 'number' ? undefined : maxLength}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors[name] && <div className="text-red-500 text-xs mt-1">{errors[name]}</div>}
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Create PAN Request" />
            <div className="flex items-center mb-6">
                <Link href="/admin/pan-requests" className="text-gray-500 hover:text-gray-700 mr-4">&larr; Back</Link>
                <h2 className="text-2xl font-bold text-gray-800">Apply for PAN Card</h2>
            </div>

            <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 space-y-8" encType="multipart/form-data">
                
                <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Applicant Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Applicant Name" name="name" />
                        <InputGroup label="Aadhar Number" name="aadhar_number" type="number" maxLength={12} />
                        <InputGroup label="Mobile Number" name="mobile" type="tel" maxLength={10} />
                        <InputGroup label="Payment UTR / Transaction ID" name="utr_number" />
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Document Uploads</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Applicant Photo (Image)" name="photo" type="file" />
                        <InputGroup label="Applicant Signature (Image)" name="signature" type="file" />
                        <InputGroup label="Aadhar Card Document (PDF/Image)" name="aadhar_card_doc" type="file" />
                        <InputGroup label="Additional Document (Optional)" name="additional_document" type="file" />
                    </div>
                </section>

                <div className="pt-6 border-t border-gray-200 flex items-center justify-end">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                    >
                        Submit Application
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
