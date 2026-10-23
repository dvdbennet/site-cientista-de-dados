# Felipe Fuck — Site de Cientista de Dados

> Plano de produto, UX, direção de arte e engenharia · v0.2 · 2026-10-14
> **Foco definido: consultoria e projetos freelance (B2B).**
> Esboço navegável: [esboco.html](esboco.html) · Site: raiz do repositório (ver README.md)

---

## 1. Objetivo

Um site pessoal que **converte visitantes qualificados em conversas comerciais** e que, pela própria experiência, prova que Felipe pensa como cientista de dados: rigor, clareza e capacidade de transformar ruído em decisão.

| | |
|---|---|
| **Conversão primária** | Agendar uma call de diagnóstico (30 min) — Cal.com/Calendly embutido |
| **Conversão secundária** | WhatsApp · formulário de projeto qualificado · LinkedIn |
| **Micro-conversões** | Abrir um case completo · baixar o one-pager de serviços (PDF) · copiar e-mail |
| **Meta de experiência** | Nível Awwwards, mas a mensagem "o que ele faz e por que contratar" precisa ser entendida em **5 segundos** no celular |

### Público ✅ definido em 2026-10-14

**Consultoria e trabalhos independentes (freelance).** O site vende projetos, não currículo.

1. **Decisores de negócio** — donos, diretores e gestores de PMEs e scale-ups sem time de dados (ou com time pequeno). Querem resultado em R$, não algoritmo.
2. **Líderes técnicos** (CTO, head de dados) que precisam de reforço sênior pontual / squad extra.
3. **Agências e consultorias** que subcontratam ciência de dados (parceria white-label).

Consequências no site:
- Nada de "Baixar CV" em destaque; LinkedIn/GitHub só como prova, no rodapé e no Sobre.
- Linguagem de **oferta**: diagnóstico → projeto → acompanhamento, com prazos e formatos claros.
- Nova seção **Formatos de trabalho** (§3) para reduzir a dúvida "quanto custa / como contrato".
- CTA sempre orientado a negócio: "Agendar diagnóstico gratuito".

---

## 2. Posicionamento e mensagem

**Ideia central: _do ruído ao sinal._**
Todo o site é uma metáfora visual de um pipeline de dados: o visitante entra no caos (partículas aleatórias), vê padrões surgirem (clusters) e termina numa decisão clara (o CTA).

- **Headline (rascunho):** "Transformo dados bagunçados em decisões que dão lucro."
- **Sub:** "Consultor independente de ciência de dados. Previsão, modelos e dashboards para empresas que querem decidir com números, não com achismo — sem precisar montar um time de dados."
- **Prova logo abaixo:** [N] projetos · [R$/%] de impacto · [setores] — **só com dados reais**; nada inventado.
- **Tom:** direto, técnico sem jargão gratuito, orientado a resultado de negócio (R$, %, horas economizadas) — não a algoritmo.

---

## 3. Arquitetura de informação (one-page + páginas de case)

```
/                 Home (one-page, narrativa de conversão)
/cases/[slug]     Página de case completa (problema → dados → modelo → resultado)
/sobre            (opcional — pode viver só na home)
/obrigado         Pós-agendamento / pós-formulário (evento de conversão)
```

### Fluxo da Home (cada seção responde a uma objeção)

| # | Seção | Pergunta que responde | Destaque visual / 3D |
|---|---|---|---|
| 01 | **Hero 3D "Do ruído ao sinal"** | Quem é e o que entrega? | Nuvem de ~8k partículas que se organiza por scroll: ruído → clusters → superfície de modelo. Headline revelada por linhas. CTA primário visível sem scroll. |
| 02 | **Faixa de prova** | Por que confiar? | Logos/setores + 3 contadores animados (números reais). |
| 03 | **Problema → Resultado** | Isso é pra mim? | 3 dores do cliente que viram 3 resultados (transição "antes/depois" com dado). |
| 04 | **Serviços** | O que exatamente ele faz? | 3 cards com micro-visualização viva (série temporal, matriz, dashboard) — nada de card só de texto. |
| 05 | **Cases** | Já fez isso antes? | Carrossel/stack com foto + gráfico desenhado no scroll; métrica de impacto em destaque; link para a página do case. |
| 06 | **Processo** | Como funciona trabalhar com ele? | 4 etapas (Diagnóstico → Dados → Modelo → Entrega) ligadas por uma linha "pipeline" que se desenha no scroll. |
| 06b | **Formatos de trabalho** | Como contrato? Quanto custa? | 3 cartões: **Diagnóstico** (gratuito, 30 min) · **Projeto fechado** (escopo + prazo + entrega) · **Parceria mensal** (horas/mês, evolução contínua). Preço "a partir de" opcional. Cartão do meio em destaque. |
| 07 | **Stack** | Domina as ferramentas? | Constelação 3D/2D de ferramentas (Python, SQL, dbt, Spark, AWS/GCP, Power BI…) agrupadas por função. |
| 08 | **Sobre** | Por que ele e não uma agência? | Retrato em alta resolução + trajetória curta + "como eu trabalho" (sênior do início ao fim, comunicação direta, transferência de conhecimento). |
| 09 | **Depoimentos** | Outros aprovaram? | 2–4 depoimentos reais com nome/cargo/empresa. |
| 10 | **FAQ** | Objeções finais (preço, prazo, NDA, dados sensíveis) | Accordion acessível. |
| 11 | **CTA final** | Qual o próximo passo? | Agenda embutida + alternativa WhatsApp. As partículas do hero voltam e formam um único ponto: "o sinal". |
| — | **Footer** | | Contatos, LinkedIn, GitHub, Kaggle, one-pager de serviços. |

