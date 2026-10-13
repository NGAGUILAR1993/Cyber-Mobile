// Genera la publicación diaria para redes a partir de observatorio/datos.json y de los casos reales de Vera (casos.json).
// Calendario semanal (3 reels día por medio, 2 carruseles, 4 historias y un día libre):
//   Lunes      Reel "Se lo mandé a Vera" (caso real)          20:00  + historia: alerta de la semana (#1 del ranking)
//   Martes     Carrusel "Radar del Observatorio" (5 placas)    19:30
//   Miércoles  Reel "¿Estafa o real?" (~12 s)                   20:00  + historia: encuesta "¿Estafa o no?"
//   Jueves     Historia de planes (7 días gratis)              13:00
//   Viernes    Reel: "Vera te enseña" / "IA general vs Vera"  20:00  (semana por medio)
//   Sábado     Carrusel: "IA general vs Vera" / "Guardalo para tu familia" (semana por medio)  12:00  + historia de preguntas
//   Domingo    Día libre
// Salida: redes/AAAA-MM-DD/ con las imágenes, el video y textos.json (textos e instrucciones listos para copiar).
// Uso: node scripts/redes/generar.mjs [--fecha AAAA-MM-DD] [--caso <id de casos.json>]
//   --caso arma ese día un reel "Se lo mandé a Vera" con el caso indicado (por ejemplo, uno nuevo y urgente).
// Requiere Playwright (Chromium) y ffmpeg.
// Estructura de cada pieza (scripts/redes/GUIA.md): portada que abre una incógnita, puente que amplía el problema,
// entrega que se guarda o comparte, y CTA con un siguiente paso concreto (Comentá VERA → link por privado).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const SITIO = 'https://www.cybermobile.com.ar';
const WA_AGENTE = '5491170598505';
const INICIO_ROTACION = '2026-10-01';
const LUNES_CERO = '2026-10-12';   // semana 0 de la grilla nueva
const FIN_PROMO_MADRE = '2026-10-18';
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
// Casos reales analizados por Vera y tutoriales (scripts/redes/casos.json; capturas en scripts/redes/casos/).
const CASOS = JSON.parse(fs.readFileSync(path.join(RAIZ, 'scripts', 'redes', 'casos.json'), 'utf8'));
const caso = (id) => CASOS.casos.find((c) => c.id === id);
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
const semana = Math.floor((Date.parse(fecha + 'T12:00:00Z') - Date.parse(LUNES_CERO + 'T12:00:00Z')) / (7 * 86400000));
const par = ((semana % 2) + 2) % 2 === 0;
const PLAN = {
    1: { tipo: 'reel', formato: 'reel-caso', horario: '20:00' },
    2: { tipo: 'carrusel', formato: 'carrusel', horario: '19:30' },
    3: { tipo: 'reel', formato: 'reel-falso', horario: '20:00' },
    4: { tipo: 'historia', formato: 'historia-planes', horario: '13:00' },
    5: par ? { tipo: 'reel', formato: 'reel-tutorial', horario: '20:00' } : { tipo: 'reel', formato: 'reel-comparacion', horario: '20:00' },
    6: par ? { tipo: 'carrusel', formato: 'carrusel-comparacion', horario: '12:00' } : { tipo: 'carrusel', formato: 'carrusel-familia', horario: '12:00' },
    0: { tipo: 'libre', formato: 'libre', horario: '' }
};
const argCaso = process.argv.indexOf('--caso');
const casoForzado = argCaso > -1 ? process.argv[argCaso + 1] : '';
const { tipo, formato, horario } = casoForzado ? { tipo: 'reel', formato: 'reel-caso', horario: '20:00' } : PLAN[diaSemana];

