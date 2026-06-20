'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CyberMenu from '@/components/CyberMenu';
import Sections from '@/components/Sections';
import AudioController from '@/components/AudioController';
import SideCode from '@/components/SideCode';
import MatrixRain from '@/components/MatrixRain';

const HeroScene = dynamic(() => import('@/components/HeroScene'), { ssr: false });

export default function Page() {
  // One cinematic timeline drives BOTH the 3D scene and the code overlay so the
  // starfield can shatter -> vanish -> become falling code -> rebuild, in sync.
  const [fx, setFx] = useState({ glitch: false, code: false, dim: false, realistic: false });

  useEffect(() => {
    let timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const set = (patch) => setFx((p) => ({ ...p, ...patch }));

    const run = () => {
      // 1) tear opens: starfield deforms & melts into pixels, fading away
      set({ glitch: true, dim: true });
      // 2) stars gone -> other reality (falling code) + planet skin turns realistic
      at(460, () => set({ code: true, realistic: true }));
      at(620, () => set({ glitch: false }));
      // 3) ~1s of the code reality
      at(1620, () => set({ glitch: true }));            // tear opens again to swap back
      at(2080, () => set({ code: false, dim: false, realistic: false })); // stars rebuild
      at(2520, () => { set({ glitch: false }); schedule(); });
    };
    const schedule = () => at(25000 + Math.random() * 20000, run); // every 25–45s
    schedule();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <main>
      <CyberMenu />
      <AudioController />
      <SideCode />

      <section className="hero">
        <div className="hero-canvas-wrap">
          <HeroScene dim={fx.dim} realistic={fx.realistic} />
        </div>
        <MatrixRain active={fx.code} glitch={fx.glitch} />
        {/* energy flash / shockwave at the moment reality tears */}
        <div className={`warp ${fx.glitch ? 'on' : ''}`} aria-hidden />
        {/* cinematic film grain + vignette overlay */}
        <div className="hero-fx" aria-hidden />
        <motion.div
          className="title-core"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, delay: 0.6 }}
        >
          <div className="tc-head">
            <span className="project cyber-font">PROJECT</span>
            <span className="core cyber-font">C.O.R.E.</span>
          </div>
          <div className="tc-row">
            <div className="tc-arrows" aria-hidden>
              <i className="tc-arrow" /><i className="tc-arrow" /><i className="tc-arrow" /><i className="tc-arrow" />
            </div>
            <ul className="tc-list cyber-font">
              <li><a href="#themes">ENCOUNTER</a></li>
              <li><a href="#benefits">RESOURCES</a></li>
              <li><a href="#about">ORGANISATION</a></li>
              <li><a href="#footer">COMMUNITY</a></li>
            </ul>
          </div>
        </motion.div>
      </section>

      <Sections />
    </main>
  );
}
