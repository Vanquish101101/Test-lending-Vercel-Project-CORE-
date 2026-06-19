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
    const fontSize = 12;
    const cols = Math.floor(canvas.width / fontSize);
    // tighter negative spread => more columns are already streaming on screen (a bit more code)
    const drops = new Array(cols).fill(0).map(() => Math.random() * -70);
    const speeds = new Array(cols).fill(0).map(() => 0.5 + Math.random() * 0.8);
    // per-column depth: far columns are smaller/dimmer/slower -> volumetric, cinematic feel
    const depth = new Array(cols).fill(0).map(() => 0.4 + Math.pow(Math.random(), 1.6) * 0.6);
    let raf, frame = 0;
    const pick = () => chars[(Math.random() * chars.length) | 0];
    const W = canvas.width, H = canvas.height;
    // sparse distant debris/dust — tiny, dim, barely-twinkling flecks (depth, not toy "stars")
    const debris = new Array(26).fill(0).map(() => ({
      x: Math.random() * W, y: Math.random() * H * 0.8,
      r: 0.6 + Math.random() * 1.5, a: 0.05 + Math.random() * 0.1,
      ph: Math.random() * Math.PI * 2, sp: 0.4 + Math.random() * 1.2,
    }));
    // faint green, monochrome silhouettes of "another world" sitting behind the code —
    // a believable, sober technical vista (no cartoon shapes): planet + moon in slow orbit,
    // a second distant world, a soft star-cluster haze, a tiny derelict satellite, dust.
    const drawWorld = (t) => {
      ctx.save();
      // distant star-cluster / nebula haze, upper-left diagonal band — adds depth, very faint
      for (let i = 0; i < 5; i++) {
        const f = i / 4;
        const nx = W * 0.05 + f * W * 0.5, ny = H * 0.10 + f * H * 0.22;
        const nr = Math.min(W, H) * 0.16 * (1 - f * 0.3);
        let ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        ng.addColorStop(0, 'rgba(110,210,150,0.045)');
        ng.addColorStop(1, 'rgba(8,40,24,0)');
        ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(nx, ny, nr, 0, 7); ctx.fill();
      }
      // sparse dust/debris flecks
      for (const d of debris) {
        const a = d.a * (0.6 + 0.4 * Math.sin(t * 0.05 * d.sp + d.ph));
        ctx.fillStyle = `rgba(140,230,170,${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill();
      }
      // a large alien planet, upper right
      const cx = W * 0.72, cy = H * 0.40, R = Math.min(W, H) * 0.22;
      let pg = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.05, cx, cy, R);
      pg.addColorStop(0, 'rgba(90,220,140,0.11)');
      pg.addColorStop(0.7, 'rgba(30,120,70,0.06)');
      pg.addColorStop(1, 'rgba(8,40,24,0)');
      ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      // its orbital system — elliptical rings
      const orbR = R * 1.7, orbRy = orbR * 0.32, rot = -0.45;
      ctx.strokeStyle = 'rgba(70,200,120,0.07)'; ctx.lineWidth = 1.5;
      for (const rr of [orbR, R * 2.4]) { ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr * 0.32, rot, 0, 7); ctx.stroke(); }
      // a small moon riding the inner orbit — slow, steady, real motion (not decorative spin)
      const ma = t * 0.004 + 1.1;
      const ex = orbR * Math.cos(ma), ey = orbRy * Math.sin(ma);
      const mx = cx + ex * Math.cos(rot) - ey * Math.sin(rot);
      const my = cy + ex * Math.sin(rot) + ey * Math.cos(rot);
      let mg = ctx.createRadialGradient(mx - 2, my - 2, 0.4, mx, my, R * 0.09);
      mg.addColorStop(0, 'rgba(205,255,218,0.17)');
      mg.addColorStop(1, 'rgba(8,40,24,0)');
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, R * 0.09, 0, 7); ctx.fill();
      // a small distant world, lower left
      const c2x = W * 0.18, c2y = H * 0.72, R2 = Math.min(W, H) * 0.08;
      let pg2 = ctx.createRadialGradient(c2x, c2y, 2, c2x, c2y, R2);
      pg2.addColorStop(0, 'rgba(130,235,160,0.11)');
      pg2.addColorStop(1, 'rgba(8,40,24,0)');
      ctx.fillStyle = pg2; ctx.beginPath(); ctx.arc(c2x, c2y, R2, 0, 7); ctx.fill();
      // a tiny derelict satellite silhouette — thin sober technical lines, not an icon
      const sx = W * 0.86, sy = H * 0.22;
      ctx.strokeStyle = 'rgba(150,255,190,0.16)'; ctx.lineWidth = 1;
      ctx.strokeRect(sx - 1, sy - 5, 2, 10);
      ctx.strokeRect(sx - 14, sy - 2, 10, 4);
      ctx.strokeRect(sx + 4, sy - 2, 10, 4);
      ctx.beginPath(); ctx.moveTo(sx - 4, sy); ctx.lineTo(sx + 4, sy); ctx.stroke();
      // ---- realism pass: sober man-made / structural geometry, thin faint lines ----
      // lat/long wireframe over the main planet so it reads as a real, structured body
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.94, 0, 7); ctx.clip();
      ctx.strokeStyle = 'rgba(85,215,135,0.05)'; ctx.lineWidth = 1;
      for (let k = 1; k <= 3; k++) {
        ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.94 * (k / 3), R * 0.94, 0, 0, 7); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(cx, cy - R * 0.94); ctx.lineTo(cx, cy + R * 0.94); ctx.stroke();
      for (let k = -2; k <= 2; k++) {
        const yy = cy + (k / 3) * R * 0.94;
        const w = R * 0.94 * Math.sqrt(Math.max(0, 1 - (k / 3) ** 2));
        ctx.beginPath(); ctx.ellipse(cx, yy, w, w * 0.16, 0, 0, 7); ctx.stroke();
      }
      ctx.restore();
      // an orbital space station drifting slowly, upper-left: central truss + pressurised
      // modules + two solar-panel arrays — unmistakably built, but quiet and monochrome
      ctx.save();
      ctx.translate(W * 0.13 + Math.sin(t * 0.002) * 5, H * 0.19 + Math.cos(t * 0.0016) * 4);
      ctx.rotate(-0.28);
      ctx.strokeStyle = 'rgba(150,255,190,0.12)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-36, 0); ctx.lineTo(36, 0); ctx.stroke();
      for (let i = -30; i <= 30; i += 6) {
        ctx.beginPath(); ctx.moveTo(i, -3); ctx.lineTo(i + 6, 3); ctx.moveTo(i + 6, -3); ctx.lineTo(i, 3); ctx.stroke();
      }
      ctx.strokeRect(-7, -5, 14, 10); ctx.strokeRect(9, -3.5, 7, 7);
      for (const px of [-36, 20]) {
        ctx.strokeRect(px, -13, 16, 26);
        for (let c = 1; c < 4; c++) { ctx.beginPath(); ctx.moveTo(px + c * 4, -13); ctx.lineTo(px + c * 4, 13); ctx.stroke(); }
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px + 16, 0); ctx.stroke();
      }
      ctx.restore();
      // a distant derelict ring-station near the far world, lower-left — wheel-and-spokes
      const ringx = W * 0.31, ringy = H * 0.80, rr2 = 24, ry2 = rr2 * 0.34;
      ctx.strokeStyle = 'rgba(120,235,165,0.1)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(ringx, ringy, rr2, ry2, 0, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(ringx, ringy, rr2 * 0.55, ry2 * 0.55, 0, 0, 7); ctx.stroke();
      for (let a = 0; a < 6; a++) {
        const ang = (a / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(ringx + Math.cos(ang) * rr2 * 0.55, ringy + Math.sin(ang) * ry2 * 0.55);
        ctx.lineTo(ringx + Math.cos(ang) * rr2, ringy + Math.sin(ang) * ry2); ctx.stroke();
      }
      ctx.restore();
    };
    const draw = () => {
      frame++;
      // trail fade — keeps legible streaks, filmic but readable
      ctx.fillStyle = 'rgba(1, 6, 4, 0.10)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawWorld(frame);
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
