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

  const netGeo = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(ORBIT_R, 2);
    return new THREE.WireframeGeometry(ico);
  }, []);

  const dots = useMemo(() => fibSphere(90, ORBIT_R), []);
  const themePts = useMemo(() => fibSphere(THEMES.length, ORBIT_R), []);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y -= delta * 0.07;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.08;
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={netGeo}>
        <lineBasicMaterial color={'#2f7fd6'} transparent opacity={0.32} />
      </lineSegments>

      {dots.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color={'#6fd0ff'} transparent opacity={0.8} toneMapped={false} />
        </mesh>
      ))}

      {THEMES.map((t, i) => (
        <ThemeNode key={t.id} theme={t} pos={themePts[i]} />
      ))}
    </group>
  );
}
