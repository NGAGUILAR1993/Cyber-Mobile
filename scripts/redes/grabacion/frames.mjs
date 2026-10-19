import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [D, canal, out, from, to, step] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await pg.goto('file://' + D + '/plantilla.html?canal=' + canal);
await pg.waitForSelector('html[data-listo]');
const fs = await import('fs'); fs.mkdirSync(out,{recursive:true});
const times = from.includes(',') ? from.split(',').map(Number) : null;
if (times) { for (const t of times) { await pg.evaluate(t=>render(t), t); await pg.screenshot({path:`${out}/t${t.toFixed(2)}.jpg`,type:'jpeg',quality:88}); } }
else { for (let f=+from; f<+to; f++) { await pg.evaluate(t=>render(t), f/30); await pg.screenshot({path:`${out}/f${String(f).padStart(4,'0')}.jpg`,type:'jpeg',quality:90}); } }
await b.close();
