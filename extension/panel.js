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
const CHEQUEOS = {
    link: ['Reputación del dominio', 'Decenas de antivirus (VirusTotal)', 'Casos reportados en Argentina', 'Modalidades del Observatorio'],
    cbu: ['Formato y banco de la cuenta', 'Reportes de estafa', 'Antigüedad de la cuenta', 'Modalidades del Observatorio'],
    tel: ['Origen del número', 'Reportes de otras personas', 'Modalidades del Observatorio'],
    email: ['Dominio del remitente', 'Filtraciones conocidas', 'Modalidades del Observatorio'],
    archivo: ['Lectura de la imagen o el archivo', 'Links y datos que aparecen', 'Qué te están pidiendo', 'Modalidades del Observatorio'],
    mensaje: ['Lectura del mensaje', 'Links, cuentas y teléfonos que aparecen', 'Qué te están pidiendo', 'Modalidades del Observatorio']
};
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
    const ul = $('chequeos'); ul.textContent = '';
    (CHEQUEOS[consulta.tipo] || CHEQUEOS.mensaje).forEach((t) => { const li = document.createElement('li'); li.textContent = t; ul.append(li); });
    let k = 0;
    clearInterval(giro);
    giro = setInterval(() => { const li = ul.children[k++]; if (li) li.className = 'on'; else clearInterval(giro); }, 1600);
    mostrar('cargando');
    const { status, datos } = await consultar(consulta);
    clearInterval(giro);
    pintarEstado();
    if (status === 200 && datos.resultado) return pintarResultado(datos.resultado);
    if (status === 402) return mostrar('pago');
    if (status === 409 && datos.codigo === 'solo_whatsapp') { mostrar('inicio'); return error('Los audios se analizan por WhatsApp: reenviáselo a Vera al +54 9 11 7059-8505.'); }
    mostrar('inicio');
    error(datos.error || 'No pude completar el análisis. Probá de nuevo en un rato.');
}

const NIVELES = { alto: 'Riesgo alto', medio: 'Precaución', bajo: 'Sin señales de riesgo', desconocido: 'Sin datos suficientes' };
function pintarResultado(r) {
    const res = $('res');
    res.className = 'res ' + (NIVELES[r.nivel] ? r.nivel : 'desconocido');
    $('r-nivel').textContent = NIVELES[r.nivel] || NIVELES.desconocido;
    $('r-titulo').textContent = r.titulo || '';
    $('r-resumen').textContent = r.resumen || '';
    const ul = $('r-hallazgos'); ul.textContent = '';
    (r.hallazgos || []).forEach((h) => { const li = document.createElement('li'); li.className = h.tipo; li.textContent = h.texto; ul.append(li); });
    $('r-hallazgos-box').hidden = !(r.hallazgos || []).length;
    const ol = $('r-pasos'); ol.textContent = '';
    (r.pasos || []).forEach((p) => { const li = document.createElement('li'); li.textContent = p; ol.append(li); });
    $('r-pasos-box').hidden = !(r.pasos || []).length;
    ultimoRes = r;
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
        if (hay(/tienda|compra|venta|producto|env[ií]o|mercado libre/)) L.push(OFICIAL.consumidor);
        if (tipo === 'cbu' || hay(/banco|transfer|\bcbu\b|\bcvu\b|tarjeta|homebanking/)) L.push(OFICIAL.bcra);
        L.push(OFICIAL.denuncia);
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
    $('b-enviar-codigo').onclick = () => abrir(datos.whatsapp);
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
$('b-suscribir').onclick = () => abrir(WA_SUSCRIBIR);
$('b-ya-soy').onclick = iniciarVinculo;
$('b-volver').onclick = () => { clearInterval(sondeo); mostrar(ultimo ? 'pago' : 'inicio'); };

(async () => {
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
