import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export default function ConfirmDialog({ open, title = 'Are you sure?', message, onConfirm, onCancel, confirmLabel = 'Delete' }) {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle fontWeight="bold">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancel} color="inherit">Cancel</Button>
                <Button onClick={onConfirm} color="error" variant="contained">{confirmLabel}</Button>
            </DialogActions>
        </Dialog>
    );
}
