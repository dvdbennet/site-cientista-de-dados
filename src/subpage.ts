/** Entrada das páginas internas (cases, obrigado). */
import { initPage, initRevealsWhenReady } from './page';
import { introHero } from './motion/reveals';
import { track } from './lib/track';

initPage();
introHero();
void initRevealsWhenReady();

if (document.body.dataset.page === 'obrigado') track('conversion_thank_you');
