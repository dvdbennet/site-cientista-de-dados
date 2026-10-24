// Gera en/index.html (versão em inglês) a partir de index.html (português).
// Uso: npm run i18n   (também roda automaticamente no npm run build)
//
// Como funciona: cada par [português, inglês] abaixo é substituído no HTML.
// Os pares mais longos são aplicados primeiro, então frases inteiras vencem palavras soltas.
// Se você mudar um texto em index.html, atualize o par correspondente aqui —
// o script avisa quais trechos não encontrou e quais palavras em português sobraram.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const PAIRS = [
  // ---------- <head> ----------
  ['<html lang="pt-BR">', '<html lang="en">'],
  ['Felipe Fuck — Cientista de Dados | Machine Learning e Analytics para Empresas', 'Felipe Fuck — Data Scientist | Machine Learning & Analytics for Companies'],
  ['Consultor independente de ciência de dados. Previsão, modelos de machine learning e dashboards para empresas que querem decidir com números — sem precisar montar um time de dados.',
    'Independent data science consultant. Forecasting, machine learning models and dashboards for companies that want to decide with numbers — without building a data team.'],
  ['<link rel="canonical" href="__SITE_URL__/">', '<link rel="canonical" href="__SITE_URL__/en/">'],
  ['<meta property="og:url" content="__SITE_URL__/">', '<meta property="og:url" content="__SITE_URL__/en/">'],
  ['Felipe Fuck — Do ruído ao sinal">', 'Felipe Fuck — From noise to signal">'],
  ['Previsão, machine learning e dashboards para empresas decidirem com números. Diagnóstico gratuito de 30 minutos.',
    'Forecasting, machine learning and dashboards so companies decide with numbers. Free 30-minute discovery call.'],
  ['<meta property="og:locale" content="pt_BR">\n  <meta property="og:locale:alternate" content="en_US">', '<meta property="og:locale" content="en_US">\n  <meta property="og:locale:alternate" content="pt_BR">'],
  ['content="__SITE_URL__/og-image.png"', 'content="__SITE_URL__/og-image-en.png"'],
  ['Felipe Fuck — Do ruído ao sinal. Previsão, machine learning e dashboards.', 'Felipe Fuck — From noise to signal. Forecasting, machine learning and dashboards.'],
  ['"name": "Felipe Fuck — Consultoria em Ciência de Dados"', '"name": "Felipe Fuck — Data Science Consulting"'],
  ['"description": "Previsão, machine learning, analytics e engenharia de dados para empresas."', '"description": "Forecasting, machine learning, analytics and data engineering for companies."'],
  ['"jobTitle": "Cientista de Dados"', '"jobTitle": "Data Scientist"'],

  // ---------- header / menu ----------
  ['Pular para o conteúdo', 'Skip to content'],
  ['aria-label="Felipe Fuck — início"', 'aria-label="Felipe Fuck — home"'],
  ['<nav aria-label="Principal">', '<nav aria-label="Main">'],
  ['<a href="/en/" class="lang-switch" hreflang="en" lang="en" aria-label="English version">EN</a>', '<a href="/" class="lang-switch" hreflang="pt-BR" lang="pt-BR" aria-label="Versão em português">PT</a>'],
  ['<a href="/en/" class="menu-lang" hreflang="en" lang="en">English version →</a>', '<a href="/" class="menu-lang" hreflang="pt-BR" lang="pt-BR">Versão em português →</a>'],
  ['aria-label="Abrir menu"', 'aria-label="Open menu"'],
  ['<nav aria-label="Menu mobile">', '<nav aria-label="Mobile menu">'],
  ['<span>01</span>Serviços', '<span>01</span>Services'],
  ['<span>03</span>Processo', '<span>03</span>Process'],
  ['<span>04</span>Formatos', '<span>04</span>Engagements'],
  ['<span>05</span>Diagnóstico rápido', '<span>05</span>Quick assessment'],
  ['<span>06</span>Sobre', '<span>06</span>About'],
  ['<span>07</span>Contato', '<span>07</span>Contact'],
  ['<a href="#servicos">Serviços</a>', '<a href="#servicos">Services</a>'],
  ['<a href="#processo">Processo</a>', '<a href="#processo">Process</a>'],
  ['<a href="#formatos">Formatos</a>', '<a href="#formatos">Engagements</a>'],
  ['<a href="#diagnostico">Diagnóstico rápido</a>', '<a href="#diagnostico">Quick assessment</a>'],
  ['<a href="#sobre">Sobre</a>', '<a href="#sobre">About</a>'],
  ['Agendar diagnóstico gratuito', 'Book a free discovery call'],
  ['Agendar diagnóstico', 'Book a call'],

  // ---------- hero ----------
  ['aria-label="Apresentação"', 'aria-label="Introduction"'],
  ['<span class="on">Dados brutos.</span><span>Padrões.</span><span>Decisões.</span>', '<span class="on">Raw data.</span><span>Patterns.</span><span>Decisions.</span>'],
  ['<span>· Cientista de Dados</span>', '<span>· Data Scientist</span>'],
  ['<span data-availability>Disponível para novos projetos</span>', '<span data-availability>Available for new projects</span>'],
  ['<span class="line"><span>Do ruído</span></span>\n            <span class="line"><span>ao <em>sinal</em>.</span></span>',
    '<span class="line"><span>From noise</span></span>\n            <span class="line"><span>to <em>signal</em>.</span></span>'],
  ['Previsão, machine learning e dashboards para empresas decidirem com números.', 'Forecasting, machine learning and dashboards so companies decide with numbers.'],
  ['Consultor independente — sem precisar montar um time de dados. Primeiro diagnóstico gratuito, em 30 minutos.',
    'Independent consultant — no need to build a data team. First discovery call is free and takes 30 minutes.'],
  ['Qual formato é pra mim?', 'Which engagement fits me?'],
  ['ROLE <span>↓</span>', 'SCROLL <span>↓</span>'],

  // ---------- prova ----------
  ['<span>projetos entregues</span>', '<span>projects delivered</span>'],
  ['<span>impacto médio</span>', '<span>average impact</span>'],
  ['<small> anos</small></b><span>com dados</span>', '<small> years</small></b><span>in data</span>'],
  ['aria-label="Empresas atendidas"', 'aria-label="Clients"'],
  ['<li>CLIENTE</li>', '<li>CLIENT</li>'],

  // ---------- problema → resultado ----------
  ['— Isso é pra você?', '— Is this for you?'],
  ['Você tem dados. Falta transformá-los em <em>decisão</em>.', 'You have data. Now turn it into <em>decisions</em>.'],
  ['"Fazemos o estoque no feeling."', '"We plan inventory by gut feeling."'],
  ['→ previsão de demanda', '→ demand forecasting'],
  ['Compras guiadas por previsão semanal, com menos ruptura e menos capital parado.', 'Purchasing guided by a weekly forecast — fewer stockouts, less idle capital.'],
  ['"Cada área tem uma planilha diferente."', '"Every team has a different spreadsheet."'],
  ['→ engenharia + BI', '→ engineering + BI'],
  ['Uma fonte única de verdade e um painel que o time realmente abre.', 'A single source of truth and a dashboard the team actually opens.'],
  ['"Não sabemos por que os clientes saem."', '"We don\'t know why customers leave."'],
  ['→ modelo de churn', '→ churn model'],
  ['Lista semanal de clientes em risco com o motivo provável de cada um.', 'A weekly list of at-risk customers with the likely reason for each.'],

  // ---------- serviços ----------
  ['— Serviços', '— Services'],
  ['Três formas de colocar seus dados <em>para trabalhar</em>.', 'Three ways to put your data <em>to work</em>.'],
  ['aria-label="Série temporal com previsão"', 'aria-label="Time series with forecast"'],
  ['>previsão →</text>', '>forecast →</text>'],
  ['<h3>Previsão &amp; Machine Learning</h3>', '<h3>Forecasting &amp; Machine Learning</h3>'],
  ['Modelos de demanda, churn, preço e risco — em produção, não em notebook.', 'Demand, churn, pricing and risk models — in production, not in a notebook.'],
  ['<li>classificação</li>', '<li>classification</li>'],
  ['aria-label="Gráfico de barras crescente"', 'aria-label="Growing bar chart"'],
  ['KPIs confiáveis e painéis que respondem perguntas de negócio em segundos.', 'Reliable KPIs and dashboards that answer business questions in seconds.'],
  ['aria-label="Pipeline de dados: bruto, transformação, pronto"', 'aria-label="Data pipeline: raw, transformed, ready"'],
  ['<h3>Engenharia de Dados</h3>', '<h3>Data Engineering</h3>'],
  ['Pipelines automatizados que juntam suas fontes numa base única e auditável.', 'Automated pipelines that bring your sources into a single, auditable base.'],

  // ---------- cases ----------
  ['Resultados medidos, <em>não prometidos</em>.', 'Results measured, <em>not promised</em>.'],
  ['aria-label="Navegar cases"', 'aria-label="Browse case studies"'],
  ['aria-label="Case anterior"', 'aria-label="Previous case"'],
  ['aria-label="Próximo case"', 'aria-label="Next case"'],
  ['aria-label="Lista de cases"', 'aria-label="Case studies"'],
  ['aria-label="Gráfico: ruptura de estoque antes e depois do modelo"', 'aria-label="Chart: stockouts before and after the model"'],
  ['>antes</text>', '>before</text>'],
  ['>depois</text>', '>after</text>'],
  ['<span>ruptura de estoque</span>', '<span>stockouts</span>'],
  ['[Setor] · [Ano]', '[Industry] · [Year]'],
  ['Previsão de demanda para [cliente]', 'Demand forecasting for [client]'],
  ['aria-label="Gráfico: retenção de clientes subindo"', 'aria-label="Chart: customer retention rising"'],
  ['>modelo no ar</text>', '>model live</text>'],
  ['<span>retenção</span>', '<span>retention</span>'],
  ['Modelo de churn para [cliente]', 'Churn model for [client]'],
  ['aria-label="Gráfico: horas gastas com relatórios caindo"', 'aria-label="Chart: hours spent on reports falling"'],
  ['>horas/mês · antes</text>', '>hours/month · before</text>'],
  ['<span>economizadas / mês</span>', '<span>saved / month</span>'],
  ['Automação de relatórios para [cliente]', 'Report automation for [client]'],

  // ---------- laboratório ----------
  ['— Teste um modelo de previsão', '— Try a forecasting model'],
  ['Mexa nos dados. Veja a <em>previsão</em> reagir.', 'Move the data. Watch the <em>forecast</em> react.'],
  ['Dados simulados · demonstração', 'Simulated data · demo'],
  ['<i class="lg-hist"></i>Histórico de vendas', '<i class="lg-hist"></i>Sales history'],
  ['<i class="lg-fc"></i>Previsão do modelo', '<i class="lg-fc"></i>Model forecast'],
  ['<i class="lg-band"></i>Faixa de confiança', '<i class="lg-band"></i>Confidence band'],
  ['<i class="lg-naive"></i>"Média das últimas semanas"', '<i class="lg-naive"></i>"Average of recent weeks"'],
  ['aria-label="Gráfico de vendas semanais com previsão"', 'aria-label="Weekly sales chart with forecast"'],
  ['<span>Promoção / choque de demanda</span>', '<span>Promotion / demand shock</span>'],
  ['<span>Horizonte da previsão</span><output id="oHorizon">8 semanas</output>', '<span>Forecast horizon</span><output id="oHorizon">8 weeks</output>'],
  ['<span>Nível de serviço desejado</span>', '<span>Target service level</span>'],
  ['<span>Considerar sazonalidade</span>', '<span>Account for seasonality</span>'],
  ['<dt>Demanda prevista</dt>', '<dt>Forecast demand</dt>'],
  ['<dt>Estoque recomendado</dt>', '<dt>Recommended stock</dt>'],
  ['<dt>Quanto a "média simples" erraria</dt>', '<dt>How far off a "simple average" would be</dt>'],
  ['Quero isso com os meus dados →', 'I want this with my data →'],

  // ---------- processo ----------
  ['— Processo', '— Process'],
  ['Do primeiro papo ao modelo <em>em produção</em>.', 'From the first chat to a model <em>in production</em>.'],
  ['<span class="proc-tag" id="procTag">01 · Diagnóstico</span>', '<span class="proc-tag" id="procTag">01 · Discovery</span>'],
  ['>decisão-alvo</text>', '>target decision</text>'],
  ['>R$ em jogo?</text>', '>$ at stake?</text>'],
  ['>base única</text>', '>single base</text>'],
  ['>R² validado ✓</text>', '>R² validated ✓</text>'],
  ['>↑ vendas</text>', '>↑ sales</text>'],
  ['>✓ meta</text>', '>✓ target</text>'],
  ['>↓ custo</text>', '>↓ cost</text>'],
  ['>painel em produção · atualizado hoje</text>', '>dashboard live · updated today</text>'],
  ['<span class="n">01 · semana 1</span><h3>Diagnóstico</h3><p>Entendo a decisão que importa, quanto dinheiro está em jogo e se os dados permitem melhorá-la.</p>',
    '<span class="n">01 · week 1</span><h3>Discovery</h3><p>I understand the decision that matters, how much money is at stake and whether the data can improve it.</p>'],
  ['<span class="n">02 · semanas 2–3</span><h3>Dados</h3><p>Junto planilhas, sistemas e arquivos numa base única, limpa e confiável.</p>',
    '<span class="n">02 · weeks 2–3</span><h3>Data</h3><p>I bring spreadsheets, systems and files into a single, clean, reliable base.</p>'],
  ['<span class="n">03 · semanas 3–5</span><h3>Modelo</h3><p>Prototipo, valido contra o mundo real e explico o porquê de cada previsão.</p>',
    '<span class="n">03 · weeks 3–5</span><h3>Model</h3><p>I prototype, validate against the real world and explain the why behind every prediction.</p>'],
  ['<span class="n">04 · contínuo</span><h3>Entrega</h3><p>Em produção, com painel, documentação e acompanhamento — o time usa no dia seguinte.</p>',
    '<span class="n">04 · ongoing</span><h3>Delivery</h3><p>In production, with a dashboard, documentation and follow-up — the team uses it the next day.</p>'],

  // ---------- calculadora ----------
  ['<b>// R$</b> — Calculadora', '<b>// $</b> — Calculator'],
  ['Quanto custa decidir <em>no escuro</em>?', 'What does deciding <em>in the dark</em> cost?'],
  ['Estoque parado, ruptura, cliente que sai sem aviso, relatório refeito à mão. Ajuste com a realidade da sua empresa e veja o valor em jogo.',
    'Idle inventory, stockouts, customers leaving without warning, reports rebuilt by hand. Adjust to your reality and see what is at stake.'],
  ['Estimativa ilustrativa com as premissas que você escolher. No diagnóstico, o cálculo é feito com os seus números.',
    'Illustrative estimate based on the assumptions you choose. In the discovery call, we run it with your real numbers.'],
  ['<span>Faturamento mensal</span>', '<span>Monthly revenue</span>'],
  ['<span class="cur" data-currency>R$</span>', '<span class="cur" data-currency>$</span>'],
  ['value="500.000" aria-label="Faturamento mensal"', 'value="100,000" aria-label="Monthly revenue"'],
  ['<span>Perda estimada com decisões sem dados</span>', '<span>Estimated loss from decisions without data</span>'],
  ['<small>ruptura, excesso de estoque, churn, retrabalho</small>', '<small>stockouts, excess inventory, churn, rework</small>'],
  ['<span>Quanto disso dá para recuperar com dados</span>', '<span>Share recoverable with data</span>'],
  ['<small>premissa conservadora; ajuste à vontade</small>', '<small>conservative assumption; adjust freely</small>'],
  ['<span>Em jogo por mês</span>', '<span>At stake per month</span>'],
  ['<b id="cMonth">R$ 0</b>', '<b id="cMonth">$0</b>'],
  ['<span>Recuperável por ano</span><b id="cYear" class="hl">R$ 0</b>', '<span>Recoverable per year</span><b id="cYear" class="hl">$0</b>'],
  ['<span>Por semana sem agir</span><b id="cWeek">R$ 0</b>', '<span>Per week of inaction</span><b id="cWeek">$0</b>'],
  ['Calcular com meus números →', 'Run it with my numbers →'],

  // ---------- formatos ----------
  ['— Formatos de trabalho', '— Engagements'],
  ['Escolha como quer <em>começar</em>.', 'Choose how you want to <em>start</em>.'],
  ['Sem contrato longo para testar. Você começa pelo diagnóstico e decide o próximo passo com clareza de escopo, prazo e investimento.',
    'No long contract to try it out. Start with the discovery call and decide the next step with a clear scope, timeline and investment.'],
  ['<span class="fmt-k">Passo 1</span>\n            <h3>Diagnóstico</h3>\n            <p class="price">Gratuito · 30 min</p>',
    '<span class="fmt-k">Step 1</span>\n            <h3>Discovery call</h3>\n            <p class="price">Free · 30 min</p>'],
  ['<li>Entendo a decisão que você quer melhorar</li><li>Avalio se seus dados permitem</li><li>Você sai com um caminho recomendado</li>',
    '<li>I understand the decision you want to improve</li><li>I assess whether your data supports it</li><li>You leave with a recommended path</li>'],
  ['MAIS ESCOLHIDO', 'MOST CHOSEN'],
  ['<span class="fmt-k">Escopo fechado</span>\n            <h3>Projeto</h3>\n            <p class="price">a partir de R$ [X] · [N] semanas</p>',
    '<span class="fmt-k">Fixed scope</span>\n            <h3>Project</h3>\n            <p class="price">from $[X] · [N] weeks</p>'],
  ['<li>Escopo, prazo e entregáveis definidos</li><li>Modelo ou painel em produção</li><li>Documentação + passagem de conhecimento</li><li>[N] dias de suporte pós-entrega</li>',
    '<li>Defined scope, timeline and deliverables</li><li>Model or dashboard in production</li><li>Documentation + knowledge transfer</li><li>[N] days of post-delivery support</li>'],
  ['>Quero um projeto</a>', '>I want a project</a>'],
  ['<span class="fmt-k">Contínuo</span>\n            <h3>Parceria mensal</h3>\n            <p class="price">a partir de R$ [X]/mês</p>',
    '<span class="fmt-k">Ongoing</span>\n            <h3>Monthly partnership</h3>\n            <p class="price">from $[X]/month</p>'],
  ['<li>Horas mensais dedicadas</li><li>Evolução contínua de modelos e painéis</li><li>Ideal para quem ainda não tem time de dados</li>',
    '<li>Dedicated monthly hours</li><li>Continuous improvement of models and dashboards</li><li>Ideal if you don\'t have a data team yet</li>'],
  ['>Conversar sobre parceria</a>', '>Talk about a partnership</a>'],

  // ---------- diagnóstico rápido ----------
  ['— Diagnóstico rápido', '— Quick assessment'],
  ['Três perguntas. <em>Um caminho</em>.', 'Three questions. <em>One path</em>.'],
  ['Responda em 20 segundos e veja qual formato faz mais sentido para o seu momento. As respostas já seguem junto quando você agendar.',
    'Answer in 20 seconds and see which engagement fits where you are. Your answers come along when you book.'],
  ['<legend>O que você quer resolver?</legend>', '<legend>What do you want to solve?</legend>'],
  ['<span><b>Prever</b> demanda, vendas ou estoque</span>', '<span><b>Forecast</b> demand, sales or inventory</span>'],
  ['<span><b>Entender clientes</b> — churn, segmentação, LTV</span>', '<span><b>Understand customers</b> — churn, segmentation, LTV</span>'],
  ['<span><b>Organizar</b> dados e relatórios</span>', '<span><b>Organize</b> data and reports</span>'],
  ['<span><b>Ainda não sei</b> — quero descobrir</span>', '<span><b>Not sure yet</b> — I want to find out</span>'],
  ['<legend>Como estão seus dados hoje?</legend>', '<legend>Where is your data today?</legend>'],
  ['<span><b>Planilhas</b> espalhadas</span>', '<span>Scattered <b>spreadsheets</b></span>'],
  ['<span><b>Sistema/ERP</b> ou banco de dados</span>', '<span><b>System/ERP</b> or database</span>'],
  ['<span>Já tenho <b>BI ou painéis</b></span>', '<span>I already have <b>BI or dashboards</b></span>'],
  ['<span><b>Não sei</b> dizer</span>', '<span><b>I don\'t know</b></span>'],
  ['<legend>Que tipo de apoio você busca?</legend>', '<legend>What kind of support are you looking for?</legend>'],
  ['<span>Uma <b>entrega com prazo</b> definido</span>', '<span>A <b>delivery with a deadline</b></span>'],
  ['<span><b>Evolução contínua</b>, mês a mês</span>', '<span><b>Continuous improvement</b>, month by month</span>'],
  ['<span>Primeiro <b>entender se vale</b> a pena</span>', '<span>First <b>see if it\'s worth it</b></span>'],
  ['<p class="fmt-k">Recomendação</p>\n            <h3 id="quizTitle">Projeto</h3>', '<p class="fmt-k">Recommendation</p>\n            <h3 id="quizTitle">Project</h3>'],
  ['Escolher horário agora →', 'Pick a time now →'],
  ['data-alt-label="Prefiro escrever">Agendar com esse contexto →', 'data-alt-label="I’d rather write">Book with this context →'],
  ['id="quizRestart">Refazer</button>', 'id="quizRestart">Start over</button>'],
  ['id="quizBack" hidden>← Voltar</button>', 'id="quizBack" hidden>← Back</button>'],

  // ---------- stack ----------
  ['Ferramentas certas para <em>cada etapa</em>.', 'The right tools for <em>every step</em>.'],
  ['<p class="c-hint">arraste para girar</p>', '<p class="c-hint">drag to rotate</p>'],
  ['<div><h3>Linguagens</h3>', '<div><h3>Languages</h3>'],
  ['<div><h3>Dados</h3>', '<div><h3>Data</h3>'],

  // ---------- sobre ----------
  ['<figcaption>Retrato do Felipe<br><small>≥ 2560px · luz lateral · fundo escuro</small></figcaption>', '<figcaption>Felipe\'s portrait<br><small>≥ 2560px · side light · dark background</small></figcaption>'],
  ['— Sobre', '— About'],
  ['Oi, eu sou o <em>Felipe</em>.', 'Hi, I\'m <em>Felipe</em>.'],
  ['[Trajetória em 3–4 frases: formação, onde trabalhou, que tipo de problema ama resolver.] Você fala direto comigo do diagnóstico à entrega — sem repasse para júnior, sem camada de agência.',
    '[Background in 3–4 sentences: education, where he worked, what kind of problem he loves solving.] You talk directly to me from discovery to delivery — no hand-offs to juniors, no agency layer.'],
  ['>Conversar com o Felipe</a>', '>Talk to Felipe</a>'],

  // ---------- depoimentos ----------
  ['— Depoimentos', '— Testimonials'],
  ['Quem já trabalhou <em>comigo</em>.', 'People who\'ve worked <em>with me</em>.'],
  ['[Depoimento real do cliente com resultado concreto.]', '[Real client testimonial with a concrete result.]'],
  ['[Nome] · [Cargo], [Empresa]', '[Name] · [Role], [Company]'],

  // ---------- FAQ ----------
  ['— Perguntas', '— FAQ'],
  ['Antes de você <em>perguntar</em>.', 'Before you <em>ask</em>.'],
  ['<summary>Quanto custa um projeto?</summary><p>[Faixa de investimento ou modelo de cobrança — o diagnóstico gratuito define o escopo.]</p>',
    '<summary>How much does a project cost?</summary><p>[Investment range or pricing model — the free discovery call defines the scope.]</p>'],
  ['<summary>Meus dados ficam seguros?</summary><p>[NDA antes de qualquer acesso, trabalho no ambiente do próprio cliente, LGPD.]</p>',
    '<summary>Is my data safe?</summary><p>[NDA before any access, work inside the client\'s own environment, GDPR/LGPD compliant.]</p>'],
  ['<summary>Quanto tempo leva?</summary><p>[Prazos típicos por tipo de projeto.]</p>', '<summary>How long does it take?</summary><p>[Typical timelines per project type.]</p>'],
  ['<summary>Preciso ter um time de dados?</summary><p>[Não — explicação.]</p>', '<summary>Do I need a data team?</summary><p>[No — explanation.]</p>'],
  ['<summary>Você emite nota fiscal / trabalha com contrato?</summary><p>[PJ, contrato com escopo e NDA.]</p>',
    '<summary>Do you work with contracts and invoices?</summary><p>[Yes — contract with scope and NDA, invoices for international clients.]</p>'],
  ['<summary>Atende empresas de outras cidades ou do exterior?</summary><p>[100% remoto, reuniões por vídeo.]</p>',
    '<summary>Do you work with companies abroad?</summary><p>[100% remote, video meetings, flexible time zones.]</p>'],

  // ---------- contato ----------
  ['Qual decisão você quer <em>acertar</em> com dados?', 'Which decision do you want to <em>get right</em> with data?'],
  ['30 minutos, sem custo. Você sai com um diagnóstico claro do que dá pra fazer com os dados que já tem.',
    '30 minutes, free. You leave with a clear assessment of what can be done with the data you already have.'],
  ['aria-label="Agenda"', 'aria-label="Calendar"'],
  ['<p>Agenda online em breve.</p>', '<p>Online booking coming soon.</p>'],
  ['data-track="email_click">Enviar e-mail</a>', 'data-track="email_click">Send an email</a>'],
  ['<h3>Prefere escrever?</h3>', '<h3>Prefer to write?</h3>'],
  ['<!-- anti-spam: campo invisível para pessoas -->', '<!-- anti-spam: field invisible to humans -->'],
  ['<label>Nome<input', '<label>Name<input'],
  ['<label>Empresa<input', '<label>Company<input'],
  ['<label>Qual decisão você quer melhorar com dados?<textarea', '<label>Which decision do you want to improve with data?<textarea'],
  ['type="submit">Enviar mensagem</button>', 'type="submit">Send message</button>'],
  ['<li>Primeira call gratuita</li><li>NDA antes de ver seus dados</li><li>Resposta em 24h</li>', '<li>First call is free</li><li>NDA before seeing your data</li><li>Reply within 24h</li>'],
  ['>Prefiro WhatsApp</a>', '>I prefer WhatsApp</a>'],

  // ---------- rodapé ----------
  ['<b>//</b> vamos conversar', '<b>//</b> let\'s talk'],
  ['aria-label="Copiar e-mail"', 'aria-label="Copy email"'],
  ['<span class="copy-hint" aria-live="polite">Copiar</span>', '<span class="copy-hint" aria-live="polite">Copy</span>'],
  ['<h2 class="foot-h">Navegar</h2>', '<h2 class="foot-h">Navigate</h2>'],
  ['<h2 class="foot-h">Redes</h2>', '<h2 class="foot-h">Social</h2>'],
  ['<h2 class="foot-h">Materiais</h2>', '<h2 class="foot-h">Resources</h2>'],
  ['One-pager de serviços (PDF)', 'Services one-pager (PDF)'],
  ['Felipe Fuck · Consultoria em Ciência de Dados', 'Felipe Fuck · Data Science Consulting'],
  ['Voltar ao topo ↑', 'Back to top ↑'],
  ['aria-label="Conversar no WhatsApp"', 'aria-label="Chat on WhatsApp"'],

  // ---------- comentários (não visíveis, mas mantêm o arquivo coerente) ----------
  ['<!-- Troque pelo retrato:', '<!-- Replace with portrait:'],
  ['<!-- Troque pelo retrato real:', '<!-- Replace with the real portrait:'],
  ['<!-- Troque [N] pelo número real em data-count E no texto. Ex.: <span data-count="42">42</span> -->', '<!-- Replace [N] with the real number in data-count AND in the text. E.g.: <span data-count="42">42</span> -->'],
  ['<!-- Menu mobile (fora do header para não herdar contexto de position:fixed) -->', '<!-- Mobile menu (outside the header so it does not inherit a position:fixed context) -->'],
];

