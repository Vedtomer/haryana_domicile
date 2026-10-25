<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
        <meta name="theme-color" content="#ffffff">
        <meta name="google-site-verification" content="Zxs-a1knaNGxKY1LKqvpNlvG_Xgk9kAYMuP0zGStEdU" />
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

        <!-- Fonts - preconnect for faster DNS resolution -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <!-- Inter: preload for critical text rendering -->
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" onload="this.rel='stylesheet'">
        <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"></noscript>
        <!-- Material Symbols: loaded async (non-render-blocking) -->
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" onload="this.rel='stylesheet'">
        <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"></noscript>

        <!-- Theme Initialization Script -->
        <script>
            try {
                const storedTheme = localStorage.getItem('theme');
                if (storedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } catch (e) {}
        </script>

        <!-- Scripts -->
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-gray-100 text-slate-800">
        @inertia

        @php
            $isMaintenanceActive = \App\Models\Setting::get('site_maintenance_popup', '0') === '1';
            $isSuperOrAdmin = auth()->check() && (auth()->user()->isAdmin() || auth()->user()->hasRole('super_admin'));
            $isLoginPage = request()->is('login*') || request()->is('admin/login*');
        @endphp

        @if($isMaintenanceActive && !$isSuperOrAdmin)
            @if(!$isLoginPage)
            <!-- Maintenance Mode Modal Overlay -->
            <style>
                #site-maintenance-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 9999999;
                    background: rgba(15, 23, 42, 0.88);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .site-maintenance-modal {
                    background: #ffffff;
                    color: #0f172a;
                    width: 100%;
                    max-width: 540px;
                    border-radius: 24px;
                    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15);
                    padding: 32px 28px;
                    text-align: center;
                    position: relative;
                    animation: maintenanceFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    transition: transform 0.15s ease;
                }
                @keyframes maintenanceFadeIn {
                    from { transform: scale(0.92); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .site-maintenance-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 16px;
                    background: #fef3c7;
                    color: #92400e;
                    border: 1px solid #fde68a;
                    border-radius: 9999px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    margin-bottom: 20px;
                }
                .site-maintenance-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #d97706;
                    animation: maintenancePulseDot 1.4s infinite ease-in-out;
                }
                @keyframes maintenancePulseDot {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(0.6); opacity: 0.4; }
                }
                .site-maintenance-icon {
                    width: 76px;
                    height: 76px;
                    margin: 0 auto 18px;
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border: 2px solid #fbbf24;
                    border-radius: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 38px;
                    box-shadow: 0 12px 20px -5px rgba(245, 158, 11, 0.25);
                }
                .site-maintenance-heading {
                    font-size: 22px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 12px 0;
                    line-height: 1.3;
                }
                .site-maintenance-subheading {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: #64748b;
                    margin-top: 4px;
                }
                .site-maintenance-hi {
                    font-size: 14.5px;
                    color: #334155;
                    line-height: 1.65;
                    margin: 0 0 16px 0;
                    font-weight: 500;
                    background: #f8fafc;
                    padding: 14px 16px;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                }
                .site-maintenance-en {
                    font-size: 13px;
                    color: #64748b;
                    line-height: 1.55;
                    margin: 0 0 20px 0;
                }
                .site-maintenance-bottom {
                    padding-top: 14px;
                    border-top: 1px dashed #cbd5e1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: #64748b;
                }
                .site-maintenance-login {
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 700;
                    padding: 6px 12px;
                    border-radius: 8px;
                    background: #eff6ff;
                    transition: all 0.15s;
                }
                .site-maintenance-login:hover {
                    background: #dbeafe;
                    color: #1d4ed8;
                }
            </style>

            <div id="site-maintenance-backdrop" onclick="siteMaintenanceBounce()">
                <div class="site-maintenance-modal" onclick="event.stopPropagation()">
                    <div class="site-maintenance-tag">
                        <span class="site-maintenance-dot"></span>
                        Scheduled Maintenance &bull; सर्वर मेंटेनेंस
                    </div>

                    <div class="site-maintenance-icon">
                        🛠️
                    </div>

                    <h2 class="site-maintenance-heading">
                        साइट अभी मेंटेनेंस पर है
                        <span class="site-maintenance-subheading">Website is Currently Under Scheduled Maintenance</span>
                    </h2>

                    <div class="site-maintenance-hi">
                        <strong>प्रिय यूजर,</strong> हमारी वेबसाइट पर अभी तकनीकी सुधार और सर्वर मेंटेनेंस का जरूरी कार्य चल रहा है। इस दौरान सभी सेवाएं कुछ समय के लिए बंद रहेंगी। जैसे ही कार्य पूरा होगा, साइट पुनः सुचारू रूप से शुरू कर दी जाएगी।<br>
                        <span style="color: #dc2626; font-weight: 600; display: inline-block; margin-top: 6px;">असुविधा के लिए हमें खेद है। कृपया कुछ समय बाद पुनः प्रयास करें।</span>
                    </div>

                    <p class="site-maintenance-en">
                        Our portal is undergoing essential technical updates &amp; server maintenance. All online services are temporarily paused and will resume shortly. We sincerely apologize for the inconvenience.
                    </p>

                    <div class="site-maintenance-bottom">
                        <span>⚡ CSP Jaankari Official</span>
                        <a href="/login" class="site-maintenance-login">Admin Login &rarr;</a>
                    </div>
                </div>
            </div>

            <script>
                function siteMaintenanceBounce() {
                    var el = document.querySelector('.site-maintenance-modal');
                    if (el) {
                        el.style.transform = 'scale(1.025)';
                        setTimeout(function() {
                            el.style.transform = 'scale(1)';
                        }, 140);
                    }
                }
            </script>
            @else
            <!-- If on /login page, show top alert banner so admin can log in -->
            <div style="position: fixed; top: 0; left: 0; right: 0; z-index: 999999; background: #ea580c; color: white; text-align: center; padding: 10px 16px; font-size: 13px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                ⚠️ साइट अभी मेंटेनेंस मोड पर है (Maintenance Active) &bull; Only Authorized Admins Can Login.
            </div>
            @endif
        @endif
        
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
