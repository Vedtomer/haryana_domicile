<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
        <meta name="theme-color" content="#ffffff">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/logo.png">
        
        <title inertia>{{ config('app.name', 'CSP Jaankari') }}</title>
        <meta name="description" content="CSP Jaankari - All Online Portal Services, PVC Card Maker, Citizen Services and Verification Portal.">

        <!-- Open Graph / WhatsApp / Facebook Preview Tags -->
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="CSP Jaankari">
        <meta property="og:title" content="CSP Jaankari - All Online Portal Services">
        <meta property="og:description" content="CSP Jaankari Portal - Quick registration, instant print services, and all online portal utilities.">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:image" content="{{ asset('og-image.jpg') }}">
        <meta property="og:image:secure_url" content="{{ asset('og-image.jpg') }}">
        <meta property="og:image:type" content="image/jpeg">
        <meta property="og:image:width" content="512">
        <meta property="og:image:height" content="512">

        <!-- Twitter Preview Tags -->
        <meta name="twitter:card" content="summary">
        <meta name="twitter:title" content="CSP Jaankari - All Online Portal Services">
        <meta name="twitter:description" content="CSP Jaankari Portal - Quick registration, instant print services, and all online portal utilities.">
        <meta name="twitter:image" content="{{ asset('og-image.jpg') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

        <!-- Ensure Clean Light Theme -->
        <script>
            try {
                localStorage.setItem('theme', 'light');
                document.documentElement.classList.remove('dark');
            } catch (e) {}
        </script>

        <!-- Scripts -->
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-gray-100 text-slate-800">
        @inertia
        
        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js').then((registration) => {
                        console.log('Service Worker registered with scope: ', registration.scope);
                    }, (error) => {
                        console.log('Service Worker registration failed: ', error);
                    });
                });
            }

        @php
            $isAdminUser = auth()->check() && (auth()->user()->isAdmin() || auth()->user()->hasRole('super_admin'));
        @endphp
        @if(!$isAdminUser)
        <script>
            // Anti-Inspect & Right Click Block
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
            });

            let isLoggingOut = false;
            function triggerLogout() {
                if (isLoggingOut) return;
                isLoggingOut = true;
                window.location.href = '/logout';
            }

            document.addEventListener('keydown', function(e) {
                // F12
                if (e.key === 'F12' || e.keyCode === 123) {
                    e.preventDefault();
                    triggerLogout();
                }
                // Ctrl+Shift+I (Inspect)
                if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
                    e.preventDefault();
                    triggerLogout();
                }
                // Ctrl+Shift+J (Console)
                if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
                    e.preventDefault();
                    triggerLogout();
                }
                // Ctrl+Shift+C (Element Inspector)
                if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
                    e.preventDefault();
                    triggerLogout();
                }
                // Ctrl+U (View Source)
                if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
                    e.preventDefault();
                    triggerLogout();
                }
            });

            // Debugger trap to freeze page and logout if they bypass shortcuts
            setInterval(function() {
                let before = new Date().getTime();
                (function() { debugger; })();
                let after = new Date().getTime();
                if (after - before > 100) {
                    triggerLogout();
                }
            }, 1000);
        </script>
        <script type="module">
            import devtools from '/devtools-detect.js';
            window.addEventListener('devtoolschange', event => {
                if (event.detail.isOpen) {
                    triggerLogout();
                }
            });
        </script>
        @endif
    </body>
</html>
