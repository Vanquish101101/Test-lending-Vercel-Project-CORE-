'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { THEMES } from '@/lib/themes';

// ---- reveal variants (cinematic, directional) ----
// Появление каждого блока — быстрое и чёткое, но межкарточный сдвиг (stagger + delay i*X)
// держим заметным: соседние элементы выезжают по очереди и «проглядывают», а не сливаются.
const fromBottom = { hidden: { opacity: 0, y: 60 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.65, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] } }) };
const fromLeft = { hidden: { opacity: 0, x: -150, rotate: -3 }, show: (i = 0) => ({ opacity: 1, x: 0, rotate: 0, transition: { duration: 0.78, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] } }) };
const fromRight = { hidden: { opacity: 0, x: 150, rotate: 3 }, show: (i = 0) => ({ opacity: 1, x: 0, rotate: 0, transition: { duration: 0.78, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] } }) };
const popIn = { hidden: { opacity: 0, scale: 0.78, y: 60 }, show: (i = 0) => ({ opacity: 1, scale: 1, y: 0, transition: { duration: 0.72, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] } }) };
const blurUp = { hidden: { opacity: 0, y: 40, filter: 'blur(10px)' }, show: (i = 0) => ({ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.82, delay: i * 0.11, ease: [0.22, 1, 0.36, 1] } }) };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.17, delayChildren: 0.08 } } };
// once:false — анимация проигрывается заново при каждом въезде блока в зону видимости
// (в т.ч. когда пользователь скроллит обратно вверх к началу страницы)
const vp = { once: false, amount: 0.3 };

// шаги блока «Как это работает»: каждая следующая строка с бОльшей, но строго РАВНОЙ задержкой
// (явный линейный delay перекрывает общий stagger → интервалы между строками одинаковые)
const procStep = { hidden: { opacity: 0, x: -120, rotate: -2 }, show: (i = 0) => ({ opacity: 1, x: 0, rotate: 0, transition: { duration: 0.7, delay: 0.1 + i * 0.24, ease: [0.22, 1, 0.36, 1] } }) };

// animated count-up for the result metrics
function Counter({ value }) {
  const m = String(value).match(/^(\D*)(\d+)(\D*)$/);
  const pre = m ? m[1] : '';
  const target = m ? parseInt(m[2], 10) : 0;
  const post = m ? m[3] : '';
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.6 });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) { setN(0); return; } // сброс при уходе из вида → пересчёт при возврате
    let raf; const start = performance.now(); const dur = 1300;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return <span ref={ref} className="cm-num">{pre}{n}{post}</span>;
}

// scroll-driven parallax HUD shards (contained INSIDE .content — never touches the hero)
function Floaters() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -260]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const x1 = useTransform(scrollYProgress, [0, 1], [-80, 120]);
  const x2 = useTransform(scrollYProgress, [0, 1], [80, -140]);
  const rot = useTransform(scrollYProgress, [0, 1], [0, 90]);
  return (
    <div className="floaters" ref={ref} aria-hidden>
      <motion.span className="fl fl-ring" style={{ y: y1, x: x1, rotate: rot }} />
      <motion.span className="fl fl-bar" style={{ y: y2, x: x2 }} />
      <motion.span className="fl fl-plus" style={{ y: y1, x: x2 }} />
      <motion.span className="fl fl-tri" style={{ y: y2, x: x1, rotate: rot }} />
      <motion.span className="fl fl-ring small" style={{ y: y2, x: x1, rotate: rot }} />
      <motion.span className="fl fl-dot" style={{ y: y1, x: x2 }} />
    </div>
  );
}

// a tall section header with an oversized ghost index that overlaps the content
function SecHead({ index, kicker, title, lead }) {
  return (
    <div className="sec-head">
      <motion.span className="sec-ghost cyber-font" aria-hidden
        initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 0.07, x: 0 }} viewport={vp} transition={{ duration: 1 }}>{index}</motion.span>
      {kicker && <motion.span className="sec-kicker cyber-font" variants={fromBottom} initial="hidden" whileInView="show" viewport={vp}>{kicker}</motion.span>}
      <motion.h2 variants={blurUp} initial="hidden" whileInView="show" viewport={vp}>{title}</motion.h2>
      {lead && <motion.p className="lead" variants={fromBottom} initial="hidden" whileInView="show" viewport={vp}>{lead}</motion.p>}
    </div>
  );
}

