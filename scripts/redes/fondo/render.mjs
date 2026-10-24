// node render.mjs <carpeta-salida>: arma fondo.jpg (1080x2340), carrusel-1..9.jpg (1080x1350) e historia.jpg (1080x1920)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { copyFileSync } from 'node:fs';
const D = new URL('.', import.meta.url).pathname, OUT = process.argv[2] || D + 'out';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
const shot = async (modo, w, h, file) => {
  const pg = await b.newPage({ viewport: { width: w, height: h } });
  await pg.goto(`file://${D}pieza.html?modo=${modo}`);
  await pg.waitForSelector('html[data-listo]');
  await pg.screenshot({ path: file, type: 'jpeg', quality: 92 });
  await pg.close();
};
await shot('fondo', 1080, 2340, D + 'fondo.jpg'); // lo usan los teléfonos del carrusel
copyFileSync(D + 'fondo.jpg', OUT + '/fondo.jpg');
for (let i = 1; i <= 9; i++) await shot(String(i), 1080, 1350, `${OUT}/carrusel-${i}.jpg`);
await shot('historia', 1080, 1920, OUT + '/historia.jpg');
await b.close();
