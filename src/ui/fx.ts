import gsap from 'gsap';
import { t } from '../lib/i18n';

const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Cursor personalizado (só desktop com mouse): ponto + anel que segue com atraso.
 * Cresce sobre links/botões e mostra "Arraste" sobre áreas arrastáveis.
 */
export function initCursor() {
  if (!finePointer()) return;
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  ring.innerHTML = '<span></span>';
  document.body.append(dot, ring);
  document.documentElement.classList.add('has-cursor');
  const label = ring.querySelector('span')!;

  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    document.documentElement.classList.add('cursor-on');
    const target = e.target as Element;
    const drag = target.closest('[data-cursor="drag"], .cases-track, .constellation');
    const text = target.closest('input, textarea, select');
    const link = target.closest('a, button, label, summary, [role="button"]');
    ring.classList.toggle('is-drag', !!drag && !link);
    ring.classList.toggle('is-link', !!link);
    document.documentElement.classList.toggle('cursor-text', !!text);
    label.textContent = drag && !link ? t('Arraste', 'Drag') : '';
  }, { passive: true });
  document.addEventListener('mouseleave', () => document.documentElement.classList.remove('cursor-on'));
  addEventListener('pointerdown', () => ring.classList.add('is-down'));
  addEventListener('pointerup', () => ring.classList.remove('is-down'));
}

/** Inclinação 3D + brilho que segue o mouse nos cards. */
export function initTilt(selector = '.svc, .fmt, .pr, .tst, .case > a') {
  if (!finePointer()) return;
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    el.classList.add('tilt');
    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 7);
      rx(-(py - 0.5) * 7);
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}
