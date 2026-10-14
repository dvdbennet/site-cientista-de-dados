/**
 * Configuração central do site.
 * Troque os valores abaixo pelos dados reais do Felipe — todos os links,
 * botões de WhatsApp, e-mail e a agenda são preenchidos a partir daqui.
 */
export const site = {
  name: 'Felipe Fuck',
  email: 'contato@felipefuck.com', // TODO: e-mail real
  /** Só números, com DDI + DDD. Ex.: 5511999999999 */
  whatsapp: '', // TODO: número real
  whatsappMessage: 'Olá Felipe! Vim pelo site e quero conversar sobre um projeto de dados.',
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

export const whatsappUrl = () =>
  site.whatsapp
    ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`
    : `mailto:${site.email}`;
