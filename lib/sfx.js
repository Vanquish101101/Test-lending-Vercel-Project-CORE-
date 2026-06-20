// Procedural SFX engine (Web Audio). Used for the glitch "system malfunction + radio
// static" burst. Gated by `enabled` (driven by the sound toggle) and lazily unlocked
// on a user gesture, so nothing plays until the user turns sound on.

let ctx = null;
let enabled = false;

function ensureCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setSfxEnabled(v) {
  enabled = v;
  if (v) ensureCtx();
}

function distCurve(amount) {
  const n = 256, c = new Float32Array(n), k = amount;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    c[i] = ((3 + k) * x * 20 * Math.PI / 180) / (Math.PI + k * Math.abs(x));
  }
  return c;
}

// computer malfunction + radio interference burst
export function playGlitch() {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;
  const t = c.currentTime;
  const dur = 0.5 + Math.random() * 0.22;

  const out = c.createGain();
  out.gain.value = 0;
  out.connect(c.destination);

  // 1) radio static — white noise through a bandpass, gain stuttered like a broken signal
  const noise = c.createBufferSource();
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noise.buffer = buf;
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1700; bp.Q.value = 0.7;
  const ng = c.createGain(); ng.gain.value = 0;
  noise.connect(bp); bp.connect(ng); ng.connect(out);
  let tt = t;
  while (tt < t + dur) {
    const seg = 0.02 + Math.random() * 0.05;
    ng.gain.setValueAtTime(Math.random() < 0.5 ? 0 : 0.14 + Math.random() * 0.22, tt);
    tt += seg;
  }
  noise.start(t); noise.stop(t + dur);

  // 2) digital error — distorted square wave jumping pitch (data corruption screech)
  const osc = c.createOscillator(); osc.type = 'square';
  const ws = c.createWaveShaper(); ws.curve = distCurve(50);
  const og = c.createGain(); og.gain.value = 0;
  osc.connect(ws); ws.connect(og); og.connect(out);
  let ft = t;
  while (ft < t + dur) {
    const seg = 0.025 + Math.random() * 0.05;
    osc.frequency.setValueAtTime(110 + Math.random() * 1700, ft);
    og.gain.setValueAtTime(Math.random() < 0.4 ? 0 : 0.045 + Math.random() * 0.05, ft);
    ft += seg;
  }
  osc.start(t); osc.stop(t + dur);

  // 3) a couple of falling "error" beeps
  for (let i = 0; i < 2; i++) {
    const b = c.createOscillator(); b.type = 'sawtooth';
    const bg = c.createGain();
    const bt = t + Math.random() * dur * 0.6;
    const bd = 0.05 + Math.random() * 0.06;
    b.frequency.setValueAtTime(420 + Math.random() * 900, bt);
    b.frequency.exponentialRampToValueAtTime(120, bt + bd);
    bg.gain.setValueAtTime(0, bt);
    bg.gain.linearRampToValueAtTime(0.07, bt + 0.005);
    bg.gain.exponentialRampToValueAtTime(0.001, bt + bd);
    b.connect(bg); bg.connect(out);
    b.start(bt); b.stop(bt + bd + 0.02);
  }

  // master envelope
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(0.85, t + 0.02);
  out.gain.setValueAtTime(0.85, t + dur - 0.08);
  out.gain.exponentialRampToValueAtTime(0.001, t + dur);
}
