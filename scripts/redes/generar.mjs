// Genera la publicación diaria para redes a partir de observatorio/datos.json.
// Calendario semanal (pensado para alcance: ganchos en pregunta, carruseles que se guardan y reels cortos):
//   Lunes      Reel "Top 3 del mes" (~17 s)                 20:00
//   Martes     Carrusel de 5 placas "¿Te llegó…?"            19:30
//   Miércoles  Historia "¿Estafa o no?" (encuesta)           13:00
//   Jueves     Carrusel de 5 placas "¿Te llegó…?"            19:30
//   Viernes    Reel "FALSO" de una estafa (~12 s)            20:30
//   Sábado     Carrusel "Dato del Observatorio" (3 placas)   12:30
//   Domingo    Historia "¿Estafa o no?" (encuesta)           19:00
// Todos los días se genera además una historia de encuesta y la imagen cuadrada para el canal de WhatsApp.
// Salida: redes/AAAA-MM-DD/ con las imágenes, el video y textos.json (textos e instrucciones listos para copiar).
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
// Mensaje de ejemplo, gancho y señales por modalidad (scripts/redes/ejemplos.json).
const EJEMPLOS = JSON.parse(fs.readFileSync(path.join(RAIZ, 'scripts', 'redes', 'ejemplos.json'), 'utf8'));
const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Frase corta para la tarjeta: la primera oración de "cómo reconocerla" si el texto completo es largo.
function claveDe(detectar) {
    const t = tildes(detectar).replace(/\s+/g, ' ').trim();
    if (t.length <= 170) return t;
    const primera = t.split(/(?<=\.)\s/)[0];
    if (primera.length <= 190) return primera;
    return t.slice(0, t.lastIndexOf(' ', 180)) + '…';
}

