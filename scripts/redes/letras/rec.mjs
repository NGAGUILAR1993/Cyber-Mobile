// node rec.mjs <pieza.html absoluta (puede llevar ?wa=1 o ?historia=1)> <salida> <desde> <hasta>  (cuadros a 30 fps) | pruebas: <html> <salida> 0.5,3,10
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [html, out, from, to] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await pg.goto('file://' + html);
await pg.waitForSelector('html[data-listo]', { state: 'attached' });
fs.mkdirSync(out, { recursive: true });
const shot = async (t, p) => { await pg.evaluate(t => render(t), t); await pg.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => 0)))); await pg.screenshot({ path: p, type: 'jpeg', quality: 88 }); };
if (from.includes(',') || !to) { for (const t of from.split(',').map(Number)) await shot(t, `${out}/t${t.toFixed(1)}.jpg`); }
else for (let f = +from; f < +to; f++) await shot(f / 30, `${out}/f${String(f).padStart(4, '0')}.jpg`);
await b.close();
