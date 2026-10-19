// node placa.mjs <img url relativa a /comp/> <html> <salida.jpg>
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [img, html, out] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--proxy-bypass-list=127.0.0.1'] });
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await pg.goto(`http://127.0.0.1:8099/comp/placa.html?img=/comp/${img}&html=${encodeURIComponent(encodeURIComponent(html))}`);
await pg.waitForSelector('html[data-listo]');
await pg.screenshot({ path: out, type: 'jpeg', quality: 90 });
await b.close();
