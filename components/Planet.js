'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Glowing wireframe earth-like planet (matches reference globe).
export default function Planet() {
  const core = useRef();
  const wire = useRef();
  const atmo = useRef();

  useFrame((state, delta) => {
    if (core.current) core.current.rotation.y += delta * 0.18;
    if (wire.current) wire.current.rotation.y += delta * 0.18;
    if (atmo.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.01;
      atmo.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      {/* solid dark core */}
      <mesh ref={core}>
        <sphereGeometry args={[1.28, 48, 48]} />
        <meshStandardMaterial
          color={'#08183a'}
          emissive={'#0a2a66'}
          emissiveIntensity={0.55}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      {/* glowing wireframe shell */}
      <mesh ref={wire} scale={1.012}>
        <sphereGeometry args={[1.28, 36, 36]} />
        <meshBasicMaterial color={'#3fb6ff'} wireframe transparent opacity={0.45} />
      </mesh>
      {/* atmosphere glow */}
      <mesh ref={atmo} scale={1.14}>
        <sphereGeometry args={[1.28, 32, 32]} />
        <meshBasicMaterial color={'#2a6cff'} transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
