'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { THEMES } from '@/lib/themes';

// HUD frame recreating reference 001: angular neon plates + infographic strips
// overlapping the cosmos view along the top and bottom.
export default function CyberMenu() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // left plate: Мышление / Маркетинг / Заработок — "Веб дизайн" moved to the right plate
  const topItems = THEMES.slice(0, 3);
  const topItems2 = THEMES.slice(3);

  return (
    <>
      {/* ===== TOP HUD ===== */}
      <motion.nav
        className="hud top"
        initial={{ y: -120, opacity: 0 }}
        animate={collapsed ? { y: -130, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* infographic strip overlapping the space view */}
        <div className="hud-info top">
          <span className="hud-ticks" />
          <span className="hud-bar b1" /><span className="hud-bar b2" /><span className="hud-bar b3" />
          <span className="hud-readout">// SYS.LINK ▸ ONLINE ▸ 0x{`CORE`}</span>
        </div>

        <div className="hud-plates">
          <motion.div className="plate cyan l" initial={{ x: -180, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 0.15 }}>
            <span className="plate-brand cyber-font">PROJECT C.O.R.E.</span>
            {topItems.map((t) => (
              <a key={t.id} href={`#${t.id}`} className="plate-item cyber-font">{t.ru}</a>
            ))}
          </motion.div>
          <motion.div className="plate red r" initial={{ x: 180, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 0.28 }}>
            {topItems2.map((t) => (
              <a key={t.id} href={`#${t.id}`} className="plate-item cyber-font">{t.ru}</a>
            ))}
            <a href="#about" className="plate-item cyber-font">О нас</a>
          </motion.div>
        </div>
      </motion.nav>

      {/* ===== BOTTOM HUD ===== */}
      <motion.nav
        className="hud bottom"
        initial={{ y: 120, opacity: 0 }}
        animate={collapsed ? { y: 130, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="hud-plates">
          <motion.div className="plate red l" initial={{ x: -180, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 0.2 }}>
            <a href="#themes" className="plate-item cyber-font">Разделы</a>
            <a href="#benefits" className="plate-item cyber-font">Бизнес</a>
            <a href="#about" className="plate-item cyber-font">Контакты</a>
            <a href="#footer" className="plate-item cyber-font">Юр. инфо</a>
          </motion.div>
          <motion.div className="plate cyan r" initial={{ x: 180, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 0.32 }}>
            <span className="plate-readout cyber-font">ENCOUNTER · RESOURCES · ORGANISATION · COMMUNITY</span>
          </motion.div>
        </div>

        <div className="hud-info bottom">
          <span className="hud-readout">▸ ORBITAL.GRID ▸ SYNCED ▸ NODES:08</span>
          <span className="hud-bar b3" /><span className="hud-bar b2" /><span className="hud-bar b1" />
          <span className="hud-ticks" />
        </div>
      </motion.nav>
    </>
  );
}