const FEATURES = [
  ['M3 12h6l2-5 3 10 2-5h2', 'Системный подход', 'Не набор разрозненных курсов, а единая операционная система навыков: каждое направление — узел, усиливающий соседние. Знание перестаёт быть фрагментом.'],
  ['M4 19V5l8 6 8-6v14', 'Практика, а не теория', 'Каждый модуль завершается рабочим артефактом — лендингом, сценой, треком, воронкой. Ты выходишь с тем, что уже можно показать и продать.'],
  ['M5 12l4 4L19 6', 'От идеи до запуска', 'Полный маршрут: мышление → продукт → деплой → рост. Без разрыва между «понял» и «сделал руками».'],
  ['M12 2v20M2 12h20', 'Живая экосистема', 'Направления связаны графом, как узлы C.O.R.E. Прокачал одно — открыл следующее. Система растёт вместе с тобой.'],
];

const RESULTS = [
  ['Мышление', 'Ясность решений', 'Ментальные модели снимают шум и информационную перегрузку: ты видишь структуру задачи и выбираешь быстро и точно.', 'x3', 'скорость решений'],
  ['Маркетинг · Заработок', 'Поток клиентов', 'Воронки, контент и психология влияния, которые превращают холодное внимание в тёплые заявки и деньги.', '1500+', 'лидов в месяц'],
  ['Веб · 3D · Медиа', 'Готовый продукт', 'От лендинга и 3D-сцены до аудио и видео — собственный продакшн без подрядчиков и потери смысла.', '14', 'дней до MVP'],
];

const STEPS = [
  ['01', 'Фундамент', 'Мышление и ментальные модели: фокус, стратегия и принятие решений в условиях неопределённости.'],
  ['02', 'Рынок', 'Маркетинг и психология влияния: воронки и контент, которые превращают холодное внимание в тёплые заявки.'],
  ['03', 'Монетизация', 'Модели дохода и заработок: упаковываешь навык в продукт и выстраиваешь устойчивый денежный поток.'],
  ['04', 'Продукт', 'Веб-разработка: лендинги, сайты и приложения собственными руками — от макета до рабочего релиза.'],
  ['05', 'Визуал и медиа', '3D, аудио и видео: полноценный продакшн без подрядчиков и без потери смысла на каждом этапе.'],
  ['06', 'Интерактив', 'Game-дизайн и геймификация: механики вовлечения, которые удерживают внимание и оживляют продукт.'],
  ['07', 'Запуск и рост', 'Деплой, аналитика, оптимизация и масштабирование — результат, который работает и растёт без тебя.'],
];

const TIERS = [
  ['Старт', '0 ₽', 'разведка', ['Доступ к карте направлений', 'Базовые материалы каждого узла', 'Открытое сообщество'], false],
  ['Поток', 'основной', 'рекомендуем', ['Все 8 направлений целиком', 'Задания, шаблоны и боевые инструменты', 'Регулярные обновления программы', 'Поддержка кураторов'], true],
  ['Полный доступ', 'максимум', 'трансформация', ['Всё из тарифа «Поток»', 'Личное менторство и разборы', 'Приоритетная поддержка 1-на-1', 'Закрытые ресурсы и комьюнити-ядро'], false],
];

const TEAM = [
  ['Архитектор системы', 'Мышление · стратегия'],
  ['Маркетинг-лид', 'Воронки · контент · психология'],
  ['Финанс-навигатор', 'Монетизация · модели дохода'],
  ['Веб-инженер', 'Frontend · backend · деплой'],
  ['3D / Motion', 'Графика · сцены · анимация'],
  ['Медиа-продюсер', 'Аудио · видео · продакшн'],
];

