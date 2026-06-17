'use client';
import { useEffect, useRef, useState } from 'react';

// Periodic "matrix" code-rain that briefly replaces the star background
// every ~2-3 minutes, with a glitch/tearing transition.
export default function MatrixRain() {
  const canvasRef = useRef(null);
  const [active, setActive] = useState(false);
  const [glitch, setGlitch] = useState(false);

  // schedule activation more frequently (~40-80s) for ~5s with glitch in/out
  useEffect(() => {
    let timer;
    const schedule = () => {
      const delay = 40000 + Math.random() * 40000; // 40-80s
      timer = setTimeout(() => {
        setGlitch(true);
        setTimeout(() => { setActive(true); setGlitch(false); }, 500);
        setTimeout(() => { setGlitch(true); }, 5200);
        setTimeout(() => { setActive(false); setGlitch(false); schedule(); }, 5800);
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = 'アイウエオカキクケコサシスセソﾀﾁﾂ01ABCDEF<>/=+*¦'.split('');
    const fontSize = 15;
    const cols = Math.floor(canvas.width / fontSize);
    const drops = new Array(cols).fill(1).map(() => Math.random() * -120);
    let raf;
    const draw = () => {
      // crisp: stronger clear so trails are short and sharp
      ctx.fillStyle = 'rgba(1, 5, 3, 0.16)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '700 ' + fontSize + 'px Consolas, monospace';
      for (let i = 0; i < drops.length; i++) {
        const text = chars[(Math.random() * chars.length) | 0];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        // bright leading char
        ctx.fillStyle = '#d8ffe9';
        ctx.shadowColor = '#39ff8a';
        ctx.shadowBlur = 8;
        ctx.fillText(text, x, y);
        // dimmer trailing char
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1fbf5e';
        ctx.fillText(chars[(Math.random() * chars.length) | 0], x, y - fontSize);
        if (y > canvas.height && Math.random() > 0.97) drops[i] = 0;
        drops[i]++;
      }
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
