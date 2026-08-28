import Redis from 'ioredis';
import crypto from 'crypto';

let redisClient;
function getRedisClient() {
  if (!redisClient) redisClient = new Redis(process.env.REDIS_URL);
  return redisClient;
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a)), bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// Agrega snapshots por período
function agrupar(historia, periodo) {
  const buckets = {};
  for (const h of historia) {
    const d = new Date(h.fecha);
    let key;
    if (periodo === 'semana') {
      const t = new Date(d); t.setDate(d.getDate() - d.getDay());
      key = t.toISOString().slice(0, 10);
    } else if (periodo === 'mes') {
      key = d.toISOString().slice(0, 7);
    } else {
      key = String(d.getFullYear());
    }
    buckets[key] = buckets[key] || { periodo: key, snapshots: 0, modalidades: {}, riesgo: { alto: 0, medio: 0, bajo: 0 }, canales: {} };
    const b = buckets[key];
    b.snapshots++;
    (h.top || []).forEach(t => {
      b.modalidades[t.n] = (b.modalidades[t.n] || 0) + (t.act || 0);
      if (t.riesgo && b.riesgo[t.riesgo] !== undefined) b.riesgo[t.riesgo]++;
      if (t.canal) b.canales[t.canal] = (b.canales[t.canal] || 0) + 1;
    });
  }
  // top modalidades por período (promedio de ACT)
  return Object.values(buckets).map(b => {
    const top = Object.entries(b.modalidades)
      .map(([n, s]) => ({ nombre: n, actProm: Math.round(s / b.snapshots) }))
      .sort((a, z) => z.actProm - a.actProm).slice(0, 10);
    return { periodo: b.periodo, snapshots: b.snapshots, top, riesgo: b.riesgo, canales: b.canales };
  }).sort((a, z) => a.periodo < z.periodo ? 1 : -1);
}

export default async function handler(req, res) {
  // Auth server-side (mismo token que el admin ya obtiene tras login)
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!safeEqual(token, process.env.ADMIN_PASSWORD || '')) {
    return res.status(401).json({ error: 'Acceso denegado' });
  }
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const redis = getRedisClient();

    // Rate limit por IP (evita scraping del panel aun con token)
    const ip = (req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
    const k = `rl:obsstats:${ip}`;
    const hits = await redis.incr(k);
    if (hits === 1) await redis.expire(k, 60);
    if (hits > 30) return res.status(429).json({ error: 'Demasiadas solicitudes' });

    const raw = await redis.get('observatorio:historia');
    const historia = raw ? JSON.parse(raw) : [];

    const ultimo = historia.length ? historia[historia.length - 1] : null;
    const cuarentenaRaw = await redis.get('observatorio:cuarentena');
    const cuarentena = cuarentenaRaw ? JSON.parse(cuarentenaRaw) : [];
    const logRaw = await redis.lrange('observatorio:log', 0, 49);
    const log = logRaw.map(x => { try { return JSON.parse(x); } catch { return null; } }).filter(Boolean);

    return res.status(200).json({
      ultimo,
      totalSnapshots: historia.length,
      semanal: agrupar(historia, 'semana').slice(0, 12),
      mensual: agrupar(historia, 'mes').slice(0, 12),
      anual: agrupar(historia, 'anio'),
      cuarentena: cuarentena.slice(-20),
      log
    });
  } catch (e) {
    console.error('observatorio-stats error:', e.message);
    return res.status(500).json({ error: 'Error leyendo métricas' });
  }
}
