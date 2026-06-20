'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CyberMenu from '@/components/CyberMenu';
import Sections from '@/components/Sections';
import AudioController from '@/components/AudioController';
import SideCode from '@/components/SideCode';
import MatrixRain from '@/components/MatrixRain';
import GlitchFX from '@/components/GlitchFX';
import { playGlitch } from '@/lib/sfx';

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
      // 1) tear opens: starfield deforms & shatters into a dissolving pixel mosaic; stars fade out
      set({ glitch: true, dim: true });
      playGlitch(); // system-malfunction + radio-static burst
      // 2) stars gone -> other reality (falling code + green alien world) + realistic planet skin
      at(450, () => set({ code: true, realistic: true }));
      at(700, () => set({ glitch: false }));
      // 3) ~1.5s of the other reality
      at(1750, () => { set({ glitch: true }); playGlitch(); }); // tear re-opens to swap back
      at(1950, () => set({ code: false, dim: false, realistic: false })); // code total 450->1950 = 1.5s
      at(2400, () => { set({ glitch: false }); schedule(); });
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
        {/* the starfield shattering into a dissolving pixel mosaic during the tear */}
        <GlitchFX active={fx.glitch} />
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
