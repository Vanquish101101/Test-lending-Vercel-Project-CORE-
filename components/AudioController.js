'use client';
import { useEffect, useRef, useState } from 'react';
import { setSfxEnabled } from '@/lib/sfx';

const PHRASES = [
  'Истинно ли то, что ты ищешь здесь...',
  'Помни: то, что ты ищешь, находится внутри тебя...',
  'Всё, что снаружи, то и внутри... как и то, что внутри — снаружи...',
  'Познай себя — и познаешь всё...',
];

export default function AudioController() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const nodesRef = useRef([]);
  const voiceTimer = useRef(null);
  const phraseIdx = useRef(0);
  const stopBed = useRef(null);

  // radio-transmission crackle bed that wraps the spoken voice -> computer/grunge feel
  const voiceBed = () => {
    const ctx = ctxRef.current;
    if (!ctx) return () => {};
    const out = ctx.createGain(); out.gain.value = 0;
    out.connect(masterRef.current || ctx.destination);
    // band-passed static crackle
    const src = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 2), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
    src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.9;
    src.connect(bp); bp.connect(out);
    // low ring-mod tone = robotic comms character
    const ring = ctx.createOscillator(); ring.type = 'square'; ring.frequency.value = 70;
    const rg = ctx.createGain(); rg.gain.value = 0.018; ring.connect(rg); rg.connect(out);
    out.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.12);
    src.start(); ring.start();
    return () => {
      const tn = ctx.currentTime;
      out.gain.linearRampToValueAtTime(0, tn + 0.18);
      setTimeout(() => { try { src.stop(); ring.stop(); } catch (e) {} }, 280);
    };
  };

  // brighter, airier shimmer bed for the female voice — modeled on the reference clip:
  // a higher band-passed hiss pushed through a soft-clip shaper for broadband harmonic
  // shimmer (reaches up into the high end, unlike plain noise), plus a slow amplitude
  // flutter so the bed breathes with the voice instead of sitting static underneath it
  const voiceBedFemale = () => {
    const ctx = ctxRef.current;
    if (!ctx) return () => {};
    const out = ctx.createGain(); out.gain.value = 0;
    out.connect(masterRef.current || ctx.destination);
    const src = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 2), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
    src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3400; bp.Q.value = 1.1;
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i / 255) * 2 - 1; curve[i] = Math.tanh(x * 2.2); }
    shaper.curve = curve;
    src.connect(bp); bp.connect(shaper); shaper.connect(out);
    // airy top band (~7kHz) — the reference clip carries energy well into the high end;
    // a separate gentle high band gives that synthetic "sheen" without muddying the body
    const air = ctx.createBiquadFilter(); air.type = 'bandpass'; air.frequency.value = 7200; air.Q.value = 0.8;
    const airGain = ctx.createGain(); airGain.gain.value = 0.5;
    src.connect(air); air.connect(airGain); airGain.connect(out);
    // higher shimmer tone -> brighter, more synthetic edge than the male ring tone
    const ring = ctx.createOscillator(); ring.type = 'square'; ring.frequency.value = 165;
    const rg = ctx.createGain(); rg.gain.value = 0.012; ring.connect(rg); rg.connect(out);
    // faint continuous low hum/texture that persists even through pauses (as in the reference,
    // where a low bed never fully drops to silence) — kept very quiet so it just "breathes"
    const hum = ctx.createOscillator(); hum.type = 'triangle'; hum.frequency.value = 88;
    const humGain = ctx.createGain(); humGain.gain.value = 0.01; hum.connect(humGain); humGain.connect(out);
    // slow amplitude flutter so the bed moves with the voice instead of sitting flat
    const flutter = ctx.createOscillator(); flutter.frequency.value = 5.0;
    const flutterGain = ctx.createGain(); flutterGain.gain.value = 0.018;
    flutter.connect(flutterGain); flutterGain.connect(out.gain);
    out.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.12);
    src.start(); ring.start(); hum.start(); flutter.start();
    return () => {
      const tn = ctx.currentTime;
      out.gain.linearRampToValueAtTime(0, tn + 0.18);
      setTimeout(() => { try { src.stop(); ring.stop(); hum.stop(); flutter.stop(); } catch (e) {} }, 280);
    };
  };

  const buildAmbient = () => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 6;
    filter.connect(master);

    // dark-ambient drone: detuned low oscillators
    const freqs = [55, 82.4, 110, 164.8];
    const oscs = freqs.map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 === 0 ? 'sine' : 'triangle';
      o.frequency.value = f;
      o.detune.value = (Math.random() - 0.5) * 14;
      const g = ctx.createGain();
      g.gain.value = 0.18 / (i + 1);
      o.connect(g); g.connect(filter);
      o.start();
      // slow LFO on gain for movement
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.03 + Math.random() * 0.05;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.06;
      lfo.connect(lfoGain); lfoGain.connect(g.gain);
      lfo.start();
      return [o, lfo];
    });

    // slow filter sweep for a non-repeating feel
    const sweep = ctx.createOscillator();
    sweep.frequency.value = 0.012;
    const sweepGain = ctx.createGain();
    sweepGain.gain.value = 280;
    sweep.connect(sweepGain); sweepGain.connect(filter.frequency);
    sweep.start();

    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 4);
    ctxRef.current = ctx;
    masterRef.current = master;
    nodesRef.current = [...oscs.flat(), sweep];
  };

  const speak = () => {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(PHRASES[phraseIdx.current % PHRASES.length]);
    phraseIdx.current++;
    u.lang = 'ru-RU';
    // husky, computer-grunge delivery: lowered pitch + a touch quicker than before
    u.rate = 0.92;
    u.pitch = 0.8;
    u.volume = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const femaleRu = voices.find((v) => /ru/i.test(v.lang) && /female|женск|Irina|Milena|Svetlana|Tatyana|Alyona/i.test(v.name));
    const ru = femaleRu || voices.find((v) => /ru/i.test(v.lang));
    if (ru) u.voice = ru;
    // wrap the voice in a radio-comms crackle bed (brighter shimmer bed for the female voice)
    u.onstart = () => { if (stopBed.current) stopBed.current(); stopBed.current = femaleRu ? voiceBedFemale() : voiceBed(); };
    u.onend = () => { if (stopBed.current) { stopBed.current(); stopBed.current = null; } };
    u.onerror = u.onend;
    window.speechSynthesis.speak(u);
  };

  const start = () => {
    if (ctxRef.current) { ctxRef.current.resume(); return; }
    buildAmbient();
    // greeting + recurring phrases every 2-3 min
    setTimeout(speak, 1500);
    const loop = () => {
      voiceTimer.current = setTimeout(() => { speak(); loop(); }, 120000 + Math.random() * 60000);
    };
    loop();
  };

  const stop = () => {
    if (ctxRef.current) ctxRef.current.suspend();
    if (voiceTimer.current) clearTimeout(voiceTimer.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  const toggle = () => {
    setOn((prev) => {
      const next = !prev;
      if (next) start(); else stop();
      setSfxEnabled(next); // glitch SFX follows the sound toggle
      return next;
    });
  };

  // try to warm up voices list
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
