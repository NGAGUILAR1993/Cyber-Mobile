// Arma el video de TikTok "¿Estafa o real?" (1080x1920, 26 s) con el próximo episodio de episodios.json.
//
//   node scripts/tiktok/generar.mjs                 → próximo episodio sin publicar, fecha de hoy (AR)
//   node scripts/tiktok/generar.mjs --episodio <id> --fecha AAAA-MM-DD
//
// Salida: redes/<fecha>/tiktok-<id>/ con video.mp4, portada.jpg, tiktok.txt y textos.json.
// Marca el episodio como publicado en episodios.json. Requiere Playwright (Chromium) y ffmpeg.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const DIR = path.dirname(new URL(import.meta.url).pathname);
const RAIZ = path.resolve(DIR, '..', '..');
const ARCHIVO = path.join(DIR, 'episodios.json');
// 26 s (3 más que los reels de Instagram): el dueño pidió más tiempo para leer los mensajes.
const DURACION = 26, TRANSICION = 0.8;
// Segundos relativos de cada pantalla: portada, 3 mensajes, respuestas, cierre.
const PESOS = [2.8, 4.6, 4.6, 4.2, 6.0, 3.8];
const TRANSICIONES = ['fadeblack', 'slideleft', 'slideleft', 'fadeblack', 'fadeblack'];

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());
const fecha = arg('--fecha') || hoy;
if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new Error('Fecha inválida: ' + fecha);

const episodios = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8'));
const pedido = arg('--episodio');
const ep = pedido ? episodios.find((e) => e.id === pedido) : episodios.find((e) => !e.publicado);
if (!ep) throw new Error(pedido ? 'No existe el episodio ' + pedido : 'No quedan episodios sin publicar: agregá nuevos en episodios.json');
if (ep.mensajes.length !== 3 || ep.respuestas.length !== 3 || ep.respuestas.filter((r) => r.real).length !== 1) {
    throw new Error(`Episodio ${ep.id}: tiene que tener 3 mensajes y 3 respuestas, con una sola real`);
}

const salida = path.join(RAIZ, 'redes', fecha, 'tiktok-' + ep.id);
fs.mkdirSync(salida, { recursive: true });
const tmp = fs.mkdtempSync(path.join(salida, '.tmp-'));

let chromium;
try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs')); }
const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined),
    args: ['--allow-file-access-from-files']
});
const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await pg.goto(pathToFileURL(path.join(DIR, 'plantilla.html')).href);
const modos = ['portada', 'm0', 'm1', 'm2', 'respuestas', 'cierre'];
const imagenes = [];
for (const modo of modos) {
    await pg.evaluate(([m, e]) => window.pintar(m, e), [modo, ep]);
    await pg.waitForSelector('html[data-listo]');
    const f = path.join(tmp, modo + '.jpg');
    await pg.screenshot({ path: f, type: 'jpeg', quality: 92 });
    imagenes.push(f);
}
await browser.close();

// Video: zoom lento en cada pantalla y fundidos de 0,8 s; dura exactamente DURACION segundos.
const k = (DURACION + TRANSICION * (imagenes.length - 1)) / PESOS.reduce((a, b) => a + b, 0);
const dur = PESOS.map((p) => Math.round(p * k * 100) / 100);
let filtro = '';
dur.forEach((t, i) => {
    filtro += `[${i}:v]scale=1080:1920,zoompan=z='min(1+0.0004*on,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(t * 30)}:s=1080x1920:fps=30,format=yuv420p,setsar=1[v${i}];`;
});
let prev = 'v0', fin = dur[0];
for (let i = 1; i < dur.length; i++) {
    const nom = i === dur.length - 1 ? 'out' : 'a' + i;
    filtro += `[${prev}][v${i}]xfade=transition=${TRANSICIONES[i - 1]}:duration=${TRANSICION}:offset=${(fin - TRANSICION).toFixed(2)}[${nom}];`;
    fin += dur[i] - TRANSICION; prev = nom;
}
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...imagenes.flatMap((f) => ['-i', f]),
    '-f', 'lavfi', '-t', String(DURACION), '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-filter_complex', filtro.slice(0, -1), '-map', '[out]', '-map', `${imagenes.length}:a`, '-t', String(DURACION),
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '128k',
    '-movflags', '+faststart', '-crf', '21', path.join(salida, 'video.mp4')]);
fs.copyFileSync(imagenes[0], path.join(salida, 'portada.jpg'));
fs.rmSync(tmp, { recursive: true, force: true });

const descripcion = `${ep.descripcion}\n\nSi te llega algo raro, mandáselo a Vera por WhatsApp: en segundos te dice si es estafa 🔴🟡🟢\nProbala 7 días gratis: link en el perfil.\n\n${ep.hashtags}`;
const comentario = '¿Cuántas acertaste? 1, 2 o las 3 👇 Si te llegó uno parecido, contalo y te decimos qué hacer.';
fs.writeFileSync(path.join(salida, 'tiktok.txt'), `TÍTULO (máx. 150)\n${ep.titulo}\n\nDESCRIPCIÓN\n${descripcion}\n\nCOMENTARIO PARA FIJAR\n${comentario}\n`);
const web = `https://www.cybermobile.com.ar/redes/${fecha}/tiktok-${ep.id}/`;
fs.writeFileSync(path.join(salida, 'textos.json'), JSON.stringify({
    fecha, formato: `TikTok 1080x1920, ${DURACION} s`, serie: '¿Estafa o real?', episodio: ep.id, horario: '20:00',
    titulo: ep.titulo, descripcion, comentario,
    video: web + 'video.mp4', portada: web + 'portada.jpg',
    nota: 'Mensajes recreados: números tapados, sin datos de personas reales.'
}, null, 2) + '\n');

ep.publicado = fecha;
fs.writeFileSync(ARCHIVO, JSON.stringify(episodios, null, 2) + '\n');
console.log(`TikTok listo: ${path.relative(RAIZ, salida)} (quedan ${episodios.filter((e) => !e.publicado).length} episodios sin usar)`);
