import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import Form from './Form';

export default function Edit({ auth, record }) {
    const { flash } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        aadhar_number: record.aadhar_number || '',
        name: record.name || '',
        c_o: record.c_o || '',
        house_no: record.house_no || '',
        street: record.street || '',
        landmark: record.landmark || '',
        locality: record.locality || '',
        village_town: record.village_town || '',
        post_office: record.post_office || '',
        district: record.district || '',
        state: record.state || '',
        pin_code: record.pin_code || '',
        dob: record.dob || '',
        certifier_name: record.certifier_name || '',
        certifier_designation: record.certifier_designation || '',
        certifier_address: record.certifier_address || '',
        certifier_contact: record.certifier_contact || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.aadhar-update.update', record.id));
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Aadhar Update Request #{record.id}</h2>}
        >
            <Head title="Edit Aadhar Update Request" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {flash.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {flash.error}
                        </div>
                    )}
                    
                    {flash.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {flash.success}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit}>
                                <Form data={data} setData={setData} errors={errors} />

                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Update Record
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
