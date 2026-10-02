// Utilidades del agente web (/agente): sesión firmada, cupo gratis, firma para n8n
// y normalización de la respuesta.
//
// Variables de entorno (Vercel):
//   N8N_SHARED_SECRET  secreto compartido con n8n (mín. 32 caracteres). También
//                      firma la cookie de sesión (con una clave derivada).
//   N8N_WEB_URL        webhook de n8n del agente web. Si falta, usa N8N_VERIFY_URL.
//   REDIS_URL          Redis para cupos, límites y vinculación.
import crypto from 'node:crypto';
import Redis from 'ioredis';

export const GRATIS = 2;                 // consultas gratis por navegador
export const GRATIS_POR_IP = 6;          // tope de consultas gratis por IP y por mes
export const COOKIE = 'cm_agente';
const COOKIE_DIAS = 180;
export const WA_AGENTE = '5491170598505';

let redisClient;
export function redis() {
    if (!redisClient && process.env.REDIS_URL) redisClient = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2 });
    return redisClient;
}

export function secreto() {
    const s = process.env.N8N_SHARED_SECRET || '';
    return s.length >= 32 ? s : '';
}
export function urlN8n() {
    const u = process.env.N8N_WEB_URL || process.env.N8N_VERIFY_URL || '';
    return /^https:\/\//.test(u) ? u : '';
}
export const configurado = () => Boolean(secreto() && urlN8n() && process.env.REDIS_URL);

export function responder(res, status, cuerpo) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(status).json(cuerpo);
}

export function ipDe(req) {
    return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'desconocida').split(',')[0].trim();
}

// Solo el propio sitio (y sus vistas previas) puede llamar a la API desde el navegador.
const ORIGENES = [
    /^https:\/\/(www\.)?cybermobile\.com\.ar$/,
    /^https:\/\/cyber-mobile[a-z0-9-]*-ngaguilar1993s-projects\.vercel\.app$/
];
export function origenPermitido(req) {
    const o = req.headers.origin;
    if (!o) return true;   // mismo origen en GET o navegadores que no lo mandan
    if (process.env.AGENTE_ORIGEN_LOCAL && o === process.env.AGENTE_ORIGEN_LOCAL) return true;
    return ORIGENES.some((re) => re.test(o));
}

// ---------- Sesión: cookie firmada { id, tel } ----------
const b64u = (b) => Buffer.from(b).toString('base64url');
function claveCookie() {
    return crypto.createHmac('sha256', secreto()).update('cookie-agente-web-v1').digest();
}
function firmar(texto) {
    return crypto.createHmac('sha256', claveCookie()).update(texto).digest('base64url');
}
// La sesión viaja en la cookie y, como respaldo, en la cabecera X-CM-Sesion que la página
// guarda en el navegador (algunos navegadores o extensiones descartan la cookie).
function sesionDeToken(token) {
    if (!token || !secreto()) return null;
    const [datos, firma] = String(token).split('.');
    if (!datos || !firma) return null;
    const esperada = firmar(datos);
    if (firma.length !== esperada.length || !crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada))) return null;
    try {
        const s = JSON.parse(Buffer.from(datos, 'base64url').toString('utf8'));
        if (!s || typeof s.id !== 'string' || !/^[a-f0-9]{32}$/.test(s.id)) return null;
        if (s.tel && !/^\d{10,15}$/.test(s.tel)) return null;
        return { id: s.id, tel: s.tel || '' };
    } catch { return null; }
}
export function leerSesion(req) {
    const crudo = String(req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
    return sesionDeToken(crudo && crudo.slice(COOKIE.length + 1)) || sesionDeToken(req.headers['x-cm-sesion']);
}
export function nuevaSesion() {
    return { id: crypto.randomBytes(16).toString('hex'), tel: '' };
}
export function tokenSesion(s) {
    const datos = b64u(JSON.stringify({ id: s.id, tel: s.tel || undefined }));
    return `${datos}.${firmar(datos)}`;
}
export function guardarSesion(res, s) {
    const valor = tokenSesion(s);
    const seguro = process.env.AGENTE_COOKIE_INSEGURA ? '' : '; Secure';
    res.setHeader('Set-Cookie', `${COOKIE}=${valor}; Path=/api/agente; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_DIAS * 86400}${seguro}`);
}
export function sesionOCrear(req, res) {
    let s = leerSesion(req);
    if (!s) { s = nuevaSesion(); guardarSesion(res, s); }
    return s;
}

// ---------- Cupo gratis y límites ----------
const mesActual = () => new Date().toISOString().slice(0, 7);
export async function gratisUsadas(r, s) {
    return Number(await r.get(`cm_agente:gratis:${s.id}`)) || 0;
}
// Reserva una consulta gratis. Devuelve false si no quedan (por navegador o por IP).
export async function reservarGratis(r, s, ip) {
    const kId = `cm_agente:gratis:${s.id}`, kIp = `cm_agente:gratis_ip:${ip}:${mesActual()}`;
    const [[, nId], [, nIp]] = await r.multi().incr(kId).incr(kIp).exec();
    if (nId === 1) await r.expire(kId, 365 * 86400);
    if (nIp === 1) await r.expire(kIp, 40 * 86400);
    if (nId > GRATIS || nIp > GRATIS_POR_IP) {
        await r.multi().decr(kId).decr(kIp).exec();
        return false;
    }
    return true;
}
export async function devolverGratis(r, s, ip) {
    await r.multi().decr(`cm_agente:gratis:${s.id}`).decr(`cm_agente:gratis_ip:${ip}:${mesActual()}`).exec();
}
export async function excedeLimite(r, clave, limites) {
    const ahora = Math.floor(Date.now() / 1000);
    for (const { ventana, max } of limites) {
        const k = `cm_agente:rl:${clave}:${ventana}:${Math.floor(ahora / ventana)}`;
        const n = await r.incr(k);
        if (n === 1) await r.expire(k, ventana + 30);
        if (n > max) return true;
    }
    return false;
}

// ---------- Suscripción (copia de lo que dice n8n, que es la fuente de verdad) ----------
export const ESTADOS_CON_ACCESO = ['activo', 'prueba', 'staff'];
export async function estadoSuscripcion(r, tel) {
    if (!tel) return '';
    return (await r.get(`cm_agente:sus:${tel}`)) || '';
}
export async function guardarEstado(r, tel, estado) {
    if (!tel) return;
    const e = String(estado || '').toLowerCase().slice(0, 20);
    // n8n lo vuelve a confirmar en cada consulta de un número vinculado.
    await r.set(`cm_agente:sus:${tel}`, e || 'ninguno', 'EX', 30 * 86400);
}
export function telefonoOculto(tel) {
    if (!tel) return '';
    return `+${tel.slice(0, 2)} ${tel.slice(2, 3)} ••• ••• ${tel.slice(-4)}`;
}

// ---------- Firma HMAC (igual que la app: timestamp + "." + cuerpo) ----------
export function firmaN8n(cuerpo, ts) {
    return crypto.createHmac('sha256', secreto()).update(`${ts}.${cuerpo}`).digest('hex');
}
export function firmaValida(req, cuerpoCrudo) {
    const ts = String(req.headers['x-cm-timestamp'] || '');
    const firma = String(req.headers['x-cm-signature'] || '');
    if (!secreto() || !/^\d{9,11}$/.test(ts) || Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
    const esperada = firmaN8n(cuerpoCrudo, ts);
    return firma.length === esperada.length && crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada));
}

