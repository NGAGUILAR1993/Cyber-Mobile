// Panel de Vera: el mismo archivo sirve para la ventanita del ícono y para la ventana que abre el clic derecho.
import { BASE, estado, consultar, vincularIniciar, vincularEstado, desvincular, detectar } from './api.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const VISTAS = ['inicio', 'cargando', 'resultado', 'pago', 'vincular'];
const WA_SUSCRIBIR = 'https://wa.me/5491170598505?text=' + encodeURIComponent('Hola Vera, quiero suscribirme (vengo de la extensión de Chrome)');
let tabActual = null, ultimo = null, ultimoRes = null, sondeo = 0, giro = 0;

// Las 5 capacidades (las mismas del reel "Lo que no ves"): qué revisa Vera por dentro.
const CAPS = [
    { n: '01', c: '#a78bfa', t: 'Links y archivos', d: 'Decenas de antivirus a la vez (VirusTotal) y la reputación del sitio', ph: 'Pegá el link que te llegó', ir: 'PEGAR' },
    { n: '02', c: '#22d3ee', t: 'CBU, CVU y alias', d: 'Reportes de estafa y cuentas recién abiertas', ph: 'Pegá el CBU, CVU o alias antes de transferir', ir: 'PEGAR' },
    { n: '03', c: '#a3e635', t: 'Teléfonos', d: 'Cruce con reportes de otras personas', ph: 'Pegá el número que te escribió o te llamó', ir: 'PEGAR' },
    { n: '04', c: '#fbbf24', t: 'Mails', d: 'El remitente real y si tu correo aparece en filtraciones', ph: 'Pegá el mail o el texto del correo', ir: 'PEGAR' },
    { n: '05', c: '#f472b6', t: 'Capturas y mensajes', d: 'Lee el mensaje, el link y qué te piden', ph: '', ir: 'CAPTURAR' }
];
// Las fuentes REALES que consulta Vera según lo que se verifica. [nombre, qué consulta].
// Se muestran en la terminal (mientras analiza) y como evidencia en el resultado.
const FUENTES = {
    link: [['DNS y dominio', 'resuelve el dominio y su antigüedad'], ['VirusTotal', '70+ motores antivirus y listas de bloqueo'], ['Reputación del sitio', 'señales de phishing y reportes'], ['Observatorio', 'modalidades que circulan en la región']],
    cbu: [['Formato bancario', 'banco y validez de la cuenta'], ['Reportes de estafa', 'denuncias sobre esa cuenta'], ['Antigüedad', 'cuentas abiertas hace poco'], ['Observatorio', 'modalidades que circulan']],
    tel: [['Origen del número', 'país y tipo de línea'], ['Reportes', 'cruce con avisos de otras personas'], ['Observatorio', 'modalidades que circulan']],
    email: [['Remitente real', 'dominio y autenticación del correo'], ['Filtraciones', 'si el correo aparece en bases filtradas'], ['Observatorio', 'modalidades que circulan']],
    archivo: [['Lectura del archivo', 'texto, links y datos con OCR/IA'], ['VirusTotal', 'si es APK o documento, 70+ motores'], ['Qué te piden', 'el patrón de engaño'], ['Observatorio', 'modalidades que circulan']],
    mensaje: [['Lectura del mensaje', 'links, cuentas y teléfonos que aparecen'], ['Reputación', 'de los dominios y datos citados'], ['Qué te piden', 'el patrón de engaño'], ['Observatorio', 'modalidades que circulan']]
};
// ¿Desde qué país se usa? Define el cobro: Argentina → Mercado Pago (pesos); resto → Paddle (USD).
function detectarPais() {
    try {
        const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '');
        const lang = (navigator.language || '').toLowerCase();
        if (/argentina/i.test(tz) || lang === 'es-ar') return 'AR';
        return 'INT';
    } catch { return 'INT'; }
}
const PAIS = detectarPais();
// Link de pago internacional (Paddle). Placeholder hasta que Germán conecte su cuenta de Paddle;
// se puede sobreescribir cargando CM_PADDLE en chrome.storage.local sin tocar el código.
let PADDLE_CHECKOUT = '';   // checkout internacional real (https). Vacío = todavía no se cobra del exterior: se muestra el aviso por mail.
const AVISO_INT = 'mailto:info@cybermobile.com.ar?subject=' + encodeURIComponent('Vera: avisenme cuando abran las suscripciones internacionales') + '&body=' + encodeURIComponent('Hola, quiero suscribirme a Vera desde mi pais. Pais: ');
// Guías propias y fuentes oficiales para entender el resultado (solo dominios conocidos).
const GUIA = (slug, titulo, c) => ({ href: `${BASE}/guias/${slug}?o=extension`, origen: 'Guía de Cyber Mobile', titulo, c });
const G = {
    cbu: GUIA('de-quien-es-un-cbu', 'De quién es un CBU o alias y cómo verlo antes de transferir', '#22d3ee'),
    tel: GUIA('verificar-numero-desconocido', 'Cómo verificar un número desconocido antes de responder', '#a3e635'),
    phishing: GUIA('que-es-phishing', 'Qué es el phishing: ejemplos reales en Argentina', '#a78bfa'),
    whatsapp: GUIA('verificar-estafa-whatsapp', 'Cómo verificar si un WhatsApp es estafa', '#a3e635'),
    general: GUIA('como-saber-si-es-estafa', 'Cómo saber si es estafa: 7 señales y qué hacer', '#a78bfa'),
    victima: GUIA('que-hacer-si-fui-victima-de-phishing', 'Si ya pagaste o diste datos: qué hacer en la primera hora', '#f472b6')
};
const OFICIAL = {
    denuncia: { href: 'https://www.mpf.gob.ar/ufeci/', origen: 'Oficial · mpf.gob.ar', titulo: 'Denunciar un delito informático (UFECI, Ministerio Público Fiscal)', c: '#fbbf24' },
    bcra: { href: 'https://www.bcra.gob.ar/realizar-un-reclamo-ante-el-banco-central-por-fraude-o-estafa/', origen: 'Oficial · bcra.gob.ar', titulo: 'Reclamo ante el Banco Central por fraude o estafa', c: '#fbbf24' },
    consumidor: { href: 'https://www.argentina.gob.ar/servicio/iniciar-un-reclamo-ante-defensa-del-consumidor', origen: 'Oficial · argentina.gob.ar', titulo: 'Reclamo ante Defensa del Consumidor', c: '#fbbf24' },
    whatsapp: { href: 'https://faq.whatsapp.com/1131652977717250/?locale=es_LA', origen: 'Oficial · whatsapp.com', titulo: 'Cómo recuperar o proteger tu cuenta de WhatsApp', c: '#fbbf24' }
};

