import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResourceIndex from '../../../Components/ResourceIndex';

export default function Index({ records }) {
    return (
        <AdminLayout>
            <ResourceIndex
                title="Birth Certificate Name Add (जन्म प्रमाण पत्र नाम जुड़वाएं)"
                pageTitle="Birth Certificate Name Add"
                items={records}
                columns={[
                    { label: 'Date', render: (r) => new Date(r.created_at).toLocaleDateString() },
                    { label: 'Child Name', render: (r) => r.child_name },
                    { label: 'Father Name', render: (r) => r.father_name },
                    { label: 'DOB', render: (r) => r.dob?.slice(0, 10) },
                    { label: 'Reg. No', render: (r) => r.registration_no },
                ]}
                createHref="/admin/birth-records/create"
                editHref={(r) => `/admin/birth-records/${r.id}/edit`}
                printHref={(r) => `/birth-records/${r.id}/print`}
                deleteHref={(r) => `/admin/birth-records/${r.id}`}
                emptyLabel="No birth records found."
                extraActions={
                    <Button
                        component={Link}
                        href="/utilities/birth-certificate"
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                    >
                        Download by Reg. No
                    </Button>
                }
            />
        </AdminLayout>
    );
}
