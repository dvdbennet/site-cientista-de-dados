import gsap from 'gsap';

/** Carrossel de cases: card ativo em destaque, setas no desktop, parallax interno. */
export function initCases() {
  const track = document.getElementById('casesTrack');
  if (!track) return;
  const cards = [...track.querySelectorAll<HTMLElement>('.case')];

  const markActive = () => {
    const left = track.getBoundingClientRect().left;
    let best = 0, bestD = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.getBoundingClientRect().left - left);
      if (d < bestD) { bestD = d; best = i; }
    });
    cards.forEach((c, i) => c.classList.toggle('active', i === best));
    return best;
  };
  track.addEventListener('scroll', markActive, { passive: true });
  markActive();

  document.querySelectorAll<HTMLButtonElement>('.track-ctrl [data-dir]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = Math.max(0, Math.min(cards.length - 1, markActive() + Number(btn.dataset.dir)));
      track.scrollTo({ left: cards[i].offsetLeft - track.offsetLeft, behavior: 'smooth' });
    });
  });

  // Parallax vertical da imagem dentro do card
  cards.forEach((card) => {
    const img = card.querySelector('.case-img');
    if (!img) return;
    gsap.fromTo(img, { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
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