function mostrar(v) {
    VISTAS.forEach((n) => { $('vista-' + n).hidden = n !== v; });
    $('error').hidden = true;
}
function error(t) { $('error').textContent = t; $('error').hidden = false; }
const abrir = (url) => chrome.tabs.create({ url });

// ---------- Estado de la cuenta (cupo y WhatsApp vinculado) ----------
async function pintarEstado() {
    const { status, datos } = await estado();
    if (status !== 200) return;
    const cupo = $('cupo');
    cupo.hidden = false;
    cupo.classList.toggle('pro', Boolean(datos.suscripto));
    cupo.textContent = datos.suscripto ? 'Suscripción activa' : `${datos.restantes} de ${datos.gratis} gratis`;
    // El botón de suscripción solo aparece cuando se agotan las consultas gratis (no antes de dar valor).
    $('b-suscribir-bar').hidden = Boolean(datos.suscripto) || datos.restantes > 0;
    const pie = $('pie-cuenta');
    pie.textContent = '';
    if (datos.vinculado) {
        pie.append('WhatsApp ' + datos.telefono + ' · ');
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = 'Desvincular';
        b.onclick = async () => { await desvincular(); pintarEstado(); };
        pie.append(b);
    } else {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = '¿Ya sos cliente? Vinculá tu WhatsApp';
        b.onclick = iniciarVinculo;
        pie.append(b);
    }
}

