import gsap from 'gsap';
import { fmtNumber, t } from '../lib/i18n';
import { track } from '../lib/track';

/**
 * Laboratório: demonstração interativa de previsão de demanda.
 * Dados SIMULADOS (semente fixa) — servem para mostrar a lógica, não são de cliente.
 *   histórico  = nível + tendência + sazonalidade + ruído
 *   previsão   = mesma estrutura projetada, × (1 + choque)
 *   faixa      = previsão ± z · σ · √(1 + h/8)
 *   estoque    = soma da previsão + z(nível de serviço) · σ · √H
 *   "média simples" = média das últimas 8 semanas repetida (o jeito "no feeling")
 */

const WEEKS = 52;
const BASE = 1000, TREND = 4, SEASON = 180, SIGMA = 60;

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Inversa aproximada da normal padrão (Acklam), para nível de serviço → z. */
function zFromP(p: number): number {
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const q = Math.min(Math.max(p, 1e-6), 1 - 1e-6);
  if (q < 0.02425) {
    const r = Math.sqrt(-2 * Math.log(q));
    return (((((c[0] * r + c[1]) * r + c[2]) * r + c[3]) * r + c[4]) * r + c[5]) / ((((d[0] * r + d[1]) * r + d[2]) * r + d[3]) * r + 1);
  }
  if (q > 1 - 0.02425) return -zFromP(1 - q);
  const r = q - 0.5, s = r * r;
  return ((((((a[0] * s + a[1]) * s + a[2]) * s + a[3]) * s + a[4]) * s + a[5]) * r) / (((((b[0] * s + b[1]) * s + b[2]) * s + b[3]) * s + b[4]) * s + 1);
}

const season = (w: number) => SEASON * Math.sin((2 * Math.PI * w) / 52 + 0.9);

