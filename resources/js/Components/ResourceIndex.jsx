import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Box, Typography, Button, Paper, TableContainer, Table, TableHead,
    TableBody, TableRow, TableCell, IconButton, Tooltip, Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import ConfirmDialog from './ConfirmDialog';

/**
 * Shared list page for the admin CRUD modules (Marriage Forms, Birth Records, Haryana Domicile).
 *
 * @param title            Page title
 * @param pageTitle         <Head> title (defaults to title)
 * @param items             Laravel paginator prop ({ data, links })
 * @param columns           [{ label, render(row) }]
 * @param createHref        link for the "+ Create" button
 * @param editHref(row)      link for the edit action
 * @param printHref(row)     optional link for the print action (opens in new tab)
 * @param deleteHref(row)     url used for the delete confirm action
 * @param emptyLabel        text shown when there are no rows
 */
export default function ResourceIndex({
    title,
    pageTitle,
    items,
    columns,
    createHref,
    editHref,
    printHref,
    deleteHref,
    emptyLabel = 'No records found.',
}) {
    const [toDelete, setToDelete] = useState(null);

    const confirmDelete = () => {
        router.delete(deleteHref(toDelete), { onFinish: () => setToDelete(null) });
    };

    return (
        <>
            <Head title={pageTitle ?? title} />

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    {title}
                </Typography>
                <Button component={Link} href={createHref} variant="contained" startIcon={<AddIcon />}>
                    Create
                </Button>
            </Box>

            <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableCell key={col.label} sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                        {col.label}
                                    </TableCell>
                                ))}
                                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.data.map((row) => (
                                <TableRow key={row.id} hover>
                                    {columns.map((col) => (
                                        <TableCell key={col.label}>{col.render(row)}</TableCell>
                                    ))}
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            {printHref && (
                                                <Tooltip title="Print">
                                                    <IconButton component="a" href={printHref(row)} target="_blank" color="success" size="small">
                                                        <PrintIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Edit">
                                                <IconButton component={Link} href={editHref(row)} color="primary" size="small">
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton onClick={() => setToDelete(row)} color="error" size="small">
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                        {emptyLabel}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
                {items.links.map((link, i) => (
                    <Button
                        key={i}
                        component={link.url ? Link : 'button'}
                        href={link.url ?? undefined}
                        disabled={!link.url}
                        variant={link.active ? 'contained' : 'outlined'}
                        size="small"
                    >
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    </Button>
                ))}
            </Stack>

            <ConfirmDialog
                open={!!toDelete}
                title="Delete record?"
                message="This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </>
    );
}
