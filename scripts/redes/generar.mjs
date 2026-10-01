// Genera la publicación diaria para redes a partir de observatorio/datos.json.
//   Lunes: reel con el Top 3 (5 pantallas + video MP4 sin voz).
//   Martes a domingo: ficha de una estafa (Instagram 1080x1350 y WhatsApp 1080x1080),
//   rotando por el Top 10 y las modalidades en vigilancia.
// Salida: redes/AAAA-MM-DD/ con las imágenes, el video y textos.json (textos listos para copiar).
// Uso: node scripts/redes/generar.mjs [--fecha AAAA-MM-DD]
// Requiere Playwright (Chromium) y ffmpeg.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const SITIO = 'https://www.cybermobile.com.ar';
const WA_AGENTE = '5491170598505';
const INICIO_ROTACION = '2026-10-01';
const DIAS_QUE_SE_CONSERVAN = 30;

const arg = process.argv.indexOf('--fecha');
const hoyAR = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const fecha = arg > -1 ? process.argv[arg + 1] : hoyAR;
if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new Error('Fecha inválida: ' + fecha);

const CANAL = {
    WHATSAPP: { lbl: 'WhatsApp', frase: 'por WhatsApp', tag: '#EstafasWhatsApp', pasos: ['No respondas ni abras el link.', 'Bloqueá y reportá el número.', 'Si ya diste datos, llamá a tu banco.'] },
    REDES: { lbl: 'Redes', frase: 'en redes sociales', tag: '#EstafasEnRedes', pasos: ['No transfieras dinero ni hagas clic.', 'Reportá el perfil o la publicación.', 'Si ya pagaste, llamá a tu banco.'] },
    TELEFONO: { lbl: 'Teléfono', frase: 'por teléfono', tag: '#EstafaTelefonica', pasos: ['Cortá la llamada.', 'No instales apps ni compartas pantalla.', 'Si ya diste datos, llamá a tu banco.'] },
    SMS: { lbl: 'SMS', frase: 'por SMS', tag: '#Smishing', pasos: ['No abras el link del mensaje.', 'Bloqueá el número y borrá el SMS.', 'Si ya diste datos, llamá a tu banco.'] },
    MAIL: { lbl: 'Email', frase: 'por correo', tag: '#Phishing', pasos: ['No abras links ni adjuntos.', 'Marcalo como correo no deseado.', 'Si ya diste datos, llamá a tu banco.'] },
    MARKETPLACE: { lbl: 'Marketplace', frase: 'en marketplaces', tag: '#EstafasOnline', pasos: ['No pagues por fuera de la plataforma.', 'Reportá la publicación.', 'Si ya pagaste, llamá a tu banco.'] }
};
CANAL['TELÉFONO'] = CANAL.TELEFONO;
const canalDe = (c) => CANAL[String(c || '').toUpperCase()] || { lbl: String(c || ''), frase: '', tag: '#Estafas', pasos: ['No respondas ni abras links.', 'Bloqueá el contacto.', 'Si ya diste datos, llamá a tu banco.'] };

const TILDES = [[/\binversion\b/gi, 'inversión'], [/\bSextorsion\b/g, 'Sextorsión'], [/\bsextorsion\b/g, 'sextorsión'],
    [/\bsuplantacion\b/g, 'suplantación'], [/\bSuplantacion\b/g, 'Suplantación'], [/\bprestamo\b/g, 'préstamo'], [/\bPrestamo\b/g, 'Préstamo'],
    [/\bromantico\b/g, 'romántico'], [/\btelefono\b/g, 'teléfono'], [/\bTelefono\b/g, 'Teléfono']];
const tildes = (t) => TILDES.reduce((s, [re, r]) => s.replace(re, r), String(t || ''));
const slugDe = (k) => String(k || '').split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const escHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Frases cortas curadas por clave (scripts/redes/claves.json); si no hay, se usa el texto del Observatorio.
const CLAVES = JSON.parse(fs.readFileSync(path.join(RAIZ, 'scripts', 'redes', 'claves.json'), 'utf8'));
const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Frase corta para la tarjeta: la primera oración de "cómo reconocerla" si el texto completo es largo.
function claveDe(detectar) {
    const t = tildes(detectar).replace(/\s+/g, ' ').trim();
    if (t.length <= 170) return t;
    const primera = t.split(/(?<=\.)\s/)[0];
    if (primera.length <= 190) return primera;
    return t.slice(0, t.lastIndexOf(' ', 180)) + '…';
}

function modalidad(x, seccion) {
    const c0 = canalDe(x.canal);
    const nombre = tildes(x.nombre);
    // Evita "por teléfono por teléfono" o "de WhatsApp por WhatsApp".
    const c = norm(nombre).includes(norm(c0.lbl)) ? { ...c0, frase: '' } : c0;
    const clave = CLAVES[String(x.key || '').split('@')[0]] || claveDe(x.detectar);
    return {
        pos: x.pos, seccion, nombre, slug: slugDe(x.key),
        canal: c.lbl, frase: c.frase, tag: c.tag, pasos: c.pasos,
        indice: Math.max(0, Math.min(100, Number(x.act) || 0)),
        riesgo: String(x.riesgo || 'medio').toUpperCase(),
        detectar: tildes(x.detectar), como: tildes(x.como), clave,
        etiqueta: seccion === 'top' ? `ALERTA · #${x.pos} DEL RANKING` : 'ALERTA · EN VIGILANCIA',
        tituloHtml: `${escHtml(nombre)}${c.frase ? `<br><em>${escHtml(c.frase)}</em>` : ''}`,
        tituloCorto: nombre
    };
}