// ---------- Consulta ----------
async function verificar(consulta) {
    if (!consulta || (!consulta.valor && !consulta.archivo)) return error('Pegá algo para verificar.');
    ultimo = consulta;
    $('cargando-txt').textContent = consulta.tipo === 'archivo' ? 'Vera está mirando la imagen o el archivo…' : 'Vera lo está revisando por dentro…';
    correrTerminal(consulta.tipo);
    mostrar('cargando');
    const { status, datos } = await consultar(consulta);
    pintarEstado();
    if (status === 200 && datos.resultado) { cerrarLienzo(datos.resultado); return pintarResultado(datos.resultado); }
    reposoLienzo();
    if (status === 402) return irAPago();
    if (status === 409 && datos.codigo === 'solo_whatsapp') { mostrar('inicio'); return error('Los audios se analizan por WhatsApp: reenviáselo a Vera al +54 9 11 7059-8505.'); }
    mostrar('inicio');
    error(datos.error || 'No pude completar el análisis. Probá de nuevo en un rato.');
}

// ---------- Lienzo de herramientas (a un costado): se enciende solo lo que usa la consulta ----------
// Herramientas de Vera (capacidades). Nada de pagos ni del flujo interno: solo lo que analiza.
const HERR = [
    { id: 'vt', n: 'VirusTotal', s: '70+ motores antivirus', c: '#a78bfa', g: 'VT' },
    { id: 'cf', n: 'Cloudflare', s: 'dominios bloqueados', c: '#fbbf24', g: 'CF' },
    { id: 'ps', n: 'PhishStats', s: 'phishing activo', c: '#f43f5e', g: 'PS' },
    { id: 'rd', n: 'RDAP · WHOIS', s: 'antigüedad del sitio', c: '#22d3ee', g: 'DN' },
    { id: 'fi', n: 'Filtraciones', s: 'mails filtrados', c: '#f472b6', g: 'FL' },
    { id: 'ga', n: 'Gemini', s: 'lee texto e imágenes', c: '#22d3ee', g: 'GE' },
    { id: 'tv', n: 'Tavily', s: 'denuncias en la web', c: '#a78bfa', g: 'TV' }
];
// Qué herramientas usa Vera según el tipo de consulta (por diseño). Si el backend informa
// `herramientas` en el resultado, se muestran esas, que son las realmente usadas.
const POR_TIPO = {
    link: ['cf', 'vt', 'ps', 'rd', 'tv'], cbu: ['tv'], tel: ['tv'], email: ['fi'],
    archivo: ['ga', 'vt', 'rd', 'tv'], mensaje: ['vt', 'tv']
};
const NS = 'http://www.w3.org/2000/svg', PASO = 52, NW = 170, NX = 150;
let activas = [];
function armarLienzo() {
    const cv = $('canvas'), h = HERR.length * PASO + 8;
    cv.style.minHeight = h + 'px';
    const svg = $('hilos'); svg.setAttribute('width', 330); svg.setAttribute('height', h); svg.style.width = '330px'; svg.style.height = h + 'px'; svg.textContent = '';
    const ag = $('agente'); ag.style.top = (h / 2 - 56) + 'px';
    const ax = 96, ay = h / 2;
    const nodos = $('nodos'); nodos.textContent = '';
    HERR.forEach((t, i) => {
        const y = 4 + i * PASO, cy = y + 22;
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', `M${ax} ${ay} C ${ax + 40} ${ay}, ${NX - 40} ${cy}, ${NX} ${cy}`);
        path.setAttribute('class', 'hilo'); path.id = 'h-' + t.id; path.style.setProperty('--c', t.c);
        svg.append(path);
        const d = document.createElement('div');
        d.className = 'nodo'; d.id = 'n-' + t.id; d.style.top = y + 'px'; d.style.setProperty('--c', t.c);
        const ic = document.createElement('i'); ic.textContent = t.g;
        const tx = document.createElement('div');
        const b = document.createElement('b'); b.textContent = t.n;
        const sm = document.createElement('small'); sm.textContent = t.s;
        tx.append(b, sm); d.append(ic, tx); nodos.append(d);
    });
    // Investigación: Tavily busca y Gemini lo lee (se dibuja solo cuando ambas están activas).
    const yt = 4 + HERR.findIndex((t) => t.id === 'tv') * PASO + 22, yg = 4 + HERR.findIndex((t) => t.id === 'ga') * PASO + 22;
    const enlace = document.createElementNS(NS, 'path');
    enlace.setAttribute('d', `M${NX + NW} ${yt} C ${NX + NW + 9} ${yt}, ${NX + NW + 9} ${yg}, ${NX + NW} ${yg}`);
    enlace.setAttribute('class', 'hilo'); enlace.id = 'h-tvga'; enlace.style.setProperty('--c', '#22d3ee');
    svg.append(enlace);
}
function pintarLienzo(estados, leyenda, agente) {
    HERR.forEach((t) => {
        const n = $('n-' + t.id), h = $('h-' + t.id), e = estados[t.id] || '';
        n.className = 'nodo' + (e ? ' act' : '') + (e === 'ok' ? ' ok' : '');
        h.setAttribute('class', 'hilo' + (e ? ' act' : '') + (e === 'ok' ? ' ok' : ''));
    });
    const both = estados.tv && estados.ga;
    $('h-tvga').setAttribute('class', 'hilo' + (both ? ' act' : '') + (both && estados.tv === 'ok' && estados.ga === 'ok' ? ' ok' : ''));
    $('agente').classList.toggle('run', agente === 'run');
    $('ag-st').textContent = { run: 'ANALIZANDO', ok: 'LISTO', idle: 'EN ESPERA' }[agente] || 'EN ESPERA';
    if (leyenda) $('leyenda').textContent = leyenda;
}
// Mientras analiza: va encendiendo, una por una, las herramientas que usa Vera para este tipo de consulta.
function correrTerminal(tipo) {
    activas = (POR_TIPO[tipo] || POR_TIPO.mensaje).slice();
    const estados = {}; let i = 0;
    clearInterval(giro);
    pintarLienzo(estados, 'Herramientas que Vera usa para este tipo de consulta.', 'run');
    const paso = () => {
        if (i > 0) estados[activas[i - 1]] = 'ok';
        if (i < activas.length) estados[activas[i]] = 'run';
        i++;
        pintarLienzo(estados, null, 'run');
        if (i > activas.length) clearInterval(giro);
    };
    paso();
    giro = setInterval(paso, 1100);
}
function cerrarLienzo(res) {
    clearInterval(giro);
    const reales = Array.isArray(res && res.herramientas) ? res.herramientas.filter((x) => HERR.some((t) => t.id === x)) : [];
    const ids = reales.length ? reales : activas;
    const estados = {}; ids.forEach((x) => { estados[x] = 'ok'; });
    pintarLienzo(estados, reales.length ? 'Herramientas que usó Vera en tu consulta.' : 'Herramientas que Vera usa para este tipo de consulta.', 'ok');
}
function reposoLienzo() { clearInterval(giro); pintarLienzo({}, 'Se enciende solo lo que usa tu consulta.', 'idle'); }