let html = readFileSync('index.html', 'utf8');
const missing = [];
for (const [pt, en] of [...PAIRS].sort((a, b) => b[0].length - a[0].length)) {
  if (!html.includes(pt)) { missing.push(pt); continue; }
  html = html.split(pt).join(en);
}

// avisa sobre texto visível que ainda parece português (acentos típicos fora de comentários)
const visible = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
const leftovers = [...new Set(visible.match(/[^<>"\n]*[ãõçáéíóúâêô][^<>"\n]*/gi) ?? [])]
  .map((s) => s.trim()).filter((s) => s && !s.includes('Versão em português'));

mkdirSync('en', { recursive: true });
// o aviso vai logo depois do <!doctype> (antes dele o navegador entraria em quirks mode)
html = html.replace(/^<!doctype html>\n/i, '<!doctype html>\n<!-- GERADO por scripts/build-en.mjs a partir de index.html — não edite à mão. -->\n');
writeFileSync('en/index.html', html);

console.log(`✓ en/index.html gerado (${PAIRS.length - missing.length}/${PAIRS.length} trechos traduzidos)`);
if (missing.length) {
  console.warn(`\n⚠ ${missing.length} trecho(s) não encontrado(s) em index.html — atualize scripts/build-en.mjs:`);
  missing.forEach((m) => console.warn(`  • ${m.slice(0, 90)}`));
}
if (leftovers.length) {
  console.warn(`\n⚠ Possível texto em português sobrando em en/index.html:`);
  leftovers.slice(0, 20).forEach((l) => console.warn(`  • ${l.slice(0, 90)}`));
}