function cortar(t, max) {
    t = String(t || '').replace(/\s+/g, ' ').trim();
    if (t.length <= max) return t;
    const oraciones = t.split(/(?<=\.)\s/);
    let r = '';
    for (const o of oraciones) { if ((r + ' ' + o).trim().length > max) break; r = (r + ' ' + o).trim(); }
    return r || t.slice(0, t.lastIndexOf(' ', max)) + '…';
}
const APP = { WHATSAPP: 'whatsapp', REDES: 'instagram', TELEFONO: 'llamada', 'TELÉFONO': 'llamada', SMS: 'sms', MAIL: 'email', MARKETPLACE: 'instagram' };
function ejemploDe(x, c, clave, nombre) {
    const e = EJEMPLOS[String(x.key || '').split('@')[0]];
    if (e) return e;
    return { gancho: `¿Te llegó algo así ${c.frase || 'hoy'}?`, app: APP[String(x.canal || '').toUpperCase()] || 'whatsapp', remitente: 'Número desconocido',
        mensaje: cortar(tildes(x.como), 160), senales: ['Te escribe alguien que no conocés', 'Te apura o te asusta', clave] };
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
        detectar: tildes(x.detectar), como: tildes(x.como), comoCorto: cortar(tildes(x.como), 260), clave,
        ejemplo: ejemploDe(x, c0, clave, nombre),
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

const diaSemana = new Date(fecha + 'T12:00:00Z').getUTCDay();   // 0 = domingo, 1 = lunes
const PLAN = {
    1: { tipo: 'reel', formato: 'reel-top3', horario: '20:00' },
    2: { tipo: 'ficha', formato: 'carrusel', horario: '19:30' },
    3: { tipo: 'historia', formato: 'historia', horario: '13:00' },
    4: { tipo: 'ficha', formato: 'carrusel', horario: '19:30' },
    5: { tipo: 'reel', formato: 'reel-falso', horario: '20:30' },
    6: { tipo: 'dato', formato: 'dato', horario: '12:30' },
    0: { tipo: 'historia', formato: 'historia', horario: '19:00' }
};
const { tipo, formato, horario } = PLAN[diaSemana];

// Rotación: cada carrusel o reel "FALSO" toma la siguiente modalidad; la historia del día usa otra distinta.
let nFeed = 0, nDias = 0;
for (let d = new Date(INICIO_ROTACION + 'T12:00:00Z'); d.toISOString().slice(0, 10) < fecha; d.setUTCDate(d.getUTCDate() + 1)) {
    nDias++;
    if ([2, 4, 5].includes(d.getUTCDay())) nFeed++;
}
const idx = (n) => ((n % lista.length) + lista.length) % lista.length;
const elegida = lista[idx(nFeed)];
const deHistoria = lista[idx(nFeed + 1 + (nDias % 4))] === elegida ? lista[idx(nFeed + 1)] : lista[idx(nFeed + 1 + (nDias % 4))];
const enHistoria = deHistoria;

// Dato del sábado: rota entre cuatro datos reales del Observatorio.
const ETQ = { WHATSAPP: 'WhatsApp', REDES: 'Redes sociales', TELEFONO: 'Teléfono', 'TELÉFONO': 'Teléfono', SMS: 'SMS', MAIL: 'Email', EMAIL: 'Email', MARKETPLACE: 'Marketplace' };
const barras = (datos.dist || []).map((b) => ({ label: ETQ[String(b.label).toUpperCase()] || b.label, pct: Number(b.pct) || 0 })).sort((a, b) => b.pct - a.pct);
const kpi = datos.kpi || {};
const altos = (datos.top10 || []).filter((x) => String(x.riesgo).toLowerCase() === 'alto').length;
const DATOS_SABADO = [
    barras[0] && { numero: barras[0].pct + '%', frase: `de las estafas del mes llegan por *${barras[0].label.toLowerCase()}*` },
    altos && { numero: `${altos} de ${(datos.top10 || []).length}`, frase: 'estafas más activas del mes son de *riesgo alto*' },
    kpi.sube && { numero: String(kpi.sube), frase: 'modalidades de estafa *crecieron* este mes' },
    kpi.monit && { numero: String(kpi.monit), frase: 'modalidades de estafa *vigiladas* este mes en Argentina' }
].filter(Boolean);
const dato = DATOS_SABADO.length ? { ...DATOS_SABADO[Math.floor(nDias / 7) % DATOS_SABADO.length], barras, top: lista[0] ? lista[0].nombre : '' } : null;

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

const base = (m) => ({ mes, m, e: m.ejemplo });
const archivos = [];
try {
    if (formato === 'carrusel') {
        for (let i = 1; i <= 5; i++) archivos.push(await captura(`car-${i}`, base(elegida), `carrusel-${i}.jpg`, 1350));
        archivos.push(await captura('cuad', base(elegida), 'whatsapp.jpg', 1080));
    } else if (formato === 'reel-falso') {
        for (let i = 1; i <= 4; i++) await captura(`rf-${i}`, base(elegida), `pantalla-${i}.jpg`, 1920);
        archivos.push(await captura('cuad', base(elegida), 'whatsapp.jpg', 1080));
    } else if (formato === 'reel-top3') {
        const top = lista.filter((m) => m.seccion === 'top').slice(0, 3).map((m) => ({ m, e: m.ejemplo }));
        for (let i = 0; i < 5; i++) await captura(`rt-${i}`, { mes, top }, `pantalla-${i + 1}.jpg`, 1920);
        archivos.push(await captura('cuad', base(lista[0]), 'whatsapp.jpg', 1080));
    } else if (formato === 'dato') {
        for (let i = 1; i <= 3; i++) archivos.push(await captura(`dato-${i}`, { mes, dato }, `dato-${i}.jpg`, 1350));
        fs.copyFileSync(path.join(salida, 'dato-1.jpg'), path.join(salida, 'whatsapp.jpg')); archivos.push('whatsapp.jpg');
    } else {
        archivos.push(await captura('cuad', base(enHistoria), 'whatsapp.jpg', 1080));
    }
    archivos.push(await captura('historia', base(enHistoria), 'historia.jpg', 1920));
} finally {
    await browser.close();
}

// ---------- Video de los reels (sin voz; la música se agrega en Instagram) ----------
function video(dur, transiciones) {
    const tr = 0.35;
    const ent = dur.flatMap((t, i) => ['-framerate', '30', '-loop', '1', '-t', String(t), '-i', path.join(salida, `pantalla-${i + 1}.jpg`)]);
    let filtro = dur.map((_, i) => `[${i}:v]format=yuv420p,setsar=1[v${i}];`).join('');
    let previo = 'v0', fin = dur[0];
    for (let i = 1; i < dur.length; i++) {
        const nombre = i === dur.length - 1 ? 'out' : `a${i}`;
        filtro += `[${previo}][v${i}]xfade=transition=${transiciones[i - 1]}:duration=${tr}:offset=${(fin - tr).toFixed(2)}[${nombre}];`;
        fin += dur[i] - tr; previo = nombre;
    }
    filtro = filtro.slice(0, -1);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...ent, '-f', 'lavfi', '-t', String(Math.ceil(fin)), '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
        '-filter_complex', filtro, '-map', '[out]', '-map', `${dur.length}:a`, '-shortest', '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
        '-r', '30', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-crf', '20', path.join(salida, 'reel.mp4')]);
    fs.renameSync(path.join(salida, 'pantalla-1.jpg'), path.join(salida, 'portada.jpg'));
    for (let i = 2; i <= dur.length; i++) fs.rmSync(path.join(salida, `pantalla-${i}.jpg`));
    archivos.unshift('reel.mp4', 'portada.jpg');
}
if (formato === 'reel-falso') video([2.6, 2.2, 4.6, 3.2], ['zoomin', 'slideleft', 'fade']);
if (formato === 'reel-top3') video([2.6, 3.6, 3.6, 3.8, 3.2], ['slideleft', 'slideleft', 'slideleft', 'fade']);

// ---------- Textos ----------
const agente = (texto) => `https://wa.me/${WA_AGENTE}?text=${encodeURIComponent(texto)}`;
const OBS = `${SITIO}/observatorio`;
const sinMarcas = (t) => String(t).replace(/\*/g, '');
const HASH = '#Estafas #FraudeDigital #Ciberseguridad #SeguridadDigital #Argentina #CyberMobile';
const m = formato === 'historia' ? enHistoria : elegida, e = m.ejemplo, ficha = `${SITIO}/observatorio/${m.slug}`;
const senales = e.senales.map((x, i) => `${i + 1}. ${x}`).join('\n');
const pasos = m.pasos.map((p, i) => `${i + 1}️⃣ ${p}`).join('\n');
const waFicha = `🚨 *${sinMarcas(e.gancho)}*\n\n${m.comoCorto}\n\n🚩 *Señales:*\n${senales}\n\n✅ *${m.clave}*\n\n*Si te llegó:*\n${pasos}\n\n📲 *¿Dudás? Verificalo con Vera:*\n${agente(`Hola, me llegó algo que parece "${m.nombre}" y quiero verificarlo`)}\n\n🔎 *Ficha completa:*\n${ficha}\n\nReenviá este mensaje a tu familia 🙏`;
const historia = enHistoria.ejemplo;
const instHistoria = `Historia (13:00 o cuando quieras): subí historia.jpg, agregá el sticker de ENCUESTA sobre el recuadro punteado con "ESTAFA 🚩" / "NO ES ✅" y un sticker de enlace a cybermobile.com.ar/agente. Es "${enHistoria.nombre}": si votan "No es", respondé por mensaje con la ficha ${SITIO}/observatorio/${enHistoria.slug}`;
let textos;
if (formato === 'carrusel') {
    textos = {
        titulo: sinMarcas(e.gancho), modalidad: m.nombre,
        instagram: `${sinMarcas(e.gancho)} 👀\n\n${m.comoCorto}\n\n🚩 Cómo darte cuenta:\n${senales}\n\n✅ ${m.clave}\n\n📌 Guardalo y mandáselo a quien siempre cae.\n💬 ¿Te llegó algo así? Contanos en los comentarios.\n\n🔗 ¿Dudás de un mensaje? Verificalo con Vera: link en la bio.\n\n${m.tag} ${HASH}`,
        whatsapp: waFicha,
        instrucciones: ['Publicá las 5 placas como carrusel, en orden (carrusel-1 a carrusel-5).', 'Agregá una canción en tendencia a volumen bajo: los carruseles con música aparecen también en Reels.', 'Respondé todos los comentarios en la primera hora.', instHistoria]
    };
} else if (formato === 'reel-falso') {
    textos = {
        titulo: `Reel: ${sinMarcas(e.gancho)}`, modalidad: m.nombre,
        instagram: `${sinMarcas(e.gancho)} 🚩 Es una estafa.\n\nMirá las 3 señales para darte cuenta a tiempo 👆\n\n✅ ${m.clave}\n\n📌 Guardalo y mandáselo a tu familia.\n🔗 Verificá cualquier mensaje con Vera: link en la bio.\n\n${m.tag} ${HASH}`,
        whatsapp: waFicha,
        instrucciones: ['Subí reel.mp4 como Reel y elegí portada.jpg como portada.', 'Agregá audio en tendencia (volumen bajo) y activá "Compartir en el feed".', 'En el texto de la portada ya está el gancho: no agregues otro título.', instHistoria]
    };
} else if (formato === 'reel-top3') {
    const top = lista.filter((x) => x.seccion === 'top').slice(0, 3);
    const linea = (x) => `#${x.pos} ${x.nombre}: ${x.clave}`;
    textos = {
        titulo: `Reel: Top 3 de ${mes}`, modalidad: top.map((x) => x.nombre).join(' · '),
        instagram: `Las 3 estafas que más circulan en Argentina (${mes}) 🚨\n\n${[top[2], top[1], top[0]].map(linea).join('\n\n')}\n\n📌 Guardalo y mandáselo a tus papás y abuelos.\n🔗 Ranking completo y cómo reconocer cada una: link en la bio.\n\n${HASH}`,
        whatsapp: `🚨 *Las 3 estafas que más circulan en Argentina* (${mes})\n\n${[top[2], top[1], top[0]].map((x) => `*${linea(x)}*\n${SITIO}/observatorio/${x.slug}`).join('\n\n')}\n\n📲 *¿Te llegó algo así? Verificalo con Vera:*\n${agente('Hola, me llegó un mensaje sospechoso y quiero verificarlo')}\n\nReenviá este mensaje a tu familia 🙏`,
        instrucciones: ['Subí reel.mp4 como Reel y elegí portada.jpg como portada.', 'Agregá audio en tendencia (volumen bajo).', instHistoria]
    };
} else if (formato === 'dato') {
    textos = {
        titulo: `Dato: ${dato.numero} ${sinMarcas(dato.frase)}`, modalidad: 'Dato del Observatorio',
        instagram: `${dato.numero} ${sinMarcas(dato.frase)} 📊\n\nEs uno de los datos de ${mes} del Observatorio de Fraude Digital de Cyber Mobile. La más activa: ${dato.top}.\n\n¿Vos sabías por dónde llegan? Deslizá 👉\n\n📌 Guardalo y compartilo: la información es la mejor defensa.\n🔗 Ranking completo: link en la bio.\n\n${HASH}`,
        whatsapp: `📊 *Dato del Observatorio de Fraude Digital* (${mes})\n\n*${dato.numero} ${sinMarcas(dato.frase)}.*\n\nLa más activa del mes: ${dato.top}.\n\nConocé el ranking y cómo reconocer cada estafa:\n${OBS}\n\n¿Te llegó algo raro? Verificalo con Vera:\n${SITIO}/agente\n\nReenviá este mensaje a tu familia 🙏`,
        instrucciones: ['Publicá las 3 placas como carrusel, en orden.', 'Agregá una canción en tendencia a volumen bajo.', instHistoria]
    };
} else {
    textos = {
        titulo: `Historia: ¿Estafa o no? (${m.nombre})`, modalidad: m.nombre,
        instagram: 'Hoy no hay publicación en el feed: solo la historia con encuesta.',
        whatsapp: `🚩 *¿Estafa o no?*\n\nEste mensaje está circulando:\n\n_"${historia.mensaje}"_\n\nEs *una estafa* (${m.nombre}).\n\n🚩 *Señales:*\n${historia.senales.map((x, i) => `${i + 1}. ${x}`).join('\n')}\n\n✅ *${m.clave}*\n\n🔎 Más info: ${SITIO}/observatorio/${m.slug}\n\nReenviá este mensaje a tu familia 🙏`,
        instrucciones: [instHistoria.replace('Historia (13:00 o cuando quieras)', `Historia (${horario})`), 'Al día siguiente, compartí el resultado de la encuesta en otra historia con la respuesta: "Era una estafa 🚩".']
    };
}
textos = { fecha, tipo, formato, horario, mes, ...textos, slug: m.slug, clave: m.clave, resumen: m.comoCorto, ficha };
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
console.log(`${fecha} · ${formato} · ${textos.modalidad} · ${archivos.join(', ')}`);
