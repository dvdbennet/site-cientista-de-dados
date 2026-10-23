import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Processo contado pelo scroll: cada etapa acende quando chega ao meio da tela
 * e o painel fixo troca para a mini-animação correspondente.
 */
export function initProcess({ animate = true } = {}) {
  const steps = [...document.querySelectorAll<HTMLElement>('#proc .step')];
  const panels = [...document.querySelectorAll<SVGSVGElement>('#proc .pv')];
  const tag = document.getElementById('procTag');
  const line = document.querySelector('#proc .proc-line');
  if (!steps.length) return;

  // prepara os traços para serem "desenhados"
  panels.forEach((svg) => svg.querySelectorAll<SVGGeometryElement>('[data-draw]').forEach((p) => {
    const len = Math.ceil(p.getTotalLength());
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = animate ? `${len}` : '0';
    p.dataset.len = String(len);
  }));

  let current = -1;
  const activate = (i: number) => {
    if (i === current) return;
    current = i;
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    panels.forEach((svg, k) => svg.classList.toggle('is-active', k === i));
    if (tag) tag.textContent = `${steps[i].querySelector('.n')?.textContent?.slice(0, 2)} · ${steps[i].querySelector('h3')?.textContent}`;
    if (!animate) return;
    const svg = panels[i];
    gsap.fromTo(svg.querySelectorAll('[data-draw]'),
      { strokeDashoffset: (_: number, el: SVGElement) => Number(el.dataset.len) },
      { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.08, overwrite: true });
    gsap.fromTo(svg.querySelectorAll('[data-pop]'),
      { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.03, delay: 0.15, overwrite: true });
  };

  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) activate(i); },
    });
  });
  activate(0);

  if (line && animate) {
    gsap.fromTo(line, { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '#proc .proc-steps', start: 'top 55%', end: 'bottom 55%', scrub: 0.5 },
    });
  } else if (line) {
    (line as HTMLElement).style.transform = 'none';
  }
}
