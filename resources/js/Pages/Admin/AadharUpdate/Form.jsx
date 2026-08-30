import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function Form({ data, setData, errors }) {
    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <InputLabel htmlFor="aadhar_number" value="Aadhar Number" />
                <TextInput
                    id="aadhar_number"
                    name="aadhar_number"
                    value={data.aadhar_number}
                    className="mt-1 block w-full"
                    autoComplete="off"
                    onChange={handleChange}
                    required
                    maxLength="12"
                />
                <InputError message={errors.aadhar_number} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="name" value="Resident Name" />
                <TextInput
                    id="name"
                    name="name"
                    value={data.name}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                    required
                />
                <InputError message={errors.name} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="c_o" value="C/O (Care Of)" />
                <TextInput
                    id="c_o"
                    name="c_o"
                    value={data.c_o}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                />
                <InputError message={errors.c_o} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="house_no" value="House No/ Bldg/ Apt" />
                <TextInput
                    id="house_no"
                    name="house_no"
                    value={data.house_no}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                />
                <InputError message={errors.house_no} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="street" value="Street/ Road/ Lane" />
                <TextInput
                    id="street"
                    name="street"
                    value={data.street}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                />
                <InputError message={errors.street} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="landmark" value="Landmark" />
                <TextInput
                    id="landmark"
                    name="landmark"
                    value={data.landmark}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                />
                <InputError message={errors.landmark} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="locality" value="Area/ Locality/ Sector" />
                <TextInput
                    id="locality"
                    name="locality"
                    value={data.locality}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                />
                <InputError message={errors.locality} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="village_town" value="Village/ Town/ City" />
                <TextInput
                    id="village_town"
                    name="village_town"
                    value={data.village_town}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                    required
                />
                <InputError message={errors.village_town} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="post_office" value="Post Office" />
                <TextInput
                    id="post_office"
                    name="post_office"
                    value={data.post_office}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                />
                <InputError message={errors.post_office} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="district" value="District" />
                <TextInput
                    id="district"
                    name="district"
                    value={data.district}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                    required
                />
                <InputError message={errors.district} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="state" value="State" />
                <TextInput
                    id="state"
                    name="state"
                    value={data.state}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                    required
                />
                <InputError message={errors.state} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="pin_code" value="PIN Code" />
                <TextInput
                    id="pin_code"
                    name="pin_code"
                    value={data.pin_code}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                    required
                    maxLength="6"
                />
                <InputError message={errors.pin_code} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="dob" value="Date of Birth" />
                <TextInput
                    id="dob"
                    name="dob"
                    type="date"
                    value={data.dob}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                />
                <InputError message={errors.dob} className="mt-2" />
            </div>

            <div className="md:col-span-2 pt-4 pb-2 border-b">
                <h3 className="text-lg font-semibold text-gray-700">Certifier Details (Optional)</h3>
            </div>

            <div>
                <InputLabel htmlFor="certifier_name" value="Certifier Name" />
                <TextInput
                    id="certifier_name"
                    name="certifier_name"
                    value={data.certifier_name}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                />
                <InputError message={errors.certifier_name} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="certifier_designation" value="Designation" />
                <TextInput
                    id="certifier_designation"
                    name="certifier_designation"
                    value={data.certifier_designation}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                />
                <InputError message={errors.certifier_designation} className="mt-2" />
            </div>

            <div className="md:col-span-2">
                <InputLabel htmlFor="certifier_address" value="Office Address" />
                <TextInput
                    id="certifier_address"
                    name="certifier_address"
                    value={data.certifier_address}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                />
                <InputError message={errors.certifier_address} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="certifier_contact" value="Contact No" />
                <TextInput
                    id="certifier_contact"
                    name="certifier_contact"
                    value={data.certifier_contact}
                    className="mt-1 block w-full"
                    onChange={handleChange}
                />
                <InputError message={errors.certifier_contact} className="mt-2" />
            </div>

        </div>
    );
}