// Rotación: el carrusel del martes y el reel del miércoles toman la siguiente modalidad; la encuesta usa otra distinta.
let nFeed = 0, nDias = 0;
for (let d = new Date(INICIO_ROTACION + 'T12:00:00Z'); d.toISOString().slice(0, 10) < fecha; d.setUTCDate(d.getUTCDate() + 1)) {
    nDias++;
    if ([2, 3].includes(d.getUTCDay())) nFeed++;
}
const idx = (n) => ((n % lista.length) + lista.length) % lista.length;
const elegida = lista[idx(nFeed)];
const deHistoria = lista[idx(nFeed + 1 + (nDias % 4))] === elegida ? lista[idx(nFeed + 1)] : lista[idx(nFeed + 1 + (nDias % 4))];
const enHistoria = deHistoria;
const rot = (arr, n) => arr[((n % arr.length) + arr.length) % arr.length];
const casoSemana = casoForzado ? caso(casoForzado) : rot(CASOS.casos.filter((c) => c.semana), semana);
if (!casoSemana) throw new Error('No existe el caso ' + casoForzado);
const tutorial = rot(CASOS.tutoriales, Math.floor(semana / 2));
const casoTutorial = caso(tutorial.caso);
const promo = fecha <= FIN_PROMO_MADRE;

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
const top5 = lista.filter((m) => m.seccion === 'top').slice(0, 5).map((m) => ({ pos: m.pos, nombre: m.nombre, clave: m.clave }));
const comp = { mes, ip: caso('ip-maliciosa'), sms: caso('sms-puntos') };
const archivos = [];
try {
    if (formato === 'carrusel') {
        for (let i = 1; i <= 5; i++) archivos.push(await captura(`car-${i}`, base(elegida), `carrusel-${i}.jpg`, 1350));
        archivos.push(await captura('cuad', base(elegida), 'whatsapp.jpg', 1080));
    } else if (formato === 'reel-falso') {
        for (let i = 1; i <= 4; i++) await captura(`rf-${i}`, base(elegida), `pantalla-${i}.jpg`, 1920);
        archivos.push(await captura('cuad', base(elegida), 'whatsapp.jpg', 1080));
        archivos.push(await captura('historia', base(enHistoria), 'historia.jpg', 1920));
    } else if (formato === 'reel-caso') {
        for (let i = 0; i <= 4; i++) await captura(`sv-${i}`, { mes, c: casoSemana }, `pantalla-${i + 1}.jpg`, 1920);
        if (diaSemana === 1) archivos.push(await captura('hist-alerta', base(lista[0]), 'historia.jpg', 1920));
    } else if (formato === 'reel-tutorial') {
        for (let i = 1; i <= 4; i++) await captura(`tu-${i}`, { mes, tu: tutorial, c: casoTutorial }, `pantalla-${i}.jpg`, 1920);
    } else if (formato === 'reel-comparacion') {
        for (let i = 1; i <= 5; i++) await captura(`vr-${i}`, comp, `pantalla-${i}.jpg`, 1920);
    } else if (formato === 'carrusel-comparacion') {
        for (let i = 1; i <= 6; i++) archivos.push(await captura(`cmp-${i}`, comp, `carrusel-${i}.jpg`, 1350));
        archivos.push(await captura('hist-preguntas', { mes }, 'historia.jpg', 1920));
    } else if (formato === 'carrusel-familia') {
        for (let i = 1; i <= 4; i++) archivos.push(await captura(`fam-${i}`, { mes, top: top5 }, `carrusel-${i}.jpg`, 1350));
        archivos.push(await captura('hist-preguntas', { mes }, 'historia.jpg', 1920));
    } else if (formato === 'historia-planes') {
        archivos.push(await captura('hist-planes', { mes, promo }, 'historia.jpg', 1920));
    }
} finally {
    await browser.close();
}