// ---------- Datos y elección del contenido del día ----------
const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'observatorio', 'datos.json'), 'utf8'));
const mes = (datos.meta && datos.meta.mes) || '';
const lista = [...(datos.top10 || []).map((x) => modalidad(x, 'top')), ...(datos.watch || []).map((x) => modalidad(x, 'watch'))]
    .filter((m, i, a) => m.slug && a.findIndex((o) => o.slug === m.slug) === i);
if (!lista.length) throw new Error('datos.json no tiene modalidades');

const diaSemana = new Date(fecha + 'T12:00:00Z').getUTCDay();   // 1 = lunes
const tipo = diaSemana === 1 ? 'reel' : 'ficha';
let elegida = null;
if (tipo === 'ficha') {
    // Cuenta los días que no son lunes desde el inicio: cada día toca la siguiente modalidad.
    let n = 0;
    for (let d = new Date(INICIO_ROTACION + 'T12:00:00Z'); d.toISOString().slice(0, 10) < fecha; d.setUTCDate(d.getUTCDate() + 1)) {
        if (d.getUTCDay() !== 1) n++;
    }
    elegida = lista[((n % lista.length) + lista.length) % lista.length];
}

const salida = path.join(RAIZ, 'redes', fecha);
fs.rmSync(salida, { recursive: true, force: true });
fs.mkdirSync(salida, { recursive: true });

// ---------- Imágenes ----------
const plantilla = pathToFileURL(path.join(RAIZ, 'scripts', 'redes', 'plantilla.html')).href;
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
async function captura(modo, datosPagina, archivo, alto) {
    const page = await browser.newPage({ viewport: { width: 1080, height: alto } });
    await page.goto(`${plantilla}?modo=${modo}&datos=${encodeURIComponent(JSON.stringify(datosPagina))}`);
    await page.waitForSelector('html[data-listo]', { timeout: 20000 });
    const estado = await page.getAttribute('html', 'data-listo');
    if (estado !== '1') console.warn(`Aviso: ${archivo} quedó con texto ajustado al mínimo (${estado}).`);
    await page.screenshot({ path: path.join(salida, archivo), type: 'jpeg', quality: 90 });
    await page.close();
    return archivo;
}

const archivos = [];
try {
    if (tipo === 'ficha') {
        archivos.push(await captura('ficha-ig', { mes, ficha: elegida }, 'instagram.jpg', 1350));
        archivos.push(await captura('ficha-wa', { mes, ficha: elegida }, 'whatsapp.jpg', 1080));
    } else {
        const top = lista.filter((m) => m.seccion === 'top').slice(0, 3);
        const d = { mes, top, gancho: `La #1 llega ${top[0].frase || 'por mensaje'}.` };
        for (let i = 0; i < 5; i++) archivos.push(await captura(`reel-${i}`, d, `pantalla-${i + 1}.jpg`, 1920));
    }
} finally {
    await browser.close();
}

// ---------- Video del reel (sin voz; la música se agrega en Instagram) ----------
if (tipo === 'reel') {
    // ~20 s en total: los reels cortos se miran completos y se repiten (más alcance).
    const dur = [2.5, 5, 5, 5.5, 3.5], tr = 0.4;
    const ent = dur.flatMap((t, i) => ['-framerate', '30', '-loop', '1', '-t', String(t), '-i', path.join(salida, `pantalla-${i + 1}.jpg`)]);
    let filtro = dur.map((_, i) => `[${i}:v]format=yuv420p,setsar=1[v${i}];`).join('');
    let previo = 'v0', fin = dur[0];
    for (let i = 1; i < dur.length; i++) {
        const nombre = i === dur.length - 1 ? 'out' : `a${i}`;
        filtro += `[${previo}][v${i}]xfade=transition=${i === dur.length - 1 ? 'fade' : 'slideleft'}:duration=${tr}:offset=${(fin - tr).toFixed(2)}[${nombre}];`;
        fin += dur[i] - tr; previo = nombre;
    }
    filtro = filtro.slice(0, -1);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...ent, '-f', 'lavfi', '-t', String(Math.ceil(fin)), '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
        '-filter_complex', filtro, '-map', '[out]', '-map', `${dur.length}:a`, '-shortest', '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
        '-r', '30', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-crf', '20', path.join(salida, 'reel.mp4')]);
    archivos.unshift('reel.mp4');
}

