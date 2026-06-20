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
      {kicker && (
        <motion.span className="sec-kicker cyber-font" variants={fromBottom} initial="hidden" whileInView="show" viewport={vp}>
          {kicker}
        </motion.span>
      )}
      <motion.h2 variants={blurUp} initial="hidden" whileInView="show" viewport={vp}>{title}</motion.h2>
      <motion.span className="sec-rule" aria-hidden
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={vp} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
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
              <span className="card-edge" aria-hidden />
              <span className="dot" style={{ background: t.color, color: t.color }} />
              <span className="glow" style={{ background: t.color }} />
              <span className="theme-idx cyber-font" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
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
            <motion.div className="proc-step" key={n} custom={i} variants={procStep} whileHover={{ x: 8 }}>
              <span className="proc-node" aria-hidden />
              <div className="proc-num">{n}</div>
              <div className="proc-body"><h3>{title}</h3><p>{text}</p></div>
              <span className="proc-arrow" aria-hidden>→</span>
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
              <span className="price-aura" aria-hidden />
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
            <motion.div className="team-card" key={name} custom={i} variants={popIn} whileHover={{ y: -8, scale: 1.04 }}>
              <span className="card-scan" aria-hidden />
              <div className="team-ava"><span /><span className="ava-ring" aria-hidden /></div>
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
          <span className="cta-ring" aria-hidden />
          <span className="cta-ring r2" aria-hidden />
          <motion.span className="cta-kicker cyber-font" variants={fromBottom} initial="hidden" whileInView="show" viewport={vp}>// ФИНАЛЬНЫЙ ШАГ</motion.span>
          <motion.h2 variants={blurUp} initial="hidden" whileInView="show" viewport={vp}>Готов собрать свою систему?</motion.h2>
          <p>Разберём твою цель и за 15 минут соберём маршрут из направлений именно под тебя.</p>
          <a href="#footer" className="cta-btn">Связаться</a>
        </motion.div>
      </section>

      <footer className="footer" id="footer">
        <span className="footer-rule" aria-hidden />
        <div className="footer-brand cyber-font">PROJECT C.O.R.E.</div>
        <div className="footer-motto">Познай себя — и познаешь всё.</div>
        <div className="footer-meta">© {new Date().getFullYear()} Project CORE · Test Landing Vercel · Контакты · Юридическая информация</div>
      </footer>
    </div>
  );
}
