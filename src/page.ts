/**
 * Base comum a todas as páginas: fontes, estilos, links, tracking,
 * scroll suave e revelações de conteúdo.
 */
import '@fontsource-variable/inter';
import '@fontsource-variable/inter-tight';
import '@fontsource-variable/jetbrains-mono';
import './styles/main.css';

import { env } from './config';
import { applyLinks, initCopyEmail } from './lib/links';
import { initTracking, track } from './lib/track';
import { initMagnetic, initReveals } from './motion/reveals';
import { initSmoothScroll, prefersReducedMotion } from './motion/smooth';
import { initChrome } from './ui/chrome';
import { initMobileMenu, initScrollSpy } from './ui/nav';
import { initCursor, initTilt } from './ui/fx';

export const reducedMotion = prefersReducedMotion();

/** Parte síncrona: roda imediatamente (não atrasa o primeiro paint do hero). */
export function initPage() {
  if (!reducedMotion) document.documentElement.classList.add('js-motion');
  applyLinks();
  initTracking(env.gtmId);
  initChrome();
  const lenis = initSmoothScroll();
  initMobileMenu();
  initScrollSpy();
  initCopyEmail(() => track('email_copy'));
  if (!reducedMotion) initCursor();
  return lenis;
}

/** Revelações dependem da fonte final (quebra de linhas) — espera carregar, no máx. 1,5 s. */
export async function initRevealsWhenReady() {
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
  if (!reducedMotion) {
    initReveals();
    initMagnetic();
    initTilt();
  }
}