// Pago según el país: Argentina ve Mercado Pago (pesos); el resto, el plan en USD.
function irAPago() {
    $('pago-ar').hidden = PAIS !== 'AR';
    $('pago-int').hidden = PAIS === 'AR';
    mostrar('pago');
}

// Fuentes consultadas como evidencia. Si el backend manda fuentes/evidencia reales, las usa; si no, las de este tipo.
function pintarFuentes(r) {
    const ul = $('r-fuentes'); ul.textContent = '';
    const tipo = (ultimo && ultimo.tipo) || 'mensaje';
    const ev = Array.isArray(r.fuentes) ? r.fuentes : (Array.isArray(r.evidencia) ? r.evidencia : null);
    const items = (ev && ev.length)
        ? ev.map((e) => [String(e.nombre || e.fuente || 'Fuente'), String(e.detalle || e.texto || e.resultado || '')])
        : (FUENTES[tipo] || FUENTES.mensaje);
    items.forEach(([n, d]) => {
        const li = document.createElement('li');
        const b = document.createElement('b'); b.textContent = n;
        li.append(b);
        if (d) { const s = document.createElement('small'); s.textContent = d; li.append(s); }
        ul.append(li);
    });
    $('r-fuentes-box').hidden = !items.length;
}

// Dominio engañoso: detecta links que imitan a otro sitio con Punycode (IDN) o caracteres no latinos
// (homógrafos, p. ej. una "а" cirílica en vez de la "a"). Es un chequeo local, antes de confiar en el dominio.
function dominioEnganoso(valor) {
    try {
        let host = String(valor || '');
        const m = host.match(/^(?:[a-z][a-z0-9+.-]*:\/\/)?([^/\s?#]+)/i);
        host = (m ? m[1] : host).split('@').pop().split(':')[0].trim().toLowerCase();
        if (!host || host.indexOf('.') === -1) return null;
        if (/(^|\.)xn--/.test(host)) return 'punycode';                 // dominio IDN (puede imitar a otro)
        if (/[^\u0000-\u007F]/.test(host)) {                            // tiene caracteres no ASCII
            if (/[a-z]/.test(host) && /[Ѐ-ӿͰ-Ͽ]/.test(host)) return 'mixto'; // latino + cirílico/griego
            return 'nolatino';
        }
        return null;
    } catch { return null; }
}

const NIVELES = { alto: 'Riesgo alto', medio: 'Precaución', bajo: 'Sin señales de riesgo', desconocido: 'Sin datos suficientes' };
function pintarResultado(r) {
    const res = $('res');
    res.className = 'res ' + (NIVELES[r.nivel] ? r.nivel : 'desconocido');
    $('r-nivel').textContent = NIVELES[r.nivel] || NIVELES.desconocido;
    $('r-titulo').textContent = r.titulo || '';
    $('r-resumen').textContent = r.resumen || '';
    const ul = $('r-hallazgos'); ul.textContent = '';
    const hall = [...(r.hallazgos || [])];
    const eng = (ultimo && (ultimo.tipo === 'link' || ultimo.tipo === 'email')) ? dominioEnganoso(ultimo.valor) : null;
    if (eng) hall.unshift({ tipo: 'peligro', texto: 'El dominio usa caracteres engañosos' + (eng === 'punycode' ? ' (Punycode/IDN)' : '') + ': puede estar imitando a otro sitio real. Miralo letra por letra antes de confiar.' });
    hall.forEach((h) => { const li = document.createElement('li'); li.className = h.tipo; li.textContent = h.texto; ul.append(li); });
    $('r-hallazgos-box').hidden = !hall.length;
    const ol = $('r-pasos'); ol.textContent = '';
    (r.pasos || []).forEach((p) => { const li = document.createElement('li'); li.textContent = p; ol.append(li); });
    $('r-pasos-box').hidden = !(r.pasos || []).length;
    ultimoRes = r;
    pintarFuentes(r);
    pintarContexto(r);
    mostrar('resultado');
}

// Links para que la persona entienda de qué se trata: la ficha del Observatorio, la guía que corresponde y, si hay riesgo, dónde denunciar.
function linksDeContexto(r) {
    const tipo = (ultimo && ultimo.tipo) || 'mensaje';
    const texto = [r.titulo, r.resumen, r.modalidad && r.modalidad.nombre, r.modalidad && r.modalidad.slug, ...(r.hallazgos || []).map((h) => h.texto)].join(' ').toLowerCase();
    const hay = (re) => re.test(texto);
    const L = [];
    if (r.modalidad && /^[a-z0-9-]{3,60}$/.test(r.modalidad.slug || '')) {
        L.push({ href: `${BASE}/observatorio/${r.modalidad.slug}?o=extension`, origen: 'Observatorio de Fraude Digital', titulo: `Cómo funciona "${r.modalidad.nombre || 'esta estafa'}" y cómo evitarla`, c: '#f472b6' });
    }
    if (tipo === 'cbu' || hay(/\bcbu\b|\bcvu\b|alias|transfer/)) L.push(G.cbu);
    if (tipo === 'tel' || hay(/tel[eé]fono|n[uú]mero desconocido|llamad/)) L.push(G.tel);
    if (tipo === 'link' || tipo === 'email' || hay(/phishing|suplant|banco|pami|arca|anses|clave|contrase/)) L.push(G.phishing);
    if (hay(/whatsapp/)) L.push(G.whatsapp);
    if (L.length < 2) L.push(G.general);
    if (r.nivel === 'alto' || r.nivel === 'medio') {
        L.push(G.victima);
        if (hay(/secuestro|c[oó]digo de verificaci|cuenta de whatsapp/)) L.push(OFICIAL.whatsapp);
        if (PAIS === 'AR') {   // las denuncias oficiales de abajo son de Argentina
            if (hay(/tienda|compra|venta|producto|env[ií]o|mercado libre/)) L.push(OFICIAL.consumidor);
            if (tipo === 'cbu' || hay(/banco|transfer|\bcbu\b|\bcvu\b|tarjeta|homebanking/)) L.push(OFICIAL.bcra);
            L.push(OFICIAL.denuncia);
        }
    }
    return [...new Map(L.map((x) => [x.href, x])).values()].slice(0, 5);
}
function pintarContexto(r) {
    const caja = $('r-contexto'); caja.textContent = '';
    const L = linksDeContexto(r);
    L.forEach((x) => {
        const a = document.createElement('a');
        a.className = 'link'; a.href = x.href; a.target = '_blank'; a.rel = 'noopener';
        a.style.setProperty('--c', x.c);
        const d = document.createElement('div');
        const sm = document.createElement('small'); sm.textContent = x.origen;
        const b = document.createElement('b'); b.textContent = x.titulo;
        d.append(sm, b);
        const fl = document.createElement('span'); fl.className = 'fl'; fl.textContent = '↗';
        a.append(d, fl);
        caja.append(a);
    });
    $('r-contexto-box').hidden = !L.length;
}

// Aviso para la familia por WhatsApp: sin los datos de la consulta, solo el tipo de estafa.
function avisarFamilia() {
    const r = ultimoRes || {};
    const nivel = { alto: 'una estafa', medio: 'sospechoso' }[r.nivel];
    const que = (r.modalidad && r.modalidad.nombre) || r.titulo || 'un mensaje raro';
    const msg = nivel
        ? `Ojo: me llegó algo de "${que}" y Vera lo marcó como ${nivel}. Si te llega algo parecido, no hagas clic ni transfieras. Antes, verificalo gratis con Vera: ${BASE}/vera?o=extension`
        : `Te paso a Vera, la especialista en estafas: verificás links, CBU, teléfonos y capturas antes de hacer clic o transferir. ${BASE}/vera?o=extension`;
    abrir('https://wa.me/?text=' + encodeURIComponent(msg));
}

// Tarjetas de capacidades: cada una lleva directo a la acción.
function pintarCapacidades() {
    const caja = $('caps');
    CAPS.forEach((x) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'cap'; b.style.setProperty('--c', x.c);
        const n = document.createElement('span'); n.className = 'n'; n.textContent = x.n;
        const d = document.createElement('span');
        const t = document.createElement('b'); t.textContent = x.t;
        const sm = document.createElement('small'); sm.textContent = x.d;
        d.append(t, sm);
        const ir = document.createElement('span'); ir.className = 'ir'; ir.textContent = x.ir + ' →';
        b.append(n, d, ir);
        b.onclick = () => {
            if (!x.ph) return tabActual ? capturarPantalla() : $('archivo').click();
            const ta = $('texto'); ta.placeholder = x.ph; ta.focus();
            ta.scrollIntoView({ block: 'center', behavior: 'smooth' });
        };
        caja.append(b);
    });
}

// ---------- Archivos y captura ----------
function leerArchivo(f) {
    return new Promise((ok, mal) => {
        if (f.size > 3 * 1024 * 1024) return mal(new Error('El archivo supera los 3 MB.'));
        const fr = new FileReader();
        fr.onload = () => { const d = String(fr.result); ok({ nombre: f.name, mime: f.type || 'application/octet-stream', datos: d.slice(d.indexOf(',') + 1) }); };
        fr.onerror = () => mal(new Error('No pude leer el archivo.'));
        fr.readAsDataURL(f);
    });
}
async function capturarPantalla() {
    try {
        const d = await chrome.tabs.captureVisibleTab(tabActual ? tabActual.windowId : undefined, { format: 'jpeg', quality: 70 });
        verificar({ tipo: 'archivo', archivo: { nombre: 'captura.jpg', mime: 'image/jpeg', datos: d.slice(d.indexOf(',') + 1) } });
    } catch {
        error('No pude sacar la captura de esta pestaña. Probá en una página web común.');
    }
}

// ---------- Vincular WhatsApp ----------
async function iniciarVinculo() {
    mostrar('vincular');
    $('v-codigo').textContent = '…';
    $('v-estado').textContent = 'Pidiendo el código…';
    const { status, datos } = await vincularIniciar();
    if (status !== 200) { $('v-estado').textContent = datos.error || 'No pude generar el código. Probá de nuevo.'; return; }
    $('v-codigo').textContent = datos.codigo;
    $('v-estado').textContent = 'Esperando el mensaje… (el código vence en 15 minutos)';
    $('b-enviar-codigo').onclick = () => { if (/^https:\/\/wa\.me\/\d+\?text=/.test(String(datos.whatsapp))) abrir(datos.whatsapp); };
    clearInterval(sondeo);
    const fin = Date.now() + datos.vence * 1000;
    sondeo = setInterval(async () => {
        if (Date.now() > fin) { clearInterval(sondeo); $('v-estado').textContent = 'El código venció. Volvé a intentarlo.'; return; }
        const r = await vincularEstado(datos.codigo);
        if (r.status === 200 && r.datos.vinculado) {
            clearInterval(sondeo);
            $('v-estado').textContent = r.datos.suscripto ? '¡Listo! Tu suscripción ya funciona en el navegador.' : 'WhatsApp vinculado. Todavía no vemos una suscripción activa en ese número.';
            pintarEstado();
            setTimeout(() => mostrar('inicio'), 2500);
        } else if (r.status >= 400) { clearInterval(sondeo); $('v-estado').textContent = r.datos.error || 'No pude confirmar la vinculación.'; }
    }, 3000);
}

// ---------- Arranque ----------
$('b-verificar').onclick = () => {
    const t = $('texto').value.trim();
    if (!t) return error('Pegá algo para verificar.');
    verificar(detectar(t));
};
$('texto').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('b-verificar').click(); });
$('archivo').onchange = async (e) => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    try { verificar({ tipo: 'archivo', archivo: await leerArchivo(f) }); } catch (err) { error(err.message); }
};
$('b-pagina').onclick = () => tabActual && verificar({ tipo: 'link', valor: tabActual.url });
$('b-pantalla').onclick = capturarPantalla;
$('b-otra').onclick = () => { $('texto').value = ''; mostrar('inicio'); };
$('b-avisar').onclick = avisarFamilia;
$('l-observatorio').href = BASE + '/observatorio?o=extension';
$('l-web').href = BASE + '/?o=extension';
pintarCapacidades();
armarLienzo(); reposoLienzo();
$('b-suscribir').onclick = () => abrir(WA_SUSCRIBIR);
$('b-suscribir-int').onclick = () => abrir(PADDLE_CHECKOUT || AVISO_INT);
$('b-suscribir-bar').onclick = irAPago;
$('b-compartir').onclick = () => {
    const msg = PAIS === 'AR'
        ? `Te paso a Vera, la IA antiestafas: verificás links, CBU, teléfonos y capturas antes de hacer clic o transferir. Agregala a tu navegador gratis: ${BASE}/chrome`
        : `Meet Vera, the anti-scam AI: check links, accounts, phone numbers and screenshots before you click or pay. Add it to your browser for free: ${BASE}/chrome`;
    abrir('https://wa.me/?text=' + encodeURIComponent(msg));
};
$('b-ya-soy').onclick = iniciarVinculo;
$('b-volver').onclick = () => { clearInterval(sondeo); if (ultimo) irAPago(); else mostrar('inicio'); };

