'use client';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import CyberMenu from '@/components/CyberMenu';
import Sections from '@/components/Sections';
import AudioController from '@/components/AudioController';
import SideCode from '@/components/SideCode';
import MatrixRain from '@/components/MatrixRain';

const HeroScene = dynamic(() => import('@/components/HeroScene'), { ssr: false });

export default function Page() {
  return (
    <main>
      <CyberMenu />
      <AudioController />
      <SideCode />

      <section className="hero">
        <div className="hero-canvas-wrap">
          <HeroScene />
        </div>
        <MatrixRain />
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
            <ul className="tc-list cyber-font">
              <li><a href="#themes">ENCOUNTER</a></li>
              <li><a href="#benefits">RESOURCES</a></li>
              <li><a href="#about">ORGANISATION</a></li>
              <li><a href="#footer">COMMUNITY</a></li>
            </ul>
            <div className="tc-chevrons" aria-hidden>
              <span /><span /><span />
            </div>
          </div>
        </motion.div>
      </section>

      <Sections />
    </main>
  );
}
