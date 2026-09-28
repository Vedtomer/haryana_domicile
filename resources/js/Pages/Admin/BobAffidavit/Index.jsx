import React from 'react';
import { usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResourceIndex from '../../../Components/ResourceIndex';
import { Box, Alert, Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Index({ records }) {
    const { flash } = usePage().props;
    const printId = flash?.print_id;

    return (
        <AdminLayout>
            {printId && (
                <Box sx={{ mb: 3 }}>
                    <Alert
                        severity="success"
                        icon={<CheckCircleIcon fontSize="inherit" />}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                variant="contained"
                                startIcon={<PrintIcon />}
                                href={`/admin/rent-agreement/${printId}/print`}
                                target="_blank"
                                sx={{
                                    bgcolor: '#16a34a',
                                    color: '#ffffff',
                                    fontWeight: 'bold',
                                    '&:hover': { bgcolor: '#15803d' },
                                }}
                            >
                                Print Agreement Now
                            </Button>
                        }
                        sx={{
                            borderRadius: 2,
                            alignItems: 'center',
                            bgcolor: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                        }}
                    >
                        Your Rent Agreement is ready! Click the button to view or print the official 2-page document with stamps.
                    </Alert>
                </Box>
            )}

            <ResourceIndex
                title="Rent Agreement Records"
                items={records}
                columns={[
                    {
                        label: 'Date',
                        render: (r) => new Date(r.created_at).toLocaleDateString('en-IN'),
                    },
                    {
                        label: 'Tenant (First Party)',
                        render: (r) => (
                            <div>
                                <div className="font-bold text-slate-800">{r.first_party_name}</div>
                                {r.first_party_aadhar && (
                                    <div className="text-xs text-slate-500 font-mono">UID: {r.first_party_aadhar}</div>
                                )}
                            </div>
                        ),
                    },
                    {
                        label: 'Landlord (Second Party)',
                        render: (r) => (
                            <div>
                                <div className="font-semibold text-slate-700">{r.second_party_name}</div>
                                {r.second_party_aadhar && (
                                    <div className="text-xs text-slate-500 font-mono">UID: {r.second_party_aadhar}</div>
                                )}
                                <div className="text-xs text-slate-400">{r.property_owner_title || 'Owner'}</div>
                            </div>
                        ),
                    },
                    {
                        label: 'Monthly Rent',
                        render: (r) => (
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 text-xs">
                                ₹{r.monthly_rent}/-
                            </span>
                        ),
                    },
                    {
                        label: 'Period',
                        render: (r) => (
                            <div className="text-xs text-slate-600">
                                <div>{r.from_date} to {r.to_date}</div>
                                <div className="text-slate-400">({r.tenancy_months} Months)</div>
                            </div>
                        ),
                    },
                    {
                        label: 'Property Area',
                        render: (r) => (
                            <div className="text-xs text-slate-700">
                                <div>{r.property_area}</div>
                                <div className="text-slate-500">{r.property_city}</div>
                            </div>
                        ),
                    },
                ]}
                createHref="/admin/rent-agreement/create"
                editHref={(r) => `/admin/rent-agreement/${r.id}/edit`}
                printHref={(r) => `/admin/rent-agreement/${r.id}/print`}
                deleteHref={(r) => `/admin/rent-agreement/${r.id}`}
                emptyLabel="No rent agreement records found. Click '+ Create' to generate your first agreement."
            />
        </AdminLayout>
    );
}
