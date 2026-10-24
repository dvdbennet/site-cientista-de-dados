import { lang } from './lib/i18n';

/**
 * Configuração central do site.
 * Troque os valores abaixo pelos dados reais do Felipe — todos os links,
 * botões de WhatsApp, e-mail e a agenda são preenchidos a partir daqui.
 */
export const site = {
  name: 'Felipe Fuck',
  /** Recebe o formulário e todos os botões/links de e-mail do site. */
  email: 'felipeffullana@gmail.com',
  /** Só números, com DDI + DDD. Ex.: 5511999999999 */
  whatsapp: '5561982800038',
  /** Texto do selo verde no topo (PT e EN). Ex.: 'Disponível para novos projetos em novembro'. */
  availability: { pt: 'Disponível para novos projetos', en: 'Available for new projects' },
  whatsappMessage: {
    pt: 'Olá Felipe! Vim pelo site e quero conversar sobre um projeto de dados.',
    en: 'Hi Felipe! I found your website and would like to talk about a data project.',
  },
  /** Usuário/evento do Cal.com. Ex.: 'felipefuck/diagnostico'. Vazio = mostra botão de e-mail. */
  calLink: '', // TODO: link do Cal.com
  linkedin: 'https://www.linkedin.com/', // TODO
  github: 'https://github.com/', // TODO
  kaggle: 'https://www.kaggle.com/', // TODO
  onePager: '#', // TODO: PDF de serviços em /public
} as const;

export const env = {
  gtmId: import.meta.env.VITE_GTM_ID as string | undefined,
  formEndpoint: import.meta.env.VITE_FORM_ENDPOINT as string | undefined,
};

/**
 * Para onde o formulário é enviado.
 * Padrão: FormSubmit (grátis, sem cadastro) entrega no e-mail acima.
 * Se VITE_FORM_ENDPOINT estiver definido (ex.: Formspree), ele tem prioridade.
 */
export const formEndpoint = () => env.formEndpoint || `https://formsubmit.co/ajax/${site.email}`;

export const whatsappUrl = () =>
  site.whatsapp
    ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage[lang])}`
    : `mailto:${site.email}`;
