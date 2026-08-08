import React from 'react';

const STYLES = {
    pending: 'bg-gray-100 text-gray-700',
    accepted: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

const LABELS = {
    pending: 'Pending',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    completed: 'Completed',
    rejected: 'Rejected',
};

export default function StatusBadge({ status }) {
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${STYLES[status] ?? STYLES.pending}`}>
            {LABELS[status] ?? status}
        </span>
    );
}
