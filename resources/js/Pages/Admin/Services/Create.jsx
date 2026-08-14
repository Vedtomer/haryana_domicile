import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ServiceForm from './Form';

export default function Create({ users }) {
    return (
        <AdminLayout>
            <Head title="Add Service" />
            <h1 className="text-2xl font-bold text-gray-800 mb-5">Add Service</h1>
            <ServiceForm users={users} submitUrl="/admin/services" method="post" submitLabel="Add Service" />
        </AdminLayout>
    );
}
