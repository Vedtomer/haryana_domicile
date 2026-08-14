import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResourceIndex from '../../../Components/ResourceIndex';

export default function Index({ affidavits }) {
    return (
        <AdminLayout>
            <ResourceIndex
                title="New Marriage Certificate"
                items={affidavits}
                columns={[
                    { label: 'ID', render: (f) => `#${f.id}` },
                    { label: 'Groom Name', render: (f) => f.groom_name },
                    { label: 'Bride Name', render: (f) => f.bride_name },
                    { label: 'Date', render: (f) => f.marriage_date },
                ]}
                createHref="/admin/marriage-affidavits/create"
                editHref={(f) => `/admin/marriage-affidavits/${f.id}/edit`}
                printHref={(f) => `/admin/marriage-affidavits/${f.id}/print`}
                deleteHref={(f) => `/admin/marriage-affidavits/${f.id}`}
                emptyLabel="No marriage affidavits found."
            />
        </AdminLayout>
    );
}