// histórico fixo (mesma semente → mesmo gráfico para todo mundo)
const rand = mulberry32(42);
const gauss = () => { let u = 0, v = 0; while (!u) u = rand(); while (!v) v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const HISTORY = Array.from({ length: WEEKS }, (_, w) => BASE + TREND * w + season(w) + SIGMA * gauss());

type Params = { shock: number; horizon: number; service: number; seasonal: boolean };

function compute(p: Params, horizonMax: number) {
  const z = zFromP(p.service / 100);
  const naive = HISTORY.slice(-8).reduce((s, v) => s + v, 0) / 8;
  const fc: number[] = [], lo: number[] = [], hi: number[] = [];
  for (let h = 1; h <= horizonMax; h++) {
    const w = WEEKS - 1 + h;
    const f = (BASE + TREND * w + (p.seasonal ? season(w) : 0)) * (1 + p.shock / 100);
    const spread = 1.96 * SIGMA * Math.sqrt(1 + h / 8);
    fc.push(f); lo.push(f - spread); hi.push(f + spread);
  }
  const sum = fc.slice(0, p.horizon).reduce((s, v) => s + v, 0);
  const stock = sum + z * SIGMA * Math.sqrt(p.horizon);
  const naiveErr = fc.slice(0, p.horizon).reduce((s, v) => s + Math.abs(v - naive), 0) / sum;
  return { fc, lo, hi, naive, sum, stock, naiveErr };
}

export function initForecastDemo({ animate = true } = {}) {
  const root = document.getElementById('lab');
  const svg = document.getElementById('labSvg') as SVGSVGElement | null;
  if (!root || !svg) return;
  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const shock = $<HTMLInputElement>('shock'), horizon = $<HTMLInputElement>('horizon');
  const service = $<HTMLInputElement>('service'), seasonal = $<HTMLInputElement>('season');
  const oShock = $('oShock'), oHorizon = $('oHorizon'), oService = $('oService');
  const kDemand = $('kDemand'), kStock = $('kStock'), kNaive = $('kNaive');
  const HMAX = 16;
  const NS = 'http://www.w3.org/2000/svg';
  const el = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) => {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
    return e;
  };

  // camadas
  const gGrid = el('g'), band = el('path', { class: 'lab-band' }), hist = el('path', { class: 'lab-hist' });
  const naiveLine = el('path', { class: 'lab-naive' }), fcLine = el('path', { class: 'lab-fc' });
  const nowLine = el('line', { class: 'lab-now' }), nowText = el('text', { class: 'lab-axis' });
  const endDot = el('circle', { r: 5, class: 'lab-dot' });
  svg.append(gGrid, band, hist, naiveLine, fcLine, nowLine, nowText, endDot);

  let W = 800, H = 300;
  const pad = { l: 44, r: 16, t: 16, b: 28 };
  const yMin = 500, yMax = 1900;
  const x = (i: number) => pad.l + (i / (WEEKS + HMAX - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * (H - pad.t - pad.b);
  const path = (pts: [number, number][]) => pts.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(1)} ${b.toFixed(1)}`).join('');

  const drawGrid = () => {
    gGrid.replaceChildren();
    for (let v = 600; v <= 1800; v += 400) {
      gGrid.append(el('line', { x1: pad.l, x2: W - pad.r, y1: y(v), y2: y(v), class: 'lab-grid' }));
      const tx = el('text', { x: pad.l - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'lab-axis' });
      tx.textContent = fmtNumber(v);
      gGrid.append(tx);
    }
  };

  const params = (): Params => ({
    shock: Number(shock.value), horizon: Number(horizon.value), service: Number(service.value), seasonal: seasonal.checked,
  });

  // estado animado (interpolamos entre o cálculo anterior e o novo)
  let shown = compute(params(), HMAX);
  let shownH = params().horizon;
  // na entrada a previsão "nasce" de hoje para frente; depois fica livre
  let introH = animate ? 1 : Infinity;

  const render = (data = shown, hShown = Math.min(shownH, introH)) => {
    const n = Math.max(1, Math.round(hShown));
    const lastX = x(WEEKS - 1), lastY = y(HISTORY[WEEKS - 1]);
    hist.setAttribute('d', path(HISTORY.map((v, i) => [x(i), y(v)])));
    const fcPts: [number, number][] = [[lastX, lastY], ...data.fc.slice(0, n).map((v, k) => [x(WEEKS + k), y(v)] as [number, number])];
    fcLine.setAttribute('d', path(fcPts));
    const upper = data.hi.slice(0, n).map((v, k) => [x(WEEKS + k), y(v)] as [number, number]);
    const lower = data.lo.slice(0, n).map((v, k) => [x(WEEKS + k), y(v)] as [number, number]).reverse();
    band.setAttribute('d', `${path([[lastX, lastY], ...upper, ...lower])}Z`);
    naiveLine.setAttribute('d', path([[lastX, y(data.naive)], [x(WEEKS + n - 1), y(data.naive)]]));
    const end = fcPts[fcPts.length - 1];
    endDot.setAttribute('cx', String(end[0])); endDot.setAttribute('cy', String(end[1]));
    nowLine.setAttribute('x1', String(lastX)); nowLine.setAttribute('x2', String(lastX));
    nowLine.setAttribute('y1', String(pad.t)); nowLine.setAttribute('y2', String(H - pad.b));
    nowText.setAttribute('x', String(lastX + 6)); nowText.setAttribute('y', String(H - pad.b + 18));
    nowText.textContent = t('hoje →', 'today →');
  };

  const updateText = (p: Params, d: ReturnType<typeof compute>) => {
    oShock.textContent = `${p.shock > 0 ? '+' : ''}${p.shock}%`;
    oHorizon.textContent = `${p.horizon} ${t('semanas', 'weeks')}`;
    oService.textContent = `${p.service}%`;
    kDemand.textContent = `${fmtNumber(d.sum)} ${t('un.', 'units')}`;
    kStock.textContent = `${fmtNumber(d.stock)} ${t('un.', 'units')}`;
    kNaive.textContent = `${fmtNumber(d.naiveErr * 100, 1)}%`;
    svg.setAttribute('aria-label', t(
      `Previsão de ${fmtNumber(d.sum)} unidades em ${p.horizon} semanas; estoque recomendado de ${fmtNumber(d.stock)} unidades.`,
      `Forecast of ${fmtNumber(d.sum)} units over ${p.horizon} weeks; recommended stock of ${fmtNumber(d.stock)} units.`,
    ));
  };

  const resize = () => {
    W = Math.max(320, svg.clientWidth);
    H = W < 560 ? 240 : 320;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.height = `${H}px`;
    drawGrid();
    render();
  };
  new ResizeObserver(resize).observe(svg);

  let tween: gsap.core.Tween | null = null;
  let interacted = false;
  const update = () => {
    const p = params();
    const target = compute(p, HMAX);
    updateText(p, target);
    if (!interacted) { interacted = true; track('lab_interact'); }
    tween?.kill();
    introH = Infinity;
    if (!animate) { shown = target; shownH = p.horizon; render(); return; }
    const from = shown, fromH = shownH, st = { k: 0 };
    tween = gsap.to(st, {
      k: 1, duration: 0.6, ease: 'power3.out',
      onUpdate: () => {
        const lerp = (a: number[], b: number[]) => a.map((v, i) => v + (b[i] - v) * st.k);
        shown = { ...target, fc: lerp(from.fc, target.fc), lo: lerp(from.lo, target.lo), hi: lerp(from.hi, target.hi), naive: from.naive };
        shownH = fromH + (p.horizon - fromH) * st.k;
        render();
      },
    });
  };
  [shock, horizon, service, seasonal].forEach((i) => i.addEventListener('input', update));
  updateText(params(), shown);
  resize();

  // entrada: a previsão "nasce" a partir de hoje
  if (animate) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const st = { h: 1 };
      gsap.to(st, {
        h: params().horizon, duration: 1.4, ease: 'power2.out', delay: 0.3,
        onUpdate: () => { introH = st.h; render(); },
        onComplete: () => { introH = Infinity; render(); },
      });
    }, { threshold: 0.4 });
    io.observe(root);
  }
}
