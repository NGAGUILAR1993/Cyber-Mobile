// node frames.mjs <canal> <salida> <desde|t1,t2,..> [hasta] [modo]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const D = new URL('.', import.meta.url).pathname;
const [canal, out, from, to, modo=''] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await pg.goto('file://' + D + 'plantilla.html?canal=' + canal + (modo ? '&modo=' + modo : ''));
await pg.waitForSelector('html[data-listo]');
fs.mkdirSync(out, { recursive: true });
const shot = async (t, p) => { await pg.evaluate(async t => { render(t); await document.getElementById('im').decode().catch(()=>0); }, t); await pg.screenshot({ path: p, type: 'jpeg', quality: 90 }); };
if (from.includes(',') || to === undefined) { for (const t of from.split(',').map(Number)) await shot(t, `${out}/t${t.toFixed(2)}.jpg`); }
else for (let f = +from; f < +to; f++) await shot(f / 30, `${out}/f${String(f).padStart(4, '0')}.jpg`);
await b.close();
