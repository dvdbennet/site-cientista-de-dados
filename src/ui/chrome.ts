/** Header que ganha fundo ao rolar + CTA fixo no mobile depois do hero. */
export function initChrome() {
  const header = document.getElementById('hdr');
  const sticky = document.getElementById('stickyCta');
  const hero = document.getElementById('hero');
  const contact = document.getElementById('contato');

  let contactVisible = false;
  if (contact && sticky) {
    new IntersectionObserver(([e]) => { contactVisible = e.isIntersecting; update(); }, { threshold: 0.15 }).observe(contact);
  }

  function update() {
    const y = scrollY;
    header?.classList.toggle('scrolled', y > 40);
    if (sticky) {
      const afterHero = hero ? y > hero.offsetHeight - innerHeight * 0.5 : y > innerHeight;
      // some quando o formulário/agenda já está na tela (evita CTA duplicado)
      sticky.classList.toggle('on', afterHero && !contactVisible);
    }
  }
  addEventListener('scroll', update, { passive: true });
  update();
}
