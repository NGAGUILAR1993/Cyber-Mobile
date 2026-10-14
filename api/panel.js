// Números para el panel del staff en WhatsApp (/numeros en el chat de Vera).
// Solo lo llama n8n: exige el secreto compartido (N8N_SHARED_SECRET = CM_SHARED_SECRET de n8n)
// en la cabecera Authorization: Bearer <secreto>. No devuelve datos personales: solo conteos.
//
// Respuesta: { dias: [{ fecha, clics: { origen: n } }], total, porOrigen, eventos: { evento: n } }
import crypto from 'node:crypto';
import Redis from 'ioredis';

const DIAS_MAX = 31;

let redisClient;
function redis() {
    if (!redisClient && process.env.REDIS_URL) redisClient = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, connectTimeout: 2000 });
    return redisClient;
}

function autorizado(req) {
    const s = process.env.N8N_SHARED_SECRET || '';
    if (s.length < 32) return false;
    const dado = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const a = crypto.createHash('sha256').update(dado).digest();
    const b = crypto.createHash('sha256').update(s).digest();
    return crypto.timingSafeEqual(a, b);
}

function fechaAr(d) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(d);
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Método no permitido' }); }
    if (!autorizado(req)) return res.status(401).json({ error: 'Acceso denegado' });

    const n = Math.min(DIAS_MAX, Math.max(1, parseInt(String((req.query && req.query.dias) || '7'), 10) || 7));
    const r = redis();
    if (!r) return res.status(503).json({ error: 'Sin base de datos' });

    try {
        const fechas = [];
        for (let i = 0; i < n; i++) fechas.push(fechaAr(new Date(Date.now() - i * 86400000)));
        const p = r.pipeline();
        fechas.forEach((f) => p.hgetall(`cm:vera:clics:${f}`));
        const filas = await p.exec();

        const porOrigen = {};
        let total = 0;
        const dias = fechas.map((fecha, i) => {
            const crudo = (filas[i] && filas[i][1]) || {};
            const clics = {};
            for (const [k, v] of Object.entries(crudo)) {
                const c = parseInt(v, 10) || 0;
                clics[k] = c;
                porOrigen[k] = (porOrigen[k] || 0) + c;
                total += c;
            }
            return { fecha, clics };
        });

        // Eventos de la web (cyber_events) del mismo período, solo por nombre.
        const desde = Date.now() - n * 86400000;
        const eventos = {};
        const lista = await r.lrange('cyber_events', 0, 4999);
        for (const item of lista) {
            try {
                const e = JSON.parse(item);
                if (Date.parse(e.timestamp) < desde) break;
                if (/^[a-z0-9_]{1,40}$/.test(e.event)) eventos[e.event] = (eventos[e.event] || 0) + 1;
            } catch { /* evento dañado: se ignora */ }
        }

        return res.status(200).json({ dias, total, porOrigen, eventos });
    } catch (e) {
        console.error('panel.js:', e.message);
        return res.status(503).json({ error: 'No se pudieron leer los números' });
    }
}
