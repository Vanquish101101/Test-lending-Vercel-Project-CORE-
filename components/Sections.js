'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { THEMES } from '@/lib/themes';

/* ===== REMIX animation language — clip-wipes, 3D tilt/flip, scroll-fill ===== */
const EASE = [0.22, 1, 0.36, 1];

/* clip-path wipe reveal */
const wipe = (from = 'bottom') => ({
  hidden: {
    opacity: 0,
    clipPath:
      from === 'left' ? 'inset(0 100% 0 0)' :
      from === 'right' ? 'inset(0 0 0 100%)' :
      from === 'top' ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)',
  },
  show: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.85, ease: EASE } },
});

/* 3D tilt entrance */
const tilt = {
  hidden: { opacity: 0, rotateX: 22, y: 60, transformPerspective: 1000 },
  show: { opacity: 1, rotateX: 0, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/* flip-in (rotateY) */
const flip = {
  hidden: { opacity: 0, rotateY: 40, y: 30, transformPerspective: 1200 },
  show: { opacity: 1, rotateY: 0, y: 0, transition: { duration: 0.75, ease: EASE } },
};

/* pop scale */
const pop = {
  hidden: { opacity: 0, scale: 0.6, filter: 'blur(6px)' },
  show: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE } },
};

const grid = (gap = 0.08) => ({ hidden: {}, show: { transition: { staggerChildren: gap } } });

