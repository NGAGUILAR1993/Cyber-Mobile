// Verificación pedida desde la app Cyber Mobile.
// App -> esta función (Vercel) -> webhook de n8n firmado con HMAC.
// La URL de n8n y el secreto viven solo en variables de entorno de Vercel:
//   N8N_VERIFY_URL     webhook de n8n que hace la verificación
//   N8N_SHARED_SECRET  secreto para firmar cada pedido (mín. 32 caracteres)
// Nunca se registra en logs el dato que la persona verifica.
import crypto from 'node:crypto';
import Redis from 'ioredis';
import { validar, normalizarResultado } from '../_lib/validar.js';

let redisClient;
function redis() {
    if (!redisClient && process.env.REDIS_URL) redisClient = new Redis(process.env.REDIS_URL);
    return redisClient;
}

const MAX_BYTES = 6000;
const LIMITES = [
    { ventana: 60, max: 6 },        // 6 por minuto
    { ventana: 3600, max: 40 }      // 40 por hora
];
const TIMEOUT_MS = 25000;

function responder(res, status, cuerpo) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(status).json(cuerpo);
}

async function excedeLimite(ip) {
    const r = redis();
    if (!r) return false;
    const ahora = Math.floor(Date.now() / 1000);
    for (const { ventana, max } of LIMITES) {
        const clave = `cm_app_rl:${ventana}:${ip}:${Math.floor(ahora / ventana)}`;
        const n = await r.incr(clave);
        if (n === 1) await r.expire(clave, ventana + 30);
        if (n > max) return true;
    }
    return false;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return responder(res, 405, { error: 'Método no permitido' });
    }

    let body = req.body;
    if (typeof body === 'string') {
        if (body.length > MAX_BYTES) return responder(res, 413, { error: 'El pedido es demasiado grande.' });
        try { body = JSON.parse(body); } catch { return responder(res, 400, { error: 'Pedido inválido.' }); }
    }
    if (!body || typeof body !== 'object' || JSON.stringify(body).length > MAX_BYTES) {
        return responder(res, 400, { error: 'Pedido inválido.' });
    }

    const v = validar(body.tipo, body.valor);
    if (!v.ok) return responder(res, 400, { error: v.error, campo: 'valor' });

    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'desconocida').split(',')[0].trim();
    try {
        if (await excedeLimite(ip)) {
            return responder(res, 429, { error: 'Hiciste muchas consultas seguidas. Esperá unos minutos y volvé a intentar.' });
        }
    } catch (e) {
        console.error('verificar: rate limit no disponible:', e.message);
    }

    const url = process.env.N8N_VERIFY_URL;
    const secreto = process.env.N8N_SHARED_SECRET;
    if (!url || !secreto || secreto.length < 32 || !/^https:\/\//.test(url)) {
        return responder(res, 503, {
            error: 'La verificación dentro de la app todavía no está disponible. Podés consultarnos por WhatsApp.',
            codigo: 'no_configurado'
        });
    }

    const id = crypto.randomUUID();
    const payload = JSON.stringify({
        id,
        tipo: body.tipo,
        valor: v.valor,
        origen: 'app',
        version: String(req.headers['x-app-version'] || '').slice(0, 20)
    });
    const ts = String(Math.floor(Date.now() / 1000));
    const firma = crypto.createHmac('sha256', secreto).update(`${ts}.${payload}`).digest('hex');

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CM-Timestamp': ts, 'X-CM-Signature': firma, 'X-CM-Request-Id': id },
            body: payload,
            signal: ctrl.signal
        });
        if (!r.ok) {
            console.error('verificar: n8n respondió', r.status, 'id', id);
            return responder(res, 502, { error: 'No pudimos completar la verificación. Probá de nuevo en un rato.', codigo: 'upstream' });
        }
        const texto = await r.text();
        let datos;
        try { datos = JSON.parse(texto.slice(0, 20000)); } catch {
            console.error('verificar: respuesta de n8n no es JSON, id', id);
            return responder(res, 502, { error: 'No pudimos completar la verificación. Probá de nuevo en un rato.', codigo: 'upstream' });
        }
        return responder(res, 200, { id, tipo: body.tipo, fecha: new Date().toISOString(), ...normalizarResultado(datos) });
    } catch (e) {
        const timeout = e.name === 'AbortError';
        console.error('verificar:', timeout ? 'timeout' : e.message, 'id', id);
        return responder(res, timeout ? 504 : 502, {
            error: timeout ? 'La verificación tardó demasiado. Probá de nuevo.' : 'No pudimos completar la verificación. Probá de nuevo en un rato.',
            codigo: timeout ? 'timeout' : 'upstream'
        });
    } finally {
        clearTimeout(timer);
    }
}