// ---------- Video de los reels (sin voz; la música se agrega en Instagram) ----------
// Todos los reels duran DURACION_REEL segundos: las pantallas se reparten el tiempo según su peso, con
// transiciones lentas y un zoom suave para que se puedan leer con calma.
const DURACION_REEL = 20;
function video(pesos, transiciones) {
    const tr = 0.8, n = pesos.length;
    const k = (DURACION_REEL + tr * (n - 1)) / pesos.reduce((a, b) => a + b, 0);
    const dur = pesos.map((p) => Math.round(p * k * 100) / 100);
    const ent = dur.flatMap((_, i) => ['-i', path.join(salida, `pantalla-${i + 1}.jpg`)]);
    let filtro = dur.map((t, i) => {
        const f = Math.round(t * 30);
        return `[${i}:v]scale=1080:1920,zoompan=z='min(1+0.0004*on,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${f}:s=1080x1920:fps=30,format=yuv420p,setsar=1[v${i}];`;
    }).join('');
    let previo = 'v0', fin = dur[0];
    for (let i = 1; i < n; i++) {
        const nombre = i === n - 1 ? 'out' : `a${i}`;
        filtro += `[${previo}][v${i}]xfade=transition=${transiciones[i - 1]}:duration=${tr}:offset=${(fin - tr).toFixed(2)}[${nombre}];`;
        fin += dur[i] - tr; previo = nombre;
    }
    filtro = filtro.slice(0, -1);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...ent, '-f', 'lavfi', '-t', String(DURACION_REEL), '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
        '-filter_complex', filtro, '-map', '[out]', '-map', `${n}:a`, '-t', String(DURACION_REEL), '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
        '-r', '30', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-crf', '20', path.join(salida, 'reel.mp4')]);
    fs.renameSync(path.join(salida, 'pantalla-1.jpg'), path.join(salida, 'portada.jpg'));
    for (let i = 2; i <= n; i++) fs.rmSync(path.join(salida, `pantalla-${i}.jpg`));
    archivos.unshift('reel.mp4', 'portada.jpg');
}
if (formato === 'reel-falso') video([2.8, 2.6, 5.0, 3.4], ['zoomin', 'slideleft', 'fade']);
if (formato === 'reel-caso') video([3, 4, 5.5, 4.5, 3.5], ['fadeblack', 'slideup', 'slideleft', 'fadeblack']);
if (formato === 'reel-tutorial') video([3.2, 4.6, 5.2, 3.6], ['slideup', 'slideleft', 'fadeblack']);
if (formato === 'reel-comparacion') video([3.2, 5.6, 6.4, 5.0, 3.6], ['slideup', 'slideleft', 'slideleft', 'fadeblack']);

