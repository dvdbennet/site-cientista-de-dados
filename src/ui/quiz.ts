import gsap from 'gsap';
import { track } from '../lib/track';
import { t } from '../lib/i18n';
import { site } from '../config';
import { calEmbed } from './contact';

type Answers = { goal?: string; data?: string; help?: string };

const GOALS: Record<string, string> = {
  prever: t('um modelo de previsão de demanda/vendas', 'a demand/sales forecasting model'),
  clientes: t('um modelo de clientes (churn e segmentação)', 'a customer model (churn and segmentation)'),
  organizar: t('uma base de dados única com painéis confiáveis', 'a single source of truth with reliable dashboards'),
  explorar: t('um mapa das oportunidades nos seus dados', 'a map of the opportunities in your data'),
};
const DATA_NOTE: Record<string, string> = {
  planilhas: t('Como os dados estão em planilhas, o primeiro passo é consolidá-los numa base confiável.', 'Since your data lives in spreadsheets, the first step is consolidating it into a reliable base.'),
  sistema: t('Como os dados já estão num sistema, dá para ir direto à modelagem.', 'Since your data is already in a system, we can go straight to modeling.'),
  bi: t('Como você já tem BI, o ganho está em ir além do retrovisor: prever e recomendar.', 'Since you already have BI, the gain is moving past the rear-view mirror: predicting and recommending.'),
  'nao-sei': t('No diagnóstico eu levanto onde estão os dados e o que dá para aproveitar.', 'In the discovery call I map where your data is and what can be used.'),
};
const LABELS: Record<string, string> = {
  prever: t('Prever demanda/vendas', 'Forecast demand/sales'), clientes: t('Entender clientes', 'Understand customers'),
  organizar: t('Organizar dados e relatórios', 'Organize data and reports'), explorar: t('Ainda não sei', 'Not sure yet'),
  planilhas: t('Planilhas', 'Spreadsheets'), sistema: t('Sistema/ERP', 'System/ERP'), bi: t('Já tem BI', 'Has BI'), 'nao-sei': t('Não sabe', "Doesn't know"),
  pontual: t('Entrega com prazo', 'Fixed-deadline delivery'), continuo: t('Evolução contínua', 'Continuous improvement'), entender: t('Entender se vale', 'See if it is worth it'),
};
const FORMAT = {
  project: t('Projeto', 'Project'),
  partnership: t('Parceria mensal', 'Monthly partnership'),
  discovery: t('Diagnóstico', 'Discovery call'),
};

/** Diagnóstico rápido: 3 perguntas → formato recomendado → contato já preenchido. */
export function initQuiz() {
  const form = document.getElementById('quiz') as HTMLFormElement | null;
  if (!form) return;
  const steps = [...form.querySelectorAll<HTMLFieldSetElement>('.quiz-step')];
  const dots = [...form.querySelectorAll('.quiz-dots i')];
  const count = document.getElementById('quizCount')!;
  const back = document.getElementById('quizBack') as HTMLButtonElement;
  const result = document.getElementById('quizResult')!;
  const title = document.getElementById('quizTitle')!;
  const text = document.getElementById('quizText')!;
  const cta = document.getElementById('quizCta') as HTMLAnchorElement;
  const restart = document.getElementById('quizRestart')!;
  const book = document.getElementById('quizBook') as HTMLButtonElement;
  const calBox = document.getElementById('quizCal')!;
  const answers: Answers = {};
  let current = 0;
  let started = false;

  const show = (i: number) => {
    current = i;
    const done = i >= steps.length;
    steps.forEach((s, k) => { s.hidden = k !== i; s.classList.toggle('is-current', k === i); });
    result.hidden = !done;
    back.hidden = i === 0 || done;
    dots.forEach((d, k) => d.classList.toggle('on', k <= Math.min(i, steps.length - 1)));
    count.textContent = done ? t('Resultado', 'Result') : `${i + 1} / ${steps.length}`;
    const el = done ? result : steps[i];
    gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' });
    if (done) {
      renderResult();
      result.focus({ preventScroll: true });
    } else {
      calBox.hidden = true;
      calBox.replaceChildren();
      steps[i].querySelector<HTMLInputElement>('input:checked, input')?.focus({ preventScroll: true });
    }
  };

  function renderResult() {
    const fmt = answers.help === 'continuo' ? FORMAT.partnership : answers.help === 'entender' ? FORMAT.discovery : FORMAT.project;
    const goal = GOALS[answers.goal ?? 'explorar'];
    const intro =
      fmt === FORMAT.project ? t(`Um projeto fechado para entregar ${goal}, com escopo, prazo e investimento definidos.`, `A fixed-scope project to deliver ${goal}, with clear scope, timeline and investment.`)
      : fmt === FORMAT.partnership ? t(`Uma parceria mensal para construir e evoluir ${goal} continuamente.`, `A monthly partnership to build and keep improving ${goal}.`)
      : t(`Comece pelo diagnóstico gratuito: em 30 minutos avaliamos se ${goal} faz sentido para você.`, `Start with the free discovery call: in 30 minutes we assess whether ${goal} makes sense for you.`);
    title.textContent = fmt;
    text.textContent = `${intro} ${DATA_NOTE[answers.data ?? 'nao-sei']}`;
    track('quiz_complete', { format: fmt, ...answers });

    // destaca o cartão do formato recomendado na seção "Formatos"
    document.querySelectorAll<HTMLElement>('.fmt').forEach((card) => {
      card.classList.toggle('recommended', card.querySelector('h3')?.textContent === fmt);
    });
  }

  form.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    if (input.type !== 'radio') return;
    if (!started) { started = true; track('quiz_start'); }
    answers[input.name as keyof Answers] = input.value;
    // pequena pausa para o clique "assentar" antes de avançar
    setTimeout(() => show(current + 1), 260);
  });
  back.addEventListener('click', () => show(Math.max(0, current - 1)));
  restart.addEventListener('click', () => { form.reset(); Object.keys(answers).forEach((k) => delete answers[k as keyof Answers]); show(0); });

  const summary = () =>
    `${t('Diagnóstico rápido', 'Quick assessment')} → ${title.textContent}\n• ${t('Objetivo', 'Goal')}: ${LABELS[answers.goal ?? ''] ?? '-'}\n• ${t('Dados', 'Data')}: ${LABELS[answers.data ?? ''] ?? '-'}\n• ${t('Apoio', 'Support')}: ${LABELS[answers.help ?? ''] ?? '-'}`;

  // Com Cal.com configurado: a agenda abre aqui mesmo, já com as respostas nas observações
  if (site.calLink) {
    book.hidden = false;
    cta.classList.replace('btn-primary', 'btn-ghost');
    cta.textContent = cta.dataset.altLabel ?? t('Prefiro escrever', 'I’d rather write');
    book.addEventListener('click', () => {
      const iframe = calEmbed(summary());
      if (!iframe) return;
      calBox.replaceChildren(iframe);
      calBox.hidden = false;
      track('calendar_open', { from: 'quiz' });
      gsap.fromTo(calBox, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
    });
  }

  // Leva as respostas para o formulário de contato
  cta.addEventListener('click', () => {
    const textarea = document.querySelector<HTMLTextAreaElement>('#leadForm textarea[name="decisao"]');
    if (textarea && !textarea.value) {
      textarea.value = `${summary()}\n\n`;
    }
  });
  form.addEventListener('submit', (e) => e.preventDefault());
}
