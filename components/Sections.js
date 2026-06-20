'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { THEMES } from '@/lib/themes';

/* ===== cinematic easing — slow, weighty, no cartoon bounce ===== */
const EASE = [0.16, 1, 0.3, 1];

/* fly-in variants: elements slide/fly from off-canvas + de-blur into place */
const fly = (dir = 'up') => ({
  hidden: {
    opacity: 0,
    x: dir === 'left' ? -160 : dir === 'right' ? 160 : 0,
    y: dir === 'up' ? 90 : dir === 'down' ? -90 : 0,
    scale: dir === 'scale' ? 0.8 : 1,
    rotate: dir === 'left' ? -5 : dir === 'right' ? 5 : 0,
    filter: 'blur(10px)',
  },
  show: {
    opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE },
  },
});

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };

/* a block that reveals on scroll-in */
function Reveal({ dir = 'up', className, children, style }) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={fly(dir)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

/* parallax wrapper — moves at its own speed as the section passes through */
function Parallax({ speed = 80, className, style, children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  return (
    <motion.div ref={ref} className={className} style={{ ...style, y }} aria-hidden>
      {children}
    </motion.div>
  );
}

/* section header: small label + big title (with one highlighted word) + subtitle */
function Head({ label, title, hi, sub }) {
  return (
    <motion.div className="sec-head" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
      <motion.span className="sec-label cyber-font" variants={fly('up')}>{label}</motion.span>
      <motion.h2 className="sec-title" variants={fly('up')}>
        {title} {hi && <span className="hi">{hi}</span>}
      </motion.h2>
      {sub && <motion.p className="sec-sub" variants={fly('up')}>{sub}</motion.p>}
    </motion.div>
  );
}

/* floating decorative flying layer per section (orbs / shards / streaks) */
function Decor({ variant = 'a' }) {
  return (
    <div className="decor" aria-hidden>
      <Parallax speed={120} className="orb o1" />
      <Parallax speed={-90} className="orb o2" />
      <motion.i
        className={`shard s1 ${variant}`}
        initial={{ opacity: 0, x: -240, rotate: -25 }}
        whileInView={{ opacity: 0.8, x: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: EASE }}
      />
      <motion.i
        className={`shard s2 ${variant}`}
        initial={{ opacity: 0, x: 240, rotate: 25 }}
        whileInView={{ opacity: 0.7, x: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
      />
      <Parallax speed={160} className="streak k1" />
      <Parallax speed={-130} className="streak k2" />
    </div>
  );
}

const WHY = [
  ['◆', 'Единая карта', 'Восемь направлений связаны в одну систему — видно, как мышление переходит в рынок, продукт и запуск.'],
  ['⚡', 'От фундамента к запуску', 'Путь выстроен: сначала мышление и фокус, затем рынок, создание продукта и масштабирование.'],
  ['⬡', 'Практика, а не теория', 'Каждый узел ведёт к инструментам и заданиям. Учишься — применяешь — получаешь результат.'],
  ['◎', 'Живая экосистема', 'Сообщество, AI-инструменты и менторство держат тебя в движении 24/7.'],
];

const STEPS = [
  ['01', 'Мышление', 'Фундамент: ментальные модели, фокус, принятие решений.'],
  ['02', 'Рынок', 'Маркетинг и заработок: воронки, контент, монетизация.'],
  ['03', 'Создание', 'Веб, 3D, аудио, видео, игры — собираешь продукт.'],
  ['04', 'Запуск', 'Деплой, рост, масштабирование. Система работает на тебя.'],
];

const TIERS = [
  { name: 'Старт', price: '₽0', tag: '', feats: ['Карта восьми направлений', 'Базовые материалы', 'Доступ к сообществу', 'Первый экран навигации'] },
  { name: 'Система', price: '₽4 900', tag: 'популярный', feats: ['Все направления полностью', 'Практические задания', 'AI-инструменты внутри', 'Разборы и обратная связь', 'Обновления навсегда'] },
  { name: 'Полный доступ', price: '₽14 900', tag: '', feats: ['Всё из «Системы»', 'Менторство 1-на-1', 'Закрытые live-сессии', 'Доступ к департаменту разработки', 'Приоритетная поддержка'] },
];

const EXTRA = [
  ['🤖', 'AI-инструменты', 'Роутинг моделей, генерация текста, аудио и графики.'],
  ['👥', 'Сообщество', 'Живой контур: разборы, нетворк, совместные запуски.'],
  ['🎓', 'Менторство', 'Сопровождение пути от идеи до результата.'],
  ['🛰', 'Live-сессии', 'Закрытые эфиры по направлениям и кейсам.'],
];

const TEAM = [
  ['Стратегия', 'Research · Market · SEO'],
  ['Дизайн / Арт', 'UX · UI · Motion · 3D'],
  ['Разработка', 'Web · WebGL · Game'],
  ['Контент / Медиа', 'Copy · Audio · Video'],
  ['Маркетинг', 'Growth · SMM'],
  ['DevOps / QA', 'Deploy · Test · Observability'],
];

export default function Sections() {
  return (
    <div className="content">
      {/* фоновое параллакс-поле глубины на всё нижнее наполнение */}
      <BackdropField />

      {/* ===== ПОЧЕМУ ===== */}
      <section className="section sec" id="why">
        <Decor variant="a" />
        <Head label="ПОЧЕМУ C.O.R.E." title="Не курс — операционная система" hi="мышления и навыков"
              sub="Восемь направлений работают как одна машина: от того, как ты думаешь, до того, что ты запускаешь." />
        <motion.div className="why-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          {WHY.map(([ic, t, d], i) => (
            <motion.div className="why-card" key={t} variants={fly(i % 2 ? 'right' : 'left')}>
              <span className="ic">{ic}</span>
              <h3>{t}</h3>
              <p>{d}</p>
              <span className="card-glow" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== НАПРАВЛЕНИЯ (8 тем) ===== */}
      <section className="section sec" id="themes">
        <Decor variant="b" />
        <Head label="НАПРАВЛЕНИЯ" title="Восемь векторов" hi="одной системы"
              sub="Те же узлы, что на сетке первого экрана — теперь развёрнуто. Наведи, чтобы раскрыть суть." />
        <motion.div className="dir-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
          {THEMES.map((t, i) => (
            <motion.a href={`#themes`} id={t.id} key={t.id} className="dir-card" style={{ '--c': t.color }}
                      variants={fly(i % 2 ? 'up' : 'scale')}>
              <span className="num cyber-font">{`0${i + 1}`}</span>
              <span className="dot" />
              <div className="en cyber-font">{t.en}</div>
              <div className="ru">{t.ru}</div>
              <div className="sh">{t.short}</div>
              <div className="reveal">{t.desc}</div>
              <span className="card-glow" />
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* ===== КАК ЭТО РАБОТАЕТ ===== */}
      <section className="section sec" id="how">
        <Decor variant="a" />
        <Head label="КАК ЭТО РАБОТАЕТ" title="Четыре шага" hi="от хаоса к запуску"
              sub="Последовательный путь: фундамент → рынок → продукт → масштаб." />
        <div className="steps">
          <Parallax speed={40} className="steps-line" />
          <motion.div className="steps-row" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            {STEPS.map(([n, t, d], i) => (
              <motion.div className="step" key={n} variants={fly(i % 2 ? 'up' : 'down')}>
                <div className="step-num cyber-font">{n}</div>
                <h3>{t}</h3>
                <p>{d}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== УРОВНИ ДОСТУПА ===== */}
      <section className="section sec" id="benefits">
        <Decor variant="b" />
        <Head label="УРОВНИ" title="Выбери глубину" hi="погружения"
              sub="От бесплатной карты до полного доступа с менторством и департаментом разработки." />
        <motion.div className="tiers" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
          {TIERS.map((p, i) => (
            <motion.div className={`tier ${p.tag ? 'featured' : ''}`} key={p.name}
                        variants={fly(i === 0 ? 'left' : i === 2 ? 'right' : 'up')}
                        whileHover={{ y: -8 }}>
              {p.tag && <span className="tier-tag cyber-font">{p.tag}</span>}
              <div className="tier-name">{p.name}</div>
              <div className="tier-price cyber-font">{p.price}<span>/мес</span></div>
              <ul>{p.feats.map((f) => <li key={f}>{f}</li>)}</ul>
              <a className="tier-btn cyber-font" href="#cta">Выбрать</a>
              <span className="card-glow" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== ЧТО ЕЩЁ ===== */}
      <section className="section sec" id="extra">
        <Decor variant="a" />
        <Head label="ДОПОЛНИТЕЛЬНО" title="Инструменты" hi="внутри системы" />
        <motion.div className="extra-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          {EXTRA.map(([ic, t, d], i) => (
            <motion.div className="extra-card" key={t} variants={fly('scale')}>
              <span className="ic">{ic}</span>
              <h4>{t}</h4>
              <p>{d}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== КОМАНДА / ДЕПАРТАМЕНТЫ ===== */}
      <section className="section sec" id="about">
        <Decor variant="b" />
        <Head label="КОМАНДА" title="Те, кто держит" hi="систему"
              sub="Полнопрофильный департамент: стратегия, дизайн, разработка, медиа, маркетинг и эксплуатация." />
        <motion.div className="team-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
          {TEAM.map(([t, d], i) => (
            <motion.div className="team-card" key={t} variants={fly(i % 2 ? 'right' : 'left')}>
              <div className="av cyber-font">{t[0]}</div>
              <div>
                <div className="team-role">{t}</div>
                <div className="team-sub">{d}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section sec cta-final" id="cta">
        <Decor variant="a" />
        <Reveal dir="scale" className="cta-wrap">
          <h2 className="cta-title">Готов войти в <span className="hi">систему</span>?</h2>
          <p>Начни с карты направлений — за 15 минут увидишь свой путь от мышления к запуску.</p>
          <a className="cta-btn cyber-font" href="#themes">Войти в Project C.O.R.E.</a>
        </Reveal>
      </section>

      <footer className="footer" id="footer">
        <div className="cyber-font" style={{ color: 'var(--gold)', fontSize: 22, marginBottom: 10 }}>PROJECT C.O.R.E.</div>
        <div>Познай себя — и познаешь всё.</div>
        <div style={{ marginTop: 14, opacity: 0.7 }}>© {new Date().getFullYear()} Project CORE · Test Landing Vercel · Контакты · Юридическая информация</div>
      </footer>
    </div>
  );
}

/* page-level parallax depth field behind all lower content */
function BackdropField() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  return (
    <div className="bdrop" ref={ref} aria-hidden>
      <motion.div className="bdrop-grid" style={{ y: y1 }} />
      <motion.div className="bdrop-glow g1" style={{ y: y2 }} />
      <motion.div className="bdrop-glow g2" style={{ y: y1 }} />
    </div>
  );
}
