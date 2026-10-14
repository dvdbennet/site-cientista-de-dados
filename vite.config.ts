import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Site multipágina: cada .html listado aqui vira uma página no build.
export default defineConfig({
  server: { port: 5173, open: true },
  preview: { port: 4173 },
  build: {
    target: 'es2022',
    // Three.js (~130 KB gzip) é carregado sob demanda depois do primeiro paint.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        obrigado: resolve(import.meta.dirname, 'obrigado.html'),
        caseExemplo: resolve(import.meta.dirname, 'cases/exemplo.html'),
      },
    },
  },
});
