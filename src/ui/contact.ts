import { formEndpoint, site } from '../config';
import { track } from '../lib/track';

/** Agenda do Cal.com (carregada só quando chega perto da tela). */
export function initCalendar() {
  const box = document.getElementById('cal');
  if (!box || !site.calLink) return;
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    const iframe = document.createElement('iframe');
    iframe.src = `https://cal.com/${site.calLink}?embed=true&theme=dark&layout=month_view`;
    iframe.title = 'Agendar diagnóstico com Felipe Fuck';
    iframe.loading = 'lazy';
    box.replaceChildren(iframe);
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
      status.textContent = 'Preencha nome, e-mail válido e a decisão que quer melhorar.';
      status.classList.add('err');
      return;
    }
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    status.classList.remove('err');

    // honeypot anti-spam: robôs preenchem o campo invisível
    if (data._honey) return;
    delete data._honey;

    const mailtoFallback = () => {
      const body = `Nome: ${data.nome}\nE-mail: ${data.email}\nEmpresa: ${data.empresa || '-'}\n\n${data.decisao}`;
      location.href = `mailto:${site.email}?subject=${encodeURIComponent('Projeto de dados — ' + data.nome)}&body=${encodeURIComponent(body)}`;
      track('form_submit', { method: 'mailto' });
    };

    button.disabled = true;
    status.textContent = 'Enviando…';
    try {
      const res = await fetch(formEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...data,
          _subject: `Novo contato pelo site — ${data.nome}`,
          _replyto: data.email,
          _template: 'table',
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { success?: boolean | string };
      if (!res.ok || json.success === false || json.success === 'false') throw new Error(String(res.status));
      track('form_submit', { method: 'endpoint' });
      location.href = '/obrigado.html';
    } catch {
      // serviço fora do ar ou ainda não ativado: abre o e-mail do visitante já preenchido
      status.textContent = 'Abrindo seu e-mail para concluir o envio…';
      button.disabled = false;
      mailtoFallback();
    }
  });
}