// ---------- Textos ----------
const agente = (texto) => `https://wa.me/${WA_AGENTE}?text=${encodeURIComponent(texto)}`;
const OBS = `${SITIO}/observatorio`;
const sinMarcas = (t) => String(t).replace(/\*/g, '');
const HASH = '#Estafas #FraudeDigital #Ciberseguridad #SeguridadDigital #Argentina #CyberMobile';
const m = elegida, e = m.ejemplo, ficha = `${SITIO}/observatorio/${m.slug}`;
const senales = e.senales.map((x, i) => `${i + 1}. ${x}`).join('\n');
const pasos = m.pasos.map((p, i) => `${i + 1}️⃣ ${p}`).join('\n');
const VERA = `${SITIO}/vera`;
const CTA_IG = '💬 Comentá VERA y te envío por mensaje privado el link para probarla 7 días gratis en tu WhatsApp (o entrá a cybermobile.com.ar/vera).';
const CTA_WA = `📲 *Probá Vera 7 días gratis:*\n${VERA}?o=canal`;
const waFicha = `🚨 *${sinMarcas(e.gancho)}*\n\n${m.comoCorto}\n\n🚩 *Señales:*\n${senales}\n\n✅ *${m.clave}*\n\n*Si te llegó:*\n${pasos}\n\n📲 *¿Dudás? Verificalo con Vera:*\n${VERA}?o=canal\n\n🔎 *Ficha completa:*\n${ficha}\n\nReenviá este mensaje a tu familia 🙏`;
const sticker = 'un sticker de enlace a cybermobile.com.ar/vera?o=historia (abre el chat con Vera directo)';
const instEncuesta = `Historia: subí historia.jpg, agregá el sticker de ENCUESTA sobre el recuadro punteado con "ESTAFA 🚩" / "NO ES ✅" y ${sticker}. Es "${enHistoria.nombre}": si votan "No es", respondé por mensaje con la ficha ${SITIO}/observatorio/${enHistoria.slug}. Al día siguiente, compartí el resultado: "Era una estafa 🚩".`;
const instPreguntas = 'Historia: subí historia.jpg y poné el sticker de PREGUNTAS sobre el recuadro punteado. Durante el fin de semana respondé 2 o 3 en historias (podés mostrar la respuesta de Vera con captura, tapando datos personales).';
const comparacionIG = (cierre) => `¿Le preguntás a cualquier IA si un mensaje es estafa? 🤔\n\nLas IA de uso general (ChatGPT, Gemini y similares) son geniales para muchas cosas. Pero para una estafa conviene una especialista:\n\n🔎 Vera no opina: verifica. Revisa links con decenas de antivirus (VirusTotal), busca tu mail en bases de filtraciones y conoce las estafas que circulan este mes en Argentina gracias al Observatorio de Fraude Digital.\n🛡️ Te responde con un semáforo 🔴🟡🟢 y qué hacer.\n💬 Y la usás desde tu WhatsApp: reenviás y listo.\n\n${cierre}\n${CTA_IG}\n\n#InteligenciaArtificial #IA ${HASH}`;
const comparacionWA = `🤖 *¿IA general o IA especialista?*\n\nLas IA de uso general sirven para muchas cosas. Pero cuando te llega un mensaje sospechoso, necesitás una que *verifique*, no que opine:\n\n🔗 *Links:* Vera los revisa con decenas de antivirus.\n📧 *Tu mail:* lo busca en bases de filtraciones.\n🇦🇷 *Estafas de Argentina:* usa el ranking del mes del Observatorio.\n🚦 *Respuesta:* semáforo y qué hacer, en tu WhatsApp.\n\nY si le preguntás tres veces lo mismo, te da el mismo veredicto. 😉\n\n${CTA_WA}`;
const planesWA = `🛡️ *Cuidá a toda tu familia de las estafas*\n\nVera revisa links, mensajes, capturas, mails, CBU y audios desde WhatsApp y te responde en segundos.\n\n👤 *Individual:* $12.000 por mes\n👨‍👩‍👦 *Pack Padres (3 personas):* $20.000 por mes\n🏡 *Pack Familiar (5 personas):* $40.000 por mes\n${promo ? '\n💐 *Día de la Madre:* regalale tranquilidad a mamá con un pack.\n' : ''}\n✅ *Probalo 7 días gratis:*\n${VERA}?o=canal\n\nDébito automático por Mercado Pago: lo cancelás cuando quieras desde la app.`;
let textos;
if (formato === 'carrusel') {
    textos = {
        titulo: `Radar del Observatorio: ${sinMarcas(e.gancho)}`, modalidad: m.nombre,
        instagram: `${sinMarcas(e.gancho)} 👀\n\n${m.comoCorto}\n\n🚩 Cómo darte cuenta:\n${senales}\n\n✅ ${m.clave}\n\n📊 Es una de las estafas que vigila el Observatorio de Fraude Digital este mes. Si te llega algo parecido, Vera ya la conoce.\n📌 Guardalo y mandáselo a quien siempre cae.\n\n${CTA_IG}\n\n${m.tag} ${HASH}`,
        whatsapp: waFicha,
        instrucciones: ['Publicá las 5 placas como carrusel, en orden (carrusel-1 a carrusel-5).', 'Agregá una canción en tendencia a volumen bajo: los carruseles con música aparecen también en Reels.', 'Respondé todos los comentarios en la primera hora.', 'Canal de WhatsApp: whatsapp.jpg con el texto de "whatsapp".']
    };
} else if (formato === 'reel-falso') {
    textos = {
        titulo: `Reel ¿Estafa o real?: ${sinMarcas(e.gancho)}`, modalidad: m.nombre,
        instagram: `¿Estafa o real? 🤔 ${sinMarcas(e.gancho)}\n\n🚩 Es una estafa. Mirá las 3 señales para darte cuenta a tiempo 👆\n\n✅ ${m.clave}\n\n📌 Guardalo y mandáselo a tu familia.\n${CTA_IG}\n\n${m.tag} ${HASH}`,
        whatsapp: waFicha,
        instrucciones: ['Subí reel.mp4 como Reel y elegí portada.jpg como portada.', 'Agregá audio en tendencia (volumen bajo) y activá "Compartir en el feed".', 'Fijá un comentario: "¿Vos te dabas cuenta? 👇"', instEncuesta]
    };
} else if (formato === 'reel-caso') {
    const c = casoSemana, ev = c.evidencias.map((x, i) => `${i + 1}. ${x}`).join('\n');
    const g = sinMarcas(c.gancho), gMin = g.charAt(0).toLowerCase() + g.slice(1);
    textos = {
        titulo: `Reel Se lo mandé a Vera: ${g}`, modalidad: `Caso real: ${c.id}`,
        instagram: `Me llegó ${gMin}… y en vez de tocar nada, se lo mandé a Vera 🛡️\n\nEn segundos: ${c.chip}\n\n🚩 Lo que vio:\n${ev}\n\nNo tenés que saber de ciberseguridad: se lo mandás y listo.\n\n${CTA_IG}\n📌 Guardalo y mandáselo a tu familia.\n\n#SeLoMandéAVera ${HASH}`,
        whatsapp: `🛡️ *Caso real: se lo mandé a Vera*\n\nNos llegó ${gMin}. Antes de tocar nada, se lo reenviamos a Vera.\n\n*Veredicto:* ${c.chip}\n\n🚩 *Lo que vio:*\n${ev}\n\n📲 *¿Te llegó algo parecido? Mandáselo vos también:*\n${VERA}?o=canal\n\nReenviá este mensaje a tu familia 🙏`,
        instrucciones: ['Subí reel.mp4 como Reel y elegí portada.jpg como portada.', 'Audio en tendencia a volumen bajo. Fijá un comentario: "¿Vos lo abrías? 👇"'].concat(diaSemana === 1
            ? ['Canal de WhatsApp: hoy n8n manda la alerta de la semana a las 19 (a suscriptos y staff). El texto de "whatsapp" es opcional (podés mandarlo a la tarde).', `Historia (12:00): subí historia.jpg (alerta de la semana: ${lista[0].nombre}) y poné ${sticker} sobre el recuadro punteado.`]
            : ['Canal de WhatsApp: mandá el texto de "whatsapp".', 'Historia: compartí el reel en tu historia con un sticker de enlace a cybermobile.com.ar/vera?o=historia.'])
    };
} else if (formato === 'reel-tutorial') {
    const ps = tutorial.pasos.map((p, i) => `${i + 1}️⃣ ${p}`).join('\n');
    textos = {
        titulo: `Reel Vera te enseña: ${sinMarcas(tutorial.titulo)}`, modalidad: `Tutorial: ${tutorial.caso}`,
        instagram: `${sinMarcas(tutorial.titulo)} 👇\n\n${ps}\n\nAsí de simple. Vera es una IA entrenada solo para detectar estafas, y la usás desde tu WhatsApp.\n\n${CTA_IG}\n📌 Guardalo para cuando lo necesites.\n\n#VeraTeEnseña ${HASH}`,
        whatsapp: `🎓 *Vera te enseña:* ${sinMarcas(tutorial.titulo)}\n\n${ps}\n\n${CTA_WA}\n\nReenviá este mensaje a tu familia 🙏`,
        instrucciones: ['Subí reel.mp4 como Reel y elegí portada.jpg como portada.', 'Audio en tendencia a volumen bajo.', 'Canal de WhatsApp: mandá el texto de "whatsapp" (podés adjuntar el reel).']
    };
} else if (formato === 'reel-comparacion') {
    textos = {
        titulo: 'Reel: IA general vs Vera', modalidad: 'IA general vs IA especialista',
        instagram: comparacionIG('📌 Mandáselo a quien le pregunta todo a la IA.'),
        whatsapp: comparacionWA,
        instrucciones: ['Subí reel.mp4 como Reel y elegí portada.jpg como portada.', 'Audio en tendencia a volumen bajo. Fijá un comentario: "¿Vos a qué IA le preguntás? 👇"', 'Canal de WhatsApp: mandá el texto de "whatsapp".']
    };
} else if (formato === 'carrusel-comparacion') {
    textos = {
        titulo: 'Carrusel: IA general vs Vera', modalidad: 'IA general vs IA especialista',
        instagram: comparacionIG('📌 Guardalo y compartilo con quien usa la IA para todo.'),
        whatsapp: comparacionWA,
        instrucciones: ['Publicá las 6 placas como carrusel, en orden.', 'Agregá una canción en tendencia a volumen bajo.', 'Canal de WhatsApp: carrusel-1.jpg con el texto de "whatsapp".', instPreguntas]
    };
} else if (formato === 'carrusel-familia') {
    const l5 = top5.map((x) => `${x.pos}. ${x.nombre}: ${x.clave}`).join('\n\n');
    textos = {
        titulo: `Carrusel: Guardalo para tu familia (${mes})`, modalidad: top5.map((x) => x.nombre).join(' · '),
        instagram: `📌 Guardalo para tu familia: las 5 estafas que más circulan en Argentina (${mes}) y la frase que frena a cada una.\n\n${l5}\n\n🛡️ La regla de oro: ante la duda, no respondas ni toques links. Preguntale primero a Vera.\n\n${CTA_IG}\n🔗 Ranking completo: cybermobile.com.ar/observatorio\n\n${HASH}`,
        whatsapp: `📌 *Guardalo para tu familia*\n_Las 5 estafas que más circulan en Argentina (${mes})_\n\n${top5.map((x) => `*${x.pos}. ${x.nombre}:* ${x.clave}`).join('\n\n')}\n\n🛡️ *La regla de oro:* ante la duda, no respondas ni toques links. Preguntale primero a Vera.\n\n${CTA_WA}\n\nReenviá este mensaje a tu familia 🙏`,
        instrucciones: ['Publicá las 4 placas como carrusel, en orden.', 'Agregá una canción en tendencia a volumen bajo.', 'Canal de WhatsApp: carrusel-1.jpg con el texto de "whatsapp".', instPreguntas]
    };
} else if (formato === 'historia-planes') {
    textos = {
        titulo: 'Historia: planes (7 días gratis)', modalidad: 'Planes',
        instagram: 'Hoy no hay publicación en el feed: solo la historia de planes.',
        whatsapp: planesWA,
        instrucciones: [`Historia (${horario}): subí historia.jpg y poné ${sticker} sobre el recuadro punteado.`, 'Agregala al destacado "Planes".', 'Canal de WhatsApp: mandá el texto de "whatsapp".']
    };
} else {
    textos = {
        titulo: 'Día libre', modalidad: '',
        instagram: 'Hoy es el día libre: no se publica nada. Solo respondé comentarios y mensajes si querés.',
        whatsapp: '',
        instrucciones: ['Día libre. Mañana: reel "Se lo mandé a Vera" + historia de la alerta de la semana.']
    };
}
const conFicha = ['carrusel', 'reel-falso'].includes(formato);
textos = { fecha, tipo, formato, horario, mes, ...textos, ...(conFicha ? { slug: m.slug, clave: m.clave, resumen: m.comoCorto, ficha } : {}) };
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
