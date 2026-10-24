import { resolve } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/** Troca __SITE_URL__ no HTML pela URL pública (necessária para og:image/canonical absolutos). */
const siteUrl = (url: string): Plugin => ({
  name: 'site-url',
  transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', url.replace(/\/$/, '')),
});

const page = (path: string) => resolve(import.meta.dirname, path);

// Site multipágina: cada .html listado aqui vira uma página no build.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [siteUrl(env.VITE_SITE_URL || 'https://site-cientista-de-dados.vercel.app')],
    server: { port: 5173, open: true },
    preview: { port: 4173 },
    build: {
      target: 'es2022',
      // Three.js (~130 KB gzip) é carregado sob demanda depois do primeiro paint.
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        input: {
          home: page('index.html'),
          obrigado: page('obrigado.html'),
          caseExemplo: page('cases/exemplo.html'),
          homeEn: page('en/index.html'),
          thanksEn: page('en/thanks.html'),
        },
      },
    },
  };
});