/* remixed header: title wipes in word-by-word + scroll-linked drift */
function KHead({ label, words, hi, sub, align = 'left' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center 60%'] });
  const x = useTransform(scrollYProgress, [0, 1], [align === 'right' ? 60 : -60, 0]);
  return (
    <motion.div ref={ref} className={`rx-head ${align}`} style={{ x }}
      variants={grid(0.06)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
      <motion.span className="rx-label cyber-font" variants={wipe('left')}>{label}</motion.span>
      <h2 className="rx-title">
        {words.map((w, i) => (
          <motion.span className="rx-w" key={i} variants={wipe('bottom')}>{w}&nbsp;</motion.span>
        ))}
        {hi && <motion.span className="rx-w hi" variants={wipe('bottom')}>{hi}</motion.span>}
      </h2>
      {sub && <motion.p className="rx-sub" variants={wipe('left')}>{sub}</motion.p>}
    </motion.div>
  );
}

/* decorative remix layer: rotating conic glow + drifting particles + scanline */
function RxDecor() {
  return (
    <div className="rx-decor" aria-hidden>
      <div className="rx-conic" />
      <div className="rx-scan" />
      <div className="rx-dust">{Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}</div>
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

/* steps as a vertical timeline with scroll-progress fill */
function Steps() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const fill = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  return (
    <div className="rx-tl" ref={ref}>
      <div className="rx-tl-track"><motion.div className="rx-tl-fill" style={{ height: fill }} /></div>
      <motion.div className="rx-tl-items" variants={grid(0.14)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
        {STEPS.map(([n, t, d], i) => (
          <motion.div className={`rx-tl-item ${i % 2 ? 'r' : 'l'}`} key={n} variants={wipe(i % 2 ? 'right' : 'left')}>
            <span className="rx-tl-dot" />
            <div className="rx-tl-card">
              <div className="rx-tl-num cyber-font">{n}</div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default function Sections() {
  return (
    <div className="content rx">
      <RxField />

      {/* ===== ПОЧЕМУ — split: липкий заголовок слева, карточки справа ===== */}
      <section className="section sec rx-sec" id="why">
        <RxDecor />
        <div className="rx-split">
          <div className="rx-split-l">
            <KHead label="ПОЧЕМУ C.O.R.E." words={['Не', 'курс —', 'операционная', 'система']} hi="мышления"
              sub="Восемь направлений работают как одна машина: от того, как ты думаешь, до того, что ты запускаешь." />
          </div>
          <motion.div className="rx-feat" variants={grid(0.1)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            {WHY.map(([ic, t, d], i) => (
              <motion.div className="rx-feat-card" key={t} variants={tilt}>
                <span className="rx-fi">{ic}</span>
                <div><h3>{t}</h3><p>{d}</p></div>
                <span className="rx-edge" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== НАПРАВЛЕНИЯ — bento ===== */}
      <section className="section sec rx-sec" id="themes">
        <RxDecor />
        <KHead label="НАПРАВЛЕНИЯ" words={['Восемь', 'векторов']} hi="одной системы"
          sub="Те же узлы, что на сетке первого экрана — теперь развёрнуто. Наведи, чтобы раскрыть суть." />
        <motion.div className="bento" variants={grid(0.07)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          {THEMES.map((t, i) => (
            <motion.a href="#themes" id={t.id} key={t.id} className="bento-card" style={{ '--c': t.color }} variants={tilt}>
              <span className="num cyber-font">{`0${i + 1}`}</span>
              <span className="dot" />
              <div className="en cyber-font">{t.en}</div>
              <div className="ru">{t.ru}</div>
              <div className="sh">{t.short}</div>
              <span className="rx-edge" />
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* ===== КАК ЭТО РАБОТАЕТ — таймлайн со скролл-заливкой ===== */}
      <section className="section sec rx-sec" id="how">
        <RxDecor />
        <KHead label="КАК ЭТО РАБОТАЕТ" words={['Четыре', 'шага']} hi="от хаоса к запуску" align="right"
          sub="Последовательный путь: фундамент → рынок → продукт → масштаб." />
        <Steps />
      </section>

      {/* ===== УРОВНИ — flip-in ===== */}
      <section className="section sec rx-sec" id="benefits">
        <RxDecor />
        <KHead label="УРОВНИ" words={['Выбери', 'глубину']} hi="погружения"
          sub="От бесплатной карты до полного доступа с менторством и департаментом разработки." />
        <motion.div className="rx-tiers" variants={grid(0.12)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
          {TIERS.map((p) => (
            <motion.div className={`rx-tier ${p.tag ? 'featured' : ''}`} key={p.name} variants={flip} whileHover={{ y: -10 }}>
              {p.tag && <span className="rx-tag cyber-font">{p.tag}</span>}
              <div className="rx-tier-name">{p.name}</div>
              <div className="rx-tier-price cyber-font">{p.price}<span>/мес</span></div>
              <ul>{p.feats.map((f) => <li key={f}>{f}</li>)}</ul>
              <a className="rx-tier-btn cyber-font" href="#cta">Выбрать</a>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== ДОПОЛНИТЕЛЬНО — pop ===== */}
      <section className="section sec rx-sec" id="extra">
        <RxDecor />
        <KHead label="ДОПОЛНИТЕЛЬНО" words={['Инструменты']} hi="внутри системы" align="right" />
        <motion.div className="rx-extra" variants={grid(0.09)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          {EXTRA.map(([ic, t, d]) => (
            <motion.div className="rx-extra-card" key={t} variants={pop}>
              <span className="ic">{ic}</span><h4>{t}</h4><p>{d}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== КОМАНДА — clip-wipe строки со сдвигом ===== */}
      <section className="section sec rx-sec" id="about">
        <RxDecor />
        <KHead label="КОМАНДА" words={['Те,', 'кто', 'держит']} hi="систему"
          sub="Полнопрофильный департамент: стратегия, дизайн, разработка, медиа, маркетинг и эксплуатация." />
        <motion.div className="rx-team" variants={grid(0.08)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
          {TEAM.map(([t, d], i) => (
            <motion.div className="rx-team-card" key={t} variants={wipe(i % 2 ? 'right' : 'left')}>
              <div className="av cyber-font">{t[0]}</div>
              <div><div className="role">{t}</div><div className="sub">{d}</div></div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section sec rx-sec cta-final" id="cta">
        <RxDecor />
        <motion.div className="rx-cta" variants={pop} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
          <h2 className="rx-cta-title">Готов войти в <span className="hi">систему</span>?</h2>
          <p>Начни с карты направлений — за 15 минут увидишь свой путь от мышления к запуску.</p>
          <a className="rx-cta-btn cyber-font" href="#themes">Войти в Project C.O.R.E.</a>
        </motion.div>
      </section>

      <footer className="footer" id="footer">
        <div className="cyber-font" style={{ color: 'var(--gold)', fontSize: 22, marginBottom: 10 }}>PROJECT C.O.R.E.</div>
        <div>Познай себя — и познаешь всё.</div>
        <div style={{ marginTop: 14, opacity: 0.7 }}>© {new Date().getFullYear()} Project CORE · Test Landing Vercel · Контакты · Юридическая информация</div>
      </footer>
    </div>
  );
}

/* depth field — scroll-driven dual gradient + tilt grid (remix of backdrop) */
function RxField() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const rot = useTransform(scrollYProgress, [0, 1], [0, 12]);
  return (
    <div className="rx-field" aria-hidden>
      <motion.div className="rx-field-grid" style={{ y: y1, rotate: rot }} />
      <motion.div className="rx-field-glow" style={{ y: y1 }} />
    </div>
  );
}
