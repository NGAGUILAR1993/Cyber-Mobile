import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [html, canal, out, from, to] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await pg.goto('file://' + html + '?canal=' + canal + (process.env.LIMPIO?'&limpio=1':''));
await pg.waitForSelector('html[data-listo]');
fs.mkdirSync(out,{recursive:true});
if (from.includes(',')||!to) { for (const t of from.split(',').map(Number)) { await pg.evaluate(t=>render(t), t); await pg.screenshot({path:`${out}/t${t.toFixed(1)}.jpg`,type:'jpeg',quality:85}); } }
else { for (let f=+from; f<+to; f++) { await pg.evaluate(t=>render(t), f/30); await pg.screenshot({path:`${out}/f${String(f).padStart(4,'0')}.jpg`,type:'jpeg',quality:90}); } }
await b.close();
