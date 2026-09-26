import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    build: {
        // Better chunk splitting for faster page loads
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Vendor chunk: react + inertia core
                    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                        return 'vendor-react';
                    }
                    if (id.includes('node_modules/@inertiajs')) {
                        return 'vendor-inertia';
                    }
                    if (id.includes('node_modules/axios')) {
                        return 'vendor-axios';
                    }
                },
                // Better chunk file naming
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
        // Generate smaller bundles using built-in esbuild (no extra install needed)
        minify: 'esbuild',
        // Increase chunk size warning limit (we already split chunks)
        chunkSizeWarningLimit: 600,
    },
});
