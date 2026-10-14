import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const EASE = 'expo.out';

/**
 * Quebra um título em linhas reais (como renderizadas na tela) e embrulha cada
 * linha numa máscara: <span class="line"><span>…</span></span>.
 * Preserva <em> e outros elementos inline. Depois da animação o HTML original volta,
 * então o texto continua refluindo normalmente no resize.
 */
function splitLines(el: HTMLElement) {
  const original = el.innerHTML;
  el.dataset.original = original;

  // 1) cada palavra vira um span medível, mantendo o elemento pai (ex.: <em>)
  const words: HTMLElement[] = [];
  const wrapText = (node: Node, wrapper?: Element) => {
    const parts = (node.textContent ?? '').split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { frag.append(' '); continue; }
      const w = document.createElement('span');
      w.className = 'w';
      w.style.display = 'inline-block';
      if (wrapper) {
        const clone = wrapper.cloneNode(false) as Element;
        clone.textContent = part;
        w.append(clone);
      } else {
        w.textContent = part;
      }
      words.push(w);
      frag.append(w);
    }
    return frag;
  };
  for (const child of [...el.childNodes]) {
    if (child.nodeType === Node.TEXT_NODE) child.replaceWith(wrapText(child));
    else if (child instanceof Element) child.replaceWith(wrapText(child, child));
  }

  // 2) agrupa por offsetTop
  const lines: HTMLElement[][] = [];
  let lastTop = -Infinity;
  for (const w of words) {
    if (Math.abs(w.offsetTop - lastTop) > 2) { lines.push([]); lastTop = w.offsetTop; }
    lines[lines.length - 1].push(w);
  }

  // 3) reconstrói como linhas mascaradas
  el.innerHTML = '';
  for (const line of lines) {
    const outer = document.createElement('span');
    outer.className = 'line';
    const inner = document.createElement('span');
    line.forEach((w, i) => {
      if (i) inner.append(' ');
      inner.append(...w.childNodes);
    });
    outer.append(inner);
    el.append(outer);
  }
}

function restore(el: HTMLElement) {
  if (el.dataset.original != null) {
    el.innerHTML = el.dataset.original;
    delete el.dataset.original;
  }
}

export function initReveals() {
  // Títulos de seção revelados por linha
  document.querySelectorAll<HTMLElement>('.split-lines').forEach((h) => {
    splitLines(h);
    const spans = h.querySelectorAll('.line > span');
    gsap.set(spans, { y: 0, yPercent: 105 });
    ScrollTrigger.create({
      trigger: h,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        gsap.to(spans, { yPercent: 0, duration: 1.1, ease: EASE, stagger: 0.08, onComplete: () => restore(h) }),
    });
  });

  // Blocos genéricos
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.09, overwrite: true }),
  });

  // Linhas de gráfico que se desenham
  document.querySelectorAll<SVGGeometryElement>('.draw').forEach((path) => {
    const len = Math.ceil(path.getTotalLength());
    const dashed = path.getAttribute('stroke-dasharray');
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.8,
      delay: path.classList.contains('draw-late') ? 1.2 : 0.2,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: path.closest('svg'), start: 'top 85%', once: true },
      // devolve o tracejado original (ex.: linha de previsão) ao terminar
      onComplete: () => { if (dashed) gsap.set(path, { strokeDasharray: dashed, strokeDashoffset: 0 }); },
    });
  });

  // Barras que crescem
  document.querySelectorAll<SVGSVGElement>('svg:has(.bar)').forEach((svg) => {
    const bars = svg.querySelectorAll('.bar');
    gsap.set(bars, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.to(bars, {
      scaleY: 1, duration: 1.2, ease: EASE, stagger: 0.1,
      scrollTrigger: { trigger: svg, start: 'top 85%', once: true },
    });
  });

  // Contadores (só animam quando data-count tem um número real)
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    if (!el.dataset.count || !Number.isFinite(target)) return;
    const obj = { v: 0 };
    el.textContent = '0';
    gsap.to(obj, {
      v: target, duration: 2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString('pt-BR'); },
    });
  });
}

/** Animação de entrada do hero (no carregamento). */
export function introHero() {
  const tl = gsap.timeline({ delay: 0.15 });
  tl.to('.split .line > span', { yPercent: 0, y: 0, duration: 1.3, ease: EASE, stagger: 0.1 })
    .to('[data-intro]', { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.1 }, '-=0.9');
  return tl;
}

/** Botões "magnéticos" (só em dispositivos com mouse). */
export function initMagnetic() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('.magnetic').forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.25);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}
