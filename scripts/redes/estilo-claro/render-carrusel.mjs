import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const D = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
const piezas = [['portada','c','carrusel-1'],['0','c','carrusel-2'],['1','c','carrusel-3'],['2','c','carrusel-4'],['3','c','carrusel-5'],['4','c','carrusel-6'],['final','c','carrusel-7'],['historia','h','historia']];
for (const [m, f, n] of piezas) {
  const pg = await b.newPage({ viewport: { width: 1080, height: f === 'c' ? 1350 : 1920 } });
  await pg.goto(`file://${D}/plantilla.html?modo=${m}&fmt=${f}`);
  await pg.waitForSelector('html[data-listo]');
  await pg.screenshot({ path: `${D}/out/${n}.jpg`, type: 'jpeg', quality: 92 });
  await pg.close();
}
await b.close();
