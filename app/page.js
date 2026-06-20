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
        <motion.div
          className="title-core"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, delay: 0.6 }}
        >
          <div className="project cyber-font">PROJECT</div>
          <div className="core cyber-font">C.O.R.E.</div>
          <div className="sub cyber-font">Encounter · Resources · Organisation · Community</div>
        </motion.div>
      </section>

      <Sections />
    </main>
  );
}
