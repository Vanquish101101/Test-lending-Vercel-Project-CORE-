'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// soft, natural round star (no hard cross flare) — reads like a real night sky
function starSprite() {
  const s = 64, c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.16, 'rgba(255,255,255,0.92)');
  g.addColorStop(0.42, 'rgba(255,255,255,0.32)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// realistic stellar color by temperature: mostly white, some blue-white, a few warm
function starColor() {
  const p = Math.random();
  if (p < 0.62) return new THREE.Color(0.95, 0.97, 1.0);      // white
  if (p < 0.80) return new THREE.Color(0.78, 0.86, 1.0);      // blue-white
  if (p < 0.92) return new THREE.Color(1.0, 0.96, 0.86);      // warm white
  return new THREE.Color(1.0, 0.84, 0.66);                    // orange
}

function Layer({ count, rMin, rMax, base, twinkleAmt, twinkleSpd, dim }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const ph = new Float32Array(count);
    const sp = new Float32Array(count);
    const tw = new Float32Array(count);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = rMin + Math.random() * (rMax - rMin);
      const th = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(phi);
      // magnitude distribution: the overwhelming majority are tiny/faint specks
      const mag = Math.pow(Math.random(), 4.0);
      sz[i] = base * (0.3 + mag * 1.7);
      ph[i] = Math.random() * Math.PI * 2;
      sp[i] = 0.4 + Math.random() * 1.4; // each star scintillates at its own rate
      // ~2/3 of stars actively twinkle/shimmer; the remaining ~1/3 sit near-steady
      tw[i] = Math.random() < 0.66 ? 0.5 + Math.random() * 0.5 : Math.random() * 0.18;
      const c = starColor();
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(sp, 1));
    g.setAttribute('aTwk', new THREE.BufferAttribute(tw, 1));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [count, rMin, rMax, base]);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    uniforms: { uTime: { value: 0 }, uTex: { value: starSprite() }, uAmt: { value: twinkleAmt }, uFade: { value: 1 } },
    vertexShader: `attribute float aSize; attribute float aPhase; attribute float aSpeed; attribute float aTwk;
      varying vec3 vC; varying float vT; uniform float uTime; uniform float uAmt;
      void main(){
        float amp = uAmt * aTwk;                       // per-star twinkle strength
        float osc = 0.5 + 0.5*sin(uTime*aSpeed*${twinkleSpd.toFixed(2)} + aPhase);
        vT = 1.0 - amp + amp*osc;                       // glow intensity varies per star
        // barely-there chromatic shimmer on the twinkling stars (warm <-> cool)
        float ch = sin(uTime*aSpeed*0.6 + aPhase*1.7) * 0.07 * aTwk;
        vC = clamp(color * vec3(1.0 + ch, 1.0, 1.0 - ch), 0.0, 1.0);
        vec4 mv = modelViewMatrix*vec4(position,1.0);
        gl_PointSize = aSize*(205.0/-mv.z)*(0.82+0.30*vT);
        gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vC; varying float vT; uniform sampler2D uTex; uniform float uFade;
      void main(){ vec4 t=texture2D(uTex,gl_PointCoord); if(t.a<0.03) discard;
        gl_FragColor=vec4(vC, t.a*vT*uFade); }`,
  }), [twinkleAmt]);

  useFrame((state, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.0035; // slow parallax drift
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    // stars simply fade away / fade back in sync with the glitch (no scatter)
    mat.uniforms.uFade.value += ((dim ? 0 : 1) - mat.uniforms.uFade.value) * Math.min(1, delta * 8);
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

export default function Starfield({ dim = false }) {
  return (
    <group>
      {/* deep faint background — dense milky dust of distant stars (tiny specks) */}
      <Layer count={22000} rMin={45} rMax={95} base={0.5} twinkleAmt={0.38} twinkleSpd={0.8} dim={dim} />
      {/* mid field — the bulk of visible stars, soft varied scintillation */}
      <Layer count={5600} rMin={24} rMax={52} base={0.8} twinkleAmt={0.55} twinkleSpd={1.15} dim={dim} />
      {/* near brighter stars — a few, with visible live twinkle */}
      <Layer count={760} rMin={15} rMax={32} base={1.25} twinkleAmt={0.72} twinkleSpd={1.7} dim={dim} />
    </group>
  );
}
