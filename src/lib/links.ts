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
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
}
