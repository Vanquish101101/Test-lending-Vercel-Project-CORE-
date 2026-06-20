'use client';
import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { THEMES } from '@/lib/themes';

const ORBIT_R = 2.15;

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

function ThemeNode({ theme, pos }) {
  const [hovered, setHovered] = useState(false);
  const mesh = useRef();
  const dir = useMemo(() => pos.clone().normalize(), [pos]);
  const labelPos = useMemo(() => pos.clone().add(dir.clone().multiplyScalar(0.55)), [pos, dir]);

  useFrame((state) => {
    if (mesh.current) {
      const base = hovered ? 0.13 : 0.07;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + pos.x) * 0.12;
      mesh.current.scale.setScalar(base * pulse * (hovered ? 1.6 : 1));
    }
  });

  return (
    <group>
      <Line points={[pos, labelPos]} color={hovered ? theme.color : '#3a6caa'} lineWidth={hovered ? 1.6 : 0.8} transparent opacity={hovered ? 0.95 : 0.5} />
      <mesh
        ref={mesh}
        position={pos}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={theme.color} emissive={theme.color} emissiveIntensity={hovered ? 2.4 : 1.1} toneMapped={false} />
      </mesh>
      <Html position={labelPos} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`node-label ${hovered ? 'on' : ''}`} style={{ '--c': theme.color }}>
          <div className="nl-ru">{theme.ru}</div>
          <div className="nl-en">{theme.en}</div>
          <div className="nl-reveal">
            <div className="nl-desc">{theme.short}</div>
            <div className="nl-video"><span /></div>
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function NodeGrid() {
  const group = useRef();
  const mainMat = useRef();
  const fineMat = useRef();

  // primary cage (the net you liked) + a finer inner subdivision for "serious" density
  const netGeo = useMemo(() => new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(ORBIT_R, 2)), []);
  const fineGeo = useMemo(() => new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(ORBIT_R * 0.998, 3)), []);
  // glowing vertices at the structural nodes of the cage = serious tech read
  const verts = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(ORBIT_R, 2);
    const p = ico.attributes.position;
    const seen = new Set(); const out = [];
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(p, i);
      const k = `${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)}`;
      if (seen.has(k)) continue; seen.add(k); out.push(v);
    }
    return out;
  }, []);

  const dots = useMemo(() => fibSphere(90, ORBIT_R), []);
  const themePts = useMemo(() => fibSphere(THEMES.length, ORBIT_R), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y -= delta * 0.07;
      group.current.rotation.x = Math.sin(t * 0.1) * 0.08;
    }
    // subtle live energy pulse along the grid
    if (mainMat.current) mainMat.current.opacity = 0.34 + Math.sin(t * 0.9) * 0.06;
    if (fineMat.current) fineMat.current.opacity = 0.10 + Math.sin(t * 0.9 + 1.5) * 0.04;
  });

  return (
    <group ref={group}>
      {/* main net — additive glow, fog gives real depth fade */}
      <lineSegments geometry={netGeo}>
        <lineBasicMaterial ref={mainMat} color={'#3a9bef'} transparent opacity={0.34} blending={THREE.AdditiveBlending} fog />
      </lineSegments>
      {/* finer inner lattice for density / seriousness */}
      <lineSegments geometry={fineGeo}>
        <lineBasicMaterial ref={fineMat} color={'#1f6fcf'} transparent opacity={0.1} blending={THREE.AdditiveBlending} fog />
      </lineSegments>

      {/* structural glowing vertices */}
      {verts.map((p, i) => (
        <mesh key={`v${i}`} position={p}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshBasicMaterial color={'#bfe6ff'} transparent opacity={0.9} toneMapped={false} />
        </mesh>
      ))}

      {/* faint scattered grid points */}
      {dots.map((p, i) => (
        <mesh key={`d${i}`} position={p}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshBasicMaterial color={'#6fd0ff'} transparent opacity={0.55} toneMapped={false} />
        </mesh>
      ))}

      {THEMES.map((t, i) => (
        <ThemeNode key={t.id} theme={t} pos={themePts[i]} />
      ))}
    </group>
  );
}
