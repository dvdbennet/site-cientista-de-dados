import { formEndpoint, site } from '../config';
import { track } from '../lib/track';
import { lang, t } from '../lib/i18n';

/** Agenda do Cal.com (carregada só quando chega perto da tela). */
/** URL do Cal.com embutido, com observações pré-preenchidas (ex.: respostas do diagnóstico). */
export function calEmbed(notes = '') {
  if (!site.calLink) return null;
  const iframe = document.createElement('iframe');
  const q = new URLSearchParams({ embed: 'true', theme: 'dark', layout: 'month_view' });
  if (notes) q.set('notes', notes);
  iframe.src = `https://cal.com/${site.calLink}?${q}`;
  iframe.title = t('Agendar diagnóstico com Felipe Fuck', 'Book a discovery call with Felipe Fuck');
  iframe.loading = 'lazy';
  return iframe;
}

export function initCalendar() {
  const box = document.getElementById('cal');
  if (!box || !site.calLink) return;
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    box.replaceChildren(calEmbed()!);
    track('calendar_open');
  }, { rootMargin: '400px' });
  io.observe(box);

  // Cal.com avisa via postMessage quando um horário é reservado
  addEventListener('message', (e) => {
    if (typeof e.origin === 'string' && e.origin.includes('cal.com') && JSON.stringify(e.data).includes('bookingSuccessful')) {
      track('calendar_booked');
    }
  });
}

/** Formulário: envia para o Formspree (VITE_FORM_ENDPOINT) ou abre o e-mail como alternativa. */
export function initLeadForm() {
  const form = document.getElementById('leadForm') as HTMLFormElement | null;
  if (!form) return;
  const status = form.querySelector<HTMLElement>('.form-status')!;
  const button = form.querySelector<HTMLButtonElement>('button[type=submit]')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach((f) => {
      const valid = f.checkValidity();
      f.setAttribute('aria-invalid', String(!valid));
      if (!valid) ok = false;
    });
    if (!ok) {
      status.textContent = t('Preencha nome, e-mail válido e a decisão que quer melhorar.', 'Please fill in your name, a valid email and the decision you want to improve.');
      status.classList.add('err');
      return;
    }
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    status.classList.remove('err');

    // honeypot anti-spam: robôs preenchem o campo invisível
    if (data._honey) return;
    delete data._honey;

    const mailtoFallback = () => {
      const body = `${t('Nome', 'Name')}: ${data.nome}\nE-mail: ${data.email}\n${t('Empresa', 'Company')}: ${data.empresa || '-'}\n\n${data.decisao}`;
      location.href = `mailto:${site.email}?subject=${encodeURIComponent(t('Projeto de dados — ', 'Data project — ') + data.nome)}&body=${encodeURIComponent(body)}`;
      track('form_submit', { method: 'mailto' });
    };

    button.disabled = true;
    status.textContent = t('Enviando…', 'Sending…');
    try {
      const res = await fetch(formEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...data,
          _subject: `${t('Novo contato pelo site', 'New website contact')} — ${data.nome}`,
          _replyto: data.email,
          _template: 'table',
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { success?: boolean | string };
      if (!res.ok || json.success === false || json.success === 'false') throw new Error(String(res.status));
      track('form_submit', { method: 'endpoint' });
      location.href = lang === 'en' ? '/en/thanks.html' : '/obrigado.html';
    } catch {
      // serviço fora do ar ou ainda não ativado: abre o e-mail do visitante já preenchido
      status.textContent = t('Abrindo seu e-mail para concluir o envio…', 'Opening your email app to finish sending…');
      button.disabled = false;
      mailtoFallback();
    }
  });
}
