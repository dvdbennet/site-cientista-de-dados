import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let current: Lenis | null = null;
/** Instância atual do Lenis (null com "reduzir movimento"). */
export const getLenis = () => current;

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Scroll suave (Lenis) sincronizado com o GSAP ScrollTrigger.
 * Com "reduzir movimento" ativo, fica o scroll nativo.
 */
export function initSmoothScroll(): Lenis | null {
  const headerOffset = () => -(document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 64);
  let lenis: Lenis | null = null;

  if (!prefersReducedMotion()) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis!.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Âncoras internas (#secao) usam o mesmo scroll suave e descontam o header fixo.
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href')!;
    const target = id === '#top' ? document.body : document.querySelector<HTMLElement>(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : headerOffset(), duration: 1.4 });
    else target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });

  current = lenis;
  return lenis;
}