/* ===== MIDDLE — таймлайн 7 шагов (из 1.6.0), once:false ===== */
const tlEASE = [0.22, 1, 0.36, 1];
const tlStg = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } } };
const tlWipe = (from) => ({ hidden: { opacity: 0, clipPath: from === 'right' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, show: { opacity: 1, clipPath: 'inset(0 0 0 0)', transition: { duration: 0.9, ease: tlEASE } } });
const TL_STEPS = [
  ['01', 'Фундамент', 'Мышление и ментальные модели: фокус, стратегия и решения.'],
  ['02', 'Рынок', 'Маркетинг и психология влияния: воронки и контент.'],
  ['03', 'Монетизация', 'Модели дохода: упаковка навыка в устойчивый поток.'],
  ['04', 'Продукт', 'Веб-разработка: лендинги, сайты и приложения.'],
  ['05', 'Визуал и медиа', '3D, аудио и видео: полноценный продакшн.'],
  ['06', 'Интерактив', 'Game-дизайн и геймификация: вовлечение.'],
  ['07', 'Запуск и рост', 'Деплой, аналитика и масштабирование.'],
];
function TLSteps() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const fill = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  return (
    <div className="rx-tl" ref={ref}>
      <div className="rx-tl-track"><motion.div className="rx-tl-fill" style={{ height: fill }} /></div>
      <motion.div className="rx-tl-items" variants={tlStg} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.1 }}>
        {TL_STEPS.map(([n, t, d], i) => (
          <motion.div className={`rx-tl-item ${i % 2 ? 'r' : 'l'}`} key={n} variants={tlWipe(i % 2 ? 'right' : 'left')}>
            <span className="rx-tl-dot" />
            <div className="rx-tl-card"><div className="rx-tl-num cyber-font">{n}</div><h3>{t}</h3><p>{d}</p></div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* ===== ГРУППА 1.5.0 (классы/имена переименованы, once:false) ===== */
const EASE5 = [0.16, 1, 0.3, 1];
const fly = (dir = 'up') => ({
  hidden: { opacity: 0, x: dir === 'left' ? -160 : dir === 'right' ? 160 : 0, y: dir === 'up' ? 90 : dir === 'down' ? -90 : 0, scale: dir === 'scale' ? 0.8 : 1, rotate: dir === 'left' ? -5 : dir === 'right' ? 5 : 0, filter: 'blur(10px)' },
  show: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: EASE5 } },
});
const stg5 = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };
const vp5 = { once: false, amount: 0.25 };
function Parallax5({ speed = 80, className, style, children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  return <motion.div ref={ref} className={className} style={{ ...style, y }} aria-hidden>{children}</motion.div>;
}
function Reveal5({ dir = 'up', className, children, style }) {
  return <motion.div className={className} style={style} variants={fly(dir)} initial="hidden" whileInView="show" viewport={vp5}>{children}</motion.div>;
}
function V5Head({ label, title, hi, sub }) {
  return (
    <motion.div className="v5-head" variants={stg5} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.5 }}>
      <motion.span className="sec-label cyber-font" variants={fly('up')}>{label}</motion.span>
      <motion.h2 className="sec-title" variants={fly('up')}>{title} {hi && <span className="hi">{hi}</span>}</motion.h2>
      {sub && <motion.p className="sec-sub" variants={fly('up')}>{sub}</motion.p>}
    </motion.div>
  );
}
function V5Decor({ variant = 'a' }) {
  return (
    <div className="decor" aria-hidden>
      <Parallax5 speed={120} className="orb o1" /><Parallax5 speed={-90} className="orb o2" />
      <motion.i className={`shard s1 ${variant}`} initial={{ opacity: 0, x: -240, rotate: -25 }} whileInView={{ opacity: 0.8, x: 0, rotate: 0 }} viewport={{ once: false, amount: 0.3 }} transition={{ duration: 1.1, ease: EASE5 }} />
      <motion.i className={`shard s2 ${variant}`} initial={{ opacity: 0, x: 240, rotate: 25 }} whileInView={{ opacity: 0.7, x: 0, rotate: 0 }} viewport={{ once: false, amount: 0.3 }} transition={{ duration: 1.1, ease: EASE5, delay: 0.1 }} />
      <Parallax5 speed={160} className="streak k1" /><Parallax5 speed={-130} className="streak k2" />
    </div>
  );
}
function BackdropField5() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  return <div className="bdrop" aria-hidden><motion.div className="bdrop-grid" style={{ y: y1 }} /><motion.div className="bdrop-glow g1" style={{ y: y2 }} /><motion.div className="bdrop-glow g2" style={{ y: y1 }} /></div>;
}
const WHY5 = [
  ['◆', 'Единая карта', 'Восемь направлений связаны в одну систему — видно, как мышление переходит в рынок, продукт и запуск.'],
  ['⚡', 'От фундамента к запуску', 'Путь выстроен: сначала мышление и фокус, затем рынок, создание продукта и масштабирование.'],
  ['⬡', 'Практика, а не теория', 'Каждый узел ведёт к инструментам и заданиям. Учишься — применяешь — получаешь результат.'],
  ['◎', 'Живая экосистема', 'Сообщество, AI-инструменты и менторство держат тебя в движении 24/7.'],
];
const S5 = [
  ['01', 'Мышление', 'Фундамент: ментальные модели, фокус, принятие решений.'],
  ['02', 'Рынок', 'Маркетинг и заработок: воронки, контент, монетизация.'],
  ['03', 'Создание', 'Веб, 3D, аудио, видео, игры — собираешь продукт.'],
  ['04', 'Запуск', 'Деплой, рост, масштабирование. Система работает на тебя.'],
];
const T5 = [
  { name: 'Старт', price: '₽0', tag: '', feats: ['Карта восьми направлений', 'Базовые материалы', 'Доступ к сообществу', 'Первый экран навигации'] },
  { name: 'Система', price: '₽4 900', tag: 'популярный', feats: ['Все направления полностью', 'Практические задания', 'AI-инструменты внутри', 'Разборы и обратная связь', 'Обновления навсегда'] },
  { name: 'Полный доступ', price: '₽14 900', tag: '', feats: ['Всё из «Системы»', 'Менторство 1-на-1', 'Закрытые live-сессии', 'Доступ к департаменту разработки', 'Приоритетная поддержка'] },
];
const EX5 = [
  ['🤖', 'AI-инструменты', 'Роутинг моделей, генерация текста, аудио и графики.'],
  ['👥', 'Сообщество', 'Живой контур: разборы, нетворк, совместные запуски.'],
  ['🎓', 'Менторство', 'Сопровождение пути от идеи до результата.'],
  ['🛰', 'Live-сессии', 'Закрытые эфиры по направлениям и кейсам.'],
];
const TM5 = [
  ['Стратегия', 'Research · Market · SEO'], ['Дизайн / Арт', 'UX · UI · Motion · 3D'],
  ['Разработка', 'Web · WebGL · Game'], ['Контент / Медиа', 'Copy · Audio · Video'],
  ['Маркетинг', 'Growth · SMM'], ['DevOps / QA', 'Deploy · Test · Observability'],
];

