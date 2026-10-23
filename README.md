# Site Cientista de Dados — Felipe Fuck

Site de alta conversão para **consultoria e projetos freelance de ciência de dados**.
Conceito visual: **"Do ruído ao sinal"** — no topo da página, uma nuvem 3D de partículas se organiza conforme você rola: ruído → padrões (clusters) → modelo.

**Tecnologias:** HTML + CSS + TypeScript · [Vite](https://vite.dev) · [Three.js](https://threejs.org) (3D) · [GSAP](https://gsap.com) (animações) · [Lenis](https://lenis.darkroom.engineering) (rolagem suave).

---

## Sumário

1. [O que você precisa instalar](#1-o-que-você-precisa-instalar)
2. [Baixar o projeto](#2-baixar-o-projeto)
3. [Instalar as dependências](#3-instalar-as-dependências)
4. [Rodar o site na sua máquina](#4-rodar-o-site-na-sua-máquina)
5. [Gerar a versão final (build)](#5-gerar-a-versão-final-build)
6. [Estrutura de pastas](#6-estrutura-de-pastas)
7. [Onde editar o conteúdo](#7-onde-editar-o-conteúdo)
8. [Formulário de contato e configurações (.env)](#8-formulário-de-contato-e-configurações-opcionais-env)
9. [Publicar na internet (Vercel)](#9-publicar-na-internet-vercel)
10. [Problemas comuns](#10-problemas-comuns)

---

## 1. O que você precisa instalar

| Programa | Para quê | Obrigatório? |
|---|---|---|
| **Node.js 22 LTS** (ou 20.19+) | Roda as ferramentas do projeto. Já vem com o **npm**. | ✅ Sim |
| **Git** | Baixar (clonar) o projeto e versionar mudanças. | Recomendado (dá para baixar ZIP sem ele) |
| **Um editor de código** — [VS Code](https://code.visualstudio.com) | Editar os arquivos. | Recomendado |
| **Um navegador moderno** — Chrome, Edge, Firefox ou Safari | Ver o site. O 3D usa WebGL. | ✅ Sim |

### 1.1 Instalar o Node.js

Escolha **uma** das opções de acordo com seu sistema.

<details>
<summary><b>macOS</b></summary>

**Opção A — instalador (mais simples):** baixe o instalador **LTS** em <https://nodejs.org> e siga o assistente.

**Opção B — Homebrew** (se você já usa):

```bash
brew install node@22
```

**Opção C — nvm** (permite trocar de versão; usado por desenvolvedores):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Feche e abra o Terminal de novo, depois:

```bash
nvm install 22
```

</details>

<details>
<summary><b>Windows</b></summary>

**Opção A — instalador:** baixe o instalador **LTS (.msi)** em <https://nodejs.org> e siga o assistente (deixe marcadas as opções padrão).

**Opção B — winget** (no PowerShell):

```powershell
winget install OpenJS.NodeJS.LTS
```

Depois de instalar, **feche e abra o terminal** de novo.

</details>

<details>
<summary><b>Linux (Ubuntu/Debian)</b></summary>

Recomendado usar o **nvm**:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Feche e abra o terminal, depois:

```bash
nvm install 22
```

</details>

**Confira se deu certo** (deve aparecer `v22.x.x` ou maior e um número de versão do npm):

```bash
node -v
```

```bash
npm -v
```

### 1.2 Instalar o Git (recomendado)

- **macOS:** rode `git --version` no Terminal. Se não estiver instalado, o macOS oferece instalar as "Command Line Tools" — aceite.
- **Windows:** baixe em <https://git-scm.com/download/win> e instale com as opções padrão. Ele instala também o **Git Bash**, um terminal que aceita os mesmos comandos deste guia.
- **Linux:** `sudo apt install git`

### 1.3 Como abrir um terminal

- **macOS:** `Cmd + Espaço` → digite **Terminal** → Enter.
- **Windows:** menu Iniciar → **PowerShell** (ou **Git Bash**).
- **Linux:** `Ctrl + Alt + T`.
- **No VS Code (qualquer sistema):** menu **Terminal → New Terminal** — já abre dentro da pasta do projeto.

---

## 2. Baixar o projeto

**Opção A — com Git (recomendado):** no terminal, vá até a pasta onde quer guardar o projeto (ex.: Área de Trabalho) e clone:

```bash
cd ~/Desktop
```

```bash
git clone https://github.com/dvdbennet/site-cientista-de-dados.git
```

```bash
cd site-cientista-de-dados
```

**Opção B — sem Git:** na página do repositório no GitHub, clique em **Code → Download ZIP**, extraia o arquivo e abra um terminal **dentro da pasta extraída** (no VS Code: **File → Open Folder…** e depois **Terminal → New Terminal**).

> Todos os comandos a partir daqui devem ser rodados **dentro da pasta do projeto** (a que tem o arquivo `package.json`).

---

## 3. Instalar as dependências

Baixa as bibliotecas (Vite, Three.js, GSAP, Lenis, fontes) para a pasta `node_modules/`. Só precisa fazer **uma vez** (ou quando o `package.json` mudar):

```bash
npm install
```

Leva cerca de 10–60 segundos. No final deve aparecer algo como `added NN packages` e `found 0 vulnerabilities`.

---

## 4. Rodar o site na sua máquina

```bash
npm run dev
```

O terminal mostra:

```
  VITE v8.x  ready in 300 ms
  ➜  Local:   http://localhost:5173/
```

O navegador abre sozinho. Se não abrir, acesse **<http://localhost:5173>**.

- Qualquer arquivo salvo atualiza a página automaticamente.
- Para **parar** o servidor: clique no terminal e aperte `Ctrl + C`.
- **Ver no celular** (mesma rede Wi-Fi): rode `npm run dev -- --host` e abra no celular o endereço que aparece em `Network:`.
- **Simular celular no computador:** no Chrome, `F12` (ou `Cmd + Option + I` no Mac) → ícone de celular (`Ctrl/Cmd + Shift + M`).

Páginas disponíveis:

| Endereço | Página |
|---|---|
| <http://localhost:5173/> | Home |
| <http://localhost:5173/cases/exemplo.html> | Modelo de página de case |
| <http://localhost:5173/obrigado.html> | Página de agradecimento (pós-formulário) |

---

## 5. Gerar a versão final (build)

Cria a pasta `dist/` com o site otimizado, pronto para publicar em qualquer hospedagem de arquivos estáticos:

```bash
npm run build
```

Para testar essa versão final localmente (em <http://localhost:4173>):

```bash
npm run preview
```

Outros comandos úteis:

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarregamento automático |
| `npm run build` | Verifica os tipos (TypeScript) e gera `dist/` |
| `npm run preview` | Serve a pasta `dist/` localmente |
| `npm run typecheck` | Só verifica erros de TypeScript |

---

## 6. Estrutura de pastas

```
site-cientista-de-dados/
├── index.html              ← Home (todo o conteúdo/textos das seções)
├── obrigado.html           ← Página pós-envio do formulário
├── cases/
│   └── exemplo.html        ← Modelo de página de case (duplique para cada case)
├── public/                 ← Arquivos copiados como estão (favicon, imagens, PDF)
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── config.ts           ← ⭐ E-mail, WhatsApp, Cal.com, redes sociais
│   ├── main.ts             ← Entrada da Home (liga hero, cases, formulário…)
│   ├── subpage.ts          ← Entrada das páginas internas
│   ├── page.ts             ← Base comum: fontes, estilos, scroll, tracking
│   ├── styles/main.css     ← Todo o visual (cores, tipografia, layout)
│   ├── scene/
│   │   ├── hero-scene.ts   ← 3D do topo (ruído → clusters → modelo)
│   │   └── signal-scene.ts ← 3D do convite final (partículas viram um ponto)
│   ├── motion/             ← Scroll suave e animações de entrada
│   ├── ui/
│   │   ├── nav.ts          ← Menu mobile, barra de progresso, link ativo
│   │   ├── quiz.ts         ← Diagnóstico rápido (3 perguntas → formato)
│   │   ├── process.ts      ← Processo contado pelo scroll
│   │   ├── constellation.ts← Constelação 3D de ferramentas
│   │   ├── cases.ts        ← Carrossel infinito de cases
│   │   ├── fx.ts           ← Cursor personalizado + inclinação dos cards
│   │   └── contact.ts …    ← Formulário, agenda, CTA fixo, contador do hero
│   └── lib/                ← Links, copiar e-mail e tracking (dataLayer/GTM)
├── docs/
│   ├── PLANO.md            ← Plano completo do projeto (estratégia, UX, roadmap)
│   └── esboco.html         ← Esboço/wireframe original (abre direto no navegador)
├── .env.example            ← Modelo das configurações opcionais
├── package.json            ← Dependências e comandos
├── vite.config.ts          ← Configuração do Vite (páginas do build)
└── tsconfig.json           ← Configuração do TypeScript
```

> As pastas `node_modules/` e `dist/` são geradas automaticamente e **não** vão para o Git.

---

## 7. Onde editar o conteúdo

| Quero mudar… | Arquivo |
|---|---|
| E-mail (recebe o formulário e todos os links de e-mail), WhatsApp, agenda, LinkedIn/GitHub/Kaggle, selo "Disponível para novos projetos" | `src/config.ts` |
| Textos, serviços, cases, preços, FAQ, depoimentos | `index.html` (procure os trechos entre `[colchetes]`) |
| Números da faixa de prova (contadores animados) | `index.html` → preencha `data-count="42"` **e** o texto `42` |
| Cores, fontes, espaçamentos | `src/styles/main.css` → bloco `:root` no topo |
| Retrato do Felipe | Coloque a foto em `public/felipe.webp` e troque o comentário dentro de `<figure class="portrait">` em `index.html` |
| Nova página de case | Duplique `cases/exemplo.html`, edite, e registre o arquivo novo em `vite.config.ts` (`build.rollupOptions.input`) |
| Partículas 3D (quantidade, cores, formas) | `src/scene/hero-scene.ts` e `src/scene/signal-scene.ts` |
| Perguntas e recomendações do diagnóstico rápido | `index.html` (seção `#diagnostico`) + textos em `src/ui/quiz.ts` |
| Ferramentas da constelação | `index.html` → lista `.stack-cloud` (a constelação é gerada a partir dela) |
| Foto pequena do topo (avatar) | Coloque `public/felipe-avatar.webp` e troque o `<span class="avatar">FF</span>` pelo `<img>` comentado ao lado |

**Regra do projeto:** nenhum número, cliente ou depoimento inventado — só dados reais. Onde ainda não há dado, o texto fica entre `[colchetes]`.

---

## 8. Formulário de contato e configurações opcionais (.env)

### 8.1 Para onde vão as mensagens do formulário

Por padrão, o formulário envia pelo **[FormSubmit](https://formsubmit.co)** (grátis, sem cadastro) direto para o e-mail definido em `src/config.ts` (atualmente **felipeffullana@gmail.com**). Depois de enviar, o visitante vai para `/obrigado.html`.

> **Ativação única (obrigatória):** no **primeiro** envio feito pelo site, o FormSubmit manda um e-mail de confirmação para esse endereço. Abra-o e clique em **"Activate Form"**. Só depois disso as mensagens começam a chegar. Enquanto não for ativado (ou se o serviço estiver fora do ar), o formulário abre o programa de e-mail do visitante já preenchido, para a mensagem não se perder.

O e-mail recebido vem com assunto "Novo contato pelo site — [nome]" e, ao clicar em **Responder**, a resposta vai direto para o visitante.

Para trocar o endereço, edite `email` em `src/config.ts` (e faça a ativação de novo para o endereço novo).

### 8.2 Configurações opcionais (.env)

Funciona sem nada configurado. Para ativar tracking ou usar outro serviço de formulário, copie o modelo:

```bash
cp .env.example .env.local
```

(no Windows PowerShell: `Copy-Item .env.example .env.local`)

E preencha em `.env.local`:

| Variável | O que faz | Onde conseguir |
|---|---|---|
| `VITE_GTM_ID` | Ativa o Google Tag Manager (GA4, pixels etc.) | <https://tagmanager.google.com> |
| `VITE_FORM_ENDPOINT` | (Opcional) Substitui o FormSubmit por outro serviço, ex.: Formspree | Crie um formulário em <https://formspree.io> e copie a URL `https://formspree.io/f/…` |

**Agenda online:** crie uma conta em <https://cal.com>, crie um evento (ex.: "Diagnóstico 30 min") e coloque `usuario/evento` em `calLink` no `src/config.ts`.

Eventos enviados ao `dataLayer`: `cta_click`, `whatsapp_click`, `email_click`, `email_copy`, `case_open`, `quiz_open`, `quiz_start`, `quiz_complete`, `quiz_cta`, `calendar_open`, `calendar_booked`, `form_submit`, `scroll_depth`, `onepager_download`, `conversion_thank_you`.

> Reinicie o `npm run dev` depois de mudar o `.env.local`.

---

## 8.3 Qualidade medida (Lighthouse)

Medido na versão de build (`npm run build && npm run preview`):

| Página | Desempenho | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|---|
| Home — celular | 97 | 100 | 100 | 100 |
| Home — desktop | 100 | 100 | 100 | 100 |
| Case — celular | 97 | 100 | 100 | 100 |

Para medir de novo (com o `npm run preview` rodando em outro terminal):

```bash
npx lighthouse http://localhost:4173 --view
```

## 9. Publicar na internet (Vercel)

1. Crie uma conta grátis em <https://vercel.com> (dá para entrar com o GitHub).
2. **Add New → Project** → escolha o repositório `site-cientista-de-dados`.
3. A Vercel detecta o Vite sozinha (Build: `npm run build`, Output: `dist`). Clique em **Deploy**.
4. (Opcional) Em **Settings → Environment Variables**, adicione `VITE_GTM_ID` e `VITE_FORM_ENDPOINT`.
5. (Opcional) Em **Settings → Domains**, conecte o domínio próprio.

A cada `git push`, a Vercel publica a nova versão automaticamente.

---

## 10. Problemas comuns

| Sintoma | Solução |
|---|---|
| `node: command not found` / `'npm' não é reconhecido` | O Node não foi instalado ou o terminal foi aberto antes da instalação. Instale (passo 1.1) e **abra um terminal novo**. |
| `Vite requires Node.js version 20.19+ or 22.12+` | Seu Node é antigo. Atualize para o 22 LTS (passo 1.1). Com nvm: `nvm install 22 && nvm use 22`. |
| `Port 5173 is in use` | Já tem outro servidor rodando. Feche o outro terminal (`Ctrl + C`) ou rode `npm run dev -- --port 5174`. |
| `npm install` falha com erro de rede/permissão | Verifique a internet. Nunca use `sudo npm install`. No Windows, rode o terminal fora de pastas protegidas (ex.: use `Documentos` ou `Área de Trabalho`). |
| Aviso `npm warn install-scripts …` no `npm install` | É só informativo (npm 11+). O projeto não depende de scripts de instalação — pode ignorar. |
| O 3D não aparece (só um degradê) | O navegador está sem WebGL. Ative "aceleração de hardware" nas configurações do navegador ou teste em outro navegador. O resto do site funciona normalmente. |
| As animações não aparecem | O sistema está com **"Reduzir movimento"** ativado (acessibilidade). Nesse modo o site mostra tudo estático de propósito. |
| Mensagens do formulário não chegam no e-mail | Faça a ativação do FormSubmit (seção 8.1) e confira a caixa de spam. |
| Mudei o `.env.local` e nada aconteceu | Pare (`Ctrl + C`) e rode `npm run dev` de novo. |
| Abri o `index.html` com dois cliques e ficou tudo quebrado | O site precisa do Vite para rodar. Use `npm run dev` (passo 4). Só o `docs/esboco.html` abre direto. |

---

Plano completo do projeto (estratégia, UX, direção de arte, roadmap): [`docs/PLANO.md`](docs/PLANO.md).
