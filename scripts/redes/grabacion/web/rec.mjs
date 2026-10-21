// node rec.mjs <dia> <canal ig|wa|tt> <salida> [tiempos de prueba separados por coma]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const [dia, canal, out, prueba, desde] = process.argv.slice(2); const D0 = +(desde || 0), D1 = +(process.argv[7] || 1e9);
const B = dia === '3' ? 30 : 23, T = 30, K = B / T, N = T * 30;
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--ignore-certificate-errors', '--proxy-server=' + process.env.HTTPS_PROXY, '--proxy-bypass-list=127.0.0.1;localhost', '--hide-scrollbars'] });
const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
let soltar; const espera = new Promise(r => soltar = r);
const VEREDICTO = { modo: 'gratis', restantes: 1, resultado: {
  nivel: 'alto', puntaje: 92, titulo: 'Link falso que imita a PAMI',
  resumen: 'El sitio no es el oficial de PAMI y te pide tus datos para robarlos.',
  hallazgos: [ { tipo: 'peligro', texto: 'pami-actualiza-datos.xyz no es un sitio oficial de PAMI' }, { tipo: 'peligro', texto: 'Te pide iniciar sesión con tus datos' }, { tipo: 'alerta', texto: 'Dominio .xyz, muy usado en campañas falsas' } ],
  pasos: ['No abras el link ni cargues datos.', 'Si ya los cargaste, cambiá tu clave.', 'Avisale a tu familia.'],
  modalidad: { nombre: 'Phishing de PAMI', slug: 'phishing-pami' } } };
await ctx.route('**/api/**', async (route) => {
  const u = route.request().url();
  if (u.includes('/api/agente/estado')) return route.fulfill({ json: { configurado: true, gratis: 2, restantes: 2, vinculado: false, suscripto: false } });
  if (u.includes('/api/agente/consulta')) { await espera; return route.fulfill({ json: VEREDICTO }); }
  return route.fulfill({ status: 204, body: '' });
});
await ctx.clock.install({ time: new Date('2026-10-20T20:14:00-03:00') });
const pg = await ctx.newPage();
await pg.exposeFunction('__soltarN', () => soltar());
await pg.addInitScript(() => { window.__soltar = () => window.__soltarN && window.__soltarN(); });
await pg.goto(`http://127.0.0.1:8099/comp/comp.html?dia=${dia}&canal=${canal}`);
for (let i = 0; i < 200; i++) { await ctx.clock.runFor(100); if (await pg.evaluate(() => !!document.documentElement.dataset.listo)) break; await pg.waitForTimeout(100); }
await ctx.clock.runFor(1500); await pg.waitForTimeout(1500);
const tiempos = prueba ? prueba.split(',').map(Number) : null;
const dt = 1000 / 30 * K;
for (let f = 0; f < Math.min(N, D1 + 1); f++) {
  const vt = f / 30 * K;
  await pg.evaluate((t) => { eventos(t); render(t); }, vt);
  await ctx.clock.runFor(dt);
  await pg.waitForTimeout(tiempos ? 90 : 25);
  await pg.evaluate((t) => render(t), vt);
  if (tiempos) { const hit = tiempos.find(x => Math.abs(x - vt) < dt / 2000); if (hit !== undefined) await pg.screenshot({ path: `${out}/t${hit.toFixed(2)}.jpg`, type: 'jpeg', quality: 80 }); if (vt > Math.max(...tiempos)) break; }
  else if (f >= D0 && f <= D1) await pg.screenshot({ path: `${out}/f${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 88 });
}
await b.close();
