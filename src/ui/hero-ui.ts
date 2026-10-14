/** Contador de "capítulo" do hero (01/03 + palavra + barra de progresso). */
export function createBeats() {
  const idx = document.getElementById('beatIdx');
  const bar = document.getElementById('beatBar');
  const spans = [...(document.getElementById('beatWord')?.children ?? [])];
  let current = -1;

  return (progress: number) => {
    if (bar) bar.style.transform = `scaleX(${progress})`;
    const i = progress < 0.33 ? 0 : progress < 0.7 ? 1 : 2;
    if (i === current) return;
    current = i;
    // palavras fixas no HTML + classes por índice: imune a scroll rápido
    spans.forEach((el, k) => {
      el.classList.toggle('on', k === i);
      el.classList.toggle('past', k < i);
    });
    if (idx) idx.textContent = `0${i + 1} / 03`;
  };
}
