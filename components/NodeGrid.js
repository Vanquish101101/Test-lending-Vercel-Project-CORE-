'use client';
import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { THEMES } from '@/lib/themes';

const ORBIT_R = 2.35;

function fibSphere(n, r) {
  const pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * rad * r, y * r, Math.sin(theta) * rad * r));
  }
  return pts;
}

function ThemePreview({ id, color }) {
  // topic-relevant animated mini-preview
  const byId = {
    webdesign: <div className="pv-web"><span /><span /><span /><i /></div>,
    '3d': <div className="pv-3d"><div className="cube"><span /><span /><span /><span /><span /><span /></div></div>,
    audio: <div className="pv-eq">{Array.from({ length: 9 }).map((_, i) => <b key={i} style={{ animationDelay: `${i * 0.08}s` }} />)}</div>,
    video: <div className="pv-film"><div className="strip" />{Array.from({ length: 5 }).map((_, i) => <u key={i} />)}</div>,
    marketing: <div className="pv-bars">{[0.5, 0.8, 0.4, 1, 0.65].map((h, i) => <b key={i} style={{ '--h': h, animationDelay: `${i * 0.12}s` }} />)}</div>,
    earn: <div className="pv-chart"><svg viewBox="0 0 100 50"><polyline points="0,45 20,38 40,42 60,22 80,26 100,6" /></svg><em>$</em></div>,
    thinking: <div className="pv-net">{Array.from({ length: 6 }).map((_, i) => <i key={i} style={{ animationDelay: `${i * 0.15}s` }} />)}</div>,
    game: <div className="pv-game"><span className="player" /><span className="coin" /></div>,
  };
  return <div className="pv-wrap" style={{ '--c': color }}>{byId[id] || <div className="pv-eq"><b /><b /><b /></div>}</div>;
}

function ThemeNode({ theme, pos, onHover }) {
  const [hovered, setHovered] = useState(false);
  const mesh = useRef();
  const halo = useRef();
  const dir = useMemo(() => pos.clone().normalize(), [pos]);
  const labelPos = useMemo(() => pos.clone().add(dir.clone().multiplyScalar(0.6)), [pos, dir]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (mesh.current) {
      const base = hovered ? 0.16 : 0.075;
      const pulse = 1 + Math.sin(t * 2 + pos.x * 3) * 0.14;
      mesh.current.scale.setScalar(base * pulse);
    }
    if (halo.current) {
      const s = (hovered ? 0.34 : 0.16) * (1 + Math.sin(t * 2 + pos.y) * 0.18);
      halo.current.scale.setScalar(s);
      halo.current.material.opacity = hovered ? 0.5 : 0.22;
    }
  });

  const set = (v) => { setHovered(v); onHover(v); document.body.style.cursor = v ? 'pointer' : 'auto'; };

  return (
    <group>
      <Line points={[pos, labelPos]} color={hovered ? theme.color : '#3f72b8'} lineWidth={hovered ? 1.8 : 0.8} transparent opacity={hovered ? 0.95 : 0.45} />
      <mesh ref={halo} position={pos}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={theme.color} transparent opacity={0.2} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={mesh} position={pos}
        onPointerOver={(e) => { e.stopPropagation(); set(true); }}
        onPointerOut={() => set(false)}>
        <sphereGeometry args={[1, 18, 18]} />
        <meshStandardMaterial color={theme.color} emissive={theme.color} emissiveIntensity={hovered ? 3.2 : 1.4} toneMapped={false} />
      </mesh>
      <Html position={labelPos} center distanceFactor={8.5} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`node-label ${hovered ? 'on' : ''}`} style={{ '--c': theme.color }}>
          <div className="nl-ru">{theme.ru}</div>
          <div className="nl-en">{theme.en}</div>
          <div className="nl-reveal">
            <div className="nl-desc">{theme.short}</div>
            <ThemePreview id={theme.id} color={theme.color} />
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function NodeGrid() {
  const group = useRef();
  const hoverCount = useRef(0);
  const [, force] = useState(0);

  const pts = useMemo(() => fibSphere(140, ORBIT_R), []);
  const themePts = useMemo(() => {
    const base = fibSphere(THEMES.length, ORBIT_R);
    return base;
  }, []);

  // plexus: connect each point to its 3 nearest neighbors (unique pairs)
  const lineGeo = useMemo(() => {
    const positions = [];
    const seen = new Set();
    for (let i = 0; i < pts.length; i++) {
      const d = [];
      for (let j = 0; j < pts.length; j++) if (i !== j) d.push([pts[i].distanceTo(pts[j]), j]);
      d.sort((a, b) => a[0] - b[0]);
      for (let k = 0; k < 3; k++) {
        const j = d[k][1];
        const key = i < j ? `${i}_${j}` : `${j}_${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        positions.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [pts]);

  const dotGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flatMap((p) => [p.x, p.y, p.z]), 3));
    return g;
  }, [pts]);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y -= delta * 0.035;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.06;
    // shudder when a theme node is hovered
    if (hoverCount.current > 0) {
      const t = state.clock.elapsedTime * 40;
      group.current.position.x = Math.sin(t) * 0.012;
      group.current.position.y = Math.cos(t * 1.3) * 0.012;
      const s = 1.03 + Math.sin(t * 0.7) * 0.006;
      group.current.scale.setScalar(s);
    } else {
      group.current.position.x *= 0.85;
      group.current.position.y *= 0.85;
      group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, 1, 0.1));
    }
  });

  const onHover = (v) => { hoverCount.current = Math.max(0, hoverCount.current + (v ? 1 : -1)); };

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color={'#3f8fe0'} transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <points geometry={dotGeo}>
        <pointsMaterial color={'#8fdcff'} size={0.045} sizeAttenuation transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {THEMES.map((t, i) => (
        <ThemeNode key={t.id} theme={t} pos={themePts[i]} onHover={onHover} />
      ))}
    </group>
  );
}
