/**
 * Constelação de ferramentas: cada grupo (Linguagens, ML, Dados, Cloud & BI)
 * é um aglomerado num "globo" 3D que gira devagar. Os rótulos são HTML
 * projetados em 2D (nítidos e leves); as ligações são desenhadas num canvas.
 * Os dados vêm da lista acessível .stack-cloud — editar a lista atualiza a constelação.
 */
type Node3 = { el: HTMLElement; x: number; y: number; z: number; g: number; group?: boolean };

export function initConstellation({ animate = true } = {}) {
  const root = document.getElementById('constellation');
  const list = document.querySelector('.stack-cloud');
  if (!root || !list) return;
  const canvas = root.querySelector('canvas')!;
  const layer = root.querySelector<HTMLElement>('.c-nodes')!;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  document.documentElement.classList.add('has-constellation');

  const groups = [...list.children].map((g) => ({
    name: g.querySelector('h3')?.textContent ?? '',
    items: [...g.querySelectorAll('li')].map((li) => li.textContent ?? ''),
  }));

  const nodes: Node3[] = [];
  const centers: Node3[] = [];
  groups.forEach((g, gi) => {
    // centros dos grupos distribuídos ao redor do eixo Y, alternando altura
    const a = (gi / groups.length) * Math.PI * 2;
    const cx = Math.cos(a) * 1, cz = Math.sin(a) * 1, cy = gi % 2 ? 0.28 : -0.28;
    const gEl = document.createElement('span');
    gEl.className = 'c-group';
    gEl.textContent = g.name;
    layer.append(gEl);
    const center = { el: gEl, x: cx, y: cy, z: cz, g: gi, group: true };
    centers.push(center);
    nodes.push(center);
    g.items.forEach((label, k) => {
      const b = (k / g.items.length) * Math.PI * 2 + gi;
      const el = document.createElement('span');
      el.className = 'c-node';
      el.textContent = label;
      layer.append(el);
      nodes.push({ el, x: cx + Math.cos(b) * 0.32, y: cy + Math.sin(b) * 0.3 + 0.05, z: cz + Math.sin(b * 1.7) * 0.28, g: gi });
    });
  });

  let w = 0, h = 0;
  const dpr = Math.min(devicePixelRatio, 2);
  const resize = () => {
    w = root.clientWidth; h = root.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nodes.forEach((n) => { (n as Node3 & { bw?: number }).bw = n.el.offsetWidth; });
  };
  new ResizeObserver(resize).observe(root);
  resize();

  let rotY = 0.4, rotX = -0.15, velY = animate ? 0.0025 : 0;
  let hot = -1;

  const project = (n: Node3) => {
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY), cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const x1 = n.x * cosY - n.z * sinY;
    const z1 = n.x * sinY + n.z * cosY;
    const y1 = n.y * cosX - z1 * sinX;
    const z2 = n.y * sinX + z1 * cosX;
    const radius = Math.min(w * 0.36, h * 0.62);
    const s = 2.4 / (2.4 + z2);
    return { x: w / 2 + x1 * radius * s, y: h / 2 + y1 * radius * s, z: z2, s };
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const p = nodes.map(project);
    // ligações nó → centro do grupo
    nodes.forEach((n, i) => {
      if (n.group) return;
      const c = p[nodes.indexOf(centers[n.g])];
      const depth = (1 - (p[i].z + 1.4) / 2.8);
      ctx.strokeStyle = hot === -1 || hot === n.g ? `rgba(124,245,200,${0.08 + depth * 0.25})` : 'rgba(124,245,200,0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(p[i].x, p[i].y); ctx.stroke();
    });
    // anel entre grupos
    ctx.strokeStyle = 'rgba(110,139,255,0.14)';
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    centers.forEach((c, k) => { const q = p[nodes.indexOf(c)]; if (k) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
    const q0 = p[nodes.indexOf(centers[0])]; ctx.lineTo(q0.x, q0.y);
    ctx.stroke();
    ctx.setLineDash([]);
    // rótulos
    nodes.forEach((n, i) => {
      const { x, y, z, s } = p[i];
      const bw = (n as Node3 & { bw?: number }).bw ?? 0;
      const op = Math.max(0.15, Math.min(1, 1 - (z + 0.6) / 1.8));
      n.el.style.transform = `translate3d(${x - bw / 2}px, ${y - 14}px, 0) scale(${s.toFixed(3)})`;
      n.el.style.opacity = op.toFixed(2);
      n.el.style.zIndex = String(Math.round((2 - z) * 100));
      n.el.classList.toggle('hot', hot === n.g);
    });
  };

  // interação: arrastar gira; passar o mouse destaca o grupo
  let dragging = false, lastX = 0, lastY = 0;
  root.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; root.classList.add('dragging'); root.setPointerCapture(e.pointerId); });
  root.addEventListener('pointermove', (e) => {
    if (dragging) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      rotY += dx * 0.006; rotX = Math.max(-0.6, Math.min(0.6, rotX + dy * 0.004));
      velY = dx * 0.0006;
    }
    const t = (e.target as HTMLElement).closest('.c-node, .c-group');
    const n = nodes.find((k) => k.el === t);
    hot = n ? n.g : -1;
    root.classList.toggle('focus', hot !== -1);
  });
  const end = () => { dragging = false; root.classList.remove('dragging'); };
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);
  root.addEventListener('pointerleave', () => { hot = -1; root.classList.remove('focus'); });

  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(root);
  const loop = () => {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    if (!dragging) {
      // volta suavemente para a rotação automática
      velY += ((animate ? 0.0025 : 0) - velY) * 0.03;
      rotY += velY;
    }
    draw();
  };
  draw();
  requestAnimationFrame(loop);
}