// ---------- Vinculación con WhatsApp ----------
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function nuevoCodigo() {
    const b = crypto.randomBytes(6);
    return 'CM-' + Array.from(b, (x) => ALFABETO[x % ALFABETO.length]).join('');
}
export const codigoValido = (c) => /^CM-[A-HJ-NP-Z2-9]{6}$/.test(String(c || ''));

// ---------- Archivos ----------
export const MIMES = {
    'image/jpeg': 'imagen', 'image/png': 'imagen', 'image/webp': 'imagen',
    'application/pdf': 'documento', 'application/msword': 'documento',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'documento',
    'application/zip': 'documento', 'application/x-zip-compressed': 'documento',
    'application/vnd.android.package-archive': 'documento'
};
export const MAX_ARCHIVO = 3 * 1024 * 1024;   // 3 MB (el cuerpo de Vercel admite 4,5 MB en base64)

// ---------- Respuesta de n8n -> tarjeta de la web ----------
// Acepta el formato de la app (veredicto/titulo/explicacion/recomendaciones) y
// el formato extendido (nivel/puntaje/hallazgos/modalidad).
const txt = (s, n) => (typeof s === 'string' ? s.replace(/\s+\n/g, '\n').trim().slice(0, n) : '');
const DE_VEREDICTO = { peligro: 'alto', precaucion: 'medio', seguro: 'bajo', desconocido: 'desconocido' };
const PUNTAJE = { alto: 85, medio: 50, bajo: 12, desconocido: 0 };
export function normalizarWeb(r) {
    r = r && typeof r === 'object' ? r : {};
    let nivel = ['alto', 'medio', 'bajo', 'desconocido'].includes(r.nivel) ? r.nivel : DE_VEREDICTO[r.veredicto] || 'desconocido';
    let puntaje = Number.isFinite(Number(r.puntaje)) ? Math.round(Math.min(100, Math.max(0, Number(r.puntaje)))) : PUNTAJE[nivel];
    if (nivel === 'desconocido') puntaje = 0;
    const hallazgos = (Array.isArray(r.hallazgos) ? r.hallazgos : [])
        .map((h) => (typeof h === 'string' ? { tipo: 'alerta', texto: h } : h))
        .filter((h) => h && typeof h.texto === 'string' && h.texto.trim())
        .slice(0, 8)
        .map((h) => ({ tipo: ['ok', 'alerta', 'peligro'].includes(h.tipo) ? h.tipo : 'alerta', texto: txt(h.texto, 300) }));
    const pasosOrigen = Array.isArray(r.pasos) ? r.pasos : Array.isArray(r.recomendaciones) ? r.recomendaciones : [];
    const pasos = pasosOrigen.map((x) => txt(x, 300)).filter(Boolean).slice(0, 6);
    let modalidad = null;
    if (r.modalidad && typeof r.modalidad === 'object' && /^[a-z0-9-]{3,60}$/.test(String(r.modalidad.slug || ''))) {
        modalidad = { nombre: txt(r.modalidad.nombre, 80), slug: r.modalidad.slug };
    }
    return {
        nivel,
        puntaje,
        titulo: txt(r.titulo, 120) || { alto: 'Alto riesgo de estafa', medio: 'Tené precaución', bajo: 'Sin señales de riesgo', desconocido: 'No pude determinar el riesgo' }[nivel],
        resumen: txt(r.resumen, 1500) || txt(r.explicacion, 1500),
        hallazgos,
        pasos,
        modalidad
    };
}
