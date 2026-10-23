import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis } from '../motion/smooth';

/** Menu mobile em tela cheia: abre/fecha, Esc, trava o scroll e devolve o foco. */
export function initMobileMenu() {
  const btn = document.getElementById('menuBtn') as HTMLButtonElement | null;
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  const links = [...menu.querySelectorAll<HTMLAnchorElement>('a')];
  let open = false;

  const set = (next: boolean) => {
    if (next === open) return;
    open = next;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.documentElement.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      getLenis()?.stop();
      gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.6, ease: 'expo.out' });
      gsap.fromTo(menu.querySelectorAll('li, .mobile-menu-foot'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.04, delay: 0.1 });
      links[0]?.focus({ preventScroll: true });
    } else {
      getLenis()?.start();
      gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.45, ease: 'expo.in', onComplete: () => { menu.hidden = true; } });
      btn.focus({ preventScroll: true });
    }
  };

  btn.addEventListener('click', () => set(!open));
  links.forEach((a) => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') set(false);
    // mantém o Tab dentro do menu
    if (e.key === 'Tab') {
      const items = [btn, ...links];
      const i = items.indexOf(document.activeElement as HTMLAnchorElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });
  matchMedia('(min-width: 960px)').addEventListener('change', (e) => { if (e.matches) set(false); });
}

/** Barra de progresso de leitura + link do menu da seção atual em destaque. */
export function initScrollSpy() {
  const bar = document.getElementById('readBar');
  if (bar) {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => { bar.style.transform = `scaleX(${self.progress})`; },
    });
  }

  const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('.nav a[href^="#"], .mobile-menu a[href^="#"]')];
  const ids = [...new Set(navLinks.map((a) => a.getAttribute('href')!.slice(1)))];
  ids.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        navLinks.forEach((a) => {
          if (a.getAttribute('href') === `#${id}`) {
            a.classList.toggle('is-active', self.isActive);
            if (self.isActive) a.setAttribute('aria-current', 'location');
            else a.removeAttribute('aria-current');
          }
        });
      },
    });
  });
}
