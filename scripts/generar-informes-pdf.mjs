// Genera el PDF de cada informe mensual cerrado que todavía no tenga uno.
// Uso: node scripts/generar-informes-pdf.mjs [--forzar]
// Sirve el sitio en un puerto local, abre informe-observatorio.html?mes=AAAA-MM
// con Chromium y lo imprime en A4. Actualiza observatorio/informes/index.json.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIR = path.join(RAIZ, 'observatorio', 'informes');
const EXCLUIDOS = ['2026-08'];   // meses de puesta a punto (igual que en app.js e informe.js)
const forzar = process.argv.includes('--forzar');
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Mes actual en Argentina (AAAA-MM): solo se publican meses anteriores.
// INFORME_MES_ACTUAL permite simular otra fecha en pruebas.
const hoy = process.env.INFORME_MES_ACTUAL || new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit' }).format(new Date());
const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'observatorio', 'datos.json'), 'utf8'));
const cerrados = (datos.informes || []).map((i) => i.id).filter((id) => id < hoy && !EXCLUIDOS.includes(id)).sort();

fs.mkdirSync(DIR, { recursive: true });
const pendientes = cerrados.filter((id) => forzar || !fs.existsSync(path.join(DIR, `${id}.pdf`)));
console.log('Mes actual:', hoy, '| cerrados:', cerrados.join(', ') || '—', '| a generar:', pendientes.join(', ') || '—');

if (pendientes.length) {
    const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' };
    const server = http.createServer((req, res) => {
        const f = path.join(RAIZ, decodeURIComponent(new URL(req.url, 'http://x').pathname));
        if (!f.startsWith(RAIZ) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.statusCode = 404; return res.end(); }
        res.setHeader('Content-Type', TIPOS[path.extname(f)] || 'application/octet-stream');
        res.end(fs.readFileSync(f));
    });
    await new Promise((ok) => server.listen(0, ok));
    const puerto = server.address().port;
    const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
    try {
        for (const id of pendientes) {
            const page = await browser.newPage();
            await page.goto(`http://localhost:${puerto}/observatorio/informe-observatorio.html?mes=${id}`, { waitUntil: 'networkidle' });
            await page.waitForSelector('html[data-listo="1"]', { timeout: 20000 });
            await page.pdf({ path: path.join(DIR, `${id}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
            await page.close();
            console.log('PDF generado:', id);
        }
    } finally {
        await browser.close();
        server.close();
    }
}

// Índice que lee el Observatorio para mostrar los botones de descarga.
const indice = cerrados.filter((id) => fs.existsSync(path.join(DIR, `${id}.pdf`))).sort().reverse().map((id) => {
    const [a, m] = id.split('-');
    return { id, mes: `${MESES[parseInt(m, 10) - 1]} de ${a}`, url: `/observatorio/informes/${id}.pdf` };
});
fs.writeFileSync(path.join(DIR, 'index.json'), JSON.stringify({ informes: indice }, null, 2) + '\n');
console.log('index.json:', indice.map((i) => i.id).join(', ') || 'vacío');
