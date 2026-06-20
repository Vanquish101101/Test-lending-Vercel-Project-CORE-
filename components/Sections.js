'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { THEMES } from '@/lib/themes';

/* ===== MERGED LANDING — лучшее из 1.5.0 + 1.6.0 + 1.7.0 ===== */
const EASE = [0.22, 1, 0.36, 1];

const wipe = (from = 'bottom') => ({
  hidden: {
    opacity: 0,
    clipPath:
      from === 'left' ? 'inset(0 100% 0 0)' :
      from === 'right' ? 'inset(0 0 0 100%)' :
      from === 'top' ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)',
  },
  show: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.95, ease: EASE } },
});
const tilt = { hidden: { opacity: 0, rotateX: 20, y: 54, transformPerspective: 1000 }, show: { opacity: 1, rotateX: 0, y: 0, transition: { duration: 0.85, ease: EASE } } };
const flip = { hidden: { opacity: 0, rotateY: 36, y: 30, transformPerspective: 1200 }, show: { opacity: 1, rotateY: 0, y: 0, transition: { duration: 0.9, ease: EASE } } };
const pop = { hidden: { opacity: 0, scale: 0.7, filter: 'blur(6px)' }, show: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } } };
const grid = (gap = 0.14, delay = 0.06) => ({ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } });
const vp = { once: true, amount: 0.25 };

