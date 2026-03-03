<!DOCTYPE html>
<html lang="en" class="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Admin Dashboard</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '#4f46e5',
                        secondary: '#818cf8',
                        darkBg: '#0f172a',
                        darkCard: '#1e293b',
                    }
                }
            }
        }
    </script>
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <style>
        /* Glassmorphism Effect */
        .glass {
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .dark .glass {
            background: rgba(30, 41, 59, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        /* Smooth Transitions */
        .transition-custom { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

        /* Live Animated Background */
        .bg-animated {
            background: linear-gradient(-45deg, #f3f4f6, #e5e7eb, #d1d5db, #f3f4f6);
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
        }
        .dark .bg-animated {
            background: linear-gradient(-45deg, #0f172a, #1e293b, #0f172a, #111827);
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
        }
        @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* Loading Spinner */
        #loader {
            position: fixed; inset: 0; z-index: 9999;
            background: rgba(255,255,255,0.9);
            display: flex; justify-content: center; align-items: center; transition: opacity 0.5s;
        }
        .dark #loader { background: rgba(15,23,42,0.9); }
        .spinner { width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* Sidebar State Classes */
        .sidebar-collapsed { width: 4.5rem; }
        .sidebar-expanded { width: 16rem; }
        .sidebar-collapsed .nav-text { display: none; }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 5px; }
        .dark ::-webkit-scrollbar-thumb { background: #475569; }
    </style>
</head>
<body class="bg-animated text-gray-800 dark:text-gray-100 overflow-hidden">

    <!-- Loading Spinner -->
    <div id="loader"><div class="spinner"></div></div>

    <div class="flex h-screen w-full">
        <!-- Modern Sidebar -->
        <aside id="sidebar" class="sidebar-expanded glass transition-custom h-full flex flex-col shadow-xl z-20 relative">
            <!-- Logo area -->
            <div class="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700/50">
                <div class="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                    <div class="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                        <i class="fa-solid fa-layer-group"></i>
                    </div>
                    <span class="nav-text font-bold text-xl tracking-wide">AdminLTE Pro</span>
                </div>
            </div>

            <!-- Nav Links -->
            <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-2">
                <a href="#" class="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-custom hover:scale-[1.02]">
                    <i class="fa-solid fa-border-all w-6 text-center text-lg"></i>
                    <span class="nav-text font-medium">Dashboard</span>
                </a>
                <a href="#" class="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-darkCard transition-custom hover:translate-x-1">
                    <i class="fa-solid fa-users w-6 text-center text-lg"></i>
                    <span class="nav-text font-medium">Users</span>
                </a>
                <a href="#" class="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-darkCard transition-custom hover:translate-x-1">
                    <i class="fa-solid fa-cart-shopping w-6 text-center text-lg"></i>
                    <span class="nav-text font-medium">Orders</span>
                </a>
                <a href="#" class="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-darkCard transition-custom hover:translate-x-1">
                    <i class="fa-solid fa-chart-line w-6 text-center text-lg"></i>
                    <span class="nav-text font-medium">Reports</span>
                </a>
                <a href="#" class="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-darkCard transition-custom hover:translate-x-1">
                    <i class="fa-solid fa-gear w-6 text-center text-lg"></i>
                    <span class="nav-text font-medium">Settings</span>
                </a>
            </nav>

            <!-- Bottom Action -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700/50">
                <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-custom">
                    <i class="fa-solid fa-arrow-right-from-bracket w-6 text-center text-lg"></i>
                    <span class="nav-text font-medium">Logout</span>
                </a>
            </div>
        </aside>

        <!-- Main Workspace -->
        <main class="flex-1 flex flex-col h-screen overflow-hidden z-10">
            <!-- Top Navbar -->
            <header class="h-16 glass flex items-center justify-between px-4 lg:px-8 shadow-sm">
                <!-- Left Nav -->
                <div class="flex items-center gap-4">
                    <button id="toggle-sidebar" class="text-gray-500 hover:text-primary transition-colors p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800">
                        <i class="fa-solid fa-bars-staggered text-xl"></i>
                    </button>
                    <div class="hidden md:flex items-center bg-white/50 dark:bg-darkCard rounded-full px-4 py-2 border border-white/20 dark:border-gray-700 focus-within:ring-2 ring-primary/20 transition-all">
                        <i class="fa-solid fa-magnifying-glass text-gray-400"></i>
                        <input type="text" placeholder="Search..." class="bg-transparent border-none outline-none ml-2 text-sm w-64 dark:text-white placeholder-gray-400">
                    </div>
                </div>

                <!-- Right Nav -->
                <div class="flex items-center gap-2 sm:gap-4">
                    <!-- Theme Toggle -->
                    <button id="theme-toggle" class="p-2.5 rounded-full text-gray-500 hover:bg-white/60 dark:hover:bg-gray-800 transition-colors">
                        <i id="theme-icon" class="fa-solid fa-moon text-lg"></i>
                    </button>
                    
                    <!-- Notifications -->
                    <button class="relative p-2.5 text-gray-500 hover:bg-white/60 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <i class="fa-solid fa-bell text-lg"></i>
                        <span class="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        <span class="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    <!-- Profile Dropdown -->
                    <div class="flex items-center gap-3 cursor-pointer pl-2 sm:pl-4 border-l border-gray-300 dark:border-gray-700 ml-1 group">
                        <div class="text-right hidden sm:block">
                            <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">Admin User</p>
                            <p class="text-xs text-primary font-medium tracking-wide">Administrator</p>
                        </div>
                        <img src="https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff" alt="Profile" class="w-10 h-10 rounded-full ring-2 ring-primary/30 group-hover:ring-primary transition-all shadow-md">
                    </div>
                </div>
            </header>

            <!-- Dashboard Content Scrollable Area -->
            <div class="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                <div class="max-w-7xl mx-auto space-y-6">
                    
                    <!-- Page Header -->
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, here's your overview.</p>
                        </div>
                    </div>

                    <!-- Statistics Cards -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <!-- Card 1 -->
                        <div class="glass p-6 rounded-2xl hover:-translate-y-1 transition-custom shadow-sm hover:shadow-xl group relative overflow-hidden">
                            <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1">Total Revenue</p>
                                    <h3 class="text-3xl font-black text-gray-800 dark:text-white">$84,230</h3>
                                </div>
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                    <i class="fa-solid fa-wallet"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Card 2 -->
                        <div class="glass p-6 rounded-2xl hover:-translate-y-1 transition-custom shadow-sm hover:shadow-xl group relative overflow-hidden">
                            <div class="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1">Total Users</p>
                                    <h3 class="text-3xl font-black text-gray-800 dark:text-white">12,450</h3>
                                </div>
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                                    <i class="fa-solid fa-user-group"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Card 3 -->
                        <div class="glass p-6 rounded-2xl hover:-translate-y-1 transition-custom shadow-sm hover:shadow-xl group relative overflow-hidden">
                            <div class="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1">Total Orders</p>
                                    <h3 class="text-3xl font-black text-gray-800 dark:text-white">1,840</h3>
                                </div>
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 text-white flex items-center justify-center text-xl shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                                    <i class="fa-solid fa-box-open"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Card 4 -->
                        <div class="glass p-6 rounded-2xl hover:-translate-y-1 transition-custom shadow-sm hover:shadow-xl group relative overflow-hidden">
                            <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1">Growth</p>
                                    <h3 class="text-3xl font-black text-gray-800 dark:text-white">+28.5%</h3>
                                </div>
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 text-white flex items-center justify-center text-xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                    <i class="fa-solid fa-arrow-trend-up"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Charts Section -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Revenue Chart -->
                        <div class="glass p-6 rounded-2xl shadow-sm hover:shadow-lg transition-custom">
                            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Revenue Overview</h3>
                            <div class="relative h-72 w-full">
                                <canvas id="revenueChart"></canvas>
                            </div>
                        </div>
                        
                        <!-- Users Chart -->
                        <div class="glass p-6 rounded-2xl shadow-sm hover:shadow-lg transition-custom">
                            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Users Growth</h3>
                            <div class="relative h-72 w-full">
                                <canvas id="usersChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Activity Table -->
                    <div class="glass rounded-2xl shadow-sm overflow-hidden mb-6">
                        <div class="p-6 border-b border-gray-200 dark:border-gray-700/50 flex justify-between items-center">
                            <h3 class="text-lg font-bold text-gray-800 dark:text-white">Recent Activity</h3>
                            <button class="text-primary hover:text-indigo-600 text-sm font-medium">View All</button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-gray-50/50 dark:bg-darkCard/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                        <th class="px-6 py-4 font-medium">User</th>
                                        <th class="px-6 py-4 font-medium">Status</th>
                                        <th class="px-6 py-4 font-medium">Date</th>
                                        <th class="px-6 py-4 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 dark:divide-gray-700/50 text-sm">
                                    <tr class="hover:bg-gray-50/50 dark:hover:bg-darkCard/50 transition-colors">
                                        <td class="px-6 py-4 flex items-center gap-3">
                                            <img src="https://ui-avatars.com/api/?name=John+Doe&background=random" class="w-8 h-8 rounded-full" alt="avatar">
                                            <div>
                                                <p class="font-medium text-gray-800 dark:text-gray-200">John Doe</p>
                                                <p class="text-xs text-gray-500">john@example.com</p>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">Completed</span></td>
                                        <td class="px-6 py-4 text-gray-500 dark:text-gray-400">Oct 24, 2023</td>
                                        <td class="px-6 py-4 text-right">
                                            <button class="text-gray-400 hover:text-primary transition-colors"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                                        </td>
                                    </tr>
                                    <tr class="hover:bg-gray-50/50 dark:hover:bg-darkCard/50 transition-colors">
                                        <td class="px-6 py-4 flex items-center gap-3">
                                            <img src="https://ui-avatars.com/api/?name=Jane+Smith&background=random" class="w-8 h-8 rounded-full" alt="avatar">
                                            <div>
                                                <p class="font-medium text-gray-800 dark:text-gray-200">Jane Smith</p>
                                                <p class="text-xs text-gray-500">jane@example.com</p>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400">Pending</span></td>
                                        <td class="px-6 py-4 text-gray-500 dark:text-gray-400">Oct 23, 2023</td>
                                        <td class="px-6 py-4 text-right">
                                            <button class="text-gray-400 hover:text-primary transition-colors"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Scripts -->
    <script>
        // Loading Spinner
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loader = document.getElementById('loader');
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }, 800);
        });

        // Sidebar Toggle
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('toggle-sidebar');
        
        toggleBtn.addEventListener('click', () => {
            if(sidebar.classList.contains('sidebar-expanded')) {
                sidebar.classList.remove('sidebar-expanded');
                sidebar.classList.add('sidebar-collapsed');
            } else {
                sidebar.classList.remove('sidebar-collapsed');
                sidebar.classList.add('sidebar-expanded');
            }
        });

        // Dark/Light Mode Toggle
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        const html = document.documentElement;

        themeToggle.addEventListener('click', () => {
            html.classList.toggle('dark');
            html.classList.toggle('light');
            
            if(html.classList.contains('dark')) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                updateChartsTheme(true);
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                updateChartsTheme(false);
            }
        });

        // Initialize Charts
        let revenueChart, usersChart;
        
        const initCharts = () => {
            const isDark = html.classList.contains('dark');
            const textColor = isDark ? '#e2e8f0' : '#475569';
            const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

            const revCtx = document.getElementById('revenueChart').getContext('2d');
            revenueChart = new Chart(revCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                    datasets: [{
                        label: 'Revenue',
                        data: [65, 59, 80, 81, 56, 55, 90],
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: gridColor }, ticks: { color: textColor } },
                        x: { grid: { display: false }, ticks: { color: textColor } }
                    }
                }
            });

            const userCtx = document.getElementById('usersChart').getContext('2d');
            usersChart = new Chart(userCtx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'New Users',
                        data: [12, 19, 3, 5, 2, 3, 9],
                        backgroundColor: '#8b5cf6',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: gridColor }, ticks: { color: textColor } },
                        x: { grid: { display: false }, ticks: { color: textColor } }
                    }
                }
            });
        };

        const updateChartsTheme = (isDark) => {
            const textColor = isDark ? '#e2e8f0' : '#475569';
            const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
            
            [revenueChart, usersChart].forEach(chart => {
                if(chart) {
                    chart.options.scales.x.ticks.color = textColor;
                    chart.options.scales.y.ticks.color = textColor;
                    chart.options.scales.y.grid.color = gridColor;
                    chart.update();
                }
            });
        };

        // Delay chart init slightly to let CSS load
        setTimeout(initCharts, 200);
        
        // Handle responsive sidebar automatically
        window.addEventListener('resize', () => {
            if(window.innerWidth < 1024) {
                sidebar.classList.remove('sidebar-expanded');
                sidebar.classList.add('sidebar-collapsed');
            } else {
                sidebar.classList.remove('sidebar-collapsed');
                sidebar.classList.add('sidebar-expanded');
            }
        });
        
        // Initial check for mobile
        if(window.innerWidth < 1024) {
            sidebar.classList.remove('sidebar-expanded');
            sidebar.classList.add('sidebar-collapsed');
        }
    </script>
</body>
</html>
