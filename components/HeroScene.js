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
    const radius = 6.0;
    const angle = t * 0.05; // full 360° orbit (~125s per revolution)
    camera.position.x = Math.sin(angle) * radius;
    camera.position.z = Math.cos(angle) * radius;
    camera.position.y = Math.sin(t * 0.12) * 0.7;
    camera.lookAt(center.current);
  });
  return null;
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      {/* transparent background so the matrix layer behind shows through gaps */}
      <ambientLight intensity={0.18} />
      {/* key light from the left (cinematic terminator, like reference 002) */}
      <directionalLight position={[-7, 1.5, 2.5]} intensity={3.0} color={'#cfe4ff'} />
      <pointLight position={[-4, 0.5, 2]} intensity={26} distance={18} color={'#3a7bff'} />
      <pointLight position={[5, -1.5, -3]} intensity={10} distance={18} color={'#7c5cff'} />

      <Suspense fallback={null}>
        <Starfield />
        <Planet />
        <NodeGrid />
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}
