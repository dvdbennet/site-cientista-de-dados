import { site, whatsappUrl } from '../config';

/** Preenche todos os [data-link] a partir de src/config.ts. */
export function applyLinks() {
  const map: Record<string, string> = {
    email: `mailto:${site.email}`,
    whatsapp: whatsappUrl(),
    linkedin: site.linkedin,
    github: site.github,
    kaggle: site.kaggle,
    onepager: site.onePager,
  };
  document.querySelectorAll<HTMLAnchorElement>('[data-link]').forEach((a) => {
    const href = map[a.dataset.link!];
    if (href) a.href = href;
  });
  document.querySelectorAll<HTMLElement>('[data-availability]').forEach((el) => { el.textContent = site.availability; });
  document.querySelectorAll<HTMLElement>('[data-email-text]').forEach((el) => { el.textContent = site.email; });
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
}

/** Botão "copiar e-mail" do rodapé. */
export function initCopyEmail(onCopy?: () => void) {
  document.querySelectorAll<HTMLButtonElement>('[data-copy-email]').forEach((btn) => {
    const hint = btn.querySelector<HTMLElement>('.copy-hint');
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(site.email);
        btn.classList.add('copied');
        if (hint) hint.textContent = 'Copiado ✓';
        onCopy?.();
        setTimeout(() => { btn.classList.remove('copied'); if (hint) hint.textContent = 'Copiar'; }, 2200);
      } catch {
        location.href = `mailto:${site.email}`;
      }
    });
  });
}
