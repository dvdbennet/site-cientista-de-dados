import gsap from 'gsap';
import { fmtMoney, lang, t } from '../lib/i18n';
import { track } from '../lib/track';

/** Calculadora "quanto custa decidir no escuro": faturamento × perda × recuperação. */
export function initCalculator({ animate = true } = {}) {
  const form = document.getElementById('calc') as HTMLFormElement | null;
  if (!form) return;
  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const revenue = $<HTMLInputElement>('cRevenue'), loss = $<HTMLInputElement>('cLoss'), recover = $<HTMLInputElement>('cRecover');
  const oLoss = $('oLoss'), oRecover = $('oRecover');
  const month = $('cMonth'), year = $('cYear'), week = $('cWeek');
  const barLoss = $('cBarLoss'), barRec = $('cBarRec');
  const cta = $<HTMLAnchorElement>('calcCta');
  const sep = lang === 'en' ? ',' : '.';

  const parse = () => Number(revenue.value.replace(/\D/g, '')) || 0;
  const formatInput = () => {
    const n = parse();
    revenue.value = n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep) : '';
  };

  const shown = { m: 0, y: 0, w: 0 };
  let interacted = false;
  const update = (fromUser = false) => {
    const r = parse(), l = Number(loss.value) / 100, rec = Number(recover.value) / 100;
    oLoss.textContent = `${loss.value}%`;
    oRecover.textContent = `${recover.value}%`;
    const target = { m: r * l, y: r * l * rec * 12, w: (r * l) / 4.33 };
    barLoss.style.transform = `scaleX(${Math.min(1, l / 0.15)})`;
    barRec.style.transform = `scaleX(${Math.min(1, (l * rec) / 0.15)})`;
    const paint = () => { month.textContent = fmtMoney(shown.m); year.textContent = fmtMoney(shown.y); week.textContent = fmtMoney(shown.w); };
    if (animate) gsap.to(shown, { ...target, duration: 0.6, ease: 'power3.out', overwrite: true, onUpdate: paint });
    else { Object.assign(shown, target); paint(); }
    if (fromUser && !interacted) { interacted = true; track('calc_interact'); }
  };

  revenue.addEventListener('input', () => {
    const caret = revenue.value.length - (revenue.selectionStart ?? 0);
    formatInput();
    const pos = Math.max(0, revenue.value.length - caret);
    revenue.setSelectionRange(pos, pos);
    update(true);
  });
  [loss, recover].forEach((i) => i.addEventListener('input', () => update(true)));
  form.addEventListener('submit', (e) => e.preventDefault());

  // leva as premissas para o formulário de contato
  cta.addEventListener('click', () => {
    const textarea = document.querySelector<HTMLTextAreaElement>('#leadForm textarea[name="decisao"]');
    if (!textarea || textarea.value) return;
    textarea.value = t(
      `Calculadora → faturamento ${fmtMoney(parse())}/mês, perda estimada ${loss.value}%, recuperação ${recover.value}% (≈ ${fmtMoney(shown.y)}/ano).\n\n`,
      `Calculator → revenue ${fmtMoney(parse())}/month, estimated loss ${loss.value}%, recovery ${recover.value}% (≈ ${fmtMoney(shown.y)}/year).\n\n`,
    );
  });

  // anima os números quando a calculadora aparece
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); update(); } }, { threshold: 0.3 });
  io.observe(form);
}
