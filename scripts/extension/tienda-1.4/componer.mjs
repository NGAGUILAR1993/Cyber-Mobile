import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
const spec = [['c1',1280,800,'captura-1'],['c2',1280,800,'captura-2'],['c3',1280,800,'captura-3'],['m',440,280,'mosaico-440x280'],['q',1400,560,'marquesina-1400x560']];
const p = await b.newPage({ viewport: { width: 1400, height: 800 } });
await p.goto('file://' + process.cwd() + '/compuesto.html'); await p.waitForTimeout(500);
for (const [id,w,h,n] of spec) {
  await p.evaluate((i) => { document.querySelectorAll('.s').forEach((e) => e.classList.toggle('on', e.id === i)); }, id);
  await p.waitForTimeout(250);
  await p.locator('#' + id).screenshot({ path: 'tienda-' + n + '.jpg', type: 'jpeg', quality: 92 });
}
await b.close();
