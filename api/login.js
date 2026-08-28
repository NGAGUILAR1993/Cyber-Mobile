import Redis from 'ioredis';
import crypto from 'crypto';

let redisClient;
function getRedisClient() {
  if (!redisClient) redisClient = new Redis(process.env.REDIS_URL);
  return redisClient;
}

// Comparación en tiempo constante: evita filtrar la clave por diferencias de tiempo
function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  // Solo desde el propio sitio
  const origin = req.headers.origin || '';
  const ok = ['https://cybermobile.com.ar', 'https://www.cybermobile.com.ar'].includes(origin);
  if (origin && !ok) return res.status(403).json({ error: 'Origen no autorizado' });

  try {
    const redis = getRedisClient();
    const ip = (req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();

    // Anti-fuerza bruta: máx. 5 intentos por IP cada 15 min
    const key = `rl:login:${ip}`;
    const attempts = await redis.incr(key);
    if (attempts === 1) await redis.expire(key, 900);
    if (attempts > 5) {
      return res.status(429).json({ error: 'Demasiados intentos. Esperá 15 minutos.' });
    }

    const { user, password } = (req.body && typeof req.body === 'object') ? req.body : {};

    const okUser = safeEqual(user || '', process.env.ADMIN_USER || '');
    const okPass = safeEqual(password || '', process.env.ADMIN_PASSWORD || '');

    if (okUser && okPass) {
      await redis.del(key); // login correcto: limpia el contador
      // Devuelve el token que /api/stats espera (el propio ADMIN_PASSWORD como Bearer),
      // pero SOLO tras validar. El navegador nunca tuvo la clave escrita en el HTML.
      return res.status(200).json({ success: true, token: process.env.ADMIN_PASSWORD });
    }
    return res.status(401).json({ error: 'Credenciales inválidas' });
  } catch (e) {
    console.error('login error:', e.message);
    return res.status(500).json({ error: 'Error interno' });
  }
}
