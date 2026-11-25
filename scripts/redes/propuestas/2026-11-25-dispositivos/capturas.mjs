// Capturas de la UI REAL de Vera (web /agente y extensión de Chrome) con respuestas de ejemplo (recreación),
// para las pantallas del reel "Vera en todos tus dispositivos". Se sirve el repo desde disco con page.route.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
const RAIZ = '/home/user/cm-redes';
const OUT = path.join(RAIZ, 'scripts/redes/propuestas/2026-11-25-dispositivos/pantallas');
fs.mkdirSync(OUT, { recursive: true });
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.ttf': 'font/ttf', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webmanifest': 'application/json' };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });

// ---------- 1) Web /agente (computadora del comercio) ----------
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR web', e.message));
  await p.route('http://cm.local/**', (r) => {
    const u = new URL(r.request().url());
    let f = path.join(RAIZ, decodeURIComponent(u.pathname));
    if (f.endsWith('/')) f += 'index.html';
    if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' });
    r.fulfill({ body: fs.readFileSync(f), contentType: TIPOS[path.extname(f)] || 'application/octet-stream' });
  });
  await p.route('http://cm.local/api/agente/estado', (r) => r.fulfill({ json: { configurado: true, gratis: 3, restantes: 3, vinculado: true, telefono: '+54 9 •• ••••-••12', suscripto: true } }));
  await p.route('http://cm.local/api/agente/consulta', async (r) => {
    await new Promise((s) => setTimeout(s, 3500));
    r.fulfill({ json: { modo: 'suscripcion', resultado: {
      nivel: 'alto', puntaje: 93, titulo: 'Estafa: comprobante falso y pedido de devolución',
      resumen: 'Te "pagan de más" con un comprobante armado y te piden que devuelvas la diferencia a otra cuenta. La plata nunca entró.',
      hallazgos: [
        { tipo: 'peligro', texto: 'La cuenta para la devolución no es la misma que figura en el comprobante.' },
        { tipo: 'peligro', texto: 'Pide devolver un excedente con apuro: patrón de estafa a comercios.' },
        { tipo: 'alerta', texto: 'El comprobante es una imagen: no prueba que el dinero haya llegado.' }
      ],
      pasos: ['Antes de entregar o devolver nada, mirá tu home banking: ¿entró la plata?', 'No transfieras a otra cuenta. Si el pago es real, se revierte por el mismo medio.']
    } } });
  });
  await p.goto('http://cm.local/agente/index.html');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(OUT, 'web-portada.png') });
  await p.fill('#entrada', 'Un cliente me mandó este comprobante de $78.000 por una compra de $30.000. Me pide que le devuelva los $48.000 de más a este CBU: 0110 •••• •••• •••• ••4471');
  await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(OUT, 'web-escrito.png') });
  const bA = await p.evaluate(() => { const r = document.querySelector('#analizar').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.click('#analizar');
  await p.waitForTimeout(2200);
  await p.screenshot({ path: path.join(OUT, 'web-analizando.png') });
  await p.waitForSelector('.veredicto', { timeout: 20000 });
  await p.waitForTimeout(900);
  await p.evaluate(() => { const m = document.querySelector('#mensajes'); m.scrollTop = 0; });
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(OUT, 'web-resultado-arriba.png') });
  await p.evaluate(() => { const v = document.querySelector('.veredicto'); v.scrollIntoView({ block: 'start' }); });
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(OUT, 'web-resultado.png') });
  const bV = await p.evaluate(() => { const r = document.querySelector('.veredicto').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  fs.writeFileSync(path.join(OUT, 'web-cajas.json'), JSON.stringify({ viewport: [1440, 900], analizar: bA, veredicto: bV }));
  await p.evaluate(() => { document.querySelector('#mensajes').scrollTop = 0; });
  await p.waitForTimeout(300);
  const clip = await p.evaluate(() => { const a = [...document.querySelectorAll('.msg.yo')].pop().getBoundingClientRect(), v = document.querySelector('.veredicto').getBoundingClientRect();
    const x = v.left - 20, y = v.top - 20; return { x, y, width: v.width + 40, height: v.height + 40 }; });
  await p.screenshot({ path: path.join(OUT, 'web-zoom.png'), clip });
  await ctx.close();
}

// ---------- 2) Extensión de Chrome (notebook de la hija) ----------
{
  const ctx = await b.newContext({ viewport: { width: 780, height: 640 }, deviceScaleFactor: 3 });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR ext', e.message));
  await p.addInitScript(() => {
    const mem = {};
    const st = { get: async (k) => (typeof k === 'string' ? { [k]: mem[k] } : {}), set: async (o) => Object.assign(mem, o), remove: async () => {} };
    window.chrome = { storage: { local: st, session: st }, runtime: { sendMessage: async () => ({}), getURL: (x) => x, id: 'x' },
      tabs: { query: async () => [{ id: 1, url: 'https://drive-apuntes-compartidos.site/descarga', title: 'Descarga', windowId: 1 }], create: () => {}, captureVisibleTab: async () => '' } };
  });
  await p.route('https://www.cybermobile.com.ar/api/agente/estado', (r) => r.fulfill({ json: { restantes: 99, gratis: 3, suscripto: true, pais: 'AR' } }));
  await p.route('https://www.cybermobile.com.ar/api/agente/consulta', async (r) => {
    await new Promise((s) => setTimeout(s, 6000));
    r.fulfill({ json: { resultado: { nivel: 'alto', puntaje: 96, titulo: 'No lo abras: el .zip trae un programa espía',

      resumen: 'Adentro no hay apuntes: hay un ejecutable escondido que roba contraseñas y sesiones del navegador.',
      hallazgos: [{ tipo: 'peligro', texto: 'Adentro hay "apuntes_final.pdf.exe": un programa disfrazado de PDF.' }, { tipo: 'peligro', texto: 'Motores antivirus lo marcan como troyano que roba contraseñas.' }, { tipo: 'alerta', texto: 'Lo bajaste de un sitio creado hace 5 días.' }],
      pasos: ['No lo abras y borralo de Descargas.', 'Si ya lo abriste, cambiá tus claves desde otro dispositivo.'], herramientas: ['ga', 'vt', 'rd', 'tv'] }, restantes: 99 } });
  });
  await p.goto('file://' + RAIZ + '/extension/panel.html');
  await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(OUT, 'ext-inicio.png') });
  const bS = await p.evaluate(() => { const e = document.querySelector('label[for=archivo]'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  fs.writeFileSync(path.join(OUT, 'ext-cajas.json'), JSON.stringify({ viewport: [780, 640], subir: bS }));
  await p.setInputFiles('#archivo', { name: 'apuntes_final.zip', mimeType: 'application/zip', buffer: Buffer.from('PK\u0003\u0004 recreacion') });
  await p.waitForTimeout(2600);
  await p.screenshot({ path: path.join(OUT, 'ext-analizando.png') });
  await p.waitForSelector('#vista-resultado:not([hidden])', { timeout: 20000 });
  await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(OUT, 'ext-resultado.png') });
  await ctx.close();
}
await b.close();
console.log('ok');
