import React, { useEffect } from 'react';
import axios from 'axios';

export default function UserLocationTracker({ user }) {
    useEffect(() => {
        if (!user || user.type !== 'user') return;

        // Function to report location
        const reportLocation = (coords = null) => {
            const payload = coords ? {
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy,
            } : {};

            axios.post('/user/update-location', payload).catch(() => {});
        };

        // Check if GPS Geolocation is supported
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    reportLocation(position.coords);
                },
                (error) => {
                    // Fallback to IP geolocation if GPS is denied or unavailable
                    reportLocation(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 12000,
                    maximumAge: 300000 // 5 minutes cache
                }
            );
        } else {
            reportLocation(null);
        }
    }, [user?.id]);

    return null;
}
