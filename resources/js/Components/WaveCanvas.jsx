import React, { useEffect, useRef } from 'react';

/**
 * Scroll-reactive water wave — only the sine wave shape is visible.
 * The fill fades from transparent → color so no hard rectangle edge shows.
 *
 * Props:
 *   color    – wave peak color (rgba string)
 *   color2   – second wave color (rgba string)
 *   height   – canvas height in px (default 44)
 *   flip     – render upside-down for footer top edge
 */
export default function WaveCanvas({
    color  = 'rgba(96,165,250,0.3)',
    color2 = 'rgba(147,197,253,0.18)',
    height = 44,
    flip   = false,
    style  = {},
}) {
    const canvasRef = useRef(null);
    const velRef    = useRef(0);
    const scrollRef = useRef(0);

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            velRef.current = Math.abs(y - scrollRef.current);
            scrollRef.current = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let W = canvas.offsetWidth || window.innerWidth;
        const H = height;
        canvas.width  = W;
        canvas.height = H;

        let o1 = 0, o2 = Math.PI;
        let amp = 8;
        let raf;

        const parseColor = (rgba) => {
            // Extract rgb part for gradient stops
            return rgba.replace(/rgba?\(([^,]+,[^,]+,[^,]+)[^)]*\)/, 'rgba($1,');
        };

        function buildGrad(fillColor, yCenter) {
            let grad;
            if (!flip) {
                // Header: transparent at top, opaque near wave bottom
                grad = ctx.createLinearGradient(0, 0, 0, H);
                grad.addColorStop(0,   'rgba(0,0,0,0)');
                grad.addColorStop(0.3, 'rgba(0,0,0,0)');
                grad.addColorStop(1,   fillColor);
            } else {
                // Footer: opaque near wave top, transparent at bottom
                grad = ctx.createLinearGradient(0, 0, 0, H);
                grad.addColorStop(0,   fillColor);
                grad.addColorStop(0.7, 'rgba(0,0,0,0)');
                grad.addColorStop(1,   'rgba(0,0,0,0)');
            }
            return grad;
        }

        function drawWave(fillColor, offset, waveAmp, freq) {
            ctx.beginPath();
            if (!flip) {
                // Fill FROM wave curve DOWN to canvas bottom
                ctx.moveTo(0, H);
                for (let x = 0; x <= W; x += 2) {
                    const y = H * 0.35 + waveAmp * Math.sin((x / W) * freq * Math.PI * 2 + offset);
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(W, H);
                ctx.closePath();
            } else {
                // Fill FROM canvas top DOWN to wave curve (upside-down)
                ctx.moveTo(0, 0);
                for (let x = 0; x <= W; x += 2) {
                    const y = H * 0.65 + waveAmp * Math.sin((x / W) * freq * Math.PI * 2 + offset);
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(W, 0);
                ctx.closePath();
            }
            ctx.fillStyle = buildGrad(fillColor, H * 0.5);
            ctx.fill();
        }

        function draw() {
            W = canvas.offsetWidth || window.innerWidth;
            canvas.width = W;

            const targetAmp = 8 + Math.min(velRef.current * 1.5, 22);
            amp += (targetAmp - amp) * 0.08;
            velRef.current *= 0.88;

            ctx.clearRect(0, 0, W, H);

            drawWave(color,  o1, amp,        2.4);
            drawWave(color2, o2, amp * 0.65, 3.1);

            o1 += 0.018;
            o2 -= 0.013;

            raf = requestAnimationFrame(draw);
        }

        draw();

        const onResize = () => {
            W = canvas.offsetWidth || window.innerWidth;
            canvas.width  = W;
            canvas.height = H;
        };
        window.addEventListener('resize', onResize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
        };
    }, [color, color2, height, flip]);

    return (
        <canvas
            ref={canvasRef}
            height={height}
            style={{
                display: 'block',
                width: '100%',
                height: height,
                pointerEvents: 'none',
                ...style,
            }}
        />
    );
}
