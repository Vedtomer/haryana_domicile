import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import Form from './Form';

export default function Create({ auth }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        aadhar_number: '',
        name: '',
        c_o: '',
        house_no: '',
        street: '',
        landmark: '',
        locality: '',
        village_town: '',
        post_office: '',
        district: '',
        state: '',
        pin_code: '',
        dob: '',
        certifier_name: '',
        certifier_designation: '',
        certifier_address: '',
        certifier_contact: '',
    });

    const handleSubmit = (e, saveAndCreate = false) => {
        e.preventDefault();
        post(route('admin.aadhar-update.store', { save_and_create: saveAndCreate }));
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Aadhar Update Request</h2>}
        >
            <Head title="Create Aadhar Update Request" />

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
                            <form onSubmit={(e) => handleSubmit(e, false)}>
                                <Form data={data} setData={setData} errors={errors} />

                                <div className="mt-6 flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Save & Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, true)}
                                        disabled={processing}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                                    >
                                        Save & Create Another
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
