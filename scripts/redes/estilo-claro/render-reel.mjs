import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const D = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
for (const [m, c] of [[1,'ig'],[2,'ig'],[3,'ig'],[4,'ig'],[5,'ig'],[5,'wa']]) {
  await pg.goto('file://' + D + '/plantilla.html?modo=' + m + '&canal=' + c);
  await pg.waitForSelector('html[data-listo]');
  await pg.screenshot({ path: `${D}/out/${c}-${m}.jpg`, type: 'jpeg', quality: 92 });
}
await b.close();
