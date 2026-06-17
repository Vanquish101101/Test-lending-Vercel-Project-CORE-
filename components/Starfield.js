'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Starfield({ count = 4200 }) {
  const ref = useRef();
  const matRef = useRef();

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#bcd8ff'),
      new THREE.Color('#9fc0ff'),
      new THREE.Color('#ffe9c2'),
      new THREE.Color('#cfe0ff'),
    ];
    for (let i = 0; i < count; i++) {
      const r = 10 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      // mostly small, a few bright big ones
      size[i] = Math.random() < 0.06 ? 2.6 + Math.random() * 3.2 : 0.5 + Math.random() * 1.4;
      phase[i] = Math.random() * Math.PI * 2;
      const c = palette[(Math.random() * palette.length) | 0];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    return g;
  }, [count]);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPix: { value: 1 } },
    vertexShader: `
      attribute float aSize; attribute float aPhase; attribute vec3 aColor;
      uniform float uTime; uniform float uPix; varying vec3 vColor; varying float vTw;
      void main(){
        vColor = aColor;
        float tw = 0.55 + 0.45 * sin(uTime * (1.2 + aPhase * 0.25) + aPhase * 6.2831);
        vTw = tw;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPix * (1.0 + tw * 0.7) * (90.0 / -mv.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor; varying float vTw;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float core = smoothstep(0.5, 0.0, d);
        float glow = pow(core, 2.5);
        // little cross sparkle for big stars
        float cross = max(0.0, 1.0 - abs(uv.x) * 9.0) + max(0.0, 1.0 - abs(uv.y) * 9.0);
        cross *= smoothstep(0.5, 0.0, d) * 0.4;
        float a = (glow + cross) * (0.5 + vTw * 0.9);
        if (a < 0.01) discard;
        gl_FragColor = vec4(vColor, a);
      }
    `,
  }), []);

  useFrame((state) => {
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uPix.value = Math.min(state.gl.getPixelRatio(), 2);
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.006;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.03;
    }
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}
