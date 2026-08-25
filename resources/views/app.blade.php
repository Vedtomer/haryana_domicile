<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
        <meta name="theme-color" content="#ffffff">
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/logo.png">
        
        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

        <!-- Scripts -->
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-gray-100">
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

            // Anti-Inspect & Right Click Block
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
            });

            let isLoggingOut = false;
            function triggerLogout() {
                if (isLoggingOut) return;
                isLoggingOut = true;
                
                let form = document.createElement('form');
                form.method = 'POST';
                form.action = '/logout';
                
                let csrfToken = document.createElement('input');
                csrfToken.type = 'hidden';
                csrfToken.name = '_token';
                csrfToken.value = '{{ csrf_token() }}';
                form.appendChild(csrfToken);
                
                document.body.appendChild(form);
                form.submit();
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
    </body>
</html>