**Sempre presente:** header minimalista com CTA "Agendar diagnóstico"; no mobile, **barra de CTA fixa no rodapé** que aparece após o hero.

---

## 4. Direção de arte

- **Atmosfera:** laboratório noturno / terminal elegante. Escuro, preciso, com um único acento elétrico.
- **Paleta (proposta):**
  - Fundo `#07090D` (quase-preto azulado) · superfície `#0E131B` · linhas `#1C2533`
  - Texto `#E8EDF5` · texto secundário `#8A97AB`
  - Acento primário **`#7CF5C8`** (verde-sinal) · acento secundário `#6E8BFF` (azul-dado) · alerta/destaque `#FFB86B`
  - Modo claro opcional para páginas de case longas (leitura).
- **Tipografia:**
  - Display: **Inter Tight** ou **Space Grotesk** (bold, tracking negativo, tamanhos fluidos com `clamp`).
  - Texto: **Inter**.
  - Dados/labels: **JetBrains Mono** — números, eixos, tags ("// 01 — Serviços").
- **Grid:** 12 colunas desktop / 4 mobile, gutter 16px no mobile. Linhas finas de grade visíveis como textura sutil ("papel milimetrado de dados").
- **Imagens:** retrato e fotos de case ≥ 2560px, WebP/AVIF com `srcset`. Nada ampliado.

---

## 5. 3D e motion

### 5.1 Cena principal (hero)
- **Three.js** com `THREE.Points` + `BufferGeometry` (8k partículas desktop / 3k mobile).
- **Três estados** pré-calculados no carregamento, interpolados por scroll (seção sticky ~250vh, 3 "beats" de texto — sem trecho vazio):
  1. **Ruído** — pontos aleatórios numa esfera, cinza → "Dados brutos."
  2. **Clusters** — 4 gaussianas coloridas (k-means visual) → "Padrões."
  3. **Modelo** — superfície de regressão/onda ordenada no acento → "Decisões."
- Parallax de rotação com o mouse/giroscópio; respiração sutil (noise) nos pontos.
- Shader próprio (fase 2) para tamanho/brilho por profundidade e transição via GPU.

### 5.2 Sistema de motion
- **Lenis** (smooth scroll) + **GSAP ScrollTrigger**.
- Texto revelado **por linhas com máscara** (não fade geral).
- Gráficos se **desenham** (stroke-dashoffset) quando entram na tela; contadores com easing.
- Cases: card ativo em destaque, vizinhos esmaecidos, parallax interno na foto.
- Hover magnético nos CTAs; cursor custom só no desktop.
- Easing padrão `cubic-bezier(.2,.7,.1,1)`, durações 600–900ms.

### 5.3 Regras inegociáveis
- `prefers-reduced-motion` → sem scrub, cena 3D estática (estado final) e reveals instantâneos.
- Canvas pausa fora da viewport e em aba oculta; `devicePixelRatio` limitado a 1.5.
- Fallback sem WebGL: imagem estática da cena (gerada a partir do próprio canvas).
- Validar em celular **e** em laptop baixo (~650px de altura).

---

## 6. Conversão (CRO)

- CTA primário **acima da dobra** no mobile, repetido a cada 2–3 seções com texto variando pela seção ("Quero um diagnóstico assim").
- Barra fixa mobile: `Agendar diagnóstico` + ícone WhatsApp.
- Formulário curto e qualificador: nome, e-mail, empresa, **"qual decisão você quer melhorar com dados?"**, faixa de orçamento (opcional).
- Garantias que reduzem risco: "Primeira call gratuita · NDA antes de ver seus dados · resposta em 24h".
- Prova social perto de todo CTA.
- Página `/obrigado` com próximo passo claro + evento de conversão.

### Tracking
GA4 (ou Plausible) via GTM — eventos: `cta_click` (com `section`), `calendar_open`, `calendar_booked`, `form_submit`, `whatsapp_click`, `case_open`, `cv_download`, `scroll_depth`.

---

## 7. Stack técnica (proposta)

| Camada | Escolha | Por quê |
|---|---|---|
| Build | **Vite + TypeScript** | Mesmo stack validado na cienmind-landing; rápido, sem peso de framework na cena 3D. |
| 3D | **Three.js** (+ shaders GLSL na fase 2) | Controle total de partículas e performance. |
| Motion | **GSAP + ScrollTrigger + Lenis** | Padrão de mercado para motion Awwwards. |
| Conteúdo | Arquivos `content/*.ts`/`.md` centralizados | Cases, serviços e números editáveis num só lugar. |
| Agenda | Cal.com embed | Gratuito, bonito, tema escuro. |
| Form | Formspree / Resend + endpoint serverless | Simples, sem backend próprio. |
| Deploy | Vercel | CDN global, preview por branch. |
| Fontes | Self-hosted (`@fontsource`) | Performance e privacidade. |

