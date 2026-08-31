import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ServiceForm from './Form';
import ConfirmDialog from '../../../Components/ConfirmDialog';

export default function Edit({ service, users }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        const handleOpenDialog = () => setDeleteDialogOpen(true);
        window.addEventListener('open-service-delete-dialog', handleOpenDialog);
        return () => window.removeEventListener('open-service-delete-dialog', handleOpenDialog);
    }, []);

    const handleDelete = () => {
        router.delete(`/admin/services/${service.id}`);
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${service.name}`} />
            <h1 className="text-2xl font-bold text-gray-800 mb-5">Edit Service</h1>
            <ServiceForm
                service={service}
                users={users}
                submitUrl={`/admin/services/${service.id}`}
                method="put"
                submitLabel="Save Changes"
            />
            
            <ConfirmDialog
                open={deleteDialogOpen}
                title="Delete service?"
                message={`"${service.name}" will no longer be available to users.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteDialogOpen(false)}
            />
        </AdminLayout>
    );
}
