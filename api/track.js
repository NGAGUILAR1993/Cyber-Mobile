import Redis from 'ioredis';

let redisClient;
function getRedisClient() {
    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL);
    }
    return redisClient;
}

// Solo el propio sitio (y sus vistas previas de Vercel) puede enviar eventos.
const ORIGENES = [
    /^https:\/\/(www\.)?cybermobile\.com\.ar$/,
    /^https:\/\/cyber-mobile[a-z0-9-]*-ngaguilar1993s-projects\.vercel\.app$/
];
const MAX_EVENTOS = 50000;      // tamaño máximo de la lista en Redis
const MAX_POR_MINUTO = 60;      // eventos por IP por minuto
const MAX_BYTES = 4096;         // tamaño máximo del cuerpo

function origenPermitido(origin) {
    return !origin || ORIGENES.some((re) => re.test(origin));
}

// Deja solo valores simples y acota su largo para no guardar basura.
function limpiarDetalles(d) {
    const out = {};
    if (!d || typeof d !== 'object' || Array.isArray(d)) return out;
    for (const k of Object.keys(d).slice(0, 10)) {
        if (!/^[A-Za-z0-9_]{1,40}$/.test(k)) continue;
        const v = d[k];
        if (typeof v === 'string') out[k] = v.slice(0, 300);
        else if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
        else if (typeof v === 'boolean') out[k] = v;
    }
    return out;
}

export default async function handler(req, res) {
    const origin = req.headers.origin;
    if (origin && origenPermitido(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    if (!origenPermitido(origin)) return res.status(403).json({ error: 'Origen no permitido' });

    let body = req.body;
    if (typeof body === 'string') {
        if (body.length > MAX_BYTES) return res.status(413).json({ error: 'Demasiado grande' });
        try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'JSON inválido' }); }
    }
    if (!body || typeof body !== 'object' || JSON.stringify(body).length > MAX_BYTES) {
        return res.status(400).json({ error: 'Evento inválido' });
    }

    const event = String(body.event || '');
    if (!/^[a-z0-9_]{1,40}$/.test(event)) return res.status(400).json({ error: 'Evento inválido' });

    const eventData = {
        event,
        path: String(body.path || '').slice(0, 200),
        details: limpiarDetalles(body.details),
        timestamp: new Date().toISOString()
    };

    try {
        const redis = getRedisClient();

        // Límite por IP: evita que un script llene la base de eventos.
        const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'desconocida').split(',')[0].trim();
        const clave = `cyber_rl:${ip}:${Math.floor(Date.now() / 60000)}`;
        const usados = await redis.incr(clave);
        if (usados === 1) await redis.expire(clave, 90);
        if (usados > MAX_POR_MINUTO) return res.status(429).json({ error: 'Demasiadas solicitudes' });

        await redis.lpush('cyber_events', JSON.stringify(eventData));
        await redis.ltrim('cyber_events', 0, MAX_EVENTOS - 1);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error en track.js:', error.message);
        return res.status(500).json({ error: 'Error interno' });
    }
}
