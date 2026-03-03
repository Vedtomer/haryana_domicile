<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Login Portal</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        /* Modern Gradient Background */
        body {
            background: linear-gradient(-45deg, #4f46e5, #ec4899, #8b5cf6, #3b82f6);
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
            margin: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', sans-serif;
            overflow: hidden;
        }

        @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* Glassmorphism Card */
        .glass-panel {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        /* Custom Input Styling */
        .input-field {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            transition: all 0.3s ease;
        }
        
        .input-field:focus {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.5);
            outline: none;
            box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
        }

        .input-field::placeholder { color: rgba(255, 255, 255, 0.6); }

        /* Floating Animation for Decoration */
        .floating { animation: float 6s ease-in-out infinite; }
        .floating-delayed { animation: float 6s ease-in-out 3s infinite; }

        @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
        }

        /* Loading Spinner */
        #login-btn-spinner { display: none; }
        .is-loading #login-btn-text { display: none; }
        .is-loading #login-btn-spinner { display: inline-block; }
    </style>
</head>
<body>

    <!-- Decorative Elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div class="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-20 -left-20 floating"></div>
        <div class="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 right-0 floating-delayed"></div>
        <div class="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 floating"></div>
    </div>

    <!-- Login Container -->
    <div class="relative z-10 w-full max-w-md px-6">
        <div class="glass-panel rounded-3xl p-8 sm:p-10 w-full transform transition-all duration-500 hover:scale-[1.01]">
            
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 shadow-xl mb-4 backdrop-blur-md border border-white/20">
                    <i class="fa-solid fa-code text-3xl text-white"></i>
                </div>
                <h1 class="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p class="text-gray-200 text-sm">Sign in to your dashboard</p>
            </div>

            <!-- Login Form -->
            <form id="loginForm" action="#" method="POST" class="space-y-6">
                
                <!-- Email Input -->
                <div class="space-y-2">
                    <label class="text-sm font-medium text-white/90 pl-1 block">Email Address</label>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-white transition-colors">
                            <i class="fa-regular fa-envelope"></i>
                        </div>
                        <input type="email" name="email" required placeholder="admin@example.com" 
                            class="input-field w-full pl-11 pr-4 py-3.5 rounded-xl text-sm w-full block">
                    </div>
                </div>

                <!-- Password Input -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between px-1">
                        <label class="text-sm font-medium text-white/90">Password</label>
                        <a href="#" class="text-xs text-indigo-200 hover:text-white transition-colors">Forgot Password?</a>
                    </div>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-white transition-colors">
                            <i class="fa-solid fa-lock"></i>
                        </div>
                        <input type="password" id="password" name="password" required placeholder="••••••••" 
                            class="input-field w-full pl-11 pr-12 py-3.5 rounded-xl text-sm w-full block">
                        <!-- Toggle Password Visibility -->
                        <button type="button" id="togglePassword" class="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white transition-colors focus:outline-none">
                            <i class="fa-regular fa-eye" id="eyeIcon"></i>
                        </button>
                    </div>
                </div>

                <!-- Remember Me -->
                <div class="flex items-center pl-1">
                    <label class="flex items-center cursor-pointer">
                        <div class="relative">
                            <input type="checkbox" class="sr-only">
                            <div class="block w-5 h-5 border border-white/30 rounded bg-white/10 transition-colors"></div>
                            <div class="absolute inset-0 flex items-center justify-center text-white opacity-0 transition-opacity peer-checked:opacity-100">
                                <i class="fa-solid fa-check text-xs"></i>
                            </div>
                        </div>
                        <span class="ml-2 text-sm text-white/90">Remember me</span>
                    </label>
                </div>

                <!-- Submit Button -->
                <button type="submit" id="loginBtn" class="w-full bg-white text-indigo-600 font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transform hover:-translate-y-0.5 transition-all duration-300 relative group overflow-hidden">
                    <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    <span id="login-btn-text">Sign In</span>
                    <i id="login-btn-spinner" class="fa-solid fa-circle-notch fa-spin"></i>
                </button>

            </form>

            <!-- Social Login -->
            <div class="mt-8 pt-6 border-t border-white/10">
                <p class="text-center text-xs text-white/60 mb-4">Or continue with</p>
                <div class="flex gap-4 justify-center">
                    <button class="w-12 h-12 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all hover:scale-110">
                        <i class="fa-brands fa-google"></i>
                    </button>
                    <button class="w-12 h-12 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all hover:scale-110">
                        <i class="fa-brands fa-github"></i>
                    </button>
                    <button class="w-12 h-12 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all hover:scale-110">
                        <i class="fa-brands fa-linkedin-in"></i>
                    </button>
                </div>
            </div>

        </div>
        
        <p class="text-center text-white/60 text-xs mt-8">
            Dont have an account? <a href="#" class="text-white hover:underline font-medium">Create one now</a>
        </p>
    </div>

    <style>
        @keyframes shimmer {
            100% { transform: translateX(100%); }
        }
    </style>

    <script>
        // Password Visibility Toggle
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eyeIcon');

        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            if(type === 'text') {
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            } else {
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
        });

        // Custom Checkbox Logic
        const checkboxInput = document.querySelector('input[type="checkbox"]');
        const checkIcon = checkboxInput.nextElementSibling.nextElementSibling;
        
        checkboxInput.addEventListener('change', function() {
            if(this.checked) {
                checkIcon.style.opacity = '1';
                this.nextElementSibling.style.backgroundColor = 'rgba(255,255,255,0.3)';
            } else {
                checkIcon.style.opacity = '0';
                this.nextElementSibling.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }
        });

        // Form Submit Simulation (for demo)
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Show loading state
            loginBtn.classList.add('is-loading');
            
            // Simulate network request
            setTimeout(() => {
                loginBtn.classList.remove('is-loading');
                // You can add your actual redirect/login logic here
                alert('Login validation simulation completed!');
            }, 1500);
        });
    </script>
</body>
</html>
