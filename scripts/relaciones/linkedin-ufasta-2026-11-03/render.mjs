import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const dir = '/home/user/Cyber-Mobile/scripts/relaciones/linkedin-ufasta-2026-11-03';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const pg = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
await pg.goto(`file://${dir}/placa.html`);
await pg.waitForTimeout(600);
await pg.screenshot({ path: `${dir}/placa-ufasta-ciberseguridad-personal.png`, type: 'png' });
await b.close();
console.log('ok');
