'use client';
import { useEffect, useRef, useState } from 'react';

// Periodic "matrix" code-rain that briefly replaces the star background
// every ~2-3 minutes, with a glitch/tearing transition.
export default function MatrixRain() {
  const canvasRef = useRef(null);
  const [active, setActive] = useState(false);
  const [glitch, setGlitch] = useState(false);

  // schedule activation every 2-3 minutes for ~6s
  useEffect(() => {
    let timer;
    const schedule = () => {
      const delay = 120000 + Math.random() * 60000; // 2-3 min
      timer = setTimeout(() => {
        setGlitch(true);
        setTimeout(() => { setActive(true); setGlitch(false); }, 650);
        setTimeout(() => { setGlitch(true); }, 6000);
        setTimeout(() => { setActive(false); setGlitch(false); schedule(); }, 6700);
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
    const chars = 'アイウエオカキクケコ01ｱｲｳABCDEF{}[]<>/=+*'.split('');
    const fontSize = 16;
    const cols = Math.floor(canvas.width / fontSize);
    const drops = new Array(cols).fill(1).map(() => Math.random() * -100);
    let raf;
    const draw = () => {
      ctx.fillStyle = 'rgba(2, 6, 4, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#34ff7a';
      ctx.font = fontSize + 'px monospace';
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
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
