// Capturas reales del panel 1.4.0 (con respuestas simuladas de ejemplo) para la ficha de la tienda.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'node:path';
const RAIZ = path.resolve(process.cwd(), '../../..');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
const ctx = await b.newContext({ viewport: { width: 780, height: 640 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.addInitScript(() => {
  const mem = {};
  const st = { get: async (k) => (typeof k === 'string' ? { [k]: mem[k] } : {}), set: async (o) => Object.assign(mem, o), remove: async () => {} };
  window.chrome = { storage: { local: st, session: st }, runtime: { sendMessage: async () => ({}), getURL: (x) => x, id: 'x' },
    tabs: { query: async () => [{ id: 1, url: 'https://mercadopago-pagos-seguro.top/login', title: 'Iniciar sesión', windowId: 1 }], create: () => {}, captureVisibleTab: async () => '' } };
});
await p.route('https://www.cybermobile.com.ar/api/agente/estado', (r) => r.fulfill({ json: { restantes: 3, gratis: 3, suscripto: false, pais: 'AR' } }));
await p.route('https://www.cybermobile.com.ar/api/agente/consulta', async (r) => {
  await new Promise((s) => setTimeout(s, 7000));
  r.fulfill({ json: { resultado: { nivel: 'alto', puntaje: 94, titulo: 'Es una estafa: sitio falso de Mercado Pago', modalidad: { nombre: 'Phishing de Mercado Pago', slug: 'phishing-mercadopago' },
    resumen: 'Este sitio imita a Mercado Pago para robarte la clave. No ingreses ningún dato.',
    hallazgos: [{ tipo: 'peligro', texto: 'Cloudflare bloquea este dominio: lo tiene catalogado como phishing.' }, { tipo: 'peligro', texto: 'Figura en PhishStats, la base pública de phishing.' }, { tipo: 'alerta', texto: 'El dominio se registró hace 3 días.' }],
    pasos: ['No ingreses tu usuario ni tu clave.', 'Si ya lo hiciste, cambiá la clave desde la app oficial.'], herramientas: ['cf', 'vt', 'ps', 'rd', 'tv'] }, restantes: 2 } });
});
await p.goto('file://' + RAIZ + '/extension/panel.html');
await p.waitForTimeout(1200);
await p.screenshot({ path: 'c1-inicio.png' });
await p.fill('#texto', 'https://mercadopago-pagos-seguro.top/login');
await p.click('#b-verificar');
await p.waitForTimeout(3800);
await p.screenshot({ path: 'c2-analizando.png' });
await p.waitForSelector('#vista-resultado:not([hidden])', { timeout: 15000 });
await p.waitForTimeout(900);
await p.screenshot({ path: 'c3-resultado.png' });
await b.close();
