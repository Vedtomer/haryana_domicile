import React, { useEffect, useRef } from 'react';

/**
 * Footer-only multi-layer particle canvas.
 * Renders simultaneously:
 *   1. Network nodes  — dots connected by wires based on proximity
 *   2. Star sparkles  — small twinkling stars that pulse opacity
 *   3. Floating rings — hollow circles that drift and fade
 */
export default function FooterParticles({ style = {} }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let W = canvas.offsetWidth || window.innerWidth;
        let H = canvas.offsetHeight || 200;
        canvas.width  = W;
        canvas.height = H;

        /* ── 1. Network nodes ── */
        const nodes = Array.from({ length: 45 }, () => ({
            x:  Math.random() * W,
            y:  Math.random() * H,
            r:  Math.random() * 2 + 0.8,
            dx: (Math.random() - 0.5) * 0.4,
            dy: (Math.random() - 0.5) * 0.4,
            a:  Math.random() * 0.5 + 0.3,
        }));

        /* ── 2. Star sparkles ── */
        const stars = Array.from({ length: 35 }, () => ({
            x:     Math.random() * W,
            y:     Math.random() * H,
            r:     Math.random() * 1.4 + 0.4,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.03 + 0.015,
        }));

        /* ── 3. Floating rings ── */
        const rings = Array.from({ length: 10 }, () => ({
            x:    Math.random() * W,
            y:    Math.random() * H,
            r:    Math.random() * 22 + 8,
            dr:   Math.random() * 0.12 + 0.05,   // radius growth per frame
            a:    Math.random() * 0.25 + 0.08,
            dx:   (Math.random() - 0.5) * 0.3,
            dy:   (Math.random() - 0.5) * 0.3,
            maxR: Math.random() * 40 + 20,
        }));

        let raf;
        let t = 0;

        function reset(ring) {
            ring.x   = Math.random() * W;
            ring.y   = Math.random() * H;
            ring.r   = Math.random() * 8 + 4;
            ring.maxR= Math.random() * 40 + 20;
            ring.a   = Math.random() * 0.25 + 0.08;
        }

        function draw() {
            W = canvas.offsetWidth || window.innerWidth;
            H = canvas.offsetHeight || 200;
            canvas.width  = W;
            canvas.height = H;
            ctx.clearRect(0, 0, W, H);
            t++;

            /* — Draw wires — */
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx   = nodes[i].x - nodes[j].x;
                    const dy   = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const MAX  = 110;
                    if (dist < MAX) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = `rgba(147,197,253,${(1 - dist / MAX) * 0.28})`;
                        ctx.lineWidth   = 0.7;
                        ctx.stroke();
                    }
                }
            }

            /* — Draw network dots — */
            nodes.forEach(n => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle   = `rgba(147,197,253,${n.a})`;
                ctx.shadowBlur  = 4;
                ctx.shadowColor = 'rgba(147,197,253,0.5)';
                ctx.fill();
                ctx.shadowBlur  = 0;

                n.x += n.dx; n.y += n.dy;
                if (n.x < 0 || n.x > W) n.dx *= -1;
                if (n.y < 0 || n.y > H) n.dy *= -1;
            });

            /* — Draw star sparkles — */
            stars.forEach(s => {
                s.phase += s.speed;
                const alpha = (Math.sin(s.phase) * 0.5 + 0.5) * 0.7 + 0.1;
                const size  = s.r * (0.7 + 0.3 * Math.sin(s.phase * 1.3));

                ctx.beginPath();
                // 4-point star shape
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    const outer = size * 2.2;
                    const inner = size * 0.6;
                    ctx.lineTo(
                        s.x + Math.cos(angle) * outer,
                        s.y + Math.sin(angle) * outer
                    );
                    ctx.lineTo(
                        s.x + Math.cos(angle + Math.PI / 4) * inner,
                        s.y + Math.sin(angle + Math.PI / 4) * inner
                    );
                }
                ctx.closePath();
                ctx.fillStyle   = `rgba(200,225,255,${alpha})`;
                ctx.shadowBlur  = 6;
                ctx.shadowColor = 'rgba(147,197,253,0.8)';
                ctx.fill();
                ctx.shadowBlur  = 0;
            });

            /* — Draw floating rings — */
            rings.forEach(rg => {
                rg.r  += rg.dr;
                rg.x  += rg.dx;
                rg.y  += rg.dy;
                const progress = rg.r / rg.maxR;
                const alpha    = rg.a * (1 - progress);

                if (rg.r >= rg.maxR || alpha <= 0.01) {
                    reset(rg);
                } else {
                    ctx.beginPath();
                    ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(96,165,250,${alpha})`;
                    ctx.lineWidth   = 1;
                    ctx.stroke();
                }
            });

            raf = requestAnimationFrame(draw);
        }

        draw();

        const onResize = () => {
            W = canvas.offsetWidth || window.innerWidth;
            H = canvas.offsetHeight || 200;
        };
        window.addEventListener('resize', onResize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                ...style,
            }}
        />
    );
}
