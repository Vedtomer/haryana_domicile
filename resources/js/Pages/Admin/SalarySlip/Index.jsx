import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ResourceIndex from '../../../Components/ResourceIndex';
import { Box, Alert, Button, CircularProgress } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Index({ records }) {
    const { flash } = usePage().props;
    const printId = flash?.print_id;
    const [printingId, setPrintingId] = useState(null);

    const handleDirectPrint = (id) => {
        setPrintingId(id);

        // Remove previous silent print iframe if present
        const oldFrame = document.getElementById('silent-salary-print-frame');
        if (oldFrame) {
            oldFrame.remove();
        }

        const iframe = document.createElement('iframe');
        iframe.id = 'silent-salary-print-frame';
        iframe.src = `/admin/salary-slip/${id}/print?direct=1`;
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.opacity = '0.01';
        iframe.style.border = 'none';
        iframe.style.pointerEvents = 'none';
        document.body.appendChild(iframe);

        iframe.onload = () => {
            setTimeout(() => {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                } catch (err) {
                    console.error('Direct print failed:', err);
                } finally {
                    setPrintingId(null);
                }
            }, 500);
        };
    };

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
                                startIcon={printingId === printId ? <CircularProgress size={16} color="inherit" /> : <PrintIcon />}
                                disabled={printingId === printId}
                                onClick={() => handleDirectPrint(printId)}
                                sx={{
                                    bgcolor: '#16a34a',
                                    color: '#ffffff',
                                    fontWeight: 'bold',
                                    '&:hover': { bgcolor: '#15803d' },
                                }}
                            >
                                {printingId === printId ? 'Printing...' : 'Print Salary Slip Now'}
                            </Button>
                        }
                        sx={{
                            borderRadius: 2,
                            alignItems: 'center',
                            bgcolor: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                        }}
                    >
                        Your Salary Slip is ready! Click the button to send print command directly to your connected printer without opening any tab.
                    </Alert>
                </Box>
            )}

            <ResourceIndex
                title="Salary Slip Records"
                items={records}
                columns={[
                    {
                        label: 'Date',
                        render: (r) => new Date(r.created_at).toLocaleDateString('en-IN'),
                    },
                    {
                        label: 'Employee Name',
                        render: (r) => (
                            <div>
                                <div className="font-bold text-slate-800">{r.employee_name}</div>
                                {r.pan_no && (
                                    <div className="text-xs text-slate-500 font-mono">PAN: {r.pan_no}</div>
                                )}
                            </div>
                        ),
                    },
                    {
                        label: 'Employer',
                        render: (r) => (
                            <div>
                                <div className="font-semibold text-slate-700">{r.employer_name}</div>
                                {r.period && (
                                    <div className="text-xs text-slate-500">Period: {r.period}</div>
                                )}
                            </div>
                        ),
                    },
                    {
                        label: 'Gross Salary',
                        render: (r) => (
                            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                                ₹{r.gross_salary}
                            </span>
                        ),
                    },
                    {
                        label: 'Total Income',
                        render: (r) => (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 text-xs">
                                ₹{r.total_income}
                            </span>
                        ),
                    },
                ]}
                createHref="/admin/salary-slip/create"
                editHref={(r) => `/admin/salary-slip/${r.id}/edit`}
                onPrint={(r) => handleDirectPrint(r.id)}
                deleteHref={(r) => `/admin/salary-slip/${r.id}`}
                emptyLabel="No salary slip records found. Click '+ Create' to generate one."
            />
        </AdminLayout>
    );
}
