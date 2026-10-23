import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initPage, initRevealsWhenReady, reducedMotion } from './page';
import { introHero } from './motion/reveals';
import { createBeats } from './ui/hero-ui';
import { initCases } from './ui/cases';
import { initProcess } from './ui/process';
import { initConstellation } from './ui/constellation';
import { initCalendar, initLeadForm } from './ui/contact';
import { initQuiz } from './ui/quiz';
import type { HeroScene } from './scene/hero-scene';

/** Roda quando o navegador estiver ocioso (com prazo máximo). */
const whenIdle = (fn: () => void, timeout = 1500) =>
  'requestIdleCallback' in window ? requestIdleCallback(() => fn(), { timeout }) : setTimeout(fn, 200);

initPage();
if (!reducedMotion) introHero();

// Progresso do hero (0 → 1 ao longo da seção sticky)
const setBeat = createBeats();
let scene: HeroScene | null = null;
const heroTrigger = ScrollTrigger.create({
  trigger: '#hero',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => {
    setBeat(self.progress);
    scene?.setProgress(self.progress);
  },
});
setBeat(heroTrigger.progress);

// 3D carregado depois do primeiro paint (Three.js fica num chunk separado)
const canvas = document.getElementById('scene') as HTMLCanvasElement | null;
if (canvas) {
  const load = async () => {
    const { createHeroScene } = await import('./scene/hero-scene');
    scene = createHeroScene(canvas, { reducedMotion });
    scene?.setProgress(heroTrigger.progress);
  };
  // espera o carregamento + ociosidade para não competir com o primeiro paint
  const start = () => whenIdle(() => void load(), 2000);
  if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
}

// Partículas convergindo no convite final (carrega quando a seção se aproxima)
const signalCanvas = document.getElementById('signalScene') as HTMLCanvasElement | null;
if (signalCanvas) {
  let signal: import('./scene/signal-scene').SignalScene | null = null;
  const signalTrigger = ScrollTrigger.create({
    trigger: '#contato',
    start: 'top bottom',
    end: 'top 25%',
    onUpdate: (self) => signal?.setProgress(self.progress),
  });
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    const { createSignalScene } = await import('./scene/signal-scene');
    signal = createSignalScene(signalCanvas, { reducedMotion });
    signal?.setProgress(signalTrigger.progress);
  }, { rootMargin: '600px' });
  io.observe(signalCanvas);
}

initLeadForm();
initCalendar();
whenIdle(initQuiz);

initCases({ parallax: !reducedMotion });
whenIdle(() => {
  initProcess({ animate: !reducedMotion });
  initConstellation({ animate: !reducedMotion });
  ScrollTrigger.refresh();
});

void initRevealsWhenReady().then(() => ScrollTrigger.refresh());
