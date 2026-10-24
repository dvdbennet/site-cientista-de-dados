/** Idioma da página atual (definido pelo <html lang>) e helpers de texto/número. */
export const lang: 'pt' | 'en' = document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'pt';
export const locale = lang === 'en' ? 'en-US' : 'pt-BR';

/** Escolhe o texto do idioma atual: t('Olá', 'Hello'). */
export const t = (pt: string, en: string) => (lang === 'en' ? en : pt);

export const fmtNumber = (n: number, digits = 0) =>
  n.toLocaleString(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits });

export const fmtMoney = (n: number) =>
  n.toLocaleString(locale, { style: 'currency', currency: lang === 'en' ? 'USD' : 'BRL', maximumFractionDigits: 0 });