> Alternativa a considerar: **Astro** se o Felipe quiser blog/artigos técnicos (bom para SEO e autoridade). Decidir antes da fase 2.

---

## 8. Performance e acessibilidade (orçamento)

- **LCP < 2.0s** em 4G mobile — headline em HTML puro; o 3D carrega **depois** do primeiro paint (`requestIdleCallback`).
- JS inicial < 150 KB gz (Three.js via import dinâmico).
- CLS ≈ 0; INP < 200ms.
- WCAG AA: contraste, foco visível, navegação por teclado, `aria` nos gráficos (texto alternativo com a conclusão do gráfico).
- Lighthouse ≥ 90 em todas as categorias no mobile.

---

## 9. SEO

- `title`: "Felipe Fuck — Cientista de Dados | Machine Learning e Analytics para Empresas"
- Schema.org `Person` + `ProfessionalService`; cada case com `Article`.
- OG image gerada da própria cena 3D.
- Páginas de case indexáveis com palavras-chave de setor ("previsão de demanda varejo", etc.).

---

## 10. Conteúdo necessário do Felipe

- [ ] Foto profissional em alta (≥ 2560px), idealmente 2–3 variações
- [ ] Headline/nicho preferido (setor ou tipo de problema que ele mais quer vender)
- [ ] 3–5 cases: contexto, problema, dados, abordagem, **resultado mensurável**, imagens/prints (anonimizados se preciso)
- [ ] Números reais para a faixa de prova (anos, projetos, impacto)
- [ ] Logos de clientes/empresas (com permissão)
- [ ] 2–4 depoimentos com nome, cargo e empresa
- [ ] Stack/ferramentas que domina
- [ ] Links: LinkedIn, GitHub, Kaggle, e-mail, WhatsApp, link do Cal.com
- [ ] Modelo de cobrança e, se quiser exibir, preço "a partir de" por formato
- [ ] Capacidade: quantos projetos simultâneos aceita (para gatilho de escassez honesto, ex.: "2 vagas para novembro")
- [ ] Domínio (ex.: felipefuck.com / felipefuck.dev)

> Regra: **nenhuma métrica, cliente ou depoimento inventado.** Onde faltar dado, a seção sai ou fica como placeholder até chegar.

---

## 11. Roadmap

| Fase | Entrega | Critério de pronto |
|---|---|---|
| **0 — Esboço** ✅ (v0.2: foco consultoria) | Este `PLANO.md` + `esboco.html` (wireframe navegável com protótipo 3D) | Aprovação da estrutura e da direção |
| **1 — Design** | Hi-fi das seções-chave (hero, serviços, case, CTA) em mobile e desktop | Aprovação visual |
| **2 — Build** | Site em Vite + TS com 3D, motion e conteúdo real | Lighthouse ≥ 90 mobile, testes em iOS/Android/laptop baixo |
| **3 — Conversão** | Agenda, form, tracking, `/obrigado`, SEO | Eventos aparecendo no GA4 |
| **4 — Lançamento** | Domínio, deploy Vercel, OG, sitemap | Site no ar |
| **5 — Otimização** | Teste A/B de headline e CTA, heatmap (Clarity) | Taxa de conversão medida |

---

## 12. Perguntas em aberto

1. ~~Foco consultoria ou emprego?~~ ✅ **Consultoria e freelance** (2026-10-14)
2. Existe nicho de setor (varejo, saúde, finanças, agro…) ou tipo de problema preferido?
3. Português apenas, ou PT + EN?
4. Ele já tem identidade visual (cores/logo) que precise ser mantida?
5. Quer blog/artigos técnicos no futuro? (decide Vite vs Astro)

---

## 13. Status (2026-10-14)

- ✅ Plano v0.2 e esboço navegável aprovados; foco em consultoria/freelance.
- ✅ Correções no contador do hero (palavras empilhadas e cortadas).
- ✅ Fase 2 (build) iniciada: site em Vite + TS + Three.js (shader na GPU) + GSAP + Lenis, com Home, modelo de case, /obrigado, formulário, Cal.com e tracking — tudo com placeholders.
- ⏭️ **Retomar por:** responder §12 (itens 2–5) → preencher conteúdo real (§10) em `index.html` e `src/config.ts` → deploy na Vercel.
- ✅ 2026-10-23 — pacote de UI/UX (13 itens): menu mobile em tela cheia, barra de progresso + seção ativa, hero mais claro (avatar + selo de disponibilidade, 200vh), diagnóstico rápido interativo, mini-gráficos nos cases, partículas convergindo no CTA final, processo em scrollytelling, constelação 3D de ferramentas, View Transitions entre páginas, cursor personalizado + tilt, rodapé grande com copiar e-mail, Lighthouse 97/100/100/100 (mobile) e 100×4 (desktop).

