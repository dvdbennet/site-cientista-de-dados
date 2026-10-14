import gsap from 'gsap';

/**
 * Carrossel infinito de cases.
 * Usa o scroll nativo (swipe no celular, trackpad, teclado) com 3 cópias da lista:
 * [clones | originais | clones]. Quando o scroll para dentro de uma das cópias,
 * pulamos instantaneamente para o card idêntico na lista do meio — o loop fica invisível.
 * Setas no desktop e arrastar com o mouse também funcionam.
 */
export function initCases({ parallax = true } = {}) {
  const track = document.getElementById('casesTrack');
  if (!track) return;
  const originals = [...track.querySelectorAll<HTMLElement>('.case')];
  const n = originals.length;
  if (!n) return;

  const makeClones = () =>
    originals.map((card) => {
      const clone = card.cloneNode(true) as HTMLElement;
      clone.classList.add('clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
      return clone;
    });
  track.prepend(...makeClones());
  track.append(...makeClones());
  const all = [...track.querySelectorAll<HTMLElement>('.case')];

  // distância entre o início de dois cards consecutivos (largura + gap)
  const step = () => all[1].offsetLeft - all[0].offsetLeft;
  const leftOf = (i: number) => all[i].offsetLeft - all[0].offsetLeft;
  const indexNow = () => Math.round(track.scrollLeft / step());

  const jump = (left: number) => {
    track.style.scrollSnapType = 'none';
    track.scrollLeft = left;
    requestAnimationFrame(() => { track.style.scrollSnapType = ''; });
  };

  const markActive = () => {
    const i = indexNow();
    all.forEach((c, k) => c.classList.toggle('active', k === i));
  };

  // Se parou numa cópia, volta para o card equivalente da lista do meio
  const recenter = () => {
    const i = indexNow();
    if (i < n) jump(track.scrollLeft + step() * n);
    else if (i >= 2 * n) jump(track.scrollLeft - step() * n);
    markActive();
  };

  let settleTimer = 0;
  track.addEventListener('scroll', () => {
    markActive();
    clearTimeout(settleTimer);
    settleTimer = window.setTimeout(recenter, 140); // fallback p/ navegadores sem "scrollend"
  }, { passive: true });
  track.addEventListener('scrollend', () => { clearTimeout(settleTimer); recenter(); });

  const start = () => jump(leftOf(n)); // começa no 1º card original
  start();
  markActive();
  new ResizeObserver(() => jump(leftOf(n + (((indexNow() - n) % n) + n) % n))).observe(track);

  // Setas
  document.querySelectorAll<HTMLButtonElement>('.track-ctrl [data-dir]').forEach((btn) => {
    btn.addEventListener('click', () => {
      let i = indexNow();
      // garante espaço para animar mesmo se ainda estiver numa cópia da borda
      if (i <= 0 || i >= all.length - 1) { recenter(); i = indexNow(); }
      track.scrollTo({ left: leftOf(i + Number(btn.dataset.dir)), behavior: 'smooth' });
    });
  });

  // Arrastar com o mouse (no toque o scroll nativo já resolve)
  let dragging = false, moved = false, startX = 0, startLeft = 0;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    track.style.scrollSnapType = 'none';
    track.classList.add('dragging');
  });
  addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = startLeft - dx;
  });
  addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('dragging');
    track.style.scrollSnapType = '';
    track.scrollTo({ left: leftOf(indexNow()), behavior: 'smooth' });
  });
  // não abre o case se o gesto foi um arraste
  track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
  track.addEventListener('dragstart', (e) => e.preventDefault());

  // Parallax vertical da imagem dentro do card
  if (parallax) {
    all.forEach((card) => {
      const img = card.querySelector('.case-img');
      if (!img) return;
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }
}

/** Linha do processo que se desenha conforme o scroll. */
export function initProcessLine() {
  const line = document.querySelector('.proc-line');
  if (!line) return;
  const mm = gsap.matchMedia();
  const st = { trigger: '#proc', start: 'top 75%', end: 'bottom 60%', scrub: 0.6 };
  mm.add('(min-width: 960px)', () => { gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: st }); });
  mm.add('(max-width: 959px)', () => { gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: st }); });
}
