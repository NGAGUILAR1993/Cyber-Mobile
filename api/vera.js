// Link corto al chat con Vera: cybermobile.com.ar/vera  (y /vera?o=ig, /vera?o=tarjeta, ...)
// Cuenta el clic por día y por origen en Redis y redirige a WhatsApp con el mensaje ya escrito.
// Los contadores se leen con: HGETALL cm:vera:clics:<AAAA-MM-DD>
import Redis from 'ioredis';

const WA = 'https://wa.me/5491170598505?text=' + encodeURIComponent('Hola Vera, quiero probar 7 días gratis');
const ORIGENES = ['ig', 'bio', 'comentario', 'tarjeta', 'qr', 'web', 'canal', 'historia'];

let redisClient;
function redis() {
    if (!redisClient && process.env.REDIS_URL) redisClient = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, connectTimeout: 1500 });
    return redisClient;
}

export default async function handler(req, res) {
    const o = String((req.query && req.query.o) || '').toLowerCase();
    const origen = ORIGENES.includes(o) ? o : 'directo';
    // Los bots que arman la vista previa del link no cuentan como clic.
    const bot = /bot|crawl|spider|facebookexternalhit|whatsapp|preview|slack|telegram/i.test(String(req.headers['user-agent'] || ''));
    if (!bot) {
        try {
            const r = redis();
            if (r) {
                const dia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());
                const k = `cm:vera:clics:${dia}`;
                await Promise.race([
                    r.multi().hincrby(k, origen, 1).expire(k, 120 * 86400).exec(),
                    new Promise((ok) => setTimeout(ok, 800))
                ]);
            }
        } catch (e) { console.error('vera.js:', e.message); }
    }
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.statusCode = 302;
    res.setHeader('Location', WA);
    res.end();
}
