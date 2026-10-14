import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';

/**
 * "Do ruído ao sinal" — nuvem de partículas com 3 estados:
 *   A) ruído  (esfera aleatória, cinza)
 *   B) padrões (4 clusters gaussianos coloridos)
 *   C) modelo (superfície ordenada em gradiente azul → verde)
 * Todos os estados são calculados uma vez; a interpolação roda na GPU (vertex shader),
 * com um pequeno atraso por partícula para a transição parecer orgânica.
 */

const vertexShader = /* glsl */ `
  attribute vec3 aCluster;
  attribute vec3 aModel;
  attribute vec3 aColA;
  attribute vec3 aColB;
  attribute vec3 aColC;
  attribute float aSeed;

  uniform float uP1;
  uniform float uP2;
  uniform float uTime;
  uniform float uSize;
  uniform float uPR;

  varying vec3 vColor;
  varying float vAlpha;

  float stagger(float p, float seed) {
    return smoothstep(0.0, 1.0, clamp(p * 1.4 - seed * 0.4, 0.0, 1.0));
  }

  void main() {
    float t1 = stagger(uP1, aSeed);
    float t2 = stagger(uP2, aSeed);

    vec3 p = mix(position, aCluster, t1);
    p = mix(p, aModel, t2);

    // "respiração" sutil + leve turbulência no meio das transições
    float turb = sin(t1 * 3.14159) + sin(t2 * 3.14159);
    p += (0.035 + turb * 0.12) * vec3(
      sin(uTime * 0.8 + aSeed * 6.2831),
      cos(uTime * 0.7 + aSeed * 12.0),
      sin(uTime * 0.6 + aSeed * 3.0)
    );

    vec3 c = mix(aColA, aColB, t1);
    vColor = mix(c, aColC, t2);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPR * (0.55 + aSeed * 0.9) / -mv.z;
    vAlpha = 1.0 - smoothstep(5.0, 18.0, -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.0, r);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

const gauss = () => {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

function buildGeometry(n: number) {
  const A = new Float32Array(n * 3), B = new Float32Array(n * 3), C = new Float32Array(n * 3);
  const cA = new Float32Array(n * 3), cB = new Float32Array(n * 3), cC = new Float32Array(n * 3);
  const seed = new Float32Array(n);

  const grey = new Color('#a3afc4');
  const palette = ['#7CF5C8', '#6E8BFF', '#FFB86B', '#C792EA'].map((c) => new Color(c));
  const centers = [[-2.4, 1.1, 0], [2.2, 1.3, -0.6], [-1.4, -1.6, 0.6], [2, -1.4, 0.3]];
  const low = new Color('#6E8BFF'), high = new Color('#7CF5C8'), tmp = new Color();
  const side = Math.ceil(Math.sqrt(n));

  for (let i = 0; i < n; i++) {
    const k = i * 3;
    seed[i] = Math.random();

    // A — ruído
    const r = 4.2 * Math.cbrt(Math.random());
    const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    A[k] = r * Math.sin(ph) * Math.cos(th);
    A[k + 1] = r * Math.sin(ph) * Math.sin(th);
    A[k + 2] = r * Math.cos(ph);
    grey.toArray(cA, k);

    // B — clusters
    const ci = i % 4, c = centers[ci];
    B[k] = c[0] + gauss() * 0.55;
    B[k + 1] = c[1] + gauss() * 0.55;
    B[k + 2] = c[2] + gauss() * 0.55;
    palette[ci].toArray(cB, k);

    // C — superfície do modelo
    const x = ((i % side) / side - 0.5) * 8;
    const z = (Math.floor(i / side) / side - 0.5) * 6;
    const y = Math.sin(x * 0.9) * Math.cos(z * 0.8) * 0.9 - 0.2;
    C[k] = x; C[k + 1] = y; C[k + 2] = z;
    tmp.copy(low).lerp(high, Math.min(1, Math.max(0, (y + 1.1) / 2))).toArray(cC, k);
  }

  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(A, 3));
  g.setAttribute('aCluster', new BufferAttribute(B, 3));
  g.setAttribute('aModel', new BufferAttribute(C, 3));
  g.setAttribute('aColA', new BufferAttribute(cA, 3));
  g.setAttribute('aColB', new BufferAttribute(cB, 3));
  g.setAttribute('aColC', new BufferAttribute(cC, 3));
  g.setAttribute('aSeed', new BufferAttribute(seed, 1));
  return g;
}

export interface HeroScene {
  setProgress(p: number): void;
  dispose(): void;
}

export function createHeroScene(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean }): HeroScene | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null; // sem WebGL: fica o gradiente de fallback do CSS
  }

  const mobile = matchMedia('(max-width: 767px)').matches;
  const pr = Math.min(devicePixelRatio, 1.5);
  renderer.setPixelRatio(pr);

  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const geometry = buildGeometry(mobile ? 3500 : 9000);
  const uniforms = {
    uP1: { value: 0 },
    uP2: { value: 0 },
    uTime: { value: 0 },
    uSize: { value: mobile ? 34 : 28 },
    uPR: { value: pr },
  };
  const material = new ShaderMaterial({
    vertexShader, fragmentShader, uniforms,
    transparent: true, depthWrite: false, blending: AdditiveBlending,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const wide = w >= 960;
    points.position.set(wide ? 1.6 : 0, wide ? 0 : 1.9, 0);
    points.scale.setScalar(wide ? 1 : 0.62);
    if (opts.reducedMotion) render();
  };

  let target = opts.reducedMotion ? 1 : 0;
  let smooth = target;
  let mx = 0, my = 0, time = 0, last = performance.now();
  let visible = true;
  let raf = 0;

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

  function render() {
    // 0–0.5: ruído → clusters · 0.55–0.95: clusters → modelo
    const p1 = ease(clamp01((smooth - 0.08) / 0.42));
    const p2 = ease(clamp01((smooth - 0.55) / 0.4));
    uniforms.uP1.value = p1;
    uniforms.uP2.value = p2;
    uniforms.uTime.value = time;
    const spin = opts.reducedMotion ? 0.3 : time * 0.06 + mx * 0.6;
    points.rotation.y = spin * (1 - p2 * 0.7) - p2 * 0.35;
    points.rotation.x = (opts.reducedMotion ? 0 : my * 0.3) + p2 * 0.45;
    renderer.render(scene, camera);
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!visible || document.hidden) return;
    time += dt;
    smooth += (target - smooth) * Math.min(1, dt * 5);
    render();
  }

  const onPointer = (e: PointerEvent) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(canvas);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  if (opts.reducedMotion) {
    render();
  } else {
    addEventListener('pointermove', onPointer, { passive: true });
    raf = requestAnimationFrame(frame);
  }
  canvas.classList.add('ready');

  return {
    setProgress(p) { if (!opts.reducedMotion) target = p; },
    dispose() {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onPointer);
      io.disconnect(); ro.disconnect();
      geometry.dispose(); material.dispose(); renderer.dispose();
    },
  };
}