(async () => {
    try { const { CM_PADDLE } = await chrome.storage.local.get('CM_PADDLE'); if (typeof CM_PADDLE === 'string' && /^https:\/\//.test(CM_PADDLE)) PADDLE_CHECKOUT = CM_PADDLE; } catch { /* sin override */ }
    if (params.get('ventana') || params.get('bienvenida')) document.body.classList.add('ventana');
    if (params.get('bienvenida')) {
        $('hero-tag').textContent = 'LISTO · VERA YA ESTÁ INSTALADA';
        $('hero-titulo').innerHTML = 'Ya tenés a <span class="grad">Vera</span> en tu navegador.';
        $('hero-sub').hidden = false;
        $('como-se-usa').hidden = false;
    }
    pintarEstado();
    if (params.get('ventana')) {
        const { pendiente } = await chrome.storage.session.get('pendiente');
        await chrome.storage.session.remove('pendiente');
        if (pendiente && pendiente.error) { mostrar('inicio'); return error(pendiente.error); }
        if (pendiente && Date.now() - pendiente.t < 60000) return verificar(pendiente);
        return mostrar('inicio');
    }
    // Ventanita del ícono: ofrecer la página donde está la persona.
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && /^https?:\/\//.test(tab.url || '')) {
            tabActual = tab;
            $('dominio').textContent = new URL(tab.url).hostname;
            $('pagina').hidden = false;
        }
    } catch { /* sin pestaña: solo el cuadro de texto */ }
    mostrar('inicio');
})();