export default function Sections() {
  return (
    <div className="content">
      <Floaters />

      {/* ===== Directions (themes) ===== */}
      <section className="section" id="themes">
        <span className="sec-bracket tl" aria-hidden /><span className="sec-bracket br" aria-hidden />
        <SecHead index="01" kicker="// НАПРАВЛЕНИЯ" title="Восемь направлений"
          lead="Те же узлы, что в меню и на орбитальной сетке. Это не отдельные курсы — это грани одной системы. Наведи на блок, чтобы раскрыть суть." />
        <motion.div className="themes-grid" variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
          {THEMES.map((t, i) => (
            <motion.a
              href={`#${t.id}`} id={t.id} key={t.id} className="theme-card" style={{ color: t.color }}
              custom={i} variants={i % 2 ? fromRight : fromLeft}
              whileHover={{ y: -8, scale: 1.03 }}
            >
              <span className="dot" style={{ background: t.color, color: t.color }} />
              <span className="glow" style={{ background: t.color }} />
              <div className="en">{t.en}</div>
              <div className="ru">{t.ru}</div>
              <div className="sh">{t.short}</div>
              <div className="reveal">{t.desc}</div>
              <span className="card-scan" aria-hidden />
            </motion.a>
          ))}
        </motion.div>
      </section>

      {/* ===== Why us ===== */}
      <section className="section" id="why">
        <SecHead index="02" kicker="// ПОЧЕМУ ЭТО РАБОТАЕТ" title="Почему это работает"
          lead="Четыре принципа, на которых держится система — и которые отличают её от очередной папки с видео-уроками." />
        <motion.div className="feature-grid" variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
          {FEATURES.map(([d, title, text], i) => (
            <motion.div className="feature-card" key={title} custom={i} variants={popIn} whileHover={{ y: -6 }}>
              <svg className="feat-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d={d} /></svg>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="feat-idx cyber-font" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== Results / cases ===== */}
      <section className="section" id="benefits">
        <SecHead index="03" kicker="// РЕЗУЛЬТАТ" title="Что это даёт"
          lead="Не абстрактные «знания», а измеримый результат на каждом уровне системы." />
        <motion.div className="case-grid" variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
          {RESULTS.map(([tag, title, text, num, unit], i) => (
            <motion.div className="case-card" key={title} custom={i} variants={i === 1 ? popIn : (i ? fromRight : fromLeft)} whileHover={{ y: -8 }}>
              <span className="case-tag">{tag}</span>
              <div className="case-metric"><Counter value={num} /><span className="cm-unit">{unit}</span></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== Process ===== */}
      <section className="section" id="process">
        <SecHead index="04" kicker="// МАРШРУТ" title="Как это работает"
          lead="Линейный маршрут от первого принципа до растущего продукта. Каждый шаг опирается на предыдущий." />
        <motion.div className="process" variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
          <span className="proc-spine" aria-hidden />
          {STEPS.map(([n, title, text], i) => (
            <motion.div className="proc-step" key={n} custom={i} variants={procStep} whileHover={{ x: 6 }}>
              <div className="proc-num">{n}</div>
              <div className="proc-body"><h3>{title}</h3><p>{text}</p></div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== Pricing ===== */}
      <section className="section" id="pricing">
        <SecHead index="05" kicker="// ДОСТУП" title="Доступ"
          lead="Три уровня погружения — от первой разведки до полной трансформации." />
        <motion.div className="price-grid" variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
          {TIERS.map(([name, price, sub, feats, hot], i) => (
            <motion.div className={`price-card ${hot ? 'hot' : ''}`} key={name} custom={i} variants={popIn} whileHover={{ y: -10 }}>
              {hot && <span className="price-badge">{sub}</span>}
              <div className="price-name">{name}</div>
              <div className="price-sub">{!hot && sub}</div>
              <div className="price-val">{price}</div>
              <ul>{feats.map((f) => <li key={f}>{f}</li>)}</ul>
              <a href="#footer" className="price-btn">Выбрать</a>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== Team ===== */}
      <section className="section" id="about">
        <SecHead index="06" kicker="// КУРАТОРЫ" title="Кураторы направлений"
          lead="За каждым узлом — практик, который сам прошёл этот путь и собирал продукты в бою." />
        <motion.div className="team-grid" variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
          {TEAM.map(([name, role], i) => (
            <motion.div className="team-card" key={name} custom={i} variants={popIn} whileHover={{ y: -6, scale: 1.03 }}>
              <div className="team-ava"><span /></div>
              <div className="team-name">{name}</div>
              <div className="team-role">{role}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="section cta-section">
        <motion.div className="cta-box" variants={popIn} initial="hidden" whileInView="show" viewport={vp}>
          <span className="cta-grid-glow" aria-hidden />
          <motion.h2 variants={blurUp} initial="hidden" whileInView="show" viewport={vp}>Готов собрать свою систему?</motion.h2>
          <p>Разберём твою цель и за 15 минут соберём маршрут из направлений именно под тебя.</p>
          <a href="#footer" className="cta-btn">Связаться</a>
        </motion.div>
      </section>

      {/* ===== ПО СЕРЕДИНЕ: таймлайн 7 шагов (из 1.6.0) ===== */}
      <section className="section sec rx-sec" id="timeline7">
        <motion.div className="rx-head" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.5 }} transition={{ duration: 0.7, ease: tlEASE }}>
          <span className="rx-label cyber-font">МАРШРУТ</span>
          <h2 className="rx-title">Семь шагов <span className="rx-w hi">от хаоса к запуску</span></h2>
          <p className="rx-sub">Центральная линия заливается по мере прокрутки — путь от фундамента к масштабу.</p>
        </motion.div>
        <TLSteps />
      </section>

      {/* ===== ГРУППА 1.5.0 (traffictime, родная fly-анимация + сеточный задник) ===== */}
      <BackdropField5 />

      <section className="section sec" id="why5">
        <V5Decor variant="a" />
        <V5Head label="ПОЧЕМУ C.O.R.E." title="Не курс — операционная система" hi="мышления и навыков" sub="Восемь направлений работают как одна машина: от того, как ты думаешь, до того, что ты запускаешь." />
        <motion.div className="why-grid" variants={stg5} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.2 }}>
          {WHY5.map(([ic, t, d], i) => (
            <motion.div className="why-card" key={t} variants={fly(i % 2 ? 'right' : 'left')}>
              <span className="ic">{ic}</span><h3>{t}</h3><p>{d}</p><span className="card-glow" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="section sec" id="themes5">
        <V5Decor variant="b" />
        <V5Head label="НАПРАВЛЕНИЯ" title="Восемь векторов" hi="одной системы" sub="Те же узлы, что на сетке первого экрана — теперь развёрнуто. Наведи, чтобы раскрыть суть." />
        <motion.div className="dir-grid" variants={stg5} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.15 }}>
          {THEMES.map((t, i) => (
            <motion.a href="#themes5" id={`d5-${t.id}`} key={t.id} className="dir-card" style={{ '--c': t.color }} variants={fly(i % 2 ? 'up' : 'scale')}>
              <span className="num cyber-font">{`0${i + 1}`}</span><span className="dot" />
              <div className="en cyber-font">{t.en}</div><div className="ru">{t.ru}</div><div className="sh">{t.short}</div><div className="reveal">{t.desc}</div><span className="card-glow" />
            </motion.a>
          ))}
        </motion.div>
      </section>

      <section className="section sec" id="how5">
        <V5Decor variant="a" />
        <V5Head label="КАК ЭТО РАБОТАЕТ" title="Четыре шага" hi="от хаоса к запуску" sub="Последовательный путь: фундамент → рынок → продукт → масштаб." />
        <div className="steps">
          <Parallax5 speed={40} className="steps-line" />
          <motion.div className="steps-row" variants={stg5} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.2 }}>
            {S5.map(([n, t, d], i) => (
              <motion.div className="step" key={n} variants={fly(i % 2 ? 'up' : 'down')}>
                <div className="step-num cyber-font">{n}</div><h3>{t}</h3><p>{d}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section sec" id="benefits5">
        <V5Decor variant="b" />
        <V5Head label="УРОВНИ" title="Выбери глубину" hi="погружения" sub="От бесплатной карты до полного доступа с менторством и департаментом разработки." />
        <motion.div className="tiers" variants={stg5} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.15 }}>
          {T5.map((p, i) => (
            <motion.div className={`tier ${p.tag ? 'featured' : ''}`} key={p.name} variants={fly(i === 0 ? 'left' : i === 2 ? 'right' : 'up')} whileHover={{ y: -8 }}>
              {p.tag && <span className="tier-tag cyber-font">{p.tag}</span>}
              <div className="tier-name">{p.name}</div>
              <div className="tier-price cyber-font">{p.price}<span>/мес</span></div>
              <ul>{p.feats.map((f) => <li key={f}>{f}</li>)}</ul>
              <a className="tier-btn cyber-font" href="#cta5">Выбрать</a><span className="card-glow" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="section sec" id="extra5">
        <V5Decor variant="a" />
        <V5Head label="ДОПОЛНИТЕЛЬНО" title="Инструменты" hi="внутри системы" />
        <motion.div className="extra-grid" variants={stg5} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.2 }}>
          {EX5.map(([ic, t, d]) => (
            <motion.div className="extra-card" key={t} variants={fly('scale')}><span className="ic">{ic}</span><h4>{t}</h4><p>{d}</p></motion.div>
          ))}
        </motion.div>
      </section>

      <section className="section sec" id="about5">
        <V5Decor variant="b" />
        <V5Head label="КОМАНДА" title="Те, кто держит" hi="систему" sub="Полнопрофильный департамент: стратегия, дизайн, разработка, медиа, маркетинг и эксплуатация." />
        <motion.div className="v5-team-grid" variants={stg5} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.15 }}>
          {TM5.map(([t, d], i) => (
            <motion.div className="v5-team-card" key={t} variants={fly(i % 2 ? 'right' : 'left')}>
              <div className="av cyber-font">{t[0]}</div>
              <div><div className="v5-team-role">{t}</div><div className="team-sub">{d}</div></div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="section sec cta-final" id="cta5">
        <V5Decor variant="a" />
        <Reveal5 dir="scale" className="cta-wrap">
          <h2 className="cta-title">Готов войти в <span className="hi">систему</span>?</h2>
          <p>Начни с карты направлений — за 15 минут увидишь свой путь от мышления к запуску.</p>
          <a className="cta-btn cyber-font" href="#themes5">Войти в Project C.O.R.E.</a>
        </Reveal5>
      </section>

      <footer className="footer" id="footer">
        <div className="cyber-font" style={{ color: 'var(--gold)', fontSize: 22, marginBottom: 10 }}>PROJECT C.O.R.E.</div>
        <div>Познай себя — и познаешь всё.</div>
        <div style={{ marginTop: 14, opacity: 0.7 }}>© {new Date().getFullYear()} Project CORE · Test Landing Vercel · Контакты · Юридическая информация</div>
      </footer>
    </div>
  );
}
