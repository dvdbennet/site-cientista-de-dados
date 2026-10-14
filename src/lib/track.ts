/**
 * Tracking leve: tudo vai para window.dataLayer (padrão GTM/GA4).
 * Sem VITE_GTM_ID, os eventos só ficam no dataLayer (útil para debug no console).
 */
declare global {
  interface Window { dataLayer: Record<string, unknown>[] }
}

window.dataLayer = window.dataLayer || [];

export function track(event: string, params: Record<string, unknown> = {}) {
  window.dataLayer.push({ event, ...params });
  if (import.meta.env.DEV) console.debug('[track]', event, params);
}

export function initTracking(gtmId?: string) {
  if (gtmId) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
    document.head.appendChild(s);
  }

  // Qualquer elemento com data-track="evento" dispara o evento no clique.
  document.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>('[data-track]');
    if (!el) return;
    const { track: name, ...rest } = el.dataset;
    track(name!, rest);
  });

  // Profundidade de scroll: 25/50/75/100%.
  const marks = new Set<number>();
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? (scrollY / max) * 100 : 0;
    for (const m of [25, 50, 75, 100]) {
      if (pct >= m - 0.5 && !marks.has(m)) { marks.add(m); track('scroll_depth', { percent: m }); }
    }
  }, { passive: true });
}
