// Alerta semanal de los lunes: ficha del #1 del ranking del Observatorio (imagen 1080x1080) y su texto
// para WhatsApp. n8n la lee de redes/alerta-semanal/textos.json y la envía los lunes a las 12.
// Uso: node scripts/alerta-semanal/generar.mjs [--fecha AAAA-MM-DD]
// Requiere Playwright (Chromium).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const SITIO = 'https://www.cybermobile.com.ar';

const arg = process.argv.indexOf('--fecha');
const hoyAR = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const fecha = arg > -1 ? process.argv[arg + 1] : hoyAR;
if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new Error('Fecha inválida: ' + fecha);

const CANAL = {
    WHATSAPP: { lbl: 'WhatsApp', frase: 'por WhatsApp', pasos: ['No respondas ni abras el link.', 'Bloqueá y reportá el número.', 'Si ya diste datos, llamá a tu banco.'] },
    REDES: { lbl: 'Redes', frase: 'en redes sociales', pasos: ['No transfieras dinero ni hagas clic.', 'Reportá el perfil o la publicación.', 'Si ya pagaste, llamá a tu banco.'] },
    TELEFONO: { lbl: 'Teléfono', frase: 'por teléfono', pasos: ['Cortá la llamada.', 'No instales apps ni compartas pantalla.', 'Si ya diste datos, llamá a tu banco.'] },
    SMS: { lbl: 'SMS', frase: 'por SMS', pasos: ['No abras el link del mensaje.', 'Bloqueá el número y borrá el SMS.', 'Si ya diste datos, llamá a tu banco.'] },
    MAIL: { lbl: 'Email', frase: 'por correo', pasos: ['No abras links ni adjuntos.', 'Marcalo como correo no deseado.', 'Si ya diste datos, llamá a tu banco.'] },
    MARKETPLACE: { lbl: 'Marketplace', frase: 'en marketplaces', pasos: ['No pagues por fuera de la plataforma.', 'Reportá la publicación.', 'Si ya pagaste, llamá a tu banco.'] }
};
CANAL['TELÉFONO'] = CANAL.TELEFONO;
const canalDe = (c) => CANAL[String(c || '').toUpperCase()] || { lbl: String(c || ''), frase: '', pasos: ['No respondas ni abras links.', 'Bloqueá el contacto.', 'Si ya diste datos, llamá a tu banco.'] };
const TILDES = [[/\binversion\b/gi, 'inversión'], [/\bSextorsion\b/g, 'Sextorsión'], [/\bsextorsion\b/g, 'sextorsión'],
    [/\bsuplantacion\b/g, 'suplantación'], [/\bSuplantacion\b/g, 'Suplantación'], [/\bprestamo\b/g, 'préstamo'], [/\bPrestamo\b/g, 'Préstamo'],
    [/\bromantico\b/g, 'romántico'], [/\btelefono\b/g, 'teléfono'], [/\bTelefono\b/g, 'Teléfono']];
const tildes = (t) => TILDES.reduce((s, [re, r]) => s.replace(re, r), String(t || ''));
const slugDe = (k) => String(k || '').split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const escHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const CLAVES = JSON.parse(fs.readFileSync(path.join(RAIZ, 'scripts', 'redes', 'claves.json'), 'utf8'));

function claveDe(detectar) {
    const t = tildes(detectar).replace(/\s+/g, ' ').trim();
    if (t.length <= 170) return t;
    const primera = t.split(/(?<=\.)\s/)[0];
    if (primera.length <= 190) return primera;
    return t.slice(0, t.lastIndexOf(' ', 180)) + '…';
}

// ---------- El #1 del ranking del mes ----------
const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'observatorio', 'datos.json'), 'utf8'));
const mes = (datos.meta && datos.meta.mes) || '';
const x = (datos.top10 || []).find((t) => Number(t.pos) === 1) || (datos.top10 || [])[0];
if (!x) throw new Error('datos.json no tiene ranking');
const c0 = canalDe(x.canal);
const nombre = tildes(x.nombre);
const c = norm(nombre).includes(norm(c0.lbl)) ? { ...c0, frase: '' } : c0;
const m = {
    pos: 1, seccion: 'top', nombre, slug: slugDe(x.key), canal: c.lbl, frase: c.frase, pasos: c.pasos,
    indice: Math.max(0, Math.min(100, Number(x.act) || 0)), riesgo: String(x.riesgo || 'medio').toUpperCase(),
    detectar: tildes(x.detectar), como: tildes(x.como),
    clave: CLAVES[String(x.key || '').split('@')[0]] || claveDe(x.detectar),
    etiqueta: 'ALERTA · #1 DEL RANKING',
    tituloHtml: `${escHtml(nombre)}${c.frase ? `<br><em>${escHtml(c.frase)}</em>` : ''}`,
    tituloCorto: nombre
};

const salida = path.join(RAIZ, 'redes', 'alerta-semanal');
fs.rmSync(salida, { recursive: true, force: true });
fs.mkdirSync(salida, { recursive: true });

// ---------- Imagen ----------
const plantilla = pathToFileURL(path.join(RAIZ, 'scripts', 'alerta-semanal', 'plantilla.html')).href;
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
    await page.goto(`${plantilla}?modo=ficha-wa&datos=${encodeURIComponent(JSON.stringify({ mes, ficha: m }))}`);
    await page.waitForSelector('html[data-listo]', { timeout: 20000 });
    if (await page.getAttribute('html', 'data-listo') !== '1') console.warn('Aviso: la ficha quedó con el texto ajustado al mínimo.');
    await page.screenshot({ path: path.join(salida, 'whatsapp.jpg'), type: 'jpeg', quality: 90 });
} finally {
    await browser.close();
}

// ---------- Texto (WhatsApp corta el texto de una imagen en 1024 caracteres; n8n lo acorta si hace falta) ----------
const pasos = m.pasos.map((p, i) => `${['1️⃣', '2️⃣', '3️⃣'][i]} ${p}`).join('\n');
const whatsapp = `🚨 *ALERTA: ${nombre}${c.frase ? ' ' + c.frase : ''}*\n_#1 del ranking del Observatorio de Fraude Digital${mes ? ' · ' + mes : ''}_\n\n`
    + `${m.como.replace(/\s+/g, ' ').trim()}\n\n`
    + `✅ *Cómo reconocerla:* ${m.clave}\n\n`
    + `*Si te llegó:*\n${pasos}\n\n`
    + `📲 *¿Te llegó algo así? Verificalo con nuestro agente:*\n${SITIO}/vera?o=alerta\n\n`
    + `📊 *Conocé y compartí el ranking del mes:*\n${SITIO}/observatorio\n\n`
    + `Reenviá este mensaje a tu familia 🙏`;

const textos = {
    fecha, tipo: 'alerta-semanal', mes, slug: m.slug, nombre, titulo: `#1 del ranking: ${nombre}`,
    whatsapp, ficha: `${SITIO}/observatorio/${m.slug}`,
    archivos: [{ nombre: 'whatsapp.jpg', url: `${SITIO}/redes/alerta-semanal/whatsapp.jpg?v=${fecha}` }]
};
fs.writeFileSync(path.join(salida, 'textos.json'), JSON.stringify(textos, null, 2) + '\n');
console.log(`${fecha} · alerta semanal · #1 ${nombre} · ${whatsapp.length} caracteres`);
