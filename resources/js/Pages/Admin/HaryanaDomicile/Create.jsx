import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        pincode: '',
        tehsil: '',
        district: '',
        name: '',
        father_name: '',
        village: '',
        ward_no: '',
        age: '',
        mobile: '',
        aadhar: '',
        ration_card_no: '',
        caste: '',
        religion: '',
        child_name: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/haryana-domicile');
    };

    const InputGroup = ({ label, name, type = "text", placeholder="" }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                value={data[name]}
                onChange={e => setData(name, e.target.value)}
                placeholder={placeholder}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors[name] && <div className="text-red-500 text-xs mt-1">{errors[name]}</div>}
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Create Haryana Domicile Form" />
            <div className="flex items-center mb-6">
                <Link href="/admin/haryana-domicile" className="text-gray-500 hover:text-gray-700 mr-4">&larr; Back</Link>
                <h2 className="text-2xl font-bold text-gray-800">Create Haryana Domicile Record</h2>
            </div>

            <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 space-y-8">
                
                <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Pincode" name="pincode" type="number" />
                        <InputGroup label="Tehsil" name="tehsil" />
                        <InputGroup label="District" name="district" />
                        <InputGroup label="Name" name="name" />
                        <InputGroup label="Father/Husband Name" name="father_name" />
                        <InputGroup label="Village/Address" name="village" />
                        <InputGroup label="Ward No." name="ward_no" />
                        <InputGroup label="Age" name="age" type="number" />
                        <InputGroup label="Mobile No." name="mobile" type="tel" />
                        <InputGroup label="Aadhar No." name="aadhar" />
                        <InputGroup label="Ration Card No." name="ration_card_no" />
                        <InputGroup label="Caste" name="caste" />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Religion (Dharam)</label>
                            <select
                                value={data.religion}
                                onChange={e => setData('religion', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Religion...</option>
                                <option value="Hindu">Hindu</option>
                                <option value="Muslim">Muslim</option>
                                <option value="Sikh">Sikh</option>
                                <option value="Christian">Christian</option>
                                <option value="Jain">Jain</option>
                                <option value="Buddhist">Buddhist</option>
                                <option value="Zoroastrian">Zoroastrian</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <InputGroup label="Child Name (Optional)" name="child_name" />
                    </div>
                </section>

                <div className="pt-6 border-t border-gray-200">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                    >
                        Save Domicile Record
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
