'use client';
import { useEffect, useRef, useState } from 'react';

const PHRASES = [
  'Истинно ли то, что ты ищешь здесь...',
  'Помни: то, что ты ищешь, находится внутри тебя...',
  'Всё, что снаружи, то и внутри... как и то, что внутри — снаружи...',
  'Познай себя — и познаешь всё...',
];

// dark minor progression (root freqs, Hz) with minor-triad + 7th
const PROG = [
  { root: 55.0, intervals: [0, 3, 7, 10] },   // Am7
  { root: 43.65, intervals: [0, 4, 7, 11] },  // Fmaj7
  { root: 65.41, intervals: [0, 3, 7, 10] },  // Cm7-ish
  { root: 49.0, intervals: [0, 3, 7, 10] },   // Gm7
];
const semis = (f, n) => f * Math.pow(2, n / 12);

function makeDistCurve(amount) {
  const n = 1024, c = new Float32Array(n), k = amount;
  for (let i = 0; i < n; i++) { const x = (i / n) * 2 - 1; c[i] = ((3 + k) * x * 20 * Math.PI / 180) / (Math.PI + k * Math.abs(x)); }
  return c;
}

export default function AudioController() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef(null);
  const refs = useRef({});
  const voiceTimer = useRef(null);
  const phraseIdx = useRef(0);

  const build = () => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);

    // space: feedback delay
    const delay = ctx.createDelay(1.2); delay.delayTime.value = 0.5;
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    const wet = ctx.createGain(); wet.gain.value = 0.28;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);

    const bus = ctx.createGain(); bus.connect(master); bus.connect(delay);

    // ---- drone ----
    const droneFilter = ctx.createBiquadFilter(); droneFilter.type = 'lowpass'; droneFilter.frequency.value = 420; droneFilter.Q.value = 5; droneFilter.connect(bus);
    [55, 55.3, 82.4].forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = i === 2 ? 'triangle' : 'sawtooth'; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 10;
      const g = ctx.createGain(); g.gain.value = 0.12 / (i + 1); o.connect(g); g.connect(droneFilter); o.start();
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.03 + Math.random() * 0.05; const lg = ctx.createGain(); lg.gain.value = 0.05; lfo.connect(lg); lg.connect(g.gain); lfo.start();
    });
    // slow filter sweep -> transitions
    const sweep = ctx.createOscillator(); sweep.frequency.value = 0.01; const sg = ctx.createGain(); sg.gain.value = 260; sweep.connect(sg); sg.connect(droneFilter.frequency); sweep.start();

    // ---- pad (chords) ----
    const padFilter = ctx.createBiquadFilter(); padFilter.type = 'lowpass'; padFilter.frequency.value = 1600; padFilter.connect(bus);

    // ---- distorted bass ----
    const shaper = ctx.createWaveShaper(); shaper.curve = makeDistCurve(8); shaper.oversample = '4x';
    const bassFilter = ctx.createBiquadFilter(); bassFilter.type = 'lowpass'; bassFilter.frequency.value = 340;
    const bassGain = ctx.createGain(); bassGain.gain.value = 0.0;
    shaper.connect(bassFilter); bassFilter.connect(bassGain); bassGain.connect(bus);
    const bassOsc = ctx.createOscillator(); bassOsc.type = 'sawtooth'; bassOsc.frequency.value = 55; bassOsc.connect(shaper); bassOsc.start();

    master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 4);

    ctxRef.current = ctx;
    refs.current = { ctx, master, bus, padFilter, bassOsc, bassGain, shaper };

    scheduleMusic();
  };

  const scheduleMusic = () => {
    const { ctx, padFilter, bassOsc, bassGain } = refs.current;
    let step = 0;
    const tempo = 76; const beat = 60 / tempo;
    const playChord = (chord, when, dur) => {
      chord.intervals.forEach((iv, k) => {
        const o = ctx.createOscillator(); o.type = k === 0 ? 'sawtooth' : 'triangle';
        o.frequency.value = semis(chord.root * 4, iv) + (Math.random() - 0.5) * 0.6;
        const g = ctx.createGain(); g.gain.value = 0;
        o.connect(g); g.connect(padFilter);
        g.gain.setValueAtTime(0, when);
        g.gain.linearRampToValueAtTime(0.05, when + 0.8);
        g.gain.linearRampToValueAtTime(0.0001, when + dur);
        o.start(when); o.stop(when + dur + 0.1);
      });
    };
    const kick = (when) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.setValueAtTime(120, when); o.frequency.exponentialRampToValueAtTime(45, when + 0.12);
      g.gain.setValueAtTime(0.5, when); g.gain.exponentialRampToValueAtTime(0.001, when + 0.22);
      o.connect(g); g.connect(refs.current.master); o.start(when); o.stop(when + 0.25);
    };
    const tick = () => {
      if (!refs.current.ctx) return;
      const now = ctx.currentTime;
      const barLen = beat * 4;
      const chord = PROG[step % PROG.length];
      playChord(chord, now + 0.05, barLen * 1.05);
      // distorted bass follows root, with section intensity
      const intense = (step % 8) >= 4; // alternate calmer / driven sections
      bassOsc.frequency.setValueAtTime(chord.root, now + 0.05);
      bassGain.gain.cancelScheduledValues(now);
      bassGain.gain.setValueAtTime(intense ? 0.16 : 0.06, now + 0.05);
      padFilter.frequency.setTargetAtTime(intense ? 2600 : 1300, now, 1.5);
      // slow drive: kick on beats 1 and 3 in intense sections
      if (intense) { kick(now + 0.05); kick(now + beat * 2); }
      step++;
      refs.current.musicTimer = setTimeout(tick, barLen * 1000);
    };
    tick();
  };

  const speak = () => {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(PHRASES[phraseIdx.current % PHRASES.length]);
    phraseIdx.current++;
    u.lang = 'ru-RU';
    u.rate = 0.78;
    u.pitch = 0.2; // very low -> growl-ish
    const voices = window.speechSynthesis.getVoices();
    const ru = voices.find((v) => /ru/i.test(v.lang)) || null;
    if (ru) u.voice = ru;
    // grunge/computer distortion layer underneath the voice
    growlLayer(3.2);
    u.onend = () => stopGrowl();
    window.speechSynthesis.speak(u);
  };

  const growlLayer = (dur) => {
    const c = refs.current; if (!c || !c.ctx) return;
    const ctx = c.ctx;
    // ring-modulated distorted noise = robotic grunge texture
    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
    noise.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 4;
    const sh = ctx.createWaveShaper(); sh.curve = makeDistCurve(40); sh.oversample = '4x';
    const ring = ctx.createOscillator(); ring.type = 'square'; ring.frequency.value = 70;
    const ringGain = ctx.createGain(); ring.connect(ringGain.gain); ringGain.gain.value = 0;
    const g = ctx.createGain(); g.gain.value = 0.0;
    noise.connect(bp); bp.connect(sh); sh.connect(ringGain); ringGain.connect(g); g.connect(c.master);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.07, now + 0.2);
    g.gain.setValueAtTime(0.07, now + dur - 0.3); g.gain.linearRampToValueAtTime(0, now + dur);
    ring.start(now); noise.start(now); ring.stop(now + dur); noise.stop(now + dur);
    c.growl = { g };
  };
  const stopGrowl = () => {};

  const start = () => {
    if (ctxRef.current) { ctxRef.current.resume(); return; }
    build();
    setTimeout(speak, 1600);
    const loop = () => { voiceTimer.current = setTimeout(() => { speak(); loop(); }, 120000 + Math.random() * 60000); };
    loop();
  };
  const stop = () => {
    if (ctxRef.current) ctxRef.current.suspend();
    if (voiceTimer.current) clearTimeout(voiceTimer.current);
    if (refs.current.musicTimer) clearTimeout(refs.current.musicTimer);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };
  const toggle = () => setOn((p) => { const n = !p; if (n) start(); else stop(); return n; });

  useEffect(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button className="audio-btn" onClick={toggle} aria-label="Звук" title={on ? 'Выключить звук' : 'Включить звук'}>
      {on ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10v4h4l5 4V6L7 10H3z" fill="currentColor" stroke="none" />
          <path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10v4h4l5 4V6L7 10H3z" fill="currentColor" stroke="none" />
          <path d="M22 9l-6 6M16 9l6 6" />
        </svg>
      )}
    </button>
  );
}
