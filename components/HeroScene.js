'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import Planet from './Planet';
import NodeGrid from './NodeGrid';
import Starfield from './Starfield';

function CameraRig() {
  const { camera } = useThree();
  const center = useRef(new THREE.Vector3(0, 0, 0));
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const radius = 5.2;
    // slow horizontal orbit around the planet
    const angle = t * 0.06;
    camera.position.x = Math.sin(angle) * radius;
    camera.position.z = Math.cos(angle) * radius;
    camera.position.y = 0.5 + Math.sin(t * 0.15) * 0.35;
    camera.lookAt(center.current);
  });
  return null;
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.5, 5.2], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#04050d']} />
      <fog attach="fog" args={['#04050d', 8, 20]} />
      <ambientLight intensity={0.35} />
      {/* main light from the left (matches reference glow) */}
      <directionalLight position={[-6, 2, 3]} intensity={2.2} color={'#6fb8ff'} />
      <pointLight position={[-3, 1, 2]} intensity={20} distance={14} color={'#3a7bff'} />
      <pointLight position={[4, -2, -3]} intensity={8} distance={14} color={'#7c5cff'} />

      <Suspense fallback={null}>
        <Starfield />
        <Planet />
        <NodeGrid />
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}
