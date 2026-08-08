import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ServiceForm from './Form';

export default function Edit({ service }) {
    return (
        <AdminLayout>
            <Head title={`Edit ${service.name}`} />
            <h1 className="text-2xl font-bold text-gray-800 mb-5">Edit Service</h1>
            <ServiceForm
                service={service}
                submitUrl={`/admin/services/${service.id}`}
                method="put"
                submitLabel="Save Changes"
            />
        </AdminLayout>
    );
}