/* заголовок по словам + лёгкий скролл-дрейф */
function KHead({ label, words, hi, sub, align = 'left' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center 60%'] });
  const x = useTransform(scrollYProgress, [0, 1], [align === 'right' ? 60 : -60, 0]);
  return (
    <motion.div ref={ref} className={`rx-head ${align}`} style={{ x }}
      variants={grid(0.06)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
      <motion.span className="rx-label cyber-font" variants={wipe('left')}>{label}</motion.span>
      <h2 className="rx-title">
        {words.map((w, i) => (<motion.span className="rx-w" key={i} variants={wipe('bottom')}>{w}&nbsp;</motion.span>))}
        {hi && <motion.span className="rx-w hi" variants={wipe('bottom')}>{hi}</motion.span>}
      </h2>
      {sub && <motion.p className="rx-sub" variants={wipe('left')}>{sub}</motion.p>}
    </motion.div>
  );
}

function RxDecor() {
  return (
    <div className="rx-decor" aria-hidden>
      <div className="rx-conic" /><div className="rx-scan" />
      <div className="rx-dust">{Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}</div>
    </div>
  );
}

/* счётчик-метрика (из 1.7.0) */
function Counter({ value }) {
  const m = String(value).match(/^(\D*)(\d+)(\D*)$/);
  const pre = m ? m[1] : '', target = m ? parseInt(m[2], 10) : 0, post = m ? m[3] : '';
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf; const s = performance.now(), d = 1400;
    const tick = (now) => { const p = Math.min(1, (now - s) / d); const e = 1 - Math.pow(1 - p, 3); setN(Math.round(target * e)); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return <span ref={ref} className="rx-metric-num cyber-font">{pre}{n}{post}</span>;
}

const WHY = [
  ['◆', 'Единая карта', 'Восемь направлений связаны в одну систему — видно, как мышление переходит в рынок, продукт и запуск.'],
  ['⚡', 'От фундамента к запуску', 'Путь выстроен: сначала мышление и фокус, затем рынок, создание продукта и масштабирование.'],
  ['⬡', 'Практика, а не теория', 'Каждый узел ведёт к инструментам и заданиям. Учишься — применяешь — получаешь результат.'],
  ['◎', 'Живая экосистема', 'Сообщество, AI-инструменты и менторство держат тебя в движении 24/7.'],
];
const RESULTS = [
  ['Мышление', 'Ясность решений', 'Ментальные модели снимают шум: видишь структуру задачи и выбираешь быстро и точно.', 'x3', 'скорость решений'],
  ['Маркетинг · Заработок', 'Поток клиентов', 'Воронки и контент, превращающие холодное внимание в тёплые заявки и деньги.', '1500+', 'лидов в месяц'],
  ['Веб · 3D · Медиа', 'Готовый продукт', 'От лендинга и 3D-сцены до аудио и видео — собственный продакшн без подрядчиков.', '14', 'дней до MVP'],
];
const STEPS = [
  ['01', 'Фундамент', 'Мышление и ментальные модели: фокус, стратегия и решения в неопределённости.'],
  ['02', 'Рынок', 'Маркетинг и психология влияния: воронки и контент → тёплые заявки.'],
  ['03', 'Монетизация', 'Модели дохода: упаковка навыка в продукт и устойчивый денежный поток.'],
  ['04', 'Продукт', 'Веб-разработка: лендинги, сайты и приложения — от макета до релиза.'],
  ['05', 'Визуал и медиа', '3D, аудио и видео: полноценный продакшн без подрядчиков и потери смысла.'],
  ['06', 'Интерактив', 'Game-дизайн и геймификация: механики вовлечения, которые удерживают.'],
  ['07', 'Запуск и рост', 'Деплой, аналитика и масштабирование — результат, который растёт без тебя.'],
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
  ['Стратегия', 'Research · Market · SEO'], ['Дизайн / Арт', 'UX · UI · Motion · 3D'],
  ['Разработка', 'Web · WebGL · Game'], ['Контент / Медиа', 'Copy · Audio · Video'],
  ['Маркетинг', 'Growth · SMM'], ['DevOps / QA', 'Deploy · Test · Observability'],
];

/* вертикальный таймлайн со скролл-заливкой (7 шагов) */
function Steps() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const fill = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  return (
    <div className="rx-tl" ref={ref}>
      <div className="rx-tl-track"><motion.div className="rx-tl-fill" style={{ height: fill }} /></div>
      <motion.div className="rx-tl-items" variants={grid(0.12, 0.08)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
        {STEPS.map(([n, t, d], i) => (
          <motion.div className={`rx-tl-item ${i % 2 ? 'r' : 'l'}`} key={n} variants={wipe(i % 2 ? 'right' : 'left')}>
            <span className="rx-tl-dot" />
            <div className="rx-tl-card"><div className="rx-tl-num cyber-font">{n}</div><h3>{t}</h3><p>{d}</p></div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default function Sections() {
  return (
    <div className="content rx merged">
      <GridField />

      {/* ПОЧЕМУ — split */}
      <section className="section sec rx-sec" id="why">
        <RxDecor />
        <div className="rx-split">
          <div className="rx-split-l">
            <KHead label="ПОЧЕМУ C.O.R.E." words={['Не', 'курс —', 'операционная', 'система']} hi="мышления"
              sub="Восемь направлений работают как одна машина: от того, как ты думаешь, до того, что ты запускаешь." />
          </div>
          <motion.div className="rx-feat" variants={grid(0.1, 0.1)} initial="hidden" whileInView="show" viewport={vp}>
            {WHY.map(([ic, t, d]) => (
              <motion.div className="rx-feat-card" key={t} variants={tilt}>
                <span className="rx-fi">{ic}</span><div><h3>{t}</h3><p>{d}</p></div><span className="rx-edge" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* НАПРАВЛЕНИЯ — bento */}
      <section className="section sec rx-sec" id="themes">
        <RxDecor />
        <KHead label="НАПРАВЛЕНИЯ" words={['Восемь', 'векторов']} hi="одной системы"
          sub="Те же узлы, что на сетке первого экрана — теперь развёрнуто. Наведи, чтобы раскрыть суть." />
        <motion.div className="bento" variants={grid(0.07, 0.06)} initial="hidden" whileInView="show" viewport={vp}>
          {THEMES.map((t, i) => (
            <motion.a href="#themes" id={t.id} key={t.id} className="bento-card" style={{ '--c': t.color }} variants={tilt}>
              <span className="num cyber-font">{`0${i + 1}`}</span><span className="dot" />
              <div className="en cyber-font">{t.en}</div><div className="ru">{t.ru}</div><div className="sh">{t.short}</div><span className="rx-edge" />
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* РЕЗУЛЬТАТ — метрики/счётчики (уникальный блок из 1.7.0) */}
      <section className="section sec rx-sec" id="results">
        <RxDecor />
        <KHead label="РЕЗУЛЬТАТ" words={['Что', 'ты']} hi="получаешь" align="right"
          sub="Не абстрактные знания, а измеримый результат на каждом уровне системы." />
        <motion.div className="rx-metrics" variants={grid(0.14, 0.08)} initial="hidden" whileInView="show" viewport={vp}>
          {RESULTS.map(([tag, title, text, num, unit]) => (
            <motion.div className="rx-metric" key={title} variants={tilt}>
              <span className="rx-metric-tag cyber-font">{tag}</span>
              <div className="rx-metric-val"><Counter value={num} /><span className="rx-metric-unit">{unit}</span></div>
              <h3>{title}</h3><p>{text}</p><span className="rx-edge" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* КАК ЭТО РАБОТАЕТ — таймлайн, 7 шагов */}
      <section className="section sec rx-sec" id="how">
        <RxDecor />
        <KHead label="КАК ЭТО РАБОТАЕТ" words={['Семь', 'шагов']} hi="от хаоса к запуску"
          sub="Последовательный путь: фундамент → рынок → монетизация → продукт → медиа → интерактив → масштаб." />
        <Steps />
      </section>

      {/* УРОВНИ — flip */}
      <section className="section sec rx-sec" id="benefits">
        <RxDecor />
        <KHead label="УРОВНИ" words={['Выбери', 'глубину']} hi="погружения" align="right"
          sub="От бесплатной карты до полного доступа с менторством и департаментом разработки." />
        <motion.div className="rx-tiers" variants={grid(0.12, 0.1)} initial="hidden" whileInView="show" viewport={vp}>
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

      {/* ДОПОЛНИТЕЛЬНО — pop */}
      <section className="section sec rx-sec" id="extra">
        <RxDecor />
        <KHead label="ДОПОЛНИТЕЛЬНО" words={['Инструменты']} hi="внутри системы" />
        <motion.div className="rx-extra" variants={grid(0.09, 0.06)} initial="hidden" whileInView="show" viewport={vp}>
          {EXTRA.map(([ic, t, d]) => (
            <motion.div className="rx-extra-card" key={t} variants={pop}><span className="ic">{ic}</span><h4>{t}</h4><p>{d}</p></motion.div>
          ))}
        </motion.div>
      </section>

      {/* КОМАНДА — offset */}
      <section className="section sec rx-sec" id="about">
        <RxDecor />
        <KHead label="КОМАНДА" words={['Те,', 'кто', 'держит']} hi="систему" align="right"
          sub="Полнопрофильный департамент: стратегия, дизайн, разработка, медиа, маркетинг и эксплуатация." />
        <motion.div className="rx-team" variants={grid(0.08, 0.06)} initial="hidden" whileInView="show" viewport={vp}>
          {TEAM.map(([t, d], i) => (
            <motion.div className="rx-team-card" key={t} variants={wipe(i % 2 ? 'right' : 'left')}>
              <div className="av cyber-font">{t[0]}</div><div><div className="role">{t}</div><div className="sub">{d}</div></div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
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

/* фон-сеточка из 1.5.0, чуть светлее, с параллаксом */
function GridField() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -260]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 180]);
  return (
    <div className="gridfield" aria-hidden>
      <motion.div className="gf-grid" style={{ y: y1 }} />
      <motion.div className="gf-glow gf-glow-a" style={{ y: y2 }} />
      <motion.div className="gf-glow gf-glow-b" style={{ y: y1 }} />
    </div>
  );
}
