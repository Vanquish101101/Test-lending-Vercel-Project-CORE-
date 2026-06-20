'use client';
import { memo } from 'react';

// Realistic, instrument-style animated previews — one per node, looping inside the
// screen under each label. Desaturated, dense, technical (not cartoon icons).
// viewBox 120x60; `c` = theme accent (used sparingly, over neutral instrument chrome).
function Preview({ id, c }) {
  const bg = '#04070f';
  const grid = 'rgba(140,170,210,0.10)';
  const ink = 'rgba(170,190,225,0.55)';
  const common = { width: '100%', height: '100%', viewBox: '0 0 120 60', preserveAspectRatio: 'none' };
  const Grid = () => (
    <g stroke={grid} strokeWidth="0.4">
      {[12, 24, 36, 48].map((y) => <line key={'h' + y} x1="0" y1={y} x2="120" y2={y} />)}
      {[20, 40, 60, 80, 100].map((x) => <line key={'v' + x} x1={x} y1="0" x2={x} y2="60" />)}
    </g>
  );

  switch (id) {
    case 'thinking': { // knowledge graph — dense nodes, edges, a travelling signal
      const N = [[16, 30], [34, 14], [40, 44], [60, 26], [58, 50], [82, 16], [78, 40], [100, 30], [104, 48]];
      const E = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [3, 6], [4, 6], [5, 7], [6, 7], [6, 8], [7, 8]];
      return (
        <svg {...common}><rect width="120" height="60" fill={bg} /><Grid />
          <g stroke={ink} strokeWidth="0.5" opacity="0.8">
            {E.map(([a, b], i) => <line key={i} x1={N[a][0]} y1={N[a][1]} x2={N[b][0]} y2={N[b][1]} />)}
          </g>
          {N.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.6" fill={c} opacity="0.85">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" begin={`${(i % 5) * 0.4}s`} repeatCount="indefinite" />
            </circle>
          ))}
          <circle r="1.4" fill="#dfe9ff"><animateMotion path="M16,30 L40,44 L60,26 L78,40 L100,30" dur="2.6s" repeatCount="indefinite" /></circle>
        </svg>
      );
    }

    case 'marketing': // analytics terminal — axis, line series + faint bars
      return (
        <svg {...common}><rect width="120" height="60" fill={bg} /><Grid />
          <line x1="10" y1="6" x2="10" y2="52" stroke={ink} strokeWidth="0.6" />
          <line x1="10" y1="52" x2="114" y2="52" stroke={ink} strokeWidth="0.6" />
          {[22, 38, 54, 70, 86, 102].map((x, i) => (
            <rect key={i} x={x} width="7" fill={c} opacity="0.3">
              <animate attributeName="height" values={`${8 + i * 3};${16 + i * 5};${8 + i * 3}`} dur="3s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
              <animate attributeName="y" values={`${52 - (8 + i * 3)};${52 - (16 + i * 5)};${52 - (8 + i * 3)}`} dur="3s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
            </rect>
          ))}
          <polyline points="12,44 32,38 52,30 72,26 92,16 112,10" fill="none" stroke={c} strokeWidth="1.3" />
          <circle r="1.6" fill="#dfe9ff"><animateMotion path="M12,44 L32,38 L52,30 L72,26 L92,16 L112,10" dur="3.4s" repeatCount="indefinite" /></circle>
        </svg>
      );

    case 'earn': // trading terminal — candlesticks + rising trend
      return (
        <svg {...common}><rect width="120" height="60" fill={bg} /><Grid />
          {Array.from({ length: 11 }).map((_, i) => {
            const x = 12 + i * 9, up = i % 3 !== 1;
            const hi = 16 + (i * 2) % 10, lo = 40 - i * 1.6;
            return (
              <g key={i} stroke={up ? c : 'rgba(255,90,120,0.7)'} strokeWidth="0.6">
                <line x1={x} y1={hi - 5} x2={x} y2={lo + 5} />
                <rect x={x - 2} y={Math.min(hi, lo)} width="4" height={Math.abs(lo - hi)} fill={up ? c : 'rgba(255,90,120,0.5)'} opacity="0.6" />
              </g>
            );
          })}
          <polyline points="10,46 30,40 50,42 72,30 96,20 114,12" fill="none" stroke="#dfe9ff" strokeWidth="0.9" opacity="0.8" strokeDasharray="3 2">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.6s" repeatCount="indefinite" />
          </polyline>
        </svg>
      );

    case 'webdesign': // IDE — scrolling code lines + UI wireframe pane
      return (
        <svg {...common}><rect width="120" height="60" fill={bg} />
          <rect x="6" y="6" width="60" height="48" fill="none" stroke={ink} strokeWidth="0.5" />
          <g>
            <animateTransform attributeName="transform" type="translate" from="0 0" to="0 -12" dur="2.4s" repeatCount="indefinite" />
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x={10 + (i % 3) * 3} y={10 + i * 6} width={14 + (i * 7) % 38} height="2.4" fill={c} opacity={0.25 + (i % 3) * 0.18} />
            ))}
          </g>
          <rect x="6" y="6" width="60" height="48" fill="none" stroke={ink} strokeWidth="0.5" />
          <rect x="72" y="6" width="42" height="48" fill="none" stroke={ink} strokeWidth="0.5" />
          <rect x="76" y="10" width="34" height="12" fill={c} opacity="0.22" />
          <rect x="76" y="26" width="22" height="3" fill={ink} />
          <rect x="76" y="32" width="30" height="3" fill={ink} opacity="0.7" />
          <rect x="76" y="44" width="16" height="6" fill={c} opacity="0.4" />
        </svg>
      );

    case '3d': // rotating wireframe icosphere on a grid floor
      return (
        <svg {...common}><rect width="120" height="60" fill={bg} />
          <g stroke={grid} strokeWidth="0.4">
            {[40, 46, 52].map((y) => <line key={y} x1="20" y1={y} x2="100" y2={y} />)}
          </g>
          <g transform="translate(60 28)" stroke={c} strokeWidth="0.8" fill="none" opacity="0.9">
            <animateTransform attributeName="transform" type="rotate" additive="sum" from="0" to="360" dur="8s" repeatCount="indefinite" />
            <circle r="16" opacity="0.5" />
            <ellipse rx="16" ry="6" /><ellipse rx="16" ry="11" opacity="0.7" />
            <ellipse rx="6" ry="16" /><ellipse rx="11" ry="16" opacity="0.7" />
            <line x1="-16" y1="0" x2="16" y2="0" /><line x1="0" y1="-16" x2="0" y2="16" />
          </g>
        </svg>
      );

    case 'audio': // waveform + spectrum analyzer
      return (
        <svg {...common}><rect width="120" height="60" fill={bg} />
          <line x1="0" y1="20" x2="120" y2="20" stroke={ink} strokeWidth="0.4" opacity="0.5" />
          <polyline fill="none" stroke={c} strokeWidth="0.9" opacity="0.85"
            points="0,20 6,12 12,26 18,10 24,28 30,16 36,24 42,8 48,30 54,18 60,22 66,12 72,27 78,14 84,25 90,11 96,28 102,17 108,23 114,15 120,20">
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.4s" repeatCount="indefinite" />
          </polyline>
          {Array.from({ length: 18 }).map((_, i) => {
            const x = 4 + i * 6.4;
            return (
              <rect key={i} x={x} width="4" fill={c} opacity="0.55">
                <animate attributeName="height" values={`${4 + (i % 5) * 3};${10 + (i % 6) * 3};${4 + (i % 5) * 3}`} dur={`${0.7 + (i % 4) * 0.25}s`} repeatCount="indefinite" />
                <animate attributeName="y" values={`${52 - (4 + (i % 5) * 3)};${52 - (10 + (i % 6) * 3)};${52 - (4 + (i % 5) * 3)}`} dur={`${0.7 + (i % 4) * 0.25}s`} repeatCount="indefinite" />
              </rect>
            );
          })}
        </svg>
      );

    case 'video': // NLE timeline — frames track + waveform + scrubbing playhead
      return (
        <svg {...common}><rect width="120" height="60" fill={bg} />
          <g>
            <animateTransform attributeName="transform" type="translate" from="0 0" to="-26 0" dur="2.2s" repeatCount="indefinite" />
            {Array.from({ length: 7 }).map((_, i) => (
              <g key={i} transform={`translate(${i * 26} 0)`}>
                <rect x="3" y="8" width="22" height="16" fill="none" stroke={ink} strokeWidth="0.5" />
                <rect x="5" y="10" width="18" height="12" fill={c} opacity="0.14" />
              </g>
            ))}
          </g>
          <rect x="0" y="30" width="120" height="14" fill="#070d18" />
          <polyline fill="none" stroke={c} strokeWidth="0.7" opacity="0.7"
            points="0,37 8,33 16,40 24,34 32,39 40,32 48,41 56,35 64,38 72,33 80,40 88,34 96,39 104,33 112,40 120,36" />
          <rect x="0" y="48" width="120" height="6" fill="#0a1322" />
          <rect y="6" width="1.5" height="48" fill="#dfe9ff"><animate attributeName="x" values="6;112;6" dur="4s" repeatCount="indefinite" /></rect>
        </svg>
      );

    case 'game': // isometric level minimap + tracked entity
      return (
        <svg {...common}><rect width="120" height="60" fill={bg} />
          <g stroke={grid} strokeWidth="0.5">
            {Array.from({ length: 7 }).map((_, i) => <line key={'a' + i} x1={10 + i * 16} y1="8" x2={i * 16 - 26} y2="52" />)}
            {Array.from({ length: 6 }).map((_, i) => <line key={'b' + i} x1={6 + i * 8} y1={10 + i * 7} x2={70 + i * 8} y2={10 + i * 7} />)}
          </g>
          <rect x="30" y="22" width="8" height="8" fill={c} opacity="0.4" transform="skewX(-26)" />
          <rect x="64" y="30" width="8" height="8" fill={c} opacity="0.3" transform="skewX(-26)" />
          <rect width="6" height="6" fill="#dfe9ff">
            <animate attributeName="x" values="20;44;68;44;20" dur="3.2s" repeatCount="indefinite" />
            <animate attributeName="y" values="34;26;36;42;34" dur="3.2s" repeatCount="indefinite" />
          </rect>
        </svg>
      );

    default:
      return <svg {...common}><rect width="120" height="60" fill={bg} /></svg>;
  }
}

export default memo(Preview);
