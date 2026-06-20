'use client';
import { useEffect, useRef } from 'react';

// The "tear": while `active` (glitch), the starfield deforms and shatters into a
// dissolving pixel mosaic, fractured by displaced data-slabs with hard RGB split —
// a serious cinematic malfunction (not toy-green). Masked (CSS) to the star background
// so the planet stays clean.
export default function GlitchFX({ active = false }) {
  const ref = useRef();

  useEffect(() => {
    if (!active) return;
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = (cv.width = window.innerWidth);
    const H = (cv.height = window.innerHeight);
    let raf, frame = 0;

    // one tile of the mosaic — richer palette: mostly dark, some code-green, rare bright
    const tile = (x, y, s) => {
      const r = Math.random();
      let col;
      if (r < 0.5) { const v = 10 + Math.random() * 30; col = `rgba(${(v * 0.4) | 0},${v | 0},${(v * 0.6) | 0},${(0.35 + Math.random() * 0.4).toFixed(3)})`; }       // dark
      else if (r < 0.9) { const v = 90 + Math.random() * 150; col = `rgba(${(v * 0.22) | 0},${v | 0},${(v * 0.5) | 0},${(0.20 + Math.random() * 0.45).toFixed(3)})`; }  // code-green
      else { const v = 180 + Math.random() * 60; col = `rgba(${v | 0},${(v + 10) | 0},${(v * 0.9) | 0},${(0.25 + Math.random() * 0.4).toFixed(3)})`; }                 // rare bright
      ctx.fillStyle = col;
      ctx.fillRect(x, y, s - 1, s - 1);
    };

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);

      // base dissolving mosaic across the field — block size pulses (the crumble)
      const block = 5 + (0.5 + 0.5 * Math.sin(frame * 0.4)) * 16;
      for (let y = 0; y < H; y += block) {
        for (let x = 0; x < W; x += block) {
          if (Math.random() < 0.5) continue; // gaps -> dissolving
          const dx = Math.random() < 0.18 ? (Math.random() * 16 - 8) : 0;
          tile((x + dx) | 0, y, Math.ceil(block));
        }
      }

      // FRACTURE: a few big horizontal data-slabs violently shifted with hard RGB split
      const slabs = 2 + ((Math.random() * 3) | 0);
      for (let i = 0; i < slabs; i++) {
        const sh = 14 + Math.random() * 80;
        const sy = Math.random() * (H - sh);
        const shift = (Math.random() * 90 - 45) | 0; // strong sideways tear
        const fb = 4 + Math.random() * 9;
        for (let y = sy; y < sy + sh; y += fb) {
          for (let x = 0; x < W; x += fb) {
            if (Math.random() < 0.45) continue;
            tile((x + shift) | 0, y | 0, Math.ceil(fb));
          }
        }
        // chromatic fracture edges
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255,32,64,0.14)'; ctx.fillRect(shift - 5, sy, W, sh);
        ctx.fillStyle = 'rgba(40,160,255,0.14)'; ctx.fillRect(shift + 5, sy, W, sh);
        ctx.globalCompositeOperation = 'source-over';
      }

      // thin bright scanline slips
      for (let i = 0; i < 2; i++) {
        if (Math.random() < 0.5) {
          const yy = Math.random() * H;
          ctx.fillStyle = `rgba(190,255,215,${(0.05 + Math.random() * 0.1).toFixed(3)})`;
          ctx.fillRect(0, yy, W, 1 + Math.random() * 2);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return <canvas ref={ref} className={`glitchfx ${active ? 'on' : ''}`} aria-hidden />;
}
