import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        district: '',
        father_name: '',
        mother_name: '',
        permanent_address: '',
        issuing_authority: '',
        record_year: '',
        registration_no: '',
        date_of_registration: '',
        record_father_name: '',
        record_mother_name: '',
        child_name: '',
        gender: 'Male',
        dob: '',
        address_parents_birth: '',
        school_child_name: '',
        school_dob: '',
        school_father_name: '',
        school_mother_name: '',
        other_children: [],
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/birth-records');
    };

    const addOtherChild = () => {
        setData('other_children', [...data.other_children, { name: '', dob: '', birth_place: '', is_recorded: 'Yes' }]);
    };

    const removeOtherChild = (index) => {
        const newChildren = [...data.other_children];
        newChildren.splice(index, 1);
        setData('other_children', newChildren);
    };

    const handleChildChange = (index, field, value) => {
        const newChildren = [...data.other_children];
        newChildren[index][field] = value;
        setData('other_children', newChildren);
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
            <Head title="Create Birth Record" />
            <div className="flex items-center mb-6">
                <Link href="/admin/birth-records" className="text-gray-500 hover:text-gray-700 mr-4">&larr; Back</Link>
                <h2 className="text-2xl font-bold text-gray-800">Add Child Name to Birth Record</h2>
            </div>

            <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 space-y-8">
                
                <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Search Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="District" name="district" />
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Declaration By (Applicants)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Applicant Father Name" name="father_name" />
                        <InputGroup label="Applicant Mother Name" name="mother_name" />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                            <textarea
                                value={data.permanent_address}
                                onChange={e => setData('permanent_address', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                                required
                            />
                            {errors.permanent_address && <div className="text-red-500 text-xs mt-1">{errors.permanent_address}</div>}
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Existing Birth Record Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputGroup label="Issuing Authority" name="issuing_authority" placeholder="Zila Registrar/Nagar Nigam" />
                        <InputGroup label="Record Year" name="record_year" />
                        <InputGroup label="Registration No." name="registration_no" />
                        <InputGroup label="Registration Date" name="date_of_registration" type="date" />
                        <InputGroup label="Recorded Father Name" name="record_father_name" />
                        <InputGroup label="Recorded Mother Name" name="record_mother_name" />
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Child Details to Add</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Name to be Added" name="child_name" />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select
                                value={data.gender}
                                onChange={e => setData('gender', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Transgender">Transgender</option>
                            </select>
                        </div>
                        <InputGroup label="Date of Birth" name="dob" type="date" />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address of Parents at Birth</label>
                            <textarea
                                value={data.address_parents_birth}
                                onChange={e => setData('address_parents_birth', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                                required
                            />
                        </div>
                    </div>
                </section>
                
                <section>
                    <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Supporting Document (School/Metric)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Name in Certificate" name="school_child_name" />
                        <InputGroup label="DOB in Certificate" name="school_dob" type="date" />
                        <InputGroup label="Father Name in Certificate" name="school_father_name" />
                        <InputGroup label="Mother Name in Certificate" name="school_mother_name" />
                    </div>
                </section>

                <section>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-bold text-blue-600">Other Children Details</h3>
                        <button type="button" onClick={addOtherChild} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-1 px-3 rounded">
                            + Add Child
                        </button>
                    </div>
                    
                    {data.other_children.map((child, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" value={child.name} onChange={e => handleChildChange(index, 'name', e.target.value)} className="w-full text-sm border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">DOB</label>
                                <input type="date" value={child.dob} onChange={e => handleChildChange(index, 'dob', e.target.value)} className="w-full text-sm border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Birth Place</label>
                                <input type="text" value={child.birth_place} onChange={e => handleChildChange(index, 'birth_place', e.target.value)} className="w-full text-sm border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Recorded?</label>
                                <select value={child.is_recorded} onChange={e => handleChildChange(index, 'is_recorded', e.target.value)} className="w-full text-sm border-gray-300 rounded-md shadow-sm">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <button type="button" onClick={() => removeOtherChild(index)} className="text-red-500 hover:text-red-700 text-sm font-semibold mb-2">Remove</button>
                        </div>
                    ))}
                    {data.other_children.length === 0 && <p className="text-gray-500 text-sm italic">No other children added.</p>}
                </section>

                <div className="pt-6 border-t border-gray-200">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                    >
                        Save Birth Record
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
