'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const RADIUS = 1.32;

// soft round sprite for glowing dots
function softDot() {
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.85)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// fresnel atmosphere (rim lit from the left, like ref 002)
const atmoMat = new THREE.ShaderMaterial({
  transparent: true,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  uniforms: { uColor: { value: new THREE.Color('#5d8fcf') }, uLight: { value: new THREE.Vector3(-1, 0.2, 0.4).normalize() } },
  vertexShader: `varying vec3 vN; varying vec3 vP;
    void main(){ vN = normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vP=mv.xyz; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform vec3 uColor; uniform vec3 uLight; varying vec3 vN; varying vec3 vP;
    void main(){ vec3 v=normalize(-vP); float fres=pow(1.0-max(dot(v,vN),0.0),3.4);
      float lit=0.55+0.45*max(dot(normalize(vN), normalize(uLight)),0.0);
      gl_FragColor=vec4(uColor*lit, fres*0.42); }`,
});

export default function Planet({ realistic = false }) {
  const tex = useTexture('/textures/earth-blue-marble.jpg');
  const spin = useRef();
  const realMat = useRef();
  const rv = useRef(0); // 0 = schematic dotted, 1 = realistic textured

  // sample the texture: build a dotted globe — bright land, faint ocean grid
  const geo = useMemo(() => {
    const img = tex.image;
    const w = 600, h = 300;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    const sample = 90000; // fib points sampled over the sphere
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pos = [];
    const col = [];
    const sz = [];
    const cLand = new THREE.Color('#bfeaff');
    const cLandHot = new THREE.Color('#8fd6ff');
    const cOcean = new THREE.Color('#1d57c9');

    for (let i = 0; i < sample; i++) {
      const y = 1 - (i / (sample - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const x = Math.cos(theta) * rad;
      const z = Math.sin(theta) * rad;
      // equirectangular uv
      const lon = Math.atan2(z, x);
      const lat = Math.asin(y);
      const u = (lon / (2 * Math.PI)) + 0.5;
      const v = 0.5 - lat / Math.PI;
      const px = Math.min(w - 1, Math.max(0, Math.floor(u * w)));
      const py = Math.min(h - 1, Math.max(0, Math.floor(v * h)));
      const idx = (py * w + px) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const land = (r + g) - b * 1.15 > 18 && (r + g + b) > 60; // land vs ocean
      let keep = false, c, size;
      if (land) { keep = true; c = (r + g) > 230 ? cLandHot : cLand; size = 0.020 + Math.random() * 0.012; }
      else if (Math.random() < 0.14) { keep = true; c = cOcean; size = 0.010 + Math.random() * 0.006; } // sparse ocean grid
      if (!keep) continue;
      pos.push(x * RADIUS, y * RADIUS, z * RADIUS);
      col.push(c.r, c.g, c.b);
      sz.push(size);
    }
    const g3 = new THREE.BufferGeometry();
    g3.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g3.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g3.setAttribute('aSize', new THREE.Float32BufferAttribute(sz, 1));
    return g3;
  }, [tex]);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: { uTime: { value: 0 }, uTex: { value: softDot() }, uOpacity: { value: 1 } },
    vertexShader: `attribute float aSize; varying vec3 vC; uniform float uTime;
      void main(){ vC=color; vec4 mv=modelViewMatrix*vec4(position,1.0);
        float tw=0.82+0.18*sin(uTime*1.4+position.x*9.0+position.y*7.0);
        gl_PointSize=aSize*tw*(330.0/-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vC; uniform sampler2D uTex; uniform float uOpacity;
      void main(){ vec4 t=texture2D(uTex,gl_PointCoord); if(t.a<0.05) discard; gl_FragColor=vec4(vC,t.a*uOpacity); }`,
  }), []);

  useFrame((state, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.05; // slow, cinematic
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    // cross-fade schematic dots <-> realistic earth skin during the glitch swap
    const target = realistic ? 1 : 0;
    rv.current += (target - rv.current) * Math.min(1, delta * 6);
    mat.uniforms.uOpacity.value = 1 - rv.current * 0.9;
    if (realMat.current) realMat.current.opacity = rv.current;
  });

  return (
    <group>
      {/* dark core so the back dots are occluded -> reads as a solid globe */}
      <mesh>
        <sphereGeometry args={[RADIUS * 0.985, 64, 64]} />
        <meshStandardMaterial color={'#040a1c'} emissive={'#06183f'} emissiveIntensity={0.4} roughness={0.9} metalness={0.1} />
      </mesh>
      {/* dotted earth + realistic skin share one spin so they stay aligned */}
      <group ref={spin}>
        <points geometry={geo} material={mat} />
        {/* realistic textured earth — faded in only during the code-reality swap */}
        <mesh>
          <sphereGeometry args={[RADIUS * 0.992, 64, 64]} />
          <meshStandardMaterial
            ref={realMat}
            map={tex}
            transparent
            opacity={0}
            roughness={0.85}
            metalness={0.05}
            emissive={'#0a1830'}
            emissiveIntensity={0.35}
          />
        </mesh>
      </group>
      {/* atmosphere rim */}
      <mesh scale={1.09} material={atmoMat}>
        <sphereGeometry args={[RADIUS, 48, 48]} />
      </mesh>
    </group>
  );
}
