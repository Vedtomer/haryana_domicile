<x-filament-panels::page>
    <canvas id="gravityCanvas" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; background: linear-gradient(to bottom, #0f2027, #203a43, #2c5364);"></canvas>

    <div style="position: relative; z-index: 10;">
        <x-filament-panels::form wire:submit="generatePdf">
            {{ $this->form }}
    
            <div class="flex justify-end gap-x-3">
                <x-filament::button type="submit">
                    Generate & Download PDF
                </x-filament::button>
            </div>
        </x-filament-panels::form>
    </div>

    <script>
        const canvas = document.getElementById("gravityCanvas");
        if (canvas) {
            const ctx = canvas.getContext("2d");
    
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
    
            let particles = [];
    
            class Particle {
                constructor() {
                    this.x = Math.random() * canvas.width;
                    this.y = canvas.height + Math.random() * 100;
                    this.size = Math.random() * 4 + 1;
                    this.speedY = Math.random() * 2 + 1;
                    this.opacity = Math.random();
                }
    
                update() {
                    this.y -= this.speedY;
                    if (this.y < 0) {
                        this.y = canvas.height;
                        this.x = Math.random() * canvas.width;
                    }
                }
    
                draw() {
                    ctx.fillStyle = "rgba(255,255,255," + this.opacity + ")";
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
    
            function init() {
                particles = []; // Reset particles
                for (let i = 0; i < 100; i++) {
                    particles.push(new Particle());
                }
            }
    
            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    p.update();
                    p.draw();
                });
                requestAnimationFrame(animate);
            }
    
            init();
            animate();
            
            // Handle window resize
            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                init();
            });
        }
    </script>
</x-filament-panels::page>
