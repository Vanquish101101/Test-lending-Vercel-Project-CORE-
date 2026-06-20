'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { THEMES } from '@/lib/themes';

export default function CyberMenu() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const topItems = THEMES.slice(0, 5);
  const topItems2 = THEMES.slice(5);

  return (
    <>
      {/* TOP menu — assembles from left/right, collapses upward on scroll */}
      <motion.nav
        className="cybermenu top"
        initial={{ y: -90, opacity: 0 }}
        animate={collapsed ? { y: -110, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="menu-strip"
          initial={{ x: -160, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <span className="menu-brand cyber-font">C.O.R.E.</span>
          {topItems.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="menu-item cyber-font">{t.ru}</a>
          ))}
        </motion.div>
        <motion.div
          className="menu-strip alt"
          initial={{ x: 160, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.28 }}
        >
          {topItems2.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="menu-item cyber-font">{t.ru}</a>
          ))}
          <a href="#about" className="menu-item cyber-font">О нас</a>
          <a href="#footer" className="menu-item cyber-font">Контакты</a>
        </motion.div>
      </motion.nav>

      {/* BOTTOM menu — collapses downward on scroll, returns at footer */}
      <motion.nav
        className="cybermenu bottom"
        initial={{ y: 90, opacity: 0 }}
        animate={collapsed ? { y: 110, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="menu-strip"
          initial={{ x: -160, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <a href="#themes" className="menu-item cyber-font">Разделы</a>
          <a href="#benefits" className="menu-item cyber-font">Бизнес</a>
          <a href="#about" className="menu-item cyber-font">Контакты</a>
          <a href="#footer" className="menu-item cyber-font">Юр. инфо</a>
        </motion.div>
      </motion.nav>
    </>
  );
}