// ---------- Textos ----------
const agente = (texto) => `https://wa.me/${WA_AGENTE}?text=${encodeURIComponent(texto)}`;
const OBS = `${SITIO}/observatorio`;
let textos;
if (tipo === 'ficha') {
    const m = elegida;
    const ficha = `${SITIO}/observatorio/${m.slug}`;
    const titulo = `${m.nombre}${m.frase ? ' ' + m.frase : ''}`;
    const lugar = m.seccion === 'top' ? `Es la estafa #${m.pos} del ranking de ${mes} del Observatorio de Fraude Digital de Cyber Mobile.` : `Está en vigilancia en el Observatorio de Fraude Digital de Cyber Mobile (${mes}).`;
    const pasos = m.pasos.map((p, i) => `${i + 1}️⃣ ${p}`).join('\n');
    const instagram = `🚨 ALERTA: ${titulo}\n\n${lugar}\n\n${m.como}\n\n✅ Cómo reconocerla: ${m.detectar}\n\nSi te llegó:\n${pasos}\n\n📲 ¿Te llegó algo así? Reenvialo a nuestro agente por WhatsApp y te decimos si es una estafa. 7 días de prueba gratuita.\n\n🔎 Ficha completa y ranking del mes: link en la bio.\n\nCompartilo con tu familia: así se corta la cadena.\n\n#CyberMobile ${m.tag} #FraudeDigital #Estafas #Ciberseguridad #SeguridadDigital #Argentina`;
    const whatsapp = `🚨 *ALERTA: ${titulo}*\n_${m.seccion === 'top' ? `#${m.pos} del ranking del Observatorio de Fraude Digital` : 'En vigilancia en el Observatorio de Fraude Digital'}_\n\n${m.como}\n\n✅ *Cómo reconocerla:* ${m.detectar}\n\n*Si te llegó:*\n${pasos}\n\n📲 *¿Te llegó algo así? Verificalo con nuestro agente:*\n${agente(`Hola, me llegó algo que parece "${m.nombre}" y quiero verificarlo`)}\n\n🔎 *Ficha completa:*\n${ficha}\n\n📊 *Ranking del mes:*\n${OBS}\n\n🌐 *Cyber Mobile:*\n${SITIO}\n\nReenviá este mensaje a tu familia 🙏`;
    textos = { fecha, tipo, mes, titulo, modalidad: m.nombre, ficha, instagram, whatsapp };
} else {
    const top = lista.filter((m) => m.seccion === 'top').slice(0, 3);
    const emoji = { WhatsApp: '💬', Redes: '📈', 'Teléfono': '📞', SMS: '✉️', Email: '📧', Marketplace: '🛒' };
    const linea = (m) => `#${m.pos} ${emoji[m.canal] || '⚠️'} ${m.nombre}: ${m.clave}`;
    const instagram = `Las 3 estafas que más circulan en Argentina (${mes}) 🚨\n\n${[top[2], top[1], top[0]].map(linea).join('\n\n')}\n\n¿Te llegó algo así? Reenvialo a nuestro agente antes de responder 👉 link en la bio\nRanking completo y cómo reconocer cada estafa: cybermobile.com.ar/observatorio\n\n📌 Guardalo y mandáselo a tus papás y abuelos.\n\n#CyberMobile #Estafas #FraudeDigital #Ciberseguridad #EstafasWhatsApp #Argentina #SeguridadDigital`;
    const whatsapp = `🚨 *Las 3 estafas que más circulan en Argentina* (${mes})\n\n${[top[2], top[1], top[0]].map((m) => `*${linea(m)}*\n${SITIO}/observatorio/${m.slug}`).join('\n\n')}\n\n📲 *¿Te llegó algo así? Verificalo con nuestro agente:*\n${agente('Hola, me llegó un mensaje sospechoso y quiero verificarlo')}\n\n📊 *Ranking completo:*\n${OBS}\n\n🌐 *Cyber Mobile:*\n${SITIO}\n\nReenviá este mensaje a tu familia 🙏`;
    textos = { fecha, tipo, mes, titulo: `Top 3 de ${mes}`, modalidad: top.map((m) => m.nombre).join(' · '), instagram, whatsapp };
}
textos.archivos = archivos.map((a) => ({ nombre: a, url: `${SITIO}/redes/${fecha}/${a}` }));
fs.writeFileSync(path.join(salida, 'textos.json'), JSON.stringify(textos, null, 2) + '\n');
fs.writeFileSync(path.join(salida, 'instagram.txt'), textos.instagram + '\n');
fs.writeFileSync(path.join(salida, 'whatsapp.txt'), textos.whatsapp + '\n');

// ---------- Limpieza: solo se conservan los últimos días ----------
const limite = new Date(fecha + 'T12:00:00Z');
limite.setUTCDate(limite.getUTCDate() - DIAS_QUE_SE_CONSERVAN);
for (const d of fs.readdirSync(path.join(RAIZ, 'redes'))) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d < limite.toISOString().slice(0, 10)) fs.rmSync(path.join(RAIZ, 'redes', d), { recursive: true, force: true });
}
console.log(`${fecha} · ${tipo} · ${textos.modalidad} · ${archivos.join(', ')}`);
