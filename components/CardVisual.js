'use client';

// Small on-theme animated SVG previews shown inside split-open cards
// (themes-grid + feature-grid). Pure CSS-driven (no rAF/canvas) so many
// can sit mounted at once with negligible cost.

const THEME_SVG = {
  thinking: ({ color }) => (
    <svg viewBox="0 0 100 70" className="cv-svg">
      <g stroke={color} strokeWidth="1" fill="none" opacity="0.55">
        <path className="cv-dash" d="M14 50 L40 18 L62 42 L86 16" />
        <path className="cv-dash" d="M14 50 L62 42" />
      </g>
      {[[14, 50], [40, 18], [62, 42], [86, 16]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4.5" fill={color} className="cv-pulse" style={{ animationDelay: `${i * 0.22}s` }} />
      ))}
    </svg>
  ),
  marketing: ({ color }) => (
    <svg viewBox="0 0 100 70" className="cv-svg">
      <g fill={color}>
        {[16, 9, 22, 14, 28].map((h, i) => (
          <rect key={i} className="cv-bar" x={10 + i * 18} y={60 - h} width="10" height={h}
            style={{ animationDelay: `${i * 0.12}s`, transformOrigin: `${15 + i * 18}px 60px` }} />
        ))}
      </g>
      <path d="M10 46 L28 30 L46 38 L64 18 L86 12" stroke={color} strokeWidth="1.6" fill="none" opacity="0.7" />
    </svg>
  ),
  earn: ({ color }) => (
    <svg viewBox="0 0 100 70" className="cv-svg">
      <circle cx="50" cy="35" r="10" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="50" cy="35" r="20" className="cv-pulse" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
      <circle cx="50" cy="35" r="28" className="cv-pulse" fill="none" stroke={color} strokeWidth="1" opacity="0.25" style={{ animationDelay: '0.4s' }} />
      <path d="M50 30v10M46 33h8" stroke={color} strokeWidth="1.6" />
    </svg>
  ),
  webdesign: ({ color }) => (
    <svg viewBox="0 0 100 70" className="cv-svg">
      <rect x="8" y="10" width="84" height="50" rx="3" fill="none" stroke={color} strokeWidth="1.4" opacity="0.6" />
      <line x1="8" y1="22" x2="92" y2="22" stroke={color} strokeWidth="1" opacity="0.4" />
      {[18, 30, 42].map((y, i) => <rect key={i} x="16" y={y} width={i === 1 ? 50 : 34} height="6" fill={color} opacity="0.35" />)}
      <rect className="cv-sweep" x="8" y="10" width="14" height="50" fill={color} opacity="0.16" />
    </svg>
  ),
  '3d': ({ color }) => (
    <svg viewBox="0 0 100 70" className="cv-svg">
      <g stroke={color} strokeWidth="1.4" fill="none" opacity="0.75" className="cv-spin">
        <path d="M50 14 L78 28 L78 50 L50 64 L22 50 L22 28 Z" />
        <path d="M50 14 V64 M22 28 L78 50 M78 28 L22 50" opacity="0.5" />
      </g>
    </svg>
  ),
  audio: ({ color }) => (
    <svg viewBox="0 0 100 70" className="cv-svg">
      <g fill={color}>
        {[10, 28, 42, 22, 34, 16].map((h, i) => (
          <rect key={i} className="cv-bar" x={8 + i * 14} y={35 - h / 2} width="7" height={h}
            style={{ animationDelay: `${i * 0.09}s`, transformOrigin: `${11.5 + i * 14}px 35px` }} />
        ))}
      </g>
    </svg>
  ),
  video: ({ color }) => (
    <svg viewBox="0 0 100 70" className="cv-svg">
      <rect x="8" y="14" width="84" height="42" rx="4" fill="none" stroke={color} strokeWidth="1.4" opacity="0.6" />
      <path d="M42 26 L64 35 L42 44 Z" fill={color} opacity="0.85" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} className="cv-flicker" x={8 + i * 14} y="10" width="6" height="4" fill={color} opacity="0.5"
          style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </svg>
  ),
  game: ({ color }) => (
    <svg viewBox="0 0 100 70" className="cv-svg">
      <g fill={color}>
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} className="cv-pulse" x={20 + (i % 3) * 22} y={14 + Math.floor(i / 3) * 16} width="12" height="12"
            style={{ animationDelay: `${(i % 3) * 0.15 + Math.floor(i / 3) * 0.1}s` }} opacity="0.7" />
        ))}
      </g>
    </svg>
  ),
};

export function ThemeVisual({ id, color }) {
  const V = THEME_SVG[id] || THEME_SVG.thinking;
  return <div className="card-visual">{V({ color })}</div>;
}

export function FeatureVisual({ d, color }) {
  return (
    <div className="card-visual">
      <svg viewBox="0 0 100 70" className="cv-svg">
        <circle cx="50" cy="35" r="22" className="cv-pulse" fill="none" stroke={color} strokeWidth="1" opacity="0.35" />
        <circle cx="50" cy="35" r="30" className="cv-pulse" fill="none" stroke={color} strokeWidth="1" opacity="0.2" style={{ animationDelay: '0.5s' }} />
        <g transform="translate(38,23)">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={color} strokeWidth="1.6"><path d={d} /></svg>
        </g>
        <rect className="cv-sweep" x="8" y="8" width="14" height="54" fill={color} opacity="0.12" />
      </svg>
    </div>
  );
}
