'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import Planet from './Planet';
import NodeGrid from './NodeGrid';
import Starfield from './Starfield';

function CameraRig() {
  const { camera } = useThree();
  const center = useRef(new THREE.Vector3(0, 0, 0));
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // gentle radius breathing — life without ever changing the orbital speed
    const radius = 5.0 + Math.sin(t * 0.06) * 0.18;
    // CONSTANT angular velocity, right -> left, never stops, never reverses.
    const angle = -t * 0.032;
    camera.position.x = Math.sin(angle) * radius;
    camera.position.z = Math.cos(angle) * radius;
    camera.position.y = 0.16 + Math.sin(t * 0.09) * 0.14; // soft vertical glide near horizon
    camera.lookAt(center.current);
  });
  return null;
}

function flareTex(inner) {
  const s = 256, c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(225,240,255,1)');
  g.addColorStop(inner, 'rgba(120,180,255,0.55)');
  g.addColorStop(1, 'rgba(60,120,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// strong cinematic light source on the LEFT (matches ref 002)
function LeftFlare() {
  const halo = useMemo(() => flareTex(0.18), []);
  const core = useMemo(() => flareTex(0.06), []);
  return (
    <group position={[-7.5, 1.4, -2]}>
      <sprite scale={[16, 16, 1]}>
        <spriteMaterial map={halo} blending={THREE.AdditiveBlending} transparent depthWrite={false} opacity={0.55} />
      </sprite>
      <sprite scale={[5.5, 5.5, 1]}>
        <spriteMaterial map={core} blending={THREE.AdditiveBlending} transparent depthWrite={false} opacity={0.9} />
      </sprite>
    </group>
  );
}

export default function HeroScene({ dim = false, realistic = false }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.18, 5.0], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
    >
      <color attach="background" args={['#03040b']} />
      <fog attach="fog" args={['#03040b', 9, 26]} />
      <ambientLight intensity={0.3} />
      {/* key light from the left, matches the flare */}
      <directionalLight position={[-7, 2, 3]} intensity={2.6} color={'#9ec8ff'} />
      <pointLight position={[-4, 1, 2]} intensity={22} distance={16} color={'#3a7bff'} />
      <pointLight position={[4, -2, -3]} intensity={6} distance={14} color={'#5c6cff'} />

      <Suspense fallback={null}>
        <Starfield dim={dim} />
        <LeftFlare />
        <Planet realistic={realistic} />
        <NodeGrid />
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}
