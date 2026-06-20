'use client';
import { useEffect, useRef } from 'react';

// Controlled by the page timeline. When `active`, it renders the "other reality"
// of falling code that the shattered starfield is replaced with; `glitch` toggles
// the tearing/pixel-shatter deformation around the swap.
export default function MatrixRain({ active = false, glitch = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = 'アイウエオカキクケコサシスセソタチツテトﾅﾆﾇ01ｱｲｳｴｵ｜╠╣ABCDEF0123456789{}[]<>/=+*·'.split('');
    const fontSize = 15;
    const cols = Math.floor(canvas.width / fontSize);
    const drops = new Array(cols).fill(0).map(() => Math.random() * -120);
    const speeds = new Array(cols).fill(0).map(() => 0.5 + Math.random() * 0.8);
    // per-column depth: far columns are smaller/dimmer/slower -> volumetric, cinematic feel
    const depth = new Array(cols).fill(0).map(() => 0.4 + Math.pow(Math.random(), 1.6) * 0.6);
    let raf;
    const pick = () => chars[(Math.random() * chars.length) | 0];
    const W = canvas.width, H = canvas.height;
    // faint green, monochrome silhouettes of "another world" sitting behind the code
    const drawWorld = () => {
      ctx.save();
      // a large alien planet, upper right
      const cx = W * 0.72, cy = H * 0.40, R = Math.min(W, H) * 0.22;
      let pg = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.05, cx, cy, R);
      pg.addColorStop(0, 'rgba(90,220,140,0.11)');
      pg.addColorStop(0.7, 'rgba(30,120,70,0.06)');
      pg.addColorStop(1, 'rgba(8,40,24,0)');
      ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      // its orbital system — elliptical rings
      ctx.strokeStyle = 'rgba(70,200,120,0.07)'; ctx.lineWidth = 1.5;
      for (const rr of [R * 1.7, R * 2.4]) { ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr * 0.32, -0.45, 0, 7); ctx.stroke(); }
      // a small distant world, lower left
      const c2x = W * 0.18, c2y = H * 0.72, R2 = Math.min(W, H) * 0.08;
      let pg2 = ctx.createRadialGradient(c2x, c2y, 2, c2x, c2y, R2);
      pg2.addColorStop(0, 'rgba(130,235,160,0.11)');
      pg2.addColorStop(1, 'rgba(8,40,24,0)');
      ctx.fillStyle = pg2; ctx.beginPath(); ctx.arc(c2x, c2y, R2, 0, 7); ctx.fill();
      ctx.restore();
    };
    const draw = () => {
      // trail fade — keeps legible streaks, filmic but readable
      ctx.fillStyle = 'rgba(1, 6, 4, 0.10)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawWorld();
      ctx.textBaseline = 'top';
      for (let i = 0; i < drops.length; i++) {
        const d = depth[i];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.font = `700 ${(fontSize * (0.78 + d * 0.4)).toFixed(0)}px 'JetBrains Mono', Consolas, monospace`;
        // rare dropout for organic life
        if (Math.random() > 0.02) {
          // brighter, depth-faded body
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(58,220,120,${(0.6 * d).toFixed(3)})`;
          ctx.fillText(pick(), x, y);
          // crisp glowing head — clearly visible leading char
          ctx.shadowColor = '#56ff9c';
          ctx.shadowBlur = 8 * d;
          ctx.fillStyle = `rgba(214,255,228,${(0.96 * d).toFixed(3)})`;
          ctx.fillText(pick(), x, y + fontSize);
        }
        if (y > canvas.height && Math.random() > 0.975) { drops[i] = 0; speeds[i] = 0.5 + Math.random() * 0.8; }
        drops[i] += speeds[i] * (0.55 + d * 0.6);
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div className={`matrix-wrap ${active ? 'show' : ''} ${glitch ? 'glitch' : ''}`} aria-hidden>
      <canvas ref={canvasRef} className="matrix-canvas" />
    </div>
  );
}
