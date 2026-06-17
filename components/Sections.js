'use client';
import { motion } from 'framer-motion';
import { THEMES } from '@/lib/themes';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.06 } }),
};

const STEPS = [
  'Мышление — фундамент: ментальные модели и фокус',
  'Маркетинг и Заработок — применяешь мышление к рынку',
  'Веб / 3D / Аудио / Видео / Game — создаёшь продукт',
  'Запуск и масштабирование — деплой и рост',
];

export default function Sections() {
  return (
    <div className="content">
      {/* ===== Block 2: themes ===== */}
      <section className="section" id="themes">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          Разделы и направления
        </motion.h2>
        <motion.p className="lead" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          Восемь направлений Project C.O.R.E. — те же, что в меню и на сетке узлов первого экрана.
          Наведи на блок, чтобы увидеть суть; каждый раздел готов вести к своему ресурсу.
        </motion.p>
        <div className="themes-grid">
          {THEMES.map((t, i) => (
            <motion.a
              href={`#${t.id}`}
              id={t.id}
              key={t.id}
              className="theme-card"
              style={{ color: t.color }}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              whileHover={{ y: -6, borderCOLOR: t.color }}
            >
              <span className="dot" style={{ background: t.color, color: t.color }} />
              <span className="glow" style={{ background: t.color }} />
              <div className="en">{t.en}</div>
              <div className="ru">{t.ru}</div>
              <div className="sh">{t.short}</div>
              <div className="reveal">{t.desc}</div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ===== Block 3: benefits + diagram ===== */}
      <section className="section" id="benefits">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          Что даёт изучение
        </motion.h2>
        <motion.p className="lead" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          Последовательный путь формирования мышления и навыков — от фундамента к запуску.
          Карта вертикального среза: разделы связаны в единую систему.
        </motion.p>
        <div className="diagram">
          {STEPS.map((s, i) => (
            <motion.div
              className="diag-row"
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <div className="diag-node">{`0${i + 1}`}</div>
              <div className="diag-line" />
              <div className="diag-node" style={{ minWidth: 'auto', flex: 1 }}>{s}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== Block 4: about ===== */}
      <section className="section" id="about">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          О нас
        </motion.h2>
        <div className="about-grid">
          <motion.div className="about-card" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h3>Кто мы</h3>
            <p>Project C.O.R.E. — экосистема знаний и инструментов: от мышления и маркетинга до 3D,
              аудио, видео и геймдизайна. Мы собираем лучшее в единую интерактивную карту.</p>
          </motion.div>
          <motion.div className="about-card" custom={1} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h3>Чем полезны</h3>
            <p>Помогаем пройти путь от идеи до запуска: структурируем обучение, даём инструменты и
              практику, соединяем направления в рабочую систему под твою цель.</p>
          </motion.div>
        </div>
        <div className="stats">
          {[['8', 'направлений'], ['∞', 'связей'], ['1', 'система'], ['24/7', 'доступ']].map(([n, l], i) => (
            <motion.div className="stat" key={l} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <div className="num">{n}</div>
              <div className="lbl">{l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== Extra block: why / map ===== */}
      <section className="section" id="more">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          Почему это работает
        </motion.h2>
        <div className="about-grid">
          <motion.div className="about-card" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h3>Единая стилистика</h3>
            <p>Космос, сетка узлов и связи — метафора целостности: всё, что снаружи, то и внутри.</p>
          </motion.div>
          <motion.div className="about-card" custom={1} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h3>Практика и результат</h3>
            <p>Каждый узел ведёт к ресурсам и заданиям. Учишься — применяешь — запускаешь.</p>
          </motion.div>
        </div>
      </section>

      <footer className="footer" id="footer">
        <div className="cyber-font" style={{ color: 'var(--gold)', fontSize: 22, marginBottom: 10 }}>PROJECT C.O.R.E.</div>
        <div>Познай себя — и познаешь всё.</div>
        <div style={{ marginTop: 14, opacity: 0.7 }}>© {new Date().getFullYear()} Project CORE · Test Landing Vercel · Контакты · Юридическая информация</div>
      </footer>
    </div>
  );
}
