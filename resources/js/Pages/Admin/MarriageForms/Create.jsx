import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        marriage_date: '',
        marriage_venue: '',
        groom_name: '',
        groom_father_name: '',
        groom_age: '',
        groom_address: '',
        bride_name: '',
        bride_father_name: '',
        bride_age: '',
        bride_address: '',
        groom_witness_name: '',
        groom_witness_father_name: '',
        groom_witness_address: '',
        bride_witness_name: '',
        bride_witness_father_name: '',
        bride_witness_address: '',
        pandit_name: '',
        pandit_father_name: '',
        pandit_address: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/marriage-forms');
    };

    const InputGroup = ({ label, name, type = "text" }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                value={data[name]}
                onChange={e => setData(name, e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
            />
            {errors[name] && <div className="text-red-500 text-xs mt-1">{errors[name]}</div>}
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Create Marriage Form" />
            <div className="flex items-center mb-6">
                <Link href="/admin/marriage-forms" className="text-gray-500 hover:text-gray-700 mr-4">&larr; Back</Link>
                <h2 className="text-2xl font-bold text-gray-800">Create Marriage Form</h2>
            </div>

            <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 space-y-8">
                
                {/* General Info */}
                <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Marriage Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Date of Marriage" name="marriage_date" type="date" />
                        <InputGroup label="Marriage Venue" name="marriage_venue" />
                    </div>
                </section>

                {/* Groom */}
                <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Groom Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Groom Name" name="groom_name" />
                        <InputGroup label="Groom Father Name" name="groom_father_name" />
                        <InputGroup label="Groom Age" name="groom_age" type="number" />
                        <InputGroup label="Groom Address" name="groom_address" />
                    </div>
                </section>

                {/* Bride */}
                <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Bride Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Bride Name" name="bride_name" />
                        <InputGroup label="Bride Father Name" name="bride_father_name" />
                        <InputGroup label="Bride Age" name="bride_age" type="number" />
                        <InputGroup label="Bride Address" name="bride_address" />
                    </div>
                </section>
                
                {/* Witnesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                        <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Groom's Witness</h3>
                        <div className="space-y-4">
                            <InputGroup label="Name" name="groom_witness_name" />
                            <InputGroup label="Father Name" name="groom_witness_father_name" />
                            <InputGroup label="Address" name="groom_witness_address" />
                        </div>
                    </section>
                    
                    <section>
                        <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Bride's Witness</h3>
                        <div className="space-y-4">
                            <InputGroup label="Name" name="bride_witness_name" />
                            <InputGroup label="Father Name" name="bride_witness_father_name" />
                            <InputGroup label="Address" name="bride_witness_address" />
                        </div>
                    </section>
                </div>

                {/* Pandit */}
                <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Pandit Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputGroup label="Name" name="pandit_name" />
                        <InputGroup label="Father Name" name="pandit_father_name" />
                        <InputGroup label="Address" name="pandit_address" />
                    </div>
                </section>

                <div className="pt-6 border-t border-gray-200">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                    >
                        Save Marriage Form
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
