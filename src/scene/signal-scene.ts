import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, PerspectiveCamera, Points, Scene, ShaderMaterial, WebGLRenderer,
} from 'three';

/**
 * Fecho da metáfora: no convite final, partículas espalhadas convergem para
 * um único ponto — "o sinal" — conforme a seção entra na tela.
 */
const vertexShader = /* glsl */ `
  attribute vec3 aTarget;
  attribute vec3 aColor;
  attribute float aSeed;
  uniform float uP;
  uniform float uTime;
  uniform float uSize;
  uniform float uPR;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float t = smoothstep(0.0, 1.0, clamp(uP * 1.5 - aSeed * 0.5, 0.0, 1.0));
    // órbita pequena em volta do ponto final, para ele "respirar"
    float a = uTime * (0.6 + aSeed) + aSeed * 40.0;
    vec3 orbit = aTarget + vec3(cos(a), sin(a), sin(a * 0.7)) * 0.08 * aSeed;
    vec3 p = mix(position, orbit, t);
    // espiral durante o caminho
    float sw = (1.0 - t) * t * 2.2;
    p.xy = mat2(cos(sw), -sin(sw), sin(sw), cos(sw)) * p.xy;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPR * (0.5 + aSeed) / -mv.z * (1.0 - t * 0.45);
    vColor = mix(aColor, vec3(0.486, 0.961, 0.784), t);
    vAlpha = mix(0.75, 1.0, t);
  }
`;
const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.0, r) * vAlpha);
  }
`;

export interface SignalScene { setProgress(p: number): void }

export function createSignalScene(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean }): SignalScene | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true });
  } catch {
    return null;
  }
  const pr = Math.min(devicePixelRatio, 1.5);
  renderer.setPixelRatio(pr);
  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 9;

  const n = matchMedia('(max-width: 767px)').matches ? 1400 : 2600;
  const pos = new Float32Array(n * 3), target = new Float32Array(n * 3), col = new Float32Array(n * 3), seed = new Float32Array(n);
  const palette = ['#7CF5C8', '#6E8BFF', '#FFB86B', '#C792EA', '#a3afc4'].map((c) => new Color(c));
  for (let i = 0; i < n; i++) {
    const r = 2.2 + Math.random() * 3.2, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph) * 0.6], i * 3);
    target.set([0, 0, 0], i * 3);
    palette[i % palette.length].toArray(col, i * 3);
    seed[i] = Math.random();
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(pos, 3));
  geo.setAttribute('aTarget', new BufferAttribute(target, 3));
  geo.setAttribute('aColor', new BufferAttribute(col, 3));
  geo.setAttribute('aSeed', new BufferAttribute(seed, 1));
  const uniforms = { uP: { value: opts.reducedMotion ? 1 : 0 }, uTime: { value: 0 }, uSize: { value: 26 }, uPR: { value: pr } };
  const points = new Points(geo, new ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, blending: AdditiveBlending }));
  points.frustumCulled = false;
  scene.add(points);

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let target01 = uniforms.uP.value, visible = false, time = 0, last = performance.now();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!visible || document.hidden) return;
    time += dt;
    uniforms.uTime.value = time;
    uniforms.uP.value += (target01 - uniforms.uP.value) * Math.min(1, dt * 4);
    renderer.render(scene, camera);
  };
  if (!opts.reducedMotion) requestAnimationFrame(frame);
  canvas.classList.add('ready');

  return { setProgress(p) { if (!opts.reducedMotion) target01 = p; } };
}
