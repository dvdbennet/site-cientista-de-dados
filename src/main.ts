import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initPage, initRevealsWhenReady, reducedMotion } from './page';
import { introHero } from './motion/reveals';
import { createBeats } from './ui/hero-ui';
import { initCases, initProcessLine } from './ui/cases';
import { initCalendar, initLeadForm } from './ui/contact';
import type { HeroScene } from './scene/hero-scene';

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
  if ('requestIdleCallback' in window) requestIdleCallback(() => void load(), { timeout: 1200 });
  else setTimeout(() => void load(), 300);
}

initLeadForm();
initCalendar();

initCases({ parallax: !reducedMotion });
if (!reducedMotion) initProcessLine();

void initRevealsWhenReady().then(() => ScrollTrigger.refresh());
