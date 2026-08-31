<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Maintenance — CSP Jaankari</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
        }

        /* Animated stars */
        .stars {
            position: fixed; inset: 0; z-index: 0;
            background:
                radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.6) 0%, transparent 100%),
                radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.5) 0%, transparent 100%),
                radial-gradient(1px 1px at 50% 60%, rgba(255,255,255,0.4) 0%, transparent 100%),
                radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.6) 0%, transparent 100%),
                radial-gradient(1px 1px at 90% 70%, rgba(255,255,255,0.5) 0%, transparent 100%),
                radial-gradient(2px 2px at 35% 15%, rgba(100,200,255,0.4) 0%, transparent 100%),
                radial-gradient(2px 2px at 65% 85%, rgba(100,200,255,0.3) 0%, transparent 100%);
        }

        /* Glowing orbs */
        .orb {
            position: fixed; border-radius: 50%; filter: blur(80px); z-index: 0;
            animation: float 8s ease-in-out infinite;
        }
        .orb-1 { width: 400px; height: 400px; background: rgba(59,130,246,0.15); top: -100px; left: -100px; }
        .orb-2 { width: 350px; height: 350px; background: rgba(139,92,246,0.12); bottom: -80px; right: -80px; animation-delay: -4s; }
        .orb-3 { width: 250px; height: 250px; background: rgba(16,185,129,0.08); top: 50%; left: 50%; transform: translate(-50%,-50%); animation-delay: -2s; }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-30px); }
        }

        /* Card */
        .card {
            position: relative; z-index: 10;
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 28px;
            padding: 56px 48px;
            max-width: 520px; width: 90%;
            text-align: center;
            box-shadow: 0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
            animation: cardIn 0.8s ease-out;
        }

        @keyframes cardIn {
            from { opacity: 0; transform: translateY(40px) scale(0.95); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Gear icon animation */
        .gear-wrap {
            display: inline-flex; align-items: center; justify-content: center;
            width: 88px; height: 88px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            margin-bottom: 28px;
            box-shadow: 0 0 40px rgba(59,130,246,0.4);
        }
        .gear-wrap svg {
            animation: spin 4s linear infinite;
            width: 48px; height: 48px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Logo */
        .logo-text {
            font-size: 13px; font-weight: 700; letter-spacing: 0.15em;
            color: rgba(147,197,253,0.8);
            text-transform: uppercase; margin-bottom: 16px;
        }

        h1 {
            font-size: 30px; font-weight: 800;
            color: #ffffff;
            margin-bottom: 16px;
            line-height: 1.2;
        }

        .message {
            font-size: 16px;
            color: rgba(203,213,225,0.85);
            line-height: 1.7;
            margin-bottom: 36px;
        }

        /* Progress bar */
        .progress-bar {
            width: 100%; height: 4px;
            background: rgba(255,255,255,0.1);
            border-radius: 99px;
            overflow: hidden;
            margin-bottom: 32px;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6);
            background-size: 200% 100%;
            border-radius: 99px;
            animation: progress 2.5s ease-in-out infinite;
            width: 60%;
        }
        @keyframes progress {
            0%   { background-position: 100% 0; }
            100% { background-position: -100% 0; }
        }

        /* Status pills */
        .pills { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .pill {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 6px 14px;
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 99px;
            font-size: 12px; font-weight: 600;
            color: rgba(203,213,225,0.8);
        }
        .pill .dot {
            width: 6px; height: 6px; border-radius: 50%;
            animation: pulse 1.5s ease-in-out infinite;
        }
        .dot-yellow { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; }
        .dot-blue   { background: #60a5fa; box-shadow: 0 0 6px #60a5fa; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

        /* Admin link */
        .admin-link {
            display: block; margin-top: 32px;
            font-size: 12px; color: rgba(148,163,184,0.6);
            text-decoration: none;
            transition: color 0.2s;
        }
        .admin-link:hover { color: rgba(148,163,184,1); }
    </style>
</head>
<body>
    <div class="stars"></div>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <div class="card">
        <p class="logo-text">CSP Jaankari Portal</p>

        <div class="gear-wrap">
            <svg fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </div>

        <h1>Site Maintenance Chal Rahi Hai</h1>

        <p class="message">{{ $message }}</p>

        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>

        <div class="pills">
            <span class="pill"><span class="dot dot-yellow"></span> Maintenance Mode On</span>
            <span class="pill"><span class="dot dot-blue"></span> Jaldi Wapas Aayenge</span>
        </div>

        <a href="/login" class="admin-link">Admin? Login karein →</a>
    </div>
</body>
</html>
