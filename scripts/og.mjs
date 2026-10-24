// Gera public/og-image.png (PT) e public/og-image-en.png (EN) a partir de scripts/og-image.html
// usando o Google Chrome em modo headless.  Uso: npm run og
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const candidates = {
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'],
  win32: [
    `${process.env['PROGRAMFILES']}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env['PROGRAMFILES(X86)']}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  ],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
}[process.platform] ?? [];

const chrome = process.env.CHROME_PATH || candidates.find((p) => p && existsSync(p));
if (!chrome) {
  console.error('Google Chrome não encontrado. Instale o Chrome ou defina CHROME_PATH.');
  process.exit(1);
}

const page = pathToFileURL(resolve('scripts/og-image.html')).href;
for (const [lang, out] of [['pt', 'public/og-image.png'], ['en', 'public/og-image-en.png']]) {
  execFileSync(chrome, [
    '--headless=new', '--hide-scrollbars', '--allow-file-access-from-files',
    '--window-size=1200,630', '--virtual-time-budget=3000',
    `--screenshot=${resolve(out)}`, `${page}?lang=${lang}`,
  ], { stdio: 'ignore' });
  console.log(`✓ ${out}`);
}
