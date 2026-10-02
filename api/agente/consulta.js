// Consulta al agente web: navegador -> esta función -> webhook de n8n firmado con HMAC.
// Controla el cupo gratis (por navegador y por IP) y, si la persona vinculó su
// WhatsApp, deja que n8n confirme la suscripción. Nunca registra en logs el dato verificado.
import crypto from 'node:crypto';
import { validar } from '../_lib/validar.js';
import {
    redis, configurado, urlN8n, responder, ipDe, origenPermitido, sesionOCrear, reservarGratis, devolverGratis,
    excedeLimite, estadoSuscripcion, guardarEstado, firmaN8n, normalizarWeb, ESTADOS_CON_ACCESO, GRATIS, MIMES, MAX_ARCHIVO, gratisUsadas, tokenSesion
} from '../_lib/agente.js';

const TIMEOUT_MS = 55000;
const LIMITES = [{ ventana: 60, max: 5 }, { ventana: 3600, max: 30 }, { ventana: 86400, max: 80 }];
const TIPOS = { link: 'link', cbu: 'cbu', tel: 'telefono', telefono: 'telefono', email: 'email', mensaje: 'mensaje' };
const ERROR_GENERICO = 'No pude completar el análisis. Probá de nuevo en un rato.';

function validarArchivo(a) {
    if (!a || typeof a !== 'object') return { ok: false, error: 'Falta el archivo.' };
    const nombre = String(a.nombre || 'archivo').replace(/[^\w.\- ]+/g, '_').slice(0, 120);
    const mime = String(a.mime || '').toLowerCase();
    if (/^audio\//.test(mime) || /\.(mp3|ogg|opus|m4a|wav|aac)$/i.test(nombre)) {
        return { ok: false, codigo: 'solo_whatsapp', error: 'Los audios se analizan en WhatsApp.' };
    }
    const apk = /\.apk$/i.test(nombre);
    const tipo = MIMES[mime] || (apk ? 'documento' : '');
    if (!tipo) return { ok: false, error: 'Ese tipo de archivo no se puede analizar. Probá con una captura, un PDF o un APK.' };
    const datos = String(a.datos || '');
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(datos)) return { ok: false, error: 'El archivo llegó dañado. Probá de nuevo.' };
    const bytes = Math.floor(datos.length * 3 / 4);
    if (bytes > MAX_ARCHIVO) return { ok: false, error: 'El archivo supera los 3 MB.' };
    if (bytes < 100) return { ok: false, error: 'El archivo está vacío.' };
    return { ok: true, archivo: { nombre, mime: mime || 'application/octet-stream', tipo, base64: datos } };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return responder(res, 405, { error: 'Método no permitido' }); }
    if (!origenPermitido(req)) return responder(res, 403, { error: 'Origen no permitido' });
    if (!configurado()) return responder(res, 503, { codigo: 'no_configurado', error: 'Vera web se está terminando de configurar. Mientras tanto, escribile por WhatsApp.' });

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { return responder(res, 400, { error: 'Pedido inválido.' }); } }
    if (!body || typeof body !== 'object') return responder(res, 400, { error: 'Pedido inválido.' });

    // 1) Validar lo que se quiere verificar
    let consulta;
    if (body.tipo === 'archivo') {
        const v = validarArchivo(body.archivo);
        if (!v.ok) return responder(res, v.codigo ? 409 : 400, { codigo: v.codigo || 'invalido', error: v.error });
        consulta = { tipo: 'archivo', archivo: v.archivo };
    } else {
        const tipo = TIPOS[body.tipo];
        const v = validar(tipo, body.valor);
        if (!v.ok) return responder(res, 400, { codigo: 'invalido', error: v.error });
        consulta = { tipo, valor: v.valor };
    }

    const r = redis();
    const ip = ipDe(req);
    const s = sesionOCrear(req, res);
    try {
        if (await excedeLimite(r, 'ip:' + ip, LIMITES)) return responder(res, 429, { codigo: 'limite', error: 'Hiciste muchas consultas seguidas. Esperá unos minutos.' });
    } catch (e) { console.error('agente/consulta: límite no disponible:', e.message); }

    // 2) ¿Con qué cupo entra? Suscripción (lo confirma n8n) o consulta gratis.
    let modo = 'gratis', reservada = false;
    try {
        const estado = await estadoSuscripcion(r, s.tel);
        if (s.tel && (ESTADOS_CON_ACCESO.includes(estado) || !estado)) modo = 'suscripcion';   // sin dato: que lo confirme n8n
        else if (await reservarGratis(r, s, ip)) reservada = true;
        else if (s.tel) modo = 'suscripcion';   // sin gratis: n8n revisa si ya pagó
        else return responder(res, 402, { codigo: 'sin_cupo', error: 'Usaste tus consultas gratis.', sesion: tokenSesion(s) });
    } catch (e) {
        console.error('agente/consulta: redis:', e.message);
        return responder(res, 503, { error: ERROR_GENERICO });
    }

    // 3) Reenviar a n8n firmado
    const id = crypto.randomUUID();
    async function llamarN8n(modoEnvio) {
        const cuerpo = JSON.stringify({ id, origen: 'web', modo: modoEnvio, telefono: s.tel || undefined, ...consulta });
        const ts = String(Math.floor(Date.now() / 1000));
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
        try {
            const resp = await fetch(urlN8n(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CM-Timestamp': ts, 'X-CM-Signature': firmaN8n(cuerpo, ts), 'X-CM-Request-Id': id },
                body: cuerpo,
                signal: ctrl.signal
            });
            const texto = await resp.text();
            let datos = null;
            try { datos = JSON.parse(texto.slice(0, 50000)); } catch { /* se informa abajo */ }
            return { ok: resp.ok && Boolean(datos), status: resp.status, datos };
        } finally { clearTimeout(timer); }
    }
    let ok = false;
    try {
        let rta = await llamarN8n(modo);
        if (rta.ok && rta.datos.estadoSuscripcion !== undefined && s.tel) await guardarEstado(r, s.tel, rta.datos.estadoSuscripcion);
        // Vinculado pero sin suscripción activa: si le quedan gratis, se usa una.
        if (rta.ok && rta.datos.acceso === 'denegado' && !reservada && await reservarGratis(r, s, ip)) {
            reservada = true; modo = 'gratis';
            rta = await llamarN8n(modo);
        }
        if (!rta.ok) {
            console.error('agente/consulta: n8n respondió', rta.status, 'id', id);
            return responder(res, 502, { codigo: 'upstream', error: ERROR_GENERICO });
        }
        if (rta.datos.acceso === 'denegado') {
            return responder(res, 402, { codigo: 'sin_cupo', error: 'Usaste tus consultas gratis.', vinculado: Boolean(s.tel), sesion: tokenSesion(s) });
        }
        ok = true;
        const usadas = await gratisUsadas(r, s);
        return responder(res, 200, { id, modo, restantes: Math.max(0, GRATIS - usadas), resultado: normalizarWeb(rta.datos), sesion: tokenSesion(s) });
    } catch (e) {
        const timeout = e.name === 'AbortError';
        console.error('agente/consulta:', timeout ? 'timeout' : e.message, 'id', id);
        return responder(res, timeout ? 504 : 502, { codigo: timeout ? 'timeout' : 'upstream', error: timeout ? 'El análisis tardó demasiado. Probá de nuevo.' : ERROR_GENERICO });
    } finally {
        if (!ok && reservada) { try { await devolverGratis(r, s, ip); } catch { /* no bloquea */ } }
    }
}
