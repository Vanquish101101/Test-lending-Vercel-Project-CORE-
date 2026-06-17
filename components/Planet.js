'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const RADIUS = 1.45;

// Cyan atmospheric rim glow (fresnel), back side.
function Atmosphere() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color('#3aa6ff') }, uPower: { value: 3.0 }, uIntensity: { value: 1.15 } },
    vertexShader: `
      varying vec3 vN; varying vec3 vP;
      void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vP = mv.xyz; gl_Position = projectionMatrix * mv; }
    `,
    fragmentShader: `
      varying vec3 vN; varying vec3 vP; uniform vec3 uColor; uniform float uPower; uniform float uIntensity;
      void main(){ vec3 v = normalize(-vP); float f = pow(1.0 - max(dot(v, vN), 0.0), uPower); gl_FragColor = vec4(uColor, f * uIntensity); }
    `,
  }), []);
  return (
    <mesh scale={1.18}>
      <sphereGeometry args={[RADIUS, 64, 64]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

export default function Planet() {
  const earth = useRef();
  const clouds = useRef();
  const [map, bump, night, water] = useTexture([
    '/textures/earth-blue-marble.jpg',
    '/textures/earth-topology.png',
    '/textures/earth-night.jpg',
    '/textures/earth-water.png',
  ]);

  useMemo(() => {
    [map, bump, night, water].forEach((t) => { if (t) t.anisotropy = 8; });
    map.colorSpace = THREE.SRGBColorSpace;
    night.colorSpace = THREE.SRGBColorSpace;
  }, [map, bump, night, water]);

  useFrame((state, delta) => {
    if (earth.current) earth.current.rotation.y += delta * 0.045;
    if (clouds.current) clouds.current.rotation.y += delta * 0.06;
  });

  return (
    <group rotation={[0.35, 0, 0.08]}>
      <mesh ref={earth}>
        <sphereGeometry args={[RADIUS, 96, 96]} />
        <meshStandardMaterial
          map={map}
          bumpMap={bump}
          bumpScale={0.04}
          metalnessMap={water}
          metalness={0.35}
          roughness={0.78}
          emissiveMap={night}
          emissive={'#ffd27a'}
          emissiveIntensity={1.7}
        />
      </mesh>
      <Atmosphere />
    </group>
  );
}
