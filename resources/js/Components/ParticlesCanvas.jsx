import React, { useEffect, useRef } from 'react';

/**
 * Animated particles with connecting wires between nearby nodes.
 * Props:
 *   count       – number of particles
 *   color       – particle & wire base color (rgb string, e.g. "255,255,255")
 *   maxDist     – max pixel distance to draw a wire (default 120)
 */
export default function ParticlesCanvas({ count = 60, color = '255,255,255', maxDist = 120, style = {} }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let W = canvas.offsetWidth;
        let H = canvas.offsetHeight;
        canvas.width  = W;
        canvas.height = H;

        const particles = Array.from({ length: count }, () => ({
            x:     Math.random() * W,
            y:     Math.random() * H,
            r:     Math.random() * 2.2 + 0.8,
            dx:    (Math.random() - 0.5) * 0.5,
            dy:    (Math.random() - 0.5) * 0.5,
            alpha: Math.random() * 0.5 + 0.4,
        }));

        let raf;
        function draw() {
            ctx.clearRect(0, 0, W, H);

            // Draw wires first (below dots)
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx   = particles[i].x - particles[j].x;
                    const dy   = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < maxDist) {
                        const opacity = (1 - dist / maxDist) * 0.35;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(${color},${opacity})`;
                        ctx.lineWidth   = 0.8;
                        ctx.stroke();
                    }
                }
            }

            // Draw dots
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle   = `rgba(${color},${p.alpha})`;
                ctx.shadowBlur  = 4;
                ctx.shadowColor = `rgba(${color},0.6)`;
                ctx.fill();

                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0 || p.x > W) p.dx *= -1;
                if (p.y < 0 || p.y > H) p.dy *= -1;
            });

            raf = requestAnimationFrame(draw);
        }
        draw();

        const onResize = () => {
            W = canvas.offsetWidth;
            H = canvas.offsetHeight;
            canvas.width  = W;
            canvas.height = H;
        };
        window.addEventListener('resize', onResize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
        };
    }, [count, color, maxDist]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                pointerEvents: 'none',
                ...style,
            }}
        />
    );
}
