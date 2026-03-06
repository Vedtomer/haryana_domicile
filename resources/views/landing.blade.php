<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saga Services - Your Digital Gateway</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4F46E5;
            --primary-dark: #4338CA;
            --secondary: #10B981;
            --bg-color: #0F172A;
            --surface: #1E293B;
            --text-main: #F8FAFC;
            --text-muted: #94A3B8;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            overflow-x: hidden;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* Glassmorphism Header */
        header {
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 100;
            padding: 1.5rem 5%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #60A5FA, #A78BFA);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .nav-links {
            display: flex;
            gap: 1.5rem;
            align-items: center;
        }

        .btn {
            padding: 0.6rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .btn-outline {
            color: var(--text-main);
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: transparent;
        }

        .btn-outline:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.4);
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            border: none;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(79, 70, 229, 0.6);
        }

        /* Hero Section */
        .hero {
            margin-top: 80px;
            padding: 6rem 5%;
            text-align: center;
            position: relative;
        }

        /* Background Glows */
        .glow-1 {
            position: absolute;
            top: -10%;
            left: -10%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(79,70,229,0.3) 0%, rgba(15,23,42,0) 70%);
            z-index: -1;
        }

        .glow-2 {
            position: absolute;
            top: 20%;
            right: -10%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(15,23,42,0) 70%);
            z-index: -1;
        }

        .hero h1 {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            line-height: 1.2;
            animation: fadeInDown 0.8s ease-out;
        }

        .hero h1 span {
            background: linear-gradient(135deg, #38BDF8, #818CF8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero p {
            font-size: 1.25rem;
            color: var(--text-muted);
            max-width: 600px;
            margin: 0 auto 3rem auto;
            animation: fadeIn 1s ease-out 0.3s both;
        }

        /* Services Section */
        .services {
            padding: 4rem 5%;
            max-width: 1200px;
            margin: 0 auto;
            flex-grow: 1;
        }

        .services-header {
            text-align: center;
            margin-bottom: 4rem;
        }

        .services-header h2 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }

        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        .service-card {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 2.5rem 2rem;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .service-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, transparent, var(--primary), transparent);
            transform: scaleX(0);
            transition: transform 0.4s ease;
        }

        .service-card:hover {
            transform: translateY(-10px);
            background: rgba(30, 41, 59, 0.8);
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .service-card:hover::before {
            transform: scaleX(1);
        }

        .icon-wrapper {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            font-size: 2rem;
        }

        .service-1 .icon-wrapper { background: rgba(79, 70, 229, 0.1); color: #818CF8; }
        .service-2 .icon-wrapper { background: rgba(16, 185, 129, 0.1); color: #34D399; }
        .service-3 .icon-wrapper { background: rgba(245, 158, 11, 0.1); color: #FBBF24; }
        .service-4 .icon-wrapper { background: rgba(236, 72, 153, 0.1); color: #F472B6; }

        .service-card h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }

        .service-card p {
            color: var(--text-muted);
            line-height: 1.6;
        }

        /* Footer */
        footer {
            background: var(--surface);
            padding: 2rem 5%;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            color: var(--text-muted);
            margin-top: auto;
        }

        /* Animations */
        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .nav-links .btn { padding: 0.5rem 1rem; font-size: 0.9rem; }
        }
    </style>
</head>
<body>

    <header>
        <a href="/" class="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
            </svg>
            Saga Services
        </a>
        <div class="nav-links">
            <a href="/admin/login" class="btn btn-outline">Login</a>
            <a href="/admin/register" class="btn btn-primary">Create Account</a>
        </div>
    </header>

    <div class="hero">
        <div class="glow-1"></div>
        <div class="glow-2"></div>
        <h1>Simplify Your Document <br><span>Workflows Instantly</span></h1>
        <p>Access all essential digital services including Haryana Domicile, Birth Records, and advanced PDF conversions in one beautiful platform.</p>
    </div>

    <section class="services">
        <div class="services-header">
            <h2>Our Core Services</h2>
            <p style="color: var(--text-muted); font-size: 1.1rem;">Everything you need to manage your digital footprint</p>
        </div>

        <div class="services-grid">
            <!-- Service 1 -->
            <div class="service-card service-1">
                <div class="icon-wrapper">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
                <h3>Haryana Domicile</h3>
                <p>Seamlessly view, manage, and print your Haryana domicile certificates right from the platform.</p>
            </div>

            <!-- Service 2 -->
            <div class="service-card service-2">
                <div class="icon-wrapper">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </div>
                <h3>Birth Records</h3>
                <p>Digital registry for vital birth records. Add, track and print official documents securely.</p>
            </div>

            <!-- Service 3 -->
            <div class="service-card service-3">
                <div class="icon-wrapper">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <path d="M9 15l2 2 4-4"></path>
                    </svg>
                </div>
                <h3>PDF Converter</h3>
                <p>Advanced tools to adjust PDF coordinates, convert documents, and streamline outputs.</p>
            </div>

            <!-- Service 4 -->
            <div class="service-card service-4">
                <div class="icon-wrapper">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 8v8"></path>
                        <path d="M8 12h8"></path>
                    </svg>
                </div>
                <h3>Add Coins</h3>
                <p>Easily top up your account balance with coin purchase requests to access premium features.</p>
            </div>
        </div>
    </section>

    <footer>
        <p>&copy; 2026 Saga Services. All rights reserved.</p>
    </footer>

</body>
</html>
