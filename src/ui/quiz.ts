import gsap from 'gsap';
import { track } from '../lib/track';

type Answers = { goal?: string; data?: string; help?: string };

const GOALS: Record<string, string> = {
  prever: 'um modelo de previsão de demanda/vendas',
  clientes: 'um modelo de clientes (churn e segmentação)',
  organizar: 'uma base de dados única com painéis confiáveis',
  explorar: 'um mapa das oportunidades nos seus dados',
};
const DATA_NOTE: Record<string, string> = {
  planilhas: 'Como os dados estão em planilhas, o primeiro passo é consolidá-los numa base confiável.',
  sistema: 'Como os dados já estão num sistema, dá para ir direto à modelagem.',
  bi: 'Como você já tem BI, o ganho está em ir além do retrovisor: prever e recomendar.',
  'nao-sei': 'No diagnóstico eu levanto onde estão os dados e o que dá para aproveitar.',
};
const LABELS: Record<string, string> = {
  prever: 'Prever demanda/vendas', clientes: 'Entender clientes', organizar: 'Organizar dados e relatórios', explorar: 'Ainda não sei',
  planilhas: 'Planilhas', sistema: 'Sistema/ERP', bi: 'Já tem BI', 'nao-sei': 'Não sabe',
  pontual: 'Entrega com prazo', continuo: 'Evolução contínua', entender: 'Entender se vale',
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
    count.textContent = done ? 'Resultado' : `${i + 1} / ${steps.length}`;
    const el = done ? result : steps[i];
    gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' });
    if (done) { renderResult(); result.focus({ preventScroll: true }); }
    else steps[i].querySelector<HTMLInputElement>('input:checked, input')?.focus({ preventScroll: true });
  };

  function renderResult() {
    const fmt = answers.help === 'continuo' ? 'Parceria mensal' : answers.help === 'entender' ? 'Diagnóstico' : 'Projeto';
    const goal = GOALS[answers.goal ?? 'explorar'];
    const intro =
      fmt === 'Projeto' ? `Um projeto fechado para entregar ${goal}, com escopo, prazo e investimento definidos.`
      : fmt === 'Parceria mensal' ? `Uma parceria mensal para construir e evoluir ${goal} continuamente.`
      : `Comece pelo diagnóstico gratuito: em 30 minutos avaliamos se ${goal} faz sentido para você.`;
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

  // Leva as respostas para o formulário de contato
  cta.addEventListener('click', () => {
    const textarea = document.querySelector<HTMLTextAreaElement>('#leadForm textarea[name="decisao"]');
    if (textarea && !textarea.value) {
      textarea.value = `Diagnóstico rápido → ${title.textContent}\n• Objetivo: ${LABELS[answers.goal ?? ''] ?? '-'}\n• Dados: ${LABELS[answers.data ?? ''] ?? '-'}\n• Apoio: ${LABELS[answers.help ?? ''] ?? '-'}\n\n`;
    }
  });
  form.addEventListener('submit', (e) => e.preventDefault());
}
