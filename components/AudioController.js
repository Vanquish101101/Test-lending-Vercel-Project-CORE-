'use client';
import { useEffect, useRef, useState } from 'react';

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
    u.rate = 0.82;
    u.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const ru = voices.find((v) => /ru/i.test(v.lang) && /female|женск|Irina|Milena|Svetlana/i.test(v.name))
      || voices.find((v) => /ru/i.test(v.lang));
    if (ru) u.voice = ru;
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
